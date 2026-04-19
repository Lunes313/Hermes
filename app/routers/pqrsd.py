from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.pqrsd import AprobarRequest, AprobarResponse, PQRSDCreate, PQRSDRead
from app.schemas.trazabilidad import TrazabilidadRead
from app.services.pqrsd_service import (
    aprobar_pqrsd,
    create_pqrsd,
    get_pqrsd,
    get_trazabilidad,
)


router = APIRouter()


@router.post("/pqrsd", response_model=PQRSDRead, status_code=status.HTTP_201_CREATED)
def create_pqrsd_endpoint(
    payload: PQRSDCreate,
    session: Session = Depends(get_session),
) -> PQRSDRead:
    return create_pqrsd(payload, session)


@router.get("/pqrsd/{pqrsd_id}", response_model=PQRSDRead)
def get_pqrsd_endpoint(
    pqrsd_id: int,
    session: Session = Depends(get_session),
) -> PQRSDRead:
    pqrsd = get_pqrsd(pqrsd_id, session)
    if pqrsd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRSD not found")
    return pqrsd


@router.get("/trazabilidad/{pqrsd_id}", response_model=List[TrazabilidadRead])
def get_trazabilidad_endpoint(
    pqrsd_id: int,
    session: Session = Depends(get_session),
) -> List[TrazabilidadRead]:
    pqrsd = get_pqrsd(pqrsd_id, session)
    if pqrsd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRSD not found")
    return get_trazabilidad(pqrsd_id, session)


@router.post("/aprobar", response_model=AprobarResponse)
def aprobar_endpoint(
    payload: AprobarRequest,
    session: Session = Depends(get_session),
) -> AprobarResponse:
    pqrsd = aprobar_pqrsd(payload, session)
    if pqrsd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRSD not found")

    return AprobarResponse(
        id=pqrsd.id,
        estado=pqrsd.estado,
        mensaje="PQRSD actualizada correctamente.",
    )
