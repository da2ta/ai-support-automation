from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.ai_analysis import TicketCategory, TicketPriority, TicketSentiment, AIAnalysisResult


class TicketStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=128, description="Full name of customer")
    customer_email: str = Field(..., min_length=3, max_length=256, description="Email address of customer")
    subject: str = Field(..., min_length=3, max_length=256, description="Subject line of support message")
    message: str = Field(..., min_length=10, max_length=10000, description="Detailed support issue description")


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    agent_notes: Optional[str] = Field(None, max_length=5000)
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    suggested_response: Optional[str] = None


class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    customer_name: str
    customer_email: str
    subject: str
    message: str
    status: str
    
    # AI Insights
    category: str
    priority: str
    sentiment: str
    summary: str
    customer_intent: str
    suggested_action: str
    suggested_response: str
    confidence_score: float
    key_entities: list = Field(default_factory=list)
    
    # Notes & Timestamps
    agent_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class CategoryCount(BaseModel):
    category: str
    count: int
    percentage: float


class SentimentCount(BaseModel):
    sentiment: str
    count: int
    percentage: float


class PriorityCount(BaseModel):
    priority: str
    count: int
    percentage: float


class DashboardStats(BaseModel):
    total_tickets: int
    high_priority_tickets: int
    open_tickets: int
    resolved_tickets: int
    in_progress_tickets: int
    avg_confidence: float
    category_breakdown: List[CategoryCount]
    sentiment_breakdown: List[SentimentCount]
    priority_breakdown: List[PriorityCount]
    recent_tickets: List[TicketResponse]
