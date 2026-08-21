import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowReloadHorizontalIcon,
} from "@hugeicons/core-free-icons";

interface HeaderProps {
  activeTabTitle: string;
  loading: boolean;
  onRefresh: () => void;
  onOpenSubmit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTabTitle,
  loading,
  onRefresh,
  onOpenSubmit,
}) => {
  return (
    <header className="h-14 border-b border-border/70 bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 mr-3">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
        </div>
        <h1 className="text-xs font-semibold text-foreground uppercase tracking-tight opacity-60 capitalize">
          {activeTabTitle}
        </h1>
        <span className="text-[10px] text-muted-foreground hidden sm:inline-block">
          — Autonomous Support Engine
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border/40 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
        >
          <HugeiconsIcon
            icon={ArrowReloadHorizontalIcon}
            size={12}
            className={loading ? "animate-spin-custom" : ""}
          />
          <span>Refresh</span>
        </button>

        <button
          onClick={onOpenSubmit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold rounded-lg bg-foreground text-background hover:bg-primary transition-colors cursor-pointer active:scale-95"
        >
          <HugeiconsIcon icon={Add01Icon} size={12} strokeWidth={3} />
          <span>Ingest Ticket</span>
        </button>
      </div>
    </header>
  );
};
