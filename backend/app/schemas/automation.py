from datetime import datetime
from typing import Optional
from pydantic import BaseModel, UUID4

class AutomationActionBase(BaseModel):
    ticket_id: int
    action_type: str
    title: str
    description: str
    priority: str

class AutomationActionCreate(AutomationActionBase):
    pass

class AutomationActionUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[UUID4] = None

class AutomationActionResponse(AutomationActionBase):
    id: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    assigned_to: Optional[UUID4] = None

    model_config = {
        "from_attributes": True
    }
