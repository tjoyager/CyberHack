"""
Application settings loaded from environment variables via pydantic-settings.
All secrets MUST live in .env — never hardcode.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # ------------------------------------------------------------------
    # General
    # ------------------------------------------------------------------
    PROJECT_NAME: str = "CyberHack - Sima Arome ERP Lite"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"

    # ------------------------------------------------------------------
    # Database (PostgreSQL 15+ via asyncpg)
    # ------------------------------------------------------------------
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "sima_arome_db"
    DATABASE_URL: Optional[str] = None

    # ------------------------------------------------------------------
    # JWT
    # ------------------------------------------------------------------
    JWT_SECRET_KEY: str = "CHANGE_ME"  # override in .env
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ------------------------------------------------------------------
    # Argon2id password hashing
    # ------------------------------------------------------------------
    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536  # 64 MB
    ARGON2_PARALLELISM: int = 4

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------
    RATE_LIMIT_MAX_REQUESTS: int = 5
    RATE_LIMIT_WINDOW_SECONDS: int = 900

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ------------------------------------------------------------------
    # Computed database URLs
    # ------------------------------------------------------------------

    @property
    def async_database_url(self) -> str:
        """Return the asyncpg connection string.

        If ``DATABASE_URL`` is set explicitly, it takes precedence but is
        rewritten to use the ``postgresql+asyncpg://`` scheme.
        """
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            # Normalise to async driver
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def sync_database_url(self) -> str:
        """Return a standard psycopg2 URL (used by Alembic migrations)."""
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if "+asyncpg" in url:
                url = url.replace("+asyncpg", "")
            return url
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
