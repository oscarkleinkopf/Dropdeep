import {
  AUDISIO_COST_TO_RETAIL_MULTIPLIER,
  AUDISIO_DEFAULT_FX_CLP_PER_USD,
  AUDISIO_FX_STORAGE_KEY,
  AUDISIO_GROSS_MARGIN_MIN_USD,
  AUDISIO_NET_MARGIN_TARGET,
  AUDISIO_PVP_FLOOR_CLP,
  AUDISIO_PVP_RECOMMENDED_MAX_CLP,
  AUDISIO_PVP_RECOMMENDED_MIN_CLP,
  AUDISIO_TEST_AD_BUDGET_USD,
} from '../config/audisioRules.js';

function toFiniteNumber(value, fallback = 0) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

export function getStoredFxClpPerUsd() {
  try {
    const raw = localStorage.getItem(AUDISIO_FX_STORAGE_KEY);
    if (raw == null || raw === '') return AUDISIO_DEFAULT_FX_CLP_PER_USD;
    const n = parseFloat(raw);
    if (!Number.isFinite(n) || n <= 0) return AUDISIO_DEFAULT_FX_CLP_PER_USD;
    return n;
  } catch {
    return AUDISIO_DEFAULT_FX_CLP_PER_USD;
  }
}

export function setStoredFxClpPerUsd(fx) {
  const n = toFiniteNumber(fx, AUDISIO_DEFAULT_FX_CLP_PER_USD);
  const safe = n > 0 ? n : AUDISIO_DEFAULT_FX_CLP_PER_USD;
  try {
    localStorage.setItem(AUDISIO_FX_STORAGE_KEY, String(safe));
  } catch {
    /* ignore quota */
  }
  return safe;
}

export function suggestRetailFromCost(costUsd) {
  const cost = Math.max(0, toFiniteNumber(costUsd, 0));
  return Math.round(cost * AUDISIO_COST_TO_RETAIL_MULTIPLIER * 100) / 100;
}

export function usdToClp(usd, fxClpPerUsd = getStoredFxClpPerUsd()) {
  const fx = toFiniteNumber(fxClpPerUsd, AUDISIO_DEFAULT_FX_CLP_PER_USD);
  return Math.round(toFiniteNumber(usd, 0) * (fx > 0 ? fx : AUDISIO_DEFAULT_FX_CLP_PER_USD));
}

export function clpToUsd(clp, fxClpPerUsd = getStoredFxClpPerUsd()) {
  const fx = toFiniteNumber(fxClpPerUsd, AUDISIO_DEFAULT_FX_CLP_PER_USD);
  if (fx <= 0) return 0;
  return Math.round((toFiniteNumber(clp, 0) / fx) * 100) / 100;
}

export function checkPriceBandClp(priceClp) {
  const clp = toFiniteNumber(priceClp, 0);
  const belowFloor = clp > 0 && clp < AUDISIO_PVP_FLOOR_CLP;
  const belowRecommended = clp > 0 && clp < AUDISIO_PVP_RECOMMENDED_MIN_CLP;
  const aboveRecommended = clp > AUDISIO_PVP_RECOMMENDED_MAX_CLP;
  const inRecommendedBand =
    clp >= AUDISIO_PVP_RECOMMENDED_MIN_CLP && clp <= AUDISIO_PVP_RECOMMENDED_MAX_CLP;

  return {
    priceClp: clp,
    belowFloor,
    belowRecommended,
    aboveRecommended,
    inRecommendedBand,
    meetsFloor: clp >= AUDISIO_PVP_FLOOR_CLP,
  };
}

/**
 * Evaluación offline de precios Audisio a partir de costo/retail USD + FX editable.
 * El “margen neto %” aquí es margen de contribución (retail − costo) / retail —
 * no incluye IVA Chile, pasarela ni ads (eso va en T40 CPA máximo).
 */
