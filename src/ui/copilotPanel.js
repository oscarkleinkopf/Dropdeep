import { showToast } from '../utils/toast.js';
import { openDeepResearchReport } from './report.js';
import { markFirstResearchDone, updateOnboardingPanel } from './onboarding.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';
import {
  startCopilotSession,
  cancelCopilotSession,
  getCurrentCopilotStep,
  processCopilotPaste,
} from '../research/copilotFlow.js';

function getModal() {
  return document.getElementById('copilot-modal');
}

function renderStepUI(step) {
  const titleEl = document.getElementById('copilot-step-title');
  const progressEl = document.getElementById('copilot-step-progress');
  const promptEl = document.getElementById('copilot-prompt-text');
  const pasteEl = document.getElementById('copilot-paste-input');
  const errorEl = document.getElementById('copilot-error-msg');
  const productEl = document.getElementById('copilot-product-name');
  const guideEl = document.getElementById('copilot-steps-guide');

  if (titleEl) titleEl.textContent = step.meta.title;
  if (progressEl) progressEl.textContent = `${step.index + 1} / ${step.total} — ${step.meta.short}`;
  if (promptEl) promptEl.value = step.prompt;
  if (pasteEl) pasteEl.value = '';
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (guideEl && step.total === 1) {
    guideEl.innerHTML = `
      <li><strong>Copiar prompt</strong> → botón abajo (único paso express)</li>
      <li><strong>Pegar en tu chatbot gratis</strong> y esperar el JSON completo</li>
      <li><strong>Pegar aquí la respuesta</strong> → Procesar respuesta → reporte listo</li>
    `;
  } else if (guideEl) {
    guideEl.innerHTML = `
      <li><strong>Copiar prompt</strong> → botón abajo</li>
      <li><strong>Pegar en tu chatbot gratis</strong> (ChatGPT, Gemini, Claude, DeepSeek web)</li>
      <li><strong>Pegar aquí la respuesta</strong> → Procesar respuesta</li>
    `;
  }
  if (productEl) productEl.textContent = step.prompt.includes('"') ? '' : '';

  const fill = document.getElementById('copilot-progress-fill');
  if (fill) {
    fill.style.width = `${Math.round(((step.index) / step.total) * 100)}%`;
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showError(message) {
  const errorEl = document.getElementById('copilot-error-msg');
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function hideError() {
  const errorEl = document.getElementById('copilot-error-msg');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}

export function openCopilotPanel(productName, competitorUrl = '') {
  startCopilotSession(productName, competitorUrl);
  const modal = getModal();
  if (!modal) return;

  const productEl = document.getElementById('copilot-product-name');
  if (productEl) productEl.textContent = productName;

  const step = getCurrentCopilotStep();
  if (step) renderStepUI(step);

  modal.classList.remove('hidden');
  document.getElementById('copilot-paste-input')?.focus();
}

export function closeCopilotPanel() {
  getModal()?.classList.add('hidden');
  cancelCopilotSession();
}

export function initCopilotPanel() {
  const modal = getModal();
  if (!modal) return;

  document.getElementById('copilot-close-dot')?.addEventListener('click', closeCopilotPanel);
  document.getElementById('copilot-cancel-btn')?.addEventListener('click', closeCopilotPanel);

  document.getElementById('copilot-copy-prompt-btn')?.addEventListener('click', () => {
    const step = getCurrentCopilotStep();
    if (!step?.prompt) return;
    navigator.clipboard.writeText(step.prompt).then(() => {
      showToast('Prompt copiado — pégalo en tu chatbot gratuito.', 'success');
    });
  });

  document.getElementById('copilot-retry-btn')?.addEventListener('click', () => {
    hideError();
    document.getElementById('copilot-paste-input').value = '';
    document.getElementById('copilot-paste-input')?.focus();
  });

  document.getElementById('copilot-process-btn')?.addEventListener('click', () => {
    const raw = document.getElementById('copilot-paste-input')?.value || '';
    if (!raw.trim()) {
      showError('Pega la respuesta del chatbot antes de procesar.');
      return;
    }

    const result = processCopilotPaste(raw);
    if (!result.ok) {
      showError(`${result.error} Usa "Reintentar" para pegar de nuevo.`);
      return;
    }

    hideError();
    showToast('Paso procesado correctamente.', 'success');

    if (result.done && result.report) {
      const fill = document.getElementById('copilot-progress-fill');
      if (fill) fill.style.width = '100%';
      markFirstResearchDone();
      updateOnboardingPanel();
      renderDashboardStats();
      renderResearchFeed();
      setTimeout(() => {
        closeCopilotPanel();
        openDeepResearchReport(result.report);
        showToast('Reporte completo — generado en modo copiloto.', 'success');
      }, 400);
      return;
    }

    if (result.nextStep) {
      renderStepUI(result.nextStep);
      showToast(`Continúa con el paso ${result.nextStep.index + 1} de ${result.nextStep.total}.`, 'info');
    }
  });
}
