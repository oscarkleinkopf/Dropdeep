// Monte Carlo Simulation Engine for Ad Profitability Forecasting
// Runs 1,000 trials with Box-Muller Gaussian variations on CPC and Conversion Rate

import {
  AUDISIO_CPA_ACCEPTABLE_MAX_USD,
  AUDISIO_CPA_TEST_IDEAL_MAX_USD,
  AUDISIO_DEFAULT_MC_CPC_USD,
  AUDISIO_GROSS_MARGIN_MIN_USD,
  AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
  AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD,
  AUDISIO_METHOD_LABEL,
  AUDISIO_TEST_AD_BUDGET_USD,
  AUDISIO_TEST_BUDGET_WINDOW_MAX_MONTHS,
  AUDISIO_TEST_BUDGET_WINDOW_MIN_MONTHS,
  AUDISIO_TEST_MIN_LEARNING_ORDERS,
} from '../config/audisioRules.js';

function randomGaussian(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + num * stdDev;
}

/**
 * CPA proyectado (USD) ≈ CPC / (tasa conversión en fracción).
 * Offline — no usa datos de Meta.
 */
export function projectCpaFromCpc(cpcUsd, convRatePercent) {
  const cpc = Math.max(0, parseFloat(cpcUsd) || 0);
  const conv = Math.max(0.01, parseFloat(convRatePercent) || 0.01);
  return Math.round((cpc / (conv / 100)) * 100) / 100;
}

/**
 * Plan de testeo Audisio: runway del pool $300 a $/día y riesgos de aprendizaje.
 */
export function projectAudisioTestBudgetPlan(params = {}) {
  const dailyBudget = Math.max(
    1,
    parseFloat(params.dailyBudget) || AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
  );
  const totalTestBudget =
    parseFloat(params.totalTestBudget) || AUDISIO_TEST_AD_BUDGET_USD;
  const cpc = parseFloat(params.cpc) || AUDISIO_DEFAULT_MC_CPC_USD;
  const convRate = parseFloat(params.convRate) || 2.5;
  const aov = parseFloat(params.aov) || 0;
  const cost = parseFloat(params.cost) || 0;

  const daysRunway = Math.round((totalTestBudget / dailyBudget) * 10) / 10;
  const weeksRunway = Math.round((daysRunway / 7) * 10) / 10;
  const projectedCpa = projectCpaFromCpc(cpc, convRate);
  const estimatedOrders =
    projectedCpa > 0
      ? Math.round((totalTestBudget / projectedCpa) * 10) / 10
      : 0;
  const grossMargin = aov > 0 ? Math.round((aov - cost) * 100) / 100 : null;

  const flags = [];

  if (estimatedOrders < AUDISIO_TEST_MIN_LEARNING_ORDERS) {
    flags.push({
      level: 'warn',
      code: 'low_learning',
      message: `Con CPA proyectado ~$${projectedCpa}, el pool de $${totalTestBudget} rinde ~${estimatedOrders} pedidos (< ${AUDISIO_TEST_MIN_LEARNING_ORDERS}). Riesgo de agotar el presupuesto de testeo sin aprendizaje suficiente.`,
    });
  }

  if (projectedCpa > AUDISIO_CPA_ACCEPTABLE_MAX_USD) {
    flags.push({
      level: 'error',
      code: 'cpa_too_high',
      message: `CPA proyectado ~$${projectedCpa} supera el techo aceptable del método ($${AUDISIO_CPA_ACCEPTABLE_MAX_USD}). Baja CPC, sube conversión o revisa oferta antes de gastar el test.`,
    });
  } else if (projectedCpa > AUDISIO_CPA_TEST_IDEAL_MAX_USD) {
    flags.push({
      level: 'warn',
      code: 'cpa_above_ideal',
      message: `CPA proyectado ~$${projectedCpa} está por encima de la banda ideal de test ($${AUDISIO_CPA_TEST_IDEAL_MAX_USD}). Vigila de cerca; el pool de $${totalTestBudget} se consume más rápido.`,
    });
  }

  if (grossMargin != null && projectedCpa > grossMargin && grossMargin >= 0) {
    flags.push({
      level: 'error',
      code: 'cpa_above_margin',
      message: `CPA proyectado (~$${projectedCpa}) supera el margen bruto unitario (~$${grossMargin}). Cada venta pagada con ads perdería plata.`,
    });
  } else if (
    grossMargin != null &&
    grossMargin < AUDISIO_GROSS_MARGIN_MIN_USD &&
    aov > 0
  ) {
    flags.push({
      level: 'warn',
      code: 'thin_margin',
      message: `Margen bruto ~$${grossMargin} está bajo el mínimo del método ($${AUDISIO_GROSS_MARGIN_MIN_USD}). El test de $${totalTestBudget} es más frágil.`,
    });
  }

  const isBeginnerPace = dailyBudget <= AUDISIO_LAUNCH_BUDGET_BEGINNER_USD + 0.01;
  const paceLabel = isBeginnerPace
    ? `ritmo principiante (~$${AUDISIO_LAUNCH_BUDGET_BEGINNER_USD}/día)`
    : dailyBudget <= AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD + 0.01
      ? `ritmo experimentado (~$${AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD}/día)`
      : `$${dailyBudget}/día (por encima del ritmo Audisio típico)`;

  return {
    totalTestBudgetUsd: totalTestBudget,
    dailyBudgetUsd: dailyBudget,
    daysRunway,
    weeksRunway,
    projectedCpaUsd: projectedCpa,
    estimatedOrdersFromTest: estimatedOrders,
    minLearningOrders: AUDISIO_TEST_MIN_LEARNING_ORDERS,
    grossMarginUsd: grossMargin,
    paceLabel,
    windowLabel: `${AUDISIO_TEST_BUDGET_WINDOW_MIN_MONTHS}–${AUDISIO_TEST_BUDGET_WINDOW_MAX_MONTHS} meses`,
    methodNote: `Presupuesto de testeo del método: $${totalTestBudget} USD el primer mes / mes y medio; después el negocio debería autofinanciarse. ${AUDISIO_METHOD_LABEL}.`,
    autofinanceNote:
      'Tras el test, el objetivo es que el margen de las ventas financie más ads (autofinanciamiento) — no seguir inyectando capital a ciegas.',
    flags,
    presets: {
      beginnerDaily: AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
      experiencedDaily: AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD,
      beginnerDays: Math.round((totalTestBudget / AUDISIO_LAUNCH_BUDGET_BEGINNER_USD) * 10) / 10,
      experiencedDays:
        Math.round((totalTestBudget / AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD) * 10) / 10,
    },
  };
}

