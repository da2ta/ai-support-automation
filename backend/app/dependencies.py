from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from jose import jwt, JWTError
from app.db.supabase import get_db
from app.config import get_settings

security = HTTPBearer()
settings = get_settings()

def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        # We assume Supabase uses RS256 or HS256. 
        # For a full production implementation, you'd fetch the JWT secret from Supabase config.
        # Supabase signs with HS256 using the JWT Secret by default.
        payload = jwt.decode(
            token,
            settings.SUPABASE_SECRET_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_db_session_with_user(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_user_token)
):
    """
    Sets the Supabase JWT claims in the PostgreSQL session context 
    so that Row Level Security (RLS) policies can evaluate the user properly.
    """
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user token")
        
    try:
        # Set the role and request.jwt.claim.sub for Supabase RLS
        # Supabase RLS uses current_setting('request.jwt.claim.sub')
        db.execute(text(f"set local role authenticated;"))
        db.execute(text(f"set local request.jwt.claim.sub = '{user_id}';"))
        # You could also set other claims if needed by your RLS policies
        yield db
    finally:
        # Reset local settings for connection pool safety
        db.execute(text("reset role;"))
        db.execute(text("reset request.jwt.claim.sub;"))
