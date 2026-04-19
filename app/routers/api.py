from fastapi import APIRouter

from app.routers import dependencias, health, pqrsd


api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(pqrsd.router, tags=["pqrsd"])
api_router.include_router(dependencias.router, tags=["dependencias"])
