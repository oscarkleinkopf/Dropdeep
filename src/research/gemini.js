import { GoogleGenerativeAI } from '@google/generative-ai';
import { state } from '../state.js';
import { openDeepResearchReport } from '../ui/report.js';
import { isGeminiGroundingEnabled } from '../utils/geminiStorage.js';
import { createProxyGenerativeModel } from './geminiProxy.js';
import { classifyGeminiError } from './errors.js';
import {
  startResearchSession,
  cancelResearchSession,
  throwIfAborted,
  isResearchAborted,
} from './researchSession.js';
import { persistResearchReport } from './historySync.js';
import { openSettingsModal } from '../ui/geminiKeyBanner.js';
import { isFastResearchMode } from '../config/researchMode.js';
import { bindModalA11y } from '../utils/modalA11y.js';
import { buildFastModeReport, FAST_MODE_SKIP_MSG } from './fastMode.js';
import {
  COPILOT_STEPS,
  buildApiPrompt,
  getApiStepList,
  getCopilotStepMeta,
} from './reportSchema.js';
import {
  parseAndValidateStep,
  applyStepToReport,
  assembleCopilotReport,
} from './reportParse.js';
import {
  getIncompleteStepPayload,
  getIncompleteStepLabel,
  mergeIncompleteSections,
  isSkipMessage,
} from './reportFallbacks.js';
import { calculateProductScore } from './scoring.js';

const TRANSIENT_MAX_RETRIES = 2;
let releaseTerminalA11y = null;

/** Hide Deep Research terminal and release focus trap (T23). */
export function hideTerminalModal() {
  releaseTerminalA11y?.();
  releaseTerminalA11y = null;
  document.getElementById('terminal-modal')?.classList.add('hidden');
}

function bindTerminalModalA11y() {
  const modal = document.getElementById('terminal-modal');
  if (!modal) return;
  releaseTerminalA11y?.();
  releaseTerminalA11y = bindModalA11y(modal, {
    onClose: hideTerminalModal,
    initialFocus: '#terminal-cancel-btn',
    label: 'Deep Research',
  });
}

const STEP_PROGRESS = {
  [COPILOT_STEPS.BASE_REPORT]: { pct: 20, label: 'Generando Reporte de Copywriting' },
  [COPILOT_STEPS.AVATAR_BRIEF]: { pct: 40, label: 'Compilando Ficha Avatar Brief' },
  [COPILOT_STEPS.OFFER_BRIEF]: { pct: 60, label: 'Diseñando Arquitectura de Oferta' },
  [COPILOT_STEPS.CREATIVES]: { pct: 80, label: 'Generando Activos Creativos y Landing Page' },
  [COPILOT_STEPS.MARKETING_ASSETS]: { pct: 90, label: 'Generando Materiales de Marketing' },
  [COPILOT_STEPS.FAST_MARKETING]: { pct: 65, label: 'Generando copys básicos' },
};

