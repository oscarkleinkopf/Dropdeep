// Supabase Edge Function: discover-proxy (T45)
// AliExpress Affiliate search/hot — App Secret never leaves the server.
// Deploy: supabase functions deploy discover-proxy --project-ref <ref>
// Secrets: ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, optional ALIEXPRESS_TRACKING_ID
// Optional: ALIEXPRESS_SIGN_METHOD=md5|hmac-sha256  DISCOVER_PROXY_DAILY_LIMIT=40
// Auth: JWT required. Burst rate reuses check_proxy_rate_limit (005).
// Daily quota: check_and_increment_discover_usage (008) — skipped if RPC missing.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import md5 from 'https://esm.sh/blueimp-md5@2.19.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AE_GATEWAY = 'https://api-sg.aliexpress.com/sync';
const FETCH_TIMEOUT_MS = 12_000;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SEC = 10;
const MAX_Q_CHARS = 80;
const MAX_PAGE_SIZE = 20;
const DEFAULT_PAGE_SIZE = 10;

const AE_HOST_RE = /(?:^|\.)aliexpress\.(?:com|us|ru)|aliexpress\.com\.[a-z]{2}$/i;
const AE_CLICK_HOST_RE = /(?:^|\.)(?:s\.click\.aliexpress\.com|star\.aliexpress\.com)$/i;
const SAFE_IMAGE_HOST_RE =
  /(?:^|\.)(?:alicdn\.com|aliexpress(?:-media)?\.com|ae-pic-a1\.aliexpress-media\.com)$/i;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function structuredLog(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }));
}

function parseDailyLimit() {
  const raw = Deno.env.get('DISCOVER_PROXY_DAILY_LIMIT') ?? '40';
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 40;
}

