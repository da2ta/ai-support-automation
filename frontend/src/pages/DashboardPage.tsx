import React, { useEffect, useState } from "react";
import { statsService } from "../services/stats";
import { ticketService } from "../services/tickets";
import type { DashboardStats, TicketListResponse } from "../types";

import { KPIGrid } from "../components/dashboard/KPIGrid";
import { TicketVolumeChart } from "../components/dashboard/TicketVolumeChart";
import { AIPerformance } from "../components/dashboard/AIPerformance";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { SentimentBreakdown } from "../components/dashboard/SentimentBreakdown";
import { RecentTickets } from "../components/dashboard/RecentTickets";
import { useTicketContext } from "../contexts/TicketContext";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ticketsData, setTicketsData] = useState<TicketListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { setIsSubmitOpen, refreshTrigger } = useTicketContext();

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        statsService.getDashboardStats(),
        ticketService.getTickets({ limit: 10 }),
      ]);
      setStats(s);
      setTicketsData(t);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[13px] text-muted-foreground font-medium">Loading AI metrics...</span>
        </div>
      </div>
    );
  }

  if (!stats || !ticketsData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl flex flex-col gap-2 max-w-md text-center">
          <span className="font-semibold text-sm">Failed to load dashboard</span>
          <span className="text-[13px] opacity-80">Check if the FastAPI backend is running and the database is initialized.</span>
          <button onClick={loadData} className="mt-2 px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-md mx-auto hover:bg-destructive/90 transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Good morning, Support Team</h1>
          <p className="text-[13px] text-muted-foreground">AI-powered overview of your support operation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-hover text-sm font-medium transition-colors">
            Refresh
          </button>
          <button onClick={() => setIsSubmitOpen(true)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
            + New Ticket
          </button>
        </div>
      </div>

      <KPIGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketVolumeChart />
        </div>
        <div className="lg:col-span-1">
          <AIPerformance stats={stats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown stats={stats} />
        <SentimentBreakdown stats={stats} />
      </div>

      <RecentTickets tickets={ticketsData} />
      
    </div>
  );
};
