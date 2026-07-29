/**
 * Deterministic dropshipping validation rubric — 100% offline, no AI.
 * Weighted criteria → score 0–100 + verdict + rule-based explanation.
 */

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
    id: 'problemWow',
    label: 'Problema que resuelve / factor wow',
    weight: 0.12,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '¿El producto resuelve un dolor claro o tiene un "wow" visual?',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
  {
    id: 'shippingSize',
    label: 'Tamaño y peso de envío',
    weight: 0.10,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '100 = pequeño/liviano · 0 = voluminoso/pesado (costoso de enviar)',
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
    label: 'Estacionalidad',
    weight: 0.08,
    type: 'select',
    options: [
      { value: 100, label: 'Vendible todo el año' },
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
    label: 'Devoluciones / fragilidad del producto',
    weight: 0.05,
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    hint: '100 = robusto, pocas devoluciones · 0 = frágil o alta tasa de devolución',
    scoreFn: (v) => Math.max(0, Math.min(100, Number(v))),
  },
];

export const VERDICT_LAUNCH = 'Lanzar';
export const VERDICT_VALIDATE = 'Validar más';
export const VERDICT_DISCARD = 'Descartar';

function verdictFromScore(score) {
  if (score >= 70) return VERDICT_LAUNCH;
  if (score >= 45) return VERDICT_VALIDATE;
  return VERDICT_DISCARD;
}

function buildExplanation(score, verdict, breakdown, inputs) {
  const lines = [];
  lines.push(`Puntuación total: ${score}/100 → Veredicto: ${verdict}.`);

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
    lines.push('Alerta: margen bajo — recalcula costo de producto + envío + CPA objetivo antes de lanzar.');
  }
  if (inputs.suppliers != null && Number(inputs.suppliers) === 0) {
    lines.push('Alerta: sin proveedor claro — valida sourcing en AliExpress/CJ antes de crear la tienda.');
  }
  if (verdict === VERDICT_LAUNCH) {
    lines.push('Siguiente paso sugerido: prueba con $20–50 en ads o validación orgánica antes de escalar.');
  } else if (verdict === VERDICT_VALIDATE) {
    lines.push('Siguiente paso sugerido: pide muestra al proveedor, testea creativos UGC y confirma margen real.');
  } else {
    lines.push('Recomendación: descarta o pivotea el producto; el score no justifica inversión en ads.');
  }

  return lines.join(' ');
}

/**
 * @param {Record<string, number>} inputs — criterion id → raw score 0–100 (or select value)
 * @returns {{ score: number, verdict: string, explanation: string, breakdown: Array, criteria: Record<string, number> }}
 */
export function computeManualEvaluation(inputs) {
  const breakdown = [];
  let total = 0;

  RUBRIC_CRITERIA.forEach((criterion) => {
    const raw = inputs[criterion.id] ?? criterion.defaultValue;
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
  const verdict = verdictFromScore(score);
  const explanation = buildExplanation(score, verdict, breakdown, inputs);

  return {
    score,
    verdict,
    explanation,
    breakdown,
    criteria: { ...inputs },
    evaluatedAt: new Date().toISOString(),
  };
}

export function getDefaultRubricInputs() {
  const defaults = {};
  RUBRIC_CRITERIA.forEach((c) => {
    defaults[c.id] = c.defaultValue;
  });
  return defaults;
}

export function verdictColor(verdict) {
  if (verdict === VERDICT_LAUNCH) return 'var(--accent-emerald)';
  if (verdict === VERDICT_VALIDATE) return 'var(--accent-amber)';
  return 'var(--accent-red)';
}
