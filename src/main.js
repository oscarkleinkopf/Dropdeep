import { refreshIcons } from './utils/icons.js';
import { renderDashboardStats, renderResearchFeed, offerCopilotResumeToast } from './ui/feed.js';
import { updatePortfolioBadge } from './ui/portfolioBadge.js';
import { setupEventListeners } from './events.js';
import { initAuth, onAuthStateChange, isAuthenticated } from './auth/auth.js';
import { initAuthModal } from './ui/authModal.js';
import { initUserMenu, initAuthBanner } from './ui/userMenu.js';
import { initAuthGate } from './ui/authGate.js';
import { initOnboarding } from './ui/onboarding.js';
import { initFirstProductWizard, updateWizardVisibility } from './ui/firstProductWizard.js';
import { initResearchModeToggle } from './config/researchMode.js';
import { initResearchPathToggle } from './config/researchPath.js';
import { syncProfileFromServer } from './auth/profile.js';
import { syncResearchHistoryOnLoad } from './research/historySync.js';

let appBootstrapped = false;

/** T52 — paneles / vistas pesadas tras el primer paint */
async function initDeferredPanels() {
  const [
    { initCopilotPanel },
    { initManualEvaluation },
    { initDiscover },
    { initPortfolioLimitModal },
  ] = await Promise.all([
    import('./ui/copilotPanel.js'),
    import('./ui/manualEvaluation.js'),
    import('./ui/discover.js'),
    import('./ui/portfolio.js'),
  ]);
  initCopilotPanel();
  initManualEvaluation();
  initDiscover();
  initPortfolioLimitModal();
}

async function bootstrapAppShell() {
  if (appBootstrapped) return;
  appBootstrapped = true;
  await syncResearchHistoryOnLoad().catch(() => { /* offline */ });
  renderDashboardStats();
  renderResearchFeed();
  offerCopilotResumeToast();
  updatePortfolioBadge();
  updateWizardVisibility();
  setupEventListeners();
  refreshIcons();
  // No bloquear el shell: hidratar paneles diferidos en idle
  const schedule =
    typeof requestIdleCallback === 'function'
      ? (fn) => requestIdleCallback(() => { fn(); }, { timeout: 2000 })
      : (fn) => setTimeout(fn, 0);
  schedule(() => {
    initDeferredPanels().catch((err) => console.error('Deferred UI init failed', err));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  initAuthBanner();
  initAuthModal();
  initUserMenu();
  initAuthGate();
  initOnboarding();
  initFirstProductWizard();
  initResearchModeToggle();
  initResearchPathToggle();

  if (isAuthenticated()) {
    await syncProfileFromServer();
  }

  onAuthStateChange(async (session) => {
    if (session?.user) {
      await syncProfileFromServer();
    }
    appBootstrapped = false;
    await bootstrapAppShell();
  });

  refreshIcons();
  await bootstrapAppShell();
});

if ('serviceWorker' in navigator) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(() => { /* SW registration failure is non-fatal */ });
    });
  }
}
