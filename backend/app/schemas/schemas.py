from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.models import UserRole, LotStatus

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None

# User
class UserBase(BaseModel):
    username: str
    role: UserRole
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Material
class MaterialBase(BaseModel):
    sku: str
    name: str
    uom: str = "KG"
    storage_condition: str

class MaterialCreate(MaterialBase):
    pass

class MaterialRead(MaterialBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Lot
class LotBase(BaseModel):
    lot_number: str
    material_id: int
    supplier_id: int
    initial_quantity: float
    remaining_quantity: float
    status: LotStatus
    expiry_date: datetime
    manufactured_date: Optional[datetime] = None

class LotCreate(BaseModel):
    material_id: int
    supplier_id: int
    initial_quantity: float
    expiry_date: datetime
    manufactured_date: Optional[datetime] = None

class LotRead(LotBase):
    id: UUID
    warehouse_slot: Optional[str] = None
    qc_notes: Optional[str] = None
    qc_metrics: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LotUpdateStatus(BaseModel):
    status: LotStatus
    qc_notes: Optional[str] = None
    qc_metrics: Optional[dict] = None
    warehouse_slot: Optional[str] = None

# Audit Log
class AuditLogRead(BaseModel):
    id: int
    entity_name: str
    entity_id: UUID
    changed_by: UUID
    action: str
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
