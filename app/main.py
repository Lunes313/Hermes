from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.config import settings
from app.core.database import create_db_and_tables
from app.routers.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_db_and_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="MVP para gestion de PQRSD con FastAPI y SQLite.",
        lifespan=lifespan,
    )
    app.include_router(api_router)
    return app


app = create_app()
