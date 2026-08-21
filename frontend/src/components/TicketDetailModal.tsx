import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  SparklesIcon,
  SentIcon,
  Copy01Icon,
  Tick01Icon,
  UserIcon,
  Mail01Icon,
  Calendar01Icon,
  FileTextIcon,
  Target01Icon,
  Settings02Icon,
  Tag01Icon,
  ArrowReloadHorizontalIcon,
} from "@hugeicons/core-free-icons";
import type { Ticket, TicketStatus } from "../types";

import { StatusBadge } from "./StatusBadge";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdateStatus: (ticketId: number, status: TicketStatus, notes?: string) => Promise<void>;
  onReanalyze: (ticketId: number) => Promise<void>;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onUpdateStatus,
  onReanalyze,
}) => {
  if (!ticket) return null;

  const [copied, setCopied] = useState(false);
  const [editedResponse, setEditedResponse] = useState(ticket.suggested_response);
  const [agentNotes, setAgentNotes] = useState(ticket.agent_notes || "");
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setStatus(newStatus);
    await onUpdateStatus(ticket.id, newStatus, agentNotes);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await onUpdateStatus(ticket.id, "Resolved", agentNotes);
      onClose();
    } finally {
      setSending(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await onReanalyze(ticket.id);
    } finally {
      setReanalyzing(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border/40 shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-[11px] text-primary">{ticket.ticket_number}</span>
              <StatusBadge type="priority" value={ticket.priority} />
              <StatusBadge type="status" value={status} />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="px-2 py-1 text-[10px] bg-background border border-border/40 rounded-lg text-foreground cursor-pointer focus:outline-none font-medium"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg border border-border/40 bg-background hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={11} className={reanalyzing ? "animate-spin-custom" : ""} />
                <span>{reanalyzing ? "Analyzing..." : "Re-analyze"}</span>
              </button>
              <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Customer & Message */}
            <div className="flex flex-col gap-3">
              {/* Customer Card */}
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 flex flex-col gap-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <HugeiconsIcon icon={UserIcon} size={11} />
                  <span>Customer</span>
                </div>
                <div className="font-semibold text-foreground text-sm">{ticket.customer_name}</div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                  <HugeiconsIcon icon={Mail01Icon} size={11} />
                  <span>{ticket.customer_email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                  <HugeiconsIcon icon={Calendar01Icon} size={11} />
                  <span>{formatDate(ticket.created_at)}</span>
                </div>
              </div>

              {/* Message */}
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <HugeiconsIcon icon={FileTextIcon} size={11} />
                  <span>Original Message</span>
                </div>
                <div className="font-semibold text-foreground text-xs">{ticket.subject}</div>
                <div className="p-3 rounded-lg bg-background border border-border/40 text-[11px] text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {ticket.message}
                </div>
              </div>

              {/* Notes */}
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 flex flex-col gap-2">
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Internal Notes
                </span>
                <textarea
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Private team notes..."
                  className="w-full p-2 bg-background border border-border/40 rounded-lg text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 min-h-[50px] resize-none"
                />
              </div>
            </div>

            {/* Right: AI Insights & Response */}
            <div className="flex flex-col gap-3">
              {/* AI Insights */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                    <HugeiconsIcon icon={SparklesIcon} size={13} />
                    <span>Gemini AI Insights</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground tabular-nums">
                    {Math.round(ticket.confidence_score * 100)}% confidence
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge type="category" value={ticket.category} />
                  <StatusBadge type="sentiment" value={ticket.sentiment} />
                  <StatusBadge type="priority" value={ticket.priority} />
                </div>

                <div className="text-[11px] text-card-foreground leading-relaxed">
                  <strong className="text-foreground">Summary: </strong>
                  {ticket.summary}
                </div>

                <div className="text-[10px]">
                  <div className="flex items-center gap-1 text-primary font-semibold mb-0.5">
                    <HugeiconsIcon icon={Target01Icon} size={11} />
                    <span>Intent:</span>
                  </div>
                  <div className="text-muted-foreground">{ticket.customer_intent}</div>
                </div>

                <div className="text-[10px]">
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold mb-0.5">
                    <HugeiconsIcon icon={Settings02Icon} size={11} />
                    <span>Action:</span>
                  </div>
                  <div className="text-muted-foreground">{ticket.suggested_action}</div>
                </div>

                {ticket.key_entities?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-semibold mb-1">
                      <HugeiconsIcon icon={Tag01Icon} size={10} />
                      <span>Entities:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ticket.key_entities.map((ent, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-background border border-border/40 rounded-md text-[9px] font-mono text-foreground">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Response */}
              <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">Suggested Response</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium rounded-md bg-background border border-border/40 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={10} className={copied ? "text-emerald-500" : ""} />
                    <span className={copied ? "text-emerald-500" : ""}>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border/40 rounded-lg text-[11px] text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/30 flex-1 min-h-[120px] resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold rounded-lg bg-foreground text-background hover:bg-primary transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <HugeiconsIcon icon={SentIcon} size={12} />
                    <span>{sending ? "Sending..." : "Send & Resolve"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
