import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { getCacheEntry } from './cache.js';
import { openDeepResearchReport } from '../ui/report.js';
import { runRealResearchSequence } from './gemini.js';
import { requireGeminiKey, hasGeminiKey } from '../ui/geminiKeyBanner.js';
import { getGeminiKey, getGeminiModel, getGeminiLanguage } from '../utils/geminiStorage.js';
import { isGeminiProxyEnabled, isGeminiProxyConfigured } from './geminiProxy.js';
import { openCopilotPanel } from '../ui/copilotPanel.js';
import { openManualEvaluation } from '../ui/manualEvaluation.js';
import {
  getResearchPath,
  RESEARCH_PATH_COPILOT,
  RESEARCH_PATH_API,
} from '../config/researchPath.js';

export function canUseApiResearch() {
  if (isGeminiProxyEnabled()) return true;
  if (isGeminiProxyConfigured() && !hasGeminiKey()) {
    return false;
  }
  return !!getGeminiKey();
}

export function openCacheModal(productName, competitorUrl, cachedData) {
  const modal = document.getElementById('cache-modal');
  modal.classList.remove('hidden');

  const cancelBtn = document.getElementById('cache-cancel-btn');
  const closeDot = document.getElementById('close-cache-dot');
  const handleClose = () => modal.classList.add('hidden');

  cancelBtn.onclick = handleClose;
  closeDot.onclick = handleClose;

  const loadBtn = document.getElementById('cache-load-btn');
  loadBtn.onclick = () => {
    modal.classList.add('hidden');
    cachedData._loadedFromCache = true;
    openDeepResearchReport(cachedData);
    showToast('Reporte cargado desde la caché local.', 'success');
  };

  const refreshBtn = document.getElementById('cache-refresh-btn');
  refreshBtn.onclick = () => {
    modal.classList.add('hidden');
    runResearchDirect(productName, competitorUrl);
  };
}

export function runApiResearchDirect(productName, competitorUrl = '') {
  const modelName = getGeminiModel();

  if (isGeminiProxyEnabled()) {
    runRealResearchSequence(productName, 'proxy', modelName, competitorUrl);
    return;
  }

  if (isGeminiProxyConfigured() && !isGeminiProxyEnabled()) {
    requireGeminiKey(
      'El proxy Gemini requiere iniciar sesión. Entra con tu cuenta, usa Modo Copiloto gratis, o configura BYOK en Ajustes.'
    );
    return;
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    showToast('Sin clave API — abriendo Modo Copiloto gratis.', 'info');
    openCopilotPanel(productName, competitorUrl);
    return;
  }

  runRealResearchSequence(productName, apiKey, modelName, competitorUrl);
}

export function runCopilotResearch(productName, competitorUrl = '') {
  openCopilotPanel(productName, competitorUrl);
}

export function runManualEvaluationFlow(productName = '') {
  openManualEvaluation(productName);
}

/** Route search submit to copilot or API based on user path + key availability. */
export function runResearchDirect(productName, competitorUrl = '') {
  const language = getGeminiLanguage();
  state.outputLanguage = language;

  const cachedData = getCacheEntry(productName, language);
  if (cachedData) {
    openCacheModal(productName, competitorUrl, cachedData);
    return;
  }

  const path = getResearchPath();

  if (path === RESEARCH_PATH_COPILOT) {
    runCopilotResearch(productName, competitorUrl);
    return;
  }

  if (path === RESEARCH_PATH_API) {
    if (!canUseApiResearch()) {
      showToast('Sin API configurada — usa Modo Copiloto (gratis) o pega tu clave en Ajustes.', 'info');
      openCopilotPanel(productName, competitorUrl);
      return;
    }
    runApiResearchDirect(productName, competitorUrl);
    return;
  }

  runCopilotResearch(productName, competitorUrl);
}

/** @deprecated Use runResearchDirect — kept for existing imports */
export function runDeepResearchSequence(productName, competitorUrl = '') {
  runResearchDirect(productName, competitorUrl);
}

export { RESEARCH_PATH_COPILOT, RESEARCH_PATH_API };
