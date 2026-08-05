/**
 * T20 — proxy abuse helpers + error classification.
 */
import { describe, expect, it } from 'vitest';
import {
  PROXY_MAX_CONTENTS_CHARS,
  PROXY_RATE_LIMIT_MAX,
  PROXY_RATE_LIMIT_WINDOW_SEC,
  estimateContentsChars,
  isProxyContentsTooLarge,
} from '../src/config/proxyAbuse.js';
import { classifyGeminiError } from '../src/research/errors.js';

describe('proxyAbuse constants (T20)', () => {
  it('define ventana 10 req / 10s y payload máximo', () => {
    expect(PROXY_RATE_LIMIT_MAX).toBe(10);
    expect(PROXY_RATE_LIMIT_WINDOW_SEC).toBe(10);
    expect(PROXY_MAX_CONTENTS_CHARS).toBe(100_000);
  });

  it('detecta contents demasiado grandes', () => {
    const small = { parts: [{ text: 'hola' }] };
    expect(isProxyContentsTooLarge(small)).toBe(false);
    expect(estimateContentsChars(small)).toBeGreaterThan(0);

    const huge = { parts: [{ text: 'x'.repeat(PROXY_MAX_CONTENTS_CHARS) }] };
    expect(isProxyContentsTooLarge(huge)).toBe(true);
  });
});

describe('classifyGeminiError proxy abuse (T20)', () => {
  it('clasifica rate limit del proxy', () => {
    const c = classifyGeminiError(new Error('PROXY_RATE_LIMIT: Demasiadas peticiones al proxy'));
    expect(c.type).toBe('proxy_rate_limit');
    expect(c.title).toMatch(/peticiones/i);
  });

  it('clasifica cooldown de sesión', () => {
    const c = classifyGeminiError(new Error('PROXY_SESSION_COOLDOWN: Espera 30s antes de iniciar otra investigación'));
    expect(c.type).toBe('proxy_session_cooldown');
  });

  it('clasifica payload demasiado grande', () => {
    const c = classifyGeminiError(new Error('PROXY_PAYLOAD_TOO_LARGE: demasiado grande'));
    expect(c.type).toBe('proxy_payload_too_large');
  });
});
