import asyncio
import os
import sys

# Add the parent directory to sys.path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import select
from app.core.db import async_session_factory
from app.models.models import Material, Supplier

async def seed_data():
    print("Seeding Master Data...")
    async with async_session_factory() as db:
        # Check if materials already exist
        m_result = await db.execute(select(Material))
        if not m_result.scalars().first():
            print("Adding Materials...")
            materials = [
                Material(name="Vanilla Extract", supplier_name="Global Aromatics Ltd.", unit="L", storage_condition="Standard"),
                Material(name="Lavender Oil", supplier_name="Essence of Nature", unit="L", storage_condition="Cool/Dry"),
                Material(name="Rose Oil", supplier_name="Global Aromatics Ltd.", unit="L", storage_condition="Standard"),
            ]
            db.add_all(materials)
        
        # Check if suppliers already exist
        s_result = await db.execute(select(Supplier))
        if not s_result.scalars().first():
            print("Adding Suppliers...")
            suppliers = [
                Supplier(company_name="Global Aromatics Ltd.", email="sales@global-aromatics.com"),
                Supplier(company_name="Essence of Nature", email="info@essence-nature.com"),
            ]
            db.add_all(suppliers)
        
        await db.commit()
    print("Master Data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
