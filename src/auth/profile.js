import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { getCurrentUserId, isAuthenticated } from '../auth/auth.js';
import {
  getGeminiModel,
  getGeminiLanguage,
  isGeminiGroundingEnabled,
  setGeminiPref,
} from '../utils/geminiStorage.js';

/** Load profile prefs into local scoped storage (non-secret fields only). */
export async function syncProfileFromServer() {
  if (!isAuthConfigured || !supabase || !isAuthenticated()) return null;

  const userId = getCurrentUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('gemini_model, gemini_language, gemini_grounding, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  if (data.gemini_model) setGeminiPref('model', data.gemini_model);
  if (data.gemini_language) setGeminiPref('language', data.gemini_language);
  setGeminiPref('grounding', data.gemini_grounding === false ? 'false' : 'true');
  return data;
}

/** Persist non-secret prefs to profiles (RLS). */
export async function upsertProfilePrefs({ model, language, grounding } = {}) {
  if (!isAuthConfigured || !supabase || !isAuthenticated()) return false;

  const userId = getCurrentUserId();
  const payload = {
    id: userId,
    gemini_model: model || getGeminiModel(),
    gemini_language: language || getGeminiLanguage(),
    gemini_grounding: typeof grounding === 'boolean' ? grounding : isGeminiGroundingEnabled(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
  return !error;
}
