from fastapi import APIRouter
from app.api.v1.endpoints import auth, materials, lots, users, suppliers, delivery_orders, analytics

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(lots.router, prefix="/lots", tags=["lots"])
api_router.include_router(delivery_orders.router, prefix="/delivery-orders", tags=["delivery-orders"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
