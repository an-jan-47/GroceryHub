
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

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

// Create the Supabase client (never null)
export const supabase = createClient<Database>(
  'https://wvhtcmtmxazcetbwgyyz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHRjbXRteGF6Y2V0YndneXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTA1MTgsImV4cCI6MjA2MTQ4NjUxOH0.0J2pLUZjOvdH3T4R_zUB7gqOazoMviMQ2nSBiYERQvI',
  {
    auth: {
      persistSession: true,
      storage: safeStorage,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);
