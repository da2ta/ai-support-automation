import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, UserIcon, ArrowReloadHorizontalIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { useTicketContext } from "../../contexts/TicketContext";
import { ticketService } from "../../services/tickets";

export const TicketDetailDrawer: React.FC = () => {
  const { inspectTicket, setInspectTicket, triggerRefresh } = useTicketContext();
  const [loading, setLoading] = useState(false);

  if (!inspectTicket) return null;

  const ticket = inspectTicket;

  const handleReanalyze = async () => {
    setLoading(true);
    try {
      const updated = await ticketService.reanalyzeTicket(ticket.id);
      setInspectTicket(updated);
      triggerRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setInspectTicket(null)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-background border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right-1/4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-primary font-medium">{ticket.ticket_number}</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`text-[12px] font-medium ${getPriorityColor(ticket.priority)} uppercase tracking-wider`}>
              {ticket.priority} PRIORITY
            </span>
          </div>
          <button 
            onClick={() => setInspectTicket(null)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-xl font-semibold text-foreground tracking-tight leading-snug">{ticket.subject}</h2>
          <span className="text-[12px] text-muted-foreground mt-1 block">
            Opened {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            
            {/* Left Column - Customer & Message */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Customer</span>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
                  <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-foreground">{ticket.customer_name}</span>
                    <span className="text-[12px] text-muted-foreground">{ticket.customer_email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Original Message</span>
                <div className="p-4 rounded-lg border border-border bg-surface text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </div>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="flex flex-col gap-6 border-l border-border pl-8">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                  AI Analysis
                </span>
                <button 
                  onClick={handleReanalyze}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={12} className={loading ? "animate-spin-custom" : ""} />
                  Re-analyze
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</span>
                  <span className="text-[13px] font-medium text-foreground">{ticket.category}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sentiment</span>
                  <span className="text-[13px] font-medium text-foreground">{ticket.sentiment}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Confidence</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{Math.round(ticket.confidence_score * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${ticket.confidence_score * 100}%` }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Customer Intent</span>
                  <p className="text-[13px] text-foreground leading-relaxed">{ticket.customer_intent}</p>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Recommended Action</span>
                  <p className="text-[13px] text-foreground leading-relaxed">{ticket.suggested_action}</p>
                </div>
              </div>

              {/* Suggested Response */}
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested Response</span>
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-[13px] text-foreground leading-relaxed whitespace-pre-wrap relative group">
                  {ticket.suggested_response}
                  <button className="absolute top-2 right-2 p-1.5 rounded-md bg-background border border-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground">
                    <HugeiconsIcon icon={Copy01Icon} size={14} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};
