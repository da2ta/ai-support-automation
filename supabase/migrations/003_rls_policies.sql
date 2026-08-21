-- Migration: 003_rls_policies.sql
-- Enable Row Level Security (RLS) on all application tables and define policies

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins and managers can view all profiles
CREATE POLICY "Admins and managers can view all profiles"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
);

-- Users can update their own profile (e.g. name, avatar, but not role)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    -- Prevent users from escalating their own role
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Admins can update any profile (including roles)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);


-- 3. Tickets Policies
-- Everyone (all authenticated users) can view tickets for now. 
-- You might restrict viewers from seeing PII in a more complex setup.
CREATE POLICY "All authenticated users can view tickets"
ON public.tickets FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Agents, managers, and admins can insert tickets
CREATE POLICY "Support staff can insert tickets"
ON public.tickets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('agent', 'manager', 'admin')
    )
);

-- Agents, managers, and admins can update tickets
CREATE POLICY "Support staff can update tickets"
ON public.tickets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('agent', 'manager', 'admin')
    )
);


-- 4. Automation Actions Policies
-- All authenticated users can view actions
CREATE POLICY "All authenticated users can view automation actions"
ON public.automation_actions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Support staff can insert actions (though usually this is done by the backend AI agent)
CREATE POLICY "Support staff can insert actions"
ON public.automation_actions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('agent', 'manager', 'admin')
    )
);

-- Support staff can update actions (e.g., approve, dismiss, complete)
CREATE POLICY "Support staff can update actions"
ON public.automation_actions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.role IN ('agent', 'manager', 'admin')
    )
);
