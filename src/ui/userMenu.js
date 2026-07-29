import {
  isAuthConfigured,
  isAuthenticated,
  getCurrentUser,
  signOut,
  onAuthStateChange
} from '../auth/auth.js';
import { openAuthModal } from './authModal.js';
import { showToast } from '../utils/toast.js';

export function initUserMenu() {
  const loginBtn = document.getElementById('auth-login-btn');
  const menu = document.getElementById('user-menu');
  const emailEl = document.getElementById('user-menu-email');
  const logoutBtn = document.getElementById('auth-logout-btn');
  const settingsBtn = document.getElementById('settings-btn');

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

  onAuthStateChange(() => updateUserMenuUI());
  updateUserMenuUI();
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
    return;
  }

  const user = getCurrentUser();
  if (user) {
    loginBtn.classList.add('hidden');
    menu.classList.remove('hidden');
    if (emailEl) emailEl.textContent = user.email || 'Usuario';
    settingsBtn?.setAttribute('title', 'Ajustes — clave API Gemini');
  } else {
    loginBtn.classList.remove('hidden');
    menu.classList.add('hidden');
    settingsBtn?.setAttribute('title', 'Ajustes — clave API Gemini (BYOK sin cuenta)');
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
