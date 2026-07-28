import { state } from '../state.js';
import { renderPortfolioList } from './portfolio.js';
import { renderMetaHiddenInterests } from './spy.js';

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

  // View specific setups
  if (viewId === 'portfolio-view') {
    renderPortfolioList();
  } else if (viewId === 'spy-intelligence-view') {
    renderMetaHiddenInterests();
  }
}
