import { hasGeminiKey, getGeminiKey } from '../utils/geminiStorage.js';
import { isGeminiProxyEnabled } from '../research/geminiProxy.js';

/**
 * Resolved Gemini transport for API flows.
 * Precedence: saved BYOK key > proxy (logged in + configured) > none.
 * @returns {'byok' | 'proxy' | 'none'}
 */
export function getGeminiRoute() {
  if (hasGeminiKey()) return 'byok';
  if (isGeminiProxyEnabled()) return 'proxy';
  return 'none';
}

export function shouldUseGeminiProxy() {
  return getGeminiRoute() === 'proxy';
}

/** @returns {string | 'proxy' | null} */
export function getGeminiApiCredential() {
  const route = getGeminiRoute();
  if (route === 'byok') return getGeminiKey();
  if (route === 'proxy') return 'proxy';
  return null;
}
