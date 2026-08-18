import { describe, it, expect } from 'vitest';
import {
  mergeEnrichment,
  parseEnrichmentJson,
  enrichSourceLabel,
  buildEnrichPrompt,
} from '../src/discovery/enrichAliExpress.js';

describe('mergeEnrichment', () => {
  it('fills empty fields and keeps existing', () => {
    const merged = mergeEnrichment(
      { title: 'Ya tengo', costUsd: null, imageUrl: null, sources: { title: 'url-hint' } },
      {
        title: 'Otro',
        costUsd: 8.5,
        imageUrl: 'https://ae01.alicdn.com/kf/x.jpg',
        source: 'og-meta',
        verified: false,
      },
    );
    expect(merged.title).toBe('Ya tengo');
    expect(merged.sources.title).toBe('url-hint');
    expect(merged.costUsd).toBe(8.5);
    expect(merged.sources.cost).toBe('og-meta');
    expect(merged.imageUrl).toContain('alicdn.com');
  });

  it('rejects unsafe image hosts', () => {
    const merged = mergeEnrichment(
      { title: null, costUsd: null, imageUrl: null, sources: {} },
      {
        title: 'X',
        costUsd: null,
        imageUrl: 'https://evil.example/a.jpg',
        source: 'gemini-inferred',
        verified: false,
      },
    );
    expect(merged.title).toBe('X');
    expect(merged.imageUrl).toBeNull();
  });
});

describe('parseEnrichmentJson', () => {
  it('parses fenced JSON', () => {
    const r = parseEnrichmentJson(`\`\`\`json
{"title":"Led Flashlight","costUsd":6.5,"imageUrl":"https://ae01.alicdn.com/kf/a.jpg"}
\`\`\``);
    expect(r.title).toMatch(/Flashlight/i);
    expect(r.costUsd).toBe(6.5);
    expect(r.source).toBe('gemini-inferred');
    expect(r.verified).toBe(false);
  });

  it('returns null on garbage', () => {
    expect(parseEnrichmentJson('not json')).toBeNull();
  });
});

describe('enrich helpers', () => {
  it('labels sources honestly', () => {
    expect(enrichSourceLabel('og-meta')).toMatch(/no verificado/i);
    expect(enrichSourceLabel('gemini-inferred')).toMatch(/Inferido/i);
    expect(enrichSourceLabel('affiliate')).toMatch(/Affiliate · vivo/);
  });

  it('builds prompt with URL', () => {
    const p = buildEnrichPrompt('https://www.aliexpress.com/item/1.html', '1');
    expect(p).toContain('aliexpress.com/item/1.html');
    expect(p).toMatch(/Affiliate/i);
  });
});
