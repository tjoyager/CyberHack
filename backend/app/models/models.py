from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel, Column, JSON

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    INTAKE_STAFF = "INTAKE_STAFF"
    QC_INSPECTOR = "QC_INSPECTOR"
    PPIC_MANAGER = "PPIC_MANAGER"

class LotStatus(str, Enum):
    PENDING_QC = "PENDING_QC"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    IN_PRODUCTION = "IN_PRODUCTION"
    CONSUMED = "CONSUMED"
    EXPIRED = "EXPIRED"

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(unique=True, index=True)
    password_hash: str
    role: UserRole
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Supplier(SQLModel, table=True):
    __tablename__ = "suppliers"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    contact_email: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    lots: List["Lot"] = Relationship(back_populates="supplier")

class Material(SQLModel, table=True):
    __tablename__ = "materials"
    id: Optional[int] = Field(default=None, primary_key=True)
    sku: str = Field(unique=True, index=True)
    name: str
    uom: str = Field(default="KG")
    storage_condition: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    lots: List["Lot"] = Relationship(back_populates="material")

class Lot(SQLModel, table=True):
    __tablename__ = "lots"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    lot_number: str = Field(unique=True, index=True)
    material_id: int = Field(foreign_key="materials.id")
    supplier_id: int = Field(foreign_key="suppliers.id")
    initial_quantity: float
    remaining_quantity: float
    status: LotStatus = Field(default=LotStatus.PENDING_QC)
    warehouse_slot: Optional[str] = None
    expiry_date: datetime
    manufactured_date: Optional[datetime] = None
    qc_notes: Optional[str] = None
    qc_metrics: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    material: Material = Relationship(back_populates="lots")
    supplier: Supplier = Relationship(back_populates="lots")

class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    entity_name: str
    entity_id: UUID
    changed_by: UUID = Field(foreign_key="users.id")
    action: str
    old_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    new_value: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
