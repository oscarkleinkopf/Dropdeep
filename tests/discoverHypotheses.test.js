import { describe, it, expect } from 'vitest';
import { CHILE_SEASONS, getSeasonsForDate } from '../src/data/chileSeasonCalendar.js';
import {
  stripAccents,
  aliexpressSearchUrl,
  googleTrendsClUrl,
  mercadoLibreClSearchUrl,
  suggestAeQueries,
  suggestQueriesFromNiche,
  DISCOVER_EXAMPLES,
} from '../src/discovery/suggestAeQueries.js';

describe('getSeasonsForDate', () => {
  it('marks Fiestas Patrias + invierno in mid-August', () => {
    const { active, upcoming } = getSeasonsForDate(new Date(2026, 7, 17));
    const ids = active.map((s) => s.id);
    expect(ids).toContain('patrias');
    expect(ids).toContain('invierno');
    expect(upcoming.some((s) => s.id === 'navidad')).toBe(false);
  });

  it('marks verano in January', () => {
    const { active } = getSeasonsForDate(new Date(2026, 0, 15));
    expect(active.map((s) => s.id)).toEqual(['verano']);
  });

  it('surfaces upcoming seasons within two months', () => {
    const { upcoming } = getSeasonsForDate(new Date(2026, 6, 1)); // July
    expect(upcoming.map((s) => s.id)).toContain('patrias');
  });

  it('covers every month with at least one season', () => {
    for (let month = 1; month <= 12; month += 1) {
      const { active } = getSeasonsForDate(new Date(2026, month - 1, 10));
      expect(active.length, `month ${month}`).toBeGreaterThan(0);
    }
  });

  it('every season has hook, emoji and buyer pain', () => {
    for (const season of CHILE_SEASONS) {
      expect(season.emoji).toBeTruthy();
      expect(season.hook.length).toBeGreaterThan(12);
      expect(season.niches.length).toBeGreaterThan(0);
      for (const niche of season.niches) {
        expect(niche.queries.length).toBeGreaterThan(0);
        expect(niche.pain.length).toBeGreaterThan(8);
      }
    }
  });

  it('labels August as agosto', () => {
    const { monthLabel } = getSeasonsForDate(new Date(2026, 7, 17));
    expect(monthLabel).toBe('agosto');
  });
});

describe('suggestAeQueries', () => {
  it('rejects short input', () => {
    expect(suggestAeQueries('ab').ok).toBe(false);
    expect(suggestAeQueries('').ok).toBe(false);
  });

  it('maps lumbar pain to AE-style English queries', () => {
    const r = suggestAeQueries('dolor lumbar en la oficina');
    expect(r.ok).toBe(true);
    const qs = r.queries.map((x) => x.query);
    expect(qs.some((q) => /lumbar/i.test(q))).toBe(true);
    expect(r.disclaimer).toMatch(/búsquedas/i);
    expect(r.queries[0].aeUrl).toContain('aliexpress.com/wholesale');
    expect(r.queries[0].trendsUrl).toContain('geo=CL');
    expect(r.queries[0].mlUrl).toContain('mercadolibre.cl');
  });

  it('keeps the original phrase as a query', () => {
    const r = suggestAeQueries('organizador de cables magnetico');
    expect(r.ok).toBe(true);
    expect(r.queries.some((x) => /organizador de cables/i.test(x.query))).toBe(true);
  });

  it('maps Fiestas Patrias / asado', () => {
    const r = suggestAeQueries('asado para el 18');
    expect(r.ok).toBe(true);
    expect(r.queries.some((x) => /grill|tumbler|thermometer/i.test(x.query))).toBe(true);
  });
});

describe('suggestQueriesFromNiche', () => {
  it('builds links from calendar niche', () => {
    const r = suggestQueriesFromNiche({
      name: 'UV',
      queries: ['portable neck fan', 'uv visor'],
    });
    expect(r.ok).toBe(true);
    expect(r.source).toBe('calendario-chile');
    expect(r.queries).toHaveLength(2);
    expect(r.disclaimer).toMatch(/temporada/i);
  });
});

describe('DISCOVER_EXAMPLES', () => {
  it('each chip input produces queries', () => {
    expect(DISCOVER_EXAMPLES.length).toBeGreaterThanOrEqual(4);
    for (const ex of DISCOVER_EXAMPLES) {
      const r = suggestAeQueries(ex.input);
      expect(r.ok, ex.label).toBe(true);
      expect(r.queries.length).toBeGreaterThan(0);
    }
  });
});

describe('search URL helpers', () => {
  it('encodes query params', () => {
    const q = 'neck fan';
    expect(aliexpressSearchUrl(q)).toContain('SearchText=neck%20fan');
    expect(googleTrendsClUrl(q)).toContain('q=neck%20fan');
    expect(mercadoLibreClSearchUrl(q)).toContain('as_word=neck%20fan');
  });

  it('strips accents', () => {
    expect(stripAccents('Dolor Lumbar')).toBe('dolor lumbar');
  });
});
