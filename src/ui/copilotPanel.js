import { showToast } from '../utils/toast.js';
import { markFirstResearchDone, updateOnboardingPanel } from './onboarding.js';
import { renderDashboardStats, renderResearchFeed } from './feed.js';
import { getCopilotStepJsonExample } from '../research/reportSchema.js';
import { escapeHtml } from '../utils/sanitize.js';
import { classifyCopilotPasteError } from '../research/errors.js';
import { bindModalA11y } from '../utils/modalA11y.js';
import {
  startCopilotSession,
  cancelCopilotSession,
  pauseCopilotSession,
  getCurrentCopilotStep,
  processCopilotPaste,
  getStoredCopilotSession,
  restoreCopilotSession,
  getCopilotSession,
  getCompletedCopilotSteps,
  peekCompletedCopilotStep,
  canPeekPreviousCopilotStep,
} from '../research/copilotFlow.js';

/** null = editing current step; number = peeking completed step index */
let peekStepIndex = null;
let releaseCopilotA11y = null;

function getModal() {
  return document.getElementById('copilot-modal');
}

function updateJsonExample(step) {
  const pre = document.getElementById('copilot-json-example-pre');
  const details = document.getElementById('copilot-json-example');
  if (!pre || !step?.stepId) return;
  pre.textContent = getCopilotStepJsonExample(step.stepId);
  if (details) details.open = false;
}

function setPasteEnabled(enabled) {
  const pasteEl = document.getElementById('copilot-paste-input');
  const processBtn = document.getElementById('copilot-process-btn');
  const retryBtn = document.getElementById('copilot-retry-btn');
  const example = document.getElementById('copilot-json-example');
  if (pasteEl) {
    pasteEl.disabled = !enabled;
    pasteEl.classList.toggle('copilot-readonly-dim', !enabled);
  }
  if (processBtn) processBtn.disabled = !enabled;
  if (retryBtn) retryBtn.disabled = !enabled;
  if (example) example.classList.toggle('hidden', !enabled);
}

function updateProgressChrome(step) {
  const fill = document.getElementById('copilot-progress-fill');
  const caption = document.getElementById('copilot-progress-caption');
  const completedCount = step?.index ?? 0;
  const total = step?.total ?? 1;
  if (fill) {
    fill.style.width = `${Math.round((completedCount / total) * 100)}%`;
  }
  if (caption) {
    caption.textContent =
      completedCount === 0
        ? `0 pasos completados · trabajando en el paso 1 de ${total}`
        : `${completedCount} de ${total} pasos completados · paso actual ${completedCount + 1}`;
  }
}

function renderCompletedStepsList() {
  const list = document.getElementById('copilot-completed-list');
  const summary = document.getElementById('copilot-completed-summary');
  const details = document.getElementById('copilot-completed-details');
  const prevBtn = document.getElementById('copilot-prev-step-btn');
  const completed = getCompletedCopilotSteps();

  if (summary) {
    summary.textContent = `Ver pasos completados (${completed.length})`;
  }
  if (details) {
    details.classList.toggle('hidden', completed.length === 0);
    if (completed.length === 0) details.open = false;
  }
  if (prevBtn) {
    prevBtn.classList.toggle('hidden', !canPeekPreviousCopilotStep() || peekStepIndex !== null);
  }

  if (!list) return;
  if (completed.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = completed
    .map(
      (s) => `
      <li>
        <button type="button" class="copilot-completed-item" data-peek-index="${s.index}">
          <span class="copilot-completed-num">${s.index + 1}</span>
          <span class="copilot-completed-title">${escapeHtml(s.meta.short || s.meta.title)}</span>
          <span class="copilot-completed-action">Ver prompt</span>
        </button>
      </li>`,
    )
    .join('');

  list.querySelectorAll('[data-peek-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-peek-index'));
      enterPeekMode(idx);
    });
  });
}

