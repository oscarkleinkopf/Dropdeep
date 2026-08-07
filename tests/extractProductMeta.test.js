import { describe, it, expect } from 'vitest';
import {
  extractProductMetaFromHtml,
  parseUsdPrice,
  sanitizeProductImageUrl,
  isAllowedAliExpressProductUrl,
} from '../src/discovery/extractProductMeta.js';

describe('parseUsdPrice', () => {
  it('parses USD amounts', () => {
    expect(parseUsdPrice('12.50', 'USD')).toBe(12.5);
    expect(parseUsdPrice('$8.99')).toBe(8.99);
    expect(parseUsdPrice('US $10')).toBe(10);
  });

  it('rejects non-USD currency', () => {
    expect(parseUsdPrice('9900', 'CLP')).toBeNull();
    expect(parseUsdPrice('10', 'EUR')).toBeNull();
  });
});

describe('sanitizeProductImageUrl', () => {
  it('allows alicdn https', () => {
    expect(
      sanitizeProductImageUrl('https://ae01.alicdn.com/kf/Sabc123.jpg'),
    ).toContain('alicdn.com');
  });

  it('rejects http and foreign hosts', () => {
    expect(sanitizeProductImageUrl('http://ae01.alicdn.com/x.jpg')).toBeNull();
    expect(sanitizeProductImageUrl('https://evil.example/x.jpg')).toBeNull();
  });
});

describe('isAllowedAliExpressProductUrl', () => {
  it('accepts item URLs', () => {
    expect(
      isAllowedAliExpressProductUrl('https://www.aliexpress.com/item/1005001.html'),
    ).toBe(true);
  });

  it('rejects other hosts', () => {
    expect(isAllowedAliExpressProductUrl('https://example.com/item/1.html')).toBe(false);
  });
});

describe('extractProductMetaFromHtml', () => {
  it('reads og tags and product price', () => {
    const html = `
      <html><head>
        <meta property="og:title" content="UV Water Bottle Sterilizer - AliExpress" />
        <meta property="og:image" content="https://ae01.alicdn.com/kf/bottle.jpg" />
        <meta property="product:price:amount" content="9.80" />
        <meta property="product:price:currency" content="USD" />
      </head></html>
    `;
    const meta = extractProductMetaFromHtml(html);
    expect(meta.title).toMatch(/UV Water Bottle/i);
    expect(meta.title).not.toMatch(/AliExpress/i);
    expect(meta.imageUrl).toContain('alicdn.com');
    expect(meta.priceUsd).toBe(9.8);
    expect(meta.source).toBe('og-meta');
  });

  it('reads JSON-LD Product offers', () => {
    const html = `
      <script type="application/ld+json">
      {"@type":"Product","name":"Posture Corrector","image":"https://ae01.alicdn.com/kf/p.jpg",
       "offers":{"@type":"Offer","price":"14.20","priceCurrency":"USD"}}
      </script>
    `;
    const meta = extractProductMetaFromHtml(html);
    expect(meta.title).toBe('Posture Corrector');
    expect(meta.priceUsd).toBe(14.2);
    expect(meta.imageUrl).toContain('alicdn.com');
  });
});
