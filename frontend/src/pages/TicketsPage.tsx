import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons";
import { ticketService } from "../services/tickets";
import type { TicketListResponse } from "../types";

import { useTicketContext } from "../contexts/TicketContext";

export const TicketsPage: React.FC = () => {
  const [data, setData] = useState<TicketListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { setInspectTicket, refreshTrigger, setIsSubmitOpen } = useTicketContext();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter] = useState("All");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTickets({
        search: search.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        limit: 50,
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshTrigger, search, statusFilter]);

  const formatTime = (isoString: string) => {

    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'closed': return 'bg-success/10 text-success border-success/20';
      case 'in progress': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-success';
      case 'neutral': return 'text-muted-foreground';
      case 'frustrated': return 'text-warning';
      case 'angry':
      case 'urgent': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Support Tickets</h1>
          <p className="text-[13px] text-muted-foreground">Manage and triage all incoming customer requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSubmitOpen(true)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
            + New Ticket
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center">
            <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ticket or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 h-9 bg-surface border border-border rounded-md pl-8 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
            />
          </div>
          <button className="h-9 px-3 flex items-center gap-2 rounded-md border border-border bg-surface hover:bg-surface-hover text-[13px] font-medium text-foreground transition-colors shadow-sm">
            <HugeiconsIcon icon={FilterIcon} size={14} className="text-muted-foreground" />
            Filters
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">
            Showing {data?.tickets.length || 0} of {data?.total || 0} tickets
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-surface rounded-xl border border-border flex flex-col min-h-0 shadow-sm overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-surface z-10 shadow-sm border-b border-border">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sentiment</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">AI Conf</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-[13px] text-muted-foreground">Loading tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : !data || data.tickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-sm font-medium text-foreground">No tickets found</span>
                      <span className="text-[13px] text-muted-foreground">Try adjusting your filters or search term.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.tickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setInspectTicket(ticket)}
                    className="hover:bg-surface-hover/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3">
                      <span className="text-[12px] font-mono text-primary font-medium">{ticket.ticket_number}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-foreground">{ticket.customer_name}</span>
                        <span className="text-[11px] text-muted-foreground">{ticket.customer_email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col max-w-sm">
                        <span className="text-[13px] font-medium text-foreground truncate">{ticket.subject}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] text-muted-foreground">{ticket.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(ticket.priority).replace('text-', 'bg-')}`} />
                        <span className={`text-[12px] font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[12px] font-medium ${getSentimentColor(ticket.sentiment)}`}>
                        {ticket.sentiment}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] font-mono text-muted-foreground">
                        {Math.round(ticket.confidence_score * 100)}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] text-muted-foreground">{formatTime(ticket.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
