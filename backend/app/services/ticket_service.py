import math
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import desc, asc, or_, func
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
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
    return datetime.now(timezone.utc)


def generate_ticket_number(db: Session) -> str:
    """Generate sequential ticket numbers like TICK-1001, TICK-1002."""
    max_id_query = db.query(func.max(Ticket.id)).scalar()
    next_id = 1001 if max_id_query is None else 1000 + max_id_query + 1
    return f"TICK-{next_id}"


def create_ticket(
    db: Session,
    ticket_in: TicketCreate,
    ai_result: AIAnalysisResult
) -> Ticket:
    """Create and persist a new support ticket with AI metadata."""
    ticket_num = generate_ticket_number(db)
    
    db_ticket = Ticket(
        ticket_number=ticket_num,
        customer_name=ticket_in.customer_name.strip(),
        customer_email=str(ticket_in.customer_email).strip().lower(),
        subject=ticket_in.subject.strip(),
        message=ticket_in.message.strip(),
        status=TicketStatus.OPEN.value,
        category=ai_result.category.value if hasattr(ai_result.category, 'value') else str(ai_result.category),
        priority=ai_result.priority.value if hasattr(ai_result.priority, 'value') else str(ai_result.priority),
        sentiment=ai_result.sentiment.value if hasattr(ai_result.sentiment, 'value') else str(ai_result.sentiment),
        summary=ai_result.summary,
        customer_intent=ai_result.customer_intent,
        suggested_action=ai_result.suggested_action,
        suggested_response=ai_result.suggested_response,
        confidence_score=ai_result.confidence_score,
        key_entities=ai_result.key_entities,
        created_at=_utc_now(),
        updated_at=_utc_now(),
    )
    
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Evaluate automation rules
    from app.services.automation_service import evaluate_automation_rules
    evaluate_automation_rules(db, db_ticket)
    
    return db_ticket


def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    """Retrieve ticket by ID."""
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def get_ticket_by_number(db: Session, ticket_number: str) -> Optional[Ticket]:
    """Retrieve ticket by ticket_number."""
    return db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()


def get_tickets(
    db: Session,
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
    query = db.query(Ticket)
    
    # Filter by Status
    if status and status != "All":
        query = query.filter(Ticket.status == status)
        
    # Filter by Priority
    if priority and priority != "All":
        query = query.filter(Ticket.priority == priority)
        
    # Filter by Category
    if category and category != "All":
        query = query.filter(Ticket.category == category)

    # Filter by Sentiment
    if sentiment and sentiment != "All":
        query = query.filter(Ticket.sentiment == sentiment)
        
    # Search in subject, message, customer_name, customer_email, ticket_number, summary
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.subject.ilike(search_pattern),
                Ticket.message.ilike(search_pattern),
                Ticket.customer_name.ilike(search_pattern),
                Ticket.customer_email.ilike(search_pattern),
                Ticket.ticket_number.ilike(search_pattern),
                Ticket.summary.ilike(search_pattern),
                Ticket.customer_intent.ilike(search_pattern),
            )
        )
        
    total = query.count()
    
    # Sorting
    sort_column = getattr(Ticket, sort_by, Ticket.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
        
    # Pagination
    offset = (page - 1) * limit
    tickets = query.offset(offset).limit(limit).all()
    
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
    db: Session,
    ticket_id: int,
    update_in: TicketUpdate
) -> Optional[Ticket]:
    """Update ticket status, agent notes, priority, category, or suggested response."""
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        return None
        
    if update_in.status is not None:
        ticket.status = update_in.status.value if hasattr(update_in.status, 'value') else str(update_in.status)
        if update_in.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            ticket.resolved_at = _utc_now()
        elif update_in.status in [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]:
            ticket.resolved_at = None
            
    if update_in.agent_notes is not None:
        ticket.agent_notes = update_in.agent_notes
        
    if update_in.priority is not None:
        ticket.priority = update_in.priority.value if hasattr(update_in.priority, 'value') else str(update_in.priority)
        
    if update_in.category is not None:
        ticket.category = update_in.category.value if hasattr(update_in.category, 'value') else str(update_in.category)
        
    if update_in.suggested_response is not None:
        ticket.suggested_response = update_in.suggested_response
        
    ticket.updated_at = _utc_now()
    db.commit()
    db.refresh(ticket)
    return ticket


