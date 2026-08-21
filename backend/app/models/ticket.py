from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, String, Text, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from app.db.supabase import Base


def utc_now():
    return datetime.now(timezone.utc)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    ticket_number = Column(String(32), unique=True, index=True, nullable=False)
    
    # Customer Details
    customer_name = Column(String(128), nullable=False)
    customer_email = Column(String(256), index=True, nullable=False)
    subject = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    
    # Status Workflow
    status = Column(String(32), index=True, default="Open", nullable=False)
    
    # AI Extracted Fields
    category = Column(String(64), index=True, nullable=False)
    priority = Column(String(32), index=True, nullable=False)
    sentiment = Column(String(32), index=True, nullable=False)
    summary = Column(Text, nullable=False)
    customer_intent = Column(Text, nullable=False)
    suggested_action = Column(Text, nullable=False)
    suggested_response = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.95, nullable=False)
    key_entities = Column(JSONB, default=[], nullable=False)
    
    # Agent Collaboration
    agent_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
