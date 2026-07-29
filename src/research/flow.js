import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { getCacheEntry } from './cache.js';
import { openDeepResearchReport } from '../ui/report.js';
import { runRealResearchSequence } from './gemini.js';
import { requireGeminiKey } from '../ui/geminiKeyBanner.js';
import { getGeminiKey, getGeminiModel, getGeminiLanguage } from '../utils/geminiStorage.js';
import { isGeminiProxyEnabled } from './geminiProxy.js';

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
    runApiResearchDirect(productName, competitorUrl);
  };
}

export function runApiResearchDirect(productName, competitorUrl = '') {
  const modelName = getGeminiModel();

  if (isGeminiProxyEnabled()) {
    runRealResearchSequence(productName, 'proxy', modelName, competitorUrl);
    return;
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    requireGeminiKey(
      'Sin clave API de Gemini. Abre Ajustes para ejecutar Deep Research en vivo.'
    );
    return;
  }

  runRealResearchSequence(productName, apiKey, modelName, competitorUrl);
}

export function runDeepResearchSequence(productName, competitorUrl = '') {
  const language = getGeminiLanguage();
  state.outputLanguage = language;

  const cachedData = getCacheEntry(productName, language);
  if (cachedData) {
    openCacheModal(productName, competitorUrl, cachedData);
    return;
  }

  runApiResearchDirect(productName, competitorUrl);
}
