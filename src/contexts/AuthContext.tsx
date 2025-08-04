import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

// Export the useAuth hook at the top level instead of at the bottom
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
        
        // Set up auth state change listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession);
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
        });

        // THEN get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error('Error initializing auth:', error);
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
      // Set up redirect URL for email confirmation
      const redirectUrl = `https://email-verification-woad.vercel.app/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData.name,
            phone: userData.phone,
          }
        }
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('User already registered')) {
          toast('Account already exists', {
            description: 'This email is already registered. Please try signing in instead.'
          });
          throw new Error('Account already exists');
        } else if (error.message.includes('confirmation email')) {
          toast('Email service temporarily unavailable', {
            description: 'Please try again in a few minutes or contact support.'
          });
          throw new Error('Email service error');
        } else {
          toast('Account creation failed', {
            description: error.message || 'Please try again.'
          });
          throw error;
        }
      }

      // Success - user created but needs email verification
      if (data.user && !data.session) {
        toast('Account created successfully', {
          description: 'Please check your inbox and spam folder to confirm your account before signing in.'
        });
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      // Don't show duplicate toast - already handled above
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

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast('Login failed', {
            description: 'Invalid email or password. Please try again.'
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast('Email not verified', {
            description: 'Please check your email and click the verification link before signing in.'
          });
        } else {
          toast('Login failed', {
            description: error.message || 'Please try again.'
          });
        }
        throw error;
      }
      
      // Success toast will be handled by auth state change
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast('Google sign-in failed', {
          description: 'Unable to sign in with Google. Please try again.'
        });
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
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
        loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
