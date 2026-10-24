/**
 * Deterministic Financial Math & Equity Engine for My Company Simulator
 * High-precision calculations for enterprise valuation, dilution, dividends, and cash flows.
 */

/**
 * Calculates current enterprise valuation based on Revenue multiple, Profitability, Tech, and Sentiment.
 * @param {Object} metrics
 * @param {number} metrics.cash
 * @param {number} metrics.monthlyRevenue
 * @param {number} metrics.monthlyExpenses
 * @param {number} metrics.techLevel
 * @param {number} metrics.reputation (0 - 100)
 * @param {number} metrics.marketSentiment (0.5 to 1.5)
 * @returns {number}
 */
export function calculateValuation(metrics) {
  const annualRevenue = Math.max(10000, metrics.monthlyRevenue * 12);
  const netMargin = metrics.monthlyRevenue > 0
    ? (metrics.monthlyRevenue - metrics.monthlyExpenses) / metrics.monthlyRevenue
    : -0.5;

  // Base multiple: 6x to 25x revenue depending on profitability and sentiment
  let revenueMultiple = 8;
  if (netMargin > 0.3) revenueMultiple += 6;
  else if (netMargin > 0.1) revenueMultiple += 3;
  else if (netMargin < -0.2) revenueMultiple = Math.max(2, revenueMultiple - 4);

  // Tech innovation & brand reputation multipliers
  const techMultiplier = 1 + (metrics.techLevel * 0.05);
  const repMultiplier = 0.7 + (metrics.reputation / 100) * 0.6;
  const sentimentMultiplier = typeof metrics.marketSentiment === 'number' ? metrics.marketSentiment : 1.0;

  const rawValuation = annualRevenue * revenueMultiple * techMultiplier * repMultiplier * sentimentMultiplier;

  // Floor at $50,000 for early startup
  return Math.max(50000, Math.round(rawValuation));
}

/**
 * Calculates share price based on valuation and total issued shares.
 * @param {number} valuation
 * @param {number} totalShares
 * @returns {number}
 */
export function calculateSharePrice(valuation, totalShares) {
  if (totalShares <= 0) return 1.0;
  const price = valuation / totalShares;
  return Math.max(0.01, Math.round(price * 100) / 100);
}

/**
 * Calculates share ownership percentages for all stakeholders.
 * @param {Object} equity
 * @param {number} equity.totalShares
 * @param {number} equity.founderShares
 * @param {number} equity.investorShares
 * @param {number} equity.esopShares
 * @param {number} equity.publicShares
 * @returns {{founderPct: number, investorPct: number, esopPct: number, publicPct: number}}
 */
export function calculateOwnershipPercentages(equity) {
  const total = equity.totalShares > 0 ? equity.totalShares : 1;
  return {
    founderPct: Math.round((equity.founderShares / total) * 10000) / 100,
    investorPct: Math.round((equity.investorShares / total) * 10000) / 100,
    esopPct: Math.round((equity.esopShares / total) * 10000) / 100,
    publicPct: Math.round((equity.publicShares / total) * 10000) / 100,
  };
}

/**
 * Issues new shares for a fundraising round (dilution formula).
 * New shares = (totalSharesBefore * equityPctToSell) / (1 - equityPctToSell)
 * @param {Object} currentEquity
 * @param {number} cashToRaise
 * @param {number} postMoneyValuation
 * @returns {{newEquity: Object, newSharesIssued: number, effectiveSharePrice: number}}
 */
export function processFundingRound(currentEquity, cashToRaise, postMoneyValuation) {
  const equityPctToSell = Math.min(0.45, Math.max(0.05, cashToRaise / postMoneyValuation));
  const newSharesIssued = Math.round((currentEquity.totalShares * equityPctToSell) / (1 - equityPctToSell));
  const totalSharesAfter = currentEquity.totalShares + newSharesIssued;
  const effectiveSharePrice = Math.round((postMoneyValuation / totalSharesAfter) * 100) / 100;

  return {
    newEquity: {
      totalShares: totalSharesAfter,
      founderShares: currentEquity.founderShares,
      investorShares: currentEquity.investorShares + newSharesIssued,
      esopShares: currentEquity.esopShares,
      publicShares: currentEquity.publicShares,
    },
    newSharesIssued,
    effectiveSharePrice,
  };
}

/**
 * Executes an IPO (Initial Public Offering) floating shares to the public stock market.
 * @param {Object} currentEquity
 * @param {number} publicFloatPct
 * @returns {{newEquity: Object, sharesFloated: number}}
 */
export function executeIpo(currentEquity, publicFloatPct) {
  const newPublicShares = Math.round((currentEquity.totalShares * publicFloatPct) / (1 - publicFloatPct));
  const totalSharesAfter = currentEquity.totalShares + newPublicShares;

  return {
    newEquity: {
      totalShares: totalSharesAfter,
      founderShares: currentEquity.founderShares,
      investorShares: currentEquity.investorShares,
      esopShares: currentEquity.esopShares,
      publicShares: currentEquity.publicShares + newPublicShares,
    },
    sharesFloated: newPublicShares,
  };
}

/**
 * Computes monthly net burn/profit and updated cash balance.
 * @param {number} currentCash
 * @param {number} monthlyRevenue
 * @param {number} monthlyExpenses
 * @param {number} dtMonths
 * @returns {{updatedCash: number, netCashFlow: number}}
 */
export function calculateCashFlow(currentCash, monthlyRevenue, monthlyExpenses, dtMonths = 1 / 30) {
  const netPerMonth = monthlyRevenue - monthlyExpenses;
  const delta = netPerMonth * dtMonths;
  return {
    updatedCash: Math.round((currentCash + delta) * 100) / 100,
    netCashFlow: netPerMonth,
  };
}

/**
 * Formats a currency amount into standard USD notation with compact suffixes ($1.5M, $240K).
 * @param {number} amount
 * @param {boolean} [compact=false]
 * @returns {string}
 */
export function formatCurrency(amount, compact = false) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return `$${Math.round(amount)}`;
  }
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Formats a number with comma grouping.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('en-US');
}
