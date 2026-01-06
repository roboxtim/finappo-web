/**
 * Investment Calculator - Calculation Utilities
 *
 * Formula Reference (based on calculator.net):
 *
 * Compound Interest with Regular Contributions:
 * FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)] × (1 + r/n × timing)
 *
 * Where:
 * - FV = Future Value
 * - P = Principal (starting amount)
 * - r = Annual interest rate (as decimal)
 * - n = Number of times interest compounds per year
 * - t = Number of years
 * - PMT = Regular payment amount
 * - timing = 0 for end of period, 1 for beginning of period
 *
 * The formula has two components:
 * 1. Compound interest on initial investment: P(1 + r/n)^(nt)
 * 2. Future value of annuity (regular contributions): PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
 *
 * For contributions at beginning of period, multiply the annuity by (1 + r/n)
 */

export type ContributionFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'semimonthly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually';

export type CompoundFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'semimonthly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'continuously';

export type ContributionTiming = 'beginning' | 'end';

export interface InvestmentInputs {
  startingAmount: number; // Initial investment (P)
  additionalContribution: number; // Regular contribution amount (PMT)
  contributionFrequency: ContributionFrequency; // How often contributions are made
  lengthYears: number; // Investment period in years (t)
  returnRate: number; // Annual rate of return as percentage
  compoundFrequency: CompoundFrequency; // How often interest compounds (n)
  contributionTiming: ContributionTiming; // Beginning or end of period
}

export interface YearlyBreakdown {
  year: number;
  startingBalance: number;
  contributions: number;
  interestEarned: number;
  endingBalance: number;
  cumulativeContributions: number;
  cumulativeInterest: number;
}

export interface InvestmentResults {
  endBalance: number; // Final investment value
  totalContributions: number; // Starting amount + all contributions
  totalInterest: number; // Total interest earned
  yearByYear: YearlyBreakdown[]; // Year-by-year breakdown
}

/**
 * Get the number of periods per year for a given frequency
 */
function getPeriodsPerYear(
  frequency: ContributionFrequency | CompoundFrequency
): number {
  const periodMap: Record<string, number> = {
    daily: 365,
    weekly: 52,
    biweekly: 26,
    semimonthly: 24, // Twice per month
    monthly: 12,
    quarterly: 4,
    semiannually: 2,
    annually: 1,
    continuously: Infinity, // Special case
  };

  return periodMap[frequency] || 12;
}

/**
 * Calculate future value with compound interest and regular contributions
 */
