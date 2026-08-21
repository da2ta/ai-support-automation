-- Migration: 002_indexes.sql
-- Create performance indexes for querying tickets and automation actions

-- Tickets Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets (ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON public.tickets (category);
CREATE INDEX IF NOT EXISTS idx_tickets_sentiment ON public.tickets (sentiment);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON public.tickets (customer_email);

-- Automation Actions Indexes
CREATE INDEX IF NOT EXISTS idx_automation_actions_ticket_id ON public.automation_actions (ticket_id);
CREATE INDEX IF NOT EXISTS idx_automation_actions_status ON public.automation_actions (status);
CREATE INDEX IF NOT EXISTS idx_automation_actions_assigned_to ON public.automation_actions (assigned_to);
