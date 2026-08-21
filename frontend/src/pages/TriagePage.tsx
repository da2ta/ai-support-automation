import React, { useEffect, useState } from "react";
import { automationService } from "../services/automation";
import type { AutomationAction } from "../types";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";

export const TriagePage: React.FC = () => {
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const data = await automationService.getActions("pending");
      setActions(data);
    } catch (e) {
      console.error("Failed to load actions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleComplete = async (id: number) => {
    try {
      await automationService.updateAction(id, "completed");
      fetchActions();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI Triage Actions</h1>
          <p className="text-[13px] text-muted-foreground">Review and approve automated actions suggested by AI.</p>
        </div>
        <button onClick={fetchActions} className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-hover text-sm font-medium transition-colors">
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {actions.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface border border-border flex flex-col items-center text-center gap-2">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={32} className="text-success mb-2" />
            <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
            <p className="text-sm text-muted-foreground">There are no pending triage actions at this time.</p>
          </div>
        ) : (
          actions.map((action) => (
            <div key={action.id} className="p-5 rounded-xl bg-surface border border-border shadow-sm flex items-start gap-4 hover:border-primary/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={ZapIcon} size={20} className="text-primary" />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-foreground">{action.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                    action.priority.toLowerCase() === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                    action.priority.toLowerCase() === 'high' ? 'bg-warning/10 text-warning border-warning/20' : 
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {action.priority} Priority
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    For Ticket ID: {action.ticket_id}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 ml-4">
                <button 
                  onClick={() => handleComplete(action.id)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Approve Action
                </button>
                <button 
                  onClick={async () => {
                    await automationService.updateAction(action.id, "dismissed");
                    fetchActions();
                  }}
                  className="px-4 py-2 bg-surface text-foreground border border-border text-xs font-semibold rounded-lg hover:bg-surface-hover transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
