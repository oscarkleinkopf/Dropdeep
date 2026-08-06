import { describe, it, expect } from 'vitest';
import { prefilterAliExpressCandidate } from '../src/discovery/audisioPrefilter.js';

describe('prefilterAliExpressCandidate', () => {
  it('asks for cost when missing', () => {
    const r = prefilterAliExpressCandidate({});
    expect(r.ready).toBe(false);
    expect(r.rankHint).toBe('unknown');
  });

  it('flags healthy cost×2.5 in band', () => {
    // cost 25 → retail 62.5 → ~59k CLP at FX 950 — in 40k–100k band, gross > 15
    const r = prefilterAliExpressCandidate({ costUsd: 25, fxClpPerUsd: 950 });
    expect(r.ready).toBe(true);
    expect(r.rankHint).toBe('ok');
    expect(r.pricing.suggestedRetailUsd).toBe(62.5);
  });

  it('rejects tiny cost that breaks gross margin / floor', () => {
    const r = prefilterAliExpressCandidate({ costUsd: 2, fxClpPerUsd: 950 });
    expect(r.ready).toBe(true);
    expect(r.rankHint).toBe('reject');
  });
});
