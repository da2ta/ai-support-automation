export type TicketCategory =
  | 'Technical Issue'
  | 'Billing & Payments'
  | 'Account Access'
  | 'Feature Request'
  | 'Product Inquiry'
  | 'Bug Report'
  | 'General Feedback'
  | 'Other';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketSentiment = 'Positive' | 'Neutral' | 'Frustrated' | 'Angry' | 'Urgent';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Ticket {
  id: number;
  ticket_number: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
  status: TicketStatus;
  
  // AI Insights
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  summary: string;
  customer_intent: string;
  suggested_action: string;
  suggested_response: string;
  confidence_score: number;
  key_entities: string[];
  
  // Agent & Timestamps
  agent_notes?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

export interface SentimentCount {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  total_tickets: number;
  high_priority_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  in_progress_tickets: number;
  avg_confidence: number;
  category_breakdown: CategoryCount[];
  sentiment_breakdown: SentimentCount[];
  priority_breakdown: PriorityCount[];
  recent_tickets: Ticket[];
}

export interface TicketCreateInput {
  customer_name: string;
  customer_email: string;
  subject: string;
  message: string;
}

export interface TicketUpdateInput {
  status?: TicketStatus;
  agent_notes?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  suggested_response?: string;
}

export interface HealthCheckResponse {
  status: string;
  app_name: string;
  version: string;
  database: string;
  gemini_api_configured: boolean;
  gemini_model: string;
}

export interface AutomationAction {
  id: number;
  ticket_id: number;
  action_type: string;
  title: string;
  description: string;
  priority: string;
  status: 'pending' | 'approved' | 'completed' | 'dismissed';
  created_at: string;
  completed_at?: string | null;
  assigned_to?: string | null;
}
