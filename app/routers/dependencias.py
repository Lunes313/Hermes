from fastapi import APIRouter
from app.services.dependencia_service import list_dependencias

router = APIRouter()

@router.get("/dependencias")
async def get_dependencias():
    return await list_dependencias()
