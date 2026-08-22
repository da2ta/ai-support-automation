from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_token

router = APIRouter()

@router.get("/me")
def get_current_user(token_payload: dict = Depends(get_current_user_token)):
    return {
        "id": token_payload.get("sub"),
        "email": token_payload.get("email"),
        "role": token_payload.get("role", "viewer")
    }
