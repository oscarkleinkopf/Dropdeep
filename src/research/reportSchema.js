/** JSON schemas and copilot prompt builders — shared by API and Modo Copiloto. */

export const COPILOT_STEPS = {
  BASE_REPORT: 'baseReport',
  AVATAR_BRIEF: 'avatarBrief',
  OFFER_BRIEF: 'offerBrief',
  CREATIVES: 'creatives',
  MARKETING_ASSETS: 'marketingAssets',
  FAST_MARKETING: 'fastMarketing',
  ALL_IN_ONE: 'allInOne',
};

const JSON_ONLY_RULE = `
IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. Sin markdown, sin bloques \`\`\`, sin texto antes ni después.
Si no conoces un dato exacto, estima de forma razonable basándote en tu conocimiento del mercado de dropshipping.
Todos los textos deben estar en español.`;

export function getApiStepList(fastMode) {
  if (fastMode) {
    return [COPILOT_STEPS.BASE_REPORT, COPILOT_STEPS.FAST_MARKETING];
  }
  return [
    COPILOT_STEPS.BASE_REPORT,
    COPILOT_STEPS.AVATAR_BRIEF,
    COPILOT_STEPS.OFFER_BRIEF,
    COPILOT_STEPS.CREATIVES,
    COPILOT_STEPS.MARKETING_ASSETS,
  ];
}

export function getCopilotStepList(mode) {
  if (mode === 'express') {
    return [COPILOT_STEPS.ALL_IN_ONE];
  }
  if (mode === 'fast') {
    return [COPILOT_STEPS.BASE_REPORT, COPILOT_STEPS.FAST_MARKETING];
  }
  return [
    COPILOT_STEPS.BASE_REPORT,
    COPILOT_STEPS.AVATAR_BRIEF,
    COPILOT_STEPS.OFFER_BRIEF,
    COPILOT_STEPS.CREATIVES,
    COPILOT_STEPS.MARKETING_ASSETS,
  ];
}

/** @deprecated Use getCopilotStepList(mode) or getApiStepList(fastMode). */
export function getCopilotStepListLegacy(fastMode) {
  return getCopilotStepList(fastMode ? 'fast' : 'complete');
}

export function getCopilotStepMeta(stepId) {
  const meta = {
    [COPILOT_STEPS.BASE_REPORT]: {
      title: 'Reporte de mercado y copywriting',
      short: 'Paso 1 — Investigación base',
      chatbotTip: 'Pega en ChatGPT, Gemini, Claude o DeepSeek (versión web gratuita).',
    },
    [COPILOT_STEPS.AVATAR_BRIEF]: {
      title: 'Ficha Avatar Brief',
      short: 'Paso 2 — Avatar psicográfico',
      chatbotTip: 'Usa el mismo chatbot; incluye el reporte del paso anterior si hace falta contexto.',
    },
    [COPILOT_STEPS.OFFER_BRIEF]: {
      title: 'Offer Brief de marketing',
      short: 'Paso 3 — Arquitectura de oferta',
      chatbotTip: 'El prompt ya incluye el reporte previo como contexto.',
    },
    [COPILOT_STEPS.CREATIVES]: {
      title: 'Activos creativos (UGC + landing)',
      short: 'Paso 4 — Scripts UGC y landing',
      chatbotTip: 'Respuesta larga — espera a que termine antes de copiar.',
    },
    [COPILOT_STEPS.MARKETING_ASSETS]: {
      title: 'Materiales de marketing',
      short: 'Paso 5 — Emails, anuncios y Shopify',
      chatbotTip: 'Último paso del modo completo.',
    },
    [COPILOT_STEPS.FAST_MARKETING]: {
      title: 'Copys publicitarios básicos',
      short: 'Paso 2 — Titulares y anuncios',
      chatbotTip: 'Modo rápido: solo copys esenciales.',
    },
    [COPILOT_STEPS.ALL_IN_ONE]: {
      title: 'Reporte express (1 pegado)',
      short: 'Express — investigación + copys en un JSON',
      chatbotTip: 'Modo express: copia un solo prompt, pega una sola respuesta JSON.',
    },
  };
  return meta[stepId] || { title: stepId, short: stepId, chatbotTip: '' };
}

