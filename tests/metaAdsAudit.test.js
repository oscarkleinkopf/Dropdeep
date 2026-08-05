import { describe, expect, it } from 'vitest';
import {
  calculateCpaMax,
  evaluateMetaAdsAudit,
  rateAtc,
  rateCpc,
  rateCpm,
  rateCtr,
} from '../src/research/metaAdsAudit.js';

describe('calculateCpaMax', () => {
  it('subtracts AliExpress VAT, payment, Shopify and sales VAT from sale', () => {
    const result = calculateCpaMax({
      salePrice: 50_000,
      productCost: 10_000,
      aliexpressVatRate: 0.19,
      paymentFeeRate: 0.035,
      shopifyFeeRate: 0.02,
      salesVatRate: 0.19,
    });
    // costWithVat = 11900; fees = 1750+1000+9500 = 12250; margin = 50000-11900-12250 = 25850
    expect(result.costWithVat).toBe(11900);
    expect(result.cpaMax).toBe(25850);
    expect(result.marginFinal).toBe(25850);
  });

  it('returns zero CPA max when margin is negative', () => {
    const result = calculateCpaMax({
      salePrice: 20_000,
      productCost: 18_000,
      aliexpressVatRate: 0.19,
      paymentFeeRate: 0.035,
      shopifyFeeRate: 0.02,
      salesVatRate: 0.19,
    });
    expect(result.marginFinal).toBeLessThan(0);
    expect(result.cpaMax).toBe(0);
  });
});

describe('metric thresholds', () => {
  it('rates CTR bands', () => {
    expect(rateCtr(1.5).level).toBe('bad');
    expect(rateCtr(3.5).level).toBe('good');
    expect(rateCtr(7).level).toBe('excellent');
  });

  it('rates CPC against Chile ceilings', () => {
    expect(rateCpc(150).level).toBe('excellent');
    expect(rateCpc(250).level).toBe('ok');
    expect(rateCpc(350).level).toBe('bad');
  });

  it('tolerates ATC as fraction of CPA max', () => {
    const normal = rateAtc(2000, 10_000);
    expect(normal.level).toBe('good');
    const tolerated = rateAtc(2500, 10_000); // 1/4 of CPA max, outside 1k-3k? 2500 is in normal
    expect(tolerated.level).toBe('good');
    const viaFraction = rateAtc(4000, 15_000); // 4000 is between 3000-5000 (1/5-1/3 of 15000)
    expect(viaFraction.toleratedByCpa).toBe(true);
    expect(viaFraction.level).toBe('ok');
  });

  it('accepts competitive CPM when flagged', () => {
    expect(rateCpm(12000, { competitiveNiche: true }).level).toBe('ok');
    expect(rateCpm(12000, { competitiveNiche: false }).level).toBe('warn');
    expect(rateCpm(20000).level).toBe('bad');
  });
});

describe('evaluateMetaAdsAudit', () => {
  it('flags losing money when campaign CPA exceeds CPA max', () => {
    const result = evaluateMetaAdsAudit({
      salePriceClp: 50_000,
      productCostClp: 10_000,
      campaignCpaClp: 40_000,
      ctrPercent: 3.2,
      cpcClp: 160,
      atcClp: 2000,
      cpmClp: 4500,
    });
    expect(result.losingMoney).toBe(true);
    expect(result.verdicts.some((v) => /perdiendo plata/i.test(v.message))).toBe(true);
  });

  it('passes healthy Chile metrics without loss', () => {
    const result = evaluateMetaAdsAudit({
      salePriceClp: 50_000,
      productCostClp: 10_000,
      campaignCpaClp: 8_000,
      ctrPercent: 3.5,
      cpcClp: 150,
      atcClp: 1800,
      cpmClp: 4000,
    });
    expect(result.losingMoney).toBe(false);
    expect(result.economics.cpaMax).toBeGreaterThan(8_000);
    expect(result.metrics.ctr.level).toBe('good');
    expect(result.metrics.cpc.level).toBe('excellent');
  });
});
