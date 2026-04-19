from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from app.models.pqrsd import PQRSD
from app.models.trazabilidad import Trazabilidad
from app.schemas.pqrsd import AprobarRequest, PQRSDCreate
from app.services.ai_service import analyze_pqrsd
from app.services.date_service import add_business_days


def create_pqrsd(payload: PQRSDCreate, session: Session) -> PQRSD:
    now = datetime.utcnow()
    ai_result = analyze_pqrsd(payload.texto)

    pqrsd = PQRSD(
        asunto=payload.asunto,
        canal=payload.canal,
        remitente=payload.remitente,
        texto=payload.texto,
        estado="radicada",
        dependencia_asignada=str(ai_result["dependencia"]),
        score_clasificacion=float(ai_result["score"]),
        lead=str(ai_result["lead"]),
        urgencia=str(ai_result["urgencia"]),
        fecha_creacion=now,
        fecha_vencimiento=add_business_days(now.date(), 15),
    )

    session.add(pqrsd)
    session.commit()
    session.refresh(pqrsd)

    add_trazabilidad(
        pqrsd_id=pqrsd.id,
        evento="PQRSD radicada",
        usuario="sistema",
        observaciones=(
            "Creacion inicial de la solicitud. "
            f"Dependencia asignada: {pqrsd.dependencia_asignada}. "
            f"Urgencia: {pqrsd.urgencia}."
        ),
        session=session,
    )
    return pqrsd


def get_pqrsd(pqrsd_id: int, session: Session) -> Optional[PQRSD]:
    return session.get(PQRSD, pqrsd_id)


def get_trazabilidad(pqrsd_id: int, session: Session) -> List[Trazabilidad]:
    statement = (
        select(Trazabilidad)
        .where(Trazabilidad.pqrsd_id == pqrsd_id)
        .order_by(Trazabilidad.fecha)
    )
    return list(session.exec(statement).all())


def aprobar_pqrsd(payload: AprobarRequest, session: Session) -> Optional[PQRSD]:
    pqrsd = session.get(PQRSD, payload.pqrsd_id)
    if pqrsd is None:
        return None

    pqrsd.estado = "aprobada_juridico" if payload.aprobado else "devuelta"
    session.add(pqrsd)
    session.commit()
    session.refresh(pqrsd)

    add_trazabilidad(
        pqrsd_id=pqrsd.id,
        evento="Aprobacion juridica" if payload.aprobado else "Devolucion juridica",
        usuario=payload.usuario,
        observaciones=payload.observaciones,
        session=session,
    )
    return pqrsd


def add_trazabilidad(
    pqrsd_id: int,
    evento: str,
    usuario: str,
    observaciones: Optional[str],
    session: Session,
) -> Trazabilidad:
    trazabilidad = Trazabilidad(
        pqrsd_id=pqrsd_id,
        evento=evento,
        usuario=usuario,
        observaciones=observaciones,
    )
    session.add(trazabilidad)
    session.commit()
    session.refresh(trazabilidad)
    return trazabilidad
