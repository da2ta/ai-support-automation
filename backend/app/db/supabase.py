from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.SUPABASE_DB_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Provide a Supabase admin client for operations that need it (e.g., verifying tokens if needed)
def get_supabase_client() -> Client:
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SECRET_KEY
    )