export async function generateContentWithRetry(
  modelInstance,
  requestPayload,
  addLog,
  stepName,
  maxRetries = TRANSIENT_MAX_RETRIES,
  fallbackModelInstance = null,
  fallbackPayload = null,
  abortSignal = null
) {
  let attempt = 0;
  let delay = 3000;
  let currentModel = modelInstance;
  let currentPayload = requestPayload;
  let usingFallback = false;

  while (attempt < maxRetries) {
    throwIfAborted(abortSignal);
    try {
      attempt++;
      const result = await currentModel.generateContent(currentPayload);
      return result;
    } catch (error) {
      throwIfAborted(abortSignal);
      console.error(`Error en ${stepName} (Intento ${attempt}/${maxRetries}):`, error);

      const errMsg = String(error.message || error).toLowerCase();

      const isInvalidKey =
        errMsg.includes('api key not valid') ||
        errMsg.includes('api_key_invalid') ||
        errMsg.includes('invalid api key') ||
        errMsg.includes('key is invalid');

      if (isInvalidKey) {
        throw error;
      }

      const isQuotaError =
        errMsg.includes('quota') ||
        errMsg.includes('429') ||
        errMsg.includes('limit') ||
        errMsg.includes('exhausted');

      const isPolicyOrRecitation =
        !isQuotaError &&
        (errMsg.includes('recitation') ||
          errMsg.includes('safety') ||
          errMsg.includes('block') ||
          errMsg.includes('violat'));

      if (attempt < maxRetries) {
        if (fallbackModelInstance && !usingFallback && (attempt >= 2 || isPolicyOrRecitation)) {
          usingFallback = true;
          currentModel = fallbackModelInstance;
          currentPayload = fallbackPayload;
          const blockReason = isPolicyOrRecitation
            ? 'por filtro de seguridad o derechos de autor (RECITATION)'
            : 'por saturación o error del buscador';
          addLog(
            `⚠️ [Intento ${attempt}/${maxRetries}] ${stepName} falló ${blockReason}. Activando fallback: Desactivando búsqueda web de Google y reintentando...`,
            'warning'
          );
        } else {
          const reasonMsg = isPolicyOrRecitation
            ? 'filtro de recitación/seguridad'
            : 'saturación de la API (Error 503/429/De red)';
          addLog(
            `⚠️ [Intento ${attempt}/${maxRetries}] ${stepName} falló por ${reasonMsg}. Reintentando en ${(delay / 1000).toFixed(1)}s...`,
            'warning'
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
}

function renderResearchErrorUI(
  modal,
  output,
  fill,
  label,
  error,
  productName,
  apiKey,
  modelName,
  competitorUrl
) {
  const classified = classifyGeminiError(error);
  addLogTerminal(output, `❌ ${classified.title}`, 'warning');
  addLogTerminal(output, classified.message, 'warning');

  if (classified.type === 'quota') {
    addLogTerminal(output, 'Espera 1–2 minutos antes de reintentar o cambia de modelo en Ajustes.', 'info');
  } else if (classified.type === 'proxy_daily_quota') {
    addLogTerminal(
      output,
      'Pega tu clave Gemini gratis en AI Studio o vuelve mañana para más investigaciones proxy.',
      'info'
    );
  } else if (classified.type === 'proxy_rate_limit' || classified.type === 'proxy_session_cooldown') {
    addLogTerminal(output, 'Tip: BYOK o Modo Copiloto no consumen el rate limit del proxy.', 'info');
  } else if (classified.type === 'proxy_payload_too_large') {
    addLogTerminal(output, 'Tip: con BYOK el límite de tamaño lo marca Google, no el proxy.', 'info');
  } else if (classified.type === 'invalid_key') {
    addLogTerminal(output, 'Abre Ajustes → pega una clave válida de Google AI Studio.', 'info');
  } else if (classified.type === 'proxy') {
    addLogTerminal(
      output,
      'Si el proxy falla, desactiva VITE_GEMINI_PROXY o configura BYOK en Ajustes.',
      'info'
    );
  } else if (classified.type === 'parse') {
    addLogTerminal(output, 'Tip: Gemini 2.5 Flash suele dar JSON más estable para reportes largos.', 'info');
  }

  const actionContainer = document.createElement('div');
  actionContainer.className = 'terminal-error-actions';
  actionContainer.style.marginTop = '1rem';
  actionContainer.style.display = 'flex';
  actionContainer.style.flexWrap = 'wrap';
  actionContainer.style.gap = '0.5rem';

  if (classified.actions.includes('settings')) {
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'btn btn-primary';
    settingsBtn.textContent = 'Abrir Ajustes';
    settingsBtn.onclick = () => openSettingsModal();
    actionContainer.appendChild(settingsBtn);
  }

  if (classified.actions.includes('retry')) {
    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-secondary';
    retryBtn.textContent = 'Reintentar';
    retryBtn.onclick = () => {
      hideTerminalModal();
      runRealResearchSequence(productName, apiKey, modelName, competitorUrl);
    };
    actionContainer.appendChild(retryBtn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-secondary';
  closeBtn.textContent = 'Cerrar';
  closeBtn.onclick = () => hideTerminalModal();
  actionContainer.appendChild(closeBtn);

  output.appendChild(actionContainer);
  output.scrollTop = output.scrollHeight;
  fill.style.backgroundColor = 'var(--accent-red)';
  label.textContent = classified.title;
}

function addLogTerminal(output, text, type = 'info') {
  const line = document.createElement('div');
  line.className = `term-line ${type}`;
  line.textContent = text;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function preserveOrDefault(value, defaultVal) {
  if (isSkipMessage(value)) return value;
  return value ?? defaultVal;
}

async function runApiStep({
  stepId,
  stepIndex,
  totalSteps,
  productName,
  competitorUrl,
  partialReport,
  modelWithSearch,
  modelWithoutSearch,
  isGroundingEnabled,
  addLog,
  fill,
  label,
  abortSignal,
}) {
  const meta = getCopilotStepMeta(stepId);
  const stepNum = stepIndex + 1;
  const useSearch = stepId === COPILOT_STEPS.BASE_REPORT && isGroundingEnabled;
  const model = useSearch ? modelWithSearch : modelWithoutSearch;
  const progress = STEP_PROGRESS[stepId] || { pct: 50, label: meta.title };

  addLog(`[${stepNum}/${totalSteps}] [RUN] ${meta.short}...`, 'info');
  if (stepId === COPILOT_STEPS.BASE_REPORT && isGroundingEnabled) {
    addLog(
      `🔍 Realizando búsquedas en Google Search por competidores, reviews y dolores en foros...`,
      'info'
    );
  }

  const fastMode = isFastResearchMode();
  fill.style.width = fastMode && stepId === COPILOT_STEPS.BASE_REPORT ? '30%' : `${progress.pct}%`;
  label.textContent = `${progress.label} (Paso ${stepNum} de ${totalSteps})...`;

  const prompt = buildApiPrompt(stepId, {
    productName,
    competitorUrl,
    priorReport: partialReport,
    useGrounding: isGroundingEnabled,
    outputLanguage: state.outputLanguage || 'es',
  });

  const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
  const payloadNoSearch = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };

  const result = await generateContentWithRetry(
    model,
    payload,
    addLog,
    meta.title,
    TRANSIENT_MAX_RETRIES,
    useSearch ? modelWithoutSearch : null,
    useSearch ? payloadNoSearch : null,
    abortSignal
  );

  throwIfAborted(abortSignal);

  const text = result.response.text();
  let nextReport = partialReport;

  try {
    const parsed = parseAndValidateStep(stepId, text);
    nextReport = applyStepToReport(partialReport, stepId, parsed);
    addLog(`✅ [SUCCESS] Paso ${stepNum} completado.`, 'success');

    if (stepId === COPILOT_STEPS.BASE_REPORT) {
      const metadata = result.response.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        addLog(`🔗 Páginas web consultadas para esta investigación:`, 'info');
        metadata.groundingChunks.forEach((chunk) => {
          if (chunk.web?.uri) {
            addLog(`   * ${chunk.web.title || chunk.web.uri} -> ${chunk.web.uri}`, 'success');
          }
        });
      }
    }
  } catch (e) {
    if (stepId === COPILOT_STEPS.BASE_REPORT) {
      throw new Error(
        `El reporte de copywriting no pudo ser parseado como un objeto válido: ${e.message}`
      );
    }
    addLog(
      `⚠️ ${getIncompleteStepLabel(stepId)}: respuesta no válida — sección marcada como incompleta. Reintenta o usa Modo Completo/Copiloto.`,
      'warning'
    );
    const fallback = getIncompleteStepPayload(stepId);
    nextReport = applyStepToReport(partialReport, stepId, fallback);
    nextReport = mergeIncompleteSections(nextReport, stepId);
  }

  return nextReport;
}

export async function runRealResearchSequence(productName, apiKey, modelName, competitorUrl = '') {
  const modal = document.getElementById('terminal-modal');
  const output = document.getElementById('terminal-output');
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  const cancelBtn = document.getElementById('terminal-cancel-btn');
  const closeHint = document.getElementById('terminal-close-hint');

  const abortSignal = startResearchSession(productName, competitorUrl);

  modal.classList.remove('hidden');
  bindTerminalModalA11y();
  output.innerHTML = '';
  fill.style.width = '0%';
  fill.style.backgroundColor = 'var(--accent-cyan)';
  if (closeHint) {
    closeHint.innerHTML =
      '<i data-lucide="info"></i> Usa <strong>Cancelar investigación</strong> para detener la ejecución de forma segura.';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  const onCancel = () => {
    cancelResearchSession(true);
    addLogTerminal(output, '⏹ Investigación cancelada por el usuario.', 'warning');
    label.textContent = 'Cancelado';
    fill.style.backgroundColor = 'var(--accent-amber)';
  };
  if (cancelBtn) {
    cancelBtn.onclick = onCancel;
    cancelBtn.classList.remove('hidden');
  }

  const addLog = (text, type = 'info') => addLogTerminal(output, text, type);

  const isGroundingEnabled = isGeminiGroundingEnabled();
  const fastMode = isFastResearchMode();
  const steps = getApiStepList(fastMode);
  const totalSteps = steps.length;

  addLog(
    `🚀 INICIANDO INVESTIGACIÓN EN VIVO CON GOOGLE GEMINI (${modelName.toUpperCase()})...`,
    'header-line'
  );
  if (fastMode) {
    addLog(`⚡ Modo Rápido activo — menos pasos Gemini, menos costo / menos profundidad.`, 'info');
  }
  if (isGroundingEnabled) {
    addLog(
      `📡 Búsqueda en Google Search Grounding ACTIVADA. Buscando en foros, Amazon y Reddit...`,
      'info'
    );
  } else {
    addLog(
      `📡 Búsqueda en Google Search Grounding DESACTIVADA. Utilizando base de conocimiento del modelo...`,
      'info'
    );
  }
  if (competitorUrl) {
    addLog(
      `🔗 URL de Competidor provista: "${competitorUrl}". Analizando ganchos y ángulos del competidor...`,
      'info'
    );
  }
  fill.style.width = '5%';
  label.textContent = 'Estableciendo conexión con Gemini...';

  try {
    let modelWithSearch;
    let modelWithoutSearch;
    const useProxy = apiKey === 'proxy';

    if (useProxy) {
      addLog(`🔐 Usando proxy seguro Supabase (clave Gemini en servidor)...`, 'info');
      modelWithSearch = createProxyGenerativeModel({ model: modelName, useSearch: isGroundingEnabled });
      modelWithoutSearch = createProxyGenerativeModel({ model: modelName, useSearch: false });
    } else {
      addLog(`🔑 Usando BYOK — clave Gemini personal (llamadas directas a Google)...`, 'info');
      const genAI = new GoogleGenerativeAI(apiKey);

      let tools = [];
      if (isGroundingEnabled) {
        if (
          modelName.startsWith('gemini-2') ||
          modelName.startsWith('gemini-exp') ||
          modelName.includes('2.0') ||
          modelName.includes('2.5')
        ) {
          tools.push({ googleSearch: {} });
        } else {
          tools.push({ googleSearchRetrieval: {} });
        }
      }

      modelWithSearch = genAI.getGenerativeModel({
        model: modelName,
        tools: tools.length > 0 ? tools : undefined,
      });

      modelWithoutSearch = genAI.getGenerativeModel({
        model: modelName,
      });
    }

    let partialReport = { name: productName };

    for (let i = 0; i < steps.length; i++) {
      partialReport = await runApiStep({
        stepId: steps[i],
        stepIndex: i,
        totalSteps,
        productName,
        competitorUrl,
        partialReport,
        modelWithSearch,
        modelWithoutSearch,
        isGroundingEnabled,
        addLog,
        fill,
        label,
        abortSignal,
      });
    }

    throwIfAborted(abortSignal);

    let finalReport = assembleCopilotReport(partialReport, {
      fastMode,
      expressMode: false,
      competitorUrl,
      productName,
    });
    finalReport = sanitizeReport(finalReport);
    finalReport._source = 'api';
    finalReport._generatedAt = finalReport._generatedAt || new Date().toISOString();
    finalReport.productScore = calculateProductScore(finalReport);

    state.currentReport = finalReport;

    if (fastMode) {
      addLog(`🎉 REPORTE MODO RÁPIDO LISTO — secciones omitidas marcadas honestamente.`, 'header-line');
      addLog(
        `ℹ️ Para Avatar Brief, UGC, landing y emails: cambia a Modo Completo y re-ejecuta.`,
        'info'
      );
    } else if (finalReport._incompleteSections?.length) {
      addLog(
        `⚠️ Reporte con secciones incompletas: ${finalReport._incompleteSections.join(', ')}`,
        'warning'
      );
    } else {
      addLog(`🎉 COMPILANDO REPORTE COMPLETO EN LA INTERFAZ DE USUARIO...`, 'header-line');
    }

    fill.style.width = '100%';
    label.textContent = fastMode ? 'Completado (Modo Rápido).' : 'Completado.';
    if (cancelBtn) cancelBtn.classList.add('hidden');

    persistResearchReport(finalReport).catch(() => {
      /* offline */
    });

    setTimeout(() => {
      if (isResearchAborted(abortSignal)) return;
      hideTerminalModal();
      openDeepResearchReport(finalReport);
    }, 1000);
  } catch (error) {
    if (isResearchAborted(abortSignal)) {
      if (cancelBtn) cancelBtn.classList.add('hidden');
      return;
    }
    if (cancelBtn) cancelBtn.classList.add('hidden');
    renderResearchErrorUI(
      modal,
      output,
      fill,
      label,
      error,
      productName,
      apiKey,
      modelName,
      competitorUrl
    );
  }
}

export function sanitizeReport(report) {
  if (!report) return {};

  const isFastReport = report._researchMode === 'fast';
  const isExpressReport = report._researchMode === 'express';
  const skipMsg = FAST_MODE_SKIP_MSG;

  const sanitized = {
    name: report.name || 'Producto Sin Nombre',
    categoryId: report.categoryId || 'general',
    cost: typeof report.cost === 'number' ? report.cost : parseFloat(report.cost) || 10.0,
    retail: typeof report.retail === 'number' ? report.retail : parseFloat(report.retail) || 29.9,
    margin: typeof report.margin === 'number' ? report.margin : parseFloat(report.margin) || 19.9,
    roi: typeof report.roi === 'number' ? report.roi : parseInt(report.roi, 10) || 199,
    shipping: typeof report.shipping === 'number' ? report.shipping : parseInt(report.shipping, 10) || 10,
    saturation:
      typeof report.saturation === 'number' ? report.saturation : parseInt(report.saturation, 10) || 30,
    trend: report.trend || '+50%',
    suppliers: report.suppliers || [],
    demographics: {
      who: preserveOrDefault(report.demographics?.who, 'Público interesado.'),
      attitudes: preserveOrDefault(report.demographics?.attitudes, ''),
      belief: preserveOrDefault(report.demographics?.belief, 'Hay una solución.'),
      dreams: preserveOrDefault(report.demographics?.dreams, ''),
      defeats: preserveOrDefault(report.demographics?.defeats, ''),
      outsideForces: preserveOrDefault(report.demographics?.outsideForces, ''),
      prejudices: preserveOrDefault(report.demographics?.prejudices, ''),
    },
    solutions: {
      current: preserveOrDefault(report.solutions?.current, ''),
      experience: preserveOrDefault(report.solutions?.experience, ''),
      likes: preserveOrDefault(report.solutions?.likes, ''),
      dislikes: preserveOrDefault(report.solutions?.dislikes, ''),
      skepticism: preserveOrDefault(report.solutions?.skepticism, ''),
      horrorStories: report.solutions?.horrorStories || [],
    },
    secrets: {
      historical: preserveOrDefault(report.secrets?.historical, ''),
      conspiracy: preserveOrDefault(report.secrets?.conspiracy, ''),
      mechanismProblem: preserveOrDefault(report.secrets?.mechanismProblem, ''),
      mechanismSolution: preserveOrDefault(report.secrets?.mechanismSolution, ''),
    },
    eden: {
      goldenAge: preserveOrDefault(report.eden?.goldenAge, ''),
      corruptor: preserveOrDefault(report.eden?.corruptor, ''),
      contrast: preserveOrDefault(report.eden?.contrast, ''),
    },
    verbatims: report.verbatims || [],
    angles: report.angles || [],
    avatarBrief: report.avatarBrief || {},
    offerBrief: report.offerBrief || {},
    ugcScripts: report.ugcScripts || [],
    landingPage: report.landingPage || { outline: [], html: '' },
    competitorAnalysis: report.competitorAnalysis || {
      competitorsGanchos: [],
      ourGanchos: [],
      weaknesses: '',
      differentiation: '',
    },
    emailSequence: report.emailSequence || [],
    adCopy: report.adCopy || { facebook: [], tiktok: [] },
    shopifyDescription: report.shopifyDescription || {
      title: report.name,
      metaDescription: '',
      body: '',
      faq: [],
    },
    competitorUrl: report.competitorUrl || '',
    _researchMode: report._researchMode || 'complete',
    _source: report._source || 'api',
    _generatedAt: report._generatedAt || null,
    _incompleteSections: report._incompleteSections || [],
    manualEvaluation: report.manualEvaluation || null,
    _isDraft: report._isDraft || false,
  };

  if (isFastReport || isExpressReport) {
    const skipped = buildFastModeReport(
      report,
      report.adCopy ? { adCopy: report.adCopy, headlines: report.offerBrief?.headlines || [] } : {
        adCopy: { facebook: [], tiktok: [] },
        headlines: [],
      },
      report.competitorUrl || ''
    );
    Object.assign(sanitized, {
      avatarBrief: report.avatarBrief?.general?.age && !isSkipMessage(report.avatarBrief.general.age)
        ? report.avatarBrief
        : skipped.avatarBrief,
      offerBrief: {
        ...skipped.offerBrief,
        headlines: report.offerBrief?.headlines?.length
          ? report.offerBrief.headlines
          : skipped.offerBrief.headlines,
      },
      ugcScripts: report.ugcScripts?.length ? report.ugcScripts : skipped.ugcScripts,
      landingPage: report.landingPage?.html ? report.landingPage : skipped.landingPage,
      competitorAnalysis:
        report.competitorAnalysis?.weaknesses &&
        !isSkipMessage(report.competitorAnalysis.weaknesses)
          ? report.competitorAnalysis
          : skipped.competitorAnalysis,
      emailSequence: report.emailSequence?.length ? report.emailSequence : skipped.emailSequence,
      shopifyDescription:
        report.shopifyDescription?.body && !isSkipMessage(report.shopifyDescription.body)
          ? report.shopifyDescription
          : skipped.shopifyDescription,
    });
  }

  return sanitized;
}
