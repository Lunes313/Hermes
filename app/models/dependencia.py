from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class Dependencia(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: str
