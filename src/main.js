import { renderAutomatedFeed, runTrendScannerSimulation } from './ui/feed.js';
import { updatePortfolioBadge } from './ui/portfolio.js';
import { setupEventListeners } from './events.js';
import { initAuth, onAuthStateChange, isAuthenticated } from './auth/auth.js';
import { initAuthModal } from './ui/authModal.js';
import { initUserMenu, initAuthBanner } from './ui/userMenu.js';
import { syncProfileFromServer } from './auth/profile.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  initAuthBanner();
  initAuthModal();
  initUserMenu();
  if (isAuthenticated()) {
    await syncProfileFromServer();
  }
  onAuthStateChange(async (session) => {
    if (session?.user) {
      await syncProfileFromServer();
    }
  });
  lucide.createIcons();
  renderAutomatedFeed();
  updatePortfolioBadge();
  setupEventListeners();
  runTrendScannerSimulation();
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
