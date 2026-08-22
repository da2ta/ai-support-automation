from fastapi import APIRouter
from app.db.supabase import get_supabase_client
from app.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("")
def health_check():
    """Backend health check endpoint."""
    health_status = {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "app_name": settings.APP_NAME,
        "database": "disconnected",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY.strip()),
        "gemini_model": settings.GEMINI_MODEL,
    }
    
    try:
        db = get_supabase_client()
        # Verify that the client can be initialized.  This avoids a database
        # query on a public health endpoint while still reporting bad config.
        _ = db.options
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = f"error: {str(e)}"
        
    return health_status
