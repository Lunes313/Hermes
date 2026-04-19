from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PQRSD(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    asunto: str = Field(index=True)
    canal: str
    remitente: str
    texto: str
    estado: str = Field(default="radicada", index=True)
    dependencia_asignada: str = Field(default="atencion_ciudadana", index=True)
    score_clasificacion: float = Field(default=0.0)
    lead: str = Field(default="")
    urgencia: str = Field(default="media", index=True)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_vencimiento: date
