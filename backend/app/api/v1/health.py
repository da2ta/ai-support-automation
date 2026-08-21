from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.supabase import get_db
from app.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Backend health check endpoint."""
    health_status = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "database": "disconnected",
        "ai": "configured" if settings.GEMINI_API_KEY else "fallback_mode"
    }
    
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = f"error: {str(e)}"
        
    return health_status
