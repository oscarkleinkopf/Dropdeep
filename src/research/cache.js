export function getCacheKey(query, language = 'es') {
  return `dropdeep_cache_${language.toLowerCase()}_${query.toLowerCase().trim()}`;
}

export function getCacheEntry(query, language = 'es') {
  const key = getCacheKey(query, language);
  const entryStr = localStorage.getItem(key);
  if (!entryStr) return null;
  try {
    const entry = JSON.parse(entryStr);
    const age = Date.now() - entry.timestamp;
    if (age > 24 * 60 * 60 * 1000) { // 24 hours
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch (e) {
    return null;
  }
}

export function setCacheEntry(query, data, language = 'es') {
  const key = getCacheKey(query, language);
  const entry = {
    timestamp: Date.now(),
    data: data
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
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        continue;
      }
      entries.push({
        name: parsed.data.name,
        timestamp: parsed.timestamp,
        data: parsed.data,
      });
    } catch {
      /* skip malformed entries */
    }
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}
