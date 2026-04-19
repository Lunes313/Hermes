from typing import List

from fastapi import APIRouter, HTTPException, status

from app.schemas.pqrsd import AprobarRequest, AprobarResponse, PQRSDCreate
from app.services.pqrsd_service import (
    aprobar_pqrsd,
    create_pqrsd,
    get_pqrsd,
    get_trazabilidad,
    list_pqrsd
)


router = APIRouter()


@router.post("/pqrsd", status_code=status.HTTP_201_CREATED)
async def create_pqrsd_endpoint(payload: PQRSDCreate):
    return await create_pqrsd(payload)


@router.get("/pqrsd")
async def list_pqrsd_endpoint():
    return await list_pqrsd()


@router.get("/pqrsd/{pqrsd_id}")
async def get_pqrsd_endpoint(pqrsd_id: int):
    pqrsd = await get_pqrsd(pqrsd_id)
    if pqrsd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRSD not found")
    return pqrsd


@router.get("/trazabilidad/{pqrsd_id}")
async def get_trazabilidad_endpoint(pqrsd_id: int):
    pqrsd = await get_pqrsd(pqrsd_id)
    if pqrsd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRSD not found")
    return await get_trazabilidad(pqrsd_id)


@router.post("/aprobar", response_model=AprobarResponse)
async def aprobar_endpoint(payload: AprobarRequest):
    pqrsd = await aprobar_pqrsd(payload)
    if pqrsd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQRSD not found")

    return AprobarResponse(
        id=pqrsd["id"],
        estado=pqrsd["estado"],
        mensaje="PQRSD actualizada correctamente.",
    )
