/**
 * T19 — sync borrado remoto + tombstones anti-resurrección.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('productSlugFromName', () => {
  it('normaliza nombres al slug de research_reports', async () => {
    const { productSlugFromName } = await import('../src/research/historySync.js');
    expect(productSlugFromName('Botella Térmica!')).toBe('botella-trmica');
    expect(productSlugFromName('  Foo  Bar  ')).toBe('foo-bar');
  });
});

describe('mergePortfolioItems + tombstones (T19)', () => {
  it('excluye slugs borrados para que el remoto no reaparezca', async () => {
    const {
      mergePortfolioItems,
      markPortfolioSlugDeletedLocally,
      readDeletedPortfolioSlugs,
      clearPortfolioSlugDeletedMark,
    } = await import('../src/research/historySync.js');

    const local = [{ name: 'Keep Me', id: 'keep-me' }];
    const remote = [
      { name: 'Keep Me', id: 'keep-me', _remoteUpdatedAt: '2026-08-01T00:00:00.000Z' },
      { name: 'Deleted Prod', id: 'deleted-prod', _remoteUpdatedAt: '2026-08-02T00:00:00.000Z' },
    ];

    markPortfolioSlugDeletedLocally('Deleted Prod');
    expect(readDeletedPortfolioSlugs()).toContain('deleted-prod');

    const merged = mergePortfolioItems(local, remote);
    expect(merged.map((i) => i.name)).toEqual(['Keep Me']);
    expect(merged.some((i) => i.name === 'Deleted Prod')).toBe(false);

    clearPortfolioSlugDeletedMark('Deleted Prod');
    const afterClear = mergePortfolioItems(local, remote);
    expect(afterClear.some((i) => i.name === 'Deleted Prod')).toBe(true);
  });

  it('remote más nuevo gana en conflicto', async () => {
    const { mergePortfolioItems } = await import('../src/research/historySync.js');
    const local = [
      {
        name: 'Same',
        notes: 'local',
        _remoteUpdatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    const remote = [
      {
        name: 'Same',
        notes: 'remote',
        _remoteUpdatedAt: '2026-06-01T00:00:00.000Z',
      },
    ];
    const merged = mergePortfolioItems(local, remote, []);
    expect(merged).toHaveLength(1);
    expect(merged[0].notes).toBe('remote');
  });
});

describe('getPortfolioSyncStatus (T19)', () => {
  it('marca Solo local sin sesión o sin stamp remoto', async () => {
    const { getPortfolioSyncStatus } = await import('../src/research/historySync.js');
    expect(getPortfolioSyncStatus({ name: 'X' }).label).toBe('Solo local');
    expect(
      getPortfolioSyncStatus({ name: 'X', _remoteUpdatedAt: '2026-08-01T00:00:00.000Z' }).label,
    ).toBe('Solo local');
  });
});

describe('deletePortfolioItemEverywhere sin sesión', () => {
  it('borra localmente sin error y no deja tombstone', async () => {
    const {
      deletePortfolioItemEverywhere,
      readDeletedPortfolioSlugs,
    } = await import('../src/research/historySync.js');

    const result = await deletePortfolioItemEverywhere('Algo');
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(readDeletedPortfolioSlugs()).toHaveLength(0);
  });
});
