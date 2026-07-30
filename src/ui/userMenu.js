import {
  isAuthConfigured,
  isAuthenticated,
  getCurrentUser,
  signOut,
  onAuthStateChange
} from '../auth/auth.js';
import { openAuthModal } from './authModal.js';
import { showToast } from '../utils/toast.js';
import {
  PROXY_USAGE_UPDATED_EVENT,
  fetchProxyUsageFromServer,
  getProxyQuotaMenuState,
} from '../research/geminiProxy.js';

export function initUserMenu() {
  const loginBtn = document.getElementById('auth-login-btn');
  const menu = document.getElementById('user-menu');
  const logoutBtn = document.getElementById('auth-logout-btn');

  if (!loginBtn || !menu) return;

  loginBtn.addEventListener('click', () => openAuthModal('login'));
  logoutBtn?.addEventListener('click', async () => {
    try {
      await signOut();
      showToast('Sesión cerrada.', 'success');
      document.getElementById('user-menu-dropdown')?.classList.add('hidden');
    } catch {
      showToast('No se pudo cerrar la sesión.', 'error');
    }
  });

  const trigger = document.getElementById('user-menu-trigger');
  const dropdown = document.getElementById('user-menu-dropdown');
  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('hidden');
    trigger.setAttribute('aria-expanded', dropdown?.classList.contains('hidden') ? 'false' : 'true');
  });
  document.addEventListener('click', () => {
    dropdown?.classList.add('hidden');
    trigger?.setAttribute('aria-expanded', 'false');
  });

  window.addEventListener(PROXY_USAGE_UPDATED_EVENT, () => updateProxyQuotaBadge());

  onAuthStateChange(() => updateUserMenuUI());
  updateUserMenuUI();
}

export function updateProxyQuotaBadge() {
  const badge = document.getElementById('user-menu-proxy-badge');
  const status = document.getElementById('user-menu-proxy-status');
  if (!badge && !status) return;

  const state = getProxyQuotaMenuState();

  if (badge) {
    if (!state) {
      badge.classList.add('hidden');
      badge.textContent = '';
      badge.removeAttribute('title');
    } else {
      badge.classList.remove('hidden');
      badge.textContent = state.label;
      badge.classList.toggle('user-menu-proxy-badge--byok', state.kind === 'byok');
      badge.classList.toggle('user-menu-proxy-badge--exhausted', state.kind === 'exhausted');
      badge.title = state.detail || state.label;
    }
  }

  if (status) {
    if (!state?.detail) {
      status.classList.add('hidden');
      status.textContent = '';
    } else {
      status.classList.remove('hidden');
      status.textContent = state.detail;
    }
  }
}

function updateUserMenuUI() {
  const loginBtn = document.getElementById('auth-login-btn');
  const menu = document.getElementById('user-menu');
  const emailEl = document.getElementById('user-menu-email');
  const settingsBtn = document.getElementById('settings-btn');

  if (!loginBtn || !menu) return;

  if (!isAuthConfigured) {
    loginBtn.classList.add('hidden');
    menu.classList.add('hidden');
    settingsBtn?.removeAttribute('title');
    updateProxyQuotaBadge();
    return;
  }

  const user = getCurrentUser();
  if (user) {
    loginBtn.classList.add('hidden');
    menu.classList.remove('hidden');
    if (emailEl) emailEl.textContent = user.email || 'Usuario';
    settingsBtn?.setAttribute('title', 'Ajustes — clave API Gemini');
    fetchProxyUsageFromServer().finally(() => updateProxyQuotaBadge());
  } else {
    loginBtn.classList.remove('hidden');
    menu.classList.add('hidden');
    settingsBtn?.setAttribute('title', 'Ajustes — clave API Gemini (BYOK sin cuenta)');
    updateProxyQuotaBadge();
  }
  lucide.createIcons();
}

export function initAuthBanner() {
  const banner = document.getElementById('auth-demo-banner');
  if (!banner) return;

  if (isAuthConfigured) {
    banner.classList.add('hidden');
  } else {
    banner.classList.remove('hidden');
  }
}
