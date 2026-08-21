import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Ticket02Icon,
  Message01Icon,
  Folder02Icon,
  BarChartIcon,
  UserGroupIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface SidebarProps {
  apiStatus: "healthy" | "error" | "loading";
  version: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ apiStatus, version }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const workspaces = [
    { name: "Dashboard", path: "/", icon: DashboardSquare01Icon },
    { name: "Tickets", path: "/tickets", icon: Ticket02Icon },
    { name: "Triage & Actions", path: "/triage", icon: Message01Icon },
    { name: "AI Insights", path: "/insights", icon: Folder02Icon },
  ];

  const management = [
    { name: "Analytics", path: "/analytics", icon: BarChartIcon },
    { name: "Team", path: "/team", icon: UserGroupIcon },
    { name: "Settings", path: "/settings", icon: Settings02Icon },
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-background border-r border-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
            AI
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Support Automation
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6 scrollbar-hide">
        {/* Workspaces */}
        <div className="flex flex-col gap-1">
          <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Workspace
          </span>
          {workspaces.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-surface-hover text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                <HugeiconsIcon icon={item.icon} size={16} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Management */}
        <div className="flex flex-col gap-1">
          <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Management
          </span>
          {management.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-surface-hover text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                <HugeiconsIcon icon={item.icon} size={16} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Engine Status */}
      <div className="p-4 border-t border-border/50 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              AI Engine
            </span>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  apiStatus === "healthy" ? "bg-success pulse-dot" : "bg-destructive"
                )}
              />
              <span className="text-xs font-medium text-foreground">
                Gemini 2.5 Flash
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {apiStatus === "healthy" ? "Operational" : "Degraded"} (v{version})
            </span>
          </div>

          <div className="flex items-center gap-2 pt-3 mt-1 border-t border-border/50">
            <div className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[10px] font-medium">
              JS
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground leading-tight">Jane Smith</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Support Manager</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
