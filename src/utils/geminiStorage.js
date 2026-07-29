const LEGACY_KEY = 'dropdeep_gemini_key';
const KEY_PREFIX = 'dropdeep_gemini_key_';
const PREF_PREFIX = 'dropdeep_gemini_';

let activeUserId = null;

/** Called by auth layer when session changes. */
export function setGeminiStorageUser(userId) {
  activeUserId = userId || null;
  if (userId) {
    migrateLegacyKey(userId);
  }
}

function scopedSuffix() {
  return activeUserId || 'anonymous';
}

function keyStorageKey() {
  const suffix = scopedSuffix();
  return suffix === 'anonymous' ? LEGACY_KEY : `${KEY_PREFIX}${suffix}`;
}

function prefStorageKey(name) {
  const suffix = scopedSuffix();
  return suffix === 'anonymous'
    ? `${PREF_PREFIX}${name}`
    : `${PREF_PREFIX}${name}_${suffix}`;
}

/** Move one-time global key to the logged-in user bucket; clear legacy to avoid shared-machine bleed. */
function migrateLegacyKey(userId) {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy?.trim()) return;

  const userKey = `${KEY_PREFIX}${userId}`;
  if (!localStorage.getItem(userKey)) {
    localStorage.setItem(userKey, legacy);
  }
  localStorage.removeItem(LEGACY_KEY);
}

export function getGeminiKey() {
  return localStorage.getItem(keyStorageKey())?.trim() || '';
}

export function setGeminiKey(key) {
  if (!key?.trim()) {
    localStorage.removeItem(keyStorageKey());
    return;
  }
  localStorage.setItem(keyStorageKey(), key.trim());
}

export function removeGeminiKey() {
  localStorage.removeItem(keyStorageKey());
}

export function hasGeminiKey() {
  return Boolean(getGeminiKey());
}

export function getGeminiPref(name, fallback = '') {
  return localStorage.getItem(prefStorageKey(name)) ?? fallback;
}

export function setGeminiPref(name, value) {
  localStorage.setItem(prefStorageKey(name), value);
}

export function getGeminiModel() {
  return getGeminiPref('model', 'gemini-2.5-flash');
}

export function getGeminiLanguage() {
  return getGeminiPref('language', 'es');
}

export function isGeminiGroundingEnabled() {
  return getGeminiPref('grounding', 'true') !== 'false';
}

export function saveGeminiSettings({ key, model, grounding, language }) {
  if (key?.trim()) {
    setGeminiKey(key);
  }
  setGeminiPref('model', model);
  setGeminiPref('grounding', grounding ? 'true' : 'false');
  setGeminiPref('language', language);
}
