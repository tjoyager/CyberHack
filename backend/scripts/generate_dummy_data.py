import sys
import os
import random
from datetime import datetime, timedelta
from uuid import uuid4
from faker import Faker
from sqlmodel import Session, create_engine, select

# Ensure the backend directory is in the path so we can import our models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.models import User, UserRole, Supplier, Material, Lot, LotStatus
from app.core.config import settings

fake = Faker()

# 1. Configuration
NUM_SUPPLIERS = 15
NUM_MATERIALS = 30
NUM_LOTS = 550

# Target Status Distribution
STATUS_DISTRIBUTION = {
    LotStatus.PENDING_QC: 0.15,
    LotStatus.APPROVED: 0.20,
    LotStatus.REJECTED: 0.05,
    LotStatus.IN_PRODUCTION: 0.40,
    LotStatus.CONSUMED: 0.20
}

# Industry Specific Names
EXTRACT_NAMES = [
    "Premium Vanilla Bean", "Patchouli Oil Extract", "Bergamot Essential Oil",
    "Sandalwood Mysore Grade", "Lavender Bulgaria Pure", "Cinnamon Bark Extract",
    "Jasmine Sambac Absolute", "Rose Damascena Oil", "Ylang Ylang Extra",
    "Peppermint Arvensis", "Lemon Peel Cold Pressed", "Sweet Orange Valencia",
    "Cedarwood Atlas Oil", "Frankincense Serrata", "Myrrh Resoid",
    "Geranium Egypt Oil", "Clary Sage Pure", "Vetiver Haiti Root",
    "Ginger CO2 Extract", "Cardamom Seed Oil"
]

STORAGE_CONDITIONS = [
    "Standard Dry (25°C)", "Cool Storage (15°C)", "Cold-chain (5°C)", 
    "Ultra-low Temp (-20°C)", "Amber Glass / No Light"
]

def generate_enterprise_data():
    engine = create_engine(settings.get_database_url)
    
    with Session(engine) as session:
        print("--- Starting Data Engineering Process ---")
        
        # 2. Setup Suppliers
        suppliers = []
        for _ in range(NUM_SUPPLIERS):
            s = Supplier(
                name=fake.company() + " " + random.choice(["Aromatics", "Extracts", "Distillery", "Oils"]),
                contact_email=fake.company_email(),
                is_active=True
            )
            session.add(s)
            suppliers.append(s)
        
        # 3. Setup Materials
        materials = []
        for i in range(NUM_MATERIALS):
            base_name = random.choice(EXTRACT_NAMES) if i < len(EXTRACT_NAMES) else fake.word().capitalize() + " Extract"
            m = Material(
                sku=f"MAT-{fake.unique.numerify('####')}",
                name=f"{base_name} {random.choice(['Batch A', 'Export Grade', 'Select', 'Prime'])}",
                uom="KG",
                storage_condition=random.choice(STORAGE_CONDITIONS),
                is_active=True
            )
            session.add(m)
            materials.append(m)
        
        session.commit() # Commit to get IDs
        print(f"Created {NUM_SUPPLIERS} Suppliers and {NUM_MATERIALS} Materials.")

        # 4. Generate Lots with State Machine Logic
        statuses = list(STATUS_DISTRIBUTION.keys())
        weights = list(STATUS_DISTRIBUTION.values())
        
        lots_created = 0
        for _ in range(NUM_LOTS):
            status = random.choices(statuses, weights=weights)[0]
            material = random.choice(materials)
            supplier = random.choice(suppliers)
            
            created_at = datetime.now() - timedelta(days=random.randint(0, 180))
            mfg_date = created_at - timedelta(days=random.randint(5, 30))
            exp_date = mfg_date + timedelta(days=random.randint(365, 730))
            
            qty = round(random.uniform(5.0, 1000.0), 2)
            
            # Remaining Qty Logic
            if status == LotStatus.CONSUMED:
                rem_qty = 0.0
            elif status == LotStatus.IN_PRODUCTION:
                rem_qty = round(qty * random.uniform(0.1, 0.7), 2)
            else:
                rem_qty = qty
            
            # Warehouse Slot Logic
            slot = None
            if status not in [LotStatus.REJECTED, LotStatus.PENDING_QC]:
                slot = f"ZONE-{random.choice(['A', 'B', 'C'])}-{random.randint(1, 50):02d}"
            elif status == LotStatus.PENDING_QC and random.random() > 0.5:
                slot = "INTAKE-STAGING"

            lot = Lot(
                lot_number=f"LOT-{created_at.strftime('%Y%m%d')}-{fake.unique.numerify('###')}",
                material_id=material.id,
                supplier_id=supplier.id,
                initial_quantity=qty,
                remaining_quantity=rem_qty,
                status=status,
                warehouse_slot=slot,
                expiry_date=exp_date,
                manufactured_date=mfg_date,
                qc_notes="Automated seed data." if status != LotStatus.REJECTED else "Rejected due to high moisture content.",
                created_at=created_at,
                updated_at=created_at + timedelta(hours=random.randint(1, 24))
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
        print("2. Set PYTHONPATH to 'backend' directory")
        print("3. Run: python3 backend/scripts/generate_dummy_data.py")
