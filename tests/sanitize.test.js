import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  safeUrl,
  safeHref,
  dataCopyAttr,
  escapeDeep,
  purifyHtml,
} from '../src/utils/sanitize.js';

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

describe('purifyHtml', () => {
  it('never leaves executable handlers in output (DOMPurify o escape fallback)', () => {
    const dirty = `<p>Hola</p><script>alert(1)</script><img src=x onerror="alert(1)">`;
    const clean = purifyHtml(dirty);
    expect(clean.toLowerCase()).not.toMatch(/<script[\s>]/i);
    // Si no hay DOM (vitest/node), cae a escapeHtml — también seguro
    expect(clean.includes('<script>') || clean.includes('&lt;script')).toBe(true);
    expect(clean).not.toMatch(/onerror\s*=\s*["']?alert/i);
  });

  it('handles empty', () => {
    expect(purifyHtml('')).toBe('');
    expect(purifyHtml(null)).toBe('');
  });

  it('in node without window, escapes instead of throwing', () => {
    const clean = purifyHtml('<b>x</b>');
    // Sin DOM: escape. Con DOM de browser real: puede conservar <b>.
    expect(clean === '<b>x</b>' || clean === '&lt;b&gt;x&lt;/b&gt;').toBe(true);
  });
});
