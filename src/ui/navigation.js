import { state } from '../state.js';
import { showToast } from '../utils/toast.js';

/**
 * T52 — carga diferida de módulos de vista pesados.
 * Cambia de sección de inmediato; hidrata datos al resolver el chunk.
 */
const NAV_VIEW_MAP = {
  'dashboard-view': 'nav-dashboard',
  'discover-view': 'nav-discover',
  'portfolio-view': 'nav-portfolio',
  'prompt-hub-view': 'nav-prompts',
  'spy-intelligence-view': 'nav-spy',
};

export async function switchView(viewId) {
  state.activeView = viewId;

  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.remove('active');
  });

  const targetSec = document.getElementById(viewId);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
  const navId = NAV_VIEW_MAP[viewId];
  if (navId) {
    document.getElementById(navId)?.classList.add('active');
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  try {
    if (viewId === 'dashboard-view') {
      const { renderDashboardStats, renderResearchFeed } = await import('./feed.js');
      renderDashboardStats();
      renderResearchFeed();
    } else if (viewId === 'discover-view') {
      const { renderDiscover } = await import('./discover.js');
      renderDiscover();
    } else if (viewId === 'portfolio-view') {
      const { renderPortfolioList } = await import('./portfolio.js');
      renderPortfolioList();
    } else if (viewId === 'spy-intelligence-view') {
      const { renderMetaHiddenInterests } = await import('./spy.js');
      renderMetaHiddenInterests();
    } else if (viewId === 'prompt-hub-view') {
      const { renderPromptHubOutput, setPromptHubMode } = await import('./promptHub.js');
      renderPromptHubOutput({ prefill: true, useReport: true });
      setPromptHubMode(state.currentReport?.name ? 'master' : 'packs');
    }
  } catch (err) {
    console.error('switchView lazy load failed', viewId, err);
    showToast('No se pudo cargar esta vista. Reintenta.', 'error');
  }
}
