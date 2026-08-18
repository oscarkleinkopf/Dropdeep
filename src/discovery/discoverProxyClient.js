/**
 * Client for Edge Function discover-proxy (T45).
 * Never holds App Secret. Soft-fails so T67 paste/Copiloto stay usable.
 */

import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { isAuthenticated } from '../auth/auth.js';

export const DISCOVER_NOT_CONFIGURED =
  'Catálogo Affiliate no configurado todavía. Sigue con «Buscar en AliExpress» y pega el listing.';

/**
 * @param {Record<string, unknown> | null | undefined} payload
 * @param {string} [fallback]
 */
export function mapDiscoverProxyError(payload, fallback = '') {
  const code = String(payload?.code || '');
  const message = String(payload?.message || payload?.error || fallback || '').trim();

  if (code === 'unauthorized' || /unauthor/i.test(message) || /authorization/i.test(message)) {
    return {
      code: 'unauthorized',
      message: 'Inicia sesión para buscar el catálogo Affiliate. El flujo gratis (AliExpress + pegar) sigue igual.',
    };
  }
  if (code === 'discover_not_configured' || code === 'not_configured') {
    return { code: 'discover_not_configured', message: DISCOVER_NOT_CONFIGURED };
  }
  if (code === 'discover_rate_limit' || code === 'proxy_rate_limit') {
    return {
      code: 'discover_rate_limit',
      message: message || 'Demasiadas búsquedas Affiliate en poco tiempo. Espera unos segundos.',
    };
  }
  if (code === 'discover_daily_quota') {
    return {
      code: 'discover_daily_quota',
      message:
        message ||
        'Cuota diaria de búsquedas Affiliate agotada. Usa «Buscar en AliExpress» y pega el listing, o vuelve mañana.',
    };
  }
  if (code === 'bad_request' || code === 'missing_query') {
    return { code: 'bad_request', message: message || 'Consulta no válida.' };
  }
  if (code === 'discover_sign_error') {
    return {
      code: 'discover_sign_error',
      message: message || 'Firma Affiliate rechazada. El administrador debe revisar secretos en Supabase.',
    };
  }
  if (
    /failed to send|failed to fetch|not found|404/i.test(message) ||
    code === 'discover_upstream'
  ) {
    return {
      code: 'discover_unavailable',
      message:
        message ||
        'Búsqueda Affiliate no disponible. Usa «Buscar en AliExpress» y pega el listing.',
    };
  }

  return {
    code: code || 'discover_error',
    message:
      message ||
      'No se pudo buscar el catálogo Affiliate. Usa «Buscar en AliExpress» y pega el listing.',
  };
}

async function payloadFromInvoke(data, error) {
  if (data && typeof data === 'object') return data;
  const ctx = error?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      return await ctx.json();
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * @param {{ q: string, mode?: 'search' | 'hot', pageNo?: number, pageSize?: number }} input
 */
export async function searchDiscoverProxy(input) {
  const q = String(input?.q || '').trim();
  const mode = input?.mode === 'hot' ? 'hot' : 'search';

  if (!isAuthConfigured || !supabase) {
    return {
      ok: false,
      code: 'auth_not_configured',
      message: 'Inicia sesión para buscar el catálogo Affiliate. El flujo gratis (AliExpress + pegar) sigue igual.',
    };
  }
  if (!isAuthenticated()) {
    return {
      ok: false,
      code: 'unauthorized',
      message: 'Inicia sesión para buscar el catálogo Affiliate. El flujo gratis (AliExpress + pegar) sigue igual.',
    };
  }
  if (mode === 'search' && q.length < 2) {
    return { ok: false, code: 'bad_request', message: 'Escribe una consulta de al menos 2 caracteres.' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('discover-proxy', {
      body: {
        mode,
        q,
        pageNo: input.pageNo || 1,
        pageSize: input.pageSize || 10,
      },
    });
    const payload = await payloadFromInvoke(data, error);

    if (error || payload?.error) {
      const mapped = mapDiscoverProxyError(payload, error?.message || '');
      return { ok: false, ...mapped };
    }

    const candidates = Array.isArray(payload?.candidates) ? payload.candidates : [];
    return {
      ok: true,
      candidates,
      total: Number(payload?.total) || candidates.length,
      sourceFetchedAt: payload?.sourceFetchedAt || new Date().toISOString(),
      disclaimer: payload?.disclaimer || '',
      mode: payload?.mode || mode,
      q: payload?.q || q,
    };
  } catch (err) {
    return {
      ok: false,
      ...mapDiscoverProxyError({}, err?.message || ''),
    };
  }
}
