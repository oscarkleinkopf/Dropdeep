import { parseAliExpressInput } from '../discovery/parseAliExpress.js';
import { prefilterAliExpressCandidate } from '../discovery/audisioPrefilter.js';
import { runResearchDirect } from '../research/flow.js';
import { switchView } from './navigation.js';
import { openManualEvaluation } from './manualEvaluation.js';
import { refreshIcons } from '../utils/icons.js';
import { getStoredFxClpPerUsd } from '../research/pricingAudisio.js';

let lastCandidate = null;

export function initDiscover() {
  const form = document.getElementById('discover-form');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleParse();
  });

  document.getElementById('discover-cost-input')?.addEventListener('input', () => {
    if (lastCandidate) renderCandidateCard(lastCandidate);
  });
  document.getElementById('discover-title-input')?.addEventListener('input', () => {
    if (lastCandidate) renderCandidateCard(lastCandidate);
  });
  document.getElementById('discover-retail-input')?.addEventListener('input', () => {
    if (lastCandidate) renderCandidateCard(lastCandidate);
  });

  document.getElementById('discover-investigate-btn')?.addEventListener('click', () => {
    investigateCandidate();
  });
  document.getElementById('discover-manual-btn')?.addEventListener('click', () => {
    openManualFromCandidate();
  });
  document.getElementById('discover-open-ae-btn')?.addEventListener('click', () => {
    if (lastCandidate?.productUrl) {
      window.open(lastCandidate.productUrl, '_blank', 'noopener,noreferrer');
    }
  });
}

function handleParse() {
  const raw = document.getElementById('discover-url-input')?.value || '';
  const result = parseAliExpressInput(raw);
  const errEl = document.getElementById('discover-parse-error');
  const card = document.getElementById('discover-candidate');

  if (!result.ok) {
    lastCandidate = null;
    if (errEl) {
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
    }
    card?.classList.add('hidden');
    return;
  }

  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }

  const titleInput = document.getElementById('discover-title-input');
  if (titleInput && result.titleHint && !titleInput.value.trim()) {
    titleInput.value = result.titleHint;
  }

  lastCandidate = {
    source: 'aliexpress-paste',
    externalId: result.externalId,
    productUrl: result.productUrl,
    titleHint: result.titleHint,
    inputKind: result.inputKind,
    fetchedAt: new Date().toISOString(),
  };

  renderCandidateCard(lastCandidate);
  card?.classList.remove('hidden');
  refreshIcons();
}

function currentTitle() {
  const typed = document.getElementById('discover-title-input')?.value?.trim();
  if (typed) return typed;
  if (lastCandidate?.titleHint) return lastCandidate.titleHint;
  if (lastCandidate?.externalId) return `AliExpress #${lastCandidate.externalId}`;
  return '';
}

function currentCostUsd() {
  const n = parseFloat(document.getElementById('discover-cost-input')?.value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function currentRetailUsd() {
  const n = parseFloat(document.getElementById('discover-retail-input')?.value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function renderCandidateCard(candidate) {
  const idEl = document.getElementById('discover-candidate-id');
  const urlEl = document.getElementById('discover-candidate-url');
  const preEl = document.getElementById('discover-prefilter');
  const badge = document.getElementById('discover-source-badge');

  if (idEl) idEl.textContent = candidate.externalId;
  if (urlEl) {
    urlEl.href = candidate.productUrl;
    urlEl.textContent = candidate.productUrl;
  }
  if (badge) {
    badge.textContent =
      candidate.inputKind === 'id'
        ? 'Pegado: ID AliExpress (sin API Affiliate)'
        : 'Pegado: URL AliExpress (sin API Affiliate)';
  }

  const costUsd = currentCostUsd();
  const retailUsd = currentRetailUsd();
  const pre = prefilterAliExpressCandidate({
    costUsd: costUsd ?? 0,
    retailUsd: retailUsd ?? undefined,
    fxClpPerUsd: getStoredFxClpPerUsd(),
  });

  if (preEl) {
    preEl.dataset.rank = pre.rankHint;
    preEl.innerHTML = `
      <p class="discover-prefilter-label">${escapeHtml(pre.disclaimer)}</p>
      <p class="discover-prefilter-summary">${escapeHtml(pre.summary)}</p>
      ${
        pre.pricing
          ? `<ul class="discover-prefilter-flags">${pre.pricing.flags
              .map(
                (f) =>
                  `<li class="discover-flag discover-flag--${escapeHtml(f.level)}">${escapeHtml(f.message)}</li>`,
              )
              .join('')}</ul>`
          : ''
      }
      <p class="discover-fx-note">FX usado: ${getStoredFxClpPerUsd()} CLP/USD (editable en el panel de precios del informe).</p>
    `;
  }

  const investigateBtn = document.getElementById('discover-investigate-btn');
  if (investigateBtn) {
    investigateBtn.disabled = !currentTitle();
  }
}

function investigateCandidate() {
  if (!lastCandidate) return;
  const title = currentTitle();
  if (!title) return;

  const searchInput = document.getElementById('search-input');
  const competitorInput = document.getElementById('competitor-input');
  if (searchInput) searchInput.value = title;
  if (competitorInput) competitorInput.value = lastCandidate.productUrl;

  switchView('dashboard-view');
  runResearchDirect(title, lastCandidate.productUrl);
}

function openManualFromCandidate() {
  if (!lastCandidate) return;
  const title = currentTitle();
  openManualEvaluation(title || `AliExpress #${lastCandidate.externalId}`);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Used when switching to discover-view */
export function renderDiscover() {
  refreshIcons();
  if (lastCandidate) renderCandidateCard(lastCandidate);
}
