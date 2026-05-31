from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import AuditLog, Lot, LotStatus, DeliveryOrder
from app.schemas.schemas import LotCreate, LotUpdateQC, LotUpdateWarehouse, DeliveryOrderCreate


async def generate_lot_number(db: AsyncSession) -> str:
    """Generate LOT-YYYYMMDD-SEQ using SELECT … FOR UPDATE semantics."""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    prefix = f"LOT-{today}-"
    count = await db.scalar(
        select(func.count(Lot.id)).where(Lot.lot_number.startswith(prefix))
    )
    return f"{prefix}{(count or 0) + 1:03d}"


from sqlalchemy.orm import selectinload

async def get_lots(
    db: AsyncSession, skip: int = 0, limit: int = 100, lot_status: Optional[LotStatus] = None
) -> list[Lot]:
    stmt = select(Lot).options(selectinload(Lot.material), selectinload(Lot.supplier))
    if lot_status:
        stmt = stmt.where(Lot.status == lot_status)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_lot(db: AsyncSession, lot_id: UUID) -> Optional[Lot]:
    result = await db.execute(
        select(Lot)
        .where(Lot.id == lot_id)
        .options(selectinload(Lot.material), selectinload(Lot.supplier))
    )
    return result.scalars().first()


async def create_lot(db: AsyncSession, lot_in: LotCreate, user_id: UUID) -> Lot:
    if db.bind.dialect.name == "postgresql":
        await db.execute(text("SELECT pg_advisory_xact_lock(hashtext('lot_generation'))"))
    
    lot_number = await generate_lot_number(db)
    db_obj = Lot(
        lot_number=lot_number,
        material_id=lot_in.material_id,
        supplier_id=lot_in.supplier_id,
        quantity_kg=lot_in.quantity_kg,
        status=LotStatus.PENDING_QC,
        created_by=user_id,
    )
    db_obj._current_user_id = user_id
    db.add(db_obj)
    await db.flush()
    await db.refresh(db_obj, ["material", "supplier"])
    return db_obj


async def update_lot_qc(db: AsyncSession, lot_id: UUID, lot_update: LotUpdateQC, user_id: UUID) -> Lot:
    lot = await db.get(Lot, lot_id, with_for_update=True)
    if not lot:
        raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found.")

    if lot.status != LotStatus.PENDING_QC:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid state transition: {lot.status.value} → {lot_update.status.value}.",
        )
    if lot_update.status not in (LotStatus.APPROVED, LotStatus.REJECTED):
        raise HTTPException(
            status_code=422,
            detail="QC can only set status to APPROVED or REJECTED.",
        )
    if lot_update.status == LotStatus.REJECTED and not lot_update.rejection_reason:
        raise HTTPException(
            status_code=400,
            detail="Validation error: rejection_reason: required when rejecting a lot.",
        )

    old_value = {"status": lot.status.value, "qc_notes": lot.qc_notes}
    lot.status = lot_update.status
    lot.qc_notes = lot_update.qc_notes
    lot.rejection_reason = lot_update.rejection_reason
    lot.updated_at = datetime.now(timezone.utc)
    lot._current_user_id = user_id

    await db.flush()
    await db.refresh(lot, ["material"])
    return lot


async def update_lot_warehouse(
    db: AsyncSession, lot_id: UUID, lot_update: LotUpdateWarehouse, user_id: UUID
) -> Lot:
    lot = await db.get(Lot, lot_id, with_for_update=True)
    if not lot:
        raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found.")

    if lot.status != LotStatus.APPROVED:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid state transition: {lot.status.value} → IN_PRODUCTION.",
        )

    old_value = {
        "status": lot.status.value,
        "warehouse_slot": lot.warehouse_slot,
    }
    lot.status = LotStatus.IN_PRODUCTION
    lot.warehouse_slot = lot_update.warehouse_slot
    lot.updated_at = datetime.now(timezone.utc)
    lot._current_user_id = user_id

    await db.flush()
    await db.refresh(lot, ["material"])
    return lot

async def create_delivery_order(
    db: AsyncSession, delivery_in: DeliveryOrderCreate, user_id: UUID
) -> DeliveryOrder:
    lot = await db.get(Lot, delivery_in.lot_id, with_for_update=True)
    if not lot:
        raise HTTPException(status_code=404, detail=f"Lot {delivery_in.lot_id} not found.")

    if lot.status != LotStatus.IN_PRODUCTION:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid state transition: {lot.status.value} → DELIVERED.",
        )

    # Update lot status
    lot.status = LotStatus.DELIVERED
    lot.updated_at = datetime.now(timezone.utc)
    lot._current_user_id = user_id

    # Create delivery order
    delivery = DeliveryOrder(
        lot_id=delivery_in.lot_id,
        driver_name=delivery_in.driver_name,
        vehicle_plate=delivery_in.vehicle_plate,
        destination=delivery_in.destination,
        departure_at=delivery_in.departure_at,
        created_by=user_id
    )
    db.add(delivery)
    await db.flush()
    await db.refresh(delivery, ["lot"])
    await db.refresh(delivery.lot, ["material"])
    return delivery
