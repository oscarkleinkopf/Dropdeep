import { isFastResearchMode } from '../config/researchMode.js';
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
import { sanitizeReport } from './gemini.js';
import { calculateProductScore } from './scoring.js';
import { persistResearchReport } from './historySync.js';
import { state } from '../state.js';

let session = null;

export function getCopilotSession() {
  return session;
}

export function startCopilotSession(productName, competitorUrl = '') {
  const fastMode = isFastResearchMode();
  const steps = getCopilotStepList(fastMode);

  session = {
    productName,
    competitorUrl,
    fastMode,
    steps,
    currentStepIndex: 0,
    partialReport: { name: productName },
    completed: false,
  };

  return session;
}

export function cancelCopilotSession() {
  session = null;
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

/**
 * Process pasted chatbot response for the current step.
 * @returns {{ ok: true, report?: object, done: boolean, nextStep?: object } | { ok: false, error: string }}
 */
export function processCopilotPaste(rawText) {
  if (!session) {
    return { ok: false, error: 'No hay sesión de copiloto activa.' };
  }

  const stepId = session.steps[session.currentStepIndex];

  try {
    const parsed = parseAndValidateStep(stepId, rawText);
    session.partialReport = applyStepToReport(session.partialReport, stepId, parsed);
    session.currentStepIndex += 1;

    if (session.currentStepIndex >= session.steps.length) {
      session.completed = true;
      let finalReport = assembleCopilotReport(session.partialReport, {
        fastMode: session.fastMode,
        competitorUrl: session.competitorUrl,
        productName: session.productName,
      });
      finalReport = sanitizeReport(finalReport);
      finalReport.productScore = calculateProductScore(finalReport);
      state.currentReport = finalReport;
      persistResearchReport(finalReport).catch(() => { /* offline */ });
      const doneSession = session;
      session = null;
      return { ok: true, report: finalReport, done: true, session: doneSession };
    }

    return {
      ok: true,
      done: false,
      nextStep: getCurrentCopilotStep(),
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'No se pudo interpretar la respuesta como JSON válido.',
    };
  }
}

export function retryCopilotStep() {
  /* Stay on same step — UI clears textarea */
  return getCurrentCopilotStep();
}
