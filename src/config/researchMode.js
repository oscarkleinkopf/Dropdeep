/** Deep Research depth preference — persisted locally, no auth required. */

import { formatProxyUsageHint } from '../research/geminiProxy.js';
import { getGeminiRoute } from '../config/geminiRoute.js';

export const RESEARCH_MODE_EXPRESS = 'express';
export const RESEARCH_MODE_FAST = 'fast';
export const RESEARCH_MODE_COMPLETE = 'complete';

const STORAGE_KEY = 'dropdeep_research_mode';

export function getResearchMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === RESEARCH_MODE_EXPRESS) return RESEARCH_MODE_EXPRESS;
  if (stored === RESEARCH_MODE_FAST) return RESEARCH_MODE_FAST;
  if (stored === RESEARCH_MODE_COMPLETE) return RESEARCH_MODE_COMPLETE;
  return RESEARCH_MODE_EXPRESS;
}

export function setResearchMode(mode) {
  const normalized =
    mode === RESEARCH_MODE_EXPRESS
      ? RESEARCH_MODE_EXPRESS
      : mode === RESEARCH_MODE_FAST
        ? RESEARCH_MODE_FAST
        : RESEARCH_MODE_COMPLETE;
  localStorage.setItem(STORAGE_KEY, normalized);
  syncResearchModeUI();
}

export function isFastResearchMode() {
  return getResearchMode() === RESEARCH_MODE_FAST;
}

export function isExpressResearchMode() {
  return getResearchMode() === RESEARCH_MODE_EXPRESS;
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
    let text = '';
    if (mode === RESEARCH_MODE_EXPRESS) {
      text = 'Modo Express — 1 pegado (copiloto) · ideal para empezar sin API';
    } else if (mode === RESEARCH_MODE_FAST) {
      text = 'Modo Rápido — 2 pasos (copiloto o Gemini) · menos profundidad';
    } else {
      text = 'Modo Completo — 5 pasos (copiloto o Gemini) · máxima profundidad';
    }
    const proxyHint = getGeminiRoute() === 'proxy' ? formatProxyUsageHint() : '';
    hint.textContent = proxyHint ? `${text} · ${proxyHint}` : text;
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
