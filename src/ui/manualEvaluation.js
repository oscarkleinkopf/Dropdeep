import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import {
  RUBRIC_CRITERIA,
  WINNER_GATE_FIELDS,
  computeManualEvaluation,
  getDefaultRubricInputs,
  normalizeRubricInputs,
  verdictColor,
} from '../research/manualRubric.js';
import { persistResearchReport, savePortfolioLocal } from '../research/historySync.js';
import { openPortfolioLimitModal } from './portfolio.js';
import { updatePortfolioBadge } from './portfolioBadge.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';
import { calculateProductScore } from '../research/scoring.js';
import { isPortfolioAtCap } from '../config/freeTier.js';
import { markPortfolioSaveDone, updateOnboardingPanel } from './onboarding.js';
import { bindModalA11y } from '../utils/modalA11y.js';

let evalInputs = getDefaultRubricInputs();
let evalProductName = '';
let releaseManualEvalA11y = null;

function getModal() {
  return document.getElementById('manual-eval-modal');
}

function prefillGatesFromReport(report) {
  if (!report) return;
  const cost = Number(report.cost);
  const retail = Number(report.retail);
  if (Number.isFinite(retail) && retail > 0) {
    evalInputs.productTicketUsd = Math.round(retail * 100) / 100;
  }
  if (Number.isFinite(cost) && Number.isFinite(retail) && retail > 0) {
    evalInputs.grossMarginUsd = Math.round((retail - cost) * 100) / 100;
  }
}

function renderGateFields() {
  const container = document.getElementById('manual-eval-gates');
  if (!container) return;

  container.innerHTML = `
    <div class="manual-eval-gates-header">
      <h4>Gates Winner (Audisio & Domingo)</h4>
      <p class="manual-eval-hint">Si fallan, el veredicto no puede ser <strong>Lanzar</strong> aunque el score sea ≥ 70. Offline — no usa API.</p>
    </div>
    ${WINNER_GATE_FIELDS.map((f) => {
      const val = evalInputs[f.id] ?? '';
      return `
        <div class="manual-eval-criterion" data-gate="${f.id}">
          <label class="manual-eval-label" for="manual-gate-${f.id}">${f.label}</label>
          ${f.hint ? `<p class="manual-eval-hint">${f.hint}</p>` : ''}
          <input type="number" class="manual-eval-number" id="manual-gate-${f.id}" data-id="${f.id}"
            min="${f.min || '0'}" step="${f.step || '0.01'}" placeholder="${f.placeholder || ''}"
            value="${val === '' || val == null ? '' : val}">
        </div>`;
    }).join('')}
  `;

  container.querySelectorAll('.manual-eval-number').forEach((input) => {
    input.addEventListener('input', (e) => {
      const id = e.target.getAttribute('data-id');
      const raw = e.target.value;
      evalInputs[id] = raw === '' ? '' : Number(raw);
      updatePreview();
    });
  });
}

