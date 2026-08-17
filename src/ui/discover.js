import { parseAliExpressInput } from '../discovery/parseAliExpress.js';
import { prefilterAliExpressCandidate } from '../discovery/audisioPrefilter.js';
import {
  enrichAliExpressCandidate,
  enrichSourceLabel,
} from '../discovery/enrichAliExpress.js';
import { CHILE_SEASONS, getSeasonsForDate } from '../data/chileSeasonCalendar.js';
import {
  suggestAeQueries,
  suggestQueriesFromNiche,
  DISCOVER_EXAMPLES,
} from '../discovery/suggestAeQueries.js';
import { runResearchDirect } from '../research/flow.js';
import { switchView } from './navigation.js';
import { refreshIcons } from '../utils/icons.js';
import { getStoredFxClpPerUsd } from '../research/pricingAudisio.js';
import { showToast } from '../utils/toast.js';
import { getGeminiRoute } from '../config/geminiRoute.js';
import { isAuthenticated } from '../auth/auth.js';
import { isAuthConfigured } from '../auth/supabaseClient.js';
import { escapeHtml, safeHref } from '../utils/sanitize.js';

let lastCandidate = null;
/** @type {AbortController | null} */
let enrichAbort = null;
/** Tracks which inputs were auto-filled so we don't overwrite user edits. */
let autofillState = { title: false, cost: false, image: false };
/** @type {string} */
let selectedNicheKey = '';