export function runMonteCarloSimulation(params) {
  const budget = parseFloat(params.budget) || AUDISIO_LAUNCH_BUDGET_BEGINNER_USD;
  const cpcMean = parseFloat(params.cpc) || AUDISIO_DEFAULT_MC_CPC_USD;
  const convMean = parseFloat(params.convRate) || 2.5;
  const aov = parseFloat(params.aov) || 39.99;
  const cost = parseFloat(params.cost) || 10.00;
  const gatewayFeeRate = parseFloat(params.gatewayFeeRate) || 0.029; // 2.9% Stripe
  const gatewayFixed = parseFloat(params.gatewayFixed) || 0.30; // $0.30 per tx
  const refundRate = parseFloat(params.refundRate) || 0.02; // 2% refunds
  const iterations = 1000;

  const trials = [];
  let winCount = 0;
  let totalProfit = 0;

  for (let i = 0; i < iterations; i++) {
    // Standard deviation: 20% for CPC, 25% for Conversion Rate
    const cpcTrial = Math.max(0.10, randomGaussian(cpcMean, cpcMean * 0.20));
    const convTrial = Math.max(0.20, randomGaussian(convMean, convMean * 0.25));

    const clicks = budget / cpcTrial;
    const orders = clicks * (convTrial / 100);
    const grossRevenue = orders * aov;
    const refunds = grossRevenue * refundRate;
    const netRevenue = grossRevenue - refunds;
    const gatewayFees = orders > 0 ? (netRevenue * gatewayFeeRate + orders * gatewayFixed) : 0;
    const cogs = orders * cost;
    const dailyProfit = netRevenue - (cogs + budget + gatewayFees);
    const roas = budget > 0 ? (grossRevenue / budget) : 0;

    if (dailyProfit > 0) winCount++;
    totalProfit += dailyProfit;

    trials.push({
      cpc: cpcTrial,
      convRate: convTrial,
      orders,
      grossRevenue,
      dailyProfit,
      roas
    });
  }

  // Sort trials by profit ascending
  trials.sort((a, b) => a.dailyProfit - b.dailyProfit);

  const winRate = Math.round((winCount / iterations) * 100);
  const avgProfit = Math.round(totalProfit / iterations * 100) / 100;

  // Percentiles: P10 (Pesimista), P50 (Realista), P90 (Optimista)
  const p10 = trials[Math.floor(iterations * 0.10)];
  const p50 = trials[Math.floor(iterations * 0.50)];
  const p90 = trials[Math.floor(iterations * 0.90)];

  const testPlan = projectAudisioTestBudgetPlan({
    dailyBudget: budget,
    cpc: cpcMean,
    convRate: convMean,
    aov,
    cost,
  });

  return {
    winRate,
    avgProfit,
    testPlan,
    p10: {
      profit: Math.round(p10.dailyProfit * 100) / 100,
      roas: Math.round(p10.roas * 100) / 100,
      cpc: Math.round(p10.cpc * 100) / 100,
      convRate: Math.round(p10.convRate * 10) / 10
    },
    p50: {
      profit: Math.round(p50.dailyProfit * 100) / 100,
      roas: Math.round(p50.roas * 100) / 100,
      cpc: Math.round(p50.cpc * 100) / 100,
      convRate: Math.round(p50.convRate * 10) / 10
    },
    p90: {
      profit: Math.round(p90.dailyProfit * 100) / 100,
      roas: Math.round(p90.roas * 100) / 100,
      cpc: Math.round(p90.cpc * 100) / 100,
      convRate: Math.round(p90.convRate * 10) / 10
    }
  };
}
