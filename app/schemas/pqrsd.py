from __future__ import annotations

from datetime import date, datetime
from typing import Optional, List

from pydantic import Field, BaseModel
from sqlmodel import SQLModel


class PQRSDInput(BaseModel):
    texto: str

class PQRSDOutput(BaseModel):
    nombre: str
    dependencias: List[str]
    tipo_pqrs: str
    lugar: str

class PQRSDCreate(SQLModel):
    asunto: str = Field(..., min_length=1, max_length=200)
    canal: str = Field(..., min_length=1, max_length=80)
    remitente: str = Field(..., min_length=1, max_length=160)
    texto: str = Field(..., min_length=1)


class PQRSDRead(PQRSDCreate):
    id: int
    estado: str
    dependencia_asignada: str
    # Eliminamos campos antiguos o los dejamos opcionales para compatibilidad
    score_clasificacion: Optional[float] = None
    lead: Optional[str] = None
    urgencia: Optional[str] = None
    tipo_pqrs: Optional[str] = None
    lugar: Optional[str] = None
    fecha_creacion: datetime
    fecha_vencimiento: date


class AprobarRequest(SQLModel):
    pqrsd_id: int
    aprobado: bool
    usuario: str = Field(default="juridica", min_length=1, max_length=120)
    observaciones: Optional[str] = None


class AprobarResponse(SQLModel):
    id: int
    estado: str
    mensaje: str