export function initDiscover() {
  const form = document.getElementById('discover-form');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  renderSeasonPanels();
  renderExampleChips();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleParse();
  });

  document.getElementById('discover-query-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleQuerySuggest();
  });

  document.getElementById('discover-hypotheses')?.addEventListener('click', (e) => {
    const exampleBtn = e.target.closest('[data-example]');
    if (exampleBtn) {
      const input = document.getElementById('discover-problem-input');
      if (input) input.value = exampleBtn.dataset.example || '';
      selectedNicheKey = '';
      renderSeasonPanels();
      handleQuerySuggest();
      return;
    }
    const jump = e.target.closest('#discover-jump-paste');
    if (jump) {
      jumpToPaste();
      return;
    }
    const btn = e.target.closest('[data-season-id][data-niche-index]');
    if (!btn) return;
    const season = CHILE_SEASONS.find((s) => s.id === btn.dataset.seasonId);
    const niche = season?.niches?.[Number(btn.dataset.nicheIndex)];
    if (!niche) return;
    selectedNicheKey = `${season.id}:${btn.dataset.nicheIndex}`;
    const problemInput = document.getElementById('discover-problem-input');
    if (problemInput) problemInput.value = niche.pain || niche.name;
    renderSeasonPanels();
    showQueryResult(suggestQueriesFromNiche(niche), {
      heading: `${season.emoji || ''} ${season.name} · ${niche.name}`.trim(),
    });
  });

  document.getElementById('discover-cost-input')?.addEventListener('input', () => {
    autofillState.cost = false;
    if (lastCandidate) renderCandidateCard(lastCandidate);
  });
  document.getElementById('discover-title-input')?.addEventListener('input', () => {
    autofillState.title = false;
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
  document.getElementById('discover-enrich-retry-btn')?.addEventListener('click', () => {
    if (lastCandidate) startEnrichment(lastCandidate);
  });
}

function setEnrichStatus(kind, message) {
  const el = document.getElementById('discover-enrich-status');
  if (!el) return;
  el.dataset.kind = kind || 'idle';
  el.textContent = message || '';
  el.classList.toggle('hidden', !message);
}

function setFieldProvenance(field, source) {
  const el = document.getElementById(`discover-${field}-provenance`);
  if (!el) return;
  if (!source) {
    el.textContent = '';
    el.classList.add('hidden');
    return;
  }
  el.textContent = enrichSourceLabel(source);
  el.classList.remove('hidden');
}

function applyAutofill(enrichment) {
  const titleInput = document.getElementById('discover-title-input');
  const costInput = document.getElementById('discover-cost-input');
  const imgEl = document.getElementById('discover-candidate-image');
  const imgWrap = document.getElementById('discover-candidate-media');

  if (
    enrichment.title &&
    titleInput &&
    (!titleInput.value.trim() || autofillState.title)
  ) {
    titleInput.value = enrichment.title;
    autofillState.title = true;
    setFieldProvenance('title', enrichment.sources?.title || 'url-hint');
  } else if (titleInput?.value.trim() && !autofillState.title) {
    setFieldProvenance('title', null);
  } else if (enrichment.sources?.title) {
    setFieldProvenance('title', enrichment.sources.title);
  }

  if (
    enrichment.costUsd != null &&
    costInput &&
    (!costInput.value.trim() || autofillState.cost)
  ) {
    costInput.value = String(enrichment.costUsd);
    autofillState.cost = true;
    setFieldProvenance('cost', enrichment.sources?.cost || 'og-meta');
  } else if (costInput?.value.trim() && !autofillState.cost) {
    setFieldProvenance('cost', null);
  } else if (enrichment.sources?.cost) {
    setFieldProvenance('cost', enrichment.sources.cost);
  }

  if (enrichment.imageUrl && imgEl && imgWrap) {
    imgEl.src = enrichment.imageUrl;
    imgEl.alt = enrichment.title || 'Producto AliExpress (imagen no verificada)';
    imgWrap.classList.remove('hidden');
    autofillState.image = true;
    setFieldProvenance('image', enrichment.sources?.image || 'og-meta');
  }
}

async function startEnrichment(candidate) {
  enrichAbort?.abort();
  enrichAbort = new AbortController();
  const { signal } = enrichAbort;

  const canEdge = isAuthConfigured && isAuthenticated();
  const canGemini = getGeminiRoute() === 'byok';

  if (!canEdge && !canGemini && !candidate.titleHint) {
    setEnrichStatus(
      'idle',
      'Sin sesión ni BYOK: completa título y costo a mano (o inicia sesión para meta pública).',
    );
    return;
  }

  setEnrichStatus(
    'loading',
    canEdge
      ? 'Enriqueciendo desde meta pública…'
      : canGemini
        ? 'Enriqueciendo con Gemini BYOK (inferido)…'
        : 'Usando sugerencia de URL…',
  );

  try {
    const result = await enrichAliExpressCandidate(candidate, { signal });
    if (signal.aborted) return;

    lastCandidate = {
      ...candidate,
      titleHint: result.title || candidate.titleHint,
      imageUrl: result.imageUrl || null,
      enrichSources: result.sources || {},
      enrichedAt: new Date().toISOString(),
    };

    applyAutofill(result);
    renderCandidateCard(lastCandidate);

    if (result.filled) {
      const parts = [];
      if (result.sources?.title) parts.push('título');
      if (result.sources?.cost) parts.push('costo');
      if (result.sources?.image) parts.push('imagen');
      setEnrichStatus(
        'ok',
        `Campos sugeridos (${parts.join(', ') || 'parcial'}) — No verificado · no es Affiliate. Confirma en AliExpress.`,
      );
      showToast('Descubrir: campos sugeridos (no verificados). Revisa antes de investigar.', 'info');
    } else {
      setEnrichStatus(
        'empty',
        'No se pudo auto-rellenar. Completa título/costo a mano — el flujo manual sigue igual.',
      );
    }
  } catch (err) {
    if (err?.name === 'AbortError') return;
    setEnrichStatus(
      'error',
      'Enriquecimiento no disponible. Completa los campos a mano.',
    );
  } finally {
    refreshIcons();
  }
}

function handleParse() {
  const raw = document.getElementById('discover-url-input')?.value || '';
  const result = parseAliExpressInput(raw);
  const errEl = document.getElementById('discover-parse-error');
  const card = document.getElementById('discover-candidate');

  if (!result.ok) {
    lastCandidate = null;
    enrichAbort?.abort();
    if (errEl) {
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
    }
    card?.classList.add('hidden');
    setEnrichStatus('idle', '');
    return;
  }

  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }

  autofillState = { title: false, cost: false, image: false };
  const titleInput = document.getElementById('discover-title-input');
  const costInput = document.getElementById('discover-cost-input');
  const retailInput = document.getElementById('discover-retail-input');
  const imgWrap = document.getElementById('discover-candidate-media');
  const imgEl = document.getElementById('discover-candidate-image');
  if (titleInput) titleInput.value = result.titleHint || '';
  if (costInput) costInput.value = '';
  if (retailInput) retailInput.value = '';
  if (imgWrap) imgWrap.classList.add('hidden');
  if (imgEl) {
    imgEl.removeAttribute('src');
    imgEl.alt = '';
  }
  setFieldProvenance('title', result.titleHint ? 'url-hint' : null);
  setFieldProvenance('cost', null);
  setFieldProvenance('image', null);
  if (result.titleHint) autofillState.title = true;

  lastCandidate = {
    source: 'aliexpress-paste',
    externalId: result.externalId,
    productUrl: result.productUrl,
    titleHint: result.titleHint,
    inputKind: result.inputKind,
    fetchedAt: new Date().toISOString(),
  };

  setDiscoverStep(3);
  renderCandidateCard(lastCandidate);
  card?.classList.remove('hidden');
  refreshIcons();
  startEnrichment(lastCandidate);
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
      <p class="discover-prefilter-legend" aria-hidden="false">
        <span class="discover-legend-item discover-legend-item--ok">Verde: cumple</span>
        <span class="discover-legend-item discover-legend-item--warn">Ámbar: matiz</span>
        <span class="discover-legend-item discover-legend-item--error">Rojo: fuera de regla</span>
      </p>
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

async function openManualFromCandidate() {
  if (!lastCandidate) return;
  const title = currentTitle();
  const { openManualEvaluation } = await import('./manualEvaluation.js');
  openManualEvaluation(title || `AliExpress #${lastCandidate.externalId}`);
}

function setDiscoverStep(step) {
  document.querySelectorAll('#discover-stepper li').forEach((el) => {
    const n = Number(el.dataset.step);
    el.classList.toggle('is-current', n === step);
    el.classList.toggle('is-done', n < step);
  });
}

function jumpToPaste() {
  setDiscoverStep(3);
  const panel = document.getElementById('discover-paste-panel');
  const input = document.getElementById('discover-url-input');
  panel?.classList.add('is-target');
  panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  input?.focus();
  window.setTimeout(() => panel?.classList.remove('is-target'), 1600);
}

function renderExampleChips() {
  const el = document.getElementById('discover-example-chips');
  if (!el) return;
  el.innerHTML = DISCOVER_EXAMPLES.map(
    (ex) =>
      `<button type="button" class="discover-chip" data-example="${escapeHtml(ex.input)}">${escapeHtml(ex.label)}</button>`,
  ).join('');
}

function seasonCardHtml(season, { upcoming = false } = {}) {
  const niches = (season.niches || [])
    .map((niche, idx) => {
      const key = `${season.id}:${idx}`;
      const selected = key === selectedNicheKey ? ' is-selected' : '';
      return `
        <button
          type="button"
          class="discover-niche-chip${selected}"
          data-season-id="${escapeHtml(season.id)}"
          data-niche-index="${idx}"
        >
          <span class="discover-niche-name">${escapeHtml(niche.name)}</span>
          ${niche.pain ? `<span class="discover-niche-pain">${escapeHtml(niche.pain)}</span>` : ''}
        </button>`;
    })
    .join('');
  return `
    <article class="discover-season-card${upcoming ? ' discover-season-card--upcoming' : ''}">
      <header class="discover-season-card-head">
        <h4>${escapeHtml(season.emoji || '')} ${escapeHtml(season.name)}</h4>
        <span class="discover-season-window">${escapeHtml(season.windowLabel)}</span>
      </header>
      <p class="discover-season-why">${escapeHtml(season.hook || season.why || '')}</p>
      <div class="discover-niche-list">${niches}</div>
    </article>`;
}

function renderSeasonPanels() {
  const { active, upcoming, monthLabel } = getSeasonsForDate();
  const kicker = document.getElementById('discover-now-kicker');
  if (kicker) {
    kicker.textContent = monthLabel
      ? `Temporada Chile · ahora en ${monthLabel}`
      : 'Temporada Chile';
  }
  const activeEl = document.getElementById('discover-season-active');
  const upcomingEl = document.getElementById('discover-season-upcoming');
  const upcomingWrap = document.getElementById('discover-season-upcoming-wrap');
  if (activeEl) {
    activeEl.innerHTML = active.map((s) => seasonCardHtml(s)).join('')
      || '<p class="discover-season-empty">No hay temporada marcada este mes — escribe un problema abajo.</p>';
  }
  if (upcomingEl && upcomingWrap) {
    upcomingWrap.classList.toggle('hidden', upcoming.length === 0);
    upcomingEl.innerHTML = upcoming.map((s) => seasonCardHtml(s, { upcoming: true })).join('');
  }
}

function handleQuerySuggest() {
  selectedNicheKey = '';
  renderSeasonPanels();
  const raw = document.getElementById('discover-problem-input')?.value || '';
  showQueryResult(suggestAeQueries(raw), { heading: raw.trim() || 'Tus búsquedas' });
}

function showQueryResult(result, { heading } = {}) {
  const errEl = document.getElementById('discover-query-error');
  const box = document.getElementById('discover-query-results');
  if (!result?.ok) {
    if (errEl) {
      errEl.textContent = result?.error || 'No se pudieron armar búsquedas.';
      errEl.classList.remove('hidden');
    }
    box?.classList.add('hidden');
    setDiscoverStep(1);
    return;
  }
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }
  if (!box) return;

  setDiscoverStep(2);

  const cards = result.queries
    .map((item, i) => {
      const ae = safeHref(item.aeUrl);
      const trends = safeHref(item.trendsUrl);
      const ml = safeHref(item.mlUrl);
      return `
        <article class="discover-query-card">
          <span class="discover-query-num">${i + 1}</span>
          <div class="discover-query-body">
            <p class="discover-query-q">${escapeHtml(item.query)}</p>
            <div class="discover-query-links">
              ${ae ? `<a class="btn btn-primary btn-sm" href="${ae}" target="_blank" rel="noopener noreferrer">Buscar en AliExpress</a>` : ''}
              ${trends ? `<a class="discover-query-ghost" href="${trends}" target="_blank" rel="noopener noreferrer">Trends CL</a>` : ''}
              ${ml ? `<a class="discover-query-ghost" href="${ml}" target="_blank" rel="noopener noreferrer">Mercado Libre</a>` : ''}
            </div>
          </div>
        </article>`;
    })
    .join('');

  box.innerHTML = `
    <div class="discover-results-head">
      <h3 class="discover-results-title">2. Busca un listing</h3>
      <p class="discover-query-heading">${escapeHtml(heading || '')}</p>
      <p class="discover-query-disclaimer">${escapeHtml(result.disclaimer)}</p>
    </div>
    <ul class="discover-ae-tips">
      <li>Costo en USD (banda Audisio: que después del ×2.5 no quede regalado).</li>
      <li>Que quepa en <strong>caja de zapatos</strong>.</li>
      <li>Pedidos y reseñas visibles; envío hacia Chile si aparece.</li>
      <li>Copia el enlace del <strong>producto</strong>, no de la categoría.</li>
    </ul>
    <div class="discover-query-grid">${cards}</div>
    <button type="button" class="btn btn-secondary" id="discover-jump-paste">
      Ya copié el enlace → pegar listing
    </button>
  `;
  box.classList.remove('hidden');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  refreshIcons();
}

/** Used when switching to discover-view */
export function renderDiscover() {
  renderSeasonPanels();
  renderExampleChips();
  refreshIcons();
  if (lastCandidate) {
    setDiscoverStep(3);
    renderCandidateCard(lastCandidate);
  }
}