function beijingTimestamp(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function sortedConcat(params: Record<string, string>) {
  return Object.keys(params)
    .filter((key) => key !== 'sign' && params[key] != null && String(params[key]) !== '')
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');
}

async function hmacSha256Hex(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function signParams(
  params: Record<string, string>,
  appSecret: string,
  signMethod: string,
) {
  const concat = sortedConcat(params);
  if (signMethod === 'hmac-sha256') {
    return await hmacSha256Hex(appSecret, concat);
  }
  return String(md5(`${appSecret}${concat}${appSecret}`)).toUpperCase();
}

function parseHttpUrl(raw: unknown): URL | null {
  try {
    const u = new URL(String(raw || '').trim());
    if (u.protocol === 'http:') u.protocol = 'https:';
    if (u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
  }
}

function sanitizeProductUrl(raw: unknown): string | null {
  const u = parseHttpUrl(raw);
  if (!u) return null;
  if (AE_CLICK_HOST_RE.test(u.hostname)) return u.href;
  if (!AE_HOST_RE.test(u.hostname)) return null;
  return u.href;
}

function sanitizeImageUrl(raw: unknown): string | null {
  const u = parseHttpUrl(raw);
  if (!u) return null;
  if (!SAFE_IMAGE_HOST_RE.test(u.hostname) && !AE_HOST_RE.test(u.hostname)) return null;
  return u.href;
}

function parseUsd(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const s = String(raw)
    .replace(/US\s*\$/gi, '')
    .replace(/USD/gi, '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim();
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
  return Math.round(n * 100) / 100;
}

function parseOrders(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = Number.parseInt(String(raw).replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseEvaluateRate(raw: unknown) {
  if (raw == null || raw === '') return { rating: null as number | null, reviewPositivePct: null as number | null };
  const n = Number.parseFloat(String(raw).replace('%', '').trim());
  if (!Number.isFinite(n) || n < 0) return { rating: null, reviewPositivePct: null };
  if (n <= 5) return { rating: Math.round(n * 10) / 10, reviewPositivePct: null };
  return { rating: null, reviewPositivePct: Math.round(n * 10) / 10 };
}

function parseShipDays(raw: unknown): number | null {
  const s = String(raw || '').trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number.parseInt(s, 10);
  return n > 0 && n < 365 ? n : null;
}

function unwrapAffiliate(payload: Record<string, unknown>) {
  const err = payload.error_response as { code?: unknown; msg?: unknown; sub_msg?: unknown } | undefined;
  if (err) {
    return {
      ok: false as const,
      code: String(err.code || 'ae_error'),
      message: String(err.msg || err.sub_msg || 'Error Affiliate'),
      products: [] as Record<string, unknown>[],
      total: 0,
    };
  }

  const envelope = (payload.aliexpress_affiliate_product_query_response ||
    payload.aliexpress_affiliate_hotproduct_query_response ||
    payload) as Record<string, unknown>;

  const resp = (envelope.resp_result || envelope) as Record<string, unknown>;
  const respCode = resp.resp_code ?? resp.code;
  const respMsg = String(resp.resp_msg || resp.msg || '');
  const codeNum = Number.parseInt(String(respCode ?? ''), 10);
  if (Number.isFinite(codeNum) && codeNum !== 200) {
    return {
      ok: false as const,
      code: String(respCode),
      message: respMsg || `Affiliate resp_code ${respCode}`,
      products: [] as Record<string, unknown>[],
      total: 0,
    };
  }

  const result = (resp.result || envelope.result || {}) as Record<string, unknown>;
  const productsWrap = result.products as { product?: unknown } | unknown[] | undefined;
  let products: unknown = Array.isArray(productsWrap)
    ? productsWrap
    : (productsWrap as { product?: unknown })?.product ?? [];
  if (!Array.isArray(products)) products = products ? [products] : [];

  const total =
    Number.parseInt(String(result.total_record_count ?? (products as unknown[]).length), 10) ||
    (products as unknown[]).length;

  return {
    ok: true as const,
    code: String(respCode ?? '200'),
    message: respMsg || 'ok',
    products: products as Record<string, unknown>[],
    total,
  };
}

function normalizeProduct(raw: Record<string, unknown>, fetchedAt: string) {
  const externalId = String(raw.product_id ?? raw.productId ?? '').trim();
  const title = String(raw.product_title ?? raw.productTitle ?? raw.title ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  const productUrl =
    sanitizeProductUrl(raw.product_detail_url) ||
    sanitizeProductUrl(raw.product_url) ||
    sanitizeProductUrl(raw.promotion_link);
  if (!externalId || !title || !productUrl) return null;

  const { rating, reviewPositivePct } = parseEvaluateRate(raw.evaluate_rate);
  const affiliateUrl = sanitizeProductUrl(raw.promotion_link);

  return {
    source: 'aliexpress' as const,
    externalId,
    title,
    priceUsd: parseUsd(raw.target_sale_price ?? raw.target_app_sale_price ?? raw.sale_price),
    originalPriceUsd: parseUsd(raw.target_original_price ?? raw.original_price),
    orders: parseOrders(raw.lastest_volume ?? raw.latest_volume ?? raw.last_volume),
    rating,
    reviewPositivePct,
    imageUrl: sanitizeImageUrl(raw.product_main_image_url),
    productUrl,
    affiliateUrl: affiliateUrl || null,
    shipTo: 'CL' as const,
    shipDays: parseShipDays(raw.ship_to_days),
    trendScore: null,
    trendLabel: 'unknown' as const,
    fetchedAt,
  };
}

function usdToCents(usd: unknown): string | undefined {
  const n = Number(usd);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return String(Math.round(n * 100));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization', code: 'unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const appKey = Deno.env.get('ALIEXPRESS_APP_KEY') || '';
    const appSecret = Deno.env.get('ALIEXPRESS_APP_SECRET') || '';
    const trackingId = Deno.env.get('ALIEXPRESS_TRACKING_ID') || '';
    const signMethodEnv = (Deno.env.get('ALIEXPRESS_SIGN_METHOD') || 'md5').toLowerCase();
    const signMethod = signMethodEnv === 'hmac-sha256' ? 'hmac-sha256' : 'md5';
    const dailyLimit = parseDailyLimit();

    if (!supabaseUrl || !supabaseAnon) {
      return json({ error: 'Server misconfigured (Supabase env)', code: 'internal' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return json({ error: 'Unauthorized', code: 'unauthorized' }, 401);
    }

    if (!appKey.trim() || !appSecret.trim()) {
      structuredLog('discover_proxy_not_configured', { userId: user.id });
      return json(
        {
          error: 'not_configured',
          code: 'discover_not_configured',
          message:
            'Catálogo Affiliate no configurado todavía. Sigue con «Buscar en AliExpress» y pega el listing.',
        },
        501,
      );
    }

    let body: {
      mode?: string;
      q?: string;
      pageNo?: number;
      pageSize?: number;
      minPriceUsd?: number;
      maxPriceUsd?: number;
    };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body', code: 'bad_request' }, 400);
    }

    const mode = body.mode === 'hot' ? 'hot' : 'search';
    const q = String(body.q || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_Q_CHARS);
    if (mode === 'search' && q.length < 2) {
      return json(
        {
          error: 'missing_query',
          code: 'bad_request',
          message: 'Escribe una consulta de al menos 2 caracteres.',
        },
        400,
      );
    }

    const pageNo = Math.max(1, Number.parseInt(String(body.pageNo ?? 1), 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(String(body.pageSize ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
    );

    if (serviceRoleKey) {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      const { data: rateResult, error: rateError } = await admin.rpc('check_proxy_rate_limit', {
        p_user_id: user.id,
        p_max_requests: RATE_LIMIT_MAX,
        p_window_seconds: RATE_LIMIT_WINDOW_SEC,
      });
      if (rateError) {
        structuredLog('discover_proxy_rate_rpc_failed', {
          userId: user.id,
          detail: rateError.message.slice(0, 120),
        });
      } else if (!rateResult?.allowed) {
        structuredLog('discover_proxy_reject', { userId: user.id, reason: 'rate_limit' });
        return json(
          {
            error: 'rate_limit_exceeded',
            code: 'discover_rate_limit',
            message: 'Demasiadas búsquedas Affiliate en poco tiempo. Espera unos segundos.',
            retryAfterSeconds: RATE_LIMIT_WINDOW_SEC,
          },
          429,
        );
      }

      const { data: quotaResult, error: quotaError } = await admin.rpc(
        'check_and_increment_discover_usage',
        {
          p_user_id: user.id,
          p_daily_limit: dailyLimit,
        },
      );
      if (quotaError) {
        structuredLog('discover_proxy_quota_skipped', {
          userId: user.id,
          detail: quotaError.message.slice(0, 120),
        });
      } else if (!quotaResult?.allowed) {
        structuredLog('discover_proxy_reject', { userId: user.id, reason: 'daily_quota' });
        return json(
          {
            error: 'daily_limit_exceeded',
            code: 'discover_daily_quota',
            message:
              'Cuota diaria de búsquedas Affiliate agotada. Usa «Buscar en AliExpress» y pega el listing, o vuelve mañana.',
            count: quotaResult?.count ?? dailyLimit,
            limit: quotaResult?.limit ?? dailyLimit,
          },
          429,
        );
      }
    }

    const method =
      mode === 'hot'
        ? 'aliexpress.affiliate.hotproduct.query'
        : 'aliexpress.affiliate.product.query';

    const business: Record<string, string> = {
      page_no: String(pageNo),
      page_size: String(pageSize),
      target_currency: 'USD',
      target_language: 'EN',
      ship_to_country: 'CL',
      sort: 'LAST_VOLUME_DESC',
    };
    if (mode === 'search') business.keywords = q;
    if (trackingId.trim()) business.tracking_id = trackingId.trim();
    const minCents = usdToCents(body.minPriceUsd);
    const maxCents = usdToCents(body.maxPriceUsd);
    if (minCents) business.min_sale_price = minCents;
    if (maxCents) business.max_sale_price = maxCents;

    const params: Record<string, string> = {
      app_key: appKey,
      method,
      timestamp: beijingTimestamp(),
      sign_method: signMethod,
      v: '2.0',
      format: 'json',
      simplify: 'true',
      ...business,
    };
    params.sign = await signParams(params, appSecret, signMethod);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let upstream: Response;
    try {
      upstream = await fetch(AE_GATEWAY, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body: new URLSearchParams(params),
      });
    } catch (err) {
      structuredLog('discover_proxy_fetch_fail', {
        userId: user.id,
        reason: err instanceof Error ? err.name : 'fetch_error',
      });
      return json(
        {
          error: 'fetch_failed',
          code: 'discover_upstream',
          message: 'AliExpress no respondió. Prueba «Buscar en AliExpress» y pega el listing.',
        },
        502,
      );
    } finally {
      clearTimeout(timer);
    }

    let payload: Record<string, unknown>;
    try {
      payload = await upstream.json();
    } catch {
      structuredLog('discover_proxy_bad_json', { userId: user.id, status: upstream.status });
      return json(
        {
          error: 'bad_upstream_json',
          code: 'discover_upstream',
          message: 'AliExpress devolvió una respuesta ilegible.',
        },
        502,
      );
    }

    const fetchedAt = new Date().toISOString();
    const unwrapped = unwrapAffiliate(payload);
    if (!unwrapped.ok) {
      structuredLog('discover_proxy_ae_error', {
        userId: user.id,
        code: unwrapped.code,
        status: upstream.status,
      });
      const signFail = /sign/i.test(unwrapped.message) || unwrapped.code === '50';
      return json(
        {
          error: 'affiliate_error',
          code: signFail ? 'discover_sign_error' : 'discover_affiliate_error',
          message: signFail
            ? 'Firma Affiliate rechazada. Revisa App Key / Secret en Supabase (no en el cliente).'
            : unwrapped.message || 'La API Affiliate devolvió un error.',
        },
        502,
      );
    }

    const candidates = unwrapped.products
      .map((p) => normalizeProduct(p, fetchedAt))
      .filter(Boolean);

    structuredLog('discover_proxy_ok', {
      userId: user.id,
      mode,
      qLen: q.length,
      count: candidates.length,
      total: unwrapped.total,
    });

    return json({
      candidates,
      total: unwrapped.total,
      sourceFetchedAt: fetchedAt,
      mode,
      q: mode === 'search' ? q : null,
      disclaimer:
        'AliExpress Affiliate · vivo — oferta (precio/pedidos). No es ranking de demanda en Chile ni Google Trends.',
    });
  } catch (err) {
    structuredLog('discover_proxy_error', {
      detail: err instanceof Error ? err.message.slice(0, 200) : 'unknown',
    });
    return json({ error: 'internal_error', code: 'internal' }, 500);
  }
});
