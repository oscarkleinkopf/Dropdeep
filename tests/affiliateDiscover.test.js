import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  sortedConcat,
  beijingTimestamp,
  signMd5Bookend,
  signHmacSha256,
  buildSignedParams,
} from '../src/discovery/affiliateSign.js';
import {
  unwrapAffiliateResult,
  normalizeAffiliateProduct,
  normalizeAffiliatePayload,
  parseEvaluateRate,
  parseShipDays,
  parseOrders,
  sanitizeAffiliateProductUrl,
} from '../src/discovery/normalizeAffiliate.js';

function md5Hex(utf8) {
  return createHash('md5').update(utf8, 'utf8').digest('hex');
}

function hmacSha256Hex(secret, utf8) {
  return createHmac('sha256', secret).update(utf8, 'utf8').digest('hex');
}

const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/affiliate-product-query.json', import.meta.url), 'utf8'),
);

describe('sortedConcat + MD5 bookend (Affiliate v2)', () => {
  it('sorts keys and skips sign / empty', () => {
    expect(
      sortedConcat({
        method: 'aliexpress.affiliate.product.query',
        b: '2',
        a: '1',
        sign: 'NOPE',
        empty: '',
        nil: undefined,
      }),
    ).toBe('a1b2methodaliexpress.affiliate.product.query');
  });

  it('matches a frozen MD5 vector', () => {
    const params = {
      app_key: '123456',
      format: 'json',
      method: 'aliexpress.affiliate.product.query',
      sign_method: 'md5',
      timestamp: '2026-08-17 12:00:00',
      v: '2.0',
      keywords: 'lumbar cushion',
    };
    const sign = signMd5Bookend(params, 'test-secret', md5Hex);
    const expected = createHash('md5')
      .update(
        `test-secret${sortedConcat(params)}test-secret`,
        'utf8',
      )
      .digest('hex')
      .toUpperCase();
    expect(sign).toBe(expected);
    expect(sign).toMatch(/^[A-F0-9]{32}$/);
    expect(sign).toBe(
      createHash('md5')
        .update(
          'test-secretapp_key123456formatjsonkeywordslumbar cushionmethodaliexpress.affiliate.product.querysign_methodmd5timestamp2026-08-17 12:00:00v2.0test-secret',
          'utf8',
        )
        .digest('hex')
        .toUpperCase(),
    );
  });

  it('HMAC-SHA256 signs the concat (not wrapped)', () => {
    const params = { app_key: '1', method: 'x' };
    const sign = signHmacSha256(params, 'sec', hmacSha256Hex);
    expect(sign).toBe(
      createHmac('sha256', 'sec').update('app_key1methodx', 'utf8').digest('hex').toUpperCase(),
    );
  });

  it('buildSignedParams attaches uppercase sign and omits empty business fields', () => {
    const params = buildSignedParams({
      appKey: 'k',
      appSecret: 's',
      method: 'aliexpress.affiliate.product.query',
      timestamp: '2026-01-01 00:00:00',
      business: { keywords: 'desk', tracking_id: '', page_no: 1 },
      md5Hex,
    });
    expect(params.keywords).toBe('desk');
    expect(params.tracking_id).toBeUndefined();
    expect(params.page_no).toBe('1');
    expect(params.sign).toMatch(/^[A-F0-9]{32}$/);
    expect(params.sign_method).toBe('md5');
  });
});

describe('beijingTimestamp', () => {
  it('formats GMT+8 as yyyy-MM-dd HH:mm:ss', () => {
    const utc = new Date('2026-08-17T16:05:09.000Z');
    expect(beijingTimestamp(utc)).toBe('2026-08-18 00:05:09');
  });
});

