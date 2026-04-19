from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import get_supabase
from app.routers.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Aquí podrías inicializar recursos si fuera necesario
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Sistema Hermes PQRSD con FastAPI y Supabase.",
        lifespan=lifespan,
    )
    
    # Configuración de CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Ajustar en producción
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()

@app.get("/health_check")
async def health_check():
    """Verifica que el servidor y Supabase estén respondiendo."""
    try:
        supabase = get_supabase()
        # Una consulta simple para verificar la conexión
        supabase.table("dependencias").select("count", count="exact").limit(1).execute()
        return {"status": "ok", "supabase": "connected"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
