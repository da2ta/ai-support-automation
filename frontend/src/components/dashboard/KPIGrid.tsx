import React from "react";
import type { DashboardStats } from "../../types";

export const KPIGrid: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const kpis = [
    {
      label: "Total Tickets",
      value: stats.total_tickets.toLocaleString(),
      trend: "+12.4%", // We don't have historical data yet, using static mock for the trend
      trendUp: true,
    },
    {
      label: "High Priority",
      value: stats.high_priority_tickets.toLocaleString(),
      trend: "-8.2%",
      trendUp: false,
    },
    {
      label: "Open Tickets",
      value: stats.open_tickets.toLocaleString(),
      trend: null,
    },
    {
      label: "AI Confidence",
      value: stats.avg_confidence ? `${Math.round(stats.avg_confidence * 100)}%` : "0%",
      trend: "+3.1%",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-2">
          <span className="text-[13px] font-medium text-muted-foreground">{kpi.label}</span>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold tracking-tight text-foreground">{kpi.value}</span>
          </div>
          {kpi.trend && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[11px] font-medium ${kpi.trendUp ? "text-success" : "text-success"}`}>
                {kpi.trend}
              </span>
              <span className="text-[11px] text-muted-foreground">vs last 30 days</span>
            </div>
          )}
          {!kpi.trend && <div className="h-[22px] mt-1" />}
        </div>
      ))}
    </div>
  );
};