function competitorBlock(competitorUrl) {
  if (!competitorUrl) return '';
  return `Además, el usuario ha proporcionado la URL de un competidor: "${competitorUrl}".
Investiga o deduce su estrategia y extrae ganchos, ángulos creativos y debilidades comparables.`;
}

export function buildCopilotPrompt(stepId, { productName, competitorUrl = '', priorReport = null }) {
  switch (stepId) {
    case COPILOT_STEPS.BASE_REPORT:
      return `Realiza una investigación de mercado profunda en español sobre el producto de dropshipping: "${productName}".
${competitorBlock(competitorUrl)}
Actúa como Investigador de Mercado de Élite y Redactor de Respuesta Directa.
Busca proveedores reales de dropshipping (AliExpress, Alibaba, CJ Dropshipping, Zendrop, etc.) y estima precios.
Devuelve un objeto JSON con este esquema exacto (rellena cada campo con información detallada y coherente):
{
  "name": "${productName}",
  "categoryId": "beauty|pet|health|home|tech|general",
  "cost": 12.5,
  "retail": 39.9,
  "margin": 27.4,
  "roi": 219,
  "shipping": 8,
  "sales": 2500,
  "saturation": 28,
  "trend": "+120%",
  "suppliers": [
    {
      "platform": "AliExpress | CJ Dropshipping | Alibaba | Zendrop | Otro",
      "name": "Nombre del proveedor",
      "price": 10.5,
      "shippingCost": 3.5,
      "shippingTime": "8-12",
      "link": "URL del producto o búsqueda"
    }
  ],
  "demographics": {
    "who": "...",
    "attitudes": "...",
    "dreams": "...",
    "defeats": "...",
    "outsideForces": "...",
    "prejudices": "...",
    "belief": "..."
  },
  "solutions": {
    "current": "...",
    "experience": "...",
    "likes": "...",
    "dislikes": "...",
    "horrorStories": ["...", "...", "..."],
    "skepticism": "..."
  },
  "secrets": {
    "historical": "...",
    "conspiracy": "...",
    "mechanismProblem": "...",
    "mechanismSolution": "..."
  },
  "eden": {
    "goldenAge": "...",
    "corruptor": "...",
    "contrast": "..."
  },
  "verbatims": ["Frase 1", "Frase 2", "... hasta 15 frases"],
  "angles": [
    { "title": "1. Conspiración", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "2. Sabiduría Antigua", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "3. Frustración Empática", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "4. Mecanismo Biológico Simple", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "5. Contraste Ancestral", "narrative": "...", "hook": "...", "headline": "..." }
  ]
}
Calcula margin = retail - cost y roi = Math.round((margin / cost) * 100) de forma congruente.
${JSON_ONLY_RULE}`;

    case COPILOT_STEPS.AVATAR_BRIEF:
      return `Basándote en este reporte de investigación previa sobre "${productName}":
${JSON.stringify(priorReport)}

Genera la ficha Avatar Brief detallada en español. Devuelve JSON con este esquema exacto:
{
  "general": {
    "age": "...",
    "gender": "...",
    "location": "...",
    "income": "...",
    "background": "...",
    "identities": "..."
  },
  "painPoints": {
    "p1": { "name": "...", "list": ["...", "...", "..."] },
    "p2": { "name": "...", "list": ["...", "...", "..."] },
    "p3": { "name": "...", "list": ["...", "...", "..."] }
  },
  "goals": {
    "short": ["...", "...", "..."],
    "long": ["...", "...", "..."]
  },
  "emotionalDrivers": ["...", "...", "..."],
  "quotes": {
    "general": ["...", "...", "..."],
    "pain": ["...", "...", "..."],
    "mindset": ["...", "...", "..."],
    "emotional": ["...", "...", "..."],
    "responses": ["...", "...", "..."],
    "success": ["...", "...", "..."]
  },
  "fears": ["...", "...", "..."],
  "insights": ["...", "...", "..."],
  "journey": {
    "awareness": "...",
    "frustración": "...",
    "desesperación": "...",
    "alivio": "..."
  }
}
${JSON_ONLY_RULE}`;

    case COPILOT_STEPS.OFFER_BRIEF:
      return `Basándote en la investigación y avatar previos sobre "${productName}":
Reporte: ${JSON.stringify(priorReport)}
Avatar: ${JSON.stringify(priorReport?.avatarBrief || {})}

Genera el Offer Brief en español. Devuelve JSON con este esquema exacto:
{
  "names": ["Nombre 1", "Nombre 2", "Nombre 3"],
  "awareness": "...",
  "sophistication": "...",
  "bigIdea": "...",
  "metaphor": "...",
  "ump": "...",
  "ums": "...",
  "guru": "...",
  "discovery": "...",
  "product": "...",
  "headlines": ["...", "...", "..."],
  "objections": [
    "Objeción 1 (Respuesta: ...)",
    "Objeción 2 (Respuesta: ...)",
    "Objeción 3 (Respuesta: ...)",
    "Objeción 4 (Respuesta: ...)"
  ],
  "beliefs": ["...", "...", "..."],
  "funnel": "...",
  "domains": ["...", "...", "..."],
  "swipes": ["...", "...", "..."],
  "otherNotes": "..."
}
${JSON_ONLY_RULE}`;

    case COPILOT_STEPS.CREATIVES:
      return `Basándote en la investigación, avatar y oferta sobre "${productName}":
${JSON.stringify({
        report: priorReport,
        avatarBrief: priorReport?.avatarBrief,
        offerBrief: priorReport?.offerBrief,
      })}
${competitorUrl ? `URL competidor: "${competitorUrl}"` : ''}

Genera activos creativos en español. Devuelve JSON con este esquema exacto:
{
  "ugcScripts": [
    {
      "title": "Script 1: Gancho de Curiosidad (30 seg)",
      "duration": "30 segundos",
      "scenes": [
        { "time": "0:00-0:05", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:05-0:15", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:15-0:30", "visual": "...", "audio": "...", "text": "..." }
      ]
    },
    {
      "title": "Script 2: Enfoque de Dolor Empático (45 seg)",
      "duration": "45 segundos",
      "scenes": [
        { "time": "0:00-0:10", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:10-0:25", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:25-0:45", "visual": "...", "audio": "...", "text": "..." }
      ]
    },
    {
      "title": "Script 3: Mecanismo UMS vs UMP (60 seg)",
      "duration": "60 segundos",
      "scenes": [
        { "time": "0:00-0:15", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:15-0:35", "visual": "...", "audio": "...", "text": "..." },
        { "time": "0:35-0:60", "visual": "...", "audio": "...", "text": "..." }
      ]
    }
  ],
  "landingPage": {
    "outline": [
      { "title": "Sección 1: Hero", "desc": "..." },
      { "title": "Sección 2: Problema (UMP)", "desc": "..." },
      { "title": "Sección 3: Solución (UMS)", "desc": "..." },
      { "title": "Sección 4: Prueba Social", "desc": "..." },
      { "title": "Sección 5: FAQs", "desc": "..." },
      { "title": "Sección 6: Garantía", "desc": "..." }
    ],
    "html": "<!DOCTYPE html>..."
  },
  "competitorAnalysis": {
    "competitorsGanchos": ["...", "...", "..."],
    "ourGanchos": ["...", "...", "..."],
    "weaknesses": "...",
    "differentiation": "..."
  }
}
En "html" escribe HTML5 completo con Tailwind CDN. Escapa comillas internas como \\" y saltos como \\n.
${JSON_ONLY_RULE}`;

    case COPILOT_STEPS.MARKETING_ASSETS:
      return `Basándote en la investigación completa de "${productName}":
${JSON.stringify({
        report: priorReport,
        avatarBrief: priorReport?.avatarBrief,
        offerBrief: priorReport?.offerBrief,
      })}

Genera materiales de marketing en español. Devuelve JSON con este esquema exacto:
{
  "emailSequence": [
    {
      "subject": "Asunto correo 1",
      "preview": "Previsualización",
      "body": "Cuerpo completo con \\n para saltos de línea"
    }
  ],
  "adCopy": {
    "facebook": [
      { "primaryText": "...", "headline": "...", "description": "..." },
      { "primaryText": "...", "headline": "...", "description": "..." },
      { "primaryText": "...", "headline": "...", "description": "..." }
    ],
    "tiktok": [
      { "hook": "...", "body": "...", "cta": "..." },
      { "hook": "...", "body": "...", "cta": "..." },
      { "hook": "...", "body": "...", "cta": "..." }
    ]
  },
  "shopifyDescription": {
    "title": "Título optimizado",
    "metaDescription": "Meta SEO (máx 155 caracteres)",
    "body": "<p>Descripción HTML con beneficios</p>",
    "faq": [
      { "q": "Pregunta 1", "a": "Respuesta 1" },
      { "q": "Pregunta 2", "a": "Respuesta 2" },
      { "q": "Pregunta 3", "a": "Respuesta 3" }
    ]
  }
}
Incluye 5 correos en emailSequence (Bienvenida → Dolor → Mecanismo → Oferta → Recordatorio).
${JSON_ONLY_RULE}`;

    case COPILOT_STEPS.FAST_MARKETING:
      return `Basándote en este reporte de investigación sobre "${productName}":
${JSON.stringify(priorReport)}

Genera copys publicitarios básicos en español. Devuelve JSON con este esquema exacto:
{
  "headlines": ["Titular 1", "Titular 2", "Titular 3"],
  "adCopy": {
    "facebook": [
      { "primaryText": "...", "headline": "...", "description": "..." },
      { "primaryText": "...", "headline": "...", "description": "..." }
    ],
    "tiktok": [
      { "hook": "...", "body": "...", "cta": "..." },
      { "hook": "...", "body": "...", "cta": "..." }
    ]
  }
}
${JSON_ONLY_RULE}`;

    case COPILOT_STEPS.ALL_IN_ONE:
      return `Realiza una investigación de mercado en español sobre el producto de dropshipping: "${productName}".
${competitorBlock(competitorUrl)}
Actúa como Investigador de Mercado de Élite y Redactor de Respuesta Directa.
Genera UN SOLO objeto JSON que combine la investigación base y copys publicitarios mínimos.
Devuelve JSON con este esquema exacto (rellena cada campo):
{
  "name": "${productName}",
  "categoryId": "beauty|pet|health|home|tech|general",
  "cost": 12.5,
  "retail": 39.9,
  "margin": 27.4,
  "roi": 219,
  "shipping": 8,
  "sales": 2500,
  "saturation": 28,
  "trend": "+120%",
  "suppliers": [
    {
      "platform": "AliExpress | CJ Dropshipping | Alibaba | Zendrop | Otro",
      "name": "Nombre del proveedor",
      "price": 10.5,
      "shippingCost": 3.5,
      "shippingTime": "8-12",
      "link": "URL del producto o búsqueda"
    }
  ],
  "demographics": {
    "who": "...",
    "attitudes": "...",
    "dreams": "...",
    "defeats": "...",
    "outsideForces": "...",
    "prejudices": "...",
    "belief": "..."
  },
  "solutions": {
    "current": "...",
    "experience": "...",
    "likes": "...",
    "dislikes": "...",
    "horrorStories": ["...", "...", "..."],
    "skepticism": "..."
  },
  "secrets": {
    "historical": "...",
    "conspiracy": "...",
    "mechanismProblem": "...",
    "mechanismSolution": "..."
  },
  "eden": {
    "goldenAge": "...",
    "corruptor": "...",
    "contrast": "..."
  },
  "verbatims": ["Frase 1", "Frase 2", "... hasta 10 frases"],
  "angles": [
    { "title": "1. Conspiración", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "2. Frustración Empática", "narrative": "...", "hook": "...", "headline": "..." },
    { "title": "3. Mecanismo Biológico", "narrative": "...", "hook": "...", "headline": "..." }
  ],
  "headlines": ["Titular 1", "Titular 2", "Titular 3"],
  "adCopy": {
    "facebook": [
      { "primaryText": "...", "headline": "...", "description": "..." },
      { "primaryText": "...", "headline": "...", "description": "..." }
    ],
    "tiktok": [
      { "hook": "...", "body": "...", "cta": "..." },
      { "hook": "...", "body": "...", "cta": "..." }
    ]
  }
}
Calcula margin = retail - cost y roi = Math.round((margin / cost) * 100) de forma congruente.
${JSON_ONLY_RULE}`;

    default:
      return `Genera JSON para el paso "${stepId}" del producto "${productName}". ${JSON_ONLY_RULE}`;
  }
}

