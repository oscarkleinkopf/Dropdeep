import { getCurrentUserId } from '../auth/auth.js';
import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { switchView } from './navigation.js';
import {
  verticalPacks,
  getVerticalPackById,
  formatPackForCopy,
} from '../data/verticalPacks.js';
import { setPromptHubMode, setActiveVerticalPack } from './promptHub.js';
import { markPromptHubDone, updateOnboardingPanel } from './onboarding.js';
import { FREE_PORTFOLIO_CAP, isPortfolioAtCap } from '../config/freeTier.js';
import { savePortfolioLocal } from '../research/historySync.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';
import { updatePortfolioBadge, renderPortfolioList } from './portfolio.js';
import { runResearchDirect, runCopilotResearch } from '../research/flow.js';
import { setResearchPath, RESEARCH_PATH_COPILOT, RESEARCH_PATH_API } from '../config/researchPath.js';

const STORAGE_PREFIX = 'dropdeep_first_product_wizard_';

function storageKey(suffix = 'done') {
  const uid = getCurrentUserId();
  const base = uid ? `${STORAGE_PREFIX}${uid}` : `${STORAGE_PREFIX}anonymous`;
  return suffix === 'done' ? `${base}_done` : `${base}_dismissed`;
}

export function isWizardCompleted() {
  return localStorage.getItem(storageKey('done')) === 'true';
}

export function isWizardDismissed() {
  return localStorage.getItem(storageKey('dismissed')) === 'true';
}

export function markWizardCompleted() {
  localStorage.setItem(storageKey('done'), 'true');
  updateWizardVisibility();
}

export function dismissWizard() {
  localStorage.setItem(storageKey('dismissed'), 'true');
  updateWizardVisibility();
}

export function shouldShowWizard() {
  if (isWizardCompleted() || isWizardDismissed()) return false;
  return state.portfolio.length === 0;
}

const VERTICAL_TO_CATEGORY = {
  belleza: 'beauty',
  pets: 'pet',
  hogar: 'home',
  fitness: 'health',
  tech: 'tech',
};

let wizardState = {
  step: 1,
  verticalId: verticalPacks[0]?.id ?? 'belleza',
  productName: '',
};

function getModal() {
  return document.getElementById('first-product-wizard');
}

function renderVerticalStep() {
  const grid = document.getElementById('wizard-vertical-grid');
  if (!grid) return;

  grid.innerHTML = verticalPacks
    .map(
      (pack) => `
    <button type="button" class="wizard-vertical-card ${wizardState.verticalId === pack.id ? 'active' : ''}" data-vertical-id="${pack.id}">
      <span class="wizard-vertical-emoji">${pack.emoji}</span>
      <span class="wizard-vertical-name">${pack.name}</span>
    </button>`
    )
    .join('');

  grid.querySelectorAll('.wizard-vertical-card').forEach((card) => {
    card.addEventListener('click', () => {
      wizardState.verticalId = card.getAttribute('data-vertical-id');
      renderVerticalStep();
    });
  });
}

