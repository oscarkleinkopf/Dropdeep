import { describe, expect, it } from 'vitest';
import {
  SPY_INFERRED_BANNER,
  SPY_UNVERIFIED_LABEL,
  describeSpyTechSignals,
} from '../src/research/spyHonest.js';

describe('describeSpyTechSignals (T11)', () => {
  it('never surfaces Gemini pixel/GA booleans as verified Sí/No', () => {
    const tech = describeSpyTechSignals({
      cms: 'Shopify',
      theme: 'Dawn',
      appsDetected: ['Klaviyo', 'Loox'],
      pixelDetected: true,
      tiktokPixel: false,
      googleAnalytics4: true,
    });
    expect(tech.cms).toBe('Shopify');
    expect(tech.appsDetected).toEqual(['Klaviyo', 'Loox']);
    expect(tech.metaPixel).toBe(SPY_UNVERIFIED_LABEL);
    expect(tech.tiktokPixel).toBe(SPY_UNVERIFIED_LABEL);
    expect(tech.googleAnalytics4).toBe(SPY_UNVERIFIED_LABEL);
    expect(tech.metaPixel).not.toMatch(/Sí|No$/);
    expect(tech.disclaimer).toMatch(/No verificado/i);
  });

  it('falls back CMS/theme to No verificado when missing', () => {
    const tech = describeSpyTechSignals({});
    expect(tech.cms).toBe(SPY_UNVERIFIED_LABEL);
    expect(tech.theme).toBe(SPY_UNVERIFIED_LABEL);
    expect(tech.appsDetected).toEqual([]);
  });

  it('exposes honest inferred banner copy', () => {
    expect(SPY_INFERRED_BANNER).toMatch(/inferido por IA/i);
    expect(SPY_INFERRED_BANNER).toMatch(/no sustituye visitar/i);
  });
});
