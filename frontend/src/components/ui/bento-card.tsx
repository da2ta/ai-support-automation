"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Message01Icon,
  Folder02Icon,
  Add01Icon,
  CircleArrowUpRight02Icon,
  Search01Icon,
  BarChartIcon,
  InformationCircleIcon,
  DatabaseIcon,
  UserIcon,
  ViewIcon,
  Sun01Icon,
  Moon02Icon,
  ArrowReloadHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type {
  DashboardStats,
  TicketListResponse,
  Ticket,
  HealthCheckResponse,
} from "../../types";

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  header: string;
  description: string;
}

interface BentoCardProps {
  stats: DashboardStats | null;
  ticketsData: TicketListResponse | null;
  health: HealthCheckResponse | null;
  onInspectTicket: (ticket: Ticket) => void;
  onOpenSubmit: () => void;
  onSeedData: () => void;
  onRefresh: () => void;
  loading: boolean;
  seeding: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const BentoCard = ({
  stats,
  ticketsData,
  health,
  onInspectTicket,
  onOpenSubmit,
  onSeedData,
  onRefresh,
  loading,
  seeding,
  theme,
  onToggleTheme,
}: BentoCardProps) => {
  const TABS: TabConfig[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: DashboardSquare01Icon,
      header: "Project Overview",
      description: "Daily summary of your team performance.",
    },
    {
      id: "management",
      label: "Ticket Queue",
      icon: UserGroupIcon,
      header: "Active Inquiries",
      description: "Manage incoming customer support tickets.",
      badge: stats?.open_tickets ? String(stats.open_tickets) : undefined,
    },
    {
      id: "threads",
      label: "Triage & Actions",
      icon: Message01Icon,
      header: "System Tools",
      description: "Ingest data and manage system state.",
      badge: stats?.high_priority_tickets ? String(stats.high_priority_tickets) : undefined,
    },
    {
      id: "resources",
      label: "AI Insights",
      icon: Folder02Icon,
      header: "Analytics & Breakdown",
      description: "AI-categorized ticket intelligence.",
    },
  ];

  const [activeTab, setActiveTab] = useState(TABS[0]);

  const content = useMemo(() => {
    switch (activeTab.id) {
      case "dashboard":
        return <OverviewDashboard stats={stats} />;
      case "management":
        return (
          <ManagementDashboard
            ticketsData={ticketsData}
            onInspectTicket={onInspectTicket}
            loading={loading}
          />
        );
      case "threads":
        return (
          <ThreadsDashboard
            onOpenSubmit={onOpenSubmit}
            onSeedData={onSeedData}
            seeding={seeding}
            health={health}
          />
        );
      case "resources":
        return <ResourcesDashboard stats={stats} />;
      default:
        return null;
    }
  }, [activeTab.id, stats, ticketsData, health, loading, seeding]);