export function evaluateAudisioPricing({
  costUsd,
  retailUsd,
  fxClpPerUsd = getStoredFxClpPerUsd(),
} = {}) {
  const cost = Math.max(0, toFiniteNumber(costUsd, 0));
  const retail = Math.max(0, toFiniteNumber(retailUsd, 0));
  const fx = toFiniteNumber(fxClpPerUsd, AUDISIO_DEFAULT_FX_CLP_PER_USD);
  const safeFx = fx > 0 ? fx : AUDISIO_DEFAULT_FX_CLP_PER_USD;

  const suggestedRetailUsd = suggestRetailFromCost(cost);
  const costClp = usdToClp(cost, safeFx);
  const retailClp = usdToClp(retail, safeFx);
  const suggestedRetailClp = usdToClp(suggestedRetailUsd, safeFx);
  const band = checkPriceBandClp(retailClp);
  const suggestedBand = checkPriceBandClp(suggestedRetailClp);

  const grossMarginUsd = Math.round((retail - cost) * 100) / 100;
  const contributionMarginRatio = retail > 0 ? (retail - cost) / retail : 0;
  const meetsGrossMin = grossMarginUsd > AUDISIO_GROSS_MARGIN_MIN_USD;
  const meetsNetTarget = contributionMarginRatio >= AUDISIO_NET_MARGIN_TARGET;

  const flags = [];

  if (retail > 0 && band.belowFloor) {
    flags.push({
      level: 'error',
      code: 'floor_clp',
      message: `No vender bajo el piso de ${AUDISIO_PVP_FLOOR_CLP.toLocaleString('es-CL')} CLP (método Audisio). Tu PVP ≈ ${retailClp.toLocaleString('es-CL')} CLP.`,
    });
  } else if (retail > 0 && band.belowRecommended) {
    flags.push({
      level: 'warn',
      code: 'below_band',
      message: `PVP bajo la banda recomendada (${AUDISIO_PVP_RECOMMENDED_MIN_CLP.toLocaleString('es-CL')}–${AUDISIO_PVP_RECOMMENDED_MAX_CLP.toLocaleString('es-CL')} CLP).`,
    });
  } else if (band.aboveRecommended) {
    flags.push({
      level: 'warn',
      code: 'above_band',
      message: `PVP sobre ${AUDISIO_PVP_RECOMMENDED_MAX_CLP.toLocaleString('es-CL')} CLP — válido si el producto es premium; revisa CPA y creativos.`,
    });
  } else if (retail > 0 && band.inRecommendedBand) {
    flags.push({
      level: 'ok',
      code: 'in_band',
      message: 'PVP dentro de la banda recomendada Chile (40k–100k CLP).',
    });
  }

  if (retail > 0 && !meetsGrossMin) {
    flags.push({
      level: 'error',
      code: 'gross_margin',
      message: `Margen bruto $${grossMarginUsd.toFixed(2)} USD — el método pide más de $${AUDISIO_GROSS_MARGIN_MIN_USD} USD por unidad.`,
    });
  } else if (retail > 0 && meetsGrossMin) {
    flags.push({
      level: 'ok',
      code: 'gross_ok',
      message: `Margen bruto $${grossMarginUsd.toFixed(2)} USD cumple el mínimo de $${AUDISIO_GROSS_MARGIN_MIN_USD} USD.`,
    });
  }

  if (retail > 0 && !meetsNetTarget) {
    flags.push({
      level: 'warn',
      code: 'net_target',
      message: `Margen de contribución ${(contributionMarginRatio * 100).toFixed(0)}% — objetivo ≈ ${Math.round(AUDISIO_NET_MARGIN_TARGET * 100)}% neto (aprox.). Considera oferta/regalo de alto valor percibido.`,
    });
  } else if (retail > 0 && meetsNetTarget) {
    flags.push({
      level: 'ok',
      code: 'net_ok',
      message: `Margen de contribución ${(contributionMarginRatio * 100).toFixed(0)}% cerca del objetivo ${Math.round(AUDISIO_NET_MARGIN_TARGET * 100)}%.`,
    });
  }

  if (cost > 0 && Math.abs(retail - suggestedRetailUsd) > 0.05) {
    flags.push({
      level: 'info',
      code: 'suggest_multiplier',
      message: `Con multiplicador ×${AUDISIO_COST_TO_RETAIL_MULTIPLIER}, PVP sugerido ≈ $${suggestedRetailUsd.toFixed(2)} USD (${suggestedRetailClp.toLocaleString('es-CL')} CLP).`,
    });
  }

  flags.push({
    level: 'info',
    code: 'test_budget',
    message: `Presupuesto de testeo del método: $${AUDISIO_TEST_AD_BUDGET_USD} USD el primer mes / mes y medio; después el negocio debería autofinanciarse.`,
  });

  let giftHint = null;
  if (retail > 0 && !meetsNetTarget) {
    giftHint =
      'Para acercarte al ~35% neto, prueba un bundle o regalo de alto valor percibido (bajo costo real) sin bajar el PVP bajo el piso CLP.';
  }

  return {
    costUsd: cost,
    retailUsd: retail,
    fxClpPerUsd: safeFx,
    costClp,
    retailClp,
    suggestedRetailUsd,
    suggestedRetailClp,
    suggestedBand,
    band,
    grossMarginUsd,
    contributionMarginRatio,
    contributionMarginPercent: Math.round(contributionMarginRatio * 1000) / 10,
    meetsFloor: band.meetsFloor || retail === 0,
    inRecommendedBand: band.inRecommendedBand,
    meetsGrossMin,
    meetsNetTarget,
    flags,
    giftHint,
    testBudgetUsd: AUDISIO_TEST_AD_BUDGET_USD,
  };
}
