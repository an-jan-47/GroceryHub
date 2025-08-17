
import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

// Export the useAuth hook at the top level instead of at the bottom
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set up auth state change listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, currentSession: any) => {
          console.log('Auth state changed:', event, 'Session:', currentSession?.user?.email || 'No user');
          
          if (!mounted) return;

          // Handle different auth events
          if (event === 'SIGNED_IN' && currentSession?.user) {
            console.log('User signed in:', currentSession.user.email);
            setSession(currentSession);
            setUser(currentSession.user);
            
            // Delay the success toast to ensure UI is ready
            setTimeout(() => {
              toast('Welcome back!', {
                description: `Signed in as ${currentSession.user.email}`
              });
            }, 300);
            
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setSession(null);
            setUser(null);
            
          } else if (event === 'TOKEN_REFRESHED' && currentSession) {
            console.log('Token refreshed for:', currentSession.user?.email);
            setSession(currentSession);
            setUser(currentSession.user);
            
          } else if (event === 'USER_UPDATED' && currentSession) {
            console.log('User updated:', currentSession.user?.email);
            setSession(currentSession);
            setUser(currentSession.user);
          }
        });

        // THEN get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession, 'Error:', sessionError);
        
        if (mounted && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          console.log('User authenticated on init:', initialSession.user.email);
        }

        if (mounted) {
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
      console.log('Starting signup for:', email);
      
      // Use the current origin for redirect
      const redirectUrl = `${window.location.origin}/`;
      console.log('Using redirect URL:', redirectUrl);
      
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
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
          toast('Account already exists', {
            description: 'This email is already registered. Please try signing in instead.'
          });
          throw new Error('Account already exists');
        } else {
          toast('Account creation failed', {
            description: error.message || 'Please try again.'
          });
          throw error;
        }
      }

      console.log('Signup response:', data);
      
      // Success - user created but needs email verification
      if (data.user && !data.session) {
        toast('Account created successfully', {
          description: 'Please check your email to confirm your account before signing in.'
        });
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting signin for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Signin error:', error);
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
      
      console.log('Signin successful:', data.user?.email);
      // Success handling will be done by onAuthStateChange
      
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
      console.log('Starting Google sign-in...');
      
      const isCapacitor = !!(window as any).Capacitor;
      
      if (isCapacitor) {
        // For Capacitor/mobile app - open in external browser
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'groceryhub://auth',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            skipBrowserRedirect: false
          }
        });

        if (error) {
          console.error('Google sign-in error:', error);
          throw error;
        }
        
        console.log('Google sign-in initiated for mobile:', data);
        
        // For mobile, we don't setLoading(false) here as the auth flow continues externally
        // The loading will be cleared by the auth state change listener
        
      } else {
        // For web
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) {
          console.error('Google sign-in error:', error);
          setLoading(false);
          throw error;
        }
        
        console.log('Google sign-in initiated for web:', data);
        // For web, the redirect happens automatically
      }
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setLoading(false);
      toast('Google sign-in failed', {
        description: 'Unable to sign in with Google. Please try again.'
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Starting signout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        toast('Sign out failed', {
          description: 'Unable to sign out. Please try again.'
        });
      } else {
        console.log('Signout successful');
        toast('Signed out successfully');
      }
      
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
