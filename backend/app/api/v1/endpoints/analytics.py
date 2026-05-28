"""
Analytics endpoints.
"""

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.api.v1 import deps
from app.core.db import get_db
from app.models.models import User, UserRole
from app.services import analytics

router = APIRouter()


@router.get("/monthly-intake")
async def monthly_intake(
    month: int = None,
    year: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    now = datetime.now()
    month = month or now.month
    year = year or now.year
    return await analytics.get_monthly_intake(db, month, year)


@router.get("/qc-rejection-rate")
async def qc_rejection_rate(
    month: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.QC_INSPECTOR, UserRole.SUPER_ADMIN])),
) -> Any:
    now = datetime.now()
    month = month or now.month
    return await analytics.get_qc_rejection_rate(db, month)


@router.get("/lot-status-summary")
async def lot_status_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.PPIC_MANAGER, UserRole.SUPER_ADMIN])),
) -> Any:
    return await analytics.get_lot_status_summary(db)


@router.get("/supplier-performance")
async def supplier_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.SUPER_ADMIN])),
) -> Any:
    return await analytics.get_supplier_performance(db)


@router.get("/warehouse-utilization")
async def warehouse_utilization(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.PPIC_MANAGER, UserRole.SUPER_ADMIN])),
) -> Any:
    return await analytics.get_warehouse_utilization(db)


@router.get("/delivery-lead-time")
async def delivery_lead_time(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.DELIVERY_STAFF, UserRole.SUPER_ADMIN])),
) -> Any:
    return await analytics.get_delivery_lead_time(db)
