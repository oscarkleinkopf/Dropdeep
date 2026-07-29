import { isAuthConfigured, isAuthenticated, onAuthStateChange } from '../auth/auth.js';
import { openAuthModal } from './authModal.js';

/** When Supabase is configured, lock the app until the user signs in. */
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

  const refresh = () => updateAuthGate(gate, app);
  onAuthStateChange(refresh);
  refresh();
}

export function updateAuthGate(gateEl, appEl) {
  const gate = gateEl || document.getElementById('auth-gate');
  const app = appEl || document.getElementById('app-shell') || document.querySelector('.app-container');
  if (!gate) return;

  // No Supabase → open platform (demo / local without accounts)
  if (!isAuthConfigured) {
    gate.classList.add('hidden');
    app?.classList.remove('app-locked');
    document.body.classList.remove('auth-locked');
    return;
  }

  const unlocked = isAuthenticated();
  gate.classList.toggle('hidden', unlocked);
  app?.classList.toggle('app-locked', !unlocked);
  document.body.classList.toggle('auth-locked', !unlocked);

  if (!unlocked) {
    lucide.createIcons();
  }
}

export function isPlatformLocked() {
  return isAuthConfigured && !isAuthenticated();
}
