"""
FastAPI application entrypoint.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import logging
import traceback

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.db import engine
import app.core.audit  # Register SQLAlchemy event listeners


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — verify DB connectivity on boot."""
    # Startup: verify database connection
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    # Shutdown: dispose of the engine connection pool
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS
origins = []
if isinstance(settings.BACKEND_CORS_ORIGINS, str):
    origins = [o.strip() for o in settings.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
else:
    origins = settings.BACKEND_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled Exception: {exc}")
    logging.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Contact administrator."}
    )


@app.get("/")
async def root():
    return {"message": "Welcome to Sima Arome ERP Lite API"}


@app.get("/health")
async def health_check():
    """Health check endpoint — verifies DB connectivity."""
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception:
        return {"status": "error", "db": "disconnected"}
