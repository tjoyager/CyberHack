"""
Async SQLAlchemy engine + session factory for PostgreSQL via asyncpg.

Usage in FastAPI endpoints:
    from app.core.db import get_db
    @router.get("/")
    async def index(db: AsyncSession = Depends(get_db)):
        ...
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ---------------------------------------------------------------------------
# Async Engine
# ---------------------------------------------------------------------------
# The DATABASE_URL in .env MUST use the `postgresql+asyncpg://` scheme.
# Example: postgresql+asyncpg://user:password@localhost:5432/sima_arome_db
# ---------------------------------------------------------------------------

engine = create_async_engine(
    settings.async_database_url,
    echo=settings.APP_ENV != "production",
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# ---------------------------------------------------------------------------
# Async Session Factory
# ---------------------------------------------------------------------------

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ---------------------------------------------------------------------------
# Declarative Base (SQLAlchemy 2.0 style)
# ---------------------------------------------------------------------------


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""

    pass


# ---------------------------------------------------------------------------
# FastAPI Dependency — yields an AsyncSession per request
# ---------------------------------------------------------------------------


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional async database session per request.

    The session is committed automatically on successful return and
    rolled back on exception.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
