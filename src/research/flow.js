import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { getCacheEntry } from './cache.js';
import { openDeepResearchReport } from '../ui/report.js';
import { runRealResearchSequence } from './gemini.js';

export function openCacheModal(productName, competitorUrl, cachedData) {
  const modal = document.getElementById('cache-modal');
  modal.classList.remove('hidden');

  // Cancel button
  const cancelBtn = document.getElementById('cache-cancel-btn');
  const closeDot = document.getElementById('close-cache-dot');
  const handleClose = () => modal.classList.add('hidden');
  
  cancelBtn.onclick = handleClose;
  closeDot.onclick = handleClose;

  // Load from cache button
  const loadBtn = document.getElementById('cache-load-btn');
  loadBtn.onclick = () => {
    modal.classList.add('hidden');
    cachedData._loadedFromCache = true;
    openDeepResearchReport(cachedData);
    showToast("Reporte cargado desde la caché local.", "success");
  };

  // Force refresh button
  const refreshBtn = document.getElementById('cache-refresh-btn');
  refreshBtn.onclick = () => {
    modal.classList.add('hidden');
    runApiResearchDirect(productName, competitorUrl);
  };
}

export function runApiResearchDirect(productName, competitorUrl = '') {
  const apiKey = localStorage.getItem('dropdeep_gemini_key');
  const modelName = localStorage.getItem('dropdeep_gemini_model') || 'gemini-1.5-flash';

  if (!apiKey) {
    const confirmSimulation = confirm("No tienes una API Key de Gemini guardada.\n\n¿Quieres usar el MODO SIMULACIÓN PROCEDURAL para probar la aplicación?\n(Si cancelas, se abrirá la ventana de configuración para ingresar tu clave).");
    if (confirmSimulation) {
      runSimulatedResearchSequence(productName, competitorUrl);
    } else {
      document.getElementById('settings-modal').classList.remove('hidden');
    }
    return;
  }

  runRealResearchSequence(productName, apiKey, modelName, competitorUrl);
}

// ROUTER FOR DEEP RESEARCH (LIVE OR SIMULATED)
export function runDeepResearchSequence(productName, competitorUrl = '') {
  const language = localStorage.getItem('dropdeep_gemini_language') || 'es';
  state.outputLanguage = language;
  
  const cachedData = getCacheEntry(productName, language);
  if (cachedData) {
    openCacheModal(productName, competitorUrl, cachedData);
    return;
  }

  runApiResearchDirect(productName, competitorUrl);
}

// RUN SIMULATED RESEARCH SEQUENCE (FALLBACK/DEMO MODE)
export function runSimulatedResearchSequence(productName, competitorUrl = '') {
  const modal = document.getElementById('terminal-modal');
  const output = document.getElementById('terminal-output');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');

  modal.classList.remove('hidden');
  output.innerHTML = '';
  fill.style.width = '0%';

  const logs = [
    { text: `🚀 LAUNCHING DROPDEEP SIMULATED AGENT v1.0.3 ON '${productName.toUpperCase()}'...`, type: "header-line", delay: 300 },
    { text: `[1/6] [INIT] Inicializando puertos de conexión remota... OK`, type: "info", delay: 700 },
    { text: `[2/6] [SCRAPE] Buscando en Amazon por el producto y competidores...`, type: "info", delay: 1200 },
    { text: `[2/6] [SCRAPE] Encontradas 14 variantes. Descargando 340 reseñas de compradores reales...`, type: "info", delay: 1800 },
    { text: `[2/6] [SCRAPE] Analizando quejas de 1 y 2 estrellas (Foco: dolores del cliente, efectos secundarios)...`, type: "warning", delay: 2400 },
    { text: `[3/6] [EXTRACT] Conectando a Reddit API. Rastreando r/AskReddit, subreddits de nicho y foros locales...`, type: "info", delay: 3000 },
    { text: `[3/6] [EXTRACT] Recopilando frases textuales ('verbatims') con alta carga emocional...`, type: "success", delay: 3600 },
    { text: `[4/6] [ANALYSIS] Procesando modelo psicográfico. Identificando Hopes, Dreams y Scapegoats (Culpables externos)...`, type: "info", delay: 4200 },
    { text: `[4/6] [ANALYSIS] Calculando 'Mecanismo Único de Dolor' vs 'Mecanismo de Solución'...`, type: "success", delay: 4800 },
    { text: `[5/6] [COPYWRITING] Sintetizando 5 Ángulos de marketing y ganchos...`, type: "info", delay: 5400 },
    { text: `[5/6] [COPYWRITING] Redactando ganchos de TikTok y titulares de Landing...`, type: "success", delay: 6000 },
    { text: `[6/6] [COMPILE] Compilando fichas Avatar Brief (Plantilla 4) y Offer Brief (Plantilla 5)...`, type: "info", delay: 6700 },
    { text: `🎉 [COMPLETE] Compilación de Deep Research finalizada con éxito. Generando UI...`, type: "success", delay: 7200 }
  ];

  logs.forEach(log => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `term-line ${log.type}`;
      line.textContent = log.text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
      
      const percent = Math.round((logs.indexOf(log) + 1) / logs.length * 100);
      fill.style.width = `${percent}%`;
      label.textContent = `Progreso: ${percent}% - ${log.text.substring(0, 45)}...`;
      
      if (percent === 100) {
        setTimeout(() => {
          modal.classList.add('hidden');
          openDeepResearchReport(productName);
        }, 600);
      }
    }, log.delay);
  });
}
