/**
 * Kit VSL + checklist de lanzamiento — método Audisio & Domingo.
 * Plantillas offline a partir del informe; no inventa rendimiento de ads.
 */

import {
  AUDISIO_CANVA_FONT,
  AUDISIO_CAPCUT_FONT,
  AUDISIO_CAPCUT_FONT_SIZE,
  AUDISIO_ELEVENLABS_SPEED,
  AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
  AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD,
  AUDISIO_LAUNCH_MIN_DAYS,
  AUDISIO_MAX_LAUNCH_IMAGES,
  AUDISIO_METHOD_LABEL,
  AUDISIO_MIN_LAUNCH_IMAGES,
  AUDISIO_MIN_LAUNCH_VIDEOS,
  AUDISIO_VSL_CHECKLIST_STORAGE_PREFIX,
  AUDISIO_VSL_DURATION_MAX_SEC,
  AUDISIO_VSL_DURATION_MIN_SEC,
  AUDISIO_VSL_HOOK_MAX_SEC,
  AUDISIO_VSL_HOOK_MIN_SEC,
  AUDISIO_WARMUP_BUDGET_USD,
  AUDISIO_WARMUP_DAYS_MAX,
  AUDISIO_WARMUP_DAYS_MIN,
} from '../config/audisioRules.js';

function productName(report) {
  return report?.name || 'tu producto';
}

function firstPain(report) {
  const p1 = report?.avatarBrief?.painPoints?.p1;
  if (p1?.name && !String(p1.name).includes('No generado')) return p1.name;
  const ump = report?.offerBrief?.ump;
  if (ump && !String(ump).includes('No generado')) return String(ump).slice(0, 120);
  return `el problema que ${productName(report)} resuelve`;
}

function firstBenefit(report) {
  const ums = report?.offerBrief?.ums;
  if (ums && !String(ums).includes('No generado')) return String(ums).slice(0, 140);
  const dream = report?.demographics?.dreams;
  if (dream && !String(dream).includes('No generado')) return String(dream).slice(0, 140);
  return `los beneficios reales de ${productName(report)}`;
}

/**
 * Guiones VSL Hook → Body → CTA (3 ángulos). Duración objetivo 20–60 s.
 */
export function generateVslScripts(report = {}) {
  const name = productName(report);
  const pain = firstPain(report);
  const benefit = firstBenefit(report);
  const retail =
    typeof report.retail === 'number' ? report.retail : parseFloat(report.retail) || null;
  const priceHint = retail
    ? ` por solo $${Number(retail).toFixed(2)}`
    : '';

  return [
    {
      id: 'pain',
      angle: 'Dolor / problema',
      durationHint: `${AUDISIO_VSL_DURATION_MIN_SEC}–${AUDISIO_VSL_DURATION_MAX_SEC}s`,
      hookSec: `${AUDISIO_VSL_HOOK_MIN_SEC}–${AUDISIO_VSL_HOOK_MAX_SEC}s`,
      hook: `¿SIGUES SUFRIENDO POR ${pain.toUpperCase()}?`.slice(0, 90),
      body: `La mayoría prueba soluciones que no duran. ${name} ataca la causa: ${benefit}. En segundos ves por qué es distinto y qué cambia en tu día a día.`,
      cta: `Cómpralo ahora${priceHint}. No esperes más — aprovecha el envío gratis hoy.`,
    },
    {
      id: 'proof',
      angle: 'Testimonio / prueba',
      durationHint: `${AUDISIO_VSL_DURATION_MIN_SEC}–${AUDISIO_VSL_DURATION_MAX_SEC}s`,
      hookSec: `${AUDISIO_VSL_HOOK_MIN_SEC}–${AUDISIO_VSL_HOOK_MAX_SEC}s`,
      hook: `ESTO FUE LO QUE PASÓ CUANDO PROBÉ ${name.toUpperCase()}`.slice(0, 90),
      body: `Antes: ${pain}. Después de usar ${name}: ${benefit}. Sin promesas vacías — muestra el antes/después o la demo en cámara.`,
      cta: `Pídelo ahora${priceHint}. Stock limitado — envío gratis si compras hoy.`,
    },
    {
      id: 'offer',
      angle: 'Oferta directa',
      durationHint: `${AUDISIO_VSL_DURATION_MIN_SEC}–${AUDISIO_VSL_DURATION_MAX_SEC}s`,
      hookSec: `${AUDISIO_VSL_HOOK_MIN_SEC}–${AUDISIO_VSL_HOOK_MAX_SEC}s`,
      hook: `OFERTA HOY: ${name.toUpperCase()}${priceHint ? priceHint.toUpperCase() : ''}`.slice(0, 90),
      body: `${name} incluye lo esencial para resolver ${pain}. ${benefit}. Empaque listo para dropshipping — sin rodeos.`,
      cta: `Cómpralo ahora, no esperes más, aprovecha el envío gratis.`,
    },
  ];
}

