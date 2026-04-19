from datetime import datetime
import random
from typing import List, Optional

from app.core.database import get_supabase
from app.schemas.pqrsd import AprobarRequest, PQRSDCreate
from app.services.ai_service import analyze_pqrsd_full
from app.services.date_service import add_business_days


async def create_pqrsd(payload: PQRSDCreate):
    supabase = get_supabase()
    now = datetime.utcnow()
    
    # Análisis de IA (paralelo)
    ai_result = await analyze_pqrsd_full(payload.texto)
    
    # Generar Radicado YYYYMMDD-XXXX
    rand_suffix = random.randint(1000, 9999)
    radicado = f"{now.strftime('%Y%m%d')}-{rand_suffix}"
    
    vencimiento = add_business_days(now.date(), 15)
    
    data = {
        "asunto": payload.asunto,
        "canal": payload.canal,
        "remitente": payload.remitente,
        "texto": payload.texto,
        "radicado": radicado,
        "estado": "radicada",
        "dependencia_asignada": ai_result["dependencia"],
        "score_clasificacion": ai_result["score"],
        "lead": ai_result["lead"],
        "urgencia": ai_result["urgencia"],
        "embedding": ai_result["embedding"],
        "fecha_creacion": now.isoformat(),
        "fecha_vencimiento": vencimiento.isoformat(),
    }
    
    # Insertar en Supabase
    result = supabase.table("pqrsd").insert(data).execute()
    pqrsd = result.data[0]
    
    # Trazabilidad inicial
    await add_trazabilidad(
        pqrsd_id=pqrsd["id"],
        evento="PQRSD radicada",
        usuario="sistema",
        observaciones=f"Radicado generado: {radicado}. Dependencia: {pqrsd['dependencia_asignada']}."
    )
    
    return pqrsd


async def get_pqrsd(pqrsd_id: int):
    supabase = get_supabase()
    result = supabase.table("pqrsd").select("*").eq("id", pqrsd_id).execute()
    return result.data[0] if result.data else None


async def list_pqrsd():
    supabase = get_supabase()
    result = supabase.table("pqrsd").select("*").order("fecha_creacion", desc=True).execute()
    return result.data


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
    
    await add_trazabilidad(
        pqrsd_id=pqrsd["id"],
        evento="Revision Juridica",
        usuario=payload.usuario,
        observaciones=f"Estado cambiado a: {nuevo_estado}. Obs: {payload.observaciones}"
    )
    
    return pqrsd


async def add_trazabilidad(pqrsd_id: int, evento: str, usuario: str, observaciones: str = None):
    supabase = get_supabase()
    data = {
        "pqrsd_id": pqrsd_id,
        "evento": evento,
        "usuario": usuario,
        "observaciones": observaciones,
        "fecha": datetime.utcnow().isoformat()
    }
    result = supabase.table("trazabilidad").insert(data).execute()
    return result.data[0] if result.data else None
