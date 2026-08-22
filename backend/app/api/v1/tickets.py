import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketListResponse
from app.services import ticket_service
from app.services.gemini_service import get_gemini_service
from app.dependencies import get_authenticated_service_db, get_db_session_with_user, require_staff_user

router = APIRouter()
logger = logging.getLogger("ai_support.api.tickets")

@router.post("", response_model=TicketResponse, status_code=201)
async def create_new_ticket(
    ticket: TicketCreate,
    db: Client = Depends(get_authenticated_service_db)
):
    """Submit a new support ticket and run AI analysis."""
    gemini_svc = get_gemini_service()
    
    try:
        ai_result = await gemini_svc.analyze_message(
            customer_name=ticket.customer_name,
            customer_email=ticket.customer_email,
            subject=ticket.subject,
            message=ticket.message
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI analysis failed during ticket creation: {e}")
        from app.schemas.ai_analysis import AIAnalysisResult, TicketCategory, TicketPriority, TicketSentiment
        ai_result = AIAnalysisResult(
            category=TicketCategory.OTHER,
            priority=TicketPriority.MEDIUM,
            sentiment=TicketSentiment.NEUTRAL,
            summary="AI Analysis Unavailable. Please re-analyze.",
            customer_intent="Unknown due to AI failure.",
            suggested_action="Manual review required.",
            suggested_response="",
            confidence_score=0.0,
            key_entities=[]
        )
        
    db_ticket = ticket_service.create_ticket(db, ticket, ai_result)
    return db_ticket


@router.get("", response_model=TicketListResponse)
def get_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Client = Depends(get_db_session_with_user),
    _: dict = Depends(require_staff_user),
):
    """Retrieve tickets with pagination, filtering, and sorting."""
    return ticket_service.get_tickets(
        db=db,
        status=status,
        priority=priority,
        category=category,
        sentiment=sentiment,
        search=search,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int, 
    db: Client = Depends(get_db_session_with_user),
    _: dict = Depends(require_staff_user),
):
    """Get a specific ticket by ID."""
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Client = Depends(get_db_session_with_user),
    _: dict = Depends(require_staff_user),
):
    """Update a ticket's status, notes, or fields."""
    updated = ticket_service.update_ticket(db, ticket_id, ticket_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return updated


@router.post("/{ticket_id}/reanalyze", response_model=TicketResponse)
async def reanalyze_ticket_with_ai(
    ticket_id: int,
    db: Client = Depends(get_db_session_with_user),
    _: dict = Depends(require_staff_user),
):
    """Re-run AI analysis on an existing ticket."""
    gemini_svc = get_gemini_service()
    try:
        updated = await ticket_service.reanalyze_ticket(db, ticket_id, gemini_svc)
        if not updated:
            raise HTTPException(status_code=404, detail="Ticket not found")
        from app.services.automation_service import evaluate_automation_rules
        evaluate_automation_rules(db, updated.model_dump())
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI Re-analysis failed: {str(e)}")
