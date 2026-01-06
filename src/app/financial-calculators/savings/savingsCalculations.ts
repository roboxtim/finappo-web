/**
 * Savings Calculator - Calculation Logic
 *
 * This module implements savings calculations with compound interest,
 * regular contributions, and tax considerations based on the reference
 * calculator at https://www.calculator.net/savings-calculator.html
 */

export type CompoundFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'semimonthly'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'
  | 'continuous';

export interface SavingsInputs {
  initialDeposit: number;
  annualContribution: number;
  monthlyContribution: number;
  interestRate: number; // Annual percentage
  compoundFrequency: CompoundFrequency;
  yearsToGrow: number;
  taxRate: number; // Percentage applied to interest
  contributionIncreaseRate?: number; // Annual percentage increase in contributions
}

export interface MonthlyScheduleRow {
  month: number;
  date: Date;
  deposit: number; // Deposits made this month (initial + monthly + annual if applicable)
  interest: number; // Interest earned this month (after tax)
  taxPaid: number; // Tax paid this month
  endingBalance: number;
}

export interface AnnualScheduleRow {
  year: number;
  startingBalance: number;
  deposits: number;
  interest: number;
  taxPaid: number;
  endingBalance: number;
}

export interface SavingsResults {
  finalBalance: number;
  initialDeposit: number;
  totalContributions: number;
  totalInterest: number; // After tax
  totalTaxPaid: number;
  schedule: MonthlyScheduleRow[];
  annualSchedule: AnnualScheduleRow[];
}

/**
 * Get the number of compounding periods per year
 */
function getCompoundingPeriodsPerYear(frequency: CompoundFrequency): number {
  switch (frequency) {
    case 'daily':
      return 365;
    case 'weekly':
      return 52;
    case 'biweekly':
      return 26;
    case 'semimonthly':
      return 24;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'semiannually':
      return 2;
    case 'annually':
      return 1;
    case 'continuous':
      return Infinity;
    default:
      return 12;
  }
}

// Removed unused function - using calculateMonthlyInterest instead

/**
 * Calculate interest for one month given current balance
 * When compounding frequency is less than monthly, we need to calculate
 * the effective monthly rate that would give the same result
 */
function calculateMonthlyInterest(
  balance: number,
  annualRate: number,
  compoundFrequency: CompoundFrequency
): number {
  if (annualRate === 0) return 0;

  const rate = annualRate / 100;

  if (compoundFrequency === 'continuous') {
    // For continuous compounding over one month: A = Pe^(rt) where t = 1/12
    return balance * (Math.exp(rate / 12) - 1);
  }

  const n = getCompoundingPeriodsPerYear(compoundFrequency);

  if (n >= 12) {
    // If compounding is monthly or more frequent, calculate normally
    const periodsThisMonth = n / 12;
    const ratePerPeriod = rate / n;
    return balance * (Math.pow(1 + ratePerPeriod, periodsThisMonth) - 1);
  } else {
    // If compounding is less frequent than monthly (quarterly, semiannually, annually)
    // We need to find the equivalent monthly rate
    // The effective monthly rate is: (1 + r/n)^(n/12) - 1
    const ratePerPeriod = rate / n;
    const monthsPerPeriod = 12 / n;
    const effectiveMonthlyRate =
      Math.pow(1 + ratePerPeriod, 1 / monthsPerPeriod) - 1;
    return balance * effectiveMonthlyRate;
  }
}

/**
 * Main calculation function
 */
export function calculateSavings(inputs: SavingsInputs): SavingsResults {
  const {
    initialDeposit,
    annualContribution,
    monthlyContribution,
    interestRate,
    compoundFrequency,
    yearsToGrow,
    taxRate,
    contributionIncreaseRate = 0,
  } = inputs;

  const totalMonths = yearsToGrow * 12;
  const schedule: MonthlyScheduleRow[] = [];
  const annualSchedule: AnnualScheduleRow[] = [];

  let balance = 0;
  let totalContributions = 0;
  let totalInterest = 0;
  let totalTaxPaid = 0;

  // Track annual data
  let yearStartBalance = 0;
  let yearDeposits = 0;
  let yearInterest = 0;
  let yearTaxPaid = 0;
  let currentYear = 1;

  const startDate = new Date();

  for (let month = 1; month <= totalMonths; month++) {
    const isFirstMonth = month === 1;
    const isDecember = month % 12 === 0;

    // Calculate year for contribution increases
    const yearsSinceStart = Math.floor((month - 1) / 12);
    const contributionMultiplier = Math.pow(
      1 + contributionIncreaseRate / 100,
      yearsSinceStart
    );

    // Track deposits this month for display
    let monthlyDeposit = 0;

    // On first month, add initial deposit
    if (isFirstMonth) {
      monthlyDeposit += initialDeposit;
      balance += initialDeposit;
      yearStartBalance = 0; // Starting from 0
    }

    // Calculate interest FIRST on the current balance (before adding contributions)
    const grossInterest = calculateMonthlyInterest(
      balance,
      interestRate,
      compoundFrequency
    );

    // Apply tax to interest
    const taxAmount = (grossInterest * taxRate) / 100;
    const netInterest = grossInterest - taxAmount;

    // Add net interest to balance
    balance += netInterest;
    totalInterest += netInterest;
    totalTaxPaid += taxAmount;
    yearInterest += netInterest;
    yearTaxPaid += taxAmount;

    // THEN add contributions at END of period (after interest)
    // Add monthly contribution
    if (monthlyContribution > 0) {
      const adjustedMonthly = monthlyContribution * contributionMultiplier;
      monthlyDeposit += adjustedMonthly;
      balance += adjustedMonthly;
      totalContributions += adjustedMonthly;
      yearDeposits += adjustedMonthly;
    }

    // Add annual contribution in December (month 12, 24, 36, etc.)
    if (isDecember && annualContribution > 0) {
      const adjustedAnnual = annualContribution * contributionMultiplier;
      monthlyDeposit += adjustedAnnual;
      balance += adjustedAnnual;
      totalContributions += adjustedAnnual;
      yearDeposits += adjustedAnnual;
    }

    // Create monthly schedule row
    const monthDate = new Date(startDate);
    monthDate.setMonth(startDate.getMonth() + month - 1);

    schedule.push({
      month,
      date: monthDate,
      deposit: monthlyDeposit,
      interest: netInterest,
      taxPaid: taxAmount,
      endingBalance: balance,
    });

    // If end of year, add to annual schedule
    if (isDecember || month === totalMonths) {
      // Include initial deposit in year 1 deposits
      const displayYearDeposits =
        currentYear === 1 ? initialDeposit + yearDeposits : yearDeposits;

      annualSchedule.push({
        year: currentYear,
        startingBalance: yearStartBalance,
        deposits: displayYearDeposits,
        interest: yearInterest,
        taxPaid: yearTaxPaid,
        endingBalance: balance,
      });

      // Reset for next year
      yearStartBalance = balance;
      yearDeposits = 0;
      yearInterest = 0;
      yearTaxPaid = 0;
      currentYear++;
    }
  }

  return {
    finalBalance: balance,
    initialDeposit,
    totalContributions,
    totalInterest,
    totalTaxPaid,
    schedule,
    annualSchedule,
  };
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

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get display label for compound frequency
 */
export function getCompoundFrequencyLabel(
  frequency: CompoundFrequency
): string {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Bi-weekly';
    case 'semimonthly':
      return 'Semi-monthly';
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'semiannually':
      return 'Semi-annually';
    case 'annually':
      return 'Annually';
    case 'continuous':
      return 'Continuously';
    default:
      return frequency;
  }
}
