from typing import Any, List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, text
from app.api.v1 import deps
from app.core.db import get_session
from app.models.models import Lot, User, UserRole, LotStatus
from app.schemas.schemas import LotCreate, LotRead, LotUpdateStatus

router = APIRouter()

def set_db_user(db: Session, user_id: str):
    # SQLite (used in tests) doesn't support 'SET LOCAL'
    if db.bind.dialect.name == "sqlite":
        return
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
    count_stmt = select(text("count(*)")).select_from(Lot).where(text(f"lot_number LIKE 'LOT-{today}-%'"))
    count = db.exec(count_stmt).first()
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

@router.patch("/{lot_id}/qc", response_model=LotRead)
def update_lot_qc(
    *,
    db: Session = Depends(get_session),
    lot_id: UUID,
    lot_update: LotUpdateStatus,
    current_user: User = Depends(deps.check_role([UserRole.QC_INSPECTOR]))
) -> Any:
    db_obj = db.get(Lot, lot_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    if db_obj.status != LotStatus.PENDING_QC:
        raise HTTPException(status_code=400, detail="QC Inspector can only update lots in PENDING_QC status")
    
    if lot_update.status not in [LotStatus.APPROVED, LotStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="QC Inspector can only set status to APPROVED or REJECTED")

    db_obj.status = lot_update.status
    db_obj.qc_notes = lot_update.qc_notes
    db_obj.qc_metrics = lot_update.qc_metrics
    db_obj.updated_at = datetime.utcnow()
    
    set_db_user(db, str(current_user.id))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.patch("/{lot_id}/ppic", response_model=LotRead)
def update_lot_ppic(
    *,
    db: Session = Depends(get_session),
    lot_id: UUID,
    lot_update: LotUpdateStatus,
    current_user: User = Depends(deps.check_role([UserRole.PPIC_MANAGER]))
) -> Any:
    db_obj = db.get(Lot, lot_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Lot not found")
    
    if db_obj.status != LotStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Only APPROVED lots can be routed by PPIC")
    
    if not lot_update.warehouse_slot:
        raise HTTPException(status_code=400, detail="Warehouse slot is required for PPIC routing")

    db_obj.status = lot_update.status or LotStatus.IN_PRODUCTION
    db_obj.warehouse_slot = lot_update.warehouse_slot
    db_obj.updated_at = datetime.utcnow()
    
    set_db_user(db, str(current_user.id))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{lot_id}", response_model=LotRead)
def read_lot(
    *,
    db: Session = Depends(get_session),
    lot_id: UUID,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    db_obj = db.get(Lot, lot_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Lot not found")
    return db_obj
