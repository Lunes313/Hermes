from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Trazabilidad(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pqrsd_id: int = Field(foreign_key="pqrsd.id", index=True)
    evento: str
    usuario: str
    fecha: datetime = Field(default_factory=datetime.utcnow)
    observaciones: Optional[str] = None
