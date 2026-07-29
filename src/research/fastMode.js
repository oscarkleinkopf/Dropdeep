/** Helpers for modo Rápido — honest placeholders, no fake data. */

export const FAST_MODE_SKIP_MSG =
  'No generado en modo rápido — corre Completo para obtener esta sección.';

function skippedText() {
  return FAST_MODE_SKIP_MSG;
}

function skippedList() {
  return [FAST_MODE_SKIP_MSG];
}

export function buildFastModeSkippedSections() {
  const msg = skippedText();
  return {
    avatarBrief: {
      general: {
        age: msg,
        gender: msg,
        location: msg,
        income: msg,
        background: msg,
        identities: msg,
      },
      painPoints: {
        p1: { name: msg, list: skippedList() },
        p2: { name: msg, list: skippedList() },
        p3: { name: msg, list: skippedList() },
      },
      goals: { short: skippedList(), long: skippedList() },
      emotionalDrivers: skippedList(),
      quotes: {
        general: skippedList(),
        pain: skippedList(),
        mindset: skippedList(),
        emotional: skippedList(),
        responses: skippedList(),
        success: skippedList(),
      },
      fears: skippedList(),
      insights: skippedList(),
      journey: {
        awareness: msg,
        frustración: msg,
        desesperación: msg,
        alivio: msg,
      },
    },
    offerBrief: {
      names: skippedList(),
      awareness: msg,
      sophistication: msg,
      bigIdea: msg,
      metaphor: msg,
      ump: msg,
      ums: msg,
      guru: msg,
      discovery: msg,
      product: msg,
      headlines: skippedList(),
      objections: skippedList(),
      beliefs: skippedList(),
      funnel: msg,
      domains: skippedList(),
      swipes: skippedList(),
      otherNotes: msg,
    },
    ugcScripts: [],
    landingPage: {
      outline: [{ title: msg, desc: msg }],
      html: '',
    },
    competitorAnalysis: {
      competitorsGanchos: skippedList(),
      ourGanchos: skippedList(),
      weaknesses: msg,
      differentiation: msg,
    },
    emailSequence: [],
    shopifyDescription: {
      title: msg,
      metaDescription: msg,
      body: `<p>${msg}</p>`,
      faq: [{ q: msg, a: msg }],
    },
  };
}

export function buildFastModeReport(baseReport, fastMarketing, competitorUrl = '') {
  const skipped = buildFastModeSkippedSections();
  return {
    ...baseReport,
    ...skipped,
    adCopy: fastMarketing.adCopy || { facebook: [], tiktok: [] },
    offerBrief: {
      ...skipped.offerBrief,
      headlines: fastMarketing.headlines?.length
        ? fastMarketing.headlines
        : skipped.offerBrief.headlines,
      product: baseReport.name,
    },
    competitorUrl,
    _researchMode: 'fast',
  };
}
