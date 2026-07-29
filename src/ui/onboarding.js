import { getCurrentUserId, isAuthenticated, isAuthConfigured, onAuthStateChange } from '../auth/auth.js';
import { hasGeminiKey } from '../utils/geminiStorage.js';
import { isGeminiProxyEnabled, isGeminiProxyConfigured } from '../research/geminiProxy.js';
import { openSettingsModal } from './geminiKeyBanner.js';
import { state } from '../state.js';
import { switchView } from './navigation.js';
import { openAuthModal } from './authModal.js';

const STORAGE_PREFIX = 'dropdeep_onboarding_done_';

function storageKey() {
  const uid = getCurrentUserId();
  return uid ? `${STORAGE_PREFIX}${uid}` : `${STORAGE_PREFIX}anonymous`;
}

export function isOnboardingDismissed() {
  return localStorage.getItem(storageKey()) === 'true';
}

export function dismissOnboarding() {
  localStorage.setItem(storageKey(), 'true');
  updateOnboardingPanel();
}

export function markPromptHubDone() {
  localStorage.setItem(`${storageKey()}_prompts`, 'true');
  updateOnboardingPanel();
}

export function markFirstResearchDone() {
  localStorage.setItem(`${storageKey()}_research`, 'true');
  updateOnboardingPanel();
}

export function markPortfolioSaveDone() {
  localStorage.setItem(`${storageKey()}_saved`, 'true');
  updateOnboardingPanel();
}

function hasUsedPromptHub() {
  return localStorage.getItem(`${storageKey()}_prompts`) === 'true';
}

function hasCompletedFirstResearch() {
  return localStorage.getItem(`${storageKey()}_research`) === 'true';
}

function hasSavedToPortfolio() {
  return localStorage.getItem(`${storageKey()}_saved`) === 'true' || state.portfolio.length > 0;
}

function shouldShowOnboarding() {
  if (isOnboardingDismissed()) return false;
  const promptsDone = hasUsedPromptHub();
  const geminiDone = isGeminiProxyEnabled() || hasGeminiKey();
  const researchDone = hasCompletedFirstResearch();
  const saveDone = hasSavedToPortfolio();
  if (promptsDone && geminiDone && researchDone && saveDone) return false;
  return true;
}

function renderSteps(panel) {
  const promptsDone = hasUsedPromptHub();
  const geminiDone = isGeminiProxyEnabled() || hasGeminiKey();
  const researchDone = hasCompletedFirstResearch();
  const saveDone = hasSavedToPortfolio();

  const geminiLabel = isGeminiProxyConfigured()
    ? (geminiDone
      ? 'Gemini listo (proxy o BYOK)'
      : 'Opcional: BYOK gratis o créditos proxy con cuenta')
    : 'Opcional: pegar clave Gemini (BYOK gratis)';

  const steps = [
    {
      id: 'prompts',
      label: 'Prompt Hub → copiar prompts (sin API, ~60 s)',
      done: promptsDone,
      action: promptsDone ? null : 'prompts',
      cta: 'Ir a Prompts',
    },
    {
      id: 'gemini',
      label: geminiLabel,
      done: geminiDone,
      action: geminiDone ? null : 'settings',
      cta: isGeminiProxyConfigured() && !isAuthenticated() ? 'Iniciar sesión' : 'Abrir Ajustes',
    },
    {
      id: 'research',
      label: 'Lanzar Deep Research (BYOK o proxy)',
      done: researchDone,
      action: researchDone ? null : 'search',
      cta: 'Ir al buscador',
    },
    {
      id: 'save',
      label: 'Guardar reporte en portafolio local',
      done: saveDone,
      action: saveDone ? null : 'portfolio',
      cta: 'Ir al portafolio',
    },
  ];

  const list = panel.querySelector('.onboarding-steps');
  if (!list) return;
  list.innerHTML = steps
    .map(
      (step) => `
    <li class="onboarding-step ${step.done ? 'onboarding-step--done' : ''}" data-step="${step.id}">
      <span class="onboarding-step-check" aria-hidden="true">${step.done ? '✓' : '○'}</span>
      <span class="onboarding-step-label">${step.label}</span>
      ${
        !step.done && step.action
          ? `<button type="button" class="onboarding-step-cta" data-action="${step.action}">${step.cta}</button>`
          : ''
      }
    </li>`
    )
    .join('');

  list.querySelectorAll('.onboarding-step-cta').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'settings') {
        if (isGeminiProxyConfigured() && !isAuthenticated()) {
          openAuthModal('login');
        } else {
          openSettingsModal();
        }
      } else if (action === 'prompts') {
        switchView('prompt-hub-view');
        markPromptHubDone();
      } else if (action === 'search') {
        document.getElementById('search-input')?.focus();
        document.getElementById('search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (action === 'portfolio') {
        switchView('portfolio-view');
      }
    });
  });
}

export function updateOnboardingPanel() {
  const panel = document.getElementById('onboarding-panel');
  if (!panel) return;

  const show = shouldShowOnboarding();
  panel.classList.toggle('hidden', !show);

  if (show) {
    renderSteps(panel);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

export function initOnboarding() {
  const panel = document.getElementById('onboarding-panel');
  if (!panel) return;

  document.getElementById('onboarding-dismiss-btn')?.addEventListener('click', dismissOnboarding);

  onAuthStateChange(() => updateOnboardingPanel());
  updateOnboardingPanel();
}
