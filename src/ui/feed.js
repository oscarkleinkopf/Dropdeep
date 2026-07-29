import { state } from '../state.js';
import { listCacheEntries } from '../research/cache.js';
import { runDeepResearchSequence } from '../research/flow.js';
import { openDeepResearchReport } from './report.js';
import { calculateProductScore } from '../research/scoring.js';
import { showToast } from '../utils/toast.js';
import { updateWizardVisibility } from './firstProductWizard.js';

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

  const items = getRecentResearchItems(6);

  if (items.length === 0) {
    feed.innerHTML = `
      <div class="empty-portfolio research-feed-empty">
        <i data-lucide="search" class="empty-icon"></i>
        <h3>Sin investigaciones todavía</h3>
        <p>Ejecuta Deep Research con tu clave Gemini para generar reportes reales. Los resultados aparecerán aquí y en tu portafolio.</p>
        <div class="research-feed-empty-actions">
          <button type="button" class="btn btn-primary btn-glow" id="research-feed-cta">
            <i data-lucide="zap"></i> Ir al buscador
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

    const isDraft = report?._isDraft;
    const modeLabel = report?._researchMode === 'fast' ? ' · Rápido' : '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-card-badge">${sourceLabel}${isDraft ? ' · Borrador' : ''}${modeLabel}</div>
      <div class="product-card-body">
        <span class="product-card-category">${report?.categoryId?.toUpperCase() || 'INVESTIGACIÓN'}</span>
        <h3 class="product-card-title">${name}</h3>
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
            <span class="stats-val">${savedAt}</span>
          </div>
        </div>
        <div class="product-card-footer" style="display:flex; gap:0.5rem; flex-wrap:wrap">
          <button class="btn btn-primary open-report-btn" data-product-name="${name}" ${report ? '' : 'disabled'}>
            <i data-lucide="file-text"></i> Reabrir reporte
          </button>
          <button class="btn btn-secondary rerun-research-btn" data-product-name="${name}">
            <i data-lucide="refresh-cw"></i> Re-investigar
          </button>
        </div>
      </div>
    `;
    feed.appendChild(card);
  });

  feed.querySelectorAll('.open-report-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pName = btn.getAttribute('data-product-name');
      const item = items.find((i) => i.name === pName);
      if (item?.report && !item.report._isDraft) {
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
    btn.addEventListener('click', () => {
      runDeepResearchSequence(btn.getAttribute('data-product-name'));
    });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
  updateWizardVisibility();
}
