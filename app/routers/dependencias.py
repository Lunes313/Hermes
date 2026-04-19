from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.schemas.dependencia import DependenciaRead
from app.services.dependencia_service import list_dependencias


router = APIRouter()


@router.get("/dependencias", response_model=List[DependenciaRead])
def get_dependencias(session: Session = Depends(get_session)) -> List[DependenciaRead]:
    return list_dependencias(session)
