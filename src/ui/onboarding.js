import { getCurrentUserId, isAuthenticated, onAuthStateChange } from '../auth/auth.js';
import { isGeminiProxyConfigured } from '../research/geminiProxy.js';
import { openSettingsModal } from './geminiKeyBanner.js';
import { state } from '../state.js';
import { switchView } from './navigation.js';
import { openAuthModal } from './authModal.js';
import { shouldShowWizard } from './firstProductWizard.js';
import { setResearchPath, RESEARCH_PATH_COPILOT } from '../config/researchPath.js';

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
  const researchDone = hasCompletedFirstResearch();
  const saveDone = hasSavedToPortfolio();
  if (promptsDone && researchDone && saveDone) return false;
  return true;
}

/** Prefocus dashboard search with Copiloto path selected (T13). */
export function focusCopilotSearch() {
  setResearchPath(RESEARCH_PATH_COPILOT);
  switchView('dashboard-view');
  const input = document.getElementById('search-input');
  input?.focus();
  input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderSteps(panel) {
  const promptsDone = hasUsedPromptHub();
  const researchDone = hasCompletedFirstResearch();
  const saveDone = hasSavedToPortfolio();

  const steps = [
    {
      id: 'prompts',
      label: 'Pack vertical → copiar → pegar en chatbot gratis (~60 s)',
      done: promptsDone,
      action: promptsDone ? null : 'prompts',
      cta: 'Ir a Prompts',
    },
    {
      id: 'copilot',
      label: 'Modo Copiloto — genera reporte estructurado sin API',
      done: researchDone,
      action: researchDone ? null : 'copilot',
      cta: 'Iniciar Copiloto',
    },
    {
      id: 'manual',
      label: 'Evaluación manual offline (checklist determinístico)',
      done: saveDone,
      action: saveDone ? null : 'manual',
      cta: 'Evaluar producto',
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
        import('./promptHub.js').then(({ setPromptHubMode }) => {
          setPromptHubMode('packs');
        });
        markPromptHubDone();
      } else if (action === 'copilot' || action === 'search') {
        focusCopilotSearch();
      } else if (action === 'manual') {
        document.getElementById('manual-eval-cta-btn')?.click();
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
    const wizardCta = document.getElementById('wizard-onboarding-cta');
    if (wizardCta) wizardCta.classList.toggle('hidden', !shouldShowWizard());
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