function renderWizardStep() {
  const modal = getModal();
  if (!modal) return;

  modal.querySelectorAll('.wizard-step-panel').forEach((panel) => {
    panel.classList.toggle('hidden', panel.getAttribute('data-wizard-step') !== String(wizardState.step));
  });

  modal.querySelectorAll('.wizard-progress-dot').forEach((dot) => {
    const step = parseInt(dot.getAttribute('data-step'), 10);
    dot.classList.toggle('active', step === wizardState.step);
    dot.classList.toggle('done', step < wizardState.step);
  });

  const backBtn = document.getElementById('wizard-back-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  if (backBtn) backBtn.classList.toggle('hidden', wizardState.step === 1);
  if (nextBtn) {
    nextBtn.textContent = wizardState.step === 3 ? 'Listo' : 'Siguiente';
  }

  if (wizardState.step === 2) {
    const input = document.getElementById('wizard-product-input');
    if (input && !input.dataset.bound) {
      input.dataset.bound = 'true';
      input.addEventListener('input', (e) => {
        wizardState.productName = e.target.value.trim();
      });
    }
    if (input) input.value = wizardState.productName;
  }

  if (wizardState.step === 3) {
    const pack = getVerticalPackById(wizardState.verticalId);
    const summary = document.getElementById('wizard-summary');
    if (summary) {
      summary.innerHTML = `
        <p><strong>Vertical:</strong> ${pack.emoji} ${pack.name}</p>
        <p><strong>Producto:</strong> ${wizardState.productName || '(sin nombre — solo copiar pack)'}</p>
      `;
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function saveDraftToPortfolio() {
  const name = wizardState.productName.trim();
  if (!name) return false;

  const existing = state.portfolio.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (existing) return true;

  if (isPortfolioAtCap(state.portfolio.length)) {
    showToast(
      `Portafolio local limitado a ${FREE_PORTFOLIO_CAP} productos. Exporta JSON o elimina uno para liberar espacio.`,
      'info'
    );
    return false;
  }

  const pack = getVerticalPackById(wizardState.verticalId);
  const categoryId = VERTICAL_TO_CATEGORY[pack.id] || 'general';

  state.portfolio.push({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    category: categoryId,
    cost: 0,
    retail: 0,
    margin: 0,
    roi: 0,
    shipping: 0,
    saturation: 0,
    savedAt: new Date().toLocaleDateString('es'),
    notes: `Borrador — pack ${pack.name}. Completa con Deep Research.`,
    fullReport: {
      name,
      categoryId,
      _isDraft: true,
      _verticalPack: pack.id,
      cost: 0,
      retail: 0,
      margin: 0,
      roi: 0,
      shipping: 0,
      saturation: 0,
      trend: '—',
      suppliers: [],
      demographics: { who: `Borrador vertical ${pack.name}`, belief: 'Completa con Deep Research.' },
      solutions: { current: '', experience: '', likes: '', dislikes: '', skepticism: '', horrorStories: [] },
      secrets: { historical: '', conspiracy: '', mechanismProblem: '', mechanismSolution: '' },
      eden: { goldenAge: '', corruptor: '', contrast: '' },
      verbatims: [],
      angles: [],
    },
  });

  savePortfolioLocal();
  updatePortfolioBadge();
  renderDashboardStats();
  renderResearchFeed();
  renderPortfolioList();
  showToast(`"${name}" guardado como borrador en tu portafolio.`, 'success');
  return true;
}

function copyWizardPack() {
  const pack = getVerticalPackById(wizardState.verticalId);
  const text = formatPackForCopy(pack, wizardState.productName);
  return navigator.clipboard.writeText(text).then(() => {
    showToast(`Pack "${pack.name}" copiado al portapapeles.`, 'success');
    markPromptHubDone();
    updateOnboardingPanel();
    document.dispatchEvent(new CustomEvent('dropdeep:prompt-copied'));
  });
}

function goToPromptHubWithVertical() {
  setPromptHubMode('packs');
  setActiveVerticalPack(wizardState.verticalId);
  const hubProductInput = document.getElementById('prompt-product-input');
  if (hubProductInput && wizardState.productName) {
    hubProductInput.value = wizardState.productName;
  }
  switchView('prompt-hub-view');
  markPromptHubDone();
  updateOnboardingPanel();
}

export function openFirstProductWizard() {
  if (!shouldShowWizard()) return;
  wizardState = {
    step: 1,
    verticalId: verticalPacks[0]?.id ?? 'belleza',
    productName: '',
  };
  const modal = getModal();
  if (!modal) return;
  modal.classList.remove('hidden');
  renderVerticalStep();
  renderWizardStep();
}

export function closeFirstProductWizard() {
  getModal()?.classList.add('hidden');
}

function finishWizard() {
  if (wizardState.productName) saveDraftToPortfolio();
  markWizardCompleted();
  closeFirstProductWizard();
}

export function updateWizardVisibility() {
  const banner = document.getElementById('wizard-hero-cta');
  const feedCta = document.getElementById('wizard-feed-cta');
  const show = shouldShowWizard();

  banner?.classList.toggle('hidden', !show);
  feedCta?.classList.toggle('hidden', !show);
}

export function initFirstProductWizard() {
  const modal = getModal();
  if (!modal) return;

  document.getElementById('wizard-dismiss-btn')?.addEventListener('click', () => {
    dismissWizard();
    closeFirstProductWizard();
  });

  document.getElementById('wizard-close-dot')?.addEventListener('click', () => {
    dismissWizard();
    closeFirstProductWizard();
  });

  document.getElementById('wizard-hero-cta')?.addEventListener('click', openFirstProductWizard);
  document.getElementById('wizard-feed-cta')?.addEventListener('click', openFirstProductWizard);
  document.getElementById('wizard-onboarding-cta')?.addEventListener('click', openFirstProductWizard);
  document.getElementById('empty-portfolio-wizard-cta')?.addEventListener('click', openFirstProductWizard);

  document.getElementById('wizard-back-btn')?.addEventListener('click', () => {
    if (wizardState.step > 1) {
      wizardState.step -= 1;
      renderWizardStep();
    }
  });

  document.getElementById('wizard-next-btn')?.addEventListener('click', () => {
    if (wizardState.step < 3) {
      if (wizardState.step === 2) {
        const input = document.getElementById('wizard-product-input');
        wizardState.productName = input?.value.trim() || '';
      }
      wizardState.step += 1;
      renderWizardStep();
    } else {
      finishWizard();
    }
  });

  document.getElementById('wizard-copy-pack-btn')?.addEventListener('click', () => {
    copyWizardPack().then(() => {
      if (wizardState.productName) saveDraftToPortfolio();
      markWizardCompleted();
      closeFirstProductWizard();
    });
  });

  document.getElementById('wizard-prompt-hub-btn')?.addEventListener('click', () => {
    goToPromptHubWithVertical();
    if (wizardState.productName) saveDraftToPortfolio();
    markWizardCompleted();
    closeFirstProductWizard();
  });

  document.getElementById('wizard-copilot-btn')?.addEventListener('click', () => {
    const name = wizardState.productName.trim();
    if (wizardState.productName) saveDraftToPortfolio();
    markWizardCompleted();
    closeFirstProductWizard();
    switchView('dashboard-view');
    if (name) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = name;
      setResearchPath(RESEARCH_PATH_COPILOT);
      runCopilotResearch(name);
    } else {
      showToast('Ingresa un nombre de producto en el buscador para Modo Copiloto.', 'info');
      document.getElementById('search-input')?.focus();
    }
  });

  document.getElementById('wizard-deep-research-btn')?.addEventListener('click', () => {
    const name = wizardState.productName.trim();
    if (wizardState.productName) saveDraftToPortfolio();
    markWizardCompleted();
    closeFirstProductWizard();
    switchView('dashboard-view');
    if (name) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = name;
      setResearchPath(RESEARCH_PATH_API);
      runResearchDirect(name);
    } else {
      showToast('Ingresa un nombre de producto en el buscador para Deep Research.', 'info');
      document.getElementById('search-input')?.focus();
    }
  });

  updateWizardVisibility();
}
