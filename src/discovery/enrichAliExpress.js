/**
 * Enrich AliExpress paste candidates without Affiliate API (T53).
 * Sources (honest badges): URL slug hint → Edge OG fetch → Gemini BYOK inferido.
 * Proxy Gemini is NOT used here (avoids burning daily investigation quota).
 */

import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { isAuthenticated } from '../auth/auth.js';
import { getGeminiRoute } from '../config/geminiRoute.js';
import { getGeminiKey, getGeminiModel, isGeminiGroundingEnabled } from '../utils/geminiStorage.js';
import { parseUsdPrice, sanitizeProductImageUrl } from './extractProductMeta.js';

/**
 * @typedef {{ title?: string | null, costUsd?: number | null, imageUrl?: string | null, source: string, verified: false }} EnrichmentFields
 */

/**
 * Merge enrichment into empty candidate fields only.
 * @param {{ title?: string | null, costUsd?: number | null, imageUrl?: string | null }} current
 * @param {EnrichmentFields} incoming
 */
export function mergeEnrichment(current, incoming) {
  const next = {
    title: current.title || null,
    costUsd: current.costUsd ?? null,
    imageUrl: current.imageUrl || null,
    sources: { ...(current.sources || {}) },
  };

  if (!next.title && incoming.title) {
    next.title = String(incoming.title).trim().slice(0, 200);
    next.sources.title = incoming.source;
  }
  if ((next.costUsd == null || next.costUsd <= 0) && incoming.costUsd != null && incoming.costUsd > 0) {
    next.costUsd = incoming.costUsd;
    next.sources.cost = incoming.source;
  }
  if (!next.imageUrl && incoming.imageUrl) {
    const safe = sanitizeProductImageUrl(incoming.imageUrl);
    if (safe) {
      next.imageUrl = safe;
      next.sources.image = incoming.source;
    }
  }
  return next;
}

/**
 * Parse Gemini JSON for enrich fields.
 * @param {string} text
 * @returns {EnrichmentFields | null}
 */
export function parseEnrichmentJson(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      data = JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object') return null;

  const title = data.title || data.productName || data.name || null;
  const costUsd = parseUsdPrice(
    data.costUsd ?? data.priceUsd ?? data.price ?? data.estimatedCost,
    data.currency || 'USD',
  );
  const imageUrl = sanitizeProductImageUrl(data.imageUrl || data.image || data.thumbnail);

  if (!title && costUsd == null && !imageUrl) return null;

  return {
    title: title ? String(title).trim().slice(0, 200) : null,
    costUsd,
    imageUrl,
    source: 'gemini-inferred',
    verified: false,
  };
}

export function buildEnrichPrompt(productUrl, externalId) {
  return `Busca datos públicos del producto AliExpress en esta URL (ID ${externalId}):
${productUrl}

Devuelve SOLO un JSON válido (sin markdown) con:
{
  "title": "nombre corto del producto en español o inglés",
  "costUsd": 12.34,
  "currency": "USD",
  "imageUrl": "https://ae01.alicdn.com/… o null",
  "confidence": "low|medium|high"
}

Reglas:
- costUsd = precio de compra aproximado en USD (no PVP de tienda dropship).
- Si no estás seguro de un campo, usa null.
- Nunca inventes IDs ni URLs de imagen que no hayas visto.
- Esto NO es dato oficial Affiliate.`;
}

/**
 * Human-readable badge for enrichment source.
 * @param {string} source
 */
export function enrichSourceLabel(source) {
  switch (source) {
    case 'url-hint':
      return 'Sugerido desde URL (no verificado)';
    case 'og-meta':
      return 'Meta pública (no verificado)';
    case 'gemini-inferred':
      return 'Inferido por IA (no verificado)';
    case 'affiliate':
      return 'AliExpress Affiliate · vivo';
    default:
      return 'No verificado';
  }
}

/**
 * Try Edge Function discover-enrich (OG/meta HTML). Fails soft if undeployed.
 * @param {string} productUrl
 * @returns {Promise<EnrichmentFields | null>}
 */
export async function enrichViaEdgeMeta(productUrl) {
  if (!isAuthConfigured || !supabase || !isAuthenticated()) return null;

  try {
    const { data, error } = await supabase.functions.invoke('discover-enrich', {
      body: { productUrl },
    });
    if (error || data?.error || !data) return null;

    const title = data.title ? String(data.title).trim().slice(0, 200) : null;
    const costUsd =
      typeof data.priceUsd === 'number'
        ? data.priceUsd
        : parseUsdPrice(data.priceUsd, data.currency || 'USD');
    const imageUrl = sanitizeProductImageUrl(data.imageUrl);

    if (!title && costUsd == null && !imageUrl) return null;

    return {
      title,
      costUsd,
      imageUrl,
      source: 'og-meta',
      verified: false,
    };
  } catch {
    return null;
  }
}

/**
 * BYOK Gemini enrich only (never proxy — quota).
 * @param {{ productUrl: string, externalId: string }} args
 * @returns {Promise<EnrichmentFields | null>}
 */
export async function enrichViaGeminiByok({ productUrl, externalId }) {
  if (getGeminiRoute() !== 'byok') return null;
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const modelName = getGeminiModel();
    const useSearch = isGeminiGroundingEnabled();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...(useSearch ? { tools: [{ google_search: {} }] } : {}),
    });

    const prompt = buildEnrichPrompt(productUrl, externalId);
    const res = await model.generateContent(prompt);
    const text = res.response?.text?.() || '';
    return parseEnrichmentJson(text);
  } catch {
    return null;
  }
}

/**
 * Full enrich pipeline. Always starts from URL title hint when present.
 * @param {{ productUrl: string, externalId: string, titleHint?: string | null }} candidate
 * @param {{ signal?: AbortSignal }} [opts]
 */
export async function enrichAliExpressCandidate(candidate, opts = {}) {
  const { signal } = opts;
  let merged = {
    title: candidate.titleHint || null,
    costUsd: null,
    imageUrl: null,
    sources: candidate.titleHint ? { title: 'url-hint' } : {},
  };

  const throwIfAborted = () => {
    if (signal?.aborted) {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    }
  };

  throwIfAborted();
  const edge = await enrichViaEdgeMeta(candidate.productUrl);
  throwIfAborted();
  if (edge) merged = mergeEnrichment(merged, edge);

  const needsMore = !merged.title || merged.costUsd == null || !merged.imageUrl;
  if (needsMore) {
    const gemini = await enrichViaGeminiByok({
      productUrl: candidate.productUrl,
      externalId: candidate.externalId,
    });
    throwIfAborted();
    if (gemini) merged = mergeEnrichment(merged, gemini);
  }

  const filled = Boolean(merged.title || merged.costUsd != null || merged.imageUrl);
  return {
    ...merged,
    verified: false,
    filled,
  };
}
