import { describe, it, expect } from 'vitest';
import { parseAliExpressInput, aliexpressProductUrl } from '../src/discovery/parseAliExpress.js';

describe('parseAliExpressInput', () => {
  it('accepts bare item id', () => {
    const r = parseAliExpressInput('1005006123456789');
    expect(r.ok).toBe(true);
    expect(r.externalId).toBe('1005006123456789');
    expect(r.productUrl).toContain('/item/1005006123456789.html');
    expect(r.inputKind).toBe('id');
  });

  it('parses classic /item/{id}.html URL', () => {
    const r = parseAliExpressInput(
      'https://www.aliexpress.com/item/1005006123456789.html',
    );
    expect(r.ok).toBe(true);
    expect(r.externalId).toBe('1005006123456789');
  });

  it('parses slug URL and extracts title hint', () => {
    const r = parseAliExpressInput(
      'https://www.aliexpress.com/item/3000lm-Led-Flashlight-1005006123456789.html',
    );
    expect(r.ok).toBe(true);
    expect(r.externalId).toBe('1005006123456789');
    expect(r.titleHint).toMatch(/Flashlight/i);
  });

  it('rejects non-AliExpress hosts', () => {
    const r = parseAliExpressInput('https://example.com/item/1005006123456789.html');
    expect(r.ok).toBe(false);
  });

  it('rejects empty / garbage', () => {
    expect(parseAliExpressInput('').ok).toBe(false);
    expect(parseAliExpressInput('not-a-url').ok).toBe(false);
  });
});

describe('aliexpressProductUrl', () => {
  it('builds canonical URL', () => {
    expect(aliexpressProductUrl('1005006123456789')).toBe(
      'https://www.aliexpress.com/item/1005006123456789.html',
    );
  });
});
