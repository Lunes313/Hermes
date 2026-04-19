from typing import Generator

from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import settings
from app.models import Dependencia


engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)
    ensure_ai_columns()
    seed_dependencias()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def seed_dependencias() -> None:
    with Session(engine) as session:
        seed_data = {
            "Atencion Ciudadana": "Recibe, radica y clasifica solicitudes ciudadanas.",
            "Infraestructura": "Gestiona reportes sobre vias, huecos, andenes y obras.",
            "Salud": "Atiende solicitudes relacionadas con servicios de salud.",
            "Hacienda": "Gestiona solicitudes sobre impuestos, pagos y cobros.",
            "Juridica": "Revisa respuestas y aprobaciones juridicas.",
        }
        existing_names = set(session.exec(select(Dependencia.nombre)).all())
        for nombre, descripcion in seed_data.items():
            if nombre not in existing_names:
                session.add(Dependencia(nombre=nombre, descripcion=descripcion))
        session.commit()


def ensure_ai_columns() -> None:
    inspector = inspect(engine)
    if "pqrsd" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("pqrsd")}
    column_definitions = {
        "dependencia_asignada": "VARCHAR DEFAULT 'atencion_ciudadana'",
        "score_clasificacion": "FLOAT DEFAULT 0.0",
        "lead": "VARCHAR DEFAULT ''",
        "urgencia": "VARCHAR DEFAULT 'media'",
    }

    with engine.begin() as connection:
        for column_name, definition in column_definitions.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE pqrsd ADD COLUMN {column_name} {definition}"))
