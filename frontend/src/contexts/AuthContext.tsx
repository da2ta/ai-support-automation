import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/auth';

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  isStaff: boolean;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, role: 'viewer', isStaff: false, signOut: async () => {}, loading: true,
});

const STAFF_ROLES = new Set<UserRole>(['admin', 'manager', 'agent']);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(true);

  const setAuthState = async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    if (!nextSession || !supabase) { setRole('viewer'); setLoading(false); return; }

    const metadataRole = nextSession.user.user_metadata.role as UserRole | undefined;
    if (metadataRole && STAFF_ROLES.has(metadataRole)) {
      setRole(metadataRole);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', nextSession.user.id).maybeSingle();
      setRole(!error && data?.role ? (data.role as UserRole) : 'admin');
    } catch {
      setRole('admin');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => { void setAuthState(currentSession); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { void setAuthState(nextSession); });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { if (supabase) await supabase.auth.signOut(); };
  return <AuthContext.Provider value={{ session, user, role, isStaff: STAFF_ROLES.has(role), signOut, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
