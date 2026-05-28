"""
All SQLAlchemy ORM models — mirrors the DDL in CONTEXT.md Section 4 exactly.

Uses SQLAlchemy 2.0 Mapped Column style with the shared ``Base`` from
``app.core.db``.  PostgreSQL-native types (UUID, INET, JSONB, ENUM,
TIMESTAMPTZ, NUMERIC) are used to match the production DDL.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import (
    ENUM,
    INET,
    JSONB,
    UUID as PG_UUID,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime

from app.core.db import Base

# ──────────────────────────────────────────────────────────────────────
# PostgreSQL ENUM types (created via CREATE TYPE … AS ENUM)
# ──────────────────────────────────────────────────────────────────────


class UserRole(str, enum.Enum):
    """Maps to ``CREATE TYPE user_role``."""

    SUPER_ADMIN = "SUPER_ADMIN"
    INTAKE_STAFF = "INTAKE_STAFF"
    QC_INSPECTOR = "QC_INSPECTOR"
    PPIC_MANAGER = "PPIC_MANAGER"
    SUPPLIER = "SUPPLIER"
    DELIVERY_STAFF = "DELIVERY_STAFF"


class LotStatus(str, enum.Enum):
    """Maps to ``CREATE TYPE lot_status``."""

    PENDING_QC = "PENDING_QC"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    IN_PRODUCTION = "IN_PRODUCTION"
    DELIVERED = "DELIVERED"


class OTPChannel(str, enum.Enum):
    """Maps to ``CREATE TYPE otp_channel``."""

    EMAIL = "EMAIL"
    WHATSAPP = "WHATSAPP"


# Re-usable PG ENUM column types
user_role_enum = ENUM(
    UserRole,
    name="user_role",
    create_type=False,
    values_callable=lambda e: [member.value for member in e],
)
lot_status_enum = ENUM(
    LotStatus,
    name="lot_status",
    create_type=False,
    values_callable=lambda e: [member.value for member in e],
)
otp_channel_enum = ENUM(
    OTPChannel,
    name="otp_channel",
    create_type=False,
    values_callable=lambda e: [member.value for member in e],
)

# Shared timestamp column helper (TIMESTAMPTZ with server default NOW())
_tz_now = text("NOW()")


# ──────────────────────────────────────────────────────────────────────
# USERS (RBAC)
# ──────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        user_role_enum, nullable=False, server_default=text("'INTAKE_STAFF'")
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("TRUE"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Relationships ──
    otp_tokens: Mapped[list["OTPToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    created_lots: Mapped[list["Lot"]] = relationship(
        back_populates="creator", foreign_keys="[Lot.created_by]", lazy="selectin"
    )
    qc_checks: Mapped[list["QCCheck"]] = relationship(
        back_populates="inspector", lazy="selectin"
    )
    delivery_orders: Mapped[list["DeliveryOrder"]] = relationship(
        back_populates="creator", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<User {self.username!r} role={self.role.value}>"


# ──────────────────────────────────────────────────────────────────────
# OTP TOKENS
# ──────────────────────────────────────────────────────────────────────


class OTPToken(Base):
    __tablename__ = "otp_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[OTPChannel] = mapped_column(
        otp_channel_enum, nullable=False, server_default=text("'EMAIL'")
    )
    purpose: Mapped[str] = mapped_column(String(30), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    user: Mapped["User"] = relationship(back_populates="otp_tokens")

    def __repr__(self) -> str:
        return f"<OTPToken purpose={self.purpose!r} channel={self.channel.value}>"


# ──────────────────────────────────────────────────────────────────────
# MATERIALS (Master data)
# ──────────────────────────────────────────────────────────────────────


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    supplier_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    storage_condition: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    lots: Mapped[list["Lot"]] = relationship(back_populates="material", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Material {self.name!r}>"


# ──────────────────────────────────────────────────────────────────────
# SUPPLIERS
# ──────────────────────────────────────────────────────────────────────


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    lots: Mapped[list["Lot"]] = relationship(back_populates="supplier", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Supplier {self.company_name!r}>"


# ──────────────────────────────────────────────────────────────────────
# LOTS (Core transactional entity)
# ──────────────────────────────────────────────────────────────────────


class Lot(Base):
    __tablename__ = "lots"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    lot_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    material_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("materials.id"), nullable=False
    )
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True
    )
    quantity_kg: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    status: Mapped[LotStatus] = mapped_column(
        lot_status_enum, nullable=False, server_default=text("'PENDING_QC'")
    )
    warehouse_slot: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    qc_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    material: Mapped["Material"] = relationship(back_populates="lots", lazy="selectin")
    supplier: Mapped[Optional["Supplier"]] = relationship(back_populates="lots", lazy="selectin")
    creator: Mapped["User"] = relationship(
        back_populates="created_lots", foreign_keys=[created_by], lazy="selectin"
    )
    qc_checks: Mapped[list["QCCheck"]] = relationship(
        back_populates="lot", lazy="selectin"
    )
    delivery_orders: Mapped[list["DeliveryOrder"]] = relationship(
        back_populates="lot", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Lot {self.lot_number!r} status={self.status.value}>"


# ──────────────────────────────────────────────────────────────────────
# QC CHECKS (per lot)
# ──────────────────────────────────────────────────────────────────────


class QCCheck(Base):
    __tablename__ = "qc_checks"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    lot_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("lots.id"), nullable=False
    )
    inspector_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    temperature_c: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    humidity_pct: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    visual_check: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    smell_check: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    weight_variance_pct: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    result: Mapped[str] = mapped_column(String(10), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    lot: Mapped["Lot"] = relationship(back_populates="qc_checks", lazy="selectin")
    inspector: Mapped["User"] = relationship(back_populates="qc_checks", lazy="selectin")

    def __repr__(self) -> str:
        return f"<QCCheck lot_id={self.lot_id!r} result={self.result!r}>"


# ──────────────────────────────────────────────────────────────────────
# DELIVERY ORDERS
# ──────────────────────────────────────────────────────────────────────


class DeliveryOrder(Base):
    __tablename__ = "delivery_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    lot_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("lots.id"), nullable=False
    )
    driver_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    vehicle_plate: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    departure_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    arrived_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, server_default=text("'SCHEDULED'")
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    lot: Mapped["Lot"] = relationship(back_populates="delivery_orders", lazy="selectin")
    creator: Mapped["User"] = relationship(back_populates="delivery_orders", lazy="selectin")

    def __repr__(self) -> str:
        return f"<DeliveryOrder lot_id={self.lot_id!r} status={self.status!r}>"


# ──────────────────────────────────────────────────────────────────────
# SHEETS SYNC LOG
# ──────────────────────────────────────────────────────────────────────


class SheetsSyncLog(Base):
    __tablename__ = "sheets_sync_log"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    sheet_tab: Mapped[str] = mapped_column(String(50), nullable=False)
    last_synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )
    rows_upserted: Mapped[int] = mapped_column(nullable=False, server_default=text("0"))
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=text("'SUCCESS'")
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<SheetsSyncLog tab={self.sheet_tab!r} status={self.status!r}>"


# ──────────────────────────────────────────────────────────────────────
# AUDIT LOGS (Immutable — NEVER delete or update rows)
# ──────────────────────────────────────────────────────────────────────


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"), default=uuid.uuid4
    )
    entity_name: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    changed_by: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    old_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    new_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    ip_address = mapped_column(INET, nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=_tz_now
    )

    # ── Relationships ──
    user: Mapped["User"] = relationship(back_populates="audit_logs", lazy="selectin")

    def __repr__(self) -> str:
        return f"<AuditLog entity={self.entity_name!r} action={self.action!r}>"
