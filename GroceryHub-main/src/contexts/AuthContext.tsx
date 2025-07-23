import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";

import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string, userData: { name: string; phone: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, currentSession) => {
            if (mounted) {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
            }
          }
        );
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: { name: string; phone: string }
  ) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://email-verification-woad.vercel.app/',
          data: {
            name: userData.name,
            phone: userData.phone,
          }
        }
      });

      if (error) throw error;

      toast('Account created successfully', {
        description: 'Please check your email to confirm your account.',
      });
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';

      if (msg.includes('already') && msg.includes('email')) {
        toast('Email already exists', {
          description: 'Please log in or reset your password.',
        });
      } else {
        toast('Signup failed', {
          description: error?.message || 'Unable to create your account.',
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast('Welcome back!');
    } catch (error: any) {
      const msg = error?.message?.toLowerCase() || '';

      if (
        msg.includes('invalid login credentials') ||
        msg.includes('user not found') ||
        msg.includes('no user found')
      ) {
        toast('Login failed', {
          description: 'No account found. Please sign up first.',
        });
      } else {
        toast('Login failed', {
          description: error?.message || 'Unable to log you in.',
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast('Google sign-in failed', {
        description: error?.message || 'Please try again.',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setSession(null);
      toast('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast('Sign out failed', {
        description: error?.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);

      if (!user || !session) {
        throw new Error("No user is logged in");
      }

      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      await signOut(); // Will clear session and local data

      toast('Account deleted successfully', {
        description: 'Your account has been permanently deleted.',
      });

      window.location.href = '/login';
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast('Account deletion failed', {
        description: error?.message || 'Please try again.',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        deleteAccount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
