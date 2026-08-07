import { state } from '../state.js';

/** Badge del nav — módulo liviano para no arrastrar portfolio.js al entry (T52). */
export function updatePortfolioBadge() {
  const badge = document.getElementById('portfolio-count');
  if (!badge) return;
  if (state.portfolio.length > 0) {
    badge.textContent = state.portfolio.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}
