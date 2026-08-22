from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

def get_supabase_client() -> Client:
    """Returns a Supabase client using the Service Role Key for admin operations."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SECRET_KEY:
        raise RuntimeError("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.")
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SECRET_KEY
    )

def get_db():
    """Dependency that provides a Supabase client."""
    client = get_supabase_client()
    yield client
