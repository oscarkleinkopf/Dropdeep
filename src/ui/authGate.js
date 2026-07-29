import { isAuthConfigured, isAuthenticated, onAuthStateChange } from '../auth/auth.js';
import { openAuthModal } from './authModal.js';
import { FREE_PROXY_DAILY_LIMIT } from '../config/freeTier.js';

const SYNC_CTA_DISMISS_KEY = 'dropdeep_sync_cta_dismissed';

/** Soft sync CTA — never locks Prompt Hub, portafolio local, or navegación. */
export function initAuthGate() {
  const gate = document.getElementById('auth-gate');
  const app = document.getElementById('app-shell') || document.querySelector('.app-container');
  if (!gate) return;

  document.getElementById('auth-gate-login-btn')?.addEventListener('click', () => {
    openAuthModal('login');
  });
  document.getElementById('auth-gate-signup-btn')?.addEventListener('click', () => {
    openAuthModal('signup');
  });
  document.getElementById('auth-gate-continue-btn')?.addEventListener('click', () => {
    localStorage.setItem(SYNC_CTA_DISMISS_KEY, 'true');
    updateAuthGate(gate, app);
  });
  document.getElementById('auth-gate-dismiss-btn')?.addEventListener('click', () => {
    localStorage.setItem(SYNC_CTA_DISMISS_KEY, 'true');
    updateAuthGate(gate, app);
  });

  const refresh = () => updateAuthGate(gate, app);
  onAuthStateChange(refresh);
  refresh();
}

export function updateAuthGate(gateEl, appEl) {
  const gate = gateEl || document.getElementById('auth-gate');
  const app = appEl || document.getElementById('app-shell') || document.querySelector('.app-container');
  if (!gate) return;

  // Tier operativo gratis: app siempre desbloqueada
  gate.classList.add('auth-gate--banner');
  app?.classList.remove('app-locked');
  document.body.classList.remove('auth-locked');

  const showSyncCta =
    isAuthConfigured &&
    !isAuthenticated() &&
    localStorage.getItem(SYNC_CTA_DISMISS_KEY) !== 'true';

  gate.classList.toggle('hidden', !showSyncCta);
  document.body.classList.toggle('sync-cta-visible', showSyncCta);

  const footnote = document.getElementById('auth-gate-footnote');
  if (footnote && showSyncCta) {
    footnote.textContent =
      `Con cuenta: sincroniza portafolio en la nube y ${FREE_PROXY_DAILY_LIMIT} créditos diarios de proxy Gemini (starter). BYOK funciona sin cuenta.`;
  }

  if (showSyncCta && typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/** @deprecated App is never platform-locked in free tier mode. */
export function isPlatformLocked() {
  return false;
}
