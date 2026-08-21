import React from "react";
import { useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Notification01Icon,
  Sun01Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";

interface TopbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ theme, onToggleTheme }) => {
  const location = useLocation();

  // Simple breadcrumb generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    const name = path.replace("/", "");
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-muted-foreground/70">Workspace</span>
        <span className="text-muted-foreground/50">/</span>
        <span>{getBreadcrumbs()}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Search */}
        <div className="relative group flex items-center">
          <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-64 h-8 bg-surface border border-border rounded-md pl-8 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          <div className="absolute right-2 text-[10px] text-muted-foreground/70 font-medium px-1 rounded border border-border/50 bg-background pointer-events-none">
            ⌘K
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-surface transition-colors"
          >
            <HugeiconsIcon icon={theme === "dark" ? Sun01Icon : Moon02Icon} size={16} />
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-surface transition-colors relative">
            <HugeiconsIcon icon={Notification01Icon} size={16} />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </header>
  );
};