export function formatVslScriptCopy(script) {
  return [
    `Ángulo: ${script.angle}`,
    `Duración objetivo: ${script.durationHint} | Hook: ${script.hookSec}`,
    '',
    `HOOK (${script.hookSec}):`,
    script.hook,
    '',
    'BODY:',
    script.body,
    '',
    'CTA:',
    script.cta,
    '',
    `Specs: CapCut ${AUDISIO_CAPCUT_FONT} ${AUDISIO_CAPCUT_FONT_SIZE}pt · Canva ${AUDISIO_CANVA_FONT} · Hook visual MAYÚSCULAS negro/blanco · Locución ElevenLabs ${AUDISIO_ELEVENLABS_SPEED}x (recorta silencios)`,
    AUDISIO_METHOD_LABEL,
  ].join('\n');
}

export function getProductionSpecs() {
  return {
    duration: `${AUDISIO_VSL_DURATION_MIN_SEC}–${AUDISIO_VSL_DURATION_MAX_SEC} s`,
    hookWindow: `${AUDISIO_VSL_HOOK_MIN_SEC}–${AUDISIO_VSL_HOOK_MAX_SEC} s`,
    capcut: `${AUDISIO_CAPCUT_FONT}, tamaño ${AUDISIO_CAPCUT_FONT_SIZE}`,
    canva: AUDISIO_CANVA_FONT,
    hookVisual: 'Letras negras, fondo blanco, TODO EN MAYÚSCULAS',
    voice: `ElevenLabs ~${AUDISIO_ELEVENLABS_SPEED}x; recortar silencios en CapCut`,
    disclaimer: `${AUDISIO_METHOD_LABEL}. Plantillas — no predicen CTR ni ventas.`,
  };
}

export function getLaunchChecklistItems() {
  return [
    {
      id: 'videos_5',
      label: `Tener listos mínimo ${AUDISIO_MIN_LAUNCH_VIDEOS} videos (conceptos/ángulos distintos)`,
    },
    {
      id: 'images_5_10',
      label: `Preparar ${AUDISIO_MIN_LAUNCH_IMAGES}–${AUDISIO_MAX_LAUNCH_IMAGES} imágenes cuadradas con hooks distintos`,
    },
    {
      id: 'warmup',
      label: `Cuenta nueva: calentar ${AUDISIO_WARMUP_DAYS_MIN}–${AUDISIO_WARMUP_DAYS_MAX} días con objetivo Interacción a $${AUDISIO_WARMUP_BUDGET_USD}/día antes de Ventas`,
    },
    {
      id: 'budget_beginner',
      label: `Principiante: lanzar Ventas a $${AUDISIO_LAUNCH_BUDGET_BEGINNER_USD}/día durante ≥ ${AUDISIO_LAUNCH_MIN_DAYS} días seguidos`,
    },
    {
      id: 'budget_exp',
      label: `Experimentado (opcional): puedes iniciar a $${AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD}/día`,
    },
    {
      id: 'no_manual_audience',
      label: 'No segmentar audiencia a mano — dejar que Meta ubique el público (Advantage+ / inteligente)',
    },
    {
      id: 'hook_visual_spec',
      label: `Hook visual CapCut: ${AUDISIO_CAPCUT_FONT} ${AUDISIO_CAPCUT_FONT_SIZE} · MAYÚSCULAS negro/blanco`,
    },
    {
      id: 'voice_speed',
      label: `Locución ~${AUDISIO_ELEVENLABS_SPEED}x y silencios recortados`,
    },
  ];
}

export function checklistStorageKey(productSlug) {
  const slug = String(productSlug || 'general')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${AUDISIO_VSL_CHECKLIST_STORAGE_PREFIX}${slug}`;
}

export function loadLaunchChecklistState(productSlug) {
  try {
    const raw = localStorage.getItem(checklistStorageKey(productSlug));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLaunchChecklistState(productSlug, stateMap) {
  try {
    localStorage.setItem(checklistStorageKey(productSlug), JSON.stringify(stateMap || {}));
  } catch {
    /* ignore */
  }
}

export function buildVslLaunchMarkdown(report) {
  const scripts = generateVslScripts(report);
  const specs = getProductionSpecs();
  const items = getLaunchChecklistItems();
  let md = `\n## Kit VSL & lanzamiento (Audisio)\n\n`;
  md += `> ${specs.disclaimer}\n\n`;
  md += `### Specs de producción\n`;
  md += `- Duración: ${specs.duration}\n`;
  md += `- Hook: ${specs.hookWindow}\n`;
  md += `- CapCut: ${specs.capcut}\n`;
  md += `- Canva: ${specs.canva}\n`;
  md += `- Hook visual: ${specs.hookVisual}\n`;
  md += `- Voz: ${specs.voice}\n\n`;
  scripts.forEach((s, i) => {
    md += `### VSL ${i + 1} — ${s.angle}\n\n`;
    md += '```\n' + formatVslScriptCopy(s) + '\n```\n\n';
  });
  md += `### Checklist de lanzamiento\n\n`;
  items.forEach((item) => {
    md += `- [ ] ${item.label}\n`;
  });
  md += '\n';
  return md;
}