  return (
    <div className="flex items-center justify-center w-full antialiased py-12 px-4 h-full min-h-screen relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-chart-4/5 blur-[120px]" />
      </div>

      <div className="group relative w-full max-w-4xl overflow-hidden rounded-3xl sm:rounded-4xl border bg-card shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-primary/10 m-0 z-10">
        
        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
           <button
             onClick={onRefresh}
             disabled={loading}
             className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
           >
             <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={14} className={loading ? "animate-spin-custom" : ""} />
           </button>
           <button
             onClick={onToggleTheme}
             className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
           >
             <HugeiconsIcon icon={theme === "dark" ? Sun01Icon : Moon02Icon} size={14} />
           </button>
        </div>

        <div className="p-4 sm:p-6 space-y-1.5 z-10 relative">
          <h2 className="text-xs text-muted-foreground uppercase ">
            Support Automation
          </h2>
          <p className="text-lg sm:text-2xl text-foreground font-medium leading-snug max-w-[480px]">
            High-performance AI analytics and autonomous triage tools in one place.
          </p>
        </div>

        <div className="relative w-full h-[350px] sm:h-[400px] overflow-hidden rounded-2xl sm:rounded-[2rem] ">
          <div className="absolute top-16 left-16 w-full h-full bg-muted rounded-3xl border border-border/50  opacity-80" />

          <div className="absolute top-8 left-24 w-full h-full bg-background rounded-tl-3xl shadow-xl flex flex-col overflow-hidden ring-6 ring-border">
            <div className="px-5 py-4 rounded-tl-3xl border-b border-border/70 flex items-center relative backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-xs  text-muted-foreground/50  uppercase">
                  Workspace
                </span>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-36 border-r border-border/30 p-2 flex flex-col gap-1 pt-6 bg-muted/5">
                <LayoutGroup>
                  {TABS.map((tab) => {
                    const isActive = activeTab.id === tab.id;
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "relative flex items-center gap-1.5 p-2 rounded-xl text-xs transition-colors cursor-pointer",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <HugeiconsIcon
                          icon={Icon}
                          size={14}
                          className="z-20 shrink-0 relative"
                        />
                        <span className="truncate z-20 relative font-medium">
                          {tab.label}
                        </span>
                        {tab.badge && (
                          <span
                            className={cn(
                              "ml-auto text-[8px] leading-none py-0.5 px-1 rounded-md tabular-nums transition-all z-20 relative",
                              isActive
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-muted text-muted-foreground border border-transparent",
                            )}
                          >
                            {tab.badge}
                          </span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="sidebar-pill"
                            className="absolute left-0 w-[2px] h-4 rounded-full bg-primary z-30 border border-primary/20"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="backgroundIndicator"
                            className="absolute inset-0 rounded-lg bg-muted border border-border/40"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.6,
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </LayoutGroup>
              </div>

              <div className="flex-1 bg-background p-5 pt-6 flex flex-col gap-4 overflow-hidden relative">
                <header className="flex flex-col gap-0.5">
                  <h3 className="text-xs font-semibold text-foreground tracking-tight line-clamp-1 uppercase opacity-60">
                    {activeTab.header}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-normal leading-tight line-clamp-1">
                    {activeTab.description}
                  </p>
                </header>

                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="flex-1 overflow-hidden"
                  >
                    {content}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-background to-transparent pointer-events-none z-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoCard;

const OverviewDashboard = ({ stats }: { stats: DashboardStats | null }) => {
  const accuracy = stats?.avg_confidence ? Math.round(stats.avg_confidence * 100) : 0;
  
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide pb-10 pr-2">
      <div className="relative p-3.5 rounded-xl border border-border/40 bg-linear-to-br from-background to-muted/20 overflow-hidden">
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-muted-foreground uppercase">
              AI Accuracy Score
            </span>
            <HugeiconsIcon
              icon={CircleArrowUpRight02Icon}
              size={12}
              className="text-primary"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-medium tracking-tight text-foreground">
              {accuracy}%
            </span>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                className="h-full bg-primary rounded-full"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <span className="text-[9px] text-muted-foreground">
            Confidence across automated ticket resolutions
          </span>
        </div>
        <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12">
          <HugeiconsIcon icon={BarChartIcon} size={64} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-foreground">{stats?.total_tickets ?? 0}</span>
            <span className="text-[8px] text-muted-foreground uppercase font-medium">
              Inquiries
            </span>
          </div>
          <HugeiconsIcon icon={Search01Icon} size={14} className="opacity-20" />
        </div>
        <div className="p-3 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-foreground">{stats?.high_priority_tickets ?? 0}</span>
            <span className="text-[8px] text-muted-foreground uppercase font-medium">
              Critical
            </span>
          </div>
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={14}
            className="opacity-20"
          />
        </div>
      </div>
    </div>
  );
};

const ManagementDashboard = ({
  ticketsData,
  onInspectTicket,
  loading,
}: {
  ticketsData: TicketListResponse | null;
  onInspectTicket: (t: Ticket) => void;
  loading: boolean;
}) => (
  <div className="flex flex-col h-full not-prose pb-10">
    <div className="rounded-xl border border-border/40 overflow-hidden flex flex-col h-full bg-background/50">
      <div className="bg-muted/30 px-3 py-2 border-b border-border/40 flex items-center justify-between">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
          Active Tickets
        </span>
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-background border border-border/40">
          <HugeiconsIcon
            icon={Search01Icon}
            size={10}
            className="text-muted-foreground/50"
          />
          <span className="text-[8px] text-muted-foreground font-medium">
            Search
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-1 flex flex-col gap-0.5">
        {loading ? (
          <div className="text-center py-6 text-muted-foreground text-[10px]">Loading...</div>
        ) : !ticketsData?.tickets.length ? (
          <div className="text-center py-6 text-muted-foreground text-[10px]">No tickets found.</div>
        ) : (
          ticketsData.tickets.map((ticket) => {
            let color = "bg-muted";
            if (ticket.status === "Open") color = "bg-primary";
            else if (ticket.status === "In Progress") color = "bg-amber-400";

            else if (ticket.status === "Resolved") color = "bg-emerald-400";

            return (
              <div
                key={ticket.id}
                onClick={() => onInspectTicket(ticket)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-muted border border-border/40 flex items-center justify-center relative shrink-0">
                  <HugeiconsIcon
                    icon={UserIcon}
                    size={10}
                    className="text-muted-foreground"
                  />
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                      color,
                    )}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-medium text-foreground truncate">
                    {ticket.subject}
                  </span>
                  <span className="text-[8px] text-muted-foreground truncate">
                    {ticket.customer_name} • {ticket.category}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <HugeiconsIcon
                    icon={ViewIcon}
                    size={12}
                    className="text-muted-foreground"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

const ThreadsDashboard = ({
  onOpenSubmit,
  onSeedData,
  seeding,
  health,
}: {
  onOpenSubmit: () => void;
  onSeedData: () => void;
  seeding: boolean;
  health: HealthCheckResponse | null;
}) => (
  <div className="flex flex-col gap-3 h-full pb-10">
    <div className="grid grid-cols-2 gap-3">
      <div
        onClick={onOpenSubmit}
        className="p-3.5 rounded-xl border border-border/40 bg-background/50 flex flex-col gap-3 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div className="flex flex-col gap-1 z-10">
          <span className="text-[12px] font-medium text-foreground leading-tight">
            Ingest Ticket
          </span>
          <span className="text-[9px] text-muted-foreground leading-tight">
            Manually trigger AI pipeline.
          </span>
        </div>
        <button className="w-fit flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground text-background text-[8px] font-semibold transition-transform active:scale-95 group-hover:bg-primary z-10">
          <HugeiconsIcon icon={Add01Icon} size={8} strokeWidth={3} />
          Create
        </button>
      </div>

      <div
        onClick={onSeedData}
        className={cn(
          "p-3.5 rounded-xl border border-border/40 bg-background/50 flex flex-col gap-3 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors",
          seeding && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-1 z-10">
          <span className="text-[12px] font-medium text-foreground leading-tight">
            Seed Database
          </span>
          <span className="text-[9px] text-muted-foreground leading-tight">
            Load sample test data.
          </span>
        </div>
        <button className="w-fit flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground text-background text-[8px] font-semibold transition-transform active:scale-95 group-hover:bg-primary z-10">
          <HugeiconsIcon icon={DatabaseIcon} size={8} strokeWidth={3} />
          {seeding ? "Loading..." : "Seed"}
        </button>
      </div>
    </div>

    <div className="mt-auto p-3 rounded-xl bg-muted/20 border border-border/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1 px-1.5 rounded-md bg-background border border-border/40">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={10}
            className="text-muted-foreground"
          />
        </div>
        <span className="text-[9px] text-muted-foreground font-medium">
          {health?.gemini_api_configured ? "Gemini Live" : "System Fallback"}
        </span>
      </div>
      <div className={cn("w-1.5 h-1.5 rounded-full pulse-dot", health?.gemini_api_configured ? "bg-emerald-500" : "bg-amber-500")} />
    </div>
  </div>
);

const ResourcesDashboard = ({ stats }: { stats: DashboardStats | null }) => {
  const categories = stats?.category_breakdown ?? [];
  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden pb-10">
      <div className="flex-1 rounded-xl border border-border/40 flex flex-col bg-background/50 overflow-hidden">
        <div className="bg-muted/30 px-3 py-2 border-b border-border/40 flex items-center justify-between">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Category Analytics
          </span>
          <HugeiconsIcon
            icon={DatabaseIcon}
            size={12}
            className="text-muted-foreground/30"
          />
        </div>
        <div className="flex-1 p-1 overflow-y-auto scrollbar-hide">
          {categories.length === 0 ? (
            <div className="text-center py-4 text-[10px] text-muted-foreground">No data</div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
              >
                <div className="w-6 h-6 rounded-md bg-muted/50 border border-border/40 flex items-center justify-center text-muted-foreground/60 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                  <HugeiconsIcon icon={Folder02Icon} size={12} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[10px] font-medium text-foreground truncate">
                    {cat.category}
                  </span>
                  <div className="w-full h-0.5 bg-muted rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(cat.percentage, 5)}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  {cat.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
