import {
  AUDISIO_DEFAULT_FX_CLP_PER_USD,
  AUDISIO_METHOD_LABEL,
  AUDISIO_TEST_AD_BUDGET_USD,
} from '../config/audisioRules.js';
import {
  evaluateAudisioPricing,
  getStoredFxClpPerUsd,
  setStoredFxClpPerUsd,
  suggestRetailFromCost,
} from '../research/pricingAudisio.js';

function flagClass(level) {
  if (level === 'error') return 'audisio-flag audisio-flag-error';
  if (level === 'warn') return 'audisio-flag audisio-flag-warn';
  if (level === 'ok') return 'audisio-flag audisio-flag-ok';
  return 'audisio-flag audisio-flag-info';
}

/**
 * Inserta / actualiza el panel Precios Audisio bajo el snapshot / calculadora.
 * @param {HTMLElement} anchorEl — nodo tras el cual insertar (p.ej. profitability panel)
 * @param {{ getCost: () => number, getRetail: () => number, setRetail: (n: number) => void }} io
 */
export function ensureAudisioPricingPanel(anchorEl, io) {
  if (!anchorEl?.parentNode) return null;

  let panel = document.getElementById('audisio-pricing-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'audisio-pricing-panel';
    panel.className = 'audisio-pricing-panel';
    anchorEl.parentNode.insertBefore(panel, anchorEl.nextSibling);
  }

  const fx = getStoredFxClpPerUsd();
  panel.innerHTML = `
    <div class="audisio-pricing-header">
      <div>
        <h4>Precios Audisio (Chile / CLP)</h4>
        <p class="audisio-disclaimer">${AUDISIO_METHOD_LABEL} — reglas de negocio offline, no cotización ni Meta en vivo. FX editable.</p>
      </div>
      <div class="audisio-fx-row">
        <label for="audisio-fx-input">CLP por 1 USD</label>
        <input type="number" id="audisio-fx-input" min="1" step="1" value="${fx}">
      </div>
    </div>
    <div class="audisio-pricing-grid">
      <div class="audisio-metric">
        <span class="audisio-metric-label">PVP sugerido (costo × 2.5)</span>
        <span class="audisio-metric-val" id="audisio-suggested-usd">—</span>
        <span class="audisio-metric-sub" id="audisio-suggested-clp">—</span>
      </div>
      <div class="audisio-metric">
        <span class="audisio-metric-label">Tu PVP en CLP</span>
        <span class="audisio-metric-val" id="audisio-retail-clp">—</span>
        <span class="audisio-metric-sub" id="audisio-cost-clp">—</span>
      </div>
      <div class="audisio-metric">
        <span class="audisio-metric-label">Margen bruto (USD)</span>
        <span class="audisio-metric-val" id="audisio-gross-usd">—</span>
        <span class="audisio-metric-sub" id="audisio-contrib">—</span>
      </div>
      <div class="audisio-metric">
        <span class="audisio-metric-label">Budget test ads</span>
        <span class="audisio-metric-val">$${AUDISIO_TEST_AD_BUDGET_USD} USD</span>
        <span class="audisio-metric-sub">Primer mes / mes y medio; luego autofinanciar</span>
      </div>
    </div>
    <div class="audisio-actions">
      <button type="button" class="btn btn-secondary btn-sm" id="audisio-apply-suggested">
        Aplicar PVP sugerido al retail
      </button>
    </div>
    <ul class="audisio-flags" id="audisio-flags"></ul>
    <p class="audisio-gift-hint hidden" id="audisio-gift-hint"></p>
  `;

  const refresh = () => {
    const fxInput = document.getElementById('audisio-fx-input');
    const currentFx = setStoredFxClpPerUsd(
      parseFloat(fxInput?.value) || AUDISIO_DEFAULT_FX_CLP_PER_USD
    );
    if (fxInput && String(currentFx) !== fxInput.value) {
      fxInput.value = String(currentFx);
    }

    const evaluation = evaluateAudisioPricing({
      costUsd: io.getCost(),
      retailUsd: io.getRetail(),
      fxClpPerUsd: currentFx,
    });

    const suggestedUsd = document.getElementById('audisio-suggested-usd');
    const suggestedClp = document.getElementById('audisio-suggested-clp');
    const retailClpEl = document.getElementById('audisio-retail-clp');
    const costClpEl = document.getElementById('audisio-cost-clp');
    const grossEl = document.getElementById('audisio-gross-usd');
    const contribEl = document.getElementById('audisio-contrib');
    const flagsEl = document.getElementById('audisio-flags');
    const giftEl = document.getElementById('audisio-gift-hint');

    if (suggestedUsd) {
      suggestedUsd.textContent = `$${evaluation.suggestedRetailUsd.toFixed(2)} USD`;
    }
    if (suggestedClp) {
      suggestedClp.textContent = `≈ ${evaluation.suggestedRetailClp.toLocaleString('es-CL')} CLP`;
    }
    if (retailClpEl) {
      retailClpEl.textContent =
        evaluation.retailUsd > 0
          ? `${evaluation.retailClp.toLocaleString('es-CL')} CLP`
          : '—';
      retailClpEl.className = evaluation.band.belowFloor
        ? 'audisio-metric-val audisio-metric-bad'
        : 'audisio-metric-val';
    }
    if (costClpEl) {
      costClpEl.textContent = `Costo ≈ ${evaluation.costClp.toLocaleString('es-CL')} CLP`;
    }
    if (grossEl) {
      grossEl.textContent = `$${evaluation.grossMarginUsd.toFixed(2)}`;
      grossEl.className = evaluation.meetsGrossMin
        ? 'audisio-metric-val audisio-metric-good'
        : evaluation.retailUsd > 0
          ? 'audisio-metric-val audisio-metric-bad'
          : 'audisio-metric-val';
    }
    if (contribEl) {
      contribEl.textContent = `Contribución ≈ ${evaluation.contributionMarginPercent}% (objetivo ~35%)`;
    }
    if (flagsEl) {
      flagsEl.innerHTML = evaluation.flags
        .map((f) => `<li class="${flagClass(f.level)}">${f.message}</li>`)
        .join('');
    }
    if (giftEl) {
      if (evaluation.giftHint) {
        giftEl.textContent = evaluation.giftHint;
        giftEl.classList.remove('hidden');
      } else {
        giftEl.textContent = '';
        giftEl.classList.add('hidden');
      }
    }

    return evaluation;
  };

  document.getElementById('audisio-fx-input')?.addEventListener('input', refresh);
  document.getElementById('audisio-apply-suggested')?.addEventListener('click', () => {
    const cost = io.getCost();
    const suggested = suggestRetailFromCost(cost);
    io.setRetail(suggested);
    refresh();
  });

  refresh();
  panel._audisioRefresh = refresh;
  return panel;
}

export function refreshAudisioPricingPanel() {
  const panel = document.getElementById('audisio-pricing-panel');
  if (panel && typeof panel._audisioRefresh === 'function') {
    panel._audisioRefresh();
  }
}
