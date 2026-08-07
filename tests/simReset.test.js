/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetMetaAdsAuditForm,
  renderMetaAdsAuditResults,
} from '../src/ui/metaAdsAuditPanel.js';

describe('resetMetaAdsAuditForm', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="meta-audit-sale" value="49990" />
      <input id="meta-audit-cost" value="12000" />
      <input id="meta-audit-campaign-cpa" value="8500" />
      <input id="meta-audit-ctr" value="2.8" />
      <input id="meta-audit-cpc" value="180" />
      <input id="meta-audit-atc" value="2000" />
      <input id="meta-audit-cpm" value="4500" />
      <input type="checkbox" id="meta-audit-competitive" checked />
      <input id="meta-audit-ali-vat" value="21" />
      <input id="meta-audit-pay-fee" value="4" />
      <input id="meta-audit-shop-fee" value="3" />
      <input id="meta-audit-sales-vat" value="21" />
      <div id="meta-audit-results"><p>resultados</p></div>
    `;
  });

  it('restores numeric defaults and clears results card', () => {
    renderMetaAdsAuditResults();
    expect(document.getElementById('meta-audit-results').innerHTML).toContain('CPA máximo');

    resetMetaAdsAuditForm();

    expect(document.getElementById('meta-audit-sale').value).toBe('');
    expect(document.getElementById('meta-audit-cost').value).toBe('');
    expect(document.getElementById('meta-audit-ctr').value).toBe('');
    expect(document.getElementById('meta-audit-competitive').checked).toBe(false);
    expect(document.getElementById('meta-audit-ali-vat').value).toBe('19');
    expect(document.getElementById('meta-audit-pay-fee').value).toBe('3.5');
    expect(document.getElementById('meta-audit-shop-fee').value).toBe('2');
    expect(document.getElementById('meta-audit-sales-vat').value).toBe('19');
    expect(document.getElementById('meta-audit-results').innerHTML).toBe('');
  });
});
