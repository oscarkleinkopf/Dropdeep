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
import { escapeHtml } from '../utils/sanitize.js';
import { isGeminiProxyEnabled, refreshProxyUsageUI } from '../research/geminiProxy.js';
import { getGeminiRoute } from '../config/geminiRoute.js';
import { testGeminiConnection } from '../research/testGeminiConnection.js';
import { updateOnboardingPanel } from './onboarding.js';
import { bindModalA11y } from '../utils/modalA11y.js';

const DISMISS_KEY = 'dropdeep_gemini_banner_dismissed';

export { hasGeminiKey };

let releaseSettingsA11y = null;
let connectionTestBound = false;

function setConnectionStatus(kind, message) {
  const el = document.getElementById('gemini-connection-status');
  if (!el) return;
  if (!kind) {
    el.innerHTML = '';
    return;
  }
  const safe = escapeHtml(message);
  if (kind === 'ok') {
    el.innerHTML = `<span class="gemini-connection-badge gemini-connection-badge--ok"><i data-lucide="check-circle" style="width:14px;height:14px"></i> ${safe}</span>`;
  } else if (kind === 'pending') {
    el.innerHTML = `<span class="gemini-connection-badge gemini-connection-badge--pending">${safe}</span>`;
  } else {
    el.innerHTML = `<span class="gemini-connection-badge gemini-connection-badge--error">${safe}</span>`;
  }
  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

function bindGeminiConnectionTest() {
  if (connectionTestBound) return;
  const btn = document.getElementById('gemini-test-connection-btn');
  if (!btn) return;
  connectionTestBound = true;

  btn.addEventListener('click', async () => {
    const key = document.getElementById('gemini-key-input')?.value.trim() || '';
    const model = document.getElementById('gemini-model-select')?.value || getGeminiModel();
    setConnectionStatus('pending', 'Probando conexión…');
    btn.disabled = true;
    try {
      const result = await testGeminiConnection(key, model);
      if (result.ok && result.status === 200) {
        setConnectionStatus('ok', 'Conexión válida');
      } else {
        setConnectionStatus('error', result.message || 'Clave inválida o error de conexión.');
      }
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('gemini-key-input')?.addEventListener('input', () => {
    setConnectionStatus('', '');
  });
}

export function openSettingsModal() {
  const settingsModal = document.getElementById('settings-modal');
  if (!settingsModal) return;
  settingsModal.classList.remove('hidden');
  setConnectionStatus('', '');
  releaseSettingsA11y?.();
  releaseSettingsA11y = bindModalA11y(settingsModal, {
    onClose: closeSettingsModal,
    initialFocus: '#gemini-key-input',
    label: 'Configuración de API',
  });
}

export function closeSettingsModal() {
  releaseSettingsA11y?.();
  releaseSettingsA11y = null;
  document.getElementById('settings-modal')?.classList.add('hidden');
}

export function updateGeminiKeyBanner() {
  const banner = document.getElementById('gemini-key-banner');
  if (!banner) return;

  if (isGeminiProxyEnabled() && !hasGeminiKey()) {
    banner.classList.add('hidden');
    return;
  }

  const shouldShow = !hasGeminiKey() && localStorage.getItem(DISMISS_KEY) !== 'true';
  banner.classList.toggle('hidden', !shouldShow);
}

export function initGeminiKeyBanner() {
  bindGeminiConnectionTest();

  const banner = document.getElementById('gemini-key-banner');
  if (!banner) return;

  document.getElementById('gemini-banner-settings-btn')?.addEventListener('click', openSettingsModal);

  document.getElementById('gemini-banner-dismiss-btn')?.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem(DISMISS_KEY, 'true');
  });

  updateGeminiKeyBanner();
}

/** Toast + banner when an API flow needs a Gemini key. Returns false if no key. */
export function requireGeminiKey(message) {
  if (getGeminiRoute() !== 'none') return true;

  updateGeminiKeyBanner();

  const banner = document.getElementById('gemini-key-banner');
  if (banner) {
    banner.classList.remove('hidden');
    localStorage.removeItem(DISMISS_KEY);
    banner.classList.add('gemini-key-banner--highlight');
    setTimeout(() => banner.classList.remove('gemini-key-banner--highlight'), 2000);
  }

  showToast(
    message ||
      'Deep Research automático requiere clave Gemini o proxy. Usa Modo Copiloto (gratis) o configura BYOK en Ajustes.',
    'info'
  );

  return false;
}

export function onGeminiKeySaved() {
  localStorage.removeItem(DISMISS_KEY);
  updateGeminiKeyBanner();
  updateOnboardingPanel();
  refreshProxyUsageUI();
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
    if (hasGeminiKey()) {
      keyHint.textContent =
        'Con clave personal se usa BYOK (directo a Google). Sin clave y con cuenta se usa el proxy (cuota diaria).';
    } else if (isGeminiProxyEnabled()) {
      keyHint.textContent =
        'Sin clave guardada: con sesión activa se usa el proxy (cuota diaria). Guarda tu clave para usar BYOK.';
    } else {
      keyHint.textContent =
        'Tu clave se guarda solo en este navegador (localStorage), asociada a tu cuenta si iniciaste sesión.';
    }
  }
  if (geminiKeyInput) {
    geminiKeyInput.required = getGeminiRoute() === 'none' && !isGeminiProxyEnabled();
    geminiKeyInput.placeholder = isGeminiProxyEnabled() ? 'Opcional — prioriza BYOK si la guardas' : 'AIzaSy...';
  }
}

/** Persist settings form values (never logs the key). */
export function saveSettingsFromForm() {
  const key = document.getElementById('gemini-key-input')?.value.trim();
  const model = document.getElementById('gemini-model-select')?.value;
  const grounding = document.getElementById('gemini-grounding-input')?.checked ?? true;
  const lang = document.getElementById('gemini-language-select')?.value || 'es';

  if (!key && getGeminiRoute() === 'none') return false;

  if (key) {
    saveGeminiSettings({ key, model, grounding, language: lang });
  } else {
    setGeminiPref('model', model);
    setGeminiPref('grounding', grounding ? 'true' : 'false');
    setGeminiPref('language', lang);
  }
  return { lang, model, grounding };
}
