from supabase import Client
from datetime import datetime, timezone
from app.schemas.ai_analysis import TicketPriority, TicketSentiment, TicketCategory

def evaluate_automation_rules(db: Client, ticket: dict):
    """
    Evaluates automation rules based on ticket AI fields and creates action items.
    """
    actions = []

    priority = ticket.get("priority")
    sentiment = ticket.get("sentiment")
    category = ticket.get("category")
    ticket_id = ticket.get("id")

    if priority == TicketPriority.CRITICAL.value:
        actions.append({
            "ticket_id": ticket_id,
            "action_type": "escalate",
            "title": "Critical System Escalation",
            "description": "Ticket priority is Critical. Escalation required.",
            "priority": "Critical"
        })

    if priority == TicketPriority.HIGH.value and sentiment == TicketSentiment.ANGRY.value:
        actions.append({
            "ticket_id": ticket_id,
            "action_type": "human_review",
            "title": "Angry Customer Review",
            "description": "High priority ticket from an angry customer. Human review required.",
            "priority": "High"
        })

    if category == TicketCategory.TECHNICAL_ISSUE.value and priority == TicketPriority.HIGH.value:
        actions.append({
            "ticket_id": ticket_id,
            "action_type": "recommend_assignment",
            "title": "Assign Technical Support",
            "description": "High priority technical issue. Recommend assigning to Tier 2 Technical Support.",
            "priority": "High"
        })

    if category == TicketCategory.BILLING_PAYMENTS.value and sentiment == TicketSentiment.FRUSTRATED.value:
        actions.append({
            "ticket_id": ticket_id,
            "action_type": "recommend_review",
            "title": "Billing Review",
            "description": "Frustrated customer with billing issue. Recommend immediate billing review.",
            "priority": "Medium"
        })

    if actions:
        db.table("automation_actions").insert(actions).execute()

    return actions

def get_automation_actions(db: Client, status: str = None):
    query = db.table("automation_actions").select("*")
    if status:
        query = query.eq("status", status)
    res = query.execute()
    return res.data

def update_action_status(db: Client, action_id: int, status: str, assigned_to: str = None):
    update_data = {"status": status}
    if assigned_to:
        update_data["assigned_to"] = assigned_to
    if status in ['completed', 'dismissed']:
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()

    res = db.table("automation_actions").update(update_data).eq("id", action_id).execute()
    if not res.data:
        return None
    return res.data[0]
