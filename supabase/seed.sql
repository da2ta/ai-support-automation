-- Seed Demo Data
-- Note: User profiles must be inserted through auth.users creation normally, 
-- but for demo seeding we insert dummy profiles bypassing auth for relationships, 
-- or we can just leave `assigned_to` null if auth isn't setup locally yet.

INSERT INTO public.tickets (
    ticket_number, customer_name, customer_email, subject, message, status, 
    category, priority, sentiment, summary, customer_intent, suggested_action, 
    suggested_response, confidence_score, key_entities, created_at
) VALUES 
(
    'TKT-1001', 'Alice Johnson', 'alice.j@example.com', 'Cannot log in to my account', 
    'Hi, I have been trying to log in all morning but it keeps saying invalid password even though I am sure it is correct.', 
    'Open', 'Account Access', 'High', 'Frustrated', 
    'Customer is unable to log into their account due to invalid password errors.', 
    'Password Reset or Account Unlocking', 'Send password reset link and check account status.', 
    'Hello Alice, I am sorry to hear you are having trouble logging in. I have sent a password reset link to your email.', 
    0.92, '[{"entity": "account", "type": "product_feature"}, {"entity": "password", "type": "credential"}]', 
    NOW() - INTERVAL '2 hours'
),
(
    'TKT-1002', 'Bob Smith', 'bob.smith@example.com', 'Billing discrepancy on last invoice', 
    'I noticed I was charged $50 instead of my usual $30. Can you explain this?', 
    'In Progress', 'Billing & Payments', 'Medium', 'Neutral', 
    'Customer is questioning an overcharge on their recent invoice.', 
    'Invoice Explanation or Refund', 'Review invoice #INV-XXXX and provide breakdown of charges.', 
    'Hello Bob, thank you for reaching out. The additional $20 was due to the pro-rated upgrade you made mid-month.', 
    0.88, '[{"entity": "$50", "type": "amount"}, {"entity": "$30", "type": "amount"}]', 
    NOW() - INTERVAL '1 day'
),
(
    'TKT-1003', 'Carol Davis', 'carol.d@example.com', 'System is down completely', 
    'The entire dashboard is throwing 500 errors. We cannot process any orders right now. Fix this ASAP!', 
    'Open', 'Technical Issue', 'Critical', 'Angry', 
    'Customer is reporting a complete system outage preventing order processing.', 
    'Immediate Technical Escalation', 'Escalate to engineering on-call immediately.', 
    'Hello Carol, we are aware of the dashboard outage and our engineering team is investigating it as a top priority.', 
    0.98, '[{"entity": "dashboard", "type": "product_feature"}, {"entity": "500 errors", "type": "error_code"}]', 
    NOW() - INTERVAL '15 minutes'
);

INSERT INTO public.automation_actions (
    ticket_id, action_type, title, description, priority, status
) VALUES 
(
    (SELECT id FROM public.tickets WHERE ticket_number = 'TKT-1003'), 
    'escalate', 'Critical System Outage Escalation', 
    'Automatically escalate ticket to engineering on-call due to Critical priority and Technical Issue category.', 
    'Critical', 'pending'
),
(
    (SELECT id FROM public.tickets WHERE ticket_number = 'TKT-1001'), 
    'human_review', 'Review Account Lockout', 
    'High priority account issue requires human review before triggering automated password reset.', 
    'High', 'pending'
);
