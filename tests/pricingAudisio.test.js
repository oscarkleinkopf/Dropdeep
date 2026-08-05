import { describe, expect, it } from 'vitest';
import {
  AUDISIO_COST_TO_RETAIL_MULTIPLIER,
  AUDISIO_GROSS_MARGIN_MIN_USD,
  AUDISIO_PVP_FLOOR_CLP,
  AUDISIO_PVP_RECOMMENDED_MAX_CLP,
  AUDISIO_PVP_RECOMMENDED_MIN_CLP,
  AUDISIO_TEST_AD_BUDGET_USD,
} from '../src/config/audisioRules.js';
import {
  checkPriceBandClp,
  evaluateAudisioPricing,
  suggestRetailFromCost,
  usdToClp,
} from '../src/research/pricingAudisio.js';

describe('Audisio financial rules (T38/T44)', () => {
  it('suggests retail with ×2.5 multiplier', () => {
    expect(suggestRetailFromCost(10)).toBe(25);
    expect(suggestRetailFromCost(10)).toBe(10 * AUDISIO_COST_TO_RETAIL_MULTIPLIER);
  });

  it('converts USD to CLP with editable FX', () => {
    expect(usdToClp(25, 950)).toBe(23750);
  });

  it('flags PVP below absolute floor 20_000 CLP', () => {
    const band = checkPriceBandClp(15_000);
    expect(band.belowFloor).toBe(true);
    expect(band.meetsFloor).toBe(false);
    expect(AUDISIO_PVP_FLOOR_CLP).toBe(20_000);
  });

  it('recognizes recommended CLP band 40k–100k', () => {
    expect(checkPriceBandClp(50_000).inRecommendedBand).toBe(true);
    expect(AUDISIO_PVP_RECOMMENDED_MIN_CLP).toBe(40_000);
    expect(AUDISIO_PVP_RECOMMENDED_MAX_CLP).toBe(100_000);
  });

  it('requires gross margin strictly above $15', () => {
    const exact = evaluateAudisioPricing({ costUsd: 10, retailUsd: 25, fxClpPerUsd: 950 });
    expect(exact.grossMarginUsd).toBe(15);
    expect(exact.meetsGrossMin).toBe(false);
    expect(exact.flags.some((f) => f.code === 'gross_margin')).toBe(true);

    const above = evaluateAudisioPricing({ costUsd: 10, retailUsd: 26, fxClpPerUsd: 950 });
    expect(above.grossMarginUsd).toBeGreaterThan(AUDISIO_GROSS_MARGIN_MIN_USD);
    expect(above.meetsGrossMin).toBe(true);
  });

  it('emits floor_clp error when retail CLP is under 20k', () => {
    // 15 USD * 950 = 14_250 CLP
    const result = evaluateAudisioPricing({ costUsd: 8, retailUsd: 15, fxClpPerUsd: 950 });
    expect(result.retailClp).toBeLessThan(AUDISIO_PVP_FLOOR_CLP);
    expect(result.flags.some((f) => f.code === 'floor_clp')).toBe(true);
  });

  it('includes $300 test budget info flag', () => {
    const result = evaluateAudisioPricing({ costUsd: 10, retailUsd: 40, fxClpPerUsd: 950 });
    expect(result.testBudgetUsd).toBe(AUDISIO_TEST_AD_BUDGET_USD);
    expect(result.flags.some((f) => f.code === 'test_budget')).toBe(true);
  });

  it('suggests retail from cost in evaluation payload', () => {
    const result = evaluateAudisioPricing({ costUsd: 12, retailUsd: 20, fxClpPerUsd: 1000 });
    expect(result.suggestedRetailUsd).toBe(30);
    expect(result.suggestedRetailClp).toBe(30_000);
  });
});
