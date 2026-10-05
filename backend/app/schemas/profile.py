from datetime import datetime
from typing import Optional
from pydantic import BaseModel, UUID4

class ProfileResponse(BaseModel):
    id: UUID4
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
