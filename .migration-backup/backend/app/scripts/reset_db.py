import asyncio
import os
import sys

# Add the parent directory to sys.path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from app.core.db import engine, Base
from app.models.models import User, UserRole, LotStatus, OTPChannel
from app.core.security import get_password_hash

async def reset_db():
    print("Resetting database to match CONTEXT.md schema...")
    async with engine.begin() as conn:
        # Enable UUID extension
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'))
        
        # Drop all tables and enums (cascade)
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        # Drop enums manually
        print("Dropping custom types...")
        await conn.execute(text("DROP TYPE IF EXISTS user_role CASCADE;"))
        await conn.execute(text("DROP TYPE IF EXISTS lot_status CASCADE;"))
        await conn.execute(text("DROP TYPE IF EXISTS otp_channel CASCADE;"))
        await conn.execute(text("DROP TYPE IF EXISTS otp_purpose CASCADE;"))

        # Create enums manually to match models.py names
        print("Creating custom types...")
        await conn.execute(text("CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'INTAKE_STAFF', 'QC_INSPECTOR', 'PPIC_MANAGER', 'SUPPLIER', 'DELIVERY_STAFF');"))
        await conn.execute(text("CREATE TYPE lot_status AS ENUM ('PENDING_QC', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'CONSUMED', 'EXPIRED', 'DELIVERED');"))
        await conn.execute(text("CREATE TYPE otp_channel AS ENUM ('EMAIL', 'WHATSAPP');"))

        print("Creating new tables...")
        await conn.run_sync(Base.metadata.create_all)

    print("Seeding initial admin user...")
    from app.core.db import async_session_factory
    async with async_session_factory() as db:
        admin = User(
            username="admin",
            email="admin@simaarome.id",
            password_hash=get_password_hash("admin123"),
            role=UserRole.SUPER_ADMIN,
            is_verified=True,
            is_active=True
        )
        db.add(admin)
        await db.commit()
    
    print("Database reset and seeded successfully!")
    print("Login: admin / admin123")

if __name__ == "__main__":
    asyncio.run(reset_db())
