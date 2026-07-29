/** Deep Research depth preference — persisted locally, no auth required. */

export const RESEARCH_MODE_FAST = 'fast';
export const RESEARCH_MODE_COMPLETE = 'complete';

const STORAGE_KEY = 'dropdeep_research_mode';

export function getResearchMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === RESEARCH_MODE_FAST ? RESEARCH_MODE_FAST : RESEARCH_MODE_COMPLETE;
}

export function setResearchMode(mode) {
  localStorage.setItem(
    STORAGE_KEY,
    mode === RESEARCH_MODE_FAST ? RESEARCH_MODE_FAST : RESEARCH_MODE_COMPLETE
  );
  syncResearchModeUI();
}

export function isFastResearchMode() {
  return getResearchMode() === RESEARCH_MODE_FAST;
}

export function syncResearchModeUI() {
  const mode = getResearchMode();
  document.querySelectorAll('[data-research-mode]').forEach((btn) => {
    const btnMode = btn.getAttribute('data-research-mode');
    const isActive = btnMode === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  const hint = document.getElementById('research-mode-hint');
  if (hint) {
    hint.textContent = mode === RESEARCH_MODE_FAST
      ? 'Modo Rápido — 2 pasos Gemini · menos costo / menos profundidad'
      : 'Modo Completo — secuencia de 5 pasos Gemini';
  }
}

export function initResearchModeToggle() {
  document.querySelectorAll('[data-research-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setResearchMode(btn.getAttribute('data-research-mode'));
    });
  });
  syncResearchModeUI();
}
