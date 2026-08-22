import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Bot, Lock, Mail, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { hasSupabaseConfig, supabase } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { session, isStaff } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to={isStaff ? '/' : '/support'} replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) { setError('Authentication is not configured. Please contact support.'); return; }
    setLoading(true); setError(null); setMessage(null);
    const result = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) { setError(result.error.message); return; }
    if (isSignUp && !result.data.session) setMessage('Account created. Check your email to confirm your account, then sign in.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden"><div className="absolute -top-40 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" /><div className="absolute -bottom-40 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" /></div>
      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center"><div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 mb-4"><Bot className="w-8 h-8 text-white" /></div><h1 className="text-3xl font-bold text-white">Support Center</h1><p className="text-slate-400 mt-2">{isSignUp ? 'Create an account to submit a support request.' : 'Sign in to submit and manage your request.'}</p></div>
        <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            {message && <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">{message}</div>}
            {isSignUp && <label className="block text-sm font-medium text-slate-300">Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1.5 w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Your name" /></label>}
            <label className="block text-sm font-medium text-slate-300">Email<div className="relative mt-1.5"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="name@company.com" /></div></label>
            <label className="block text-sm font-medium text-slate-300">Password<div className="relative mt-1.5"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="At least 6 characters" /></div></label>
            <button disabled={loading || !hasSupabaseConfig} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"><span>{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</span>{isSignUp ? <UserPlus className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}</button>
          </form>
          <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="w-full mt-5 text-sm text-blue-400 hover:text-blue-300">{isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
          <p className="mt-6 text-center text-xs text-slate-500">Support staff sign in here to access the operations dashboard.</p>
        </section>
      </motion.main>
    </div>
  );
};
