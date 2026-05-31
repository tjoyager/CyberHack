"""
Materials endpoints — master data for raw materials.
"""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1 import deps
from app.core.db import get_db
from app.models.models import Material, User, UserRole
from app.schemas.schemas import MaterialCreate, MaterialRead

router = APIRouter()


@router.get("/", response_model=list[MaterialRead])
async def read_materials(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """List all materials."""
    result = await db.execute(select(Material).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/", response_model=MaterialRead, status_code=201)
async def create_material(
    material_in: MaterialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        deps.check_role([UserRole.SUPER_ADMIN, UserRole.PPIC_MANAGER])
    ),
) -> Any:
    """Create a new material (SUPER_ADMIN or PPIC_MANAGER only)."""
    db_obj = Material(**material_in.model_dump())
    db.add(db_obj)
    await db.flush()
    return db_obj
