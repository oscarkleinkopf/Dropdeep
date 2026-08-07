// Supabase Edge Function: discover-enrich (T53)
// Limited public HTML meta fetch for AliExpress product URLs.
// Deploy: supabase functions deploy discover-enrich --project-ref <ref>
// Auth required. Does NOT use Affiliate API or Gemini. Never claims verified prices.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AE_HOST_RE = /(?:^|\.)aliexpress\.(?:com|us|ru)|aliexpress\.com\.[a-z]{2}$/i;
const SAFE_IMAGE_HOST_RE =
  /(?:^|\.)(?:alicdn\.com|aliexpress(?:-media)?\.com|ae-pic-a1\.aliexpress-media\.com)$/i;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_CHARS = 400_000;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function structuredLog(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }));
}

function isAllowedProductUrl(productUrl: string): boolean {
  try {
    const u = new URL(productUrl);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    if (!AE_HOST_RE.test(u.hostname)) return false;
    return /\/item\/|\/i\//i.test(u.pathname) || u.searchParams.has('productId');
  } catch {
    return false;
  }
}

function sanitizeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  try {
    const u = new URL(imageUrl.trim());
    if (u.protocol !== 'https:') return null;
    if (!SAFE_IMAGE_HOST_RE.test(u.hostname) && !AE_HOST_RE.test(u.hostname)) return null;
    return u.href;
  } catch {
    return null;
  }
}

function parseUsdPrice(raw: unknown, currencyHint = ''): number | null {
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

function metaContent(html: string, propertyOrName: string): string | null {
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

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractProductMetaFromHtml(html: string) {
  const raw = html;
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
  imageUrl = sanitizeImageUrl(imageUrl);

  let priceUsd = parseUsdPrice(
    metaContent(raw, 'product:price:amount') || metaContent(raw, 'og:price:amount'),
    metaContent(raw, 'product:price:currency') || metaContent(raw, 'og:price:currency') || '',
  );

  // Lightweight JSON-LD Product scan
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch;
  while ((ldMatch = ldRe.exec(raw))) {
    try {
      const parsed = JSON.parse(ldMatch[1].trim());
      const nodes = Array.isArray(parsed)
        ? parsed
        : parsed?.['@graph']
          ? parsed['@graph']
          : [parsed];
      for (const n of nodes) {
        const t = n?.['@type'];
        const types = Array.isArray(t) ? t : [t];
        if (!types.some((x: string) => String(x).toLowerCase() === 'product')) continue;
        if (!title && n.name) title = decodeBasicEntities(String(n.name)).slice(0, 200);
        if (!imageUrl) {
          const img = Array.isArray(n.image) ? n.image[0] : n.image;
          imageUrl = sanitizeImageUrl(img ? String(img) : null);
        }
        if (priceUsd == null && n.offers) {
          const offers = Array.isArray(n.offers) ? n.offers : [n.offers];
          for (const o of offers) {
            priceUsd = parseUsdPrice(o?.price ?? o?.lowPrice, o?.priceCurrency || '');
            if (priceUsd != null) break;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  return { title, imageUrl, priceUsd };
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
    if (!supabaseUrl || !supabaseAnon) {
      return json({ error: 'Server misconfigured (Supabase env)' }, 500);
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

    let body: { productUrl?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body', code: 'bad_request' }, 400);
    }

    const productUrl = String(body.productUrl || '').trim();
    if (!productUrl || !isAllowedProductUrl(productUrl)) {
      return json(
        {
          error: 'invalid_url',
          code: 'bad_request',
          message: 'Solo se permiten URLs de producto AliExpress (https).',
        },
        400,
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let upstream: Response;
    try {
      upstream = await fetch(productUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DropDeepDiscoverEnrich/1.0; +https://github.com/oscarkleinkopf/Dropdeep)',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        },
      });
    } catch (err) {
      structuredLog('discover_enrich_fetch_fail', {
        userId: user.id,
        reason: err instanceof Error ? err.name : 'fetch_error',
      });
      return json(
        {
          error: 'fetch_failed',
          code: 'enrich_fetch_failed',
          message: 'No se pudo leer la ficha pública. Completa los campos a mano.',
          verified: false,
        },
        502,
      );
    } finally {
      clearTimeout(timer);
    }

    if (!upstream.ok) {
      structuredLog('discover_enrich_upstream_status', {
        userId: user.id,
        status: upstream.status,
      });
      return json(
        {
          error: 'upstream_http',
          code: 'enrich_upstream',
          message: `AliExpress respondió HTTP ${upstream.status}. Completa a mano.`,
          verified: false,
        },
        502,
      );
    }

    const html = (await upstream.text()).slice(0, MAX_HTML_CHARS);
    const meta = extractProductMetaFromHtml(html);
    const filled = Boolean(meta.title || meta.imageUrl || meta.priceUsd != null);

    structuredLog('discover_enrich_ok', {
      userId: user.id,
      filled,
      hasTitle: Boolean(meta.title),
      hasImage: Boolean(meta.imageUrl),
      hasPrice: meta.priceUsd != null,
    });

    return json({
      title: meta.title,
      imageUrl: meta.imageUrl,
      priceUsd: meta.priceUsd,
      source: 'og-meta',
      verified: false,
      disclaimer:
        'Datos de meta pública / HTML — no verificados y no son Affiliate API. Confirma en AliExpress.',
    });
  } catch (err) {
    structuredLog('discover_enrich_error', {
      detail: err instanceof Error ? err.message.slice(0, 200) : 'unknown',
    });
    return json({ error: 'internal_error', code: 'internal' }, 500);
  }
});