describe('normalizeAffiliate', () => {
  it('unwraps nested product list', () => {
    const u = unwrapAffiliateResult(fixture);
    expect(u.ok).toBe(true);
    expect(u.products).toHaveLength(2);
    expect(u.total).toBe(86);
  });

  it('maps fixture products to CandidateDTO', () => {
    const { candidates, ok } = normalizeAffiliatePayload(fixture, '2026-08-18T00:00:00.000Z');
    expect(ok).toBe(true);
    expect(candidates).toHaveLength(2);

    const first = candidates[0];
    expect(first.source).toBe('aliexpress');
    expect(first.externalId).toBe('1005001234567890');
    expect(first.title).toContain('Lumbar');
    expect(first.priceUsd).toBe(8.5);
    expect(first.originalPriceUsd).toBe(14.99);
    expect(first.orders).toBe(3200);
    expect(first.reviewPositivePct).toBe(95.4);
    expect(first.rating).toBeNull();
    expect(first.imageUrl).toContain('alicdn.com');
    expect(first.productUrl).toContain('/item/1005001234567890');
    expect(first.affiliateUrl).toContain('s.click.aliexpress.com');
    expect(first.shipTo).toBe('CL');
    expect(first.shipDays).toBe(7);
    expect(first.trendLabel).toBe('unknown');
    expect(first.trendScore).toBeNull();
    expect(first.fetchedAt).toBe('2026-08-18T00:00:00.000Z');

    const second = candidates[1];
    expect(second.title).toBe('Posture corrector');
    expect(second.priceUsd).toBe(6.1);
    expect(second.rating).toBe(4.8);
    expect(second.imageUrl).toBeNull();
    expect(second.productUrl.startsWith('https://')).toBe(true);
    expect(second.shipDays).toBeNull();
  });

  it('rejects error_response', () => {
    const u = unwrapAffiliateResult({
      error_response: { code: 50, msg: 'Invalid signature' },
    });
    expect(u.ok).toBe(false);
    expect(u.message).toMatch(/signature/i);
  });

  it('rejects non-200 resp_code', () => {
    const u = unwrapAffiliateResult({
      aliexpress_affiliate_product_query_response: {
        resp_result: { resp_code: 405, resp_msg: 'App not authorized' },
      },
    });
    expect(u.ok).toBe(false);
    expect(u.code).toBe('405');
  });

  it('accepts a single product object (not array)', () => {
    const u = unwrapAffiliateResult({
      aliexpress_affiliate_hotproduct_query_response: {
        resp_result: {
          resp_code: '200',
          result: {
            products: { product: { product_id: '1', product_title: 'X' } },
          },
        },
      },
    });
    expect(u.ok).toBe(true);
    expect(u.products).toHaveLength(1);
  });

  it('drops products without id/title/url', () => {
    expect(normalizeAffiliateProduct({ product_id: '1', product_title: 'Nope' })).toBeNull();
  });
});

describe('parsers', () => {
  it('parseEvaluateRate', () => {
    expect(parseEvaluateRate('4.8%')).toEqual({ rating: 4.8, reviewPositivePct: null });
    expect(parseEvaluateRate('95.4%')).toEqual({ rating: null, reviewPositivePct: 95.4 });
    expect(parseEvaluateRate(null)).toEqual({ rating: null, reviewPositivePct: null });
  });

  it('parseShipDays / parseOrders', () => {
    expect(parseShipDays('7')).toBe(7);
    expect(parseShipDays('5-12')).toBeNull();
    expect(parseOrders('3,200')).toBe(3200);
    expect(parseOrders(0)).toBe(0);
  });

  it('sanitizeAffiliateProductUrl', () => {
    expect(sanitizeAffiliateProductUrl('https://s.click.aliexpress.com/e/_x')).toContain('s.click');
    expect(sanitizeAffiliateProductUrl('https://evil.example/item/1')).toBeNull();
  });
});

describe('mapDiscoverProxyError', () => {
  it('maps 501 / not configured', async () => {
    const { mapDiscoverProxyError } = await import('../src/discovery/discoverProxyClient.js');
    const m = mapDiscoverProxyError({ code: 'discover_not_configured' });
    expect(m.code).toBe('discover_not_configured');
    expect(m.message).toMatch(/Catálogo Affiliate no configurado/);
  });

  it('maps unauthorized and quota', async () => {
    const { mapDiscoverProxyError } = await import('../src/discovery/discoverProxyClient.js');
    expect(mapDiscoverProxyError({ code: 'unauthorized' }).message).toMatch(/Inicia sesión/);
    expect(mapDiscoverProxyError({ code: 'discover_daily_quota' }).message).toMatch(/Cuota diaria/);
    expect(mapDiscoverProxyError({ code: 'discover_rate_limit' }).message).toMatch(/Demasiadas búsquedas/);
  });
});
