export function scoreMargin(margin) {
  if (margin <= 5) return 0;
  if (margin >= 40) return 100;
  return ((margin - 5) / 35) * 100;
}

export function scoreTrend(trendStr) {
  if (trendStr === null || trendStr === undefined) return 50;
  const str = String(trendStr);
  const parsed = parseFloat(str.replace(/[+%]/g, ''));
  if (isNaN(parsed)) return 50;
  if (parsed < 0) return Math.max(0, 50 + parsed);
  if (parsed >= 150) return 100;
  return 50 + (parsed / 150) * 50;
}

export function scoreShipping(days) {
  if (days <= 5) return 100;
  if (days >= 20) return 0;
  return ((20 - days) / 15) * 100;
}

export function scoreROI(roi) {
  if (roi <= 50) return 0;
  if (roi >= 300) return 100;
  return ((roi - 50) / 250) * 100;
}

import {
  VERDICT_DISCARD,
  VERDICT_LAUNCH,
  VERDICT_VALIDATE,
} from './manualRubric.js';

export function deriveVerdictFromProductScore(score) {
  if (score >= 70) return VERDICT_LAUNCH;
  if (score >= 45) return VERDICT_VALIDATE;
  return VERDICT_DISCARD;
}

export function getManualVerdictRank(verdict) {
  if (verdict === VERDICT_LAUNCH) return 3;
  if (verdict === VERDICT_VALIDATE) return 2;
  return 1;
}

/**
 * Effective score for a single report — manual eval when present, else Product Score.
 */
export function getEffectiveScore(report) {
  const productScore = report.productScore ?? calculateProductScore(report);
  const me = report?.manualEvaluation;

  if (me?.score != null) {
    return {
      score: me.score,
      verdict: me.verdict,
      source: 'manual',
      productScore,
    };
  }

  return {
    score: productScore,
    verdict: deriveVerdictFromProductScore(productScore),
    source: 'productScore',
    productScore,
  };
}

/**
 * Compare winner among 2–3 portfolio items (T10).
 * If ALL have manualEvaluation → rank by manual score (tie → verdict rank).
 * Otherwise → Product Score only (never invent manual scores).
 */
export function pickCompareWinner(products) {
  if (!products?.length) return null;

  const allHaveManual = products.every(
    (p) => p.fullReport?.manualEvaluation?.score != null
  );
  const anyHaveManual = products.some(
    (p) => p.fullReport?.manualEvaluation?.score != null
  );

  const source = allHaveManual ? 'manual' : 'productScore';
  let sourceLabel;
  if (allHaveManual) {
    sourceLabel =
      'Recomendación basada en Evaluación manual — todos los productos tienen checklist completado.';
  } else if (anyHaveManual) {
    sourceLabel =
      'Recomendación basada en Product Score — completa evaluación manual en todos para comparar con tus criterios.';
  } else {
    sourceLabel =
      'Recomendación basada en Product Score — ninguno tiene evaluación manual.';
  }

  const scoreOf = (p) => {
    if (allHaveManual) return p.fullReport.manualEvaluation.score;
    return p.fullReport.productScore ?? calculateProductScore(p.fullReport);
  };

  const verdictRankOf = (p) => {
    if (allHaveManual) {
      return getManualVerdictRank(p.fullReport.manualEvaluation.verdict);
    }
    const ps = p.fullReport.productScore ?? calculateProductScore(p.fullReport);
    return getManualVerdictRank(deriveVerdictFromProductScore(ps));
  };

  let winner = products[0];
  let winnerScore = scoreOf(winner);
  let winnerVerdictRank = verdictRankOf(winner);

  for (let i = 1; i < products.length; i++) {
    const p = products[i];
    const score = scoreOf(p);
    const verdictRank = verdictRankOf(p);
    if (score > winnerScore || (score === winnerScore && verdictRank > winnerVerdictRank)) {
      winner = p;
      winnerScore = score;
      winnerVerdictRank = verdictRank;
    }
  }

  const winnerVerdict = allHaveManual
    ? winner.fullReport.manualEvaluation.verdict
    : deriveVerdictFromProductScore(
        winner.fullReport.productScore ?? calculateProductScore(winner.fullReport)
      );

  return {
    winner,
    winnerScore,
    winnerVerdict,
    source,
    sourceLabel,
    allHaveManual,
  };
}

function buildProductScoreExplanation(score, verdict, report) {
  const parts = [
    `Product Score ${score}/100 (margen, saturación, tendencia, envío y ROI del informe).`,
    'Esta sugerencia orientativa no sustituye la Evaluación manual con tus criterios reales.',
  ];

  if (verdict === VERDICT_LAUNCH) {
    parts.push('Indicadores del informe son favorables; valida margen y proveedor antes de escalar ads.');
  } else if (verdict === VERDICT_VALIDATE) {
    parts.push('Señales mixtas; confirma costos de proveedor, envío y creativos antes de invertir.');
  } else {
    parts.push('Métricas del informe sugieren alto riesgo; considera pivotar o profundizar antes de lanzar.');
  }

  if (report._researchMode === 'fast' || report._researchMode === 'express') {
    parts.push('Informe en modo Rápido/Express — faltan secciones; completa con Copiloto 5 pasos o API para decidir con más datos.');
  }

  if (report._incompleteSections?.length) {
    parts.push(`Secciones incompletas: ${report._incompleteSections.join(', ')}.`);
  }

  return parts.join(' ');
}

/**
 * Next-step recommendation for the report decision block (T09).
 * Prefers manual evaluation when present; otherwise derives from Product Score with explicit caveat.
 */
export function getNextDecision(report) {
  const productScore = report.productScore ?? calculateProductScore(report);

  if (report.manualEvaluation) {
    const me = report.manualEvaluation;
    return {
      verdict: me.verdict,
      score: me.score,
      source: 'manual',
      sourceLabel: 'Evaluación manual (checklist offline)',
      explanation: me.explanation || `Puntuación ${me.score}/100 → ${me.verdict}.`,
      productScore,
      needsManualEval: false,
      needsCompleteSections: report._researchMode === 'fast' || !!report._incompleteSections?.length,
    };
  }

  const verdict = deriveVerdictFromProductScore(productScore);
  return {
    verdict,
    score: productScore,
    source: 'productScore',
    sourceLabel: 'Product Score del informe (no sustituye evaluación manual)',
    explanation: buildProductScoreExplanation(productScore, verdict, report),
    productScore,
    needsManualEval: true,
    needsCompleteSections: report._researchMode === 'fast' || report._researchMode === 'express' || !!report._incompleteSections?.length,
  };
}

export function calculateProductScore(report) {
  const wMargin = 0.25;
  const wSaturation = 0.20;
  const wTrend = 0.20;
  const wShipping = 0.15;
  const wROI = 0.20;

  const sMargin = scoreMargin(report.cost && report.retail ? (report.retail - report.cost) : (report.margin || 0));
  const sSaturation = 100 - (parseFloat(report.saturation) || 0);
  const sTrend = scoreTrend(report.trend);
  const sShipping = scoreShipping(parseInt(report.shipping) || 12);
  const sROI = scoreROI(parseFloat(report.roi) || 0);

  const total = (sMargin * wMargin) + (sSaturation * wSaturation) + (sTrend * wTrend) + (sShipping * wShipping) + (sROI * wROI);
  return Math.round(Math.max(0, Math.min(100, total)));
}
