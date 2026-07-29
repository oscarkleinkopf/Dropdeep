/** Influ_JSON-style free operational tier — honest limits, no billing. */

export const FREE_PORTFOLIO_CAP = 10;
export const FREE_COMPARE_MAX = 2;
export const PRO_COMPARE_MAX = 3;

const parsedProxyDaily = Number.parseInt(
  String(import.meta.env.VITE_FREE_TIER_PROXY_DAILY ?? '2'),
  10
);

/** Display + docs default for proxy starter quota (enforced server-side). */
export const FREE_PROXY_DAILY_LIMIT = Number.isFinite(parsedProxyDaily) && parsedProxyDaily > 0
  ? parsedProxyDaily
  : 2;

export function getCompareMax(isLoggedIn) {
  return isLoggedIn ? PRO_COMPARE_MAX : FREE_COMPARE_MAX;
}

export function isPortfolioAtCap(portfolioLength) {
  return portfolioLength >= FREE_PORTFOLIO_CAP;
}
