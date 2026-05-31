import asyncio
import os
import sys

# Add the parent directory to sys.path to allow importing app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import select, update
from app.core.db import async_session_factory
from app.models.models import User
from app.core.security import get_password_hash

async def fix_passwords():
    print("Fixing user passwords to Argon2id...")
    async with async_session_factory() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        if not users:
            print("No users found in database.")
            return
        for user in users:
            # Set password to 'admin123' for all demo users during this fix
            new_hash = get_password_hash("admin123")
            print(f"Updating user: {user.username}")
            await db.execute(
                update(User)
                .where(User.id == user.id)
                .values(password_hash=new_hash)
            )
        await db.commit()
    print("All passwords updated successfully! All users now have password: admin123")

if __name__ == "__main__":
    asyncio.run(fix_passwords())
