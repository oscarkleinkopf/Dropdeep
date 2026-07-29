import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Supabase client — null when env vars are missing (demo/local mode). */
export const supabase = isAuthConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
