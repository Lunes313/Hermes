from __future__ import annotations

import json
import re
import asyncio
from typing import Any, Dict, List, Optional

import httpx
from app.core.config import settings

SYSTEM_PROMPT = """Eres un asistente de clasificación de PQRSDs de la Alcaldía de Medellín.

Tu tarea es analizar el texto de una solicitud ciudadana y extraer la siguiente información en formato JSON:
- nombre: nombre del ciudadano si lo menciona, o "Anónimo" si no aparece
- dependencias: lista de dependencias de la Alcaldía competentes para atender la solicitud
- tipo_pqrs: uno de [Petición, Queja, Reclamo, Solicitud, Denuncia, Sugerencia]
- lugar: lugar mencionado en la solicitud, o "" si no se menciona
- asunto: resumen corto del problema (máx 10 palabras), o "" si no se explica

Responde ÚNICAMENTE con el JSON, sin texto adicional."""

async def analyze_pqrsd_full(texto: str) -> Dict[str, object]:
    """
    Ejecuta clasificación y embeddings en paralelo.
    """
    tasks = [
        classify_with_huggingface(texto),
        generate_embedding(texto)
    ]
    
    classification, embedding = await asyncio.gather(*tasks)
    
    result = classification or {
        "nombre": "Anónimo",
        "dependencias": ["Atención Ciudadana"],
        "tipo_pqrs": "Petición",
        "lugar": "",
        "asunto": ""
    }
    
    result["embedding"] = embedding
    return result

async def classify_with_huggingface(texto: str) -> Optional[Dict[str, Any]]:
    if not settings.HUGGINGFACE_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
    }
    
    # Prompt optimizado para modelos de texto-a-texto
    prompt = f"<|system|>\n{SYSTEM_PROMPT}</s>\n<|user|>\n{texto}</s>\n<|assistant|>\n"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 500,
            "return_full_text": False,
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.HUGGINGFACE_CLASSIFY_URL,
                json=payload,
                headers=headers,
                timeout=settings.AI_TIMEOUT_SECONDS
            )
            response.raise_for_status()
            data = response.json()
            
            content = ""
            if isinstance(data, list) and len(data) > 0:
                content = data[0].get("generated_text", "")
            elif isinstance(data, dict):
                content = data.get("generated_text", "")

            # Limpiar y parsear JSON
            return _extract_json_object(content)
        except Exception as e:
            print(f"Error AI: {e}")
            return None

async def generate_embedding(texto: str) -> List[float]:
    if not settings.HUGGINGFACE_API_KEY:
        return [0.0] * 384

    url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.HUGGINGFACE_EMBEDDING_MODEL}"
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json={"inputs": texto}, headers=headers)
            response_data = response.json()
            return _flatten_embedding(response_data)
        except Exception:
            return [0.0] * 384

def _extract_json_object(content: str) -> Optional[Dict[str, object]]:
    if not content: return None
    try:
        # Buscar el bloque JSON en el texto generado
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(content.strip())
    except Exception:
        return None

def _flatten_embedding(data: Any) -> List[float]:
    try:
        if isinstance(data, list):
            if len(data) > 0 and isinstance(data[0], list):
                data = data[0]
            return [float(x) for x in data[:384]]
    except Exception:
        pass
    return [0.0] * 384
