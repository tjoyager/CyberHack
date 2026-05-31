"""
Auth endpoint tests — async SQLAlchemy + httpx AsyncClient.
"""

import pytest
from httpx import AsyncClient

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_read_root(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Sima Arome ERP Lite API"}

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("ok", "error")

@pytest.mark.asyncio
async def test_login_fail(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    assert "Incorrect" in response.json()["detail"]
