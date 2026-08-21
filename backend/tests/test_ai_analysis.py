import pytest
from pydantic import ValidationError

from app.schemas.ai_analysis import (
    AIAnalysisResult,
    TicketCategory,
    TicketPriority,
    TicketSentiment,
)
from app.services.gemini_service import GeminiService


def test_ai_analysis_result_valid():
    """Test that valid analysis data parses successfully into AIAnalysisResult."""
    data = {
        "category": "Technical Issue",
        "priority": "High",
        "sentiment": "Frustrated",
        "summary": "Customer encountered a 500 internal server error during checkout.",
        "customer_intent": "Restore access to checkout and process customer order.",
        "suggested_action": "Check server logs for error code 500 and verify database connectivity.",
        "suggested_response": "Hi John, We apologize for the trouble with the checkout. Our engineering team is currently fixing the issue.",
        "confidence_score": 0.98,
        "key_entities": ["Error: 500", "Checkout API"]
    }
    result = AIAnalysisResult.model_validate(data)
    assert result.category == TicketCategory.TECHNICAL_ISSUE
    assert result.priority == TicketPriority.HIGH
    assert result.sentiment == TicketSentiment.FRUSTRATED
    assert "500" in result.summary
    assert len(result.key_entities) == 2


def test_ai_analysis_result_missing_required_fields():
    """Test that missing required fields raise a Pydantic ValidationError."""
    data = {
        "category": "Billing & Payments",
        # missing priority, sentiment, summary, intent, action, response
    }
    with pytest.raises(ValidationError):
        AIAnalysisResult.model_validate(data)


def test_ai_analysis_result_invalid_enum_value():
    """Test that invalid enum categories/priorities raise validation errors."""
    data = {
        "category": "NotARealCategory",
        "priority": "ExtremeUrgent",
        "sentiment": "Sad",
        "summary": "Valid summary description.",
        "customer_intent": "Valid customer intent.",
        "suggested_action": "Valid action step.",
        "suggested_response": "Valid response template text.",
    }
    with pytest.raises(ValidationError):
        AIAnalysisResult.model_validate(data)


def test_gemini_fallback_analyzer_billing():
    """Test heuristic analysis for a billing issue."""
    service = GeminiService()
    result = service._fallback_analyzer(
        customer_name="Alice Smith",
        subject="Refund request for invoice #INV-49281",
        message="I was charged twice on my card for invoice #INV-49281. Please issue a refund immediately."
    )
    assert result.category == TicketCategory.BILLING_PAYMENTS
    assert result.priority in [TicketPriority.HIGH, TicketPriority.CRITICAL]
    assert len(result.suggested_response) > 20
    assert "Alice Smith" in result.suggested_response
    assert any("49281" in ent for ent in result.key_entities)


def test_gemini_fallback_analyzer_outage():
    """Test heuristic analysis for a critical technical outage."""
    service = GeminiService()
    result = service._fallback_analyzer(
        customer_name="Bob Miller",
        subject="URGENT: Entire production server down 500 error",
        message="Our whole app is down with error 500! Production is down and we are losing customers. Emergency ASAP!"
    )
    assert result.category == TicketCategory.TECHNICAL_ISSUE
    assert result.priority == TicketPriority.CRITICAL
    assert result.sentiment in [TicketSentiment.URGENT, TicketSentiment.ANGRY, TicketSentiment.FRUSTRATED]


def test_gemini_fallback_analyzer_account_access():
    """Test heuristic analysis for an account lockout."""
    service = GeminiService()
    result = service._fallback_analyzer(
        customer_name="Charlie Chen",
        subject="Locked out of account - reset password and 2fa",
        message="Hello, I forgot my credentials and lost my 2FA phone. I am locked out of my account."
    )
    assert result.category == TicketCategory.ACCOUNT_ACCESS
    assert "2FA" in result.suggested_action or "credentials" in result.suggested_action
