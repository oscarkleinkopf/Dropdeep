import {
  hasGeminiKey,
  getGeminiKey,
  getGeminiModel,
  getGeminiLanguage,
  isGeminiGroundingEnabled,
  saveGeminiSettings,
  setGeminiPref
} from '../utils/geminiStorage.js';
import { showToast } from '../utils/toast.js';
import { isAuthConfigured, isAuthenticated } from '../auth/auth.js';
import { openAuthModal } from './authModal.js';
import { isGeminiProxyEnabled } from '../research/geminiProxy.js';
import { updateOnboardingPanel } from './onboarding.js';

const DISMISS_KEY = 'dropdeep_gemini_banner_dismissed';

export { hasGeminiKey };

export function openSettingsModal() {
  if (isAuthConfigured && !isAuthenticated()) {
    openAuthModal('login');
    showToast('Inicia sesión para acceder a Ajustes.', 'info');
    return;
  }
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.classList.remove('hidden');
    document.getElementById('gemini-key-input')?.focus();
  }
}

export function updateGeminiKeyBanner() {
  const banner = document.getElementById('gemini-key-banner');
  if (!banner) return;

  if (isGeminiProxyEnabled()) {
    banner.classList.add('hidden');
    return;
  }

  const shouldShow = !hasGeminiKey() && localStorage.getItem(DISMISS_KEY) !== 'true';
  banner.classList.toggle('hidden', !shouldShow);
}

export function initGeminiKeyBanner(onSimulateClick) {
  const banner = document.getElementById('gemini-key-banner');
  if (!banner) return;

  document.getElementById('gemini-banner-settings-btn')?.addEventListener('click', openSettingsModal);

  document.getElementById('gemini-banner-sim-btn')?.addEventListener('click', () => {
    if (onSimulateClick) onSimulateClick();
  });

  document.getElementById('gemini-banner-dismiss-btn')?.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem(DISMISS_KEY, 'true');
  });

  updateGeminiKeyBanner();
}

/** Toast + banner when an API flow needs a Gemini key. Returns false if no key. */
export function requireGeminiKey(message) {
  if (isGeminiProxyEnabled() || hasGeminiKey()) return true;

  updateGeminiKeyBanner();

  const banner = document.getElementById('gemini-key-banner');
  if (banner) {
    banner.classList.remove('hidden');
    localStorage.removeItem(DISMISS_KEY);
    banner.classList.add('gemini-key-banner--highlight');
    setTimeout(() => banner.classList.remove('gemini-key-banner--highlight'), 2000);
  }

  showToast(
    message || 'Configura tu clave API de Gemini en Ajustes para usar investigación en vivo.',
    'info'
  );

  return false;
}

export function onGeminiKeySaved() {
  localStorage.removeItem(DISMISS_KEY);
  updateGeminiKeyBanner();
  updateOnboardingPanel();
}

/** Load stored prefs into the settings form. */
export function populateSettingsForm() {
  const geminiKeyInput = document.getElementById('gemini-key-input');
  const geminiModelSelect = document.getElementById('gemini-model-select');
  const geminiGroundingInput = document.getElementById('gemini-grounding-input');
  const geminiLanguageSelect = document.getElementById('gemini-language-select');

  const storedKey = getGeminiKey();
  if (storedKey && geminiKeyInput) {
    geminiKeyInput.value = storedKey;
  }
  if (geminiModelSelect) geminiModelSelect.value = getGeminiModel();
  if (geminiGroundingInput) geminiGroundingInput.checked = isGeminiGroundingEnabled();
  if (geminiLanguageSelect) geminiLanguageSelect.value = getGeminiLanguage();

  const keyHint = document.getElementById('gemini-key-hint');
  if (keyHint) {
    keyHint.textContent = isGeminiProxyEnabled()
      ? 'Proxy activo: la clave en servidor se usa al estar logueado. Puedes guardar solo preferencias (modelo/idioma).'
      : 'Tu clave se guarda solo en este navegador (localStorage), asociada a tu cuenta si iniciaste sesión.';
  }
  if (geminiKeyInput) {
    geminiKeyInput.required = !isGeminiProxyEnabled();
    geminiKeyInput.placeholder = isGeminiProxyEnabled() ? 'Opcional con proxy activo' : 'AIzaSy...';
  }
}

/** Persist settings form values (never logs the key). */
export function saveSettingsFromForm() {
  const key = document.getElementById('gemini-key-input')?.value.trim();
  const model = document.getElementById('gemini-model-select')?.value;
  const grounding = document.getElementById('gemini-grounding-input')?.checked ?? true;
  const lang = document.getElementById('gemini-language-select')?.value || 'es';

  const proxy = isGeminiProxyEnabled();
  if (!key && !proxy) return false;

  if (key) {
    saveGeminiSettings({ key, model, grounding, language: lang });
  } else {
    setGeminiPref('model', model);
    setGeminiPref('grounding', grounding ? 'true' : 'false');
    setGeminiPref('language', lang);
  }
  return { lang, model, grounding };
}
