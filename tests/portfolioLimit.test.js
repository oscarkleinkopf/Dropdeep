/**
 * T18 — modal límite portafolio (orden + helpers).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FREE_PORTFOLIO_CAP, isPortfolioAtCap } from '../src/config/freeTier.js';

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

describe('getPortfolioItemsOldestFirst (T18)', () => {
  it('ordena por _remoteUpdatedAt ascendente', async () => {
    const { getPortfolioItemsOldestFirst } = await import('../src/ui/portfolio.js');
    const items = [
      { id: 'b', name: 'B', _remoteUpdatedAt: '2026-06-01T00:00:00.000Z' },
      { id: 'a', name: 'A', _remoteUpdatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'c', name: 'C', _remoteUpdatedAt: '2026-08-01T00:00:00.000Z' },
    ];
    expect(getPortfolioItemsOldestFirst(items).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('sin fechas usa índice de inserción', async () => {
    const { getPortfolioItemsOldestFirst } = await import('../src/ui/portfolio.js');
    const items = [
      { id: 'first', name: 'First' },
      { id: 'second', name: 'Second' },
    ];
    expect(getPortfolioItemsOldestFirst(items).map((i) => i.id)).toEqual(['first', 'second']);
  });
});

describe('isPortfolioAtCap', () => {
  it('tope en FREE_PORTFOLIO_CAP', () => {
    expect(FREE_PORTFOLIO_CAP).toBe(10);
    expect(isPortfolioAtCap(9)).toBe(false);
    expect(isPortfolioAtCap(10)).toBe(true);
    expect(isPortfolioAtCap(11)).toBe(true);
  });
});
