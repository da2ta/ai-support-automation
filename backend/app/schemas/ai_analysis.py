from enum import Enum
from typing import List, Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field


class TicketCategory(str, Enum):
    TECHNICAL_ISSUE = "Technical Issue"
    BILLING_PAYMENTS = "Billing & Payments"
    ACCOUNT_ACCESS = "Account Access"
    FEATURE_REQUEST = "Feature Request"
    PRODUCT_INQUIRY = "Product Inquiry"
    BUG_REPORT = "Bug Report"
    GENERAL_FEEDBACK = "General Feedback"
    OTHER = "Other"


class TicketPriority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class TicketSentiment(str, Enum):
    POSITIVE = "Positive"
    NEUTRAL = "Neutral"
    FRUSTRATED = "Frustrated"
    ANGRY = "Angry"
    URGENT = "Urgent"


class AIAnalysisResult(BaseModel):
    """
    Structured output extracted by the Gemini AI model from customer support messages.
    """
    category: TicketCategory = Field(
        ...,
        description="The primary classification of the customer support inquiry."
    )
    priority: TicketPriority = Field(
        ...,
        description="Urgency level assessed from message tone, business impact, and content."
    )
    sentiment: TicketSentiment = Field(
        ...,
        description="Customer emotional sentiment detected in the message."
    )
    summary: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Concise 1-2 sentence summary capturing the essence of the problem or request."
    )
    customer_intent: str = Field(
        ...,
        min_length=3,
        max_length=300,
        description="Explicit description of what the customer is trying to accomplish or expects."
    )
    suggested_action: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Recommended actionable next steps for the support agent or automated workflow."
    )
    suggested_response: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Empathetic, clear, and professional response template ready to send to the customer."
    )
    confidence_score: float = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
        description="Model confidence level in the categorization and extraction (0.0 to 1.0)."
    )
    key_entities: List[str] = Field(
        default_factory=list,
        description="Relevant extracted entities (e.g. error codes, product names, transaction IDs, URLs)."
    )
