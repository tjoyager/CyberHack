"""
User management endpoints — SUPER_ADMIN only (except /me).
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1 import deps
from app.core.db import get_db
from app.core.security import get_password_hash
from app.models.models import User, UserRole
from app.schemas.schemas import UserCreate, UserRead

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=201)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.SUPER_ADMIN])),
) -> Any:
    """Create a new user (SUPER_ADMIN only)."""
    result = await db.execute(
        select(User).where(
            (User.username == user_in.username) | (User.email == user_in.email)
        )
    )
    existing = result.scalars().first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this username or email already exists.",
        )

    db_obj = User(
        username=user_in.username,
        email=user_in.email,
        phone_number=user_in.phone_number,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(db_obj)
    await db.flush()
    return db_obj


@router.get("/me", response_model=UserRead)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Return the currently authenticated user."""
    return current_user
