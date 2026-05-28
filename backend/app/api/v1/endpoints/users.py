from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.app.api.v1 import deps
from backend.app.core.db import get_session
from backend.app.core.security import get_password_hash
from backend.app.models.models import User, UserRole
from backend.app.schemas.schemas import UserCreate, UserRead

router = APIRouter()

@router.post("/", response_model=UserRead)
def create_user(
    *,
    db: Session = Depends(get_session),
    user_in: UserCreate,
    current_user: User = Depends(deps.check_role([UserRole.SUPER_ADMIN]))
) -> Any:
    user = db.exec(select(User).where(User.username == user_in.username)).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    db_obj = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user
