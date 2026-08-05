import { describe, expect, it } from 'vitest';
import {
  VERDICT_DISCARD,
  VERDICT_LAUNCH,
  VERDICT_VALIDATE,
  computeManualEvaluation,
  evaluateWinnerGates,
  getDefaultRubricInputs,
  normalizeRubricInputs,
} from '../src/research/manualRubric.js';

function highScoreInputs(overrides = {}) {
  return {
    ...getDefaultRubricInputs(),
    margin: 90,
    shippingSize: 80,
    saturation: 80,
    suppliers: 100,
    seasonality: 100,
    adPolicy: 100,
    ugcPotential: 80,
    ticketAov: 80,
    returnsFragility: 80,
    solvesPain: 1,
    emotionalHook: 0,
    wowFactor: 0,
    grossMarginUsd: 20,
    projectedCpaUsd: 6,
    productTicketUsd: 49,
    ...overrides,
  };
}

describe('normalizeRubricInputs', () => {
  it('maps legacy problemWow into Winner pillars', () => {
    const n = normalizeRubricInputs({ problemWow: 90 });
    expect(n.solvesPain).toBe(1);
    expect(n.wowFactor).toBe(1);
  });
});

describe('evaluateWinnerGates', () => {
  it('blocks when zero Winner pillars are checked', () => {
    const gates = evaluateWinnerGates({
      solvesPain: 0,
      emotionalHook: 0,
      wowFactor: 0,
      shippingSize: 80,
      grossMarginUsd: 20,
      projectedCpaUsd: 6,
    });
    expect(gates.passed).toBe(false);
    expect(gates.blockers.some((b) => b.code === 'pillars')).toBe(true);
  });

  it('blocks shippingSize below shoe-box threshold', () => {
    const gates = evaluateWinnerGates({
      solvesPain: 1,
      shippingSize: 40,
      grossMarginUsd: 20,
      projectedCpaUsd: 6,
    });
    expect(gates.blockers.some((b) => b.code === 'shipping_size')).toBe(true);
  });

  it('blocks gross margin at or below $15', () => {
    const gates = evaluateWinnerGates({
      solvesPain: 1,
      shippingSize: 80,
      grossMarginUsd: 15,
      projectedCpaUsd: 6,
    });
    expect(gates.blockers.some((b) => b.code === 'gross_margin')).toBe(true);
  });

  it('allows CPA stretch to $20 only for ~$100 tickets', () => {
    const cheap = evaluateWinnerGates({
      solvesPain: 1,
      shippingSize: 80,
      grossMarginUsd: 20,
      projectedCpaUsd: 18,
      productTicketUsd: 40,
    });
    expect(cheap.blockers.some((b) => b.code === 'cpa_high')).toBe(true);

    const premium = evaluateWinnerGates({
      solvesPain: 1,
      shippingSize: 80,
      grossMarginUsd: 20,
      projectedCpaUsd: 18,
      productTicketUsd: 100,
    });
    expect(premium.passed).toBe(true);
  });
});

describe('computeManualEvaluation', () => {
  it('returns Lanzar when score is high and gates pass', () => {
    const result = computeManualEvaluation(highScoreInputs());
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.verdict).toBe(VERDICT_LAUNCH);
    expect(result.winnerGates.passed).toBe(true);
  });

  it('downgrades Lanzar to Validar más when a gate fails', () => {
    const result = computeManualEvaluation(
      highScoreInputs({ solvesPain: 0, emotionalHook: 0, wowFactor: 0 })
    );
    expect(result.scoreVerdict).toBe(VERDICT_LAUNCH);
    expect(result.verdict).toBe(VERDICT_VALIDATE);
    expect(result.explanation).toMatch(/gate/i);
  });

  it('returns Descartar for very low scores', () => {
    const result = computeManualEvaluation({
      ...getDefaultRubricInputs(),
      margin: 0,
      shippingSize: 0,
      saturation: 0,
      suppliers: 0,
      seasonality: 0,
      adPolicy: 0,
      ugcPotential: 0,
      ticketAov: 0,
      returnsFragility: 0,
      solvesPain: 0,
      emotionalHook: 0,
      wowFactor: 0,
    });
    expect(result.score).toBeLessThan(45);
    expect(result.verdict).toBe(VERDICT_DISCARD);
  });

  it('keeps criteria snapshot including gate fields', () => {
    const result = computeManualEvaluation(highScoreInputs({ projectedCpaUsd: 6.5 }));
    expect(result.criteria.projectedCpaUsd).toBe(6.5);
    expect(result.criteria.solvesPain).toBe(1);
  });
});
