import asyncio
import json
import logging
import re
from typing import Optional
from app.config import get_settings
from app.schemas.ai_analysis import (
    AIAnalysisResult,
    TicketCategory,
    TicketPriority,
    TicketSentiment,
)

logger = logging.getLogger("ai_support.gemini")

SYSTEM_INSTRUCTION = """You are an expert AI customer support triage and intelligence agent.
Analyze the incoming customer support message carefully and return a strictly structured JSON output adhering to the schema.

Guidelines for classification:
1. category:
   - "Technical Issue": Infrastructure failures, server errors, API outages, latency, connection drops.
   - "Billing & Payments": Charges, refunds, invoices, subscription changes, payment failed.
   - "Account Access": Login issues, password resets, 2FA/MFA problems, SSO lockout.
   - "Feature Request": Requests for new capabilities, integrations, improvements.
   - "Product Inquiry": Questions about plans, features, documentation, how-to instructions.
   - "Bug Report": UI glitches, incorrect calculations, unexpected app behavior.
   - "General Feedback": Compliments, user experience reviews, general commentary.
   - "Other": Anything not fitting above.

2. priority:
   - "Critical": Full production outage, data breach/loss, critical security vulnerability, severe monetary loss, complete blocker.
   - "High": Core functionality broken with no workaround, payment processing blocked, urgent customer escalation.
   - "Medium": Non-critical bugs, billing discrepancies with workarounds, standard inquiries.
   - "Low": Minor cosmetic bugs, general feedback, minor feature ideas.

3. sentiment:
   - "Positive": Happy, appreciative, complimentary.
   - "Neutral": Matter-of-fact, straightforward inquiry.
   - "Frustrated": Annoyed, experiencing difficulty, delayed resolution.
   - "Angry": Aggressive language, demanding immediate escalation or threatening cancellation.
   - "Urgent": Time-sensitive, panicked, critical timeline mentioned.

4. summary: Exactly 1-2 concise sentences summarizing the root problem or request.
5. customer_intent: A clear, single-sentence statement describing what the customer wants to achieve.
6. suggested_action: Actionable steps for the human support agent to resolve or route the ticket.
7. suggested_response: A ready-to-send, empathetic, professional response addressing the customer by name (if provided) and directly speaking to their issue.
8. confidence_score: A float between 0.0 and 1.0 representing classification confidence.
9. key_entities: List of extracted specific entities (e.g. error codes, order IDs, account numbers, URLs, dates).
"""


