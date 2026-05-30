"""
FastAPI dependencies for authentication and role-based access control.

All dependencies are async to work with the async SQLAlchemy session.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """Decode JWT and return the authenticated User, or raise 401/403."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        token_data = TokenPayload(**payload)
    except (JWTError, Exception):
        raise credentials_exception

    try:
        user_id = UUID(token_data.sub)
    except (ValueError, AttributeError):
        raise credentials_exception

    from app.crud import crud_user
    user = await crud_user.get_user(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user.")
        
    # Explicitly set the PostgreSQL session variable for Audit triggers
    # We only run this if not using SQLite (which is used in tests)
    if db.bind.dialect.name == "postgresql":
        from sqlalchemy import text
        await db.execute(text("SELECT set_config('app.current_user_id', :user_id, true)"), {"user_id": str(user.id)})
    
    return user


def check_role(roles: list[UserRole]):
    """Return a dependency that enforces role-based access.

    SUPER_ADMIN always passes.
    """

    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if (
            current_user.role not in roles
            and current_user.role != UserRole.SUPER_ADMIN
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: requires role {', '.join(r.value for r in roles)}.",
            )
        return current_user

    return role_checker
