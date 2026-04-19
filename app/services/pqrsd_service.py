from datetime import datetime
import random
from typing import Optional

from app.core.supabase_client import get_supabase_client
from app.schemas.pqrsd import AprobarRequest, PQRSDCreate
from app.services.date_service import add_business_days
from app.services.classifier import clasificar_pqrsd


async def create_pqrsd(payload: PQRSDCreate):
    supabase = get_supabase_client()
    now = datetime.utcnow()

    rand_suffix = random.randint(1000, 9999)
    radicado = f"{now.strftime('%Y%m%d')}-{rand_suffix}"
    vencimiento = add_business_days(now.date(), 15)

    # Clasificar el PQRSD
    clasificacion = clasificar_pqrsd(payload.texto)

    data = {
        "asunto": payload.asunto,
        "canal": payload.canal,
        "remitente": payload.remitente,
        "texto": payload.texto,
        "radicado": radicado,
        "estado": "radicada",
        "dependencia_asignada": payload.dependencia_asignada,
        "secretaria_principal": clasificacion["principal"],
        "revision_manual": clasificacion["revision_manual"],
        "fecha_creacion": now.isoformat(),
        "fecha_vencimiento": vencimiento.isoformat(),
    }

    result = supabase.table("pqrsd").insert(data).execute()
    pqrsd = result.data[0] if result.data else None
    if pqrsd is None:
        return None

    await add_trazabilidad(
        pqrsd_id=pqrsd["id"],
        evento="PQRSD radicada",
        usuario="sistema",
        observaciones=f"Radicado generado: {radicado}.",
    )

    return pqrsd


async def get_pqrsd(pqrsd_id: int):
    supabase = get_supabase_client()
    result = supabase.table("pqrsd").select("*").eq("id", pqrsd_id).execute()
    return result.data[0] if result.data else None


async def list_pqrsd():
    supabase = get_supabase_client()
    result = supabase.table("pqrsd").select("*").order("fecha_creacion", desc=True).execute()
    return result.data


async def get_trazabilidad(pqrsd_id: int):
    supabase = get_supabase_client()
    result = supabase.table("trazabilidad").select("*").eq("pqrsd_id", pqrsd_id).order("fecha").execute()
    return result.data


async def aprobar_pqrsd(payload: AprobarRequest):
    supabase = get_supabase_client()
    nuevo_estado = "aprobada_juridico" if payload.aprobado else "devuelta"

    result = supabase.table("pqrsd").update({"estado": nuevo_estado}).eq("id", payload.pqrsd_id).execute()
    if not result.data:
        return None

    pqrsd = result.data[0]

    await add_trazabilidad(
        pqrsd_id=pqrsd["id"],
        evento="Revision Juridica",
        usuario=payload.usuario,
        observaciones=f"Estado cambiado a: {nuevo_estado}. Obs: {payload.observaciones}",
    )

    return pqrsd


async def add_trazabilidad(pqrsd_id: int, evento: str, usuario: str, observaciones: Optional[str] = None):
    supabase = get_supabase_client()
    data = {
        "pqrsd_id": pqrsd_id,
        "evento": evento,
        "usuario": usuario,
        "observaciones": observaciones,
        "fecha": datetime.utcnow().isoformat(),
    }
    result = supabase.table("trazabilidad").insert(data).execute()
    return result.data[0] if result.data else None
