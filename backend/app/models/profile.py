from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.supabase import Base

def utc_now():
    return datetime.now(timezone.utc)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    role = Column(String, nullable=False, default='viewer')
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
