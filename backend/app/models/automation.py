from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.supabase import Base

def utc_now():
    return datetime.now(timezone.utc)

class AutomationAction(Base):
    __tablename__ = "automation_actions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ticket_id = Column(BigInteger, ForeignKey('tickets.id', ondelete='CASCADE'), nullable=False)
    action_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False)
    status = Column(String, default='pending', nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey('profiles.id', ondelete='SET NULL'), nullable=True)
