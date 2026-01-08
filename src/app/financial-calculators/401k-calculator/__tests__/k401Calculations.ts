/**
 * 401(k) Calculator - Calculation Functions and Types
 *
 * Based on reference: https://www.calculator.net/401k-calculator.html
 *
 * This module provides comprehensive 401(k) retirement planning calculations including:
 * - Future value of current 401(k) balance with compound growth
 * - Employee and employer contribution calculations with IRS limits
 * - Two-tier employer matching (match on different contribution levels)
 * - Salary increases over time
 * - Inflation-adjusted projections
 * - Safe withdrawal rates in retirement
 * - Year-by-year balance projections
 * - Tax-deferred growth calculations
 */

// ============================================================================
// Constants - 2026 IRS Limits
// ============================================================================

export const IRS_LIMITS_2026 = {
  // Employee contribution limits
  EMPLOYEE_CONTRIBUTION_UNDER_50: 24500,
  EMPLOYEE_CONTRIBUTION_50_PLUS: 31000, // Includes $6,500 catch-up

  // Total contribution limits (employee + employer)
  TOTAL_CONTRIBUTION_LIMIT: 72000,
  TOTAL_CONTRIBUTION_LIMIT_50_PLUS: 79500, // Includes catch-up

  // Highly compensated employee threshold
  HCE_THRESHOLD: 155000,
};

// ============================================================================
// Types
// ============================================================================

export interface K401Inputs {
  // Current Info
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentAnnualSalary: number;
  current401kBalance: number;

  // Contributions (as percentage of salary)
  employeeContributionPercent: number; // % of salary

  // Employer Match - Tier 1
  employerMatch1Percent: number; // e.g., 100% means dollar-for-dollar
  employerMatch1Limit: number; // % of salary up to which match applies

  // Employer Match - Tier 2 (optional)
  employerMatch2Percent: number; // e.g., 50% means $0.50 per dollar
  employerMatch2Limit: number; // % of salary up to which tier 2 applies

  // Projections
  expectedSalaryIncrease: number; // Annual % increase
  expectedAnnualReturn: number; // Annual investment return %
  expectedInflation: number; // Annual inflation %
}

export interface K401Results {
  // Time calculations
  yearsToRetirement: number;
  yearsInRetirement: number;

  // Balance projections
  current401kBalance: number;
  projectedBalanceAtRetirement: number;
  inflationAdjustedBalance: number; // In today's dollars

  // Contribution analysis
  firstYearEmployeeContribution: number;
  firstYearEmployerContribution: number;
  firstYearTotalContribution: number;

  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  totalContributions: number;
  totalInvestmentGrowth: number;

  // Annual projections for first and last year
  finalYearSalary: number;
  finalYearEmployeeContribution: number;
  finalYearEmployerContribution: number;

  // Withdrawal projections
  safeWithdrawalRate: number; // Default 4%
  firstYearWithdrawal: number;
  monthlyWithdrawal: number;

  // Success metrics
  replacementRatio: number; // % of final salary replaced
  savingsMultiple: number; // Multiple of final salary

  // Year-by-year projections
  yearByYearProjection: YearProjection[];

  // Contribution limits hit
  contributionLimitsInfo: ContributionLimitsInfo[];
}

export interface YearProjection {
  year: number;
  age: number;
  salary: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  investmentReturn: number;
  balance: number;
  balanceInTodaysDollars: number; // Inflation-adjusted
  contributionHitLimit: boolean;
}