function enterPeekMode(stepIndex) {
  const peeked = peekCompletedCopilotStep(stepIndex);
  if (!peeked) {
    showToast('Ese paso aún no está completado.', 'info');
    return;
  }
  peekStepIndex = stepIndex;
  const titleEl = document.getElementById('copilot-step-title');
  const progressEl = document.getElementById('copilot-step-progress');
  const promptEl = document.getElementById('copilot-prompt-text');
  const banner = document.getElementById('copilot-peek-banner');
  const backBtn = document.getElementById('copilot-back-current-btn');
  const prevBtn = document.getElementById('copilot-prev-step-btn');
  const label = document.querySelector('label[for="copilot-prompt-text"]');

  if (titleEl) titleEl.textContent = peeked.meta.title;
  if (progressEl) {
    progressEl.textContent = `Revisión ${peeked.index + 1} / ${peeked.total} — ${peeked.meta.short}`;
  }
  if (promptEl) promptEl.value = peeked.prompt;
  if (label) label.textContent = 'Prompt del paso anterior (solo lectura):';
  if (banner) {
    banner.textContent = `Revisando paso ${peeked.index + 1} (solo lectura). Los datos ya validados se conservan. Vuelve al paso actual para pegar JSON.`;
    banner.classList.remove('hidden');
  }
  if (backBtn) backBtn.classList.remove('hidden');
  if (prevBtn) prevBtn.classList.add('hidden');
  setPasteEnabled(false);
  hideError();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function exitPeekMode() {
  peekStepIndex = null;
  const banner = document.getElementById('copilot-peek-banner');
  const backBtn = document.getElementById('copilot-back-current-btn');
  const label = document.querySelector('label[for="copilot-prompt-text"]');
  if (banner) banner.classList.add('hidden');
  if (backBtn) backBtn.classList.add('hidden');
  if (label) label.textContent = 'Prompt para el chatbot (paso actual):';
  setPasteEnabled(true);
  const step = getCurrentCopilotStep();
  if (step) renderStepUI(step);
}

function renderStepUI(step) {
  peekStepIndex = null;
  const titleEl = document.getElementById('copilot-step-title');
  const progressEl = document.getElementById('copilot-step-progress');
  const promptEl = document.getElementById('copilot-prompt-text');
  const pasteEl = document.getElementById('copilot-paste-input');
  const errorEl = document.getElementById('copilot-error-msg');
  const productEl = document.getElementById('copilot-product-name');
  const guideEl = document.getElementById('copilot-steps-guide');
  const resumeNote = document.getElementById('copilot-resume-note');
  const banner = document.getElementById('copilot-peek-banner');
  const backBtn = document.getElementById('copilot-back-current-btn');
  const label = document.querySelector('label[for="copilot-prompt-text"]');

  if (banner) banner.classList.add('hidden');
  if (backBtn) backBtn.classList.add('hidden');
  if (label) label.textContent = 'Prompt para el chatbot (paso actual):';
  setPasteEnabled(true);

  if (titleEl) titleEl.textContent = step.meta.title;
  if (progressEl) progressEl.textContent = `${step.index + 1} / ${step.total} — ${step.meta.short}`;
  if (promptEl) promptEl.value = step.prompt;
  if (pasteEl) pasteEl.value = '';
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  updateJsonExample(step);
  updateProgressChrome(step);
  renderCompletedStepsList();

  if (resumeNote) {
    if (step.index > 0) {
      resumeNote.textContent = `Progreso guardado — ${step.index} paso(s) completado(s). Retomando paso ${step.index + 1} de ${step.total}.`;
      resumeNote.classList.remove('hidden');
    } else {
      resumeNote.classList.add('hidden');
    }
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

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showError(messageOrClassified) {
  const errorEl = document.getElementById('copilot-error-msg');
  if (!errorEl) return;

  let display = '';
  let openExample = false;
  if (messageOrClassified && typeof messageOrClassified === 'object') {
    const { title, message, hint } = messageOrClassified;
    display = [title, message, hint].filter(Boolean).join('\n\n');
    openExample = /Ver ejemplo de JSON/i.test(display);
  } else {
    display = String(messageOrClassified || '');
    openExample = /Ver ejemplo de JSON/i.test(display);
  }

  errorEl.textContent = display;
  errorEl.classList.remove('hidden');
  if (openExample) {
    const details = document.getElementById('copilot-json-example');
    if (details) details.open = true;
  }
  // Refresh completed list so user sees prior steps still count
  renderCompletedStepsList();
  const step = getCurrentCopilotStep();
  if (step) updateProgressChrome(step);
}

function hideError() {
  const errorEl = document.getElementById('copilot-error-msg');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}

function openCopilotModalUI() {
  const modal = getModal();
  if (!modal) return;
  modal.classList.remove('hidden');
  releaseCopilotA11y?.();
  releaseCopilotA11y = bindModalA11y(modal, {
    onClose: closeCopilotPanel,
    initialFocus: '#copilot-paste-input',
    label: 'Modo Copiloto Gratis',
  });
}

function confirmDiscard(message) {
  return window.confirm(message);
}

export function resumeCopilotPanel() {
  const stored = getStoredCopilotSession();
  if (!stored) {
    showToast('No hay sesión de copiloto guardada.', 'info');
    return;
  }

  restoreCopilotSession(stored);

  const productEl = document.getElementById('copilot-product-name');
  if (productEl) productEl.textContent = stored.productName;

  const step = getCurrentCopilotStep();
  if (step) renderStepUI(step);

  openCopilotModalUI();
  showToast(`Retomando investigación de «${stored.productName}» (paso ${stored.currentStepIndex + 1}/${stored.steps.length}).`, 'info');
}

export function openCopilotPanel(productName, competitorUrl = '') {
  const stored = getStoredCopilotSession();
  const active = getCopilotSession();

  if (active && active.productName === productName) {
    const productEl = document.getElementById('copilot-product-name');
    if (productEl) productEl.textContent = productName;
    const step = getCurrentCopilotStep();
    if (step) renderStepUI(step);
    openCopilotModalUI();
    return;
  }

  if (stored && stored.productName !== productName) {
    const discard = confirmDiscard(
      `Tienes una investigación en progreso de «${stored.productName}» (paso ${stored.currentStepIndex + 1}/${stored.steps.length}). ¿Descartarla e iniciar «${productName}»?`
    );
    if (!discard) {
      resumeCopilotPanel();
      return;
    }
    cancelCopilotSession();
  }

  startCopilotSession(productName, competitorUrl);

  const productEl = document.getElementById('copilot-product-name');
  if (productEl) productEl.textContent = productName;

  const step = getCurrentCopilotStep();
  if (step) renderStepUI(step);

  openCopilotModalUI();
}

function releaseCopilotModal() {
  releaseCopilotA11y?.();
  releaseCopilotA11y = null;
  getModal()?.classList.add('hidden');
}

export function closeCopilotPanel() {
  peekStepIndex = null;
  pauseCopilotSession();
  releaseCopilotModal();
}

export function discardCopilotPanel() {
  if (!getCopilotSession() && !getStoredCopilotSession()) {
    releaseCopilotModal();
    return;
  }
  if (!confirmDiscard('¿Descartar el progreso del copiloto? No podrás retomarlo.')) {
    return;
  }
  peekStepIndex = null;
  cancelCopilotSession();
  releaseCopilotModal();
  renderResearchFeed();
  showToast('Progreso del copiloto descartado.', 'info');
}

export function initCopilotPanel() {
  const modal = getModal();
  if (!modal) return;

  document.getElementById('copilot-close-dot')?.addEventListener('click', closeCopilotPanel);
  document.getElementById('copilot-cancel-btn')?.addEventListener('click', discardCopilotPanel);
  document.getElementById('copilot-discard-btn')?.addEventListener('click', discardCopilotPanel);

  document.getElementById('copilot-copy-prompt-btn')?.addEventListener('click', () => {
    const promptEl = document.getElementById('copilot-prompt-text');
    const text = promptEl?.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast(
        peekStepIndex !== null
          ? 'Prompt del paso anterior copiado.'
          : 'Prompt copiado — pégalo en tu chatbot gratuito.',
        'success',
      );
    });
  });

  document.getElementById('copilot-prev-step-btn')?.addEventListener('click', () => {
    const completed = getCompletedCopilotSteps();
    if (!completed.length) return;
    enterPeekMode(completed[completed.length - 1].index);
  });

  document.getElementById('copilot-back-current-btn')?.addEventListener('click', () => {
    exitPeekMode();
    showToast('De vuelta en el paso actual — puedes pegar el JSON.', 'info');
  });

  document.getElementById('copilot-retry-btn')?.addEventListener('click', () => {
    if (peekStepIndex !== null) {
      exitPeekMode();
    }
    hideError();
    document.getElementById('copilot-paste-input').value = '';
    document.getElementById('copilot-paste-input')?.focus();
  });

  document.getElementById('copilot-process-btn')?.addEventListener('click', () => {
    if (peekStepIndex !== null) {
      showToast('Estás revisando un paso anterior. Vuelve al paso actual para pegar JSON.', 'info');
      return;
    }
    const raw = document.getElementById('copilot-paste-input')?.value || '';
    if (!raw.trim()) {
      showError(classifyCopilotPasteError(''));
      return;
    }

    const sessionBefore = getCopilotSession();
    const indexBefore = sessionBefore?.currentStepIndex ?? 0;
    const partialKeysBefore = sessionBefore?.partialReport
      ? Object.keys(sessionBefore.partialReport)
      : [];

    const result = processCopilotPaste(raw);
    if (!result.ok) {
      const sessionAfter = getCopilotSession();
      if (sessionAfter && sessionAfter.currentStepIndex !== indexBefore) {
        console.warn('T07 invariant: step index advanced on error');
      }
      showError(classifyCopilotPasteError(result.error));
      // Confirm prior data still present
      if (sessionAfter && partialKeysBefore.length) {
        const stillThere = partialKeysBefore.every((k) => k in (sessionAfter.partialReport || {}));
        if (stillThere && indexBefore > 0) {
          showToast('Pasos anteriores intactos — corrige el pegado y reintenta.', 'info');
        }
      }
      return;
    }

    hideError();
    showToast('Paso procesado correctamente.', 'success');

    if (result.done && result.report) {
      const fill = document.getElementById('copilot-progress-fill');
      if (fill) fill.style.width = '100%';
      const caption = document.getElementById('copilot-progress-caption');
      if (caption) caption.textContent = 'Todos los pasos completados';
      markFirstResearchDone();
      updateOnboardingPanel();
      renderDashboardStats();
      renderResearchFeed();
      setTimeout(async () => {
        releaseCopilotModal();
        const { openDeepResearchReport } = await import('./report.js');
        openDeepResearchReport(result.report);
        showToast('Reporte completo — generado en modo copiloto.', 'success');
      }, 400);
      return;
    }

    if (result.nextStep) {
      renderStepUI(result.nextStep);
      renderResearchFeed();
      showToast(`Continúa con el paso ${result.nextStep.index + 1} de ${result.nextStep.total}.`, 'info');
    }
  });
}
