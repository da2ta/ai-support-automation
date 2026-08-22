import math
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
from supabase import Client

from app.schemas.ai_analysis import AIAnalysisResult, TicketCategory, TicketPriority, TicketSentiment
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketListResponse,
    DashboardStats,
    CategoryCount,
    SentimentCount,
    PriorityCount,
    TicketStatus,
)

def _utc_now():
    return datetime.now(timezone.utc).isoformat()

def generate_ticket_number(db: Client) -> str:
    """Generate sequential ticket numbers like TICK-1001, TICK-1002."""
    res = db.table("tickets").select("id").order("id", desc=True).limit(1).execute()
    max_id = res.data[0]["id"] if res.data else 0
    next_id = 1001 if max_id == 0 else 1000 + max_id + 1
    return f"TICK-{next_id}"

def create_ticket(
    db: Client,
    ticket_in: TicketCreate,
    ai_result: AIAnalysisResult
) -> TicketResponse:
    """Create and persist a new support ticket with AI metadata."""
    ticket_num = generate_ticket_number(db)

    insert_data = {
        "ticket_number": ticket_num,
        "customer_name": ticket_in.customer_name.strip(),
        "customer_email": str(ticket_in.customer_email).strip().lower(),
        "subject": ticket_in.subject.strip(),
        "message": ticket_in.message.strip(),
        "status": TicketStatus.OPEN.value,
        "category": ai_result.category.value if hasattr(ai_result.category, 'value') else str(ai_result.category),
        "priority": ai_result.priority.value if hasattr(ai_result.priority, 'value') else str(ai_result.priority),
        "sentiment": ai_result.sentiment.value if hasattr(ai_result.sentiment, 'value') else str(ai_result.sentiment),
        "summary": ai_result.summary,
        "customer_intent": ai_result.customer_intent,
        "suggested_action": ai_result.suggested_action,
        "suggested_response": ai_result.suggested_response,
        "confidence_score": ai_result.confidence_score,
        "key_entities": ai_result.key_entities,
        "created_at": _utc_now(),
        "updated_at": _utc_now(),
    }

    res = db.table("tickets").insert(insert_data).execute()
    db_ticket = res.data[0]

    # Evaluate automation rules
    from app.services.automation_service import evaluate_automation_rules
    evaluate_automation_rules(db, db_ticket)

    updated_res = db.table("tickets").select("*").eq("id", db_ticket["id"]).execute()
    return TicketResponse.model_validate(updated_res.data[0])

def get_ticket(db: Client, ticket_id: int) -> Optional[TicketResponse]:
    """Retrieve ticket by ID."""
    res = db.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        return None
    return TicketResponse.model_validate(res.data[0])

def get_ticket_by_number(db: Client, ticket_number: str) -> Optional[TicketResponse]:
    """Retrieve ticket by ticket_number."""
    res = db.table("tickets").select("*").eq("ticket_number", ticket_number).execute()
    if not res.data:
        return None
    return TicketResponse.model_validate(res.data[0])

def get_tickets(
    db: Client,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc"
) -> TicketListResponse:
    """Query tickets with flexible filtering, multi-field search, sorting, and pagination."""

    query = db.table("tickets").select("*", count="exact")

    if status and status != "All":
        query = query.eq("status", status)
    if priority and priority != "All":
        query = query.eq("priority", priority)
    if category and category != "All":
        query = query.eq("category", category)
    if sentiment and sentiment != "All":
        query = query.eq("sentiment", sentiment)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.or_(f"subject.ilike.{search_pattern},message.ilike.{search_pattern},customer_name.ilike.{search_pattern},customer_email.ilike.{search_pattern},ticket_number.ilike.{search_pattern},summary.ilike.{search_pattern},customer_intent.ilike.{search_pattern}")

    if sort_order.lower() == "asc":
        query = query.order(sort_by, desc=False)
    else:
        query = query.order(sort_by, desc=True)

    offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    res = query.execute()
    total = res.count if res.count is not None else 0
    tickets = res.data

    total_pages = max(1, math.ceil(total / limit)) if total > 0 else 1

    ticket_responses = [TicketResponse.model_validate(t) for t in tickets]

    return TicketListResponse(
        tickets=ticket_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )

