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

// ==========================================================================
// PRODUCT SCORE SYSTEM (0-100)
