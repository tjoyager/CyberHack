"""
Delivery Orders endpoints.
"""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1 import deps
from app.core.db import get_db
from app.crud import crud_lot
from app.models.models import DeliveryOrder, User, UserRole
from app.schemas.schemas import DeliveryOrderCreate, DeliveryOrderRead

router = APIRouter()


@router.get("/", response_model=list[DeliveryOrderRead])
async def read_delivery_orders(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """List all delivery orders."""
    result = await db.execute(select(DeliveryOrder).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/", response_model=DeliveryOrderRead, status_code=201)
async def create_delivery_order(
    delivery_in: DeliveryOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        deps.check_role([UserRole.DELIVERY_STAFF, UserRole.SUPER_ADMIN])
    ),
) -> Any:
    """Create a new delivery order and mark lot as DELIVERED."""
    delivery = await crud_lot.create_delivery_order(db, delivery_in, current_user.id)
    return delivery
