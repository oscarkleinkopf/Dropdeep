import { AUDISIO_METHOD_LABEL } from '../config/audisioRules.js';
import { getStoredFxClpPerUsd } from '../research/pricingAudisio.js';
import { evaluateMetaAdsAudit } from '../research/metaAdsAudit.js';
import { state } from '../state.js';

function levelClass(level) {
  if (level === 'error' || level === 'bad') return 'meta-audit-flag meta-audit-flag-error';
  if (level === 'warn') return 'meta-audit-flag meta-audit-flag-warn';
  if (level === 'ok' || level === 'good' || level === 'excellent') {
    return 'meta-audit-flag meta-audit-flag-ok';
  }
  return 'meta-audit-flag meta-audit-flag-info';
}

function metricBadge(metric) {
  if (!metric) return '';
  const cls =
    metric.level === 'bad' || metric.level === 'error'
      ? 'bad'
      : metric.level === 'excellent' || metric.level === 'good'
        ? 'good'
        : metric.level === 'warn'
          ? 'warn'
          : 'ok';
  return `<span class="meta-audit-badge meta-audit-badge-${cls}">${metric.label}</span>`;
}

function readForm() {
  const num = (id) => {
    const el = document.getElementById(id);
    if (!el || el.value === '') return null;
    const n = parseFloat(el.value);
    return Number.isFinite(n) ? n : null;
  };
  const pctToRate = (id, fallback) => {
    const n = num(id);
    if (n == null) return fallback;
    return n > 1 ? n / 100 : n;
  };

  return {
    salePriceClp: num('meta-audit-sale'),
    productCostClp: num('meta-audit-cost'),
    campaignCpaClp: num('meta-audit-campaign-cpa'),
    ctrPercent: num('meta-audit-ctr'),
    cpcClp: num('meta-audit-cpc'),
    atcClp: num('meta-audit-atc'),
    cpmClp: num('meta-audit-cpm'),
    competitiveNiche: !!document.getElementById('meta-audit-competitive')?.checked,
    aliexpressVatRate: pctToRate('meta-audit-ali-vat', 0.19),
    paymentFeeRate: pctToRate('meta-audit-pay-fee', 0.035),
    shopifyFeeRate: pctToRate('meta-audit-shop-fee', 0.02),
    salesVatRate: pctToRate('meta-audit-sales-vat', 0.19),
  };
}

function prefillFromReport() {
  const report = state.currentReport;
  if (!report) return;
  const fx = getStoredFxClpPerUsd();
  const saleEl = document.getElementById('meta-audit-sale');
  const costEl = document.getElementById('meta-audit-cost');
  if (saleEl && !saleEl.value && report.retail) {
    saleEl.value = String(Math.round(Number(report.retail) * fx));
  }
  if (costEl && !costEl.value && report.cost) {
    costEl.value = String(Math.round(Number(report.cost) * fx));
  }
}

export function renderMetaAdsAuditResults() {
  const out = document.getElementById('meta-audit-results');
  if (!out) return;

  const input = readForm();
  if (input.salePriceClp == null || input.productCostClp == null) {
    out.innerHTML = `<p class="meta-audit-empty">Completa al menos <strong>PVP (CLP)</strong> y <strong>costo producto (CLP)</strong> para calcular el CPA máximo.</p>`;
    return;
  }

  const result = evaluateMetaAdsAudit(input);
  const e = result.economics;
  const m = result.metrics;

  out.innerHTML = `
    <div class="meta-audit-summary ${result.losingMoney || e.marginFinal <= 0 ? 'meta-audit-summary-bad' : 'meta-audit-summary-ok'}">
      <div>
        <span class="meta-audit-metric-label">CPA máximo (Audisio)</span>
        <div class="meta-audit-metric-val">${e.cpaMax.toLocaleString('es-CL')} CLP</div>
      </div>
      <div>
        <span class="meta-audit-metric-label">Margen final / unidad</span>
        <div class="meta-audit-metric-val">${e.marginFinal.toLocaleString('es-CL')} CLP</div>
      </div>
      <div>
        <span class="meta-audit-metric-label">CPA campaña</span>
        <div class="meta-audit-metric-val">${
          result.campaignCpa != null ? `${result.campaignCpa.toLocaleString('es-CL')} CLP` : '—'
        }</div>
      </div>
    </div>

    <div class="meta-audit-breakdown">
      <h4>Desglose económico (CLP)</h4>
      <ul>
        <li>Venta (PVP): ${e.sale.toLocaleString('es-CL')}</li>
        <li>Costo + IVA AliExpress (${(e.rates.vatAli * 100).toFixed(0)}%): ${e.costWithVat.toLocaleString('es-CL')}</li>
        <li>Pasarela (${(e.rates.payRate * 100).toFixed(1)}%): ${e.paymentFee.toLocaleString('es-CL')}</li>
        <li>Shopify (${(e.rates.shopRate * 100).toFixed(1)}%): ${e.shopifyFee.toLocaleString('es-CL')}</li>
        <li>IVA venta (${(e.rates.saleVat * 100).toFixed(0)}%): ${e.salesVatAmount.toLocaleString('es-CL')}</li>
      </ul>
    </div>

    <div class="meta-audit-metrics-grid">
      <div class="meta-audit-metric-card">
        <div class="meta-audit-metric-label">CTR ${metricBadge(m.ctr)}</div>
        <p>${m.ctr.detail}</p>
      </div>
      <div class="meta-audit-metric-card">
        <div class="meta-audit-metric-label">CPC ${metricBadge(m.cpc)}</div>
        <p>${m.cpc.detail}</p>
      </div>
      <div class="meta-audit-metric-card">
        <div class="meta-audit-metric-label">ATC ${metricBadge(m.atc)}</div>
        <p>${m.atc.detail}</p>
      </div>
      <div class="meta-audit-metric-card">
        <div class="meta-audit-metric-label">CPM ${metricBadge(m.cpm)}</div>
        <p>${m.cpm.detail}</p>
      </div>
    </div>

    <ul class="meta-audit-verdicts">
      ${result.verdicts.map((v) => `<li class="${levelClass(v.level)}">${v.message}</li>`).join('')}
    </ul>
    <p class="meta-audit-disclaimer">${AUDISIO_METHOD_LABEL}. Pegas métricas de tu Ads Manager — DropDeep no se conecta a Meta.</p>
  `;
}

export function initMetaAdsAuditPanel() {
  const runBtn = document.getElementById('meta-audit-run-btn');
  if (!runBtn || runBtn.dataset.bound === '1') return;
  runBtn.dataset.bound = '1';
  runBtn.addEventListener('click', () => renderMetaAdsAuditResults());

  document.getElementById('meta-audit-prefill-btn')?.addEventListener('click', () => {
    prefillFromReport();
    renderMetaAdsAuditResults();
  });
}

export function showMetaAdsAuditPanel() {
  initMetaAdsAuditPanel();
  prefillFromReport();
}
