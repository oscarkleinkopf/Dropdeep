const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function getCacheKey(query, language = 'es', source = 'any', mode = 'any') {
  const lang = String(language || 'es').toLowerCase();
  const s = String(source || 'any').toLowerCase();
  const m = String(mode || 'any').toLowerCase();
  const q = String(query || '').toLowerCase().trim();
  return `dropdeep_cache_${lang}_${s}_${m}_${q}`;
}

/** Etiqueta ES para origen de caché (modal / UI). */
export function formatCacheOriginLabel(source, mode) {
  const s = String(source || '').toLowerCase();
  const m = String(mode || '').toLowerCase();
  if (s === 'manual') return 'Evaluación manual';
  const src =
    s === 'copilot' ? 'Copiloto' : s === 'api' ? 'API' : 'Reporte';
  const modeLabel =
    m === 'express' ? 'Express' : m === 'fast' ? 'Rápido' : m === 'complete' ? 'Completo' : '';
  return modeLabel ? `${src} ${modeLabel}` : src;
}

export function getCacheEntry(query, language = 'es', source = 'any', mode = 'any') {
  const key = getCacheKey(query, language, source, mode);
  const entryStr = localStorage.getItem(key);
  if (!entryStr) return null;
  try {
    const entry = JSON.parse(entryStr);
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCacheEntry(query, data, language = 'es', source = 'any', mode = 'any') {
  const key = getCacheKey(query, language, source, mode);
  const entry = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(key, JSON.stringify(entry));
}

/** List valid cache entries (newest first). */
export function listCacheEntries() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('dropdeep_cache_')) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (!parsed?.data?.name) continue;
      const age = Date.now() - parsed.timestamp;
      if (age > CACHE_TTL_MS) {
        localStorage.removeItem(key);
        continue;
      }
      entries.push({
        name: parsed.data.name,
        timestamp: parsed.timestamp,
        data: parsed.data,
        source: parsed.data._source || null,
        mode: parsed.data._researchMode || null,
      });
    } catch {
      /* skip malformed entries */
    }
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}
