import { state } from '../state.js';
import { renderPortfolioList } from './portfolio.js';
import { renderMetaHiddenInterests } from './spy.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';
import { renderPromptHubOutput, setPromptHubMode } from './promptHub.js';

const NAV_VIEW_MAP = {
  'dashboard-view': 'nav-dashboard',
  'portfolio-view': 'nav-portfolio',
  'prompt-hub-view': 'nav-prompts',
  'spy-intelligence-view': 'nav-spy',
};

export function switchView(viewId) {
  state.activeView = viewId;
  
  // Hide all sections, show target
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });
  
  const targetSec = document.getElementById(viewId);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navId = NAV_VIEW_MAP[viewId];
  if (navId) {
    document.getElementById(navId)?.classList.add('active');
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // View specific setups
  if (viewId === 'dashboard-view') {
    renderDashboardStats();
    renderResearchFeed();
  } else if (viewId === 'portfolio-view') {
    renderPortfolioList();
  } else if (viewId === 'spy-intelligence-view') {
    renderMetaHiddenInterests();
  } else if (viewId === 'prompt-hub-view') {
    renderPromptHubOutput({ prefill: true, useReport: true });
    setPromptHubMode(state.currentReport?.name ? 'master' : 'packs');
  }
}
