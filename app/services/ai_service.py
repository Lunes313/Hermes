from __future__ import annotations

import json
import re
import unicodedata
import asyncio
from typing import Any, Dict, List, Optional

import httpx
from app.core.config import settings

DEPENDENCY_KEYWORDS = {
    "infraestructura": ["hueco", "calle", "via", "anden", "puente", "alcantarilla"],
    "salud": ["salud", "hospital", "medico", "cita", "ambulancia", "enfermedad"],
    "hacienda": ["impuesto", "predial", "pago", "factura", "cobro", "tributo"],
}

HIGH_URGENCY_KEYWORDS = ["urgente", "riesgo", "ninos", "peligro", "muerte"]
LOW_URGENCY_KEYWORDS = ["consulta", "informacion", "pregunta"]
VALID_DEPENDENCIES = {"infraestructura", "salud", "hacienda", "atencion_ciudadana"}
VALID_URGENCY = {"alta", "media", "baja"}


async def analyze_pqrsd_full(texto: str) -> Dict[str, object]:
    """
    Ejecuta clasificacion, sintesis y embeddings en paralelo usando asyncio.gather
    """
    # Si tenemos keys de AI, ejecutamos en paralelo
    tasks = [
        call_groq(texto),
        generate_embedding(texto)
    ]
    
    groq_result, embedding = await asyncio.gather(*tasks)
    
    if groq_result:
        normalized = _normalize_ai_result(texto, groq_result)
    else:
        # Fallback si falla Groq
        classification = fallback_classify_pqrsd(texto)
        synthesis = fallback_synthesize_pqrsd(texto)
        normalized = {
            "dependencia": classification["dependencia"],
            "score": classification["score"],
            "lead": synthesis["lead"],
            "urgencia": synthesis["urgencia"],
        }
    
    normalized["embedding"] = embedding
    return normalized


async def call_groq(texto: str) -> Optional[Dict[str, object]]:
    if not settings.GROQ_API_KEY:
        return None

    payload = {
        "model": settings.GROQ_MODEL,
        "temperature": 0,
        "max_completion_tokens": 250,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Eres un clasificador de PQRSD para la Alcaldia de Medellin. "
                    "Responde solo JSON valido, sin markdown."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Analiza esta PQRSD y retorna exactamente estas claves: "
                    "dependencia, score, lead, urgencia. "
                    "dependencia debe ser una de: infraestructura, salud, hacienda, "
                    "atencion_ciudadana. score debe ser numero entre 0 y 1. "
                    "lead debe ser un resumen corto de una frase (max 200 caracteres). "
                    "urgencia debe ser alta, media o baja.\n\n"
                    f"Texto: {texto}"
                ),
            },
        ],
    }

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.GROQ_API_URL,
                json=payload,
                headers=headers,
                timeout=settings.AI_TIMEOUT_SECONDS
            )
            response.raise_for_status()
            response_data = response.json()
            content = response_data["choices"][0]["message"]["content"]
            return _extract_json_object(content)
        except Exception:
            return None


async def generate_embedding(texto: str) -> List[float]:
    """Genera embeddings usando HuggingFace con fallback de ceros"""
    if not settings.HUGGINGFACE_API_KEY:
        return [0.0] * 384

    url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.HUGGINGFACE_EMBEDDING_MODEL}"
    payload = {"inputs": texto, "options": {"wait_for_model": True}}
    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=settings.AI_TIMEOUT_SECONDS)
            response.raise_for_status()
            response_data = response.json()
            return _flatten_embedding(response_data)
        except Exception:
            return [0.0] * 384


def fallback_classify_pqrsd(texto: str) -> Dict[str, object]:
    normalized_text = _normalize(texto)
    scores = {
        dependencia: sum(1 for keyword in keywords if keyword in normalized_text)
        for dependencia, keywords in DEPENDENCY_KEYWORDS.items()
    }

    dependency, matches = max(scores.items(), key=lambda item: item[1])
    if matches == 0:
        return {"dependencia": "atencion_ciudadana", "score": 0.5}

    total_keywords = len(DEPENDENCY_KEYWORDS[dependency])
    score = min(0.99, 0.6 + (matches / total_keywords) * 0.4)
    return {"dependencia": dependency, "score": round(score, 2)}


def fallback_synthesize_pqrsd(texto: str) -> Dict[str, str]:
    lead = _first_sentence(texto)
    normalized_text = _normalize(texto)

    if any(keyword in normalized_text for keyword in HIGH_URGENCY_KEYWORDS):
        urgency = "alta"
    elif any(keyword in normalized_text for keyword in LOW_URGENCY_KEYWORDS):
        urgency = "baja"
    else:
        urgency = "media"

    return {"lead": lead, "urgencia": urgency}


def _normalize_ai_result(texto: str, data: Dict[str, object]) -> Dict[str, object]:
    local_classification = fallback_classify_pqrsd(texto)
    local_synthesis = fallback_synthesize_pqrsd(texto)

    dependencia = str(data.get("dependencia", "")).strip().lower()
    if dependencia not in VALID_DEPENDENCIES:
        dependencia = str(local_classification["dependencia"])

    try:
        score = float(data.get("score", local_classification["score"]))
    except (TypeError, ValueError):
        score = float(local_classification["score"])
    score = round(max(0.0, min(1.0, score)), 2)

    lead = str(data.get("lead") or local_synthesis["lead"]).strip()
    if not lead:
        lead = str(local_synthesis["lead"])
    lead = lead[:240]

    urgencia = str(data.get("urgencia", "")).strip().lower()
    if urgencia not in VALID_URGENCY:
        urgencia = str(local_synthesis["urgencia"])

    return {
        "dependencia": dependencia,
        "score": score,
        "lead": lead,
        "urgencia": urgencia,
    }


def _extract_json_object(content: str) -> Optional[Dict[str, object]]:
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if not match:
            return None
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError:
            return None

    return data if isinstance(data, dict) else None


def _flatten_embedding(data: Any) -> List[float]:
    if isinstance(data, list) and data and all(isinstance(item, (int, float)) for item in data):
        embedding = [float(item) for item in data]
        if len(embedding) > 384:
            embedding = embedding[:384]
        return embedding

    if isinstance(data, list) and data and isinstance(data[0], list):
        first_embedding = data[0]
        if first_embedding and isinstance(first_embedding[0], list):
            first_embedding = first_embedding[0]
        if all(isinstance(item, (int, float)) for item in first_embedding):
            embedding = [float(item) for item in first_embedding]
            if len(embedding) > 384:
                embedding = embedding[:384]
            return embedding

    return [0.0] * 384


def _first_sentence(texto: str) -> str:
    clean_text = " ".join(texto.strip().split())
    if not clean_text:
        return ""

    sentences = re.split(r"(?<=[.!?])\s+", clean_text, maxsplit=1)
    return sentences[0][:240]


def _normalize(texto: str) -> str:
    normalized = unicodedata.normalize("NFKD", texto.lower().strip())
    return "".join(character for character in normalized if not unicodedata.combining(character))