export function calculateInvestment(
  inputs: InvestmentInputs
): InvestmentResults {
  const {
    startingAmount,
    additionalContribution,
    contributionFrequency,
    lengthYears,
    returnRate,
    compoundFrequency,
    contributionTiming,
  } = inputs;

  // Handle continuously compounding (special case)
  if (compoundFrequency === 'continuously') {
    return calculateContinuousCompounding(inputs);
  }

  const r = returnRate / 100; // Convert percentage to decimal
  const n = getPeriodsPerYear(compoundFrequency); // Compound periods per year
  const contributionPeriodsPerYear = getPeriodsPerYear(contributionFrequency);
  const t = lengthYears;
  const totalPeriods = n * t;

  // Calculate future value of initial investment
  // FV_principal = P(1 + r/n)^(nt)
  const ratePerPeriod = r / n;
  const futureValuePrincipal =
    startingAmount * Math.pow(1 + ratePerPeriod, totalPeriods);

  // Calculate future value of contributions (annuity)
  // Use per-contribution calculation for accuracy
  let futureValueContributions = 0;

  if (additionalContribution > 0 && contributionPeriodsPerYear > 0) {
    const totalNumContributions = contributionPeriodsPerYear * t;

    // Calculate the growth of each individual contribution
    for (let i = 0; i < totalNumContributions; i++) {
      // For contribution made at period i:
      // - If timing is 'end': it's made at the END of contribution period i
      // - If timing is 'beginning': it's made at the START of contribution period i

      // For 'end' timing: contribution is made at the end of the period,
      // so it doesn't earn interest during that period
      // For 'beginning' timing: contribution is made at start and earns interest that period

      // Number of compound periods this contribution will grow
      let compoundPeriodsToGrow: number;

      if (contributionTiming === 'end') {
        // Contribution i is made at END of contribution period i
        // It will compound for the remaining contribution periods
        // Total contribution periods - current period (0-indexed) - 1 (because it's at the end)
        const remainingContributionPeriods = totalNumContributions - i - 1;
        // Convert to compound periods
        compoundPeriodsToGrow =
          (remainingContributionPeriods / contributionPeriodsPerYear) * n;
      } else {
        // Contribution i is made at BEGINNING of contribution period i
        // It will compound for the remaining contribution periods + this period
        const remainingContributionPeriods = totalNumContributions - i;
        compoundPeriodsToGrow =
          (remainingContributionPeriods / contributionPeriodsPerYear) * n;
      }

      // Calculate the future value of this contribution
      if (ratePerPeriod !== 0 && compoundPeriodsToGrow > 0) {
        const fv =
          additionalContribution *
          Math.pow(1 + ratePerPeriod, compoundPeriodsToGrow);
        futureValueContributions += fv;
      } else {
        futureValueContributions += additionalContribution;
      }
    }
  }

  const endBalance = futureValuePrincipal + futureValueContributions;

  // Calculate total contributions
  const totalContributions =
    startingAmount + additionalContribution * contributionPeriodsPerYear * t;

  // Calculate total interest
  const totalInterest = endBalance - totalContributions;

  // Generate year-by-year breakdown
  const yearByYear = calculateYearByYear(inputs);

  return {
    endBalance: Math.round(endBalance * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    yearByYear,
  };
}

/**
 * Calculate with continuous compounding
 * FV = P × e^(rt) + PMT × [(e^(rt) - 1) / (e^(r/m) - 1)]
 * where m is the contribution frequency
 */
function calculateContinuousCompounding(
  inputs: InvestmentInputs
): InvestmentResults {
  const {
    startingAmount,
    additionalContribution,
    contributionFrequency,
    lengthYears,
    returnRate,
    contributionTiming,
  } = inputs;

  const r = returnRate / 100;
  const t = lengthYears;
  const m = getPeriodsPerYear(contributionFrequency);

  // FV of principal with continuous compounding: P × e^(rt)
  const futureValuePrincipal = startingAmount * Math.exp(r * t);

  // FV of contributions with continuous compounding
  let futureValueContributions = 0;
  if (additionalContribution > 0 && r !== 0) {
    // Using the continuous compounding annuity formula
    const erT = Math.exp(r * t);
    const erM = Math.exp(r / m);
    futureValueContributions = additionalContribution * ((erT - 1) / (erM - 1));

    if (contributionTiming === 'beginning') {
      futureValueContributions *= erM;
    }
  } else if (additionalContribution > 0) {
    futureValueContributions = additionalContribution * m * t;
  }

  const endBalance = futureValuePrincipal + futureValueContributions;
  const totalContributions = startingAmount + additionalContribution * m * t;
  const totalInterest = endBalance - totalContributions;

  // For continuous compounding, we'll calculate year-by-year with a high frequency approximation
  const yearByYear = calculateYearByYear({
    ...inputs,
    compoundFrequency: 'daily', // Approximate continuous with daily
  });

  return {
    endBalance: Math.round(endBalance * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    yearByYear,
  };
}

/**
 * Calculate year-by-year breakdown
 */
function calculateYearByYear(inputs: InvestmentInputs): YearlyBreakdown[] {
  const {
    startingAmount,
    additionalContribution,
    contributionFrequency,
    lengthYears,
    returnRate,
    compoundFrequency,
    contributionTiming,
  } = inputs;

  const yearlyData: YearlyBreakdown[] = [];
  const r = returnRate / 100;
  const n =
    compoundFrequency === 'continuously'
      ? 365
      : getPeriodsPerYear(compoundFrequency);
  const contributionPeriodsPerYear = getPeriodsPerYear(contributionFrequency);
  const ratePerPeriod = r / n;

  // How much is contributed per compound period
  const contributionPerCompoundPeriod =
    (additionalContribution * contributionPeriodsPerYear) / n;

  let currentBalance = startingAmount;
  let cumulativeContributions = startingAmount;
  let cumulativeInterest = 0;

  for (let year = 1; year <= lengthYears; year++) {
    const startingBalance = currentBalance;
    const periodsThisYear = n; // One year's worth of compound periods
    let yearContributions = 0;
    let yearInterest = 0;

    // Simulate each period within the year
    for (let period = 0; period < periodsThisYear; period++) {
      // Add contribution (at beginning or end of period)
      if (contributionTiming === 'beginning') {
        currentBalance += contributionPerCompoundPeriod;
        yearContributions += contributionPerCompoundPeriod;
      }

      // Apply interest
      const periodInterest = currentBalance * ratePerPeriod;
      currentBalance += periodInterest;
      yearInterest += periodInterest;

      // Add contribution at end if that's the timing
      if (contributionTiming === 'end') {
        currentBalance += contributionPerCompoundPeriod;
        yearContributions += contributionPerCompoundPeriod;
      }
    }

    cumulativeContributions += yearContributions;
    cumulativeInterest += yearInterest;

    yearlyData.push({
      year,
      startingBalance: Math.round(startingBalance * 100) / 100,
      contributions: Math.round(yearContributions * 100) / 100,
      interestEarned: Math.round(yearInterest * 100) / 100,
      endingBalance: Math.round(currentBalance * 100) / 100,
      cumulativeContributions: Math.round(cumulativeContributions * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
    });
  }

  return yearlyData;
}

/**
 * Format currency for display
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
 * Format currency with cents for display
 */
export function formatCurrencyWithCents(value: number): string {
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
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get display label for frequency
 */
export function getFrequencyLabel(
  frequency: ContributionFrequency | CompoundFrequency
): string {
  const labels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    semimonthly: 'Semi-monthly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    semiannually: 'Semi-annually',
    annually: 'Annually',
    continuously: 'Continuously',
  };

  return labels[frequency] || frequency;
}
