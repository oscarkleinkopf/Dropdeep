/**
 * T21/T29 — privacy copy helpers + Product Score tooltip weights.
 */
import { describe, expect, it } from 'vitest';
import {
  PRODUCT_SCORE_WEIGHTS,
  getProductScoreTooltip,
  calculateProductScore,
} from '../src/research/scoring.js';

describe('PRODUCT_SCORE_WEIGHTS / tooltip (T29)', () => {
  it('pesos suman 1 y tooltip menciona fórmula en español', () => {
    const sum =
      PRODUCT_SCORE_WEIGHTS.margin +
      PRODUCT_SCORE_WEIGHTS.saturation +
      PRODUCT_SCORE_WEIGHTS.trend +
      PRODUCT_SCORE_WEIGHTS.shipping +
      PRODUCT_SCORE_WEIGHTS.roi;
    expect(sum).toBeCloseTo(1, 5);

    const tip = getProductScoreTooltip();
    expect(tip).toMatch(/margen 25%/i);
    expect(tip).toMatch(/saturación 20%/i);
    expect(tip).toMatch(/tendencia 20%/i);
    expect(tip).toMatch(/envío 15%/i);
    expect(tip).toMatch(/ROI 20%/i);
    expect(tip).toMatch(/evaluación manual/i);
  });

  it('calculateProductScore usa esos pesos', () => {
    const score = calculateProductScore({
      margin: 40,
      saturation: 0,
      trend: '+150%',
      shipping: 5,
      roi: 300,
    });
    expect(score).toBe(100);
  });
});
