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
  vi.stubGlobal('crypto', {
    randomUUID: () => '11111111-1111-4111-8111-111111111111',
  });
  vi.resetModules();
});

describe('analytics (T55)', () => {
  it('sanitizes props and blocks PII-ish values', async () => {
    const { sanitizeAnalyticsProps, ANALYTICS_EVENTS } = await import('../src/utils/analytics.js');
    expect(ANALYTICS_EVENTS.VIEW_DISCOVER).toBe('view_discover');
    expect(
      sanitizeAnalyticsProps({
        path: 'copilot',
        ok: true,
        n: 3,
        email: 'a@b.com',
        url: 'https://evil.example',
        key: 'AIza123',
        'bad key': 'x',
      }),
    ).toEqual({ path: 'copilot', ok: true, n: 3 });
  });

  it('rejects unknown events and returns false without supabase', async () => {
    const { trackEvent } = await import('../src/utils/analytics.js');
    expect(await trackEvent('not_allowed')).toBe(false);
    expect(await trackEvent('view_discover')).toBe(false);
  });

  it('persists analytics session id', async () => {
    const { getAnalyticsSessionId } = await import('../src/utils/analytics.js');
    expect(getAnalyticsSessionId()).toBe('11111111-1111-4111-8111-111111111111');
    expect(getAnalyticsSessionId()).toBe('11111111-1111-4111-8111-111111111111');
  });
});
