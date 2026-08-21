import React from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ViewIcon,
  Tick01Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { Ticket, TicketListResponse } from "../types";
import { StatusBadge } from "./StatusBadge";

interface TicketTableProps {
  data: TicketListResponse | null;
  loading: boolean;
  activeStatusTab: string;
  onSelectStatusTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onInspectTicket: (ticket: Ticket) => void;
  onQuickResolve: (ticketId: number) => void;
}

const STATUS_TABS = ["All", "Open", "In Progress", "Resolved", "Critical/High"];

export const TicketTable: React.FC<TicketTableProps> = ({
  data,
  loading,
  activeStatusTab,
  onSelectStatusTab,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  currentPage,
  onPageChange,
  onInspectTicket,
  onQuickResolve,
}) => {
  const tickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  const handleCopyResponse = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-border/40 bg-card overflow-hidden"
    >
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-border/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Segmented Tabs */}
        <div className="inline-flex items-center p-0.5 bg-muted rounded-lg border border-border/40 gap-0.5 self-start">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onSelectStatusTab(tab)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer",
                activeStatusTab === tab
                  ? "bg-card text-foreground shadow-xs border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[180px]">
            <HugeiconsIcon
              icon={Search01Icon}
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-2.5 py-1.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Billing & Payments">Billing & Payments</option>
            <option value="Account Access">Account Access</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Bug Report">Bug Report</option>
            <option value="General Feedback">General Feedback</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-2.5 py-1.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="bg-muted/30 text-muted-foreground uppercase text-[9px] font-bold border-b border-border/40 tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Ticket</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Subject & Summary</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Priority</th>
              <th className="py-2.5 px-4">Sentiment</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-muted-foreground">
                  <div className="inline-flex items-center gap-2 text-[11px] font-medium">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin-custom" />
                    <span>Loading inquiries...</span>
                  </div>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-muted-foreground text-[11px] font-medium">
                  No tickets found. Try adjusting your filters or load samples.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onInspectTicket(t)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-primary text-[10px]">
                    {t.ticket_number}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-[11px]">{t.customer_name}</span>
                      <span className="text-[9px] text-muted-foreground truncate max-w-[130px]">{t.customer_email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-[260px]">
                    <div className="font-semibold text-foreground text-[11px] truncate">{t.subject}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{t.summary}</div>
                  </td>
                  <td className="py-3 px-4"><StatusBadge type="category" value={t.category} /></td>
                  <td className="py-3 px-4"><StatusBadge type="priority" value={t.priority} /></td>
                  <td className="py-3 px-4"><StatusBadge type="sentiment" value={t.sentiment} /></td>
                  <td className="py-3 px-4"><StatusBadge type="status" value={t.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onInspectTicket(t)}
                        className="px-2 py-1 text-[10px] font-semibold rounded-md bg-foreground text-background hover:bg-primary transition-colors inline-flex items-center gap-1 active:scale-95"
                        title="Inspect"
                      >
                        <HugeiconsIcon icon={ViewIcon} size={11} />
                        <span>Inspect</span>
                      </button>
                      {t.status !== "Resolved" && t.status !== "Closed" && (
                        <button
                          onClick={() => onQuickResolve(t.id)}
                          className="p-1 rounded-md bg-muted/50 text-emerald-500 hover:bg-muted border border-border/40 transition-colors"
                          title="Resolve"
                        >
                          <HugeiconsIcon icon={Tick01Icon} size={13} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleCopyResponse(e, t.suggested_response)}
                        className="p-1 rounded-md bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40 transition-colors"
                        title="Copy Response"
                      >
                        <HugeiconsIcon icon={Copy01Icon} size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          <strong className="text-foreground">{tickets.length}</strong> of <strong className="text-foreground">{total}</strong> inquiries
        </span>
        <div className="flex items-center gap-2 font-medium">
          <button
            disabled={currentPage <= 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded-md border border-border/40 bg-background hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={13} />
          </button>
          <span className="tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 rounded-md border border-border/40 bg-background hover:bg-muted disabled:opacity-30 transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowRight02Icon} size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
