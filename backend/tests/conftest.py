import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, UUID, INET

# Tell SQLAlchemy how to compile PostgreSQL-specific types for SQLite tests
@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

@compiles(UUID, "sqlite")
def compile_uuid_sqlite(type_, compiler, **kw):
    return "CHAR(32)"

@compiles(INET, "sqlite")
def compile_inet_sqlite(type_, compiler, **kw):
    return "VARCHAR(50)"

from app.core.db import Base, get_db
from app.main import app
from app.models.models import Material, Supplier, User, UserRole
from app.core.security import get_password_hash

# ---------------------------------------------------------------------------
# In-memory SQLite async engine for testing
# ---------------------------------------------------------------------------

import os
import uuid
from datetime import datetime
from sqlalchemy import event

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DB_URL, echo=False)

@event.listens_for(test_engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if hasattr(dbapi_connection, "create_function"):
        dbapi_connection.create_function("NOW", 0, lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        dbapi_connection.create_function("gen_random_uuid", 0, lambda: uuid.uuid4().hex)

TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)

async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Create and tear down tables for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed data
    async with TestSessionLocal() as session:
        mat = Material(name="Test Material")
        sup = Supplier(company_name="Test Supplier")
        session.add_all([mat, sup])
        
        users = [
            User(username="intake", email="intake@test.com", password_hash=get_password_hash("pass"), role=UserRole.INTAKE_STAFF),
            User(username="qc", email="qc@test.com", password_hash=get_password_hash("pass"), role=UserRole.QC_INSPECTOR),
            User(username="ppic", email="ppic@test.com", password_hash=get_password_hash("pass"), role=UserRole.PPIC_MANAGER)
        ]
        session.add_all(users)
        await session.commit()

    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
