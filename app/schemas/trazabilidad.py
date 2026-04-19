from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel


class TrazabilidadRead(SQLModel):
    id: int
    pqrsd_id: int
    evento: str
    usuario: str
    fecha: datetime
    observaciones: Optional[str] = None
