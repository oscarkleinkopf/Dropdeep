/**
 * T54 — opt-in sync of dogfooding feedback to Supabase.
 * Local save (T35) always happens first; cloud only when user opts in + is logged in.
 */

import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { isAuthenticated, getCurrentUserId } from '../auth/auth.js';
import { clampFeedbackNote, normalizeHelpful, feedbackProductSlug } from './feedbackStorage.js';

const OPT_IN_KEY = 'dropdeep_feedback_cloud_opt_in';

export function isFeedbackCloudOptIn() {
  try {
    return localStorage.getItem(OPT_IN_KEY) === '1';
  } catch {
    return false;
  }
}

export function setFeedbackCloudOptIn(enabled) {
  try {
    if (enabled) localStorage.setItem(OPT_IN_KEY, '1');
    else localStorage.removeItem(OPT_IN_KEY);
  } catch {
    /* ignore quota */
  }
}

/**
 * Upsert feedback row for the current user.
 * @param {{ productSlug: string, helpful: string, note?: string, productName?: string }} feedback
 * @returns {Promise<{ ok: true } | { ok: false, error: string, skipped?: boolean }>}
 */
export async function syncReportFeedbackToCloud(feedback) {
  if (!isFeedbackCloudOptIn()) {
    return { ok: false, skipped: true, error: 'Opt-in desactivado.' };
  }
  if (!isAuthConfigured || !supabase || !isAuthenticated()) {
    return { ok: false, skipped: true, error: 'Inicia sesión para enviar feedback a DropDeep.' };
  }

  const helpful = normalizeHelpful(feedback?.helpful);
  const productSlug = feedbackProductSlug(feedback?.productSlug || feedback?.productName || '');
  if (!helpful || !productSlug) {
    return { ok: false, error: 'Feedback incompleto para sincronizar.' };
  }

  const userId = getCurrentUserId();
  if (!userId) {
    return { ok: false, skipped: true, error: 'Sin sesión.' };
  }

  const payload = {
    user_id: userId,
    product_slug: productSlug,
    product_name: String(feedback.productName || '').slice(0, 200) || null,
    helpful,
    note: clampFeedbackNote(feedback.note),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('report_feedback')
    .upsert(payload, { onConflict: 'user_id,product_slug' });

  if (error) {
    return {
      ok: false,
      error:
        error.message?.includes('relation') || error.code === '42P01'
          ? 'Tabla report_feedback no desplegada aún (migración 006).'
          : 'No se pudo enviar el feedback a DropDeep.',
    };
  }

  return { ok: true };
}
