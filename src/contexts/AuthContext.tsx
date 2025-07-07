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
  deleteAccount: () => Promise<void>; // Add the deleteAccount function
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
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession);
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
        });

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
      // Log the detailed error for debugging but don't expose to user
      console.error('Signup error:', error);
      
      // Display a generic message to the user
      toast('Error creating account', {
        description: 'Unable to create your account. Please try again later.'
      });
      
      // Throw a sanitized error
      throw new Error('Account creation failed');
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
      // Log the detailed error for debugging
      console.error('Login error:', error);
      
      // Display a generic message to the user
      toast('Login failed', {
        description: 'Invalid email or password'
      });
      
      // Throw a sanitized error
      throw new Error('Authentication failed');
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
      // Log the detailed error for debugging
      console.error('Google sign-in error:', error);
      
      // Display a generic message to the user
      toast('Google sign-in failed', {
        description: 'Unable to sign in with Google. Please try again.'
      });
      
      // Throw a sanitized error
      throw new Error('Google authentication failed');
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
      // Log the detailed error for debugging
      console.error('Sign out error:', error);
      
      // Display a generic message to the user
      toast('Sign out failed', {
        description: 'Unable to sign out. Please try again.'
      });
      
      // No need to throw here as this is typically a terminal operation
    } finally {
      setLoading(false);
    }
  };

  // Add the deleteAccount function
  const deleteAccount = async () => {
    try {
      setLoading(true);
      
      if (!user) throw new Error("No user is logged in");
      
      // First, delete user data from all related tables
      // This ensures we clean up all user data before removing the account
      const userId = user.id;
      
      // Delete user data from various tables
      // We'll use transactions to ensure all operations succeed or fail together
      const { error: dataError } = await supabase.rpc('delete_user_data', { user_id: userId });
      
      if (dataError) {
        console.error('Error deleting user data:', dataError);
        throw dataError;
      }
      
      // Now delete the user authentication record
      // We'll use the client-side method which is allowed for users to delete their own accounts
      const { error: authError } = await supabase.auth.admin.deleteUser(userId, { shouldSoftDelete: true });
      
      if (authError) {
        // If the admin method fails, try a different approach
        // Create a custom endpoint in your API to handle user deletion securely
        const { error: deleteError } = await supabase.functions.invoke('delete-user', {
          body: { user_id: userId }
        });
        
        if (deleteError) throw deleteError;
      }
      
      // Clear local storage
      localStorage.clear();
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast('Account deleted successfully', {
        description: 'Your account has been permanently deleted.'
      });
    } catch (error: any) {
      // Log the detailed error for debugging
      console.error('Account deletion error:', error);
      
      // Display a generic message to the user
      toast('Account deletion failed', {
        description: 'Unable to delete your account. Please try again later.'
      });
      
      // Throw a sanitized error
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
        deleteAccount, // Add the deleteAccount function to the context
        loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
