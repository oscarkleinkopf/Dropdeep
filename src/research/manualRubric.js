/**
 * Deterministic dropshipping validation rubric — 100% offline, no AI.
 * Weighted criteria → score 0–100 + verdict + Winner gates (Audisio & Domingo).
 */

import {
  AUDISIO_CPA_ACCEPTABLE_MAX_USD,
  AUDISIO_CPA_STRETCH_MAX_USD,
  AUDISIO_CPA_STRETCH_TICKET_USD,
  AUDISIO_CPA_TEST_IDEAL_MAX_USD,
  AUDISIO_CPA_TEST_MIN_USD,
  AUDISIO_GROSS_MARGIN_MIN_USD,
  AUDISIO_METHOD_LABEL,
  AUDISIO_SHIPPING_SIZE_MIN_SCORE,
  AUDISIO_WINNER_PILLAR_IDS,
  AUDISIO_WINNER_PILLARS_MIN,
} from '../config/audisioRules.js';

export const RUBRIC_CRITERIA = [
  {
    id: 'margin',
    label: 'Margen neto (costo vs precio de venta)',
    weight: 0.15,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '0 = margen negativo o muy bajo · 100 = margen >40% del retail',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
  {
    id: 'solvesPain',
    label: 'Solución de problemas (pilar Winner)',
    weight: 0.04,
    type: 'checkbox',
    defaultValue: 0,
    hint: 'Resuelve un dolor claro y específico del comprador.',
    scoreFn: (v) => (Number(v) ? 100 : 0),
  },
  {
    id: 'emotionalHook',
    label: 'Conexión emocional (pilar Winner)',
    weight: 0.04,
    type: 'checkbox',
    defaultValue: 0,
    hint: 'Vínculo afectivo (familia, mascotas, identidad, etc.).',
    scoreFn: (v) => (Number(v) ? 100 : 0),
  },
  {
    id: 'wowFactor',
    label: 'Efecto WOW (pilar Winner)',
    weight: 0.04,
    type: 'checkbox',
    defaultValue: 0,
    hint: 'Llamativo / novedoso a primera vista.',
    scoreFn: (v) => (Number(v) ? 100 : 0),
  },
  {
    id: 'shippingSize',
    label: 'Tamaño y peso de envío (≤ caja de zapatos)',
    weight: 0.10,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '100 = cabe en caja de zapatos / liviano · 0 = voluminoso o pesado',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
  {
    id: 'saturation',
    label: 'Saturación / competencia visible',
    weight: 0.12,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '100 = poco saturado · 0 = mercado muy competido',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
  {
    id: 'suppliers',
    label: 'Disponibilidad de proveedores',
    weight: 0.10,
    type: 'select',
    options: [
      { value: 100, label: 'Varios proveedores confiables (AliExpress/CJ/Zendrop)' },
      { value: 70, label: '1–2 proveedores encontrados' },
      { value: 35, label: 'Difícil de encontrar o stock irregular' },
      { value: 0, label: 'Sin proveedor claro' },
    ],
    defaultValue: 70,
    scoreFn: (v) => Number(v),
  },
  {
    id: 'seasonality',
    label: 'Estacionalidad / atemporalidad',
    weight: 0.08,
    type: 'select',
    options: [
      { value: 100, label: 'Vendible todo el año (atemporal)' },
      { value: 60, label: 'Ligera estacionalidad (picos predecibles)' },
      { value: 25, label: 'Muy estacional (solo 2–3 meses fuertes)' },
      { value: 0, label: 'Prácticamente solo temporada corta' },
    ],
    defaultValue: 100,
    scoreFn: (v) => Number(v),
  },
  {
    id: 'adPolicy',
    label: 'Riesgo de políticas de anuncios (Meta/TikTok)',
    weight: 0.10,
    type: 'select',
    options: [
      { value: 100, label: 'Sin restricciones conocidas' },
      { value: 65, label: 'Categoría gris — requiere cuidado en copy' },
      { value: 30, label: 'Alto riesgo de rechazo (salud/belleza/agresivo)' },
      { value: 0, label: 'Probablemente prohibido o muy restricto' },
    ],
    defaultValue: 65,
    scoreFn: (v) => Number(v),
  },
  {
    id: 'ugcPotential',
    label: 'Potencial de UGC / creativos',
    weight: 0.08,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '¿Se presta a demos en video, before/after, unboxing?',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
  {
    id: 'ticketAov',
    label: 'Ticket promedio y potencial AOV/upsell',
    weight: 0.10,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '100 = ticket $40+ con bundles/upsells naturales',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
  {
    id: 'returnsFragility',
    label: 'Calidad / devoluciones / fragilidad',
    weight: 0.05,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '100 = alta calidad, pocas devoluciones · 0 = frágil o alta tasa de devolución',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
];

/** Campos de gate (no pesan en el score 0–100; sí bloquean “Lanzar”). */
export const WINNER_GATE_FIELDS = [
  {
    id: 'grossMarginUsd',
    label: 'Margen bruto por unidad (USD)',
    type: 'number',
    step: '0.01',
    min: '0',
    placeholder: 'ej. 18',
    hint: `Método Audisio: debe ser mayor a $${AUDISIO_GROSS_MARGIN_MIN_USD} USD. Si tienes costo/retail en el informe, se rellena solo.`,
  },
  {
    id: 'projectedCpaUsd',
    label: 'CPA proyectado de testeo (USD)',
    type: 'number',
    step: '0.01',
    min: '0',
    placeholder: 'ej. 6',
    hint: `Ideal $${AUDISIO_CPA_TEST_MIN_USD}–$${AUDISIO_CPA_TEST_IDEAL_MAX_USD}; máx. aceptable $${AUDISIO_CPA_ACCEPTABLE_MAX_USD} (hasta $${AUDISIO_CPA_STRETCH_MAX_USD} si el ticket ≈ $${AUDISIO_CPA_STRETCH_TICKET_USD}).`,
  },
  {
    id: 'productTicketUsd',
    label: 'Ticket / PVP del producto (USD)',
    type: 'number',
    step: '0.01',
    min: '0',
    placeholder: 'ej. 49',
    hint: 'Usado para permitir CPA estirado (~$20) solo en productos caros.',
  },
];

export const VERDICT_LAUNCH = 'Lanzar';
export const VERDICT_VALIDATE = 'Validar más';
export const VERDICT_DISCARD = 'Descartar';

function toNum(value, fallback = null) {
  if (value === '' || value == null) return fallback;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function pillarActive(inputs, id) {
  return !!Number(inputs[id]);
}

/**
 * Migra evaluaciones antiguas con `problemWow` hacia los 3 pilares Winner.
 */
export function normalizeRubricInputs(raw = {}) {
  const inputs = { ...raw };
  if (
    inputs.problemWow != null &&
    inputs.solvesPain == null &&
    inputs.emotionalHook == null &&
    inputs.wowFactor == null
  ) {
    const wow = Number(inputs.problemWow) || 0;
    inputs.solvesPain = wow >= 50 ? 1 : 0;
    inputs.emotionalHook = wow >= 65 ? 1 : 0;
    inputs.wowFactor = wow >= 80 ? 1 : 0;
  }
  return inputs;
}

/**
 * Gates Winner Audisio — si fallan, el veredicto no puede ser “Lanzar”.
 */
export function evaluateWinnerGates(inputs = {}) {
  const normalized = normalizeRubricInputs(inputs);
  const blockers = [];
  const warnings = [];

  const pillarsHit = AUDISIO_WINNER_PILLAR_IDS.filter((id) => pillarActive(normalized, id)).length;
  if (pillarsHit < AUDISIO_WINNER_PILLARS_MIN) {
    blockers.push({
      code: 'pillars',
      message: `Gate Winner: marca al menos ${AUDISIO_WINNER_PILLARS_MIN} de 3 pilares (solución, emoción o WOW). Ideal: los 3.`,
    });
  } else if (pillarsHit < 3) {
    warnings.push({
      code: 'pillars_partial',
      message: `Pilares Winner: ${pillarsHit}/3 — el método recomienda idealmente los tres.`,
    });
  }

  const shippingScore = toNum(normalized.shippingSize, 50);
  if (shippingScore < AUDISIO_SHIPPING_SIZE_MIN_SCORE) {
    blockers.push({
      code: 'shipping_size',
      message: `Gate tamaño/peso: score ${shippingScore}/100 — el empaque debería ser ≤ caja de zapatos (mín. ${AUDISIO_SHIPPING_SIZE_MIN_SCORE}/100 en el deslizador).`,
    });
  }

  const gross = toNum(normalized.grossMarginUsd, null);
  if (gross != null) {
    if (!(gross > AUDISIO_GROSS_MARGIN_MIN_USD)) {
      blockers.push({
        code: 'gross_margin',
        message: `Gate margen bruto: $${gross.toFixed(2)} USD — debe ser mayor a $${AUDISIO_GROSS_MARGIN_MIN_USD} USD (${AUDISIO_METHOD_LABEL}).`,
      });
    }
  } else {
    warnings.push({
      code: 'gross_missing',
      message: 'Completa margen bruto (USD) para validar el gate de $15+ del método Audisio.',
    });
  }

  const cpa = toNum(normalized.projectedCpaUsd, null);
  const ticket = toNum(normalized.productTicketUsd, null);
  if (cpa != null) {
    const stretchAllowed = ticket != null && ticket >= AUDISIO_CPA_STRETCH_TICKET_USD;
    const hardMax = stretchAllowed ? AUDISIO_CPA_STRETCH_MAX_USD : AUDISIO_CPA_ACCEPTABLE_MAX_USD;
    if (cpa > hardMax) {
      blockers.push({
        code: 'cpa_high',
        message: stretchAllowed
          ? `Gate CPA: $${cpa.toFixed(2)} supera el techo estirado de $${AUDISIO_CPA_STRETCH_MAX_USD} (ticket ≈ $${AUDISIO_CPA_STRETCH_TICKET_USD}+).`
          : `Gate CPA: $${cpa.toFixed(2)} supera $${AUDISIO_CPA_ACCEPTABLE_MAX_USD} USD aceptables (ideal $${AUDISIO_CPA_TEST_MIN_USD}–$${AUDISIO_CPA_TEST_IDEAL_MAX_USD}).`,
      });
    } else if (cpa > AUDISIO_CPA_TEST_IDEAL_MAX_USD) {
      warnings.push({
        code: 'cpa_elevated',
        message: `CPA $${cpa.toFixed(2)} está por encima del test ideal ($${AUDISIO_CPA_TEST_MIN_USD}–$${AUDISIO_CPA_TEST_IDEAL_MAX_USD}) pero bajo el techo $${hardMax}.`,
      });
    } else if (cpa < AUDISIO_CPA_TEST_MIN_USD) {
      warnings.push({
        code: 'cpa_optimistic',
        message: `CPA $${cpa.toFixed(2)} está bajo el rango de test típico ($${AUDISIO_CPA_TEST_MIN_USD}–$${AUDISIO_CPA_TEST_IDEAL_MAX_USD}) — verifica que no sea demasiado optimista.`,
      });
    }
  } else {
    warnings.push({
      code: 'cpa_missing',
      message: 'Indica un CPA proyectado de testeo para aplicar el gate Audisio ($5–$7 ideal).',
    });
  }

  return {
    passed: blockers.length === 0,
    blockers,
    warnings,
    pillarsHit,
    pillarsRequired: AUDISIO_WINNER_PILLARS_MIN,
  };
}

function verdictFromScore(score) {
  if (score >= 70) return VERDICT_LAUNCH;
  if (score >= 45) return VERDICT_VALIDATE;
  return VERDICT_DISCARD;
}

function buildExplanation(score, verdict, breakdown, inputs, gates, scoreVerdict) {
  const lines = [];
  lines.push(`Puntuación total: ${score}/100 → Veredicto: ${verdict}.`);

  if (scoreVerdict === VERDICT_LAUNCH && verdict !== VERDICT_LAUNCH) {
    lines.push(
      `El score permitiría “Lanzar”, pero un gate Winner Audisio lo bajó a “${verdict}”.`
    );
  }

  if (gates.pillarsHit != null) {
    lines.push(`Pilares Winner: ${gates.pillarsHit}/3 (mín. ${gates.pillarsRequired}; ideal 3).`);
  }

  gates.blockers.forEach((b) => lines.push(`Bloqueo: ${b.message}`));
  gates.warnings.slice(0, 2).forEach((w) => lines.push(`Aviso: ${w.message}`));

  const sorted = [...breakdown].sort((a, b) => a.contribution - b.contribution);
  const weakest = sorted.slice(0, 2).filter((b) => b.rawScore < 50);
  const strongest = [...breakdown].sort((a, b) => b.contribution - a.contribution).slice(0, 2);

  if (strongest.length) {
    lines.push(
      `Fortalezas: ${strongest.map((s) => `${s.label} (${Math.round(s.rawScore)}/100)`).join('; ')}.`
    );
  }

  if (weakest.length) {
    lines.push(
      `Puntos débiles: ${weakest.map((s) => `${s.label} (${Math.round(s.rawScore)}/100)`).join('; ')} — conviene profundizar antes de invertir en ads.`
    );
  }

  if (inputs.adPolicy != null && Number(inputs.adPolicy) <= 30) {
    lines.push('Alerta: riesgo alto en políticas de Meta/TikTok — prepara creativos conservadores y landing compliant.');
  }
  if (inputs.margin != null && Number(inputs.margin) < 35) {
    lines.push('Alerta: margen percibido bajo en el deslizador — recalcula con Precios Audisio y CPA objetivo.');
  }
  if (inputs.suppliers != null && Number(inputs.suppliers) === 0) {
    lines.push('Alerta: sin proveedor claro — valida sourcing en AliExpress/CJ antes de crear la tienda.');
  }

  if (verdict === VERDICT_LAUNCH) {
    lines.push(
      'Siguiente paso sugerido: testea con presupuesto Audisio (~$300 USD el primer mes) sin segmentar a mano en Meta.'
    );
  } else if (verdict === VERDICT_VALIDATE) {
    lines.push(
      'Siguiente paso sugerido: cierra los gates Winner pendientes, pide muestra y confirma margen bruto > $15 USD.'
    );
  } else {
    lines.push('Recomendación: descarta o pivotea el producto; el score/gates no justifican inversión en ads.');
  }

  return lines.join(' ');
}

/**
 * @param {Record<string, number>} inputs — criterion id → raw score / checkbox / gate fields
 */
export function computeManualEvaluation(inputs) {
  const normalized = normalizeRubricInputs(inputs || {});
  const breakdown = [];
  let total = 0;

  RUBRIC_CRITERIA.forEach((criterion) => {
    const raw = normalized[criterion.id] ?? criterion.defaultValue;
    const rawScore = criterion.scoreFn(raw);
    const contribution = rawScore * criterion.weight;
    total += contribution;
    breakdown.push({
      id: criterion.id,
      label: criterion.label,
      weight: criterion.weight,
      rawScore,
      contribution,
    });
  });

  const score = Math.round(Math.max(0, Math.min(100, total)));
  const scoreVerdict = verdictFromScore(score);
  const gates = evaluateWinnerGates(normalized);

  let verdict = scoreVerdict;
  if (scoreVerdict === VERDICT_LAUNCH && !gates.passed) {
    verdict = VERDICT_VALIDATE;
  }

  const explanation = buildExplanation(score, verdict, breakdown, normalized, gates, scoreVerdict);

  return {
    score,
    verdict,
    explanation,
    breakdown,
    criteria: { ...normalized },
    winnerGates: gates,
    scoreVerdict,
    evaluatedAt: new Date().toISOString(),
  };
}

export function getDefaultRubricInputs() {
  const defaults = {};
  RUBRIC_CRITERIA.forEach((c) => {
    defaults[c.id] = c.defaultValue;
  });
  WINNER_GATE_FIELDS.forEach((f) => {
    defaults[f.id] = '';
  });
  return defaults;
}

export function verdictColor(verdict) {
  if (verdict === VERDICT_LAUNCH) return 'var(--accent-emerald)';
  if (verdict === VERDICT_VALIDATE) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}