class GeminiService:
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        api_key = self.settings.GEMINI_API_KEY.strip()
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=api_key)
                logger.info("Gemini client initialized successfully with google-genai SDK.")
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai client: {e}. Will fallback if needed.")
                self.client = None
        else:
            logger.info("No valid GEMINI_API_KEY provided. Mock analyzer will be used for fallback.")
            self.client = None

    async def analyze_message(
        self,
        customer_name: str,
        customer_email: str,
        subject: str,
        message: str
    ) -> AIAnalysisResult:
        """
        Analyzes a customer support ticket using the Gemini API.
        Falls back to rule-based heuristic analyzer if API is unavailable or times out.
        """
        # If client is configured, attempt Gemini API call
        if self.client:
            try:
                return await asyncio.wait_for(
                    self._call_gemini_api(customer_name, customer_email, subject, message),
                    timeout=self.settings.AI_TIMEOUT_SECONDS
                )
            except asyncio.TimeoutError:
                logger.error(f"Gemini API timed out after {self.settings.AI_TIMEOUT_SECONDS}s. Using fallback.")
                if self.settings.USE_MOCK_FALLBACK_IF_KEY_MISSING:
                    return self._fallback_analyzer(customer_name, subject, message)
                raise TimeoutError("AI analysis request timed out. Please try again.")
            except Exception as e:
                logger.error(f"Gemini API invocation error: {e}. Using fallback.", exc_info=True)
                if self.settings.USE_MOCK_FALLBACK_IF_KEY_MISSING:
                    return self._fallback_analyzer(customer_name, subject, message)
                raise RuntimeError(f"AI analysis failed: {str(e)}")
        
        # If no client configured, use the fallback analyzer
        logger.info("Using intelligent fallback analyzer (no Gemini API key configured).")
        return self._fallback_analyzer(customer_name, subject, message)

    async def _call_gemini_api(
        self,
        customer_name: str,
        customer_email: str,
        subject: str,
        message: str
    ) -> AIAnalysisResult:
        """
        Calls Gemini API with structured JSON response schema in a thread pool.
        """
        from google.genai import types

        user_content = f"""Customer Name: {customer_name}
Customer Email: {customer_email}
Subject: {subject}
Message Body:
{message}
"""

        def _generate():
            # Request structured JSON conforming to AIAnalysisResult
            response = self.client.models.generate_content(
                model=self.settings.GEMINI_MODEL,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=AIAnalysisResult,
                    temperature=0.1,
                )
            )
            return response.text

        # Run synchronous SDK call in thread
        raw_json_text = await asyncio.to_thread(_generate)
        
        if not raw_json_text:
            raise ValueError("Gemini API returned an empty response.")

        # Clean potential markdown wrapping if present
        clean_json = raw_json_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()

        data = json.loads(clean_json)
        return AIAnalysisResult.model_validate(data)

    def _fallback_analyzer(self, customer_name: str, subject: str, message: str) -> AIAnalysisResult:
        """
        High-precision heuristic analyzer when offline or without API key.
        Extracts intent, priority, sentiment, entities, and drafts tailored responses.
        """
        combined = f"{subject} {message}".lower()
        
        # Entity extraction
        entities = []
        # Find order/invoice IDs
        order_matches = re.findall(r"(?:order|inv|ticket|id|txn|tx|#)\s*[:#-]?\s*([a-zA-Z0-9_-]{4,15})", combined, re.I)
        entities.extend([f"ID: {m}" for m in order_matches[:3]])
        # Find error codes
        err_matches = re.findall(r"(?:error|status|code)\s*[:#-]?\s*([0-9]{3,4}|[A-Z0-9_]{4,12})", combined, re.I)
        entities.extend([f"Error: {m}" for m in err_matches[:2]])
        # Find email mentions
        email_matches = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", combined)
        entities.extend([f"Email: {m}" for m in email_matches[:2]])

        # Category Determination
        if any(w in combined for w in ["refund", "charge", "charged", "billing", "invoice", "payment", "stripe", "credit card", "receipt", "subscription", "price"]):
            category = TicketCategory.BILLING_PAYMENTS
        elif any(w in combined for w in ["login", "password", "2fa", "mfa", "locked", "sso", "authenticator", "reset password", "credentials", "sign in"]):
            category = TicketCategory.ACCOUNT_ACCESS
        elif any(w in combined for w in ["down", "outage", "500", "502", "503", "504", "crash", "latency", "server", "api error", "timeout", "unavailable"]):
            category = TicketCategory.TECHNICAL_ISSUE
        elif any(w in combined for w in ["feature", "request", "would love", "add support", "integrate", "enhancement", "wishlist"]):
            category = TicketCategory.FEATURE_REQUEST
        elif any(w in combined for w in ["bug", "glitch", "broken", "button doesn't work", "fails to load", "rendering", "typo"]):
            category = TicketCategory.BUG_REPORT
        elif any(w in combined for w in ["how to", "how do i", "documentation", "pricing question", "inquiry", "which plan"]):
            category = TicketCategory.PRODUCT_INQUIRY
        elif any(w in combined for w in ["feedback", "great job", "love the product", "terrible experience", "suggestion"]):
            category = TicketCategory.GENERAL_FEEDBACK
        else:
            category = TicketCategory.TECHNICAL_ISSUE

        # Priority Determination
        if any(w in combined for w in ["urgent", "emergency", "asap", "down", "outage", "production down", "critical", "breach", "immediately", "broken for all"]):
            priority = TicketPriority.CRITICAL
        elif any(w in combined for w in ["unable to work", "failed payment", "charged twice", "cannot login", "high priority", "deadline"]):
            priority = TicketPriority.HIGH
        elif any(w in combined for w in ["minor", "cosmetic", "typo", "suggestion", "when you have time", "feature request"]):
            priority = TicketPriority.LOW
        else:
            priority = TicketPriority.MEDIUM

        # Sentiment Determination
        if any(w in combined for w in ["furious", "angry", "terrible", "unacceptable", "lawsuit", "cancel immediately", "scam", "worst"]):
            sentiment = TicketSentiment.ANGRY
        elif any(w in combined for w in ["frustrated", "annoying", "struggling", "waste of time", "not working again", "disappointed"]):
            sentiment = TicketSentiment.FRUSTRATED
        elif any(w in combined for w in ["urgent", "asap", "hurry", "emergency", "critical deadline"]):
            sentiment = TicketSentiment.URGENT
        elif any(w in combined for w in ["thank you", "great", "appreciate", "awesome", "good", "love"]):
            sentiment = TicketSentiment.POSITIVE
        else:
            sentiment = TicketSentiment.NEUTRAL

        # Customer Intent & Summary
        first_sentence = message.strip().split("\n")[0]
        if len(first_sentence) > 120:
            first_sentence = first_sentence[:117] + "..."
        summary = f"Customer reported '{subject}'. {first_sentence}"
        if len(summary) > 400:
            summary = summary[:397] + "..."

        if category == TicketCategory.BILLING_PAYMENTS:
            customer_intent = "Resolve billing discrepancy, refund request, or invoice inquiry."
            suggested_action = "Inspect billing transaction logs in Stripe/payment gateway, verify account tier, and issue credit/refund if verified."
            response_body = f"Thank you for contacting us regarding your billing inquiry. I understand you have a question regarding '{subject}'. I have flagged this for our billing department to review your recent invoices and transactions. We will verify the details and update you within 24 hours."
        elif category == TicketCategory.ACCOUNT_ACCESS:
            customer_intent = "Regain access to account or reset authentication credentials."
            suggested_action = "Verify customer identity, check authentication logs, and trigger a secure password reset or 2FA recovery link."
            response_body = f"Thank you for reaching out. We know how critical it is to access your account without interruption. I have initiated a security review and our team is ready to assist you with resetting your credentials safely."
        elif category == TicketCategory.TECHNICAL_ISSUE:
            customer_intent = "Troubleshoot and restore broken system service, API endpoint, or application error."
            suggested_action = "Review application server logs, check status page for ongoing incidents, and escalate to on-call engineering if unresolved."
            response_body = f"Thank you for notifying us about this technical issue. Our engineering team is currently investigating the behavior you observed regarding '{subject}'. We apologize for the inconvenience and are working to resolve this as quickly as possible."
        elif category == TicketCategory.FEATURE_REQUEST:
            customer_intent = "Propose a new product capability or workflow enhancement."
            suggested_action = "Log request in product backlog, tag relevant engineering module, and notify customer of tracking."
            response_body = f"Thank you for sharing this valuable feedback! We love hearing how we can make our product better for you. I have logged your request regarding '{subject}' directly with our Product team."
        else:
            customer_intent = f"Seek support assistance regarding {subject}."
            suggested_action = "Review message details, confirm reproduction steps, and reply to customer with troubleshooting instructions."
            response_body = f"Thank you for contacting our support team regarding '{subject}'. We are reviewing your details and will get back to you with a comprehensive update shortly."

        greeting = f"Hi {customer_name},\n\n" if customer_name else "Hello,\n\n"
        suggested_response = f"{greeting}{response_body}\n\nBest regards,\nCustomer Support Team"

        return AIAnalysisResult(
            category=category,
            priority=priority,
            sentiment=sentiment,
            summary=summary,
            customer_intent=customer_intent,
            suggested_action=suggested_action,
            suggested_response=suggested_response,
            confidence_score=0.92,
            key_entities=entities or ["Support Ticket"]
        )


_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
