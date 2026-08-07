/**
 * Local dogfooding feedback per report (T35).
 * Keys: dropdeep_report_feedback_{slug}
 * Cloud sync is opt-in via feedbackCloud.js (T54) — never automatic.
 */

const KEY_PREFIX = 'dropdeep_report_feedback_';
export const FEEDBACK_NOTE_MAX = 280;
export const FEEDBACK_HELPFUL = Object.freeze({
  YES: 'yes',
  NO: 'no',
  UNSURE: 'unsure',
});

/** Align with research_reports / portfolio slug rules. */
export function feedbackProductSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function feedbackStorageKey(productNameOrSlug) {
  const slug = feedbackProductSlug(productNameOrSlug);
  return slug ? `${KEY_PREFIX}${slug}` : null;
}

export function normalizeHelpful(value) {
  if (value === FEEDBACK_HELPFUL.YES || value === FEEDBACK_HELPFUL.NO || value === FEEDBACK_HELPFUL.UNSURE) {
    return value;
  }
  return null;
}

export function clampFeedbackNote(note) {
  return String(note ?? '').slice(0, FEEDBACK_NOTE_MAX);
}

/**
 * @returns {{ productSlug: string, helpful: 'yes'|'no'|'unsure', note: string, updatedAt: string } | null}
 */
export function getReportFeedback(productNameOrSlug) {
  const key = feedbackStorageKey(productNameOrSlug);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const helpful = normalizeHelpful(data?.helpful);
    if (!helpful || !data?.productSlug) return null;
    return {
      productSlug: String(data.productSlug),
      helpful,
      note: clampFeedbackNote(data.note),
      updatedAt: data.updatedAt || '',
    };
  } catch {
    return null;
  }
}

export function hasReportFeedback(productNameOrSlug) {
  return !!getReportFeedback(productNameOrSlug);
}

/**
 * @param {{ productName?: string, productSlug?: string, helpful: string, note?: string }} input
 * @returns {{ ok: true, feedback: object } | { ok: false, error: string }}
 */
export function saveReportFeedback(input) {
  const helpful = normalizeHelpful(input?.helpful);
  if (!helpful) {
    return { ok: false, error: 'Elige Sí, No o Aún no sé.' };
  }

  const slug =
    feedbackProductSlug(input.productSlug || '') ||
    feedbackProductSlug(input.productName || '');
  if (!slug) {
    return { ok: false, error: 'Producto sin nombre válido.' };
  }

  const feedback = {
    productSlug: slug,
    helpful,
    note: clampFeedbackNote(input.note),
    updatedAt: new Date().toISOString(),
  };

  const key = feedbackStorageKey(slug);
  try {
    localStorage.setItem(key, JSON.stringify(feedback));
    return { ok: true, feedback };
  } catch {
    return { ok: false, error: 'No se pudo guardar el feedback en este navegador.' };
  }
}

export function helpfulLabel(helpful) {
  if (helpful === FEEDBACK_HELPFUL.YES) return 'Sí';
  if (helpful === FEEDBACK_HELPFUL.NO) return 'No';
  if (helpful === FEEDBACK_HELPFUL.UNSURE) return 'Aún no sé';
  return '';
}
