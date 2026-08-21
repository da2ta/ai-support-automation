import React from "react";
import { formatDistanceToNow } from "date-fns";
import type { TicketListResponse } from "../../types";

import { useTicketContext } from "../../contexts/TicketContext";

export const RecentTickets: React.FC<{ tickets: TicketListResponse }> = ({ tickets }) => {
  const { setInspectTicket } = useTicketContext();

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

  return (
    <div className="bg-surface rounded-xl border border-border flex flex-col mt-4">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-foreground">Recent Tickets</h3>
        <button className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors">
          View all
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {tickets.tickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                  No recent tickets found.
                </td>
              </tr>
            ) : (
              tickets.tickets.map((ticket) => (
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
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col max-w-xs">
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
  );
};
