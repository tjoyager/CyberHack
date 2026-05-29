"""
Lot lifecycle tests — async SQLAlchemy + httpx AsyncClient.

Tests cover: lot creation, QC approval, PPIC warehouse assignment, and RBAC.
"""

import pytest
from decimal import Decimal
from httpx import AsyncClient
from sqlalchemy import select

from app.core.security import create_access_token, get_password_hash
from app.models.models import Lot, LotStatus, Material, Supplier, User, UserRole

# Use TestSessionLocal from conftest
from tests.conftest import TestSessionLocal

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _get_user(username: str) -> User:
    """Fetch a user by username from the test DB."""
    async with TestSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.username == username)
        )
        return result.scalars().first()

def _auth_header(user_id) -> dict:
    token = create_access_token(subject=str(user_id))
    return {"Authorization": f"Bearer {token}"}

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_lot_as_intake(client: AsyncClient):
    user = await _get_user("intake")
    # Get material and supplier IDs
    async with TestSessionLocal() as session:
        mat = (await session.execute(select(Material))).scalars().first()
        sup = (await session.execute(select(Supplier))).scalars().first()

    response = await client.post(
        "/api/v1/lots/",
        json={
            "material_id": str(mat.id),
            "supplier_id": str(sup.id),
            "quantity_kg": "100.000",
        },
        headers=_auth_header(user.id),
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["status"] == LotStatus.PENDING_QC.value
    assert data["lot_number"].startswith("LOT-")

@pytest.mark.asyncio
async def test_qc_approve_lot(client: AsyncClient):
    # Seed a PENDING_QC lot
    user_intake = await _get_user("intake")
    async with TestSessionLocal() as session:
        mat = (await session.execute(select(Material))).scalars().first()
        sup = (await session.execute(select(Supplier))).scalars().first()
        lot = Lot(
            lot_number="LOT-TEST-001",
            material_id=mat.id,
            supplier_id=sup.id,
            quantity_kg=Decimal("50.000"),
            status=LotStatus.PENDING_QC,
            created_by=user_intake.id,
        )
        session.add(lot)
        await session.commit()
        lot_id = lot.id

    user_qc = await _get_user("qc")
    response = await client.patch(
        f"/api/v1/lots/{lot_id}/qc",
        json={"status": "APPROVED", "qc_notes": "All good"},
        headers=_auth_header(user_qc.id),
    )
    assert response.status_code == 200
    assert response.json()["status"] == LotStatus.APPROVED.value

@pytest.mark.asyncio
async def test_ppic_assign_warehouse(client: AsyncClient):
    user_intake = await _get_user("intake")
    async with TestSessionLocal() as session:
        mat = (await session.execute(select(Material))).scalars().first()
        sup = (await session.execute(select(Supplier))).scalars().first()
        lot = Lot(
            lot_number="LOT-TEST-003",
            material_id=mat.id,
            supplier_id=sup.id,
            quantity_kg=Decimal("50.000"),
            status=LotStatus.APPROVED,
            created_by=user_intake.id,
        )
        session.add(lot)
        await session.commit()
        lot_id = lot.id

    user_ppic = await _get_user("ppic")
    response = await client.patch(
        f"/api/v1/lots/{lot_id}/warehouse",
        json={"warehouse_slot": "RACK-A1-03"},
        headers=_auth_header(user_ppic.id),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == LotStatus.IN_PRODUCTION.value
    assert data["warehouse_slot"] == "RACK-A1-03"

@pytest.mark.asyncio
async def test_rbac_intake_cannot_approve(client: AsyncClient):
    user_intake = await _get_user("intake")
    async with TestSessionLocal() as session:
        mat = (await session.execute(select(Material))).scalars().first()
        lot = Lot(
            lot_number="LOT-TEST-002",
            material_id=mat.id,
            quantity_kg=Decimal("50.000"),
            status=LotStatus.PENDING_QC,
            created_by=user_intake.id,
        )
        session.add(lot)
        await session.commit()
        lot_id = lot.id

    response = await client.patch(
        f"/api/v1/lots/{lot_id}/qc",
        json={"status": "APPROVED"},
        headers=_auth_header(user_intake.id),
    )
    assert response.status_code == 403
