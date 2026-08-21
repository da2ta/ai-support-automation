import React from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder02Icon,
  HeartCheckIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import type { DashboardStats } from "../types";

import { StatusBadge } from "./StatusBadge";

interface CategoryBreakdownProps {
  stats: DashboardStats | null;
  onSelectCategory?: (cat: string) => void;
  onSelectSentiment?: (sent: string) => void;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  stats,
  onSelectCategory,
  onSelectSentiment,
}) => {
  const categories = stats?.category_breakdown ?? [];
  const sentiments = stats?.sentiment_breakdown ?? [];
  const priorities = stats?.priority_breakdown ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Category Distribution — 2 columns */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="lg:col-span-2 rounded-2xl border border-border/40 bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Folder02Icon} size={14} className="text-primary" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-tight opacity-60">
              Category Distribution
            </h3>
          </div>
          <span className="text-[9px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border/40">
            {categories.length} Categories
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {categories.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-6 text-center">
              No ticket data available yet. Load samples to begin.
            </p>
          ) : (
            categories.map((cat, idx) => (
              <div
                key={cat.category}
                onClick={() => onSelectCategory?.(cat.category)}
                className="flex flex-col gap-1.5 cursor-pointer group"
              >
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {cat.category}
                  </span>
                  <span className="font-medium text-muted-foreground tabular-nums">
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(cat.percentage, 4)}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Sentiment & Priority — 1 column */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border/40 bg-card p-5 flex flex-col gap-4"
      >
        {/* Sentiment */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HugeiconsIcon icon={HeartCheckIcon} size={14} className="text-chart-5" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-tight opacity-60">
              Sentiment
            </h3>
          </div>
          <div className="flex flex-col gap-1.5">
            {sentiments.length === 0 ? (
              <p className="text-[10px] text-muted-foreground py-2">No data yet.</p>
            ) : (
              sentiments.map((s) => (
                <div
                  key={s.sentiment}
                  onClick={() => onSelectSentiment?.(s.sentiment)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 border border-transparent hover:border-border/40 cursor-pointer transition-colors"
                >
                  <StatusBadge type="sentiment" value={s.sentiment} />
                  <span className="text-[10px] font-semibold text-foreground tabular-nums">
                    {s.count} ({s.percentage}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Spectrum */}
        <div className="pt-3 border-t border-border/40">
          <div className="flex items-center gap-2 mb-2.5">
            <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-amber-500" />
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-tight opacity-60">
              Priority
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {priorities.map((p) => (
              <div
                key={p.priority}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/40 text-[10px]"
              >
                <span className="font-medium text-muted-foreground">{p.priority}</span>
                <span className="font-bold text-foreground tabular-nums">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
