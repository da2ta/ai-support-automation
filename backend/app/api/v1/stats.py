from fastapi import APIRouter, Depends
from supabase import Client
from app.schemas.ticket import DashboardStats
from app.services.ticket_service import get_dashboard_stats
from app.dependencies import get_db_session_with_user, require_staff_user

router = APIRouter()

@router.get("", response_model=DashboardStats)
def get_stats(
    db: Client = Depends(get_db_session_with_user),
    _: dict = Depends(require_staff_user),
):
    """Get aggregated metrics for the dashboard."""
    return get_dashboard_stats(db)