/** API prompts — extends copilot schema with grounding/search instructions (T27). */
export function buildApiPrompt(
  stepId,
  {
    productName,
    competitorUrl = '',
    priorReport = null,
    useGrounding = false,
    outputLanguage = 'es',
  } = {}
) {
  const base = buildCopilotPrompt(stepId, { productName, competitorUrl, priorReport });

  if (stepId === COPILOT_STEPS.BASE_REPORT) {
    const searchClause = useGrounding
      ? 'Utiliza Google Search Grounding activamente. Busca proveedores reales (AliExpress, Alibaba, CJ Dropshipping, Zendrop), reviews y dolores en foros.'
      : 'Búsqueda web desactivada — utiliza la base de conocimiento del modelo.';
    return `${searchClause}
${competitorBlock(competitorUrl)}
Debes actuar como un Investigador de Mercado de Élite y un Redactor de Respuesta Directa.
IMPORTANTE: Para evitar bloqueos RECITATION, parafrasea — no copies textos largos de fuentes.
${base.replace(/^Realiza una investigación de mercado profunda en español sobre el producto de dropshipping: "[^"]+"\.\n/, '')}`;
  }

  if (stepId === COPILOT_STEPS.MARKETING_ASSETS) {
    return base.replace(
      'Genera materiales de marketing en español.',
      `Genera materiales de marketing en el idioma: "${outputLanguage}".`
    );
  }

  return base;
}

