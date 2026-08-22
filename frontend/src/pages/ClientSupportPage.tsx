import React, { useState } from 'react';
import { LogOut, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../services/tickets';

export const ClientSupportPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.email) return;
    setSubmitting(true); setError(null); setTicketNumber(null);
    try {
      const ticket = await ticketService.submitTicket({
        customer_name: String(user.user_metadata.full_name || user.email.split('@')[0]),
        customer_email: user.email,
        subject,
        message,
      });
      setTicketNumber(ticket.ticket_number);
      setSubject(''); setMessage('');
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'We could not submit your request. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur"><div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between"><div className="flex items-center gap-2"><div className="rounded-lg bg-blue-600 p-1.5"><Sparkles className="h-4 w-4" /></div><span className="font-semibold">Support Center</span></div><button onClick={() => void signOut()} className="text-sm text-slate-400 hover:text-white flex gap-2 items-center"><LogOut className="h-4 w-4" />Sign out</button></div></header>
      <main className="max-w-3xl mx-auto px-5 py-14"><div className="mb-9"><p className="text-blue-400 text-sm font-medium">Hello{user?.user_metadata.full_name ? `, ${String(user.user_metadata.full_name)}` : ''}</p><h1 className="text-3xl font-bold mt-2">How can we help?</h1><p className="text-slate-400 mt-3">Describe the issue and our support team will receive an AI-triaged ticket right away.</p></div>
        {ticketNumber ? <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5"><div className="flex gap-3"><ShieldCheck className="text-emerald-400 shrink-0" /><div><h2 className="font-semibold text-emerald-100">Your request was submitted</h2><p className="text-sm text-emerald-200/80 mt-1">Reference number: <strong>{ticketNumber}</strong>. Our support team will follow up using {user?.email}.</p></div></div></div> : null}
        <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5">
          {error ? <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3">{error}</div> : null}
          <label className="block text-sm font-medium">Contact email<input value={user?.email || ''} disabled className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-slate-400" /></label>
          <label className="block text-sm font-medium">What do you need help with?<input value={subject} onChange={(e) => setSubject(e.target.value)} minLength={3} maxLength={256} required placeholder="For example: I cannot access my account" className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
          <label className="block text-sm font-medium">Tell us what happened<textarea value={message} onChange={(e) => setMessage(e.target.value)} minLength={10} maxLength={10000} required rows={7} placeholder="Include what you were trying to do, any error message, and when it started." className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" /></label>
          <button disabled={submitting} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 font-medium disabled:opacity-50"><Send className="h-4 w-4" />{submitting ? 'Submitting…' : 'Submit support request'}</button>
        </form>
      </main>
    </div>
  );
};
