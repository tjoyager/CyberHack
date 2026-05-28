from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.app.api.v1 import deps
from backend.app.core.db import get_session
from backend.app.models.models import Material, User, UserRole
from backend.app.schemas.schemas import MaterialCreate, MaterialRead

router = APIRouter()

@router.get("/", response_model=List[MaterialRead])
def read_materials(
    db: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    materials = db.exec(select(Material).offset(skip).limit(limit)).all()
    return materials

@router.post("/", response_model=MaterialRead)
def create_material(
    *,
    db: Session = Depends(get_session),
    material_in: MaterialCreate,
    current_user: User = Depends(deps.check_role([UserRole.SUPER_ADMIN, UserRole.PPIC_MANAGER]))
) -> Any:
    db_obj = Material.model_validate(material_in)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