async def reanalyze_ticket(
    db: Session,
    ticket_id: int,
    gemini_service
) -> Optional[Ticket]:
    """Re-run Gemini AI analysis on an existing ticket and refresh its extracted fields."""
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        return None
        
    ai_result = await gemini_service.analyze_message(
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        message=ticket.message
    )
    
    ticket.category = ai_result.category.value if hasattr(ai_result.category, 'value') else str(ai_result.category)
    ticket.priority = ai_result.priority.value if hasattr(ai_result.priority, 'value') else str(ai_result.priority)
    ticket.sentiment = ai_result.sentiment.value if hasattr(ai_result.sentiment, 'value') else str(ai_result.sentiment)
    ticket.summary = ai_result.summary
    ticket.customer_intent = ai_result.customer_intent
    ticket.suggested_action = ai_result.suggested_action
    ticket.suggested_response = ai_result.suggested_response
    ticket.confidence_score = ai_result.confidence_score
    ticket.key_entities = ai_result.key_entities
    ticket.updated_at = _utc_now()
    
    db.commit()
    db.refresh(ticket)
    return ticket


def get_dashboard_stats(db: Session) -> DashboardStats:
    """Calculate aggregate KPIs, breakdowns, and recent tickets for the React dashboard."""
    total_tickets = db.query(Ticket).count()
    
    high_priority_count = db.query(Ticket).filter(
        Ticket.priority.in_([TicketPriority.CRITICAL.value, TicketPriority.HIGH.value])
    ).count()
    
    open_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.OPEN.value).count()
    in_progress_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.IN_PROGRESS.value).count()
    resolved_tickets = db.query(Ticket).filter(
        Ticket.status.in_([TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value])
    ).count()
    
    avg_confidence_val = db.query(func.avg(Ticket.confidence_score)).scalar() or 0.95
    
    # Category Breakdown
    cat_counts = (
        db.query(Ticket.category, func.count(Ticket.id))
        .group_by(Ticket.category)
        .all()
    )
    category_breakdown = [
        CategoryCount(
            category=cat,
            count=cnt,
            percentage=round((cnt / total_tickets * 100) if total_tickets > 0 else 0, 1)
        )
        for cat, cnt in sorted(cat_counts, key=lambda x: x[1], reverse=True)
    ]
    
    # Sentiment Breakdown
    sent_counts = (
        db.query(Ticket.sentiment, func.count(Ticket.id))
        .group_by(Ticket.sentiment)
        .all()
    )
    sentiment_breakdown = [
        SentimentCount(
            sentiment=sent,
            count=cnt,
            percentage=round((cnt / total_tickets * 100) if total_tickets > 0 else 0, 1)
        )
        for sent, cnt in sorted(sent_counts, key=lambda x: x[1], reverse=True)
    ]
    
    # Priority Breakdown
    prio_counts = (
        db.query(Ticket.priority, func.count(Ticket.id))
        .group_by(Ticket.priority)
        .all()
    )
    priority_breakdown = [
        PriorityCount(
            priority=prio,
            count=cnt,
            percentage=round((cnt / total_tickets * 100) if total_tickets > 0 else 0, 1)
        )
        for prio, cnt in sorted(prio_counts, key=lambda x: x[1], reverse=True)
    ]
    
    # Recent 6 tickets
    recent_db_tickets = (
        db.query(Ticket)
        .order_by(desc(Ticket.created_at))
        .limit(6)
        .all()
    )
    recent_tickets = [TicketResponse.model_validate(t) for t in recent_db_tickets]
    
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


async def seed_sample_tickets(db: Session, gemini_service) -> List[Ticket]:
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
