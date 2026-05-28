"""
JWT token creation, Argon2id password hashing, and OTP generation/verification.

Security rules (from CONTEXT.md §5.4):
  - ALWAYS use Argon2id. NEVER use bcrypt, MD5, SHA-1, or plain text.
  - Use secrets.compare_digest() for all token comparisons.
"""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Union

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import jwt

from app.core.config import settings

# ---------------------------------------------------------------------------
# Argon2id Hasher (configured per CONTEXT.md §5.4)
# ---------------------------------------------------------------------------

_ph = PasswordHasher(
    time_cost=settings.ARGON2_TIME_COST,
    memory_cost=settings.ARGON2_MEMORY_COST,
    parallelism=settings.ARGON2_PARALLELISM,
)


def get_password_hash(password: str) -> str:
    """Hash a plaintext password with Argon2id."""
    return _ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against an Argon2id hash (constant-time)."""
    try:
        return _ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False


# ---------------------------------------------------------------------------
# JWT Token Helpers
# ---------------------------------------------------------------------------


def create_access_token(
    subject: Union[str, Any],
    role: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token.

    Payload: { sub: user_id, role: user_role, exp: +15min }.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict[str, Any] = {"exp": expire, "sub": str(subject)}
    if role:
        to_encode["role"] = role
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT refresh token (7-day default)."""
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    return jwt.encode(
        {"exp": expire, "sub": str(subject), "type": "refresh"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


# ---------------------------------------------------------------------------
# OTP Helpers
# ---------------------------------------------------------------------------


def generate_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP code."""
    return "".join(secrets.choice("0123456789") for _ in range(length))


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Constant-time comparison of a plaintext OTP against its hash."""
    return secrets.compare_digest(plain_otp, hashed_otp)
