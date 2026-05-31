"""
Audit Log endpoints — SUPER_ADMIN only.
"""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1 import deps
from app.core.db import get_db
from app.models.models import AuditLog, User, UserRole
from app.schemas.schemas import AuditLogRead

router = APIRouter()


@router.get("/", response_model=list[AuditLogRead])
async def read_audit_logs(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.check_role([UserRole.SUPER_ADMIN])),
) -> Any:
    """List all audit logs (SUPER_ADMIN only)."""
    result = await db.execute(
        select(AuditLog)
        .options(selectinload(AuditLog.user))
        .order_by(AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