export interface ContributionLimitsInfo {
  year: number;
  age: number;
  employeeContribution: number;
  contributionLimit: number;
  hitLimit: boolean;
  limitType: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the employee contribution limit based on age
 */
export function getEmployeeContributionLimit(age: number): number {
  return age >= 50
    ? IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS
    : IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50;
}

/**
 * Get the total contribution limit (employee + employer) based on age
 * This is used internally and for testing IRS compliance
 */
function getTotalContributionLimit(age: number): number {
  return age >= 50
    ? IRS_LIMITS_2026.TOTAL_CONTRIBUTION_LIMIT_50_PLUS
    : IRS_LIMITS_2026.TOTAL_CONTRIBUTION_LIMIT;
}

/**
 * Calculate employee contribution for a given salary and percentage
 * Returns the lesser of: (salary * percentage) or IRS limit
 */
export function calculateEmployeeContribution(
  salary: number,
  contributionPercent: number,
  age: number
): number {
  const desiredContribution = salary * (contributionPercent / 100);
  const limit = getEmployeeContributionLimit(age);
  return Math.min(desiredContribution, limit);
}

/**
 * Calculate employer match with two-tier matching
 * Tier 1: Match up to first threshold (e.g., 100% match on first 3% of salary)
 * Tier 2: Match up to second threshold (e.g., 50% match on next 2% of salary)
 */
export function calculateEmployerMatch(
  salary: number,
  employeeContributionDollars: number,
  match1Percent: number,
  match1Limit: number,
  match2Percent: number,
  match2Limit: number
): number {
  // Calculate employee contribution as percentage of salary
  const employeeContributionPercent =
    (employeeContributionDollars / salary) * 100;

  let employerMatch = 0;

  // Tier 1 matching
  if (match1Limit > 0 && match1Percent > 0) {
    const tier1ContributionPercent = Math.min(
      employeeContributionPercent,
      match1Limit
    );
    employerMatch +=
      salary * (tier1ContributionPercent / 100) * (match1Percent / 100);
  }

  // Tier 2 matching (only if employee contributes beyond tier 1)
  if (
    match2Limit > match1Limit &&
    match2Percent > 0 &&
    employeeContributionPercent > match1Limit
  ) {
    const tier2ContributionPercent = Math.min(
      employeeContributionPercent - match1Limit,
      match2Limit - match1Limit
    );
    employerMatch +=
      salary * (tier2ContributionPercent / 100) * (match2Percent / 100);
  }

  return employerMatch;
}

/**
 * Calculate future value with compound growth
 */
export function calculateFutureValue(
  presentValue: number,
  annualRate: number,
  years: number
): number {
  if (years === 0) return presentValue;
  return presentValue * Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculate present value (inflation-adjusted value in today's dollars)
 */
export function calculatePresentValue(
  futureValue: number,
  inflationRate: number,
  years: number
): number {
  if (years === 0) return futureValue;
  return futureValue / Math.pow(1 + inflationRate / 100, years);
}

/**
 * Calculate safe withdrawal amount using 4% rule
 */
export function calculateSafeWithdrawal(
  totalBalance: number,
  withdrawalRate: number = 4
): number {
  return totalBalance * (withdrawalRate / 100);
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate complete 401(k) planning results
 *
 * This implements the calculation methodology from calculator.net:
 * 1. Project salary growth over time
 * 2. Calculate employee contributions (capped at IRS limits)
 * 3. Calculate employer match (two-tier matching supported)
 * 4. Apply investment returns on accumulated balance
 * 5. Track year-by-year growth
 * 6. Calculate retirement withdrawal projections
 */
export function calculate401kResults(inputs: K401Inputs): K401Results {
  const yearsToRetirement = Math.max(
    0,
    inputs.retirementAge - inputs.currentAge
  );
  const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;

  // Initialize tracking variables
  let balance = inputs.current401kBalance;
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;
  const yearByYearProjection: YearProjection[] = [];
  const contributionLimitsInfo: ContributionLimitsInfo[] = [];

  let currentSalary = inputs.currentAnnualSalary;
  let firstYearEmployeeContribution = 0;
  let firstYearEmployerContribution = 0;
  let finalYearSalary = inputs.currentAnnualSalary;
  let finalYearEmployeeContribution = 0;
  let finalYearEmployerContribution = 0;

  // Project year by year until retirement
  for (let year = 0; year < yearsToRetirement; year++) {
    const age = inputs.currentAge + year;

    // Calculate contributions for this year
    const employeeContribution = calculateEmployeeContribution(
      currentSalary,
      inputs.employeeContributionPercent,
      age
    );

    const employerContribution = calculateEmployerMatch(
      currentSalary,
      employeeContribution,
      inputs.employerMatch1Percent,
      inputs.employerMatch1Limit,
      inputs.employerMatch2Percent,
      inputs.employerMatch2Limit
    );

    const totalContribution = employeeContribution + employerContribution;

    // Check contribution limits
    const employeeLimit = getEmployeeContributionLimit(age);
    const totalLimit = getTotalContributionLimit(age);
    const desiredEmployeeContribution =
      currentSalary * (inputs.employeeContributionPercent / 100);
    const hitLimit =
      desiredEmployeeContribution > employeeLimit ||
      totalContribution > totalLimit;

    // Store first year contributions
    if (year === 0) {
      firstYearEmployeeContribution = employeeContribution;
      firstYearEmployerContribution = employerContribution;
    }

    // Store final year info
    if (year === yearsToRetirement - 1) {
      finalYearSalary = currentSalary;
      finalYearEmployeeContribution = employeeContribution;
      finalYearEmployerContribution = employerContribution;
    }

    // Apply investment return on beginning balance
    const investmentReturn = balance * (inputs.expectedAnnualReturn / 100);

    // Update balance
    balance = balance + investmentReturn + totalContribution;

    // Track totals
    totalEmployeeContributions += employeeContribution;
    totalEmployerContributions += employerContribution;

    // Calculate inflation-adjusted balance
    const balanceInTodaysDollars = calculatePresentValue(
      balance,
      inputs.expectedInflation,
      year + 1
    );

    // Store year projection
    yearByYearProjection.push({
      year: year + 1,
      age: age,
      salary: currentSalary,
      employeeContribution,
      employerContribution,
      totalContribution,
      investmentReturn,
      balance,
      balanceInTodaysDollars,
      contributionHitLimit: hitLimit,
    });

    // Store contribution limit info
    contributionLimitsInfo.push({
      year: year + 1,
      age: age,
      employeeContribution,
      contributionLimit: employeeLimit,
      hitLimit: desiredEmployeeContribution > employeeLimit,
      limitType: age >= 50 ? 'with catch-up' : 'standard',
    });

    // Increase salary for next year
    currentSalary = currentSalary * (1 + inputs.expectedSalaryIncrease / 100);
  }

  const projectedBalanceAtRetirement = balance;
  const inflationAdjustedBalance = calculatePresentValue(
    projectedBalanceAtRetirement,
    inputs.expectedInflation,
    yearsToRetirement
  );

  // Calculate total contributions and growth
  const totalContributions =
    totalEmployeeContributions + totalEmployerContributions;
  const totalInvestmentGrowth =
    projectedBalanceAtRetirement -
    inputs.current401kBalance -
    totalContributions;

  // Calculate withdrawal projections (4% rule)
  const safeWithdrawalRate = 4;
  const firstYearWithdrawal = calculateSafeWithdrawal(
    projectedBalanceAtRetirement,
    safeWithdrawalRate
  );
  const monthlyWithdrawal = firstYearWithdrawal / 12;

  // Calculate success metrics
  const replacementRatio =
    finalYearSalary > 0 ? (firstYearWithdrawal / finalYearSalary) * 100 : 0;
  const savingsMultiple =
    finalYearSalary > 0 ? projectedBalanceAtRetirement / finalYearSalary : 0;

  return {
    // Time calculations
    yearsToRetirement,
    yearsInRetirement,

    // Balance projections
    current401kBalance: inputs.current401kBalance,
    projectedBalanceAtRetirement,
    inflationAdjustedBalance,

    // Contribution analysis
    firstYearEmployeeContribution,
    firstYearEmployerContribution,
    firstYearTotalContribution:
      firstYearEmployeeContribution + firstYearEmployerContribution,

    totalEmployeeContributions,
    totalEmployerContributions,
    totalContributions,
    totalInvestmentGrowth,

    // Annual projections
    finalYearSalary,
    finalYearEmployeeContribution,
    finalYearEmployerContribution,

    // Withdrawal projections
    safeWithdrawalRate,
    firstYearWithdrawal,
    monthlyWithdrawal,

    // Success metrics
    replacementRatio,
    savingsMultiple,

    // Year-by-year projections
    yearByYearProjection,
    contributionLimitsInfo,
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate 401(k) calculator inputs
 */
export function validate401kInputs(inputs: K401Inputs): string[] {
  const errors: string[] = [];

  // Age validations
  if (inputs.currentAge < 18 || inputs.currentAge > 120) {
    errors.push('Current age must be between 18 and 120');
  }

  if (inputs.retirementAge < inputs.currentAge) {
    errors.push('Retirement age must be greater than current age');
  }

  if (inputs.retirementAge < 50 || inputs.retirementAge > 80) {
    errors.push('Retirement age should be between 50 and 80');
  }

  if (inputs.lifeExpectancy <= inputs.retirementAge) {
    errors.push('Life expectancy must be greater than retirement age');
  }

  if (inputs.lifeExpectancy > 120) {
    errors.push('Life expectancy cannot exceed 120 years');
  }

  // Financial validations
  if (inputs.currentAnnualSalary < 0) {
    errors.push('Current annual salary cannot be negative');
  }

  if (inputs.current401kBalance < 0) {
    errors.push('Current 401(k) balance cannot be negative');
  }

  // Contribution validations
  if (
    inputs.employeeContributionPercent < 0 ||
    inputs.employeeContributionPercent > 100
  ) {
    errors.push('Employee contribution must be between 0% and 100%');
  }

  if (inputs.employerMatch1Percent < 0 || inputs.employerMatch1Percent > 200) {
    errors.push('Employer match 1 must be between 0% and 200%');
  }

  if (inputs.employerMatch1Limit < 0 || inputs.employerMatch1Limit > 100) {
    errors.push('Employer match 1 limit must be between 0% and 100%');
  }

  if (inputs.employerMatch2Percent < 0 || inputs.employerMatch2Percent > 200) {
    errors.push('Employer match 2 must be between 0% and 200%');
  }

  if (inputs.employerMatch2Limit < 0 || inputs.employerMatch2Limit > 100) {
    errors.push('Employer match 2 limit must be between 0% and 100%');
  }

  if (
    inputs.employerMatch2Limit > 0 &&
    inputs.employerMatch2Limit <= inputs.employerMatch1Limit
  ) {
    errors.push('Employer match 2 limit must be greater than match 1 limit');
  }

  // Return rate validations
  if (
    inputs.expectedSalaryIncrease < -10 ||
    inputs.expectedSalaryIncrease > 20
  ) {
    errors.push('Expected salary increase should be between -10% and 20%');
  }

  if (inputs.expectedAnnualReturn < -20 || inputs.expectedAnnualReturn > 30) {
    errors.push('Expected annual return should be between -20% and 30%');
  }

  if (inputs.expectedInflation < -5 || inputs.expectedInflation > 20) {
    errors.push('Expected inflation should be between -5% and 20%');
  }

  return errors;
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format currency value
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
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format years as a readable string
 */
export function formatYears(years: number): string {
  if (years === 0) return 'Now';
  if (years === 1) return '1 year';
  return `${years} years`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
