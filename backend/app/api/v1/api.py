from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, materials, lots, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(lots.router, prefix="/lots", tags=["lots"])
