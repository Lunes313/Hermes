from __future__ import annotations

import asyncio
import json
import re
from typing import Any, Dict, List, Literal, Optional, Sequence, TypedDict

import httpx
from app.core.config import settings


ChatRole = Literal["user", "assistant"]


class ChatMessage(TypedDict):
    role: ChatRole
    content: str


SYSTEM_PROMPT = """Eres un asistente de clasificacion de PQRSD de la Alcaldia de Medellin.

Debes analizar solicitudes ciudadanas y extraer informacion accionable en JSON estricto:
- nombre: nombre del ciudadano si lo menciona, o "Anonimo"
- dependencias: lista de dependencias competentes
- tipo_pqrs: uno de ["Peticion", "Queja", "Reclamo", "Solicitud", "Denuncia", "Sugerencia"]
- lugar: comuna, corregimiento, barrio o territorio mencionado, o ""
- asunto: resumen corto del problema, maximo 12 palabras
- hechos: resumen claro de los hechos narrados
- territorio: comuna o corregimiento de Medellin si se puede inferir, o ""

Responde unicamente con JSON valido. No incluyas Markdown ni explicaciones."""

EXTRACTION_PROMPT = """Extrae una PQRSD lista para radicar desde la conversacion.

Reglas obligatorias:
1. Responde exclusivamente con un objeto JSON valido.
2. No uses Markdown, comentarios, texto antes ni despues del JSON.
3. No inventes datos personales. Si falta el nombre usa "Anonimo".
4. El campo tipo debe ser exactamente uno de:
   ["Peticion", "Queja", "Reclamo", "Solicitud", "Denuncia", "Sugerencia"].
5. El campo territorio debe ser el nombre de una comuna o corregimiento de Medellin si aparece o se puede inferir. Si no hay territorio, usa "".
6. El campo asunto debe ser breve y ciudadano, maximo 120 caracteres.
7. El campo hechos debe contener los hechos suficientes para radicar.

Estructura exacta:
{
  "nombre": "string",
  "email": "string",
  "asunto": "string",
  "hechos": "string",
  "tipo": "Peticion|Queja|Reclamo|Solicitud|Denuncia|Sugerencia",
  "territorio": "string",
  "dependencias": ["string"]
}"""

CHAT_SYSTEM_PROMPT = """Eres Hermes, asistente virtual de PQRSD de la Alcaldia de Medellin.

Objetivo:
- Guiar al ciudadano para completar una PQRSD clara.
- Recordar toda la conversacion recibida en el historial.
- No repetir respuestas anteriores ni volver a pedir datos que ya fueron entregados.
- Si faltan hechos, territorio, tipo de solicitud o asunto, pide solo el dato faltante.
- Cuando ya haya informacion suficiente, resume el caso y pregunta si desea radicar oficialmente.
- Mantente empatico, concreto y formal.

No prometas resultados. Explica que la entidad revisara y respondera por los canales oficiales."""

DEFAULT_ANALYSIS: Dict[str, Any] = {
    "nombre": "Anonimo",
    "dependencias": ["Atencion Ciudadana"],
    "tipo_pqrs": "Peticion",
    "lugar": "",
    "asunto": "",
    "hechos": "",
    "territorio": "",
}


async def analyze_pqrsd_full(texto: str) -> Dict[str, object]:
    """
    Ejecuta extraccion estructurada y embeddings en paralelo.
    """
    tasks = [
        extract_pqrsd_data([{"role": "user", "content": texto}]),
        generate_embedding(texto),
    ]

    extraction, embedding = await asyncio.gather(*tasks)
    result = _analysis_from_extraction(extraction)
    result["embedding"] = embedding
    return result


async def generate_chat_response(history: Sequence[ChatMessage]) -> str:
    messages = _sanitize_history(history)
    if not settings.GROQ_API_KEY:
        return _fallback_chat_response(messages)

    groq_messages: List[Dict[str, str]] = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
        *messages,
    ]

    content = await _groq_chat_completion(groq_messages, temperature=0.35, max_tokens=420)
    return content or _fallback_chat_response(messages)


async def extract_pqrsd_data(history: Sequence[ChatMessage]) -> Dict[str, Any]:
    messages = _sanitize_history(history)
    conversation = _history_to_text(messages)

    if settings.GROQ_API_KEY:
        groq_messages: List[Dict[str, str]] = [
            {"role": "system", "content": EXTRACTION_PROMPT},
            {"role": "user", "content": conversation},
        ]
        content = await _groq_chat_completion(
            groq_messages,
            temperature=0.0,
            max_tokens=700,
            response_format={"type": "json_object"},
        )
        parsed = _extract_json_object(content)
        if parsed:
            return _normalize_extraction(parsed)

    hf_result = await classify_with_huggingface(conversation)
    if hf_result:
        return _normalize_extraction(hf_result)

    return dict(DEFAULT_ANALYSIS)


