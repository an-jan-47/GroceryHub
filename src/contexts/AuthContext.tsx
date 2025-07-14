
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
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
        console.log('Initializing auth...');
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: Session | null) => {
          console.log('Auth state changed:', event, currentSession);
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth...');
      mounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string, userData: { name: string; phone: string }) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            phone: userData.phone,
          }
        }
      });

      if (error) throw error;
      
      toast('Account created successfully', {
        description: 'Please check your email to confirm your account'
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast('Error creating account', {
        description: error.message || 'Unable to create your account. Please try again later.'
      });
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
      console.error('Login error:', error);
      toast('Login failed', {
        description: error.message || 'Invalid email or password'
      });
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
        description: 'Unable to sign in with Google. Please try again.'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      toast('Password reset email sent', {
        description: 'Check your email for the password reset link'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast('Error sending reset email', {
        description: error.message || 'Unable to send reset email. Please try again.'
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
      toast('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast('Sign out failed', {
        description: 'Unable to sign out. Please try again.'
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
      
      console.log('Starting account deletion process for user:', user.id);
      
      // Call our edge function to delete the account
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Error calling delete function:', error);
        throw error;
      }
      
      console.log('Account deletion response:', data);
      
      // Clear local storage and session
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out locally (the user is already deleted on the server)
      await supabase.auth.signOut();
      
      // Reset local state
      setUser(null);
      setSession(null);
      
      toast('Account deleted successfully', {
        description: 'Your account has been permanently deleted.'
      });
      
      // Force redirect to login page
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error('Account deletion error:', error);
      
      toast('Account deletion failed', {
        description: 'Unable to delete your account. Please try again later.'
      });
      
      throw new Error('Account deletion failed');
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
        resetPassword,
        loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
