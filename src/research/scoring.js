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
