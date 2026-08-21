import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  SparklesIcon,
  SentIcon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import type { TicketCreateInput } from "../types";

interface SubmitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: TicketCreateInput) => Promise<void>;
}

const PRESETS = [
  {
    label: "🔥 Outage",
    name: "Elena Rostova",
    email: "elena.rostova@acmecorp.com",
    subject: "CRITICAL: Production Payment Gateway returning 500 errors",
    message: "Our checkout pipeline is completely halted right now. All customers attempting to pay via Stripe are receiving HTTP 500 Internal Server Error (Error Code: PAY-5001). We have lost approximately $15,000 in transactions in the last 45 minutes. Please investigate and escalate immediately!",
  },
  {
    label: "💳 Billing",
    name: "Marcus Vance",
    email: "marcus.vance@techscale.io",
    subject: "Double charged on monthly Enterprise subscription #INV-88392",
    message: "Hello, I noticed on our corporate credit card statement that our company was billed $499 twice on March 1st for invoice #INV-88392. Can you please check our account and process a refund of $499 back to the original card?",
  },
  {
    label: "🔐 2FA Lock",
    name: "Sarah Jenkins",
    email: "sarah.j@designco.org",
    subject: "Locked out of account - MFA device replaced",
    message: "Hi support team, I got a new phone over the weekend and lost access to my Google Authenticator 2FA tokens. I am unable to log in to my admin dashboard (user: sarah.j@designco.org). Can you please trigger an account verification and reset my 2FA?",
  },
  {
    label: "💡 Feature",
    name: "David Kim",
    email: "dkim@startupnexus.dev",
    subject: "Feature Request: Native Webhook support for Zendesk integration",
    message: "We love using your platform! One feature that would save our engineering team hours each week is native webhook dispatching whenever a ticket status changes, specifically compatible with Zendesk and Slack.",
  },
  {
    label: "🐛 Bug",
    name: "Amanda Lopez",
    email: "amanda.lopez@globalretail.com",
    subject: "Analytics export button missing in Safari 17",
    message: "When accessing the analytics reports page in Safari 17.3 on macOS, the 'Export CSV' button does not render at all. It works fine in Chrome. Can you look into this browser compatibility glitch?",
  },
];

export const SubmitTicketModal: React.FC<SubmitTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setName(p.name);
    setEmail(p.email);
    setSubject(p.subject);
    setMessage(p.message);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setStep("Validating schema...");
    try {
      setTimeout(() => setStep("Analyzing sentiment & priority..."), 400);
      setTimeout(() => setStep("Generating AI response..."), 900);
      await onSubmit({ customer_name: name, customer_email: email, subject, message });
      setName(""); setEmail(""); setSubject(""); setMessage("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
      setStep("");
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
          className="bg-card w-full max-w-xl max-h-[90vh] rounded-2xl border border-border/40 shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground">
              <HugeiconsIcon icon={SparklesIcon} size={14} className="text-primary" />
              <span>Submit Support Inquiry</span>
            </div>
            <button onClick={onClose} disabled={submitting} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex flex-col gap-4">
            {/* Presets */}
            <div>
              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <HugeiconsIcon icon={FlashIcon} size={11} className="text-amber-500" />
                <span>Quick Presets</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyPreset(p)}
                    disabled={submitting}
                    className="px-2 py-1.5 text-[10px] font-medium rounded-lg bg-muted/50 hover:bg-accent hover:text-accent-foreground border border-border/40 transition-colors truncate cursor-pointer active:scale-95"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-medium">
                {error}
              </div>
            )}

            {submitting ? (
              <div className="p-10 rounded-xl bg-muted/30 border border-dashed border-border/40 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
                >
                  <HugeiconsIcon icon={SparklesIcon} size={20} />
                </motion.div>
                <div className="text-center">
                  <h4 className="font-semibold text-foreground text-xs mb-0.5">Gemini is analyzing</h4>
                  <p className="text-[10px] text-muted-foreground">{step}</p>
                </div>
              </div>
            ) : (
              <form id="ticket-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Name *</label>
                    <input type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-1.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
                    <input type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-1.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Subject *</label>
                  <input type="text" placeholder="Issue summary" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-3 py-1.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Message *</label>
                  <textarea placeholder="Paste message here..." value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="w-full p-2.5 text-[11px] bg-background border border-border/40 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-2">
            <button onClick={onClose} disabled={submitting} className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border/40 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" form="ticket-form" disabled={submitting} className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold rounded-lg bg-foreground text-background hover:bg-primary transition-colors cursor-pointer active:scale-95 disabled:opacity-50">
              {submitting ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-background border-t-transparent animate-spin-custom" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SentIcon} size={12} />
                  <span>Submit & Analyze</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
