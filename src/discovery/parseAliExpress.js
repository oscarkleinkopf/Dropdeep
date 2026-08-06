/**
 * Parse AliExpress product URL or bare item ID (MVP discovery sin Affiliate API).
 */

const AE_HOST_RE = /(?:^|\.)aliexpress\.(?:com|us|ru)|aliexpress\.com\.[a-z]{2}$/i;

/**
 * @param {string} raw
 * @returns {{ ok: true, externalId: string, productUrl: string, titleHint: string | null, inputKind: 'url' | 'id' }
 *   | { ok: false, error: string }}
 */
export function parseAliExpressInput(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) {
    return { ok: false, error: 'Pega una URL de AliExpress o un ID de producto.' };
  }

  // Bare numeric ID (9–20 digits typical for AE item ids)
  if (/^\d{9,20}$/.test(trimmed)) {
    const externalId = trimmed;
    return {
      ok: true,
      externalId,
      productUrl: `https://www.aliexpress.com/item/${externalId}.html`,
      titleHint: null,
      inputKind: 'id',
    };
  }

  let url;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(withProto);
  } catch {
    return {
      ok: false,
      error: 'No parece una URL válida ni un ID numérico de AliExpress.',
    };
  }

  if (!AE_HOST_RE.test(url.hostname)) {
    return {
      ok: false,
      error: 'La URL debe ser de AliExpress (aliexpress.com / .us / regional).',
    };
  }

  const fromPath =
    url.pathname.match(/\/item\/(\d{9,20})\.html/i) ||
    url.pathname.match(/\/i\/(\d{9,20})\.html/i) ||
    url.pathname.match(/\/item\/[^/]*?(\d{9,20})/i);

  const fromQuery =
    url.searchParams.get('productId') ||
    url.searchParams.get('product_id') ||
    url.searchParams.get('item_id');

  const externalId = fromPath?.[1] || (fromQuery && /^\d{9,20}$/.test(fromQuery) ? fromQuery : null);

  if (!externalId) {
    return {
      ok: false,
      error: 'No encontré el ID del producto en la URL. Usa un enlace /item/….html o el ID numérico.',
    };
  }

  const titleHint = titleHintFromPath(url.pathname, externalId);
  const productUrl = `https://www.aliexpress.com/item/${externalId}.html`;

  return {
    ok: true,
    externalId,
    productUrl,
    titleHint,
    inputKind: 'url',
  };
}

function titleHintFromPath(pathname, externalId) {
  // e.g. /item/3000lm-Led-Flashlight-100500123.html → "3000lm Led Flashlight"
  const m = pathname.match(/\/item\/([^/]+?)(?:-\d{9,20})?\.html/i);
  if (!m) return null;
  let slug = decodeURIComponent(m[1]);
  if (slug === externalId || /^\d{9,20}$/.test(slug)) return null;
  slug = slug.replace(new RegExp(`-?${externalId}$`), '');
  const words = slug
    .replace(/[-_+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (words.length < 3) return null;
  return words.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build canonical product URL from ID.
 * @param {string} externalId
 */
export function aliexpressProductUrl(externalId) {
  const id = String(externalId || '').trim();
  if (!/^\d{9,20}$/.test(id)) return '';
  return `https://www.aliexpress.com/item/${id}.html`;
}
