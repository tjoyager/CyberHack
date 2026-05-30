"""
Lot lifecycle endpoints: intake → QC → PPIC → Delivery.

Business rules (CONTEXT.md §7):
  - PENDING_QC  → APPROVED/REJECTED  : Only QC_INSPECTOR
  - APPROVED    → IN_PRODUCTION       : Only PPIC_MANAGER (requires warehouse_slot)
  - IN_PRODUCTION → DELIVERED         : Only DELIVERY_STAFF (requires delivery_order)
  - Every UPDATE writes to audit_logs in the SAME transaction.
"""

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1 import deps
from app.core.db import get_db
from app.crud import crud_lot
from app.models.models import LotStatus, User, UserRole
from app.schemas.schemas import LotCreate, LotRead, LotUpdateQC, LotUpdateWarehouse
from app.services import sheets_sync

router = APIRouter()

@router.get("/", response_model=list[LotRead])
async def read_lots(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    lot_status: Optional[LotStatus] = None,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """List lots, optionally filtered by status."""
    lots = await crud_lot.get_lots(db, skip=skip, limit=limit, lot_status=lot_status)
    return lots

@router.get("/{lot_id}", response_model=LotRead)
async def read_lot(
    lot_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get a single lot by ID."""
    lot = await crud_lot.get_lot(db, lot_id)
    if not lot:
        raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found.")
    return lot

@router.post("/", response_model=LotRead, status_code=status.HTTP_201_CREATED)
async def create_lot(
    lot_in: LotCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.INTAKE_STAFF])),
) -> Any:
    """Create a new lot — auto-generates lot_number, sets status PENDING_QC."""
    lot = await crud_lot.create_lot(db, lot_in, current_user.id)
    
    # Push to Google Sheets (Intake/Warehouse tab)
    background_tasks.add_task(
        sheets_sync.push_to_sheets, 
        "Warehouse", 
        {
            "lot_number": lot.lot_number,
            "material_name": lot.material.name if lot.material else "N/A",
            "supplier_name": lot.supplier.company_name if lot.supplier else "N/A",
            "quantity_kg": str(lot.quantity_kg),
            "storage_condition": lot.material.storage_condition if lot.material else "N/A",
            "status": lot.status.value
        }
    )
    return lot

@router.patch("/{lot_id}/qc", response_model=LotRead)
async def update_lot_qc(
    lot_id: UUID,
    lot_update: LotUpdateQC,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.QC_INSPECTOR])),
) -> Any:
    """QC Inspector approves or rejects a PENDING_QC lot."""
    lot = await crud_lot.update_lot_qc(db, lot_id, lot_update, current_user.id)
    
    # Push to Google Sheets (QC tab)
    background_tasks.add_task(
        sheets_sync.push_to_sheets,
        "QC",
        {
            "lot_number": lot.lot_number,
            "material_name": lot.material.name if lot.material else "N/A",
            "quantity_kg": str(lot.quantity_kg),
            "result": lot.status.value,
            "qc_notes": lot.qc_notes
        }
    )
    return lot

@router.patch("/{lot_id}/warehouse", response_model=LotRead)
async def update_lot_warehouse(
    lot_id: UUID,
    lot_update: LotUpdateWarehouse,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.check_role([UserRole.PPIC_MANAGER])),
) -> Any:
    """PPIC Manager assigns warehouse slot — APPROVED → IN_PRODUCTION."""
    lot = await crud_lot.update_lot_warehouse(db, lot_id, lot_update, current_user.id)
    
    # Push to Google Sheets (PPIC tab)
    background_tasks.add_task(
        sheets_sync.push_to_sheets,
        "PPIC",
        {
            "lot_number": lot.lot_number,
            "material_name": lot.material.name if lot.material else "N/A",
            "quantity_kg": str(lot.quantity_kg),
            "warehouse_slot": lot.warehouse_slot,
            "status": lot.status.value
        }
    )
    return lot
