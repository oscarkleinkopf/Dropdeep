/**
 * T07 — recuperación de error en el copiloto (sin avanzar paso; pasos previos intactos).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCopilotStepJsonExample, COPILOT_STEPS } from '../src/research/reportSchema.js';

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
  // Modo completo = 5 pasos (necesario para probar recuperación entre pasos)
  memory.set('dropdeep_research_mode', 'complete');
  vi.resetModules();
});

describe('T07 copiloto — helpers de recuperación', () => {
  it('getCompletedCopilotSteps lista solo pasos ya confirmados', async () => {
    const {
      startCopilotSession,
      processCopilotPaste,
      getCompletedCopilotSteps,
      canPeekPreviousCopilotStep,
      peekCompletedCopilotStep,
      getCopilotSession,
    } = await import('../src/research/copilotFlow.js');

    startCopilotSession('Botella térmica');
    expect(canPeekPreviousCopilotStep()).toBe(false);
    expect(getCompletedCopilotSteps()).toHaveLength(0);
    expect(peekCompletedCopilotStep(0)).toBeNull();

    const base = getCopilotStepJsonExample(COPILOT_STEPS.BASE_REPORT);
    const ok = processCopilotPaste(base);
    expect(ok.ok).toBe(true);
    expect(ok.done).toBe(false);
    expect(getCopilotSession().currentStepIndex).toBe(1);

    const completed = getCompletedCopilotSteps();
    expect(completed).toHaveLength(1);
    expect(completed[0].index).toBe(0);
    expect(completed[0].stepId).toBe(COPILOT_STEPS.BASE_REPORT);
    expect(canPeekPreviousCopilotStep()).toBe(true);

    const peeked = peekCompletedCopilotStep(0);
    expect(peeked).not.toBeNull();
    expect(peeked.readOnly).toBe(true);
    expect(peeked.index).toBe(0);
    expect(peeked.prompt.length).toBeGreaterThan(20);

    expect(peekCompletedCopilotStep(1)).toBeNull();
  });
});

describe('T07 copiloto — processCopilotPaste no avanza en error', () => {
  it('JSON inválido mantiene currentStepIndex y partialReport previos', async () => {
    const {
      startCopilotSession,
      processCopilotPaste,
      getCopilotSession,
      getCompletedCopilotSteps,
    } = await import('../src/research/copilotFlow.js');

    startCopilotSession('Botella térmica');
    const base = getCopilotStepJsonExample(COPILOT_STEPS.BASE_REPORT);
    expect(processCopilotPaste(base).ok).toBe(true);

    const before = getCopilotSession();
    expect(before.currentStepIndex).toBe(1);
    const nameBefore = before.partialReport.name || before.partialReport.product?.name;

    const fail = processCopilotPaste('{');
    expect(fail.ok).toBe(false);
    expect(fail.currentStepIndex).toBe(1);
    expect(fail.error).toMatch(/truncado|JSON|Reintentar/i);

    const after = getCopilotSession();
    expect(after.currentStepIndex).toBe(1);
    expect(after.partialReport.name || after.partialReport.product?.name).toEqual(nameBefore);
    expect(getCompletedCopilotSteps()).toHaveLength(1);
  });

  it('payload válido del paso actual sí avanza el índice', async () => {
    const {
      startCopilotSession,
      processCopilotPaste,
      getCopilotSession,
    } = await import('../src/research/copilotFlow.js');

    startCopilotSession('Botella térmica');
    expect(getCopilotSession().currentStepIndex).toBe(0);

    const result = processCopilotPaste(getCopilotStepJsonExample(COPILOT_STEPS.BASE_REPORT));
    expect(result.ok).toBe(true);
    expect(getCopilotSession().currentStepIndex).toBe(1);
  });
});
