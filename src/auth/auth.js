import { supabase, isAuthConfigured, appRedirectUrl } from './supabaseClient.js';
import { setGeminiStorageUser } from '../utils/geminiStorage.js';

let currentSession = null;
const listeners = new Set();

export { isAuthConfigured };

export function getSession() {
  return currentSession;
}

export function getCurrentUser() {
  return currentSession?.user ?? null;
}

export function getCurrentUserId() {
  return currentSession?.user?.id ?? null;
}

export function isAuthenticated() {
  return Boolean(currentSession?.user);
}

export function onAuthStateChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyAuthChange(session) {
  currentSession = session;
  setGeminiStorageUser(session?.user?.id ?? null);
  listeners.forEach((cb) => {
    try {
      cb(session);
    } catch {
      /* listener errors must not break auth */
    }
  });
}

/** Initialize auth — safe to call when Supabase is not configured. */
export async function initAuth() {
  if (!isAuthConfigured || !supabase) {
    setGeminiStorageUser(null);
    notifyAuthChange(null);
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  notifyAuthChange(session);

  supabase.auth.onAuthStateChange((_event, session) => {
    notifyAuthChange(session);
  });

  return session;
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Auth no configurado');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: appRedirectUrl() },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Auth no configurado');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Google OAuth — enable the Google provider in Supabase Auth first. */
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Auth no configurado');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appRedirectUrl(),
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw error;
  return data;
}
