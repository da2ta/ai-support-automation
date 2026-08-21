from fastapi import APIRouter
from app.api.v1 import tickets, stats, auth, automation, health

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health.router, prefix="/health", tags=["Health Check"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
api_v1_router.include_router(stats.router, prefix="/stats", tags=["Dashboard"])
api_v1_router.include_router(automation.router, prefix="/automation", tags=["Automation"])
