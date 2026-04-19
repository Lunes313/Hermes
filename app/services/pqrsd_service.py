from __future__ import annotations

import random
import re
import unicodedata
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, status

from app.core.database import get_supabase
from app.schemas.pqrsd import AprobarRequest, ChatInput, PQRSDCreate
from app.services.ai_service import (
    analyze_pqrsd_full,
    extract_pqrsd_data,
    generate_chat_response,
    generate_embedding,
)
from app.services.date_service import add_business_days


PROMPTS_POR_TIPO = {
    "Queja": "Reconoce la inconformidad del ciudadano y explica que la entidad competente revisara el caso.",
    "Peticion": "Confirma recepcion y explica que la solicitud sera revisada dentro de los terminos legales.",
    "Reclamo": "Valida la experiencia del ciudadano sin asumir culpa institucional y explica el proceso de revision.",
    "Sugerencia": "Agradece el aporte para mejorar la gestion publica.",
    "Denuncia": "Usa tono formal y confirma que los hechos seran verificados por la dependencia competente.",
}


async def obtener_contexto_similares(texto_usuario: str):
    """Busqueda vectorial de casos similares resueltos (RAG)."""
    supabase = get_supabase()
    embedding = await generate_embedding(texto_usuario)

    try:
        rpc_result = supabase.rpc(
            "buscar_pqrsd_similares",
            {
                "query_embedding": embedding,
                "match_threshold": 0.7,
                "match_count": 2,
            },
        ).execute()

        casos = rpc_result.data
        if not casos:
            return "No hay precedentes registrados para casos similares."

        contexto = "\nPRECEDENTES HISTORICOS:\n"
        for caso in casos:
            contexto += f"- Caso similar: {caso.get('asunto')}. Solucion: {caso.get('respuesta_generada')}\n"
        return contexto
    except Exception as e:
        print(f"RAG Error: {e}")
        return ""


async def procesar_mensaje_chatbot(payload: ChatInput):
    """
    Procesa el historial completo del chat.
    El frontend envia role=user/assistant y Groq recibe el contexto completo.
    """
    history = [{"role": msg.role, "content": msg.content} for msg in payload.history]
    if not history:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El historial de chat no puede estar vacio.",
        )

    extraction = await extract_pqrsd_data(history)
    analisis = {
        "nombre": extraction.get("nombre", "Anonimo"),
        "dependencias": extraction.get("dependencias", ["Atencion Ciudadana"]),
        "tipo_pqrs": extraction.get("tipo", "Peticion"),
        "lugar": extraction.get("territorio", ""),
        "asunto": extraction.get("asunto", ""),
        "hechos": extraction.get("hechos", ""),
        "territorio": extraction.get("territorio", ""),
    }

    last_user_message = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")
    if _is_confirmation(last_user_message) and _has_required_data(extraction):
        texto_final = _history_to_text(history)
        pqrsd_final = await create_pqrsd(
            PQRSDCreate(
                asunto=extraction.get("asunto") or "Solicitud desde Chat",
                canal="Chatbot IA",
                remitente=extraction.get("nombre") or "Anonimo",
                texto=texto_final,
                nombre=extraction.get("nombre") or "Anonimo",
                email=extraction.get("email") or None,
                tipo=extraction.get("tipo") or "Peticion",
                territorio=extraction.get("territorio") or None,
            ),
            ai_result=analisis,
        )
        return {
            "respuesta": (
                f"Tu solicitud fue radicada correctamente con el codigo {pqrsd_final['radicado']}. "
                "Conserva este numero para hacer seguimiento."
            ),
            "analisis": analisis,
            "radicado": pqrsd_final["radicado"],
        }

    respuesta_ia = await generate_chat_response(history)
    if _has_required_data(extraction) and "radicar" not in respuesta_ia.lower():
        deps = ", ".join(analisis["dependencias"])
        tipo = analisis["tipo_pqrs"]
        lugar = analisis["lugar"] or "Medellin"
        tono = PROMPTS_POR_TIPO.get(tipo, PROMPTS_POR_TIPO["Peticion"])
        respuesta_ia = (
            f"Tengo la informacion principal: {analisis['asunto']} en {lugar}. "
            f"{tono} La dependencia sugerida es {deps}. "
            "¿Deseas radicar esta solicitud oficialmente ahora?"
        )

    return {
        "respuesta": respuesta_ia,
        "analisis": analisis,
    }


