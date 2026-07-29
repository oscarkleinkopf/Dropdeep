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

if ('serviceWorker' in navigator) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('Unregistered service worker for local development');
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.error('PWA Service Worker registration failed:', err));
    });
  }
}
