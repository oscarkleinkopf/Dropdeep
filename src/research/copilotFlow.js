import { getResearchMode } from '../config/researchMode.js';
import {
  buildCopilotPrompt,
  getCopilotStepList,
  getCopilotStepMeta,
} from '../research/reportSchema.js';
import {
  applyStepToReport,
  assembleCopilotReport,
  parseAndValidateStep,
} from '../research/reportParse.js';
import { sanitizeReport } from './reportSanitize.js';
import { calculateProductScore } from './scoring.js';
import { persistResearchReport } from './historySync.js';
import { state } from '../state.js';

const STORAGE_KEY = 'dropdeep_copilot_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

let session = null;

function persistCopilotSessionToStorage() {
  if (!session || session.completed) return;
  const payload = {
    productName: session.productName,
    competitorUrl: session.competitorUrl || '',
    mode: session.mode,
    fastMode: session.fastMode,
    expressMode: session.expressMode,
    steps: session.steps,
    currentStepIndex: session.currentStepIndex,
    partialReport: session.partialReport,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded — non-fatal */
  }
}

function clearStoredCopilotSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredCopilotSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.productName || !Array.isArray(data.steps)) {
      clearStoredCopilotSession();
      return null;
    }
    const age = Date.now() - new Date(data.updatedAt || 0).getTime();
    if (Number.isNaN(age) || age > SESSION_MAX_AGE_MS) {
      clearStoredCopilotSession();
      return null;
    }
    return data;
  } catch {
    clearStoredCopilotSession();
    return null;
  }
}

export function restoreCopilotSession(stored) {
  if (!stored) return null;
  session = {
    productName: stored.productName,
    competitorUrl: stored.competitorUrl || '',
    mode: stored.mode,
    fastMode: !!stored.fastMode,
    expressMode: !!stored.expressMode,
    steps: stored.steps,
    currentStepIndex: stored.currentStepIndex ?? 0,
    partialReport: stored.partialReport || { name: stored.productName },
    completed: false,
  };
  return session;
}

export function getCopilotSession() {
  return session;
}

export function startCopilotSession(productName, competitorUrl = '') {
  const mode = getResearchMode();
  const steps = getCopilotStepList(mode);

  session = {
    productName,
    competitorUrl,
    mode,
    fastMode: mode === 'fast',
    expressMode: mode === 'express',
    steps,
    currentStepIndex: 0,
    partialReport: { name: productName },
    completed: false,
  };

  persistCopilotSessionToStorage();
  return session;
}

/** Explicit cancel/discard — clears memory and localStorage. */
export function cancelCopilotSession() {
  session = null;
  clearStoredCopilotSession();
}

/** Hide panel but keep draft persisted for resume. */
export function pauseCopilotSession() {
  persistCopilotSessionToStorage();
}

export function getCurrentCopilotStep() {
  if (!session) return null;
  const stepId = session.steps[session.currentStepIndex];
  return {
    index: session.currentStepIndex,
    total: session.steps.length,
    stepId,
    meta: getCopilotStepMeta(stepId),
    prompt: buildCopilotPrompt(stepId, {
      productName: session.productName,
      competitorUrl: session.competitorUrl,
      priorReport: session.partialReport,
    }),
  };
}

/** Pasos ya aceptados (índices &lt; currentStepIndex). No muta la sesión. */
export function getCompletedCopilotSteps() {
  if (!session) return [];
  const completed = [];
  for (let i = 0; i < session.currentStepIndex; i++) {
    const stepId = session.steps[i];
    completed.push({
      index: i,
      stepId,
      meta: getCopilotStepMeta(stepId),
      prompt: buildCopilotPrompt(stepId, {
        productName: session.productName,
        competitorUrl: session.competitorUrl,
        priorReport: session.partialReport,
      }),
    });
  }
  return completed;
}

/** Prompt de un paso ya completado (solo lectura). null si el índice no es válido. */
export function peekCompletedCopilotStep(stepIndex) {
  if (!session) return null;
  const idx = Number(stepIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= session.currentStepIndex) {
    return null;
  }
  const stepId = session.steps[idx];
  return {
    index: idx,
    total: session.steps.length,
    stepId,
    meta: getCopilotStepMeta(stepId),
    prompt: buildCopilotPrompt(stepId, {
      productName: session.productName,
      competitorUrl: session.competitorUrl,
      priorReport: session.partialReport,
    }),
    readOnly: true,
  };
}

/** True si aún hay pasos completados que se pueden revisar. */
export function canPeekPreviousCopilotStep() {
  return !!session && session.currentStepIndex > 0;
}

/**
 * Process pasted chatbot response for the current step.
 * On validation/parse error the index is NOT advanced (T07).
 * @returns {{ ok: true, report?: object, done: boolean, nextStep?: object } | { ok: false, error: string }}
 */
export function processCopilotPaste(rawText) {
  if (!session) {
    return { ok: false, error: 'No hay sesión de copiloto activa.' };
  }

  const stepId = session.steps[session.currentStepIndex];
  const indexBefore = session.currentStepIndex;

  try {
    const parsed = parseAndValidateStep(stepId, rawText);
    session.partialReport = applyStepToReport(session.partialReport, stepId, parsed);
    session.currentStepIndex += 1;

    if (session.currentStepIndex >= session.steps.length) {
      session.completed = true;
      let finalReport = assembleCopilotReport(session.partialReport, {
        fastMode: session.fastMode,
        expressMode: session.expressMode,
        competitorUrl: session.competitorUrl,
        productName: session.productName,
      });
      finalReport = sanitizeReport(finalReport);
      finalReport.productScore = calculateProductScore(finalReport);
      state.currentReport = finalReport;
      persistResearchReport(finalReport).catch(() => { /* offline */ });
      const doneSession = session;
      session = null;
      clearStoredCopilotSession();
      return { ok: true, report: finalReport, done: true, session: doneSession };
    }

    persistCopilotSessionToStorage();

    return {
      ok: true,
      done: false,
      nextStep: getCurrentCopilotStep(),
    };
  } catch (err) {
    // Do not advance — preserve partialReport and currentStepIndex
    if (session.currentStepIndex !== indexBefore) {
      session.currentStepIndex = indexBefore;
    }
    return {
      ok: false,
      error: err.message || 'No se pudo interpretar la respuesta como JSON válido.',
      currentStepIndex: session.currentStepIndex,
    };
  }
}

export function retryCopilotStep() {
  /* Stay on same step — UI clears textarea */
  return getCurrentCopilotStep();
}