async def analyze_only(texto: str) -> Dict[str, Any]:
    return await analyze_pqrsd_full(texto)


async def create_pqrsd(payload: PQRSDCreate, ai_result: Optional[Dict[str, Any]] = None):
    supabase = get_supabase()
    now = datetime.utcnow()
    ai_result = ai_result or await analyze_pqrsd_full(payload.texto)

    tipo = _normalize_tipo(payload.tipo or ai_result.get("tipo_pqrs") or ai_result.get("tipo") or "Peticion")
    territorio_nombre = payload.territorio or ai_result.get("territorio") or ai_result.get("lugar") or _extract_territorio(payload.texto)
    territorio_id = await get_territorio_id(territorio_nombre)
    dependencia = _first_dependency(ai_result.get("dependencias"))
    radicado = await _generate_unique_radicado(now)
    vencimiento = add_business_days(now.date(), 15)

    data = {
        "asunto": payload.asunto,
        "canal": payload.canal,
        "remitente": payload.remitente,
        "texto": payload.texto,
        "texto_original": payload.texto,
        "radicado": radicado,
        "estado": "recibida",
        "dependencia_asignada": dependencia,
        "tipo": tipo.lower(),
        "embedding": ai_result.get("embedding"),
        "fecha_creacion": now.isoformat(),
        "fecha_vencimiento": vencimiento.isoformat(),
    }

    if payload.nombre:
        data["nombre_identificado"] = payload.nombre
    if payload.email:
        data["email"] = payload.email
    if territorio_id is not None:
        data["territorio_id"] = territorio_id

    try:
        result = supabase.table("pqrsd").insert(data).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No fue posible radicar la PQRSD en Supabase: {e}",
        ) from e

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase no retorno la PQRSD creada.",
        )

    pqrsd = result.data[0]
    pqrsd["radicado"] = pqrsd.get("radicado") or radicado
    if territorio_nombre and not pqrsd.get("lugar"):
        pqrsd["lugar"] = territorio_nombre

    await add_trazabilidad(pqrsd["id"], "Radicacion", "sistema", f"Radicado {pqrsd['radicado']}")
    return pqrsd


async def get_territorio_id(nombre: Optional[str]) -> Optional[int]:
    if not nombre:
        return None

    supabase = get_supabase()
    clean_name = _clean_territorio(nombre)
    if not clean_name:
        return None

    try:
        exact = supabase.table("territorios").select("id,nombre").eq("nombre", clean_name).limit(1).execute()
        if exact.data:
            return exact.data[0]["id"]

        fuzzy = supabase.table("territorios").select("id,nombre").ilike("nombre", f"%{clean_name}%").limit(1).execute()
        if fuzzy.data:
            return fuzzy.data[0]["id"]

        all_rows = supabase.table("territorios").select("id,nombre").execute()
        target = _normalize_text(clean_name)
        for row in all_rows.data or []:
            row_name = row.get("nombre", "")
            normalized = _normalize_text(row_name)
            if target == normalized or target in normalized or normalized in target:
                return row["id"]
    except Exception as e:
        print(f"Territorio lookup error: {e}")

    return None


async def get_pqrsd(pqrsd_id: int):
    supabase = get_supabase()
    result = supabase.table("pqrsd").select("*, territorios(nombre)").eq("id", pqrsd_id).execute()
    if not result.data:
        return None
    item = result.data[0]
    _attach_lugar(item)
    return item


async def list_pqrsd():
    supabase = get_supabase()
    result = supabase.table("pqrsd").select("*, territorios(nombre)").order("fecha_creacion", desc=True).execute()
    data = result.data or []
    for item in data:
        _attach_lugar(item)
    return data