def update_ticket(
    db: Client,
    ticket_id: int,
    update_in: TicketUpdate
) -> Optional[TicketResponse]:
    """Update ticket status, agent notes, priority, category, or suggested response."""
    update_data = {}

    if update_in.status is not None:
        update_data["status"] = update_in.status.value if hasattr(update_in.status, 'value') else str(update_in.status)
        if update_in.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            update_data["resolved_at"] = _utc_now()
        elif update_in.status in [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]:
            update_data["resolved_at"] = None

    if update_in.agent_notes is not None:
        update_data["agent_notes"] = update_in.agent_notes

    if update_in.priority is not None:
        update_data["priority"] = update_in.priority.value if hasattr(update_in.priority, 'value') else str(update_in.priority)

    if update_in.category is not None:
        update_data["category"] = update_in.category.value if hasattr(update_in.category, 'value') else str(update_in.category)

    if update_in.suggested_response is not None:
        update_data["suggested_response"] = update_in.suggested_response

    if not update_data:
        return get_ticket(db, ticket_id)

    update_data["updated_at"] = _utc_now()

    res = db.table("tickets").update(update_data).eq("id", ticket_id).execute()
    if not res.data:
        return None

    return TicketResponse.model_validate(res.data[0])

async def reanalyze_ticket(
    db: Client,
    ticket_id: int,
    gemini_service
) -> Optional[TicketResponse]:
    """Re-run Gemini AI analysis on an existing ticket and refresh its extracted fields."""
    res = db.table("tickets").select("*").eq("id", ticket_id).execute()
    if not res.data:
        return None

    ticket_dict = res.data[0]

    ai_result = await gemini_service.analyze_message(
        customer_name=ticket_dict.get("customer_name", ""),
        customer_email=ticket_dict.get("customer_email", ""),
        subject=ticket_dict.get("subject", ""),
        message=ticket_dict.get("message", "")
    )

    update_data = {
        "category": ai_result.category.value if hasattr(ai_result.category, 'value') else str(ai_result.category),
        "priority": ai_result.priority.value if hasattr(ai_result.priority, 'value') else str(ai_result.priority),
        "sentiment": ai_result.sentiment.value if hasattr(ai_result.sentiment, 'value') else str(ai_result.sentiment),
        "summary": ai_result.summary,
        "customer_intent": ai_result.customer_intent,
        "suggested_action": ai_result.suggested_action,
        "suggested_response": ai_result.suggested_response,
        "confidence_score": ai_result.confidence_score,
        "key_entities": ai_result.key_entities,
        "updated_at": _utc_now()
    }

    update_res = db.table("tickets").update(update_data).eq("id", ticket_id).execute()
    if not update_res.data:
        return None

    return TicketResponse.model_validate(update_res.data[0])

