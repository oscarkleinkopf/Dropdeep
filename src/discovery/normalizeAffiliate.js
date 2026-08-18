/**
 * Normalize AliExpress Affiliate API JSON → CandidateDTO (T45).
 * Shared by unit tests and (keep-in-sync) discover-proxy Edge Function.
 */

import { parseUsdPrice, sanitizeProductImageUrl } from './extractProductMeta.js';

const AE_ITEM_HOST_RE = /(?:^|\.)aliexpress\.(?:com|us|ru)|aliexpress\.com\.[a-z]{2}$/i;
const AE_CLICK_HOST_RE = /(?:^|\.)(?:s\.click\.aliexpress\.com|star\.aliexpress\.com)$/i;

/**
 * @typedef {{
 *   source: 'aliexpress',
 *   externalId: string,
 *   title: string,
 *   priceUsd: number | null,
 *   originalPriceUsd?: number | null,
 *   orders?: number | null,
 *   rating?: number | null,
 *   reviewPositivePct?: number | null,
 *   imageUrl?: string | null,
 *   productUrl: string,
 *   affiliateUrl?: string | null,
 *   shipTo?: 'CL',
 *   shipDays?: number | null,
 *   trendScore?: number | null,
 *   trendLabel: 'unknown',
 *   fetchedAt: string,
 * }} CandidateDTO
 */

/**
 * @param {unknown} raw
 * @returns {URL | null}
 */
function parseHttpUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim());
    if (u.protocol === 'http:') u.protocol = 'https:';
    if (u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
  }
}

/**
 * Product page or official click/star affiliate host.
 * @param {unknown} raw
 * @returns {string | null}
 */
export function sanitizeAffiliateProductUrl(raw) {
  const u = parseHttpUrl(raw);
  if (!u) return null;
  if (AE_CLICK_HOST_RE.test(u.hostname)) return u.href;
  if (!AE_ITEM_HOST_RE.test(u.hostname)) return null;
  if (/\/item\/|\/i\//i.test(u.pathname) || u.searchParams.has('productId')) return u.href;
  return u.href;
}

/**
 * @param {unknown} raw
 */
export function parseOrders(raw) {
  if (raw == null || raw === '') return null;
  const n = Number.parseInt(String(raw).replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/**
 * evaluate_rate is often "4.8%" (stars) or "95.4%" (positive reviews).
 * @param {unknown} raw
 * @returns {{ rating: number | null, reviewPositivePct: number | null }}
 */
export function parseEvaluateRate(raw) {
  if (raw == null || raw === '') return { rating: null, reviewPositivePct: null };
  const n = Number.parseFloat(String(raw).replace('%', '').trim());
  if (!Number.isFinite(n) || n < 0) return { rating: null, reviewPositivePct: null };
  if (n <= 5) return { rating: Math.round(n * 10) / 10, reviewPositivePct: null };
  return { rating: null, reviewPositivePct: Math.round(n * 10) / 10 };
}

/**
 * "7" or "5-12" → integer days when a single number; otherwise null.
 * @param {unknown} raw
 */
export function parseShipDays(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (/^\d+$/.test(s)) {
    const n = Number.parseInt(s, 10);
    return n > 0 && n < 365 ? n : null;
  }
  return null;
}

/**
 * @param {unknown} payload
 */
export function unwrapAffiliateResult(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, code: 'empty', message: 'Respuesta Affiliate vacía', products: [], total: 0 };
  }

  const err = payload.error_response;
  if (err) {
    return {
      ok: false,
      code: String(err.code || 'ae_error'),
      message: String(err.msg || err.sub_msg || 'Error Affiliate'),
      products: [],
      total: 0,
    };
  }

  const envelope =
    payload.aliexpress_affiliate_product_query_response ||
    payload.aliexpress_affiliate_hotproduct_query_response ||
    payload;

  const resp = envelope.resp_result || envelope;
  const respCode = resp.resp_code ?? resp.code;
  const respMsg = String(resp.resp_msg || resp.msg || '');
  const codeNum = Number.parseInt(String(respCode ?? ''), 10);

  if (Number.isFinite(codeNum) && codeNum !== 200) {
    return {
      ok: false,
      code: String(respCode),
      message: respMsg || `Affiliate resp_code ${respCode}`,
      products: [],
      total: 0,
    };
  }

  const result = resp.result || envelope.result || {};
  let products = result.products?.product ?? result.products ?? [];
  if (!Array.isArray(products)) products = products ? [products] : [];

  const total = Number.parseInt(String(result.total_record_count ?? products.length), 10) || products.length;

  return {
    ok: true,
    code: String(respCode ?? '200'),
    message: respMsg || 'ok',
    products,
    total,
  };
}

/**
 * @param {Record<string, unknown>} raw
 * @param {string} [fetchedAt]
 * @returns {CandidateDTO | null}
 */
export function normalizeAffiliateProduct(raw, fetchedAt = new Date().toISOString()) {
  if (!raw || typeof raw !== 'object') return null;

  const externalId = String(raw.product_id ?? raw.productId ?? '').trim();
  const title = String(raw.product_title ?? raw.productTitle ?? raw.title ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

  const productUrl =
    sanitizeAffiliateProductUrl(raw.product_detail_url) ||
    sanitizeAffiliateProductUrl(raw.product_url) ||
    sanitizeAffiliateProductUrl(raw.promotion_link);

  if (!externalId || !title || !productUrl) return null;

  const priceUsd =
    parseUsdPrice(raw.target_sale_price ?? raw.target_app_sale_price ?? raw.sale_price, 'USD');

  const originalPriceUsd = parseUsdPrice(
    raw.target_original_price ?? raw.original_price,
    'USD',
  );

  const { rating, reviewPositivePct } = parseEvaluateRate(raw.evaluate_rate);
  const affiliateUrl = sanitizeAffiliateProductUrl(raw.promotion_link);

  return {
    source: 'aliexpress',
    externalId,
    title,
    priceUsd,
    originalPriceUsd: originalPriceUsd ?? null,
    orders: parseOrders(raw.lastest_volume ?? raw.latest_volume ?? raw.last_volume),
    rating,
    reviewPositivePct,
    imageUrl: sanitizeProductImageUrl(raw.product_main_image_url || raw.product_small_image_urls?.string?.[0]),
    productUrl,
    affiliateUrl: affiliateUrl && affiliateUrl !== productUrl ? affiliateUrl : affiliateUrl || null,
    shipTo: 'CL',
    shipDays: parseShipDays(raw.ship_to_days),
    trendScore: null,
    trendLabel: 'unknown',
    fetchedAt,
  };
}

/**
 * @param {unknown} payload
 * @param {string} [fetchedAt]
 */
export function normalizeAffiliatePayload(payload, fetchedAt = new Date().toISOString()) {
  const unwrapped = unwrapAffiliateResult(payload);
  if (!unwrapped.ok) {
    return { ...unwrapped, candidates: [] };
  }
  const candidates = unwrapped.products
    .map((p) => normalizeAffiliateProduct(p, fetchedAt))
    .filter(Boolean);
  return {
    ...unwrapped,
    candidates,
  };
}
