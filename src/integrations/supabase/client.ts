
// Import at the top of the file instead of using require
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Create a more robust safe storage object that handles all edge cases
const safeStorage = {
  getItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error accessing localStorage.getItem:', error);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error accessing localStorage.setItem:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error accessing localStorage.removeItem:', error);
    }
  }
};

// Create a lazy-loaded Supabase client
let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    try {
      // Use the imported createClient directly instead of requiring it
      supabaseInstance = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            storage: safeStorage,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        }
      );
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      // Return a dummy client that won't crash the app
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null } }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        }
      } as any;
    }
  }
  return supabaseInstance;
};

export const supabase = createSupabaseClient();
