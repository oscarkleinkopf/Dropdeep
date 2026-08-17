import { state } from '../state.js';
import { listCacheEntries } from '../research/cache.js';
import { calculateProductScore } from '../research/scoring.js';
import { e } from '../utils/sanitize.js';
import { showToast } from '../utils/toast.js';
import { updateWizardVisibility } from './firstProductWizard.js';
import { getStoredCopilotSession } from '../research/copilotFlow.js';

function getRecentResearchItems(limit = 6) {
  const seen = new Set();
  const items = [];

  const addItem = (name, report, savedAt, source) => {
    const key = name.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ name, report, savedAt, source });
  };

  state.portfolio.forEach((item) => {
    addItem(item.name, item.fullReport, item.savedAt, 'portfolio');
  });

  listCacheEntries().forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('es');
    addItem(entry.name, entry.data, date, 'cache');
  });

  return items.slice(0, limit);
}

export function renderCopilotResumeBanner() {
  const existing = document.getElementById('copilot-resume-banner');
  if (existing) existing.remove();

  const stored = getStoredCopilotSession();
  if (!stored) return;

  const banner = document.createElement('div');
  banner.id = 'copilot-resume-banner';
  banner.className = 'copilot-resume-banner';
  banner.innerHTML = `
    <div class="copilot-resume-banner-inner">
      <div>
        <strong>Investigación copiloto en progreso</strong>
        <p>«${e(stored.productName)}» — paso ${stored.currentStepIndex + 1} de ${stored.steps.length}. Puedes retomar o descartar.</p>
      </div>
      <div class="copilot-resume-banner-actions">
        <button type="button" class="btn btn-primary btn-sm" id="copilot-resume-btn">
          <i data-lucide="play"></i> Retomar copiloto
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="copilot-resume-discard-btn">Descartar</button>
      </div>
    </div>
  `;

  const feed = document.getElementById('research-feed');
  feed?.insertAdjacentElement('beforebegin', banner);

  document.getElementById('copilot-resume-btn')?.addEventListener('click', async () => {
    const { resumeCopilotPanel } = await import('./copilotPanel.js');
    resumeCopilotPanel();
  });
  document.getElementById('copilot-resume-discard-btn')?.addEventListener('click', async () => {
    const { discardCopilotPanel } = await import('./copilotPanel.js');
    discardCopilotPanel();
    banner.remove();
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function offerCopilotResumeToast() {
  const stored = getStoredCopilotSession();
  if (!stored) return;
  showToast(`Retomar investigación de «${stored.productName}» (paso ${stored.currentStepIndex + 1}/${stored.steps.length}).`, 'info');
}

export function renderDashboardStats() {
  const portfolioCount = state.portfolio.length;
  const cacheCount = listCacheEntries().length;

  let lastName = '—';
  let lastDate = 'Aún no has investigado';
  const recent = getRecentResearchItems(1);
  if (recent.length > 0) {
    lastName = recent[0].name;
    lastDate = recent[0].savedAt || 'Reciente';
  }

  const avgScore = portfolioCount > 0
    ? Math.round(
        state.portfolio.reduce((sum, p) => {
          const score = p.fullReport?.productScore || calculateProductScore(p.fullReport);
          return sum + score;
        }, 0) / portfolioCount
      )
    : null;

  const el = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };

  el('metric-portfolio-count', String(portfolioCount));
  el('metric-cache-count', String(cacheCount));
  el('metric-last-product', lastName);
  el('metric-last-date', lastDate);
  el('metric-avg-score', avgScore !== null ? `${avgScore}/100` : '—');
  el(
    'metric-avg-score-sub',
    avgScore !== null ? 'Promedio de productos guardados' : 'Guarda reportes en tu portafolio'
  );
}

export function renderResearchFeed() {
  const feed = document.getElementById('research-feed');
  if (!feed) return;

  renderCopilotResumeBanner();

  const items = getRecentResearchItems(6);

  if (items.length === 0) {
    feed.innerHTML = `
      <div class="empty-portfolio research-feed-empty">
        <i data-lucide="search" class="empty-icon"></i>
        <h3>Sin investigaciones todavía</h3>
        <p>Este bloque es tu historial (no trending). Ejecuta Modo Copiloto, Deep Research, Evaluación manual, o abre <strong>Descubrir</strong> si aún no tienes nombre de producto.</p>
        <div class="research-feed-empty-actions">
          <button type="button" class="btn btn-primary btn-glow" id="research-feed-cta">
            <i data-lucide="zap"></i> Ir al buscador
          </button>
          <button type="button" class="btn btn-secondary" id="research-feed-discover-cta">
            <i data-lucide="compass"></i> Abrir Descubrir
          </button>
          <button type="button" class="btn btn-secondary hidden" id="wizard-feed-cta">
            <i data-lucide="rocket"></i> Configurar primer producto
          </button>
        </div>
      </div>
    `;
    document.getElementById('research-feed-cta')?.addEventListener('click', () => {
      document.getElementById('search-input')?.focus();
      document.getElementById('search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.getElementById('research-feed-discover-cta')?.addEventListener('click', async () => {
      const { switchView } = await import('./navigation.js');
      switchView('discover-view');
      document.getElementById('discover-problem-input')?.focus();
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
    updateWizardVisibility();
    return;
  }

  feed.innerHTML = '';
  feed.className = 'products-grid';

  items.forEach(({ name, report, savedAt, source }) => {
    const score = report?.productScore || calculateProductScore(report);
    let scoreColor = 'var(--accent-emerald)';
    if (score < 50) scoreColor = 'var(--accent-red)';
    else if (score < 75) scoreColor = 'var(--accent-amber)';

    const sourceLabel = source === 'portfolio' ? 'Portafolio' : 'Caché (24h)';
    const sourceBadge = report?._source === 'copilot' ? ' · Copiloto' : report?._source === 'manual' ? ' · Manual' : '';

    const isDraft = report?._isDraft;
    const modeLabel = report?._researchMode === 'fast' ? ' · Rápido' : '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-card-badge">${e(sourceLabel)}${e(sourceBadge)}${isDraft ? ' · Borrador' : ''}${e(modeLabel)}</div>
      <div class="product-card-body">
        <span class="product-card-category">${e(report?.categoryId?.toUpperCase() || 'INVESTIGACIÓN')}</span>
        <h3 class="product-card-title">${e(name)}</h3>
        <div class="card-stats-table">
          <div class="stats-row">
            <span class="stats-label">Product Score:</span>
            <span class="stats-val" style="color:${scoreColor}">${score}/100</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Margen estimado:</span>
            <span class="stats-val green">$${(report?.margin ?? 0).toFixed(2)}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Fecha:</span>
            <span class="stats-val">${e(savedAt)}</span>
          </div>
        </div>
        <div class="product-card-footer" style="display:flex; gap:0.5rem; flex-wrap:wrap">
          <button class="btn btn-primary open-report-btn" ${report ? '' : 'disabled'}>
            <i data-lucide="file-text"></i> Reabrir reporte
          </button>
          <button class="btn btn-secondary rerun-research-btn">
            <i data-lucide="refresh-cw"></i> Re-investigar
          </button>
        </div>
      </div>
    `;
    feed.appendChild(card);
    card.querySelector('.open-report-btn')?.setAttribute('data-product-name', name);
    card.querySelector('.rerun-research-btn')?.setAttribute('data-product-name', name);
  });

  feed.querySelectorAll('.open-report-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pName = btn.getAttribute('data-product-name');
      const item = items.find((i) => i.name === pName);
      if (item?.report && !item.report._isDraft) {
        const { openDeepResearchReport } = await import('./report.js');
        openDeepResearchReport(item.report);
      } else if (item?.report?._isDraft) {
        showToast('Este borrador aún no tiene reporte — ejecuta Deep Research.', 'info');
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = pName;
        document.getElementById('search-input')?.focus();
      }
    });
  });

  feed.querySelectorAll('.rerun-research-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { runResearchDirect } = await import('../research/flow.js');
      runResearchDirect(btn.getAttribute('data-product-name'));
    });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
  updateWizardVisibility();
}
