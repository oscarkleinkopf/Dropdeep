/** Research path preference: free copilot vs paid API accelerator. */

export const RESEARCH_PATH_COPILOT = 'copilot';
export const RESEARCH_PATH_API = 'api';

const STORAGE_KEY = 'dropdeep_research_path';

export function getResearchPath() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === RESEARCH_PATH_API || stored === RESEARCH_PATH_COPILOT) {
    return stored;
  }
  return RESEARCH_PATH_COPILOT;
}

export function setResearchPath(path) {
  const value = path === RESEARCH_PATH_API ? RESEARCH_PATH_API : RESEARCH_PATH_COPILOT;
  localStorage.setItem(STORAGE_KEY, value);
  syncResearchPathUI();
}

export function syncResearchPathUI() {
  const path = getResearchPath();
  document.querySelectorAll('[data-research-path]').forEach((btn) => {
    const btnPath = btn.getAttribute('data-research-path');
    const isActive = btnPath === path;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const hint = document.getElementById('research-path-hint');
  if (hint) {
    hint.textContent = path === RESEARCH_PATH_COPILOT
      ? 'Copiloto gratis — copia prompts → pega en chatbot → pega respuesta aquí'
      : 'API automática — requiere clave Gemini o proxy con cuenta';
  }

  const submitBtn = document.querySelector('#search-form .search-btn-primary span');
  const submitIcon = document.querySelector('#search-form .search-btn-primary .btn-icon');
  if (submitBtn) {
    submitBtn.textContent = path === RESEARCH_PATH_COPILOT
      ? 'Iniciar Modo Copiloto'
      : 'Ejecutar Deep Research';
  }
  if (submitIcon) {
    submitIcon.setAttribute('data-lucide', path === RESEARCH_PATH_COPILOT ? 'users' : 'zap');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

export function initResearchPathToggle() {
  document.querySelectorAll('[data-research-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setResearchPath(btn.getAttribute('data-research-path'));
    });
  });
  syncResearchPathUI();
}
