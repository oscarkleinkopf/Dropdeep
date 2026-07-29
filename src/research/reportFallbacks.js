import { FAST_MODE_SKIP_MSG, buildFastModeSkippedSections } from './fastMode.js';
import { COPILOT_STEPS } from './reportSchema.js';

/** Shown when an API/copilot step fails to parse — never invent product-specific copy. */
export const SECTION_SKIP_MSG =
  'No generado — reintenta o usa Completo/Copiloto.';

export { FAST_MODE_SKIP_MSG };

const STEP_LABELS = {
  [COPILOT_STEPS.AVATAR_BRIEF]: 'Avatar Brief',
  [COPILOT_STEPS.OFFER_BRIEF]: 'Offer Brief',
  [COPILOT_STEPS.CREATIVES]: 'Activos creativos',
  [COPILOT_STEPS.MARKETING_ASSETS]: 'Materiales de marketing',
  [COPILOT_STEPS.FAST_MARKETING]: 'Copys publicitarios',
  [COPILOT_STEPS.ALL_IN_ONE]: 'Reporte express',
};

export function isSkipMessage(value) {
  if (typeof value !== 'string') return false;
  return value === SECTION_SKIP_MSG || value === FAST_MODE_SKIP_MSG;
}

export function getIncompleteStepLabel(stepId) {
  return STEP_LABELS[stepId] || stepId;
}

/** Minimal honest placeholder for a failed step — no fabricated product copy. */
export function getIncompleteStepPayload(stepId) {
  const skipped = buildFastModeSkippedSections();

  switch (stepId) {
    case COPILOT_STEPS.AVATAR_BRIEF:
      return skipped.avatarBrief;
    case COPILOT_STEPS.OFFER_BRIEF:
      return skipped.offerBrief;
    case COPILOT_STEPS.CREATIVES:
      return {
        ugcScripts: [],
        landingPage: skipped.landingPage,
        competitorAnalysis: skipped.competitorAnalysis,
      };
    case COPILOT_STEPS.MARKETING_ASSETS:
      return {
        emailSequence: [],
        adCopy: { facebook: [], tiktok: [] },
        shopifyDescription: skipped.shopifyDescription,
      };
    case COPILOT_STEPS.FAST_MARKETING:
      return {
        headlines: [SECTION_SKIP_MSG],
        adCopy: { facebook: [], tiktok: [] },
      };
    default:
      return {};
  }
}

export function mergeIncompleteSections(report, stepId) {
  const label = getIncompleteStepLabel(stepId);
  const sections = [...(report._incompleteSections || [])];
  if (!sections.includes(label)) sections.push(label);
  return { ...report, _incompleteSections: sections };
}
