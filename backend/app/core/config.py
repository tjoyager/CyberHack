"""
Application settings loaded from environment variables via pydantic-settings.
All secrets MUST live in .env — never hardcode.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse


class Settings(BaseSettings):
    PROJECT_NAME: str = "CyberHack - Sima Arome ERP Lite"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    BACKEND_CORS_ORIGINS: str | list[str] = "http://localhost:3000,http://localhost:3001"

    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "sima_arome_db"
    DATABASE_URL: Optional[str] = None

    ARGON2_TIME_COST: int = 3
    ARGON2_MEMORY_COST: int = 65536
    ARGON2_PARALLELISM: int = 4
    JWT_SECRET_KEY: str = "CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    RATE_LIMIT_MAX_REQUESTS: int = 5
    RATE_LIMIT_WINDOW_SECONDS: int = 900

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def _strip_sslmode(self, url: str) -> tuple[str, bool]:
        """Remove sslmode from query string, return (clean_url, needs_ssl)."""
        parsed = urlparse(url)
        params = parse_qs(parsed.query, keep_blank_values=True)
        sslmode = params.pop("sslmode", ["disable"])[0]
        needs_ssl = sslmode in ("require", "verify-ca", "verify-full", "prefer")
        new_query = urlencode({k: v[0] for k, v in params.items()})
        clean = urlunparse(parsed._replace(query=new_query))
        return clean, needs_ssl

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            url, _ = self._strip_sslmode(url)
            return url
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def async_database_needs_ssl(self) -> bool:
        if self.DATABASE_URL:
            _, needs_ssl = self._strip_sslmode(self.DATABASE_URL)
            return needs_ssl
        return False

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if "+asyncpg" in url:
                url = url.replace("+asyncpg", "")
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def ASYNC_DATABASE_URI(self) -> str:
        return self.async_database_url


settings = Settings()