def get_dashboard_stats(db: Client) -> DashboardStats:
    """Calculate aggregate KPIs, breakdowns, and recent tickets for the React dashboard."""
    res = db.table("tickets").select("id, status, priority, category, sentiment, confidence_score").execute()
    tickets = res.data

    total_tickets = len(tickets)

    high_priority_count = sum(1 for t in tickets if t.get("priority") in [TicketPriority.CRITICAL.value, TicketPriority.HIGH.value])
    open_tickets = sum(1 for t in tickets if t.get("status") == TicketStatus.OPEN.value)
    in_progress_tickets = sum(1 for t in tickets if t.get("status") == TicketStatus.IN_PROGRESS.value)
    resolved_tickets = sum(1 for t in tickets if t.get("status") in [TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value])

    avg_confidence_val = sum(t.get("confidence_score", 0.95) for t in tickets) / total_tickets if total_tickets > 0 else 0.95

    cat_counts_dict = {}
    for t in tickets:
        cat = t.get("category")
        if cat: cat_counts_dict[cat] = cat_counts_dict.get(cat, 0) + 1

    category_breakdown = [
        CategoryCount(
            category=cat,
            count=cnt,
            percentage=round((cnt / total_tickets * 100) if total_tickets > 0 else 0, 1)
        )
        for cat, cnt in sorted(cat_counts_dict.items(), key=lambda x: x[1], reverse=True)
    ]

    sent_counts_dict = {}
    for t in tickets:
        sent = t.get("sentiment")
        if sent: sent_counts_dict[sent] = sent_counts_dict.get(sent, 0) + 1

    sentiment_breakdown = [
        SentimentCount(
            sentiment=sent,
            count=cnt,
            percentage=round((cnt / total_tickets * 100) if total_tickets > 0 else 0, 1)
        )
        for sent, cnt in sorted(sent_counts_dict.items(), key=lambda x: x[1], reverse=True)
    ]

    prio_counts_dict = {}
    for t in tickets:
        prio = t.get("priority")
        if prio: prio_counts_dict[prio] = prio_counts_dict.get(prio, 0) + 1

    priority_breakdown = [
        PriorityCount(
            priority=prio,
            count=cnt,
            percentage=round((cnt / total_tickets * 100) if total_tickets > 0 else 0, 1)
        )
        for prio, cnt in sorted(prio_counts_dict.items(), key=lambda x: x[1], reverse=True)
    ]

    recent_res = db.table("tickets").select("*").order("created_at", desc=True).limit(6).execute()
    recent_tickets = [TicketResponse.model_validate(t) for t in recent_res.data]

    return DashboardStats(
        total_tickets=total_tickets,
        high_priority_tickets=high_priority_count,
        open_tickets=open_tickets,
        resolved_tickets=resolved_tickets,
        in_progress_tickets=in_progress_tickets,
        avg_confidence=round(avg_confidence_val, 2),
        category_breakdown=category_breakdown,
        sentiment_breakdown=sentiment_breakdown,
        priority_breakdown=priority_breakdown,
        recent_tickets=recent_tickets,
    )

SAMPLE_PRESETS = [
    {
        "customer_name": "Elena Rostova",
        "customer_email": "elena.rostova@acmecorp.com",
        "subject": "CRITICAL: Production Payment Gateway returning 500 errors",
        "message": "Our checkout pipeline is completely halted right now. All customers attempting to pay via Stripe are receiving 'HTTP 500 Internal Server Error' (Error Code: PAY-5001). We have lost approximately $15,000 in transactions in the last 45 minutes. Please investigate and escalate immediately!",
    },
    {
        "customer_name": "Marcus Vance",
        "customer_email": "marcus.vance@techscale.io",
        "subject": "Double charged on monthly Enterprise subscription #INV-88392",
        "message": "Hello, I noticed on our corporate credit card statement that our company was billed $499 twice on March 1st for invoice #INV-88392. Can you please check our account and process a refund of $499 back to the original card?",
    },
    {
        "customer_name": "Sarah Jenkins",
        "customer_email": "sarah.j@designco.org",
        "subject": "Locked out of account - MFA device replaced",
        "message": "Hi support team, I got a new phone over the weekend and lost access to my Google Authenticator 2FA tokens. I am unable to log in to my admin dashboard (user: sarah.j@designco.org). Can you please trigger an account verification and reset my 2FA?",
    },
    {
        "customer_name": "David Kim",
        "customer_email": "dkim@startupnexus.dev",
        "subject": "Feature Request: Native Webhook support for Zendesk integration",
        "message": "We love using your platform! One feature that would save our engineering team hours each week is native webhook dispatching whenever a ticket status changes, specifically compatible with Zendesk and Slack. Is this on your upcoming Q2 product roadmap?",
    },
    {
        "customer_name": "Amanda Lopez",
        "customer_email": "amanda.lopez@globalretail.com",
        "subject": "Analytics export button missing in Safari 17",
        "message": "When accessing the analytics reports page in Safari 17.3 on macOS, the 'Export CSV' button does not render at all. It works fine in Chrome. Can you look into this browser compatibility glitch?",
    }
]

async def seed_sample_tickets(db: Client, gemini_service) -> List[TicketResponse]:
    """Seed sample realistic tickets if database is empty."""
    created = []
    for item in SAMPLE_PRESETS:
        ticket_create = TicketCreate(**item)
        ai_res = await gemini_service.analyze_message(
            customer_name=ticket_create.customer_name,
            customer_email=str(ticket_create.customer_email),
            subject=ticket_create.subject,
            message=ticket_create.message
        )
        t = create_ticket(db, ticket_create, ai_res)
        created.append(t)
    return created
