import { supabase, isAuthConfigured } from '../auth/supabaseClient.js';
import { getCurrentUserId, isAuthenticated } from '../auth/auth.js';
import { state } from '../state.js';
import { calculateProductScore } from './scoring.js';
import { listCacheEntries } from './cache.js';
import { sanitizeReport } from './reportSanitize.js';
import { ANALYTICS_EVENTS, trackEventFireAndForget } from '../utils/analytics.js';

const DELETED_SLUGS_KEY = 'dropdeep_portfolio_deleted_slugs';

/** Same slug used for research_reports.product_slug upserts. */
export function productSlugFromName(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function slugify(name) {
  return productSlugFromName(name);
}

/** Slugs deleted locally while remote delete is pending / to block merge resurrection. */
export function readDeletedPortfolioSlugs() {
  try {
    const raw = localStorage.getItem(DELETED_SLUGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string' && s) : [];
  } catch {
    return [];
  }
}

function writeDeletedPortfolioSlugs(slugs) {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) {
    localStorage.removeItem(DELETED_SLUGS_KEY);
    return;
  }
  localStorage.setItem(DELETED_SLUGS_KEY, JSON.stringify(unique));
}

export function markPortfolioSlugDeletedLocally(productName) {
  const slug = productSlugFromName(productName);
  if (!slug) return;
  const next = new Set(readDeletedPortfolioSlugs());
  next.add(slug);
  writeDeletedPortfolioSlugs([...next]);
}

export function clearPortfolioSlugDeletedMark(productNameOrSlug) {
  const slug = productSlugFromName(productNameOrSlug) || productNameOrSlug;
  if (!slug) return;
  writeDeletedPortfolioSlugs(readDeletedPortfolioSlugs().filter((s) => s !== slug));
}

/**
 * Sync status for portfolio detail (T19).
 * @returns {{ key: 'synced' | 'local', label: string }}
 */
export function getPortfolioSyncStatus(item) {
  if (!isAuthenticated()) {
    return { key: 'local', label: 'Solo local' };
  }
  if (item?._remoteUpdatedAt) {
    return { key: 'synced', label: 'Sincronizado' };
  }
  return { key: 'local', label: 'Solo local' };
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

/**
 * Merge local + remote portfolio rows. Tombstoned slugs are excluded so a failed
 * offline delete does not resurrect the product on next load (T19).
 */
export function mergePortfolioItems(localItems, remoteItems, deletedSlugs = readDeletedPortfolioSlugs()) {
  const deleted = new Set(deletedSlugs);
  const bySlug = new Map();

  localItems.forEach((item) => {
    const key = slugify(item.name);
    if (!key || deleted.has(key)) return;
    bySlug.set(key, { ...item });
  });

  remoteItems.forEach((item) => {
    const key = slugify(item.name);
    if (!key || deleted.has(key)) return;
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
  trackEventFireAndForget(ANALYTICS_EVENTS.SAVE_PORTFOLIO, {
    n: Array.isArray(state.portfolio) ? state.portfolio.length : 0,
  });
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

  // Re-saving clears a prior local delete mark for this slug
  clearPortfolioSlugDeletedMark(productSlug);

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

  if (!error) {
    // Reflect cloud stamp on in-memory portfolio item when present
    const local = state.portfolio?.find((p) => slugify(p.name) === productSlug);
    if (local) {
      local._remoteUpdatedAt = payload.updated_at;
      if (local.fullReport) local.fullReport._remoteUpdatedAt = payload.updated_at;
      savePortfolioLocal();
    }
  }

  return !error;
}

/**
 * Delete a research_reports row for the logged-in user (T19).
 * @returns {{ ok: boolean, skipped?: boolean, reason?: string, error?: string }}
 */
export async function deleteRemoteResearchReport(productName) {
  const productSlug = productSlugFromName(productName);
  if (!productSlug) {
    return { ok: false, reason: 'invalid-slug' };
  }

  if (!isAuthConfigured || !supabase || !isAuthenticated()) {
    return { ok: true, skipped: true, reason: 'no-session' };
  }

  const userId = getCurrentUserId();
  if (!userId) {
    return { ok: true, skipped: true, reason: 'no-session' };
  }

  const { error } = await supabase
    .from('research_reports')
    .delete()
    .eq('user_id', userId)
    .eq('product_slug', productSlug);

  if (error) {
    return { ok: false, error: error.message || 'delete-failed' };
  }

  clearPortfolioSlugDeletedMark(productSlug);
  return { ok: true };
}

/**
 * Local delete + best-effort remote delete. Marks tombstone first so merge
 * cannot resurrect the row if the network call fails.
 * @returns {{ ok: boolean, remoteOk: boolean, skipped?: boolean, error?: string }}
 */
export async function deletePortfolioItemEverywhere(productName) {
  markPortfolioSlugDeletedLocally(productName);
  try {
    const remote = await deleteRemoteResearchReport(productName);
    if (remote.skipped) {
      clearPortfolioSlugDeletedMark(productName);
      return { ok: true, remoteOk: false, skipped: true, reason: remote.reason };
    }
    if (!remote.ok) {
      return { ok: true, remoteOk: false, error: remote.error };
    }
    return { ok: true, remoteOk: true };
  } catch (err) {
    return {
      ok: true,
      remoteOk: false,
      error: err?.message || 'offline',
    };
  }
}

/** Retry pending remote deletes (called on history sync). */
export async function flushPendingRemoteDeletes() {
  if (!isAuthConfigured || !supabase || !isAuthenticated()) return;
  const pending = readDeletedPortfolioSlugs();
  for (const slug of pending) {
    try {
      const result = await deleteRemoteResearchReport(slug);
      if (!result.ok && !result.skipped) {
        /* keep tombstone for next attempt */
      }
    } catch {
      /* keep tombstone */
    }
  }
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
    await flushPendingRemoteDeletes();
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
