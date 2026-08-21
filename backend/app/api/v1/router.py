from fastapi import APIRouter
from app.api.v1.tickets import router as tickets_router
from app.api.v1.stats import router as stats_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(tickets_router)
api_v1_router.include_router(stats_router)
