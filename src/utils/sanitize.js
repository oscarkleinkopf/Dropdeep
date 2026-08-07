/**
 * Escapa HTML / sanitiza markup para inserción segura en el DOM.
 * - Texto plano en templates → escapeHtml / escapeDeep / e
 * - Markup intencional (Gemini/Shopify/bloques) → purifyHtml / setSafeHtml
 * - Preferir textContent cuando no haga falta HTML
 */
import createDOMPurify from 'dompurify';

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape text before inserting into innerHTML (API/user content). */
export function escapeHtml(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/** Shorthand used in large template literals. */
export const e = escapeHtml;

let purifyInstance = null;

function getPurify() {
  if (purifyInstance) return purifyInstance;
  const root =
    typeof window !== 'undefined'
      ? window
      : typeof globalThis !== 'undefined' && globalThis.document
        ? globalThis
        : null;
  if (!root?.document) {
    return null;
  }
  // En browser el default ya puede ser la instancia; en Node es factory.
  if (typeof createDOMPurify.sanitize === 'function' && createDOMPurify.isSupported) {
    purifyInstance = createDOMPurify;
  } else if (typeof createDOMPurify === 'function') {
    purifyInstance = createDOMPurify(root);
  }
  return purifyInstance;
}

/**
 * Sanitiza HTML (p. ej. bloques Gemini / Shopify) antes de innerHTML.
 * Permite markup de marketing habitual; elimina scripts y handlers.
 * Sin DOM disponible, cae a escapeHtml (texto seguro, sin markup).
 */
export function purifyHtml(dirty, options = {}) {
  if (dirty == null || dirty === '') return '';
  const str = String(dirty);
  const purify = getPurify();
  if (!purify?.sanitize) {
    return escapeHtml(str);
  }
  return purify.sanitize(str, {
    USE_PROFILES: { html: true },
    ...options,
  });
}

/**
 * Asigna HTML sanitizado a un elemento (reemplazo seguro de innerHTML con markup).
 */
export function setSafeHtml(el, dirty, options) {
  if (!el) return;
  el.innerHTML = purifyHtml(dirty, options);
}

/**
 * Only allow http(s) URLs for href/src. Rejects javascript:, data:, etc.
 * Returns '' if unsafe or empty.
 */
export function safeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const withProto = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) ? raw : `https://${raw}`;
    const u = new URL(withProto);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return u.href;
  } catch {
    return '';
  }
}

/** Attribute-safe escaped http(s) URL, or empty string. */
export function safeHref(value) {
  const href = safeUrl(value);
  return href ? escapeHtml(href) : '';
}

/**
 * Encode payload for data-copy attributes (clipboard helpers).
 * Prefer reading via decodeURIComponent on click.
 */
export function dataCopyAttr(value) {
  return escapeHtml(encodeURIComponent(String(value ?? '')));
}

/**
 * Deep-escape strings in plain objects/arrays for safe innerHTML templates.
 * Numbers/booleans/null pass through. Dates preserved.
 */
export function escapeDeep(value) {
  if (value == null) return value;
  if (typeof value === 'string') return escapeHtml(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(escapeDeep);
  if (typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = escapeDeep(child);
    }
    return out;
  }
  return value;
}
