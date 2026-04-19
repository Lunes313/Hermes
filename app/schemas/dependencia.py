from sqlmodel import SQLModel


class DependenciaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
