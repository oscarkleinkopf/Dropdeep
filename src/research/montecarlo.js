// Monte Carlo Simulation Engine for Ad Profitability Forecasting
// Runs 1,000 trials with Box-Muller Gaussian variations on CPC and Conversion Rate

function randomGaussian(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + num * stdDev;
}

export function runMonteCarloSimulation(params) {
  const budget = parseFloat(params.budget) || 50;
  const cpcMean = parseFloat(params.cpc) || 0.80;
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

  return {
    winRate,
    avgProfit,
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
