import React from "react";
import { cn } from "@/lib/utils";
import type { TicketPriority, TicketSentiment } from "../types";

interface BadgeProps {
  type: "priority" | "status" | "sentiment" | "category";
  value: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ type, value }) => {
  if (type === "priority") {
    const p = value as TicketPriority;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
          p === "Critical" && "bg-destructive/10 text-destructive border-destructive/20",
          p === "High" && "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          p === "Medium" && "bg-primary/10 text-primary border-primary/20",
          p === "Low" && "bg-muted text-muted-foreground border-border/40"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            p === "Critical" && "bg-destructive",
            p === "High" && "bg-orange-500",
            p === "Medium" && "bg-primary",
            p === "Low" && "bg-muted-foreground"
          )}
        />
        {p}
      </span>
    );
  }

  if (type === "status") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
          value === "Open" && "bg-primary/10 text-primary border-primary/20",
          value === "In Progress" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          value === "Resolved" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          value === "Closed" && "bg-muted text-muted-foreground border-border/40"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            value === "Open" && "bg-primary",
            value === "In Progress" && "bg-amber-500",
            value === "Resolved" && "bg-emerald-500",
            value === "Closed" && "bg-muted-foreground"
          )}
        />
        {value}
      </span>
    );
  }

  if (type === "sentiment") {
    const sent = value as TicketSentiment;
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium",
          sent === "Positive" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          sent === "Neutral" && "bg-muted text-muted-foreground",
          sent === "Frustrated" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          sent === "Angry" && "bg-destructive/10 text-destructive",
          sent === "Urgent" && "bg-chart-5/10 text-chart-5"
        )}
      >
        {sent}
      </span>
    );
  }

  if (type === "category") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-accent text-accent-foreground border border-primary/15">
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
      {value}
    </span>
  );
};
