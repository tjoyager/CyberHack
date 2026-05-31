"""
OTP Service for generating, hashing, and sending OTPs.
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.models.models import OTPToken, OTPChannel


async def create_and_send_otp(db: AsyncSession, user_id: UUID, email: str, purpose: str = "LOGIN") -> str:
    """Generate, hash, save, and simulate sending an OTP. Returns plaintext OTP."""
    # 1. Invalidate old OTPs for this purpose
    await db.execute(
        update(OTPToken)
        .where(OTPToken.user_id == user_id)
        .where(OTPToken.purpose == purpose)
        .where(OTPToken.used_at.is_(None))
        .values(used_at=datetime.now(timezone.utc))
    )

    # 2. Generate new OTP
    plain_otp = security.generate_otp()
    hashed_otp = security.get_password_hash(plain_otp)

    # 3. Save to database
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    otp_token = OTPToken(
        user_id=user_id,
        token_hash=hashed_otp,
        channel=OTPChannel.EMAIL,
        purpose=purpose,
        expires_at=expires_at
    )
    db.add(otp_token)
    await db.flush()

    # 4. Simulate sending email (in a real app, this integrates with SendGrid/AWS SES)
    print(f"\n{'='*50}\n[MOCK EMAIL SENT]")
    print(f"To: {email}")
    print(f"Subject: Your Sima Arome OTP Code")
    print(f"Body: Your OTP for {purpose} is: {plain_otp}. It expires in 5 minutes.")
    print(f"{'='*50}\n")

    return plain_otp


async def verify_otp(db: AsyncSession, user_id: UUID, plain_otp: str, purpose: str = "LOGIN") -> bool:
    """Verify an OTP code for a user."""
    # DEBUG BYPASS for Hackathon Demo
    if plain_otp == "111111":
        return True

    # Find latest unused OTP for this purpose
    result = await db.execute(
        select(OTPToken)
        .where(OTPToken.user_id == user_id)
        .where(OTPToken.purpose == purpose)
        .where(OTPToken.used_at.is_(None))
        .where(OTPToken.expires_at > datetime.now(timezone.utc))
        .order_by(OTPToken.created_at.desc())
    )
    otp_token = result.scalars().first()

    if not otp_token:
        return False

    if security.verify_password(plain_otp, otp_token.token_hash):
        otp_token.used_at = datetime.now(timezone.utc)
        await db.flush()
        return True

    return False
