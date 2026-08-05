import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { isAuthenticated, getCurrentUser } from '../auth/auth.js';
import { hasGeminiKey } from '../utils/geminiStorage.js';
import { getGeminiRoute } from '../config/geminiRoute.js';
import { getResearchSessionId } from './researchSession.js';
import { FREE_PROXY_DAILY_LIMIT } from '../config/freeTier.js';
import {
  PROXY_MAX_CONTENTS_CHARS,
  isProxyContentsTooLarge,
} from '../config/proxyAbuse.js';

export const PROXY_USAGE_UPDATED_EVENT = 'dropdeep:proxy-usage-updated';

const PROXY_USAGE_KEY = 'dropdeep_proxy_usage';

/** Server-held Gemini key via Supabase Edge Function (requires login). */
export function isGeminiProxyConfigured() {
  return String(import.meta.env.VITE_GEMINI_PROXY || '').toLowerCase() === 'true';
}

export function isGeminiProxyEnabled() {
  return isGeminiProxyConfigured() && isAuthConfigured && isAuthenticated();
}

export function getStoredProxyUsage() {
  try {
    const raw = sessionStorage.getItem(PROXY_USAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function formatProxyUsageHint() {
  const usage = getStoredProxyUsage();
  if (!usage || usage.limit == null) return '';
  return `Proxy: ${usage.count}/${usage.limit} investigaciones hoy`;
}

function storeProxyUsage(usage) {
  if (!usage || usage.limit == null) return;
  sessionStorage.setItem(PROXY_USAGE_KEY, JSON.stringify(usage));
}

export function setProxyUsage(usage) {
  storeProxyUsage(usage);
  refreshProxyUsageUI();
}

/** Notify UI (user menu, research mode hint) after quota changes. */
export function refreshProxyUsageUI() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROXY_USAGE_UPDATED_EVENT));
}

/**
 * Menu / badge label for proxy quota or BYOK state.
 * Returns null when quota should not be shown (logged out, proxy off).
 */
export function getProxyQuotaMenuState() {
  if (!isGeminiProxyConfigured() || !isAuthenticated()) return null;

  if (getGeminiRoute() === 'byok') {
    return { kind: 'byok', label: 'Usando BYOK', detail: 'Deep Research usa tu clave Gemini — no consume cuota proxy.' };
  }

  if (getGeminiRoute() !== 'proxy') return null;

  const usage = getStoredProxyUsage();
  const limit = usage?.limit ?? FREE_PROXY_DAILY_LIMIT;
  const count = usage?.count ?? 0;
  const remaining = Math.max(0, limit - count);

  if (count >= limit) {
    return {
      kind: 'exhausted',
      label: `Proxy: ${count}/${limit} hoy`,
      detail: `Cuota proxy agotada hoy (día UTC). Usa Modo Copiloto gratis, BYOK en Ajustes o vuelve mañana.`,
    };
  }

  const remainingHint = remaining === 1 ? ' · 1 restante' : remaining < limit ? ` · ${remaining} restantes` : '';
  return {
    kind: 'active',
    label: `Proxy: ${count}/${limit} hoy${remainingHint}`,
    detail: `${remaining} investigación${remaining === 1 ? '' : 'es'} proxy restante${remaining === 1 ? '' : 's'} hoy (día UTC).`,
  };
}

/** Load today's proxy usage from Supabase (RLS: own row only). */
export async function fetchProxyUsageFromServer() {
  if (!isGeminiProxyEnabled() || hasGeminiKey() || !supabase) return null;

  const user = getCurrentUser();
  if (!user?.id) return null;

  const todayUtc = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('gemini_usage')
    .select('call_count')
    .eq('user_id', user.id)
    .eq('usage_date', todayUtc)
    .maybeSingle();

  if (error) return null;

  const usage = {
    count: data?.call_count ?? 0,
    limit: FREE_PROXY_DAILY_LIMIT,
  };
  storeProxyUsage(usage);
  refreshProxyUsageUI();
  return usage;
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
      if (isProxyContentsTooLarge(contents)) {
        throw new Error(
          `PROXY_PAYLOAD_TOO_LARGE: El prompt supera ${PROXY_MAX_CONTENTS_CHARS} caracteres para el proxy. Acorta el contexto o usa BYOK en Ajustes.`,
        );
      }

      const tools = requestPayload?.tools;
      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          model,
          contents,
          tools,
          useSearch: useSearch && !(Array.isArray(tools) && tools.length === 0),
          researchSessionId: getResearchSessionId(),
        },
      });

      if (error || data?.error) {
        throwProxyClientError(data, error);
      }

      const text = data?.text || '';
      const candidates = data?.candidates || [];
      if (data?.usage) setProxyUsage(data.usage);

      return {
        response: {
          text: () => text,
          candidates,
        },
      };
    },
  };
}

function throwProxyClientError(data, error) {
  const code = data?.code || '';
  const serverMsg = data?.message || data?.error || error?.message || 'Error en gemini-proxy';

  if (code === 'proxy_daily_quota' || serverMsg === 'daily_limit_exceeded' || String(serverMsg).includes('daily_limit')) {
    throw new Error(
      `PROXY_DAILY_LIMIT: Cuota diaria agotada (${FREE_PROXY_DAILY_LIMIT} investigaciones/día). Pega tu clave Gemini (gratis en AI Studio) o vuelve mañana.`,
    );
  }
  if (code === 'proxy_rate_limit' || String(serverMsg).includes('rate_limit')) {
    const retry = data?.retryAfterSeconds || 10;
    throw new Error(
      `PROXY_RATE_LIMIT: Demasiadas peticiones al proxy. Espera ~${retry}s o usa BYOK / Modo Copiloto.`,
    );
  }
  if (code === 'proxy_session_cooldown' || String(serverMsg).includes('session_cooldown')) {
    const retry = data?.retryAfterSeconds || 30;
    throw new Error(
      `PROXY_SESSION_COOLDOWN: Espera ${retry}s antes de iniciar otra investigación proxy.`,
    );
  }
  if (code === 'proxy_payload_too_large' || String(serverMsg).includes('payload_too_large')) {
    throw new Error(
      `PROXY_PAYLOAD_TOO_LARGE: ${data?.message || 'El prompt es demasiado grande para el proxy. Usa BYOK o acorta el contexto.'}`,
    );
  }

  const msg = error?.message || String(serverMsg);
  if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
    throw new Error('Proxy Gemini no disponible: no se pudo contactar con la Edge Function de Supabase.');
  }
  throw new Error(msg);
}
