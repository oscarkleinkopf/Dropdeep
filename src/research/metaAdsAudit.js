/**
 * Auditor Meta Ads Chile — fórmulas puras del método Audisio & Domingo.
 * Usa métricas declaradas por el usuario; no llama a Meta API.
 */

import {
  AUDISIO_ALIEXPRESS_VAT_RATE,
  AUDISIO_ATC_NORMAL_MAX_CLP,
  AUDISIO_ATC_NORMAL_MIN_CLP,
  AUDISIO_ATC_TOLERANCE_MAX_FRACTION,
  AUDISIO_ATC_TOLERANCE_MIN_FRACTION,
  AUDISIO_CPC_IDEAL_MAX_CLP,
  AUDISIO_CPC_IDEAL_MIN_CLP,
  AUDISIO_CPC_MAX_CLP,
  AUDISIO_CPM_COMPETITIVE_MAX_CLP,
  AUDISIO_CPM_COMPETITIVE_MIN_CLP,
  AUDISIO_CPM_TYPICAL_MAX_CLP,
  AUDISIO_CPM_TYPICAL_MIN_CLP,
  AUDISIO_CTR_EXCELLENT_MAX,
  AUDISIO_CTR_EXCELLENT_MIN,
  AUDISIO_CTR_GOOD_MAX,
  AUDISIO_CTR_GOOD_MIN,
  AUDISIO_CTR_MIN,
  AUDISIO_DEFAULT_PAYMENT_FEE_RATE,
  AUDISIO_DEFAULT_SALES_VAT_RATE,
  AUDISIO_DEFAULT_SHOPIFY_FEE_RATE,
  AUDISIO_METHOD_LABEL,
} from '../config/audisioRules.js';

function toNum(value, fallback = 0) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampRate(rate, fallback) {
  const n = toNum(rate, fallback);
  if (n < 0) return 0;
  if (n > 1) return n > 100 ? Math.min(n / 100, 1) : Math.min(n, 1);
  return n;
}

/**
 * CPA máximo = margen final tras costo AliExpress+IVA, pasarela, Shopify e IVA venta.
 * Unidades: misma moneda para sale/cost (típicamente CLP en el auditor Chile).
 */
export function calculateCpaMax({
  salePrice,
  productCost,
  aliexpressVatRate = AUDISIO_ALIEXPRESS_VAT_RATE,
  paymentFeeRate = AUDISIO_DEFAULT_PAYMENT_FEE_RATE,
  shopifyFeeRate = AUDISIO_DEFAULT_SHOPIFY_FEE_RATE,
  salesVatRate = AUDISIO_DEFAULT_SALES_VAT_RATE,
} = {}) {
  const sale = Math.max(0, toNum(salePrice, 0));
  const cost = Math.max(0, toNum(productCost, 0));
  const vatAli = clampRate(aliexpressVatRate, AUDISIO_ALIEXPRESS_VAT_RATE);
  const payRate = clampRate(paymentFeeRate, AUDISIO_DEFAULT_PAYMENT_FEE_RATE);
  const shopRate = clampRate(shopifyFeeRate, AUDISIO_DEFAULT_SHOPIFY_FEE_RATE);
  const saleVat = clampRate(salesVatRate, AUDISIO_DEFAULT_SALES_VAT_RATE);

  const costWithVat = cost * (1 + vatAli);
  const paymentFee = sale * payRate;
  const shopifyFee = sale * shopRate;
  const salesVatAmount = sale * saleVat;
  const marginFinal = sale - costWithVat - paymentFee - shopifyFee - salesVatAmount;
  const cpaMax = Math.max(0, Math.round(marginFinal * 100) / 100);

  return {
    sale,
    cost,
    costWithVat: Math.round(costWithVat * 100) / 100,
    paymentFee: Math.round(paymentFee * 100) / 100,
    shopifyFee: Math.round(shopifyFee * 100) / 100,
    salesVatAmount: Math.round(salesVatAmount * 100) / 100,
    marginFinal: Math.round(marginFinal * 100) / 100,
    cpaMax,
    rates: { vatAli, payRate, shopRate, saleVat },
  };
}

