import { renderAutomatedFeed, runTrendScannerSimulation } from './ui/feed.js';
import { updatePortfolioBadge } from './ui/portfolio.js';
import { setupEventListeners } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderAutomatedFeed();
  updatePortfolioBadge();
  setupEventListeners();
  runTrendScannerSimulation();
});
