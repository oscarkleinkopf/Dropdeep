/**
 * T55 — privacy-friendly analytics (no third-party cookies / trackers).
 * Fire-and-forget inserts into analytics_events when Supabase is configured.
 */

import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { getCurrentUserId, isAuthenticated } from '../auth/auth.js';

export const ANALYTICS_EVENTS = Object.freeze({
  VIEW_DISCOVER: 'view_discover',
  PARSE_AE: 'parse_ae',
  START_RESEARCH: 'start_research',
  COPILOT_PASTE_OK: 'copilot_paste_ok',
  SAVE_PORTFOLIO: 'save_portfolio',
});

const ALLOWED = new Set(Object.values(ANALYTICS_EVENTS));
const SESSION_KEY = 'dropdeep_analytics_sid';
const lastSent = new Map();
const DEDUPE_MS = 1500;

/** Stable anonymous session id (not auth user id). */
export function getAnalyticsSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Strip props to a small non-PII object (primitives / short strings only).
 * @param {Record<string, unknown>} [props]
 */
export function sanitizeAnalyticsProps(props) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) return {};
  const out = {};
  for (const [key, value] of Object.entries(props)) {
    if (!/^[a-z_][a-z0-9_]{0,31}$/i.test(key)) continue;
    if (typeof value === 'boolean' || typeof value === 'number') {
      if (typeof value === 'number' && !Number.isFinite(value)) continue;
      out[key] = value;
    } else if (typeof value === 'string') {
      const trimmed = value.trim().slice(0, 64);
      // Block obvious PII / secrets
      if (!trimmed || /@|https?:|sk-|AIza|password|api[_-]?key/i.test(trimmed)) continue;
      out[key] = trimmed;
    }
  }
  return out;
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} [props]
 * @returns {Promise<boolean>} true if insert attempted successfully
 */
export async function trackEvent(eventName, props = {}) {
  if (!ALLOWED.has(eventName)) return false;
  if (!isAuthConfigured || !supabase) return false;

  const now = Date.now();
  const prev = lastSent.get(eventName) || 0;
  if (now - prev < DEDUPE_MS) return false;
  lastSent.set(eventName, now);

  const row = {
    event_name: eventName,
    session_id: getAnalyticsSessionId(),
    user_id: isAuthenticated() ? getCurrentUserId() : null,
    props: sanitizeAnalyticsProps(props),
  };

  try {
    const { error } = await supabase.from('analytics_events').insert(row);
    return !error;
  } catch {
    return false;
  }
}

/** Non-blocking wrapper for UI call sites. */
export function trackEventFireAndForget(eventName, props) {
  trackEvent(eventName, props).catch(() => {});
}
