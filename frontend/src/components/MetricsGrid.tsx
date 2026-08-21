import React from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CircleArrowUpRight02Icon,
  AlertCircleIcon,
  TimeQuarterPassIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import type { DashboardStats } from "../types";

interface MetricsGridProps {
  stats: DashboardStats | null;
  onFilterPriority?: (prio: string) => void;
  onFilterStatus?: (status: string) => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  stats,
  onFilterPriority,
  onFilterStatus,
}) => {
  const total = stats?.total_tickets ?? 0;
  const highPriority = stats?.high_priority_tickets ?? 0;
  const open = stats?.open_tickets ?? 0;
  const resolved = stats?.resolved_tickets ?? 0;
  const confidence = stats?.avg_confidence
    ? Math.round(stats.avg_confidence * 100)
    : 95;

  const cards = [
    {
      label: "Total Inquiries",
      value: total,
      icon: CircleArrowUpRight02Icon,
      description: "All ingested support requests",
      color: "text-primary",
      barColor: "bg-primary",
      barPercent: 100,
      onClick: () => onFilterStatus?.("All"),
    },
    {
      label: "Critical & High",
      value: highPriority,
      icon: AlertCircleIcon,
      description: "Requires urgent triage",
      color: "text-destructive",
      barColor: "bg-destructive",
      barPercent: total > 0 ? (highPriority / total) * 100 : 0,
      onClick: () => onFilterPriority?.("High"),
    },
    {
      label: "Active / Open",
      value: open,
      icon: TimeQuarterPassIcon,
      description: "Pending initial resolution",
      color: "text-chart-2",
      barColor: "bg-chart-2",
      barPercent: total > 0 ? (open / total) * 100 : 0,
      onClick: () => onFilterStatus?.("Open"),
    },
    {
      label: "AI Accuracy",
      value: `${confidence}%`,
      icon: Tick01Icon,
      description: `${resolved} resolved tickets`,
      color: "text-emerald-500",
      barColor: "bg-emerald-500",
      barPercent: confidence,
      onClick: undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
          onClick={card.onClick}
          className="relative p-4 rounded-2xl border border-border/40 bg-card overflow-hidden cursor-pointer group transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
              {card.label}
            </span>
            <HugeiconsIcon
              icon={card.icon}
              size={14}
              className={card.color}
            />
          </div>

          <div className="flex flex-col gap-1.5 relative z-10">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {card.value}
            </span>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(card.barPercent, 4)}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                className={`h-full rounded-full ${card.barColor}`}
              />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">
              {card.description}
            </span>
          </div>

          {/* Background watermark */}
          <div className="absolute -right-3 -bottom-3 opacity-[0.03] scale-[2] rotate-12">
            <HugeiconsIcon icon={card.icon} size={48} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
