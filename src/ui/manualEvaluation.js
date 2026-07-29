import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import {
  RUBRIC_CRITERIA,
  computeManualEvaluation,
  getDefaultRubricInputs,
  verdictColor,
} from '../research/manualRubric.js';
import { persistResearchReport, savePortfolioLocal } from '../research/historySync.js';
import { updatePortfolioBadge } from './portfolio.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';
import { openDeepResearchReport } from './report.js';
import { calculateProductScore } from '../research/scoring.js';
import { FREE_PORTFOLIO_CAP, isPortfolioAtCap } from '../config/freeTier.js';
import { markPortfolioSaveDone, updateOnboardingPanel } from './onboarding.js';

let evalInputs = getDefaultRubricInputs();
let evalProductName = '';

function getModal() {
  return document.getElementById('manual-eval-modal');
}

function renderCriteriaForm() {
  const container = document.getElementById('manual-eval-criteria');
  if (!container) return;

  container.innerHTML = RUBRIC_CRITERIA.map((c) => {
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
}

function updatePreview() {
  const result = computeManualEvaluation(evalInputs);
  const scoreEl = document.getElementById('manual-eval-preview-score');
  const verdictEl = document.getElementById('manual-eval-preview-verdict');
  const explEl = document.getElementById('manual-eval-preview-explanation');

  if (scoreEl) scoreEl.textContent = `${result.score}/100`;
  if (verdictEl) {
    verdictEl.textContent = result.verdict;
    verdictEl.style.color = verdictColor(result.verdict);
  }
  if (explEl) explEl.textContent = result.explanation;
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
      showToast(
        `Portafolio limitado a ${FREE_PORTFOLIO_CAP} productos. Exporta JSON o elimina uno.`,
        'info'
      );
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
    evalInputs = { ...evalInputs, ...existingReport.manualEvaluation.criteria };
  }

  const nameInput = document.getElementById('manual-eval-product-input');
  if (nameInput) nameInput.value = evalProductName;

  renderCriteriaForm();
  updatePreview();

  getModal()?.classList.remove('hidden');
}

export function closeManualEvaluation() {
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

  document.getElementById('manual-eval-open-report-btn')?.addEventListener('click', () => {
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
  return `<span class="report-badge-status" style="margin-left:0.5rem; border-color:${color}; color:${color}">Evaluación manual: ${ev.verdict} (${ev.score}/100)</span>`;
}

export function getManualEvalSummaryMarkdown(report) {
  const ev = report?.manualEvaluation;
  if (!ev) return '';
  let md = `\n## Evaluación manual (sin IA)\n\n`;
  md += `- **Score:** ${ev.score}/100\n`;
  md += `- **Veredicto:** ${ev.verdict}\n`;
  md += `- **Explicación:** ${ev.explanation}\n\n`;
  return md;
}
