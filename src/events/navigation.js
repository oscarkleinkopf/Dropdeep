import { switchView } from '../ui/navigation.js';
import { runResearchDirect, runManualEvaluationFlow } from '../research/flow.js';
import { switchReportTab } from '../ui/report.js';

export function bindNavigationEvents() {
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      switchView(target);
    });
  });

  document.getElementById('logo-btn').addEventListener('click', () => {
    switchView('dashboard-view');
  });

  document.getElementById('empty-portfolio-cta')?.addEventListener('click', () => {
    switchView('dashboard-view');
    document.getElementById('search-input')?.focus();
  });

  document.getElementById('open-discover-from-home')?.addEventListener('click', () => {
    switchView('discover-view');
    document.getElementById('discover-url-input')?.focus();
  });

  document.getElementById('spy-empty-dashboard-cta')?.addEventListener('click', () => {
    switchView('dashboard-view');
  });

  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    const competitorUrl = document.getElementById('competitor-input')
      ? document.getElementById('competitor-input').value.trim()
      : '';
    if (query) {
      runResearchDirect(query, competitorUrl);
    }
  });

  document.getElementById('manual-eval-cta-btn')?.addEventListener('click', () => {
    const query = document.getElementById('search-input')?.value.trim() || '';
    runManualEvaluationFlow(query);
  });

  document.querySelectorAll('.suggestion-tag').forEach((tag) => {
    tag.addEventListener('click', (e) => {
      if (e.currentTarget.id === 'open-discover-from-home') return;
      const query = e.currentTarget.textContent.trim();
      document.getElementById('search-input').value = query;
      const competitorUrl = document.getElementById('competitor-input')
        ? document.getElementById('competitor-input').value.trim()
        : '';
      runResearchDirect(query, competitorUrl);
    });
  });

  document.getElementById('close-report-btn').addEventListener('click', () => {
    switchView('dashboard-view');
  });

  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.sidebar-tab-btn');
    if (tabBtn) {
      const targetSection = tabBtn.getAttribute('data-section');
      switchReportTab(targetSection);
    }
  });
}
