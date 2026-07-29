import { cleanAndParseJSON } from '../utils/json.js';
import { COPILOT_STEPS } from './reportSchema.js';
import { buildFastModeReport } from './fastMode.js';

/** Parse pasted chatbot response — same pipeline as API path. */
export function parseResearchJson(rawText) {
  if (!rawText || !String(rawText).trim()) {
    throw new Error('La respuesta está vacía.');
  }
  return cleanAndParseJSON(String(rawText));
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Minimum structural validation per step — rejects garbage without fabricating data. */
export function validateStepPayload(stepId, parsed) {
  if (!isObject(parsed)) {
    throw new Error('La respuesta debe ser un objeto JSON.');
  }

  switch (stepId) {
    case COPILOT_STEPS.BASE_REPORT:
      if (!parsed.name && !parsed.demographics) {
        throw new Error('Falta el reporte base: se espera al menos "name" o "demographics".');
      }
      break;
    case COPILOT_STEPS.AVATAR_BRIEF:
      if (!isObject(parsed.general)) {
        throw new Error('Avatar Brief inválido: falta el objeto "general".');
      }
      break;
    case COPILOT_STEPS.OFFER_BRIEF:
      if (!parsed.bigIdea && (!Array.isArray(parsed.names) || parsed.names.length === 0)) {
        throw new Error('Offer Brief inválido: falta "bigIdea" o "names".');
      }
      break;
    case COPILOT_STEPS.CREATIVES:
      if (!Array.isArray(parsed.ugcScripts) && !isObject(parsed.landingPage)) {
        throw new Error('Creativos inválidos: falta "ugcScripts" o "landingPage".');
      }
      break;
    case COPILOT_STEPS.MARKETING_ASSETS:
      if (!parsed.adCopy && !Array.isArray(parsed.emailSequence)) {
        throw new Error('Marketing inválido: falta "adCopy" o "emailSequence".');
      }
      break;
    case COPILOT_STEPS.FAST_MARKETING:
      if (!parsed.adCopy && !Array.isArray(parsed.headlines)) {
        throw new Error('Copys rápidos inválidos: falta "adCopy" o "headlines".');
      }
      break;
    case COPILOT_STEPS.ALL_IN_ONE:
      if (!parsed.name && !parsed.demographics) {
        throw new Error('Reporte express inválido: falta "name" o "demographics".');
      }
      if (!parsed.adCopy && !Array.isArray(parsed.headlines)) {
        throw new Error('Reporte express inválido: falta "adCopy" o "headlines".');
      }
      break;
    default:
      break;
  }

  return true;
}

/** Merge a validated step payload into the accumulating report. */
export function applyStepToReport(report, stepId, parsed) {
  const next = { ...report };

  switch (stepId) {
    case COPILOT_STEPS.BASE_REPORT:
      Object.assign(next, parsed);
      if (isObject(parsed.demographics)) {
        next.demographics = { ...(next.demographics || {}), ...parsed.demographics };
      }
      if (isObject(parsed.solutions)) {
        next.solutions = { ...(next.solutions || {}), ...parsed.solutions };
      }
      if (isObject(parsed.secrets)) {
        next.secrets = { ...(next.secrets || {}), ...parsed.secrets };
      }
      if (isObject(parsed.eden)) {
        next.eden = { ...(next.eden || {}), ...parsed.eden };
      }
      break;

    case COPILOT_STEPS.AVATAR_BRIEF:
      next.avatarBrief = parsed;
      break;

    case COPILOT_STEPS.OFFER_BRIEF:
      next.offerBrief = parsed;
      break;

    case COPILOT_STEPS.CREATIVES:
      next.ugcScripts = parsed.ugcScripts || [];
      next.landingPage = parsed.landingPage || { outline: [], html: '' };
      next.competitorAnalysis = parsed.competitorAnalysis || {
        competitorsGanchos: [],
        ourGanchos: [],
        weaknesses: '',
        differentiation: '',
      };
      break;

    case COPILOT_STEPS.MARKETING_ASSETS:
      next.emailSequence = parsed.emailSequence || [];
      next.adCopy = parsed.adCopy || { facebook: [], tiktok: [] };
      next.shopifyDescription = parsed.shopifyDescription || {
        title: next.name,
        metaDescription: '',
        body: '',
        faq: [],
      };
      break;

    case COPILOT_STEPS.FAST_MARKETING:
      next._fastMarketing = parsed;
      break;

    case COPILOT_STEPS.ALL_IN_ONE:
      Object.assign(next, parsed);
      if (isObject(parsed.demographics)) {
        next.demographics = { ...(next.demographics || {}), ...parsed.demographics };
      }
      if (isObject(parsed.solutions)) {
        next.solutions = { ...(next.solutions || {}), ...parsed.solutions };
      }
      if (isObject(parsed.secrets)) {
        next.secrets = { ...(next.secrets || {}), ...parsed.secrets };
      }
      if (isObject(parsed.eden)) {
        next.eden = { ...(next.eden || {}), ...parsed.eden };
      }
      next._fastMarketing = {
        headlines: parsed.headlines || [],
        adCopy: parsed.adCopy || { facebook: [], tiktok: [] },
      };
      break;

    default:
      break;
  }

  return next;
}

/** Assemble final report after all copilot steps — same shape as API output. */
export function assembleCopilotReport(
  partialReport,
  { fastMode, expressMode, competitorUrl, productName }
) {
  let report = { ...partialReport, name: partialReport.name || productName };

  if (expressMode && partialReport._fastMarketing) {
    report = buildFastModeReport(report, partialReport._fastMarketing, competitorUrl);
    delete report._fastMarketing;
    report._researchMode = 'express';
  } else if (fastMode && partialReport._fastMarketing) {
    report = buildFastModeReport(report, partialReport._fastMarketing, competitorUrl);
    delete report._fastMarketing;
    report._researchMode = 'fast';
  } else if (!fastMode && !expressMode) {
    report._researchMode = 'complete';
  }

  report.competitorUrl = competitorUrl || report.competitorUrl || '';
  report._source = report._source || 'copilot';
  report._generatedAt = report._generatedAt || new Date().toISOString();

  return report;
}

/** Parse + validate a copilot step response. Throws on failure. */
export function parseAndValidateStep(stepId, rawText) {
  const parsed = parseResearchJson(rawText);
  validateStepPayload(stepId, parsed);
  return parsed;
}
