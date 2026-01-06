/**
 * Simple Interest Calculations
 *
 * Simple Interest Formula: I = P × r × t
 * Where:
 * - I = Interest earned
 * - P = Principal amount
 * - r = Annual interest rate (as decimal)
 * - t = Time in years
 *
 * End Balance = Principal + Total Interest
 */

export interface SimpleInterestInputs {
  principal: number;
  interestRate: number; // Annual rate as percentage (e.g., 5 for 5%)
  years: number;
  months: number;
}

export interface YearlySchedule {
  year: number;
  interestEarned: number;
  cumulativeInterest: number;
  endBalance: number;
}

export interface SimpleInterestResults {
  principal: number;
  totalInterest: number;
  endBalance: number;
  totalTimeInYears: number;
  interestPercentage: number;
  principalPercentage: number;
  schedule: YearlySchedule[];
}

/**
 * Calculate simple interest and generate results
 */
export function calculateSimpleInterest(
  inputs: SimpleInterestInputs
): SimpleInterestResults {
  const { principal, interestRate, years, months } = inputs;

  // Convert time to years
  const totalTimeInYears = years + months / 12;

  // Convert interest rate to decimal
  const rateDecimal = interestRate / 100;

  // Calculate simple interest: I = P × r × t
  const totalInterest = principal * rateDecimal * totalTimeInYears;

  // Calculate end balance
  const endBalance = principal + totalInterest;

  // Calculate percentages
  const interestPercentage =
    endBalance > 0 ? (totalInterest / endBalance) * 100 : 0;
  const principalPercentage = 100 - interestPercentage;

  // Generate yearly schedule
  const schedule = generateYearlySchedule(
    principal,
    rateDecimal,
    years,
    months
  );

  return {
    principal,
    totalInterest,
    endBalance,
    totalTimeInYears,
    interestPercentage,
    principalPercentage,
    schedule,
  };
}

/**
 * Generate yearly breakdown of simple interest
 */
function generateYearlySchedule(
  principal: number,
  rateDecimal: number,
  years: number,
  months: number
): YearlySchedule[] {
  const schedule: YearlySchedule[] = [];
  let cumulativeInterest = 0;

  // Full years
  for (let year = 1; year <= years; year++) {
    // Simple interest for one year: I = P × r × 1
    const interestEarned = principal * rateDecimal;
    cumulativeInterest += interestEarned;

    schedule.push({
      year,
      interestEarned,
      cumulativeInterest,
      endBalance: principal + cumulativeInterest,
    });
  }

  // Partial year (if months > 0)
  if (months > 0) {
    const partialYearTime = months / 12;
    const interestEarned = principal * rateDecimal * partialYearTime;
    cumulativeInterest += interestEarned;

    schedule.push({
      year: years + 1,
      interestEarned,
      cumulativeInterest,
      endBalance: principal + cumulativeInterest,
    });
  }

  return schedule;
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency with cents
 */
export function formatCurrencyWithCents(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
