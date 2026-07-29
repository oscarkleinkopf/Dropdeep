import { renderDashboardStats, renderResearchFeed } from './ui/feed.js';
import { updatePortfolioBadge } from './ui/portfolio.js';
import { setupEventListeners } from './events.js';
import { initAuth, onAuthStateChange, isAuthenticated, isAuthConfigured } from './auth/auth.js';
import { initAuthModal } from './ui/authModal.js';
import { initUserMenu, initAuthBanner } from './ui/userMenu.js';
import { initAuthGate } from './ui/authGate.js';
import { initOnboarding } from './ui/onboarding.js';
import { syncProfileFromServer } from './auth/profile.js';

let appBootstrapped = false;

function bootstrapAppShell() {
  if (appBootstrapped) return;
  appBootstrapped = true;
  renderDashboardStats();
  renderResearchFeed();
  updatePortfolioBadge();
  setupEventListeners();
  lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  initAuthBanner();
  initAuthModal();
  initUserMenu();
  initAuthGate();
  initOnboarding();

  if (isAuthenticated()) {
    await syncProfileFromServer();
  }

  onAuthStateChange(async (session) => {
    if (session?.user) {
      await syncProfileFromServer();
      bootstrapAppShell();
    }
  });

  lucide.createIcons();

  if (!isAuthConfigured || isAuthenticated()) {
    bootstrapAppShell();
  }
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
