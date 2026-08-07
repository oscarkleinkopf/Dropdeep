/**
 * Normaliza reportes de IA sin depender del SDK Gemini (T52).
 */
import { buildFastModeReport, FAST_MODE_SKIP_MSG } from './fastMode.js';
import { isSkipMessage } from './reportFallbacks.js';

function preserveOrDefault(value, defaultVal) {
  if (isSkipMessage(value)) return value;
  return value ?? defaultVal;
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
