import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { formatCacheOriginLabel, getCacheEntry } from './cache.js';
import { bindModalA11y } from '../utils/modalA11y.js';
import { requireGeminiKey, hasGeminiKey } from '../ui/geminiKeyBanner.js';
import { getGeminiKey, getGeminiModel, getGeminiLanguage } from '../utils/geminiStorage.js';
import { isGeminiProxyConfigured } from './geminiProxy.js';
import { getGeminiRoute, getGeminiApiCredential } from '../config/geminiRoute.js';
import {
  getResearchPath,
  RESEARCH_PATH_COPILOT,
  RESEARCH_PATH_API,
} from '../config/researchPath.js';
import { getResearchMode } from '../config/researchMode.js';
import { ANALYTICS_EVENTS, trackEventFireAndForget } from '../utils/analytics.js';

export function canUseApiResearch() {
  const route = getGeminiRoute();
  if (route === 'byok' || route === 'proxy') return true;
  if (isGeminiProxyConfigured() && !hasGeminiKey()) {
    return false;
  }
  return !!getGeminiKey();
}

export function openCacheModal(productName, competitorUrl, cachedData) {
  const modal = document.getElementById('cache-modal');
  modal.classList.remove('hidden');

  const origin = formatCacheOriginLabel(
    cachedData?._source,
    cachedData?._researchMode
  );
  const body = modal.querySelector('.terminal-body p');
  if (body) {
    body.textContent =
      `Ya existe un reporte «${origin}» para este producto guardado hace menos de 24 horas. ` +
      'Puedes cargarlo al instante o forzar una nueva búsqueda (no se reutiliza caché de otra ruta o modo).';
  }

  let releaseCacheA11y = null;
  const handleClose = () => {
    releaseCacheA11y?.();
    releaseCacheA11y = null;
    modal.classList.add('hidden');
  };

  releaseCacheA11y = bindModalA11y(modal, {
    onClose: handleClose,
    initialFocus: '#cache-load-btn',
    label: 'Investigación en Caché',
  });

  const cancelBtn = document.getElementById('cache-cancel-btn');
  const closeDot = document.getElementById('close-cache-dot');

  cancelBtn.onclick = handleClose;
  closeDot.onclick = handleClose;

  const loadBtn = document.getElementById('cache-load-btn');
  loadBtn.onclick = async () => {
    handleClose();
    cachedData._loadedFromCache = true;
    const { openDeepResearchReport } = await import('../ui/report.js');
    openDeepResearchReport(cachedData);
    showToast(`Reporte «${origin}» cargado desde la caché local.`, 'success');
  };

  const refreshBtn = document.getElementById('cache-refresh-btn');
  refreshBtn.onclick = () => {
    handleClose();
    runResearchDirect(productName, competitorUrl, { skipCache: true });
  };
}

export async function runApiResearchDirect(productName, competitorUrl = '') {
  const modelName = getGeminiModel();
  const credential = getGeminiApiCredential();

  if (credential) {
    const { runRealResearchSequence } = await import('./gemini.js');
    runRealResearchSequence(productName, credential, modelName, competitorUrl);
    return;
  }

  if (isGeminiProxyConfigured() && getGeminiRoute() === 'none') {
    requireGeminiKey(
      'El proxy Gemini requiere iniciar sesión. Entra con tu cuenta, usa Modo Copiloto gratis, o configura BYOK en Ajustes.'
    );
    return;
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    showToast('Sin clave API — abriendo Modo Copiloto gratis.', 'info');
    const { openCopilotPanel } = await import('../ui/copilotPanel.js');
    openCopilotPanel(productName, competitorUrl);
    return;
  }

  const { runRealResearchSequence } = await import('./gemini.js');
  runRealResearchSequence(productName, apiKey, modelName, competitorUrl);
}

export async function runCopilotResearch(productName, competitorUrl = '') {
  const { openCopilotPanel } = await import('../ui/copilotPanel.js');
  openCopilotPanel(productName, competitorUrl);
}

export async function runManualEvaluationFlow(productName = '') {
  const { openManualEvaluation } = await import('../ui/manualEvaluation.js');
  openManualEvaluation(productName);
}

/**
 * Route search submit to copilot or API based on user path + key availability.
 * @param {{ skipCache?: boolean }} [opts]
 */
export function runResearchDirect(productName, competitorUrl = '', opts = {}) {
  const language = getGeminiLanguage();
  state.outputLanguage = language;

  const path = getResearchPath();
  const mode = getResearchMode();
  const cacheSource = path === RESEARCH_PATH_API ? 'api' : 'copilot';

  trackEventFireAndForget(ANALYTICS_EVENTS.START_RESEARCH, {
    path: path === RESEARCH_PATH_API ? 'api' : 'copilot',
    mode: String(mode || ''),
  });

  if (!opts.skipCache) {
    const cachedData = getCacheEntry(productName, language, cacheSource, mode);
    if (cachedData) {
      openCacheModal(productName, competitorUrl, cachedData);
      return;
    }
  }

  if (path === RESEARCH_PATH_COPILOT) {
    runCopilotResearch(productName, competitorUrl);
    return;
  }

  if (path === RESEARCH_PATH_API) {
    if (!canUseApiResearch()) {
      showToast('Sin API configurada — usa Modo Copiloto (gratis) o pega tu clave en Ajustes.', 'info');
      runCopilotResearch(productName, competitorUrl);
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