function renderCriteriaForm() {
  const container = document.getElementById('manual-eval-criteria');
  if (!container) return;

  container.innerHTML = RUBRIC_CRITERIA.map((c) => {
    if (c.type === 'checkbox') {
      const checked = !!Number(evalInputs[c.id]);
      return `
        <div class="manual-eval-criterion manual-eval-criterion-check" data-criterion="${c.id}">
          <label class="manual-eval-check-label">
            <input type="checkbox" class="manual-eval-checkbox" data-id="${c.id}" ${checked ? 'checked' : ''}>
            <span>${c.label} <span class="manual-eval-weight">(${(c.weight * 100).toFixed(0)}%)</span></span>
          </label>
          ${c.hint ? `<p class="manual-eval-hint">${c.hint}</p>` : ''}
        </div>`;
    }

    if (c.type === 'select') {
      const options = c.options
        .map(
          (o) =>
            `<option value="${o.value}" ${evalInputs[c.id] === o.value ? 'selected' : ''}>${o.label}</option>`
        )
        .join('');
      return `
        <div class="manual-eval-criterion" data-criterion="${c.id}">
          <label class="manual-eval-label">${c.label} <span class="manual-eval-weight">(${(c.weight * 100).toFixed(0)}%)</span></label>
          ${c.hint ? `<p class="manual-eval-hint">${c.hint}</p>` : ''}
          <select class="manual-eval-select" data-id="${c.id}">${options}</select>
        </div>`;
    }

    const val = evalInputs[c.id] ?? c.defaultValue;
    return `
      <div class="manual-eval-criterion" data-criterion="${c.id}">
        <label class="manual-eval-label">${c.label} <span class="manual-eval-weight">(${(c.weight * 100).toFixed(0)}%)</span></label>
        ${c.hint ? `<p class="manual-eval-hint">${c.hint}</p>` : ''}
        <div class="manual-eval-slider-row">
          <input type="range" class="manual-eval-slider" data-id="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${val}">
          <span class="manual-eval-slider-val" id="manual-val-${c.id}">${val}</span>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.manual-eval-slider').forEach((slider) => {
    slider.addEventListener('input', (e) => {
      const id = e.target.getAttribute('data-id');
      evalInputs[id] = Number(e.target.value);
      const valEl = document.getElementById(`manual-val-${id}`);
      if (valEl) valEl.textContent = e.target.value;
      updatePreview();
    });
  });

  container.querySelectorAll('.manual-eval-select').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      evalInputs[e.target.getAttribute('data-id')] = Number(e.target.value);
      updatePreview();
    });
  });

  container.querySelectorAll('.manual-eval-checkbox').forEach((box) => {
    box.addEventListener('change', (e) => {
      evalInputs[e.target.getAttribute('data-id')] = e.target.checked ? 1 : 0;
      updatePreview();
    });
  });
}

function updatePreview() {
  const result = computeManualEvaluation(evalInputs);
  const scoreEl = document.getElementById('manual-eval-preview-score');
  const verdictEl = document.getElementById('manual-eval-preview-verdict');
  const explEl = document.getElementById('manual-eval-preview-explanation');
  const gatesEl = document.getElementById('manual-eval-gates-status');

  if (scoreEl) scoreEl.textContent = `${result.score}/100`;
  if (verdictEl) {
    verdictEl.textContent = result.verdict;
    verdictEl.style.color = verdictColor(result.verdict);
  }
  if (explEl) explEl.textContent = result.explanation;

  if (gatesEl) {
    const g = result.winnerGates;
    if (!g) {
      gatesEl.innerHTML = '';
      return;
    }
    const blockerHtml = g.blockers
      .map((b) => `<li class="manual-eval-gate-blocker">${b.message}</li>`)
      .join('');
    const warnHtml = g.warnings
      .map((w) => `<li class="manual-eval-gate-warn">${w.message}</li>`)
      .join('');
    const status = g.passed
      ? `<p class="manual-eval-gate-ok">Gates Winner: OK (${g.pillarsHit}/3 pilares).</p>`
      : `<p class="manual-eval-gate-fail">Gates Winner: bloquean “Lanzar” (${g.blockers.length}).</p>`;
    gatesEl.innerHTML = `${status}<ul>${blockerHtml}${warnHtml}</ul>`;
  }
}

function attachEvaluationToReport(report, evaluation, productName) {
  const updated = {
    ...report,
    name: report?.name || productName,
    manualEvaluation: evaluation,
  };

  if (!updated.categoryId) updated.categoryId = 'general';

  return updated;
}

function saveEvaluationToPortfolio(report, productName) {
  const evaluation = computeManualEvaluation(evalInputs);
  const fullReport = attachEvaluationToReport(report || { name: productName, categoryId: 'general' }, evaluation, productName);
  fullReport.productScore = fullReport.productScore || calculateProductScore(fullReport);
  fullReport._source = fullReport._source || 'manual';

  const existingIdx = state.portfolio.findIndex(
    (p) => p.name.toLowerCase() === productName.toLowerCase()
  );

  const item = {
    id: productName.toLowerCase().replace(/\s+/g, '-'),
    name: productName,
    category: fullReport.categoryId || 'general',
    cost: fullReport.cost || 0,
    retail: fullReport.retail || 0,
    margin: fullReport.margin || 0,
    roi: fullReport.roi || 0,
    shipping: fullReport.shipping || 0,
    saturation: fullReport.saturation || 0,
    savedAt: new Date().toLocaleDateString('es'),
    notes: `Evaluación manual: ${evaluation.verdict} (${evaluation.score}/100)`,
    fullReport,
  };

  if (existingIdx >= 0) {
    state.portfolio[existingIdx] = { ...state.portfolio[existingIdx], ...item };
  } else {
    if (isPortfolioAtCap(state.portfolio.length)) {
      openPortfolioLimitModal({ reason: 'save' });
      return null;
    }
    state.portfolio.push(item);
  }

  savePortfolioLocal();
  persistResearchReport(fullReport).catch(() => { /* offline */ });
  updatePortfolioBadge();
  renderDashboardStats();
  renderResearchFeed();
  markPortfolioSaveDone();
  updateOnboardingPanel();

  return fullReport;
}

export function openManualEvaluation(productName = '', existingReport = null) {
  evalProductName = productName || existingReport?.name || '';
  evalInputs = getDefaultRubricInputs();

  if (existingReport?.manualEvaluation?.criteria) {
    evalInputs = {
      ...evalInputs,
      ...normalizeRubricInputs(existingReport.manualEvaluation.criteria),
    };
  }

  prefillGatesFromReport(existingReport || state.currentReport);

  const nameInput = document.getElementById('manual-eval-product-input');
  if (nameInput) nameInput.value = evalProductName;

  renderGateFields();
  renderCriteriaForm();
  updatePreview();

  getModal()?.classList.remove('hidden');
  releaseManualEvalA11y?.();
  releaseManualEvalA11y = bindModalA11y(getModal(), {
    onClose: closeManualEvaluation,
    initialFocus: '#manual-eval-product-input',
    label: 'Evaluación manual Audisio',
  });
}

export function closeManualEvaluation() {
  releaseManualEvalA11y?.();
  releaseManualEvalA11y = null;
  getModal()?.classList.add('hidden');
}

export function initManualEvaluation() {
  const modal = getModal();
  if (!modal) return;

  document.getElementById('manual-eval-close-dot')?.addEventListener('click', closeManualEvaluation);
  document.getElementById('manual-eval-cancel-btn')?.addEventListener('click', closeManualEvaluation);

  document.getElementById('manual-eval-save-btn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('manual-eval-product-input');
    const productName = (nameInput?.value || evalProductName || '').trim();
    if (!productName) {
      showToast('Ingresa el nombre del producto.', 'info');
      nameInput?.focus();
      return;
    }

    const existing = state.portfolio.find((p) => p.name.toLowerCase() === productName.toLowerCase());
    const baseReport = state.currentReport?.name?.toLowerCase() === productName.toLowerCase()
      ? state.currentReport
      : existing?.fullReport;

    const fullReport = saveEvaluationToPortfolio(baseReport, productName);
    if (!fullReport) return;

    state.currentReport = fullReport;
    closeManualEvaluation();
    showToast(`Evaluación guardada: ${fullReport.manualEvaluation.verdict} (${fullReport.manualEvaluation.score}/100)`, 'success');
  });

  document.getElementById('manual-eval-open-report-btn')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('manual-eval-product-input');
    const productName = (nameInput?.value || evalProductName || '').trim();
    if (!productName) {
      showToast('Ingresa el nombre del producto.', 'info');
      return;
    }

    const existing = state.portfolio.find((p) => p.name.toLowerCase() === productName.toLowerCase());
    const baseReport = state.currentReport?.name?.toLowerCase() === productName.toLowerCase()
      ? state.currentReport
      : existing?.fullReport;

    const fullReport = saveEvaluationToPortfolio(baseReport, productName);
    if (!fullReport) return;

    closeManualEvaluation();
    const { openDeepResearchReport } = await import('./report.js');
    openDeepResearchReport(fullReport);
  });

  document.getElementById('manual-eval-dashboard-btn')?.addEventListener('click', () => {
    closeManualEvaluation();
    switchView('dashboard-view');
    openManualEvaluation();
  });
}

export function renderManualEvalBadgeHtml(report) {
  const ev = report?.manualEvaluation;
  if (!ev) return '';
  const color = verdictColor(ev.verdict);
  const gateNote = ev.winnerGates && !ev.winnerGates.passed ? ' · gates' : '';
  return `<span class="report-badge-status" style="margin-left:0.5rem; border-color:${color}; color:${color}">Evaluación manual: ${ev.verdict} (${ev.score}/100)${gateNote}</span>`;
}

export function getManualEvalSummaryMarkdown(report) {
  const ev = report?.manualEvaluation;
  if (!ev) return '';
  let md = `\n## Evaluación manual (sin IA)\n\n`;
  md += `- **Score:** ${ev.score}/100\n`;
  md += `- **Veredicto:** ${ev.verdict}\n`;
  if (ev.winnerGates) {
    md += `- **Gates Winner:** ${ev.winnerGates.passed ? 'OK' : 'Bloquean Lanzar'} (${ev.winnerGates.pillarsHit}/3 pilares)\n`;
  }
  md += `- **Explicación:** ${ev.explanation}\n\n`;
  return md;
}
