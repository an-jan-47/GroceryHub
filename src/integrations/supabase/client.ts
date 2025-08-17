
import { createClient } from '@supabase/supabase-js';

// Create a more robust safe storage object that handles all edge cases
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error accessing localStorage.getItem:', error);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error accessing localStorage.setItem:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error accessing localStorage.removeItem:', error);
    }
  }
};

// Create Supabase client with proper configuration
const createSupabaseClient = () => {
  try {
    const supabaseUrl = 'https://wvhtcmtmxazcetbwgyyz.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHRjbXRteGF6Y2V0YndneXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTA1MTgsImV4cCI6MjA2MTQ4NjUxOH0.0J2pLUZjOvdH3T4R_zUB7gqOazoMviMQ2nSBiYERQvI';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Missing Supabase configuration');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: safeStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Return a dummy client that won't crash the app
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Client not initialized') }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Client not initialized') }),
        signInWithOAuth: () => Promise.resolve({ data: { provider: 'google', url: '' }, error: new Error('Client not initialized') })
      }
    } as any;
  }
};

export const supabase = createSupabaseClient();