/**
 * Snippet mínimo por paso para «Ver ejemplo de JSON» en el modal copiloto (T06).
 * No inventa un informe completo — solo la forma mínima que pasa validateStepPayload.
 */
export function getCopilotStepJsonExample(stepId) {
  const examples = {
    [COPILOT_STEPS.BASE_REPORT]: {
      name: 'Nombre del producto',
      demographics: { who: 'Quién compra', belief: 'Creencia central' },
      cost: 12.5,
      retail: 39.9,
    },
    [COPILOT_STEPS.AVATAR_BRIEF]: {
      general: { age: '30-45', gender: 'mixto', income: 'medio' },
      painPoints: { p1: { name: 'Dolor principal' } },
    },
    [COPILOT_STEPS.OFFER_BRIEF]: {
      bigIdea: 'La gran idea de la oferta',
      names: ['Nombre oferta A'],
      ump: 'Problema único',
      ums: 'Solución única',
    },
    [COPILOT_STEPS.CREATIVES]: {
      ugcScripts: [{ title: 'UGC 1', hook: 'Gancho', body: 'Cuerpo', cta: 'CTA' }],
      landingPage: { outline: ['Hero'], html: '<section>…</section>' },
    },
    [COPILOT_STEPS.MARKETING_ASSETS]: {
      adCopy: {
        facebook: [{ primaryText: 'Texto', headline: 'Titular', description: 'Desc' }],
        tiktok: [{ hook: 'Hook', body: 'Cuerpo', cta: 'CTA' }],
      },
      emailSequence: [{ subject: 'Asunto', preview: 'Preview', body: 'Cuerpo' }],
    },
    [COPILOT_STEPS.FAST_MARKETING]: {
      headlines: ['Titular 1', 'Titular 2'],
      adCopy: {
        facebook: [{ primaryText: 'Texto', headline: 'Titular', description: 'Desc' }],
        tiktok: [{ hook: 'Hook', body: 'Cuerpo', cta: 'CTA' }],
      },
    },
    [COPILOT_STEPS.ALL_IN_ONE]: {
      name: 'Nombre del producto',
      demographics: { who: 'Quién compra' },
      headlines: ['Titular gancho'],
      adCopy: {
        facebook: [{ primaryText: 'Texto', headline: 'Titular', description: 'Desc' }],
        tiktok: [{ hook: 'Hook', body: 'Cuerpo', cta: 'CTA' }],
      },
    },
  };
  const sample = examples[stepId] || { name: 'ejemplo' };
  return JSON.stringify(sample, null, 2);
}

