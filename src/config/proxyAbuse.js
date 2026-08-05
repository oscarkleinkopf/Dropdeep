/** Client-side mirrors of gemini-proxy abuse limits (T20). */

/** Max JSON length of `contents` accepted by the proxy Edge Function. */
export const PROXY_MAX_CONTENTS_CHARS = 100_000;

/** Max proxy requests per sliding window. */
export const PROXY_RATE_LIMIT_MAX = 10;

/** Sliding window length in seconds. */
export const PROXY_RATE_LIMIT_WINDOW_SEC = 10;

/** Minimum seconds between NEW research sessions per user. */
export const PROXY_NEW_SESSION_COOLDOWN_SEC = 30;

/** Estimate serialized size of Gemini `contents` payload. */
export function estimateContentsChars(contents) {
  try {
    return JSON.stringify(contents ?? null).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function isProxyContentsTooLarge(contents, maxChars = PROXY_MAX_CONTENTS_CHARS) {
  return estimateContentsChars(contents) > maxChars;
}
