
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://wvhtcmtmxazcetbwgyyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHRjbXRteGF6Y2V0YndneXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTA1MTgsImV4cCI6MjA2MTQ4NjUxOH0.0J2pLUZjOvdH3T4R_zUB7gqOazoMviMQ2nSBiYERQvI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
