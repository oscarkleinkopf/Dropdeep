/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testGeminiConnection } from '../src/research/testGeminiConnection.js';

describe('testGeminiConnection', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects empty key without calling the API', async () => {
    const result = await testGeminiConnection('  ');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns ok badge payload on HTTP 200', async () => {
    fetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ name: 'models/gemini-2.0-flash' }),
    });
    const result = await testGeminiConnection('AIzaSyTestKey123', 'gemini-2.0-flash');
    expect(result).toEqual({ ok: true, status: 200, message: 'Conexión válida' });
    expect(fetch).toHaveBeenCalledOnce();
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('generativelanguage.googleapis.com');
    expect(url).toContain('gemini-2.0-flash');
    expect(url).toContain('AIzaSyTestKey123');
  });

  it('surfaces Google error message on invalid key', async () => {
    fetch.mockResolvedValueOnce({
      status: 400,
      json: async () => ({
        error: { message: 'API key not valid. Please pass a valid API key.' },
      }),
    });
    const result = await testGeminiConnection('bad-key');
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.message).toContain('API key not valid');
  });
});
