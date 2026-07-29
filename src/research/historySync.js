import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { getCurrentUserId, isAuthenticated } from '../auth/auth.js';
import { state } from '../state.js';
import { calculateProductScore } from './scoring.js';
import { listCacheEntries } from './cache.js';
import { sanitizeReport } from './gemini.js';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function portfolioItemFromReport(report, savedAt) {
  const clean = sanitizeReport(report);
  const score = clean.productScore || calculateProductScore(clean);
  clean.productScore = score;
  return {
    id: slugify(clean.name) || `report-${Date.now()}`,
    name: clean.name,
    category: clean.categoryId || 'general',
    cost: clean.cost,
    retail: clean.retail,
    margin: clean.margin,
    roi: clean.roi,
    shipping: clean.shipping,
    saturation: clean.saturation,
    savedAt: savedAt || new Date().toLocaleDateString('es'),
    notes: '',
    fullReport: clean,
    _remoteUpdatedAt: report._remoteUpdatedAt || null,
  };
}

function mergePortfolioItems(localItems, remoteItems) {
  const bySlug = new Map();

  localItems.forEach((item) => {
    bySlug.set(slugify(item.name), { ...item });
  });

  remoteItems.forEach((item) => {
    const key = slugify(item.name);
    const existing = bySlug.get(key);
    const remoteTs = item._remoteUpdatedAt ? Date.parse(item._remoteUpdatedAt) : 0;
    const localTs = existing?._remoteUpdatedAt ? Date.parse(existing._remoteUpdatedAt) : 0;

    if (!existing || remoteTs >= localTs) {
      bySlug.set(key, item);
    }
  });

  return Array.from(bySlug.values()).sort((a, b) => {
    const ta = a._remoteUpdatedAt ? Date.parse(a._remoteUpdatedAt) : 0;
    const tb = b._remoteUpdatedAt ? Date.parse(b._remoteUpdatedAt) : 0;
    return tb - ta;
  });
}

export function savePortfolioLocal() {
  localStorage.setItem('dropdeep_portfolio', JSON.stringify(state.portfolio));
}

/** Upsert a completed report to Supabase (best-effort). */
export async function persistResearchReport(report) {
  if (!isAuthConfigured || !supabase || !isAuthenticated() || !report?.name) {
    return false;
  }

  const clean = sanitizeReport(report);
  const userId = getCurrentUserId();
  const productSlug = slugify(clean.name);
  if (!productSlug) return false;

  const score = clean.productScore || calculateProductScore(clean);
  clean.productScore = score;

  const payload = {
    user_id: userId,
    product_name: clean.name,
    product_slug: productSlug,
    category_id: clean.categoryId || 'general',
    report_json: clean,
    product_score: score,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('research_reports')
    .upsert(payload, { onConflict: 'user_id,product_slug' });

  return !error;
}

/** Fetch remote reports for the logged-in user. */
export async function fetchRemoteReports() {
  if (!isAuthConfigured || !supabase || !isAuthenticated()) {
    return [];
  }

  const userId = getCurrentUserId();
  const { data, error } = await supabase
    .from('research_reports')
    .select('product_name, report_json, product_score, category_id, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error || !Array.isArray(data)) return [];

  return data.map((row) => {
    const report = {
      ...row.report_json,
      productScore: row.product_score ?? row.report_json?.productScore,
      _remoteUpdatedAt: row.updated_at,
    };
    const savedAt = new Date(row.updated_at).toLocaleDateString('es');
    return portfolioItemFromReport(report, savedAt);
  });
}

/**
 * Merge portfolio + remote + recent cache on load.
 * Remote wins on conflict when newer; cache fills gaps for recent runs.
 */
export async function syncResearchHistoryOnLoad() {
  const localPortfolio = JSON.parse(localStorage.getItem('dropdeep_portfolio') || '[]');
  let remoteItems = [];

  try {
    remoteItems = await fetchRemoteReports();
  } catch {
    /* offline — keep local only */
  }

  let merged = mergePortfolioItems(localPortfolio, remoteItems);

  // Surface very recent cache entries not yet in portfolio (read-only in feed)
  listCacheEntries().slice(0, 12).forEach((entry) => {
    const key = slugify(entry.name);
    if (!merged.some((p) => slugify(p.name) === key)) {
      merged.push(portfolioItemFromReport(entry.data, new Date(entry.timestamp).toLocaleDateString('es')));
    }
  });

  state.portfolio = merged;
  savePortfolioLocal();
  return merged.length;
}
