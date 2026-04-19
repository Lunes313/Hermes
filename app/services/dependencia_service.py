from typing import List

from sqlmodel import Session, select

from app.models.dependencia import Dependencia


def list_dependencias(session: Session) -> List[Dependencia]:
    return list(session.exec(select(Dependencia).order_by(Dependencia.nombre)).all())
