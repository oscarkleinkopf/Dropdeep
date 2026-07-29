import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { isAuthenticated } from '../auth/auth.js';

/** Server-held Gemini key via Supabase Edge Function (requires login). */
export function isGeminiProxyConfigured() {
  return String(import.meta.env.VITE_GEMINI_PROXY || '').toLowerCase() === 'true';
}

export function isGeminiProxyEnabled() {
  return isGeminiProxyConfigured() && isAuthConfigured && isAuthenticated();
}

/**
 * Adapter that mimics GoogleGenerativeAI model.generateContent()
 * so existing research loops can stay unchanged.
 */
export function createProxyGenerativeModel({ model, useSearch = false } = {}) {
  return {
    async generateContent(requestPayload) {
      if (!supabase) {
        throw new Error('Supabase no configurado para proxy Gemini');
      }

      const contents = requestPayload?.contents;
      const tools = requestPayload?.tools;
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          model,
          contents,
          tools,
          useSearch: useSearch && !(Array.isArray(tools) && tools.length === 0),
        },
      });

      if (error) {
        const msg = error.message || 'Error en gemini-proxy';
        if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
          throw new Error('Proxy Gemini no disponible: no se pudo contactar con la Edge Function de Supabase.');
        }
        throw new Error(msg);
      }
      if (data?.error) {
        throw new Error(data.error);
      }

      const text = data?.text || '';
      const candidates = data?.candidates || [];

      return {
        response: {
          text: () => text,
          candidates,
        },
      };
    },
  };
}
