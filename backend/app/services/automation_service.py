from sqlalchemy.orm import Session
from app.models.ticket import Ticket
from app.models.automation import AutomationAction
from app.schemas.ai_analysis import TicketPriority, TicketSentiment, TicketCategory

def evaluate_automation_rules(db: Session, ticket: Ticket):
    """
    Evaluates automation rules based on ticket AI fields and creates action items.
    """
    actions = []

    # IF priority == Critical -> create escalation action
    if ticket.priority == TicketPriority.CRITICAL.value:
        actions.append(AutomationAction(
            ticket_id=ticket.id,
            action_type="escalate",
            title="Critical System Escalation",
            description="Ticket priority is Critical. Escalation required.",
            priority="Critical"
        ))

    # IF priority == High AND sentiment == Angry -> require human review
    if ticket.priority == TicketPriority.HIGH.value and ticket.sentiment == TicketSentiment.ANGRY.value:
        actions.append(AutomationAction(
            ticket_id=ticket.id,
            action_type="human_review",
            title="Angry Customer Review",
            description="High priority ticket from an angry customer. Human review required.",
            priority="High"
        ))

    # IF category == Technical Issue AND priority == High -> recommend Technical Support assignment
    if ticket.category == TicketCategory.TECHNICAL_ISSUE.value and ticket.priority == TicketPriority.HIGH.value:
        actions.append(AutomationAction(
            ticket_id=ticket.id,
            action_type="recommend_assignment",
            title="Assign Technical Support",
            description="High priority technical issue. Recommend assigning to Tier 2 Technical Support.",
            priority="High"
        ))

    # IF category == Billing & Payments AND sentiment == Frustrated -> recommend Billing review
    if ticket.category == TicketCategory.BILLING_PAYMENTS.value and ticket.sentiment == TicketSentiment.FRUSTRATED.value:
        actions.append(AutomationAction(
            ticket_id=ticket.id,
            action_type="recommend_review",
            title="Billing Review",
            description="Frustrated customer with billing issue. Recommend immediate billing review.",
            priority="Medium"
        ))

    if actions:
        db.add_all(actions)
        db.commit()
        for action in actions:
            db.refresh(action)

    return actions

def get_automation_actions(db: Session, status: str = None):
    query = db.query(AutomationAction)
    if status:
        query = query.filter(AutomationAction.status == status)
    return query.all()

def update_action_status(db: Session, action_id: int, status: str, assigned_to: str = None):
    action = db.query(AutomationAction).filter(AutomationAction.id == action_id).first()
    if not action:
        return None
    action.status = status
    if assigned_to:
        action.assigned_to = assigned_to
    if status in ['completed', 'dismissed']:
        from datetime import datetime, timezone
        action.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(action)
    return action
