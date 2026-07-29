import { supabase, isAuthConfigured } from './supabaseClient.js';
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
  const { data, error } = await supabase.auth.signUp({ email, password });
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

/** Stub for Phase 2 — Google OAuth via Supabase provider. */
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Auth no configurado');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + import.meta.env.BASE_URL }
  });
  if (error) throw error;
  return data;
}
