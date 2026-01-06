/**
 * Average Return Calculator - Calculation Utilities
 *
 * This module provides functions to calculate various types of investment returns:
 * - Arithmetic Mean: Simple average of returns
 * - Geometric Mean: Compound average return (CAGR-like)
 * - Annualized Return: Time-weighted return adjusted for period length
 * - Cumulative Return: Total return over all periods
 */

export type ReturnPeriod = {
  returnPercent: number; // Return percentage for the period (e.g., 10 for 10%)
  years: number; // Number of years in the holding period
  months: number; // Additional months in the holding period (0-11)
};

export type AverageReturnResults = {
  arithmeticMean: number; // Simple average of all returns
  geometricMean: number; // Compound average return
  annualizedReturn: number; // Time-weighted annualized return
  cumulativeReturn: number; // Total return over all periods
  totalPeriods: number; // Number of investment periods
  totalYears: number; // Total time invested in years
};

/**
 * Calculate Arithmetic Mean (Simple Average)
 *
 * Formula: Sum of all returns / Number of periods
 *
 * This is the simplest measure but doesn't account for compounding.
 * It's useful for understanding the average performance across periods.
 */
export function calculateArithmeticMean(periods: ReturnPeriod[]): number {
  if (periods.length === 0) return 0;

  const sum = periods.reduce((acc, period) => acc + period.returnPercent, 0);
  return sum / periods.length;
}

/**
 * Calculate Geometric Mean (Compound Average Return)
 *
 * Formula: [(1 + R1) × (1 + R2) × ... × (1 + Rn)]^(1/n) - 1
 *
 * This measures the compound growth rate and is more accurate than arithmetic mean
 * when dealing with returns over multiple periods. It accounts for the compounding effect.
 */
export function calculateGeometricMean(periods: ReturnPeriod[]): number {
  if (periods.length === 0) return 0;
  if (periods.length === 1) return periods[0].returnPercent;

  // Calculate the product of (1 + return) for each period
  let product = 1;
  for (const period of periods) {
    product *= 1 + period.returnPercent / 100;
  }

  // Take the nth root and subtract 1 to get the geometric mean
  const geometricMean = Math.pow(product, 1 / periods.length) - 1;
  return geometricMean * 100;
}

/**
 * Calculate Annualized Return
 *
 * Formula: [(1 + Total Return)]^(1 / Total Years) - 1
 *
 * This converts the total return into an equivalent annual rate,
 * accounting for the actual time invested (years and months).
 */
export function calculateAnnualizedReturn(periods: ReturnPeriod[]): number {
  if (periods.length === 0) return 0;

  // Calculate total time in years
  const totalYears = periods.reduce(
    (acc, period) => acc + period.years + period.months / 12,
    0
  );

  if (totalYears === 0) return 0;

  // Calculate cumulative return (product of all period returns)
  let product = 1;
  for (const period of periods) {
    product *= 1 + period.returnPercent / 100;
  }

  // Annualize the return
  const annualizedReturn = Math.pow(product, 1 / totalYears) - 1;
  return annualizedReturn * 100;
}

/**
 * Calculate Cumulative Return
 *
 * Formula: [(1 + R1) × (1 + R2) × ... × (1 + Rn)] - 1
 *
 * This is the total return over all periods, accounting for compounding.
 */
export function calculateCumulativeReturn(periods: ReturnPeriod[]): number {
  if (periods.length === 0) return 0;

  let product = 1;
  for (const period of periods) {
    product *= 1 + period.returnPercent / 100;
  }

  return (product - 1) * 100;
}

/**
 * Calculate all average return metrics
 *
 * This is the main calculation function that computes all return metrics
 * based on the input periods.
 */
export function calculateAverageReturn(
  periods: ReturnPeriod[]
): AverageReturnResults {
  // Calculate total years
  const totalYears = periods.reduce(
    (acc, period) => acc + period.years + period.months / 12,
    0
  );

  return {
    arithmeticMean: calculateArithmeticMean(periods),
    geometricMean: calculateGeometricMean(periods),
    annualizedReturn: calculateAnnualizedReturn(periods),
    cumulativeReturn: calculateCumulativeReturn(periods),
    totalPeriods: periods.length,
    totalYears: Number(totalYears.toFixed(2)),
  };
}
