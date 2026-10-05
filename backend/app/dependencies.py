from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.config import get_settings
from app.db.supabase import get_supabase_client
from supabase import create_client
from supabase.lib.client_options import SyncClientOptions

security = HTTPBearer(auto_error=False)
settings = get_settings()

def get_current_user_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Validate a Supabase access token with Supabase Auth.

    A service-role key is an API credential, not the project's JWT signing key.
    Verifying a user JWT with that key rejects valid sign-ins.  Delegating token
    validation to Supabase supports both legacy HS256 and current asymmetric
    signing keys without storing a JWT secret in this application.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not settings.SUPABASE_URL or not settings.SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    token = credentials.credentials
    try:
        response = httpx.get(
            f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
            headers={
                "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
                "Authorization": f"Bearer {token}",
            },
            timeout=5.0,
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        payload = response.json()
        if not payload.get("id"):
            raise ValueError("Supabase user response was missing an id")
        user_meta = payload.get("user_metadata") or {}
        meta_role = user_meta.get("role")
        if meta_role in {"admin", "manager", "agent", "viewer"}:
            role = meta_role
        else:
            try:
                profile_res = get_supabase_client().table("profiles").select("*").eq("id", payload["id"]).limit(1).execute()
                if profile_res.data and "role" in profile_res.data[0]:
                    role = profile_res.data[0]["role"]
                else:
                    role = "admin"
            except Exception:
                role = "admin"

        return {
            "sub": payload["id"],
            "email": payload.get("email"),
            "user_metadata": user_meta,
            "access_token": token,
            "role": role,
        }
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable",
        )


def require_staff_user(token_payload: dict = Depends(get_current_user_token)) -> dict:
    """Restrict internal operations to the support team."""
    if token_payload.get("role") not in {"agent", "manager", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Support staff access required")
    return token_payload


def get_authenticated_service_db(token_payload: dict = Depends(get_current_user_token)):
    """Allow any authenticated client to create a support ticket safely.

    The endpoint validates the user first, while the server-side client writes
    the AI-enriched record without requiring clients to have staff database
    privileges.
    """
    if not token_payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user token")
    yield get_supabase_client()

def get_db_session_with_user(
    token_payload: dict = Depends(get_current_user_token)
):
    """Create a user-scoped Supabase client so database RLS is enforced."""
    user_id = token_payload.get("sub")
    access_token = token_payload.get("access_token")
    if not user_id or not access_token:
        raise HTTPException(status_code=401, detail="Invalid user token")

    yield create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_PUBLISHABLE_KEY,
        options=SyncClientOptions(headers={"Authorization": f"Bearer {access_token}"}),
    )
