// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signUpNewUser } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  deleteUser: (options?: { softDelete?: boolean }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state with Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Signup function
  const signUp = async (email: string, password: string, displayName?: string) => {
    return await signUpNewUser({ email, password, displayName });
  };

  // Login function
 const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (!data.session) return { success: false, error: 'Login failed' };

    // Fetch profile to check soft delete
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('deleted_at')
      .eq('user_id', data.user.id)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (profileData?.deleted_at) {
      // Soft-deleted account, sign out immediately
      await supabase.auth.signOut();
      return { success: false, error: 'This account has been deleted.' };
    }

    setUser(data.user);
    setSession(data.session);
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

  // Delete user function (calls serverless function)
  // inside AuthProvider

const deleteUser = async ({ softDelete = false }: { softDelete?: boolean } = {}) => {
  if (!user) return { success: false, error: 'No user logged in' };

  try {
    if (softDelete) {
      // Soft delete: mark profile as deleted
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Optionally sign out user
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return { success: true };
    } else {
      // Hard delete: call serverless function
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(null);
        setSession(null);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};


  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { success: !error, error: error?.message };
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, loginUser, deleteUser, signOut, resetPassword, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