async def classify_with_huggingface(texto: str) -> Optional[Dict[str, Any]]:
    if not settings.HUGGINGFACE_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
    }
    prompt = f"<|system|>\n{SYSTEM_PROMPT}</s>\n<|user|>\n{texto}</s>\n<|assistant|>\n"
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 500,
            "return_full_text": False,
        },
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.HUGGINGFACE_CLASSIFY_URL,
                json=payload,
                headers=headers,
                timeout=settings.AI_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()

            content = ""
            if isinstance(data, list) and len(data) > 0:
                content = data[0].get("generated_text", "")
            elif isinstance(data, dict):
                content = data.get("generated_text", "")

            return _extract_json_object(content)
        except Exception as e:
            print(f"Error AI HuggingFace: {e}")
            return None


async def generate_embedding(texto: str) -> List[float]:
    if not settings.HUGGINGFACE_API_KEY:
        return [0.0] * 384

    url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.HUGGINGFACE_EMBEDDING_MODEL}"
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url,
                json={"inputs": texto},
                headers=headers,
                timeout=settings.AI_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            return _flatten_embedding(response.json())
        except Exception:
            return [0.0] * 384


async def _groq_chat_completion(
    messages: Sequence[Dict[str, str]],
    temperature: float,
    max_tokens: int,
    response_format: Optional[Dict[str, str]] = None,
) -> str:
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": settings.GROQ_MODEL,
        "messages": list(messages),
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.GROQ_API_URL,
                json=payload,
                headers=headers,
                timeout=settings.AI_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"Error AI Groq: {e}")
            return ""


def _sanitize_history(history: Sequence[ChatMessage]) -> List[Dict[str, str]]:
    sanitized: List[Dict[str, str]] = []
    for message in history:
        role = message.get("role")
        content = str(message.get("content", "")).strip()
        if role in ("user", "assistant") and content:
            sanitized.append({"role": role, "content": content[:4000]})
    return sanitized[-20:]


def _history_to_text(history: Sequence[Dict[str, str]]) -> str:
    return "\n".join(f"{m['role']}: {m['content']}" for m in history)


def _fallback_chat_response(history: Sequence[Dict[str, str]]) -> str:
    text = _history_to_text(history)
    extraction = _normalize_extraction(_extract_json_object(text) or {})
    missing = []
    if not extraction.get("asunto"):
        missing.append("el asunto principal")
    if not extraction.get("territorio") and not extraction.get("lugar"):
        missing.append("la comuna, corregimiento o barrio")
    if not extraction.get("hechos"):
        missing.append("los hechos")

    if missing:
        return f"Para radicar correctamente tu solicitud necesito que me indiques {', '.join(missing)}."
    return "Ya tengo informacion suficiente para preparar la PQRSD. ¿Deseas radicar esta solicitud oficialmente?"


def _analysis_from_extraction(extraction: Dict[str, Any]) -> Dict[str, Any]:
    normalized = _normalize_extraction(extraction)
    return {
        "nombre": normalized.get("nombre", "Anonimo"),
        "dependencias": normalized.get("dependencias", ["Atencion Ciudadana"]),
        "tipo_pqrs": normalized.get("tipo", "Peticion"),
        "lugar": normalized.get("territorio", "") or normalized.get("lugar", ""),
        "asunto": normalized.get("asunto", ""),
        "hechos": normalized.get("hechos", ""),
        "territorio": normalized.get("territorio", "") or normalized.get("lugar", ""),
        "tipo_pqrs": normalized.get("tipo", "Peticion"),
    }


def _normalize_extraction(data: Dict[str, Any]) -> Dict[str, Any]:
    tipo = str(data.get("tipo") or data.get("tipo_pqrs") or "Peticion").strip().title()
    tipo_map = {
        "Petición": "Peticion",
        "Peticìon": "Peticion",
        "Peticion": "Peticion",
        "Queja": "Queja",
        "Reclamo": "Reclamo",
        "Solicitud": "Solicitud",
        "Denuncia": "Denuncia",
        "Sugerencia": "Sugerencia",
    }
    dependencias = data.get("dependencias") or ["Atencion Ciudadana"]
    if isinstance(dependencias, str):
        dependencias = [dependencias]
    if not isinstance(dependencias, list) or not dependencias:
        dependencias = ["Atencion Ciudadana"]

    return {
        "nombre": str(data.get("nombre") or "Anonimo").strip() or "Anonimo",
        "email": str(data.get("email") or "").strip(),
        "asunto": str(data.get("asunto") or "").strip(),
        "hechos": str(data.get("hechos") or data.get("texto") or "").strip(),
        "tipo": tipo_map.get(tipo, "Peticion"),
        "tipo_pqrs": tipo_map.get(tipo, "Peticion"),
        "territorio": str(data.get("territorio") or data.get("lugar") or "").strip(),
        "lugar": str(data.get("lugar") or data.get("territorio") or "").strip(),
        "dependencias": [str(dep).strip() for dep in dependencias if str(dep).strip()],
    }


def _extract_json_object(content: str) -> Optional[Dict[str, object]]:
    if not content:
        return None
    try:
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
