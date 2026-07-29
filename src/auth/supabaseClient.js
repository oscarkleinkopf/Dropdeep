import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function appRedirectUrl() {
  if (typeof window === 'undefined') return undefined;
  const base = import.meta.env.BASE_URL || '/';
  return new URL(base, window.location.origin).href;
}

/** Supabase client — null when env vars are missing (demo/local mode). */
export const supabase = isAuthConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export { appRedirectUrl };
