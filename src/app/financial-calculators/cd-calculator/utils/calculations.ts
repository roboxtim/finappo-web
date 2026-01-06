/**
 * CD (Certificate of Deposit) Calculator Utilities
 *
 * Formulas:
 * - Standard Compounding: A = P(1 + r/n)^(nt)
 * - Continuous Compounding: A = Pe^(rt)
 *
 * Where:
 * A = Final amount
 * P = Principal (initial deposit)
 * r = Annual interest rate (as decimal)
 * n = Number of times interest is compounded per year
 * t = Time in years
 * e = Euler's number (≈2.71828)
 */

export type CompoundingFrequency =
  | 'daily'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'continuously';

export interface CDInputs {
  initialDeposit: number;
  interestRate: number; // Annual percentage rate (e.g., 5 for 5%)
  years: number;
  months: number;
  compoundingFrequency: CompoundingFrequency;
}

export interface AccumulationPeriod {
  period: number; // Month number (1-based)
  deposit: number; // Principal amount
  interestEarned: number; // Interest for this period
  balance: number; // Running total
}

export interface CDResults {
  endingBalance: number;
  totalInterest: number;
  totalDeposit: number;
  effectiveAnnualRate: number; // APY
  schedule: AccumulationPeriod[];
}

/**
 * Get the number of compounding periods per year
 */
function getCompoundingPeriodsPerYear(frequency: CompoundingFrequency): number {
  switch (frequency) {
    case 'daily':
      return 365;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'semiannually':
      return 2;
    case 'annually':
      return 1;
    case 'continuously':
      return 0; // Special case
    default:
      return 12;
  }
}

/**
 * Calculate CD with compound interest
 */
export function calculateCD(inputs: CDInputs): CDResults {
  const { initialDeposit, interestRate, years, months, compoundingFrequency } =
    inputs;

  // Convert to decimal
  const rate = interestRate / 100;

  // Total time in years
  const totalYears = years + months / 12;

  // Calculate final amount based on compounding frequency
  let endingBalance: number;
  let effectiveAnnualRate: number;

  if (compoundingFrequency === 'continuously') {
    // Continuous compounding: A = Pe^(rt)
    endingBalance = initialDeposit * Math.exp(rate * totalYears);
    effectiveAnnualRate = (Math.exp(rate) - 1) * 100;
  } else {
    // Standard compounding: A = P(1 + r/n)^(nt)
    const n = getCompoundingPeriodsPerYear(compoundingFrequency);
    const exponent = n * totalYears;
    endingBalance = initialDeposit * Math.pow(1 + rate / n, exponent);

    // Calculate APY: (1 + r/n)^n - 1
    effectiveAnnualRate = (Math.pow(1 + rate / n, n) - 1) * 100;
  }

  const totalInterest = endingBalance - initialDeposit;

  // Generate monthly accumulation schedule
  const schedule: AccumulationPeriod[] = [];
  const totalMonths = years * 12 + months;

  for (let month = 1; month <= totalMonths; month++) {
    const monthsElapsed = month;
    const yearsElapsed = monthsElapsed / 12;

    let monthlyBalance: number;

    if (compoundingFrequency === 'continuously') {
      monthlyBalance = initialDeposit * Math.exp(rate * yearsElapsed);
    } else {
      const n = getCompoundingPeriodsPerYear(compoundingFrequency);
      monthlyBalance =
        initialDeposit * Math.pow(1 + rate / n, n * yearsElapsed);
    }

    // Calculate interest earned in this period
    const previousBalance =
      month === 1 ? initialDeposit : schedule[month - 2].balance;
    const interestEarned = monthlyBalance - previousBalance;

    schedule.push({
      period: month,
      deposit: initialDeposit,
      interestEarned,
      balance: monthlyBalance,
    });
  }

  return {
    endingBalance,
    totalInterest,
    totalDeposit: initialDeposit,
    effectiveAnnualRate,
    schedule,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
