"""
Generate realistic dummy/demo data for Sima Arome ERP Lite.

Usage:
    cd backend
    python -m scripts.generate_dummy_data

Requires a running PostgreSQL instance and the DATABASE_URL env var.
Uses synchronous SQLAlchemy since this is a standalone CLI script.
"""

import os
import random
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

from faker import Faker
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

# Ensure the backend directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.models import (
    AuditLog,
    DeliveryOrder,
    Lot,
    LotStatus,
    Material,
    QCCheck,
    Supplier,
    User,
    UserRole,
)

fake = Faker()

# ──────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────

NUM_SUPPLIERS = 15
NUM_MATERIALS = 30
NUM_LOTS = 550

STATUS_DISTRIBUTION = {
    LotStatus.PENDING_QC: 0.15,
    LotStatus.APPROVED: 0.20,
    LotStatus.REJECTED: 0.05,
    LotStatus.IN_PRODUCTION: 0.40,
    LotStatus.DELIVERED: 0.20,
}

EXTRACT_NAMES = [
    "Premium Vanilla Bean", "Patchouli Oil Extract", "Bergamot Essential Oil",
    "Sandalwood Mysore Grade", "Lavender Bulgaria Pure", "Cinnamon Bark Extract",
    "Jasmine Sambac Absolute", "Rose Damascena Oil", "Ylang Ylang Extra",
    "Peppermint Arvensis", "Lemon Peel Cold Pressed", "Sweet Orange Valencia",
    "Cedarwood Atlas Oil", "Frankincense Serrata", "Myrrh Resoid",
    "Geranium Egypt Oil", "Clary Sage Pure", "Vetiver Haiti Root",
    "Ginger CO2 Extract", "Cardamom Seed Oil",
]

STORAGE_CONDITIONS = [
    "Standard Dry (25°C)", "Cool Storage (15°C)", "Cold-chain (5°C)",
    "Ultra-low Temp (-20°C)", "Amber Glass / No Light",
]


def generate_enterprise_data():
    """Generate all demo data in a single synchronous session."""
    engine = create_engine(settings.sync_database_url)

    with Session(engine) as session:
        print("--- Starting Data Engineering Process ---")

        # ── Admin user ───────────────────────────────────────────────
        admin = User(
            username="admin",
            email="admin@simaarome.id",
            phone_number="+6281000000001",
            password_hash=get_password_hash("Admin@2026"),
            role=UserRole.SUPER_ADMIN,
            is_verified=True,
            is_active=True,
        )
        session.add(admin)
        session.flush()
        print("Created admin user (admin / Admin@2026)")

        # ── Suppliers ────────────────────────────────────────────────
        suppliers: list[Supplier] = []
        for _ in range(NUM_SUPPLIERS):
            s = Supplier(
                company_name=(
                    fake.company()
                    + " "
                    + random.choice(["Aromatics", "Extracts", "Distillery", "Oils"])
                ),
                contact_person=fake.name(),
                phone=fake.phone_number()[:20],
                email=fake.company_email(),
                address=fake.address(),
            )
            session.add(s)
            suppliers.append(s)

        # ── Materials ────────────────────────────────────────────────
        materials: list[Material] = []
        for i in range(NUM_MATERIALS):
            base_name = (
                EXTRACT_NAMES[i] if i < len(EXTRACT_NAMES) else fake.word().capitalize() + " Extract"
            )
            m = Material(
                name=f"{base_name} {random.choice(['Batch A', 'Export Grade', 'Select', 'Prime'])}",
                supplier_name=random.choice(suppliers).company_name if suppliers else None,
                storage_condition=random.choice(STORAGE_CONDITIONS),
                unit=random.choice(["kg", "liter", "pcs"]),
            )
            session.add(m)
            materials.append(m)

        session.flush()  # Get IDs
        print(f"Created {NUM_SUPPLIERS} Suppliers and {NUM_MATERIALS} Materials.")

        # ── Lots ─────────────────────────────────────────────────────
        statuses = list(STATUS_DISTRIBUTION.keys())
        weights = list(STATUS_DISTRIBUTION.values())

        lots_created = 0
        for _ in range(NUM_LOTS):
            lot_status = random.choices(statuses, weights=weights)[0]
            material = random.choice(materials)
            supplier = random.choice(suppliers)

            created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 180))
            qty = Decimal(str(round(random.uniform(5.0, 1000.0), 3)))

            # Warehouse slot logic
            slot = None
            if lot_status not in (LotStatus.REJECTED, LotStatus.PENDING_QC):
                slot = f"RACK-{random.choice(['A', 'B', 'C'])}{random.randint(1, 5)}-{random.randint(1, 50):02d}"
            elif lot_status == LotStatus.PENDING_QC and random.random() > 0.5:
                slot = "INTAKE-STAGING"

            lot = Lot(
                lot_number=f"LOT-{created_at.strftime('%Y%m%d')}-{fake.unique.numerify('###')}",
                material_id=material.id,
                supplier_id=supplier.id,
                quantity_kg=qty,
                status=lot_status,
                warehouse_slot=slot,
                qc_notes=(
                    "Automated seed data."
                    if lot_status != LotStatus.REJECTED
                    else "Rejected due to high moisture content."
                ),
                rejection_reason=(
                    "High moisture content exceeds threshold."
                    if lot_status == LotStatus.REJECTED
                    else None
                ),
                created_by=admin.id,
                created_at=created_at,
                updated_at=created_at + timedelta(hours=random.randint(1, 24)),
            )
            session.add(lot)
            lots_created += 1

            if lots_created % 100 == 0:
                print(f"Generated {lots_created} lots...")

        session.commit()
        print(f"--- SUCCESS: Generated {lots_created} Transactional Lots ---")


if __name__ == "__main__":
    try:
        generate_enterprise_data()
    except Exception as e:
        print(f"ERROR during data generation: {e}")
        print("\nSETUP INSTRUCTIONS:")
        print("1. Ensure PostgreSQL is running (docker-compose up db)")
        print("2. cd backend")
        print("3. Run: python -m scripts.generate_dummy_data")