async def get_trazabilidad(pqrsd_id: int):
    supabase = get_supabase()
    result = supabase.table("trazabilidad").select("*").eq("pqrsd_id", pqrsd_id).order("fecha").execute()
    return result.data


async def aprobar_pqrsd(payload: AprobarRequest):
    supabase = get_supabase()
    nuevo_estado = "aprobada_juridico" if payload.aprobado else "devuelta"
    result = supabase.table("pqrsd").update({"estado": nuevo_estado}).eq("id", payload.pqrsd_id).execute()
    if not result.data:
        return None
    pqrsd = result.data[0]
    await add_trazabilidad(pqrsd["id"], "Revision Juridica", payload.usuario, f"Estado: {nuevo_estado}")
    return pqrsd


async def add_trazabilidad(pqrsd_id: int, accion: str, usuario: str, observaciones: str = None):
    supabase = get_supabase()
    data = {
        "pqrsd_id": pqrsd_id,
        "accion": accion,
        "detalle": {"usuario_str": usuario, "observaciones": observaciones},
        "created_at": datetime.utcnow().isoformat(),
    }
    result = supabase.table("trazabilidad").insert(data).execute()
    return result.data[0] if result.data else None


async def _generate_unique_radicado(now: datetime) -> str:
    supabase = get_supabase()
    for _ in range(8):
        radicado = f"HER-{now.strftime('%Y')}-{random.randint(1000, 9999)}"
        try:
            existing = supabase.table("pqrsd").select("id").eq("radicado", radicado).limit(1).execute()
            if not existing.data:
                return radicado
        except Exception:
            return radicado
    return f"HER-{now.strftime('%Y')}-{random.randint(10000, 99999)}"


def _history_to_text(history: List[Dict[str, str]]) -> str:
    return "\n".join(f"{m['role']}: {m['content']}" for m in history)


def _is_confirmation(texto: str) -> bool:
    normalized = _normalize_text(texto)
    keywords = ["si", "hagale", "proceda", "radicar", "claro", "confirmo", "adelante", "de acuerdo"]
    return any(keyword in normalized for keyword in keywords)


def _has_required_data(extraction: Dict[str, Any]) -> bool:
    return bool(extraction.get("asunto") and extraction.get("hechos") and extraction.get("territorio"))


def _first_dependency(value: Any) -> str:
    if isinstance(value, list) and value:
        return str(value[0])
    if isinstance(value, str) and value:
        return value
    return "Atencion Ciudadana"


def _normalize_tipo(tipo: Any) -> str:
    value = str(tipo or "Peticion").strip().title()
    mapping = {
        "Petición": "Peticion",
        "Peticìon": "Peticion",
        "Peticion": "Peticion",
        "Queja": "Queja",
        "Reclamo": "Reclamo",
        "Solicitud": "Solicitud",
        "Denuncia": "Denuncia",
        "Sugerencia": "Sugerencia",
    }
    return mapping.get(value, "Peticion")


def _extract_territorio(texto: str) -> Optional[str]:
    match = re.search(r"Territorio:\s*(.+)", texto, flags=re.IGNORECASE)
    if not match:
        return None
    return match.group(1).splitlines()[0].strip()


def _clean_territorio(nombre: str) -> str:
    return re.sub(r"\s+", " ", nombre).strip()


def _normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.lower())
    without_accents = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9\s-]", "", without_accents).strip()


def _attach_lugar(item: Dict[str, Any]) -> None:
    territorios = item.get("territorios")
    if isinstance(territorios, dict) and territorios.get("nombre"):
        item["lugar"] = territorios["nombre"]
        item["territorio"] = territorios["nombre"]
    elif item.get("territorio"):
        item["lugar"] = item["territorio"]
    elif item.get("texto"):
        item["lugar"] = _extract_territorio(item["texto"]) or "Desconocido"
    else:
        item["lugar"] = "Desconocido"
