/**
 * T35 — feedback dogfooding local por reporte.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => {
      memory.set(key, String(value));
    },
    removeItem: (key) => {
      memory.delete(key);
    },
  });
  vi.resetModules();
});

describe('feedbackStorage (T35)', () => {
  it('guarda y restaura feedback por slug', async () => {
    const {
      saveReportFeedback,
      getReportFeedback,
      hasReportFeedback,
      feedbackStorageKey,
      FEEDBACK_NOTE_MAX,
    } = await import('../src/utils/feedbackStorage.js');

    expect(feedbackStorageKey('Botella Térmica')).toMatch(/^dropdeep_report_feedback_/);

    const saved = saveReportFeedback({
      productName: 'Botella Térmica',
      helpful: 'yes',
      note: 'Me ayudó a descartar saturación',
    });
    expect(saved.ok).toBe(true);
    expect(saved.feedback.helpful).toBe('yes');
    expect(saved.feedback.productSlug).toBeTruthy();

    const loaded = getReportFeedback('Botella Térmica');
    expect(loaded.helpful).toBe('yes');
    expect(loaded.note).toContain('saturación');
    expect(hasReportFeedback('Botella Térmica')).toBe(true);
    expect(FEEDBACK_NOTE_MAX).toBe(280);
  });

  it('rechaza helpful inválido y recorta nota', async () => {
    const { saveReportFeedback, clampFeedbackNote, FEEDBACK_NOTE_MAX } = await import(
      '../src/utils/feedbackStorage.js'
    );
    expect(saveReportFeedback({ productName: 'X', helpful: 'maybe' }).ok).toBe(false);
    const long = 'a'.repeat(FEEDBACK_NOTE_MAX + 40);
    expect(clampFeedbackNote(long)).toHaveLength(FEEDBACK_NOTE_MAX);

    const ok = saveReportFeedback({
      productName: 'X',
      helpful: 'unsure',
      note: long,
    });
    expect(ok.ok).toBe(true);
    expect(ok.feedback.note).toHaveLength(FEEDBACK_NOTE_MAX);
  });

  it('persiste tras “reload” (mismo localStorage)', async () => {
    const mod1 = await import('../src/utils/feedbackStorage.js');
    mod1.saveReportFeedback({ productName: 'Rodillo', helpful: 'no', note: 'Faltó CPA' });
    vi.resetModules();
    const mod2 = await import('../src/utils/feedbackStorage.js');
    expect(mod2.getReportFeedback('Rodillo')?.helpful).toBe('no');
  });
});
