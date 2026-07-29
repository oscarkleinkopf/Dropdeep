import { showToast } from '../utils/toast.js';

const STORAGE_KEY = 'dropdeep_gemini_key';
const DISMISS_KEY = 'dropdeep_gemini_banner_dismissed';

export function hasGeminiKey() {
  return Boolean(localStorage.getItem(STORAGE_KEY)?.trim());
}

export function openSettingsModal() {
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.classList.remove('hidden');
    document.getElementById('gemini-key-input')?.focus();
  }
}

export function updateGeminiKeyBanner() {
  const banner = document.getElementById('gemini-key-banner');
  if (!banner) return;

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
  if (hasGeminiKey()) return true;

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
}
