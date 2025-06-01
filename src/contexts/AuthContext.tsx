
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const { toast: uiToast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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

  return (
    <AuthContext.Provider 
      value={{ 
        session,
        user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        loading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
