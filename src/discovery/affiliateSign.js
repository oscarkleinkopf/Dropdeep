/**
 * AliExpress Open Platform / Affiliate request signing (T45).
 * Server-side only — never import this module from browser UI.
 *
 * Default (sign_method=md5): MD5(appSecret + sorted key+value concat + appSecret).
 * Optional IOP: HMAC-SHA256 of the concat, key = appSecret (sign_method=hmac-sha256).
 */

/**
 * Concatenate params as key1value1key2value2… (sorted keys, skip sign / empty).
 * @param {Record<string, string | number | undefined | null>} params
 */
export function sortedConcat(params) {
  return Object.keys(params)
    .filter((key) => key !== 'sign' && params[key] != null && String(params[key]) !== '')
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join('');
}

/**
 * Timestamp in GMT+8 (Asia/Shanghai), format yyyy-MM-dd HH:mm:ss.
 * @param {Date} [date]
 */
export function beijingTimestamp(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

/**
 * @param {Record<string, string>} params
 * @param {string} appSecret
 * @param {(utf8: string) => string} md5Hex
 */
export function signMd5Bookend(params, appSecret, md5Hex) {
  const wrapped = `${appSecret}${sortedConcat(params)}${appSecret}`;
  return String(md5Hex(wrapped)).toUpperCase();
}

/**
 * @param {Record<string, string>} params
 * @param {string} appSecret
 * @param {(secret: string, utf8: string) => string} hmacSha256Hex
 */
export function signHmacSha256(params, appSecret, hmacSha256Hex) {
  return String(hmacSha256Hex(appSecret, sortedConcat(params))).toUpperCase();
}

/**
 * Build system + business params and attach `sign`.
 * @param {{
 *   appKey: string,
 *   appSecret: string,
 *   method: string,
 *   business: Record<string, string | number | undefined | null>,
 *   signMethod?: 'md5' | 'hmac-sha256',
 *   timestamp?: string,
 *   md5Hex: (utf8: string) => string,
 *   hmacSha256Hex?: (secret: string, utf8: string) => string,
 * }} opts
 */
export function buildSignedParams(opts) {
  const signMethod = opts.signMethod === 'hmac-sha256' ? 'hmac-sha256' : 'md5';
  const params = {
    app_key: String(opts.appKey),
    method: String(opts.method),
    timestamp: opts.timestamp || beijingTimestamp(),
    sign_method: signMethod,
    v: '2.0',
    format: 'json',
    simplify: 'true',
  };

  for (const [key, value] of Object.entries(opts.business || {})) {
    if (value == null || String(value).trim() === '') continue;
    params[key] = String(value);
  }

  if (signMethod === 'hmac-sha256') {
    if (typeof opts.hmacSha256Hex !== 'function') {
      throw new Error('hmacSha256Hex required for hmac-sha256');
    }
    params.sign = signHmacSha256(params, opts.appSecret, opts.hmacSha256Hex);
  } else {
    params.sign = signMd5Bookend(params, opts.appSecret, opts.md5Hex);
  }

  return params;
}
