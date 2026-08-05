/**
 * T28 — cache key isolation by source + research mode.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  formatCacheOriginLabel,
  getCacheEntry,
  getCacheKey,
  setCacheEntry,
} from '../src/research/cache.js';

const memory = new Map();

beforeEach(() => {
  memory.clear();
  globalThis.localStorage = {
    getItem: (k) => (memory.has(k) ? memory.get(k) : null),
    setItem: (k, v) => {
      memory.set(k, String(v));
    },
    removeItem: (k) => {
      memory.delete(k);
    },
    clear: () => memory.clear(),
    key: (i) => [...memory.keys()][i] ?? null,
    get length() {
      return memory.size;
    },
  };
});

describe('getCacheKey (T28)', () => {
  it('incluye idioma, fuente y modo', () => {
    expect(getCacheKey('Widget X', 'es', 'api', 'complete')).toBe(
      'dropdeep_cache_es_api_complete_widget x'
    );
    expect(getCacheKey('Widget X', 'es', 'copilot', 'express')).toBe(
      'dropdeep_cache_es_copilot_express_widget x'
    );
  });

  it('aísla API vs Copiloto y Express vs Completo', () => {
    const api = getCacheKey('Pro', 'es', 'api', 'complete');
    const copilot = getCacheKey('Pro', 'es', 'copilot', 'complete');
    const express = getCacheKey('Pro', 'es', 'copilot', 'express');
    expect(api).not.toBe(copilot);
    expect(copilot).not.toBe(express);
  });
});

describe('get/setCacheEntry isolation (T28)', () => {
  it('no reutiliza caché cruzada entre rutas', () => {
    setCacheEntry('Botella', { name: 'Botella', _source: 'api', _researchMode: 'complete' }, 'es', 'api', 'complete');
    expect(getCacheEntry('Botella', 'es', 'api', 'complete')?.name).toBe('Botella');
    expect(getCacheEntry('Botella', 'es', 'copilot', 'express')).toBeNull();
    expect(getCacheEntry('Botella', 'es', 'api', 'fast')).toBeNull();
  });
});

describe('formatCacheOriginLabel (T28)', () => {
  it('etiqueta origen y modo en español', () => {
    expect(formatCacheOriginLabel('api', 'complete')).toBe('API Completo');
    expect(formatCacheOriginLabel('copilot', 'express')).toBe('Copiloto Express');
    expect(formatCacheOriginLabel('copilot', 'fast')).toBe('Copiloto Rápido');
    expect(formatCacheOriginLabel('manual', 'complete')).toBe('Evaluación manual');
  });
});
