"""
All Pydantic v2 request/response schemas — aligned to CONTEXT.md §4 models.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.models import LotStatus, OTPChannel, UserRole

# ──────────────────────────────────────────────────────────────────────
# Token
# ──────────────────────────────────────────────────────────────────────


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None
    username: Optional[str] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None


# ──────────────────────────────────────────────────────────────────────
# User
# ──────────────────────────────────────────────────────────────────────


class UserBase(BaseModel):
    username: str
    email: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.INTAKE_STAFF
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserRead(BaseModel):
    id: UUID
    username: str
    email: str
    phone_number: Optional[str] = None
    role: UserRole
    is_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────────────────────────────
# Material
# ──────────────────────────────────────────────────────────────────────


class MaterialBase(BaseModel):
    name: str
    supplier_name: Optional[str] = None
    storage_condition: Optional[str] = None
    unit: Optional[str] = None


class MaterialCreate(MaterialBase):
    pass


class MaterialRead(MaterialBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────────────────────────────
# Supplier
# ──────────────────────────────────────────────────────────────────────


class SupplierBase(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierRead(SupplierBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────────────────────────────
# Lot
# ──────────────────────────────────────────────────────────────────────


class LotBase(BaseModel):
    lot_number: str
    material_id: UUID
    supplier_id: Optional[UUID] = None
    quantity_kg: Decimal
    status: LotStatus


class LotCreate(BaseModel):
    material_id: UUID
    supplier_id: Optional[UUID] = None
    quantity_kg: Decimal = Field(gt=0)


class LotRead(LotBase):
    id: UUID
    warehouse_slot: Optional[str] = None
    qc_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class LotUpdateQC(BaseModel):
    """Used by QC_INSPECTOR to approve/reject a lot."""
    status: LotStatus
    qc_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class LotUpdateWarehouse(BaseModel):
    """Used by PPIC_MANAGER to assign a warehouse slot."""
    warehouse_slot: str


# ──────────────────────────────────────────────────────────────────────
# QC Check
# ──────────────────────────────────────────────────────────────────────


class QCCheckCreate(BaseModel):
    lot_id: UUID
    temperature_c: Optional[Decimal] = None
    humidity_pct: Optional[Decimal] = None
    visual_check: Optional[bool] = None
    smell_check: Optional[bool] = None
    weight_variance_pct: Optional[Decimal] = None
    result: str  # 'PASS' | 'FAIL'
    notes: Optional[str] = None


class QCCheckRead(QCCheckCreate):
    id: UUID
    inspector_id: UUID
    checked_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────────────────────────────
# Delivery Order
# ──────────────────────────────────────────────────────────────────────


class DeliveryOrderCreate(BaseModel):
    lot_id: UUID
    driver_name: Optional[str] = None
    vehicle_plate: Optional[str] = None
    destination: Optional[str] = None
    departure_at: Optional[datetime] = None


class DeliveryOrderRead(DeliveryOrderCreate):
    id: UUID
    arrived_at: Optional[datetime] = None
    status: str
    created_by: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────────────────────────────
# Audit Log
# ──────────────────────────────────────────────────────────────────────


class AuditLogRead(BaseModel):
    id: UUID
    entity_name: str
    entity_id: UUID
    changed_by: UUID
    action: str
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