export function rateCtr(ctrPercent) {
  const ctr = toNum(ctrPercent, NaN);
  if (!Number.isFinite(ctr)) {
    return { level: 'unknown', label: 'Sin dato', detail: 'Ingresa CTR % de Ads Manager.' };
  }
  if (ctr < AUDISIO_CTR_MIN) {
    return {
      level: 'bad',
      label: 'Bajo mínimo',
      detail: `CTR ${ctr}% < ${AUDISIO_CTR_MIN}% — creativo/hook débil.`,
    };
  }
  if (ctr >= AUDISIO_CTR_EXCELLENT_MIN && ctr <= AUDISIO_CTR_EXCELLENT_MAX) {
    return {
      level: 'excellent',
      label: 'Excelente',
      detail: `CTR ${ctr}% en banda excelente (${AUDISIO_CTR_EXCELLENT_MIN}–${AUDISIO_CTR_EXCELLENT_MAX}%).`,
    };
  }
  if (ctr >= AUDISIO_CTR_GOOD_MIN && ctr <= AUDISIO_CTR_GOOD_MAX) {
    return {
      level: 'good',
      label: 'Bueno',
      detail: `CTR ${ctr}% en banda buena (${AUDISIO_CTR_GOOD_MIN}–${AUDISIO_CTR_GOOD_MAX}%).`,
    };
  }
  if (ctr > AUDISIO_CTR_EXCELLENT_MAX) {
    return {
      level: 'good',
      label: 'Muy alto',
      detail: `CTR ${ctr}% sobre ${AUDISIO_CTR_EXCELLENT_MAX}% — verifica calidad del tráfico (no solo clicks).`,
    };
  }
  return {
    level: 'ok',
    label: 'Aceptable',
    detail: `CTR ${ctr}% sobre el mínimo ${AUDISIO_CTR_MIN}% (ideal ${AUDISIO_CTR_GOOD_MIN}–${AUDISIO_CTR_GOOD_MAX}% o ${AUDISIO_CTR_EXCELLENT_MIN}–${AUDISIO_CTR_EXCELLENT_MAX}%).`,
  };
}

export function rateCpc(cpcClp) {
  const cpc = toNum(cpcClp, NaN);
  if (!Number.isFinite(cpc)) {
    return { level: 'unknown', label: 'Sin dato', detail: 'Ingresa CPC en CLP.' };
  }
  if (cpc >= AUDISIO_CPC_IDEAL_MIN_CLP && cpc <= AUDISIO_CPC_IDEAL_MAX_CLP) {
    return {
      level: 'excellent',
      label: 'Óptimo',
      detail: `CPC ${cpc} CLP en rango ideal (${AUDISIO_CPC_IDEAL_MIN_CLP}–${AUDISIO_CPC_IDEAL_MAX_CLP}).`,
    };
  }
  if (cpc < AUDISIO_CPC_MAX_CLP) {
    return {
      level: cpc < AUDISIO_CPC_IDEAL_MIN_CLP ? 'good' : 'ok',
      label: cpc < AUDISIO_CPC_IDEAL_MIN_CLP ? 'Barato' : 'Aceptable',
      detail: `CPC ${cpc} CLP bajo el techo de ${AUDISIO_CPC_MAX_CLP} CLP.`,
    };
  }
  return {
    level: 'bad',
    label: 'Alto',
    detail: `CPC ${cpc} CLP ≥ ${AUDISIO_CPC_MAX_CLP} — revisa creativo/audiencia.`,
  };
}

export function rateAtc(atcClp, cpaMaxClp) {
  const atc = toNum(atcClp, NaN);
  if (!Number.isFinite(atc)) {
    return { level: 'unknown', label: 'Sin dato', detail: 'Ingresa costo por Add to Cart (CLP).' };
  }
  const cpaMax = Math.max(0, toNum(cpaMaxClp, 0));
  const inNormal = atc >= AUDISIO_ATC_NORMAL_MIN_CLP && atc <= AUDISIO_ATC_NORMAL_MAX_CLP;
  let toleratedByCpa = false;
  if (cpaMax > 0) {
    const minTol = cpaMax * AUDISIO_ATC_TOLERANCE_MIN_FRACTION;
    const maxTol = cpaMax * AUDISIO_ATC_TOLERANCE_MAX_FRACTION;
    toleratedByCpa = atc >= minTol && atc <= maxTol;
  }

  if (inNormal) {
    return {
      level: 'good',
      label: 'Normal',
      detail: `ATC ${atc} CLP en rango típico (${AUDISIO_ATC_NORMAL_MIN_CLP}–${AUDISIO_ATC_NORMAL_MAX_CLP}).`,
      toleratedByCpa,
    };
  }
  if (toleratedByCpa) {
    return {
      level: 'ok',
      label: 'Tolerable vs CPA máx',
      detail: `ATC ${atc} CLP fuera del rango típico, pero entre 1/5 y 1/3 del CPA máx (${cpaMax} CLP).`,
      toleratedByCpa: true,
    };
  }
  return {
    level: 'bad',
    label: 'Fuera de rango',
    detail: `ATC ${atc} CLP fuera de ${AUDISIO_ATC_NORMAL_MIN_CLP}–${AUDISIO_ATC_NORMAL_MAX_CLP} y no encaja como 1/5–1/3 del CPA máx.`,
    toleratedByCpa: false,
  };
}

