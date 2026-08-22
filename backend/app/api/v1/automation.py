from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.schemas.automation import AutomationActionResponse, AutomationActionUpdate
from app.services.automation_service import get_automation_actions, update_action_status
from app.dependencies import get_db_session_with_user, get_current_user_token, require_staff_user

router = APIRouter()

@router.get("/actions", response_model=List[AutomationActionResponse])
def fetch_actions(
    status: Optional[str] = Query(None),
    db: Client = Depends(get_db_session_with_user),
    _: dict = Depends(require_staff_user),
):
    return get_automation_actions(db, status)

@router.patch("/actions/{action_id}", response_model=AutomationActionResponse)
def update_action(
    action_id: int,
    update_data: AutomationActionUpdate,
    db: Client = Depends(get_db_session_with_user),
    token_payload: dict = Depends(get_current_user_token),
    _: dict = Depends(require_staff_user),
):
    action = update_action_status(
        db, 
        action_id, 
        status=update_data.status, 
        assigned_to=update_data.assigned_to or token_payload.get("sub")
    )
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action
