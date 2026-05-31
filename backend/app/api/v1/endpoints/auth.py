"""
Auth endpoints: Login with OTP flow.
"""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.core.db import get_db
from app.models.models import User
from app.schemas.schemas import Token, OTPVerify, UserCreate, OTPResend
from app.services import otp_service
from app.crud import crud_user

router = APIRouter()

@router.post("/login")
async def login_request_otp(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
    website: str | None = Form(None),
) -> Any:
    """Step 1: Authenticate with username/password and send OTP."""
    if website:
        # Honeypot triggered
        return {"status": "otp_sent", "email": "hidden", "message": "OTP sent to your email."}

    user = await crud_user.get_user_by_username_or_email(db, form_data.username)

    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user.")

    # Generate and send OTP
    plain_otp = await otp_service.create_and_send_otp(db, user.id, user.email, purpose="LOGIN")
    await db.commit()

    response: dict = {"status": "otp_sent", "email": user.email, "message": "OTP sent to your email."}
    if settings.APP_ENV != "production":
        response["dev_otp"] = plain_otp
    return response


@router.post("/verify-otp", response_model=Token)
async def verify_otp_and_login(
    payload: OTPVerify,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Step 2: Verify OTP and return a JWT."""
    user = await crud_user.get_user_by_username_or_email(db, payload.username)
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")

    is_valid = await otp_service.verify_otp(db, user.id, payload.otp_code, payload.purpose)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    if payload.purpose == "REGISTRATION":
        user.is_verified = True
        
    user.last_login_at = security.datetime.now(security.timezone.utc)
    await db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            subject=user.id,
            role=user.role.value,
            expires_delta=access_token_expires,
        ),
        "token_type": "bearer",
        "role": user.role.value,
        "username": user.username,
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Register a new user and send verification OTP."""
    if user_in.website:
        # Honeypot triggered
        return {"message": "Verification code sent to your email."}

    user = await crud_user.get_user_by_username_or_email(db, user_in.username)
    if user:
        raise HTTPException(status_code=400, detail="Username already registered.")
    
    user = await crud_user.get_user_by_username_or_email(db, user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = await crud_user.create_user(db, user_in)
    
    await otp_service.create_and_send_otp(db, new_user.id, new_user.email, purpose="REGISTRATION")
    await db.commit()

    return {"message": "Verification code sent to your email."}


@router.post("/resend-otp")
async def resend_otp(
    payload: OTPResend,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Resend OTP to the user's email or WhatsApp."""
    if payload.website:
        # Honeypot triggered
        return {"message": "New verification code sent."}

    user = await crud_user.get_user_by_username_or_email(db, payload.username)
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")

    purpose = "LOGIN" if user.is_verified else "REGISTRATION"
    await otp_service.create_and_send_otp(db, user.id, user.email, purpose=purpose)
    await db.commit()

    return {"message": "New verification code sent."}
