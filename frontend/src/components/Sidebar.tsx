import React from "react";
import { motion, LayoutGroup } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Ticket02Icon,
  BarChartIcon,
  FlashIcon,
  DatabaseIcon,
  Moon02Icon,
  Sun01Icon,
  ShieldCheckIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { HealthCheckResponse } from "../types";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  health: HealthCheckResponse | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onSeedData: () => void;
  seeding: boolean;
  totalTickets: number;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: DashboardSquare01Icon },
  { id: "tickets", label: "Ticket Queue", icon: Ticket02Icon, hasBadge: true },
  { id: "analytics", label: "AI Analytics", icon: BarChartIcon },
  { id: "triage", label: "Live Triage", icon: FlashIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  health,
  theme,
  onToggleTheme,
  onSeedData,
  seeding,
  totalTickets,
}) => {
  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col justify-between h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <HugeiconsIcon icon={FlashIcon} size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-sidebar-foreground leading-none">
                Support AI
              </h2>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                Autonomous Triage
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 pt-4 flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Menu
          </span>
          <LayoutGroup>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer w-full text-left",
                    isActive
                      ? "text-sidebar-foreground"
                      : "text-muted-foreground hover:text-sidebar-foreground"
                  )}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={15}
                    className="z-20 shrink-0 relative"
                  />
                  <span className="truncate z-20 relative font-medium">
                    {item.label}
                  </span>

                  {item.hasBadge && totalTickets > 0 && (
                    <span
                      className={cn(
                        "ml-auto text-[8px] leading-none py-0.5 px-1.5 rounded-md tabular-nums transition-all z-20 relative font-bold",
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground border border-transparent"
                      )}
                    >
                      {totalTickets}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute left-0 w-[2px] h-4 rounded-full bg-primary z-30"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-xl bg-sidebar-accent border border-sidebar-border/40"
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
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 flex flex-col gap-2 border-t border-sidebar-border/50">
        {/* System Health */}
        {health && (
          <div className="p-2.5 rounded-xl border border-sidebar-border/40 bg-muted/30 flex items-center gap-2">
            <HugeiconsIcon
              icon={ShieldCheckIcon}
              size={14}
              className={health.gemini_api_configured ? "text-emerald-500" : "text-amber-500"}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-sidebar-foreground truncate">
                {health.gemini_api_configured ? "Gemini Live" : "Fallback Mode"}
              </span>
              <span className="text-[8px] text-muted-foreground truncate">
                {health.gemini_model}
              </span>
            </div>
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                health.gemini_api_configured ? "bg-emerald-500 pulse-dot" : "bg-amber-500"
              )}
            />
          </div>
        )}

        {/* Seed Data */}
        <button
          onClick={onSeedData}
          disabled={seeding}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-muted/30 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <HugeiconsIcon icon={DatabaseIcon} size={14} />
          <span>{seeding ? "Seeding..." : "Load Samples"}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-muted/30 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={theme === "dark" ? Sun01Icon : Moon02Icon} size={14} />
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
};