export function rateCpm(cpmClp, { competitiveNiche = false } = {}) {
  const cpm = toNum(cpmClp, NaN);
  if (!Number.isFinite(cpm)) {
    return { level: 'unknown', label: 'Sin dato', detail: 'Ingresa CPM en CLP.' };
  }
  if (cpm >= AUDISIO_CPM_TYPICAL_MIN_CLP && cpm <= AUDISIO_CPM_TYPICAL_MAX_CLP) {
    return {
      level: 'good',
      label: 'Típico Chile',
      detail: `CPM ${cpm} CLP en promedio Chile (${AUDISIO_CPM_TYPICAL_MIN_CLP}–${AUDISIO_CPM_TYPICAL_MAX_CLP}).`,
    };
  }
  if (
    cpm >= AUDISIO_CPM_COMPETITIVE_MIN_CLP &&
    cpm <= AUDISIO_CPM_COMPETITIVE_MAX_CLP
  ) {
    return {
      level: competitiveNiche ? 'ok' : 'warn',
      label: competitiveNiche ? 'OK nicho competitivo' : 'Alto (¿nicho competitivo?)',
      detail: competitiveNiche
        ? `CPM ${cpm} CLP esperado en nichos competitivos (${AUDISIO_CPM_COMPETITIVE_MIN_CLP}–${AUDISIO_CPM_COMPETITIVE_MAX_CLP}) si el tráfico es de calidad.`
        : `CPM ${cpm} CLP alto — normal en belleza/competitivo; marca “nicho competitivo” si aplica.`,
    };
  }
  if (cpm < AUDISIO_CPM_TYPICAL_MIN_CLP) {
    return {
      level: 'good',
      label: 'Bajo',
      detail: `CPM ${cpm} CLP bajo el típico Chile — bueno si la calidad del tráfico se sostiene.`,
    };
  }
  return {
    level: 'bad',
    label: 'Muy alto',
    detail: `CPM ${cpm} CLP sobre ${AUDISIO_CPM_COMPETITIVE_MAX_CLP} — revisa puja/audiencia.`,
  };
}

/**
 * Auditoría completa offline.
 */
export function evaluateMetaAdsAudit(input = {}) {
  const economics = calculateCpaMax({
    salePrice: input.salePriceClp,
    productCost: input.productCostClp,
    aliexpressVatRate: input.aliexpressVatRate,
    paymentFeeRate: input.paymentFeeRate,
    shopifyFeeRate: input.shopifyFeeRate,
    salesVatRate: input.salesVatRate,
  });

  const campaignCpa = toNum(input.campaignCpaClp, NaN);
  const losingMoney =
    Number.isFinite(campaignCpa) && economics.cpaMax > 0 && campaignCpa > economics.cpaMax;
  const noMargin = economics.marginFinal <= 0;

  const ctr = rateCtr(input.ctrPercent);
  const cpc = rateCpc(input.cpcClp);
  const atc = rateAtc(input.atcClp, economics.cpaMax);
  const cpm = rateCpm(input.cpmClp, { competitiveNiche: !!input.competitiveNiche });

  const verdicts = [];
  if (noMargin) {
    verdicts.push({
      level: 'error',
      message: 'Margen final ≤ 0 tras costos/comisiones/IVA — no hay CPA máximo positivo; reestructura precio o costos.',
    });
  } else {
    verdicts.push({
      level: 'info',
      message: `CPA máximo (método): ${economics.cpaMax.toLocaleString('es-CL')} CLP. El CPA de campaña no debe superarlo.`,
    });
  }

  if (losingMoney) {
    verdicts.push({
      level: 'error',
      message: `CPA campaña ${campaignCpa.toLocaleString('es-CL')} CLP > CPA máx ${economics.cpaMax.toLocaleString('es-CL')} — estás perdiendo plata en la operación.`,
    });
  } else if (Number.isFinite(campaignCpa) && economics.cpaMax > 0) {
    verdicts.push({
      level: 'ok',
      message: `CPA campaña ${campaignCpa.toLocaleString('es-CL')} CLP dentro del CPA máx.`,
    });
  }

  for (const metric of [ctr, cpc, atc, cpm]) {
    if (metric.level === 'bad') {
      verdicts.push({ level: 'warn', message: metric.detail });
    } else if (metric.level === 'excellent' || metric.level === 'good') {
      verdicts.push({ level: 'ok', message: metric.detail });
    } else if (metric.level === 'warn') {
      verdicts.push({ level: 'warn', message: metric.detail });
    }
  }

  verdicts.push({
    level: 'info',
    message: `${AUDISIO_METHOD_LABEL} — umbrales de referencia Chile; no son benchmarks en vivo ni datos de Meta API.`,
  });

  return {
    economics,
    campaignCpa: Number.isFinite(campaignCpa) ? campaignCpa : null,
    losingMoney,
    metrics: { ctr, cpc, atc, cpm },
    verdicts,
  };
}
