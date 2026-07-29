import { getCurrentUserId, isAuthenticated, isAuthConfigured, onAuthStateChange } from '../auth/auth.js';
import { hasGeminiKey } from '../utils/geminiStorage.js';
import { isGeminiProxyEnabled } from '../research/geminiProxy.js';
import { openSettingsModal } from './geminiKeyBanner.js';

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

export function markFirstResearchDone() {
  localStorage.setItem(`${storageKey()}_research`, 'true');
  updateOnboardingPanel();
}

function hasCompletedFirstResearch() {
  return localStorage.getItem(`${storageKey()}_research`) === 'true';
}

function shouldShowOnboarding() {
  if (isOnboardingDismissed()) return false;
  if (isAuthConfigured && !isAuthenticated()) return false;
  if (isGeminiProxyEnabled()) return false;
  const geminiDone = hasGeminiKey();
  const researchDone = hasCompletedFirstResearch();
  if (geminiDone && researchDone) return false;
  return true;
}

function renderSteps(panel) {
  const accountDone = isAuthenticated() || !isAuthConfigured;
  const geminiDone = isGeminiProxyEnabled() || hasGeminiKey();
  const researchDone = hasCompletedFirstResearch();

  const steps = [
    {
      id: 'account',
      label: 'Cuenta lista',
      done: accountDone,
      action: null,
    },
    {
      id: 'gemini',
      label: 'Configurar API Gemini',
      done: geminiDone,
      action: 'settings',
      cta: 'Abrir Ajustes',
    },
    {
      id: 'research',
      label: 'Lanzar tu primer Deep Research',
      done: researchDone,
      action: 'search',
      cta: 'Ir al buscador',
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
        openSettingsModal();
      } else if (action === 'search') {
        document.getElementById('search-input')?.focus();
        document.getElementById('search-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
