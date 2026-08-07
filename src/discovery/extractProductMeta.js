/**
 * Extract product title / image / price hints from public HTML (OG, JSON-LD).
 * Used by discover-enrich Edge Function and unit tests — never claims Affiliate accuracy.
 */

const AE_HOST_RE = /(?:^|\.)aliexpress\.(?:com|us|ru)|aliexpress\.com\.[a-z]{2}$/i;
const SAFE_IMAGE_HOST_RE =
  /(?:^|\.)(?:alicdn\.com|aliexpress(?:-media)?\.com|ae-pic-a1\.aliexpress-media\.com)$/i;

/**
 * @param {string} productUrl
 * @returns {boolean}
 */
export function isAllowedAliExpressProductUrl(productUrl) {
  try {
    const u = new URL(String(productUrl || '').trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    if (!AE_HOST_RE.test(u.hostname)) return false;
    return /\/item\/|\/i\//i.test(u.pathname) || u.searchParams.has('productId');
  } catch {
    return false;
  }
}

/**
 * @param {string} imageUrl
 * @returns {string | null}
 */
export function sanitizeProductImageUrl(imageUrl) {
  try {
    const u = new URL(String(imageUrl || '').trim());
    if (u.protocol !== 'https:') return null;
    if (!SAFE_IMAGE_HOST_RE.test(u.hostname) && !AE_HOST_RE.test(u.hostname)) return null;
    return u.href;
  } catch {
    return null;
  }
}

/**
 * Parse a price string into USD number when currency looks like USD; else null.
 * @param {unknown} raw
 * @param {string} [currencyHint]
 * @returns {number | null}
 */
export function parseUsdPrice(raw, currencyHint = '') {
  if (raw == null || raw === '') return null;
  const cur = String(currencyHint || '').trim().toUpperCase();
  const s = String(raw).trim();

  const looksUsd =
    !cur ||
    cur === 'USD' ||
    cur === 'US$' ||
    cur === '$' ||
    /\bUSD\b/i.test(s) ||
    /US\s*\$/i.test(s) ||
    /^\$/.test(s);

  if (!looksUsd && cur && cur !== 'USD') return null;

  const cleaned = s
    .replace(/US\s*\$/gi, '')
    .replace(/USD/gi, '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim();
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
  return Math.round(n * 100) / 100;
}

function metaContent(html, propertyOrName) {
  const prop = propertyOrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
    'i',
  );
  const m = html.match(re1) || html.match(re2);
  return m?.[1]?.trim() || null;
}

function decodeBasicEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractJsonLdProducts(html) {
  const blocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      blocks.push(parsed);
    } catch {
      /* ignore bad JSON-LD */
    }
  }
  return flattenJsonLd(blocks).filter((n) => {
    const t = n?.['@type'];
    if (!t) return false;
    const types = Array.isArray(t) ? t : [t];
    return types.some((x) => String(x).toLowerCase() === 'product');
  });
}

function flattenJsonLd(nodes) {
  const out = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (typeof n !== 'object') return;
    if (Array.isArray(n['@graph'])) walk(n['@graph']);
    out.push(n);
  };
  walk(nodes);
  return out;
}

function priceFromOffers(offers) {
  if (!offers) return { price: null, currency: '' };
  const list = Array.isArray(offers) ? offers : [offers];
  for (const o of list) {
    if (!o || typeof o !== 'object') continue;
    const price = o.price ?? o.lowPrice ?? o.highPrice;
    const currency = o.priceCurrency || '';
    const parsed = parseUsdPrice(price, currency);
    if (parsed != null) return { price: parsed, currency: currency || 'USD' };
  }
  return { price: null, currency: '' };
}

/**
 * @param {string} html
 * @returns {{ title: string | null, imageUrl: string | null, priceUsd: number | null, source: 'og-meta' }}
 */
export function extractProductMetaFromHtml(html) {
  const raw = String(html || '');
  let title =
    metaContent(raw, 'og:title') ||
    metaContent(raw, 'twitter:title') ||
    null;
  if (!title) {
    const tm = raw.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = tm?.[1] ? decodeBasicEntities(tm[1]) : null;
  } else {
    title = decodeBasicEntities(title);
  }
  if (title) {
    title = title
      .replace(/\s*[-|–]\s*AliExpress.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (title.length < 3) title = null;
  }

  let imageUrl =
    metaContent(raw, 'og:image') ||
    metaContent(raw, 'twitter:image') ||
    metaContent(raw, 'og:image:secure_url') ||
    null;
  imageUrl = sanitizeProductImageUrl(imageUrl);

  let priceUsd = parseUsdPrice(
    metaContent(raw, 'product:price:amount') || metaContent(raw, 'og:price:amount'),
    metaContent(raw, 'product:price:currency') || metaContent(raw, 'og:price:currency') || '',
  );

  if (priceUsd == null) {
    for (const product of extractJsonLdProducts(raw)) {
      if (!title && product.name) {
        title = decodeBasicEntities(String(product.name)).slice(0, 200);
      }
      if (!imageUrl) {
        const img = Array.isArray(product.image) ? product.image[0] : product.image;
        imageUrl = sanitizeProductImageUrl(img);
      }
      if (priceUsd == null) {
        const fromOffer = priceFromOffers(product.offers);
        priceUsd = fromOffer.price;
      }
      if (title && imageUrl && priceUsd != null) break;
    }
  }

  return {
    title: title || null,
    imageUrl: imageUrl || null,
    priceUsd,
    source: 'og-meta',
  };
}
