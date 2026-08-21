from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.ticket import DashboardStats
from app.services.ticket_service import get_dashboard_stats
from app.dependencies import get_db_session_with_user

router = APIRouter()

@router.get("", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db_session_with_user)):
    """Get aggregated metrics for the dashboard."""
    return get_dashboard_stats(db)
