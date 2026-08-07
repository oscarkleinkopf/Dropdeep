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

describe('feedbackCloud (T54)', () => {
  it('opt-in flag defaults off and persists', async () => {
    const { isFeedbackCloudOptIn, setFeedbackCloudOptIn } = await import(
      '../src/utils/feedbackCloud.js'
    );
    expect(isFeedbackCloudOptIn()).toBe(false);
    setFeedbackCloudOptIn(true);
    expect(isFeedbackCloudOptIn()).toBe(true);
    setFeedbackCloudOptIn(false);
    expect(isFeedbackCloudOptIn()).toBe(false);
  });

  it('skips sync when opt-in off', async () => {
    const { syncReportFeedbackToCloud } = await import('../src/utils/feedbackCloud.js');
    const res = await syncReportFeedbackToCloud({
      productSlug: 'botella',
      helpful: 'yes',
      note: 'ok',
    });
    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
  });

  it('skips sync when opt-in on but not authenticated', async () => {
    vi.doMock('../src/auth/supabaseClient.js', () => ({
      supabase: {},
      isAuthConfigured: true,
    }));
    vi.doMock('../src/auth/auth.js', () => ({
      isAuthenticated: () => false,
      getCurrentUserId: () => null,
    }));
    const { setFeedbackCloudOptIn, syncReportFeedbackToCloud } = await import(
      '../src/utils/feedbackCloud.js'
    );
    setFeedbackCloudOptIn(true);
    const res = await syncReportFeedbackToCloud({
      productSlug: 'botella',
      helpful: 'no',
    });
    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
  });
});
