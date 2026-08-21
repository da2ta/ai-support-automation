import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db.supabase import SessionLocal
from app.api.v1 import api_v1_router
from app.services.gemini_service import get_gemini_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_support")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up AI Support Ticket Automation API...")
    
    # Check DB connection
    db = SessionLocal()
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        logger.info("Connected to Supabase PostgreSQL.")
    except Exception as e:
        logger.error(f"Failed to connect to Database: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown
    logger.info("Shutting down AI Support Ticket Automation API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AI Support Ticket Automation powered by Gemini API, FastAPI, and Supabase.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred while processing your request."}
    )

# The health check is now moved to api.v1.health 

# Include API v1 router
app.include_router(api_v1_router)
