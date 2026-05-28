from typing import Any, List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, text
from backend.app.api.v1 import deps
from backend.app.core.db import get_session
from backend.app.models.models import Lot, User, UserRole, LotStatus
from backend.app.schemas.schemas import LotCreate, LotRead, LotUpdateStatus

router = APIRouter()

def set_db_user(db: Session, user_id: str):
    db.execute(text(f"SET LOCAL app.current_user_id = '{user_id}'"))

@router.get("/", response_model=List[LotRead])
def read_lots(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    status: Optional[LotStatus] = None,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    statement = select(Lot)
    if status:
        statement = statement.where(Lot.status == status)
    lots = db.exec(statement.offset(skip).limit(limit)).all()
    return lots

@router.post("/", response_model=LotRead)
def create_lot(
    *,
    db: Session = Depends(get_session),
    lot_in: LotCreate,
    current_user: User = Depends(deps.check_role([UserRole.INTAKE_STAFF]))
) -> Any:
    # Generate lot number: LOT-YYYYMMDD-SEQUENCE
    today = datetime.now().strftime("%Y%m%d")
    count = db.exec(select(text("count(*)")).select_from(Lot).where(text(f"lot_number LIKE 'LOT-{today}-%'"))).first()
    lot_number = f"LOT-{today}-{(count or 0) + 1:03d}"
    
    db_obj = Lot(
        **lot_in.model_dump(),
        lot_number=lot_number,
        remaining_quantity=lot_in.initial_quantity,
        status=LotStatus.PENDING_QC
    )
    
    set_db_user(db, str(current_user.id))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.patch("/{lot_id}", response_model=LotRead)
def update_lot_status(
    *,
    db: Session = Depends(get_session),
    lot_id: UUID,
    lot_update: LotUpdateStatus,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    db_obj = db.get(Lot, lot_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    # State Machine & RBAC Logic
    if current_user.role == UserRole.QC_INSPECTOR:
        if db_obj.status != LotStatus.PENDING_QC:
            raise HTTPException(status_code=400, detail="QC Inspector can only update lots in PENDING_QC status")
        if lot_update.status not in [LotStatus.APPROVED, LotStatus.REJECTED]:
            raise HTTPException(status_code=400, detail="QC Inspector can only approve or reject")
        db_obj.status = lot_update.status
        db_obj.qc_notes = lot_update.qc_notes
        db_obj.qc_metrics = lot_update.qc_metrics
        
    elif current_user.role == UserRole.PPIC_MANAGER:
        if db_obj.status != LotStatus.APPROVED:
            raise HTTPException(status_code=400, detail="PPIC Manager can only update lots in APPROVED status")
        if lot_update.status != LotStatus.IN_PRODUCTION:
             raise HTTPException(status_code=400, detail="PPIC Manager can only move lots to IN_PRODUCTION")
        if not lot_update.warehouse_slot:
            raise HTTPException(status_code=400, detail="Warehouse slot is required")
        db_obj.status = lot_update.status
        db_obj.warehouse_slot = lot_update.warehouse_slot
    
    elif current_user.role == UserRole.SUPER_ADMIN:
        # Admin can do anything for troubleshooting
        for key, value in lot_update.model_dump(exclude_unset=True).items():
            setattr(db_obj, key, value)
    else:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db_obj.updated_at = datetime.utcnow()
    set_db_user(db, str(current_user.id))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
