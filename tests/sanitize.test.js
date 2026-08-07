import { describe, it, expect } from 'vitest';
import { escapeHtml, safeUrl, safeHref, dataCopyAttr, escapeDeep } from '../src/utils/sanitize.js';

describe('escapeHtml', () => {
  it('escapes markup and quotes', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
    expect(escapeHtml(`a&b`)).toBe('a&amp;b');
  });

  it('handles nullish', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('safeUrl / safeHref', () => {
  it('allows https', () => {
    expect(safeUrl('https://www.aliexpress.com/item/1.html')).toContain('aliexpress.com');
    const href = safeHref('https://example.com/path');
    expect(href).toContain('https://example.com/path');
    expect(safeHref('https://example.com/"onmouseover=alert(1)')).not.toContain('"');
  });

  it('rejects javascript and data', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('data:text/html,<script>')).toBe('');
    expect(safeHref('javascript:alert(1)')).toBe('');
  });
});

describe('dataCopyAttr', () => {
  it('URI-encodes then HTML-escapes', () => {
    const v = dataCopyAttr(`</div>'`);
    expect(v).not.toContain('</');
    expect(decodeURIComponent(v.replace(/&quot;/g, '"').replace(/&#39;/g, "'"))).toContain('</div>');
  });
});

describe('escapeDeep', () => {
  it('escapes nested strings and keeps numbers', () => {
    const out = escapeDeep({ name: '<b>x</b>', score: 10, list: ['a<b>'] });
    expect(out.name).toBe('&lt;b&gt;x&lt;/b&gt;');
    expect(out.score).toBe(10);
    expect(out.list[0]).toBe('a&lt;b&gt;');
  });
});
