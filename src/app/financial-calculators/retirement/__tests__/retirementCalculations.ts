/**
 * Retirement Calculator - Calculation Functions and Types
 *
 * This module provides comprehensive retirement planning calculations including:
 * - Future value of current savings and contributions
 * - Required retirement savings based on income needs
 * - Monthly/annual contribution requirements
 * - Safe withdrawal rates (4% rule)
 * - Social Security and other income integration
 * - Inflation adjustments
 * - Year-by-year projections
 * - Income gap analysis
 */

// ============================================================================
// Types
// ============================================================================

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  annualContribution: number;
  employerMatchPercentage: number;
  currentIncome: number;
  preRetirementReturn: number; // Annual return rate before retirement (%)
  postRetirementReturn: number; // Annual return rate after retirement (%)
  inflationRate: number; // Annual inflation rate (%)
  desiredAnnualIncome: number; // Desired annual income in retirement
  socialSecurityIncome: number; // Annual Social Security benefits
  otherIncome: number; // Other annual income (pensions, rental, etc.)
}

export interface RetirementResults {
  // Time calculations
  yearsToRetirement: number;
  yearsInRetirement: number;
  isRetired: boolean;

  // Savings projections
  futureValueOfCurrentSavings: number;
  futureValueOfContributions: number;
  totalAtRetirement: number;
  totalAnnualContribution: number;

  // Required amounts
  requiredSavingsAtRetirement: number;
  monthlyContributionNeeded: number;
  annualContributionNeeded: number;

  // Income analysis
  projectedAnnualIncome: number;
  withdrawalAmount: number;
  totalRetirementIncome: number;
  incomeGap: number;

  // Inflation adjustments
  inflationAdjustedIncome: number;
  inflationAdjustedExpenses: number;
  realPreRetirementReturn: number;
  realPostRetirementReturn: number;

  // Success metrics
  canRetireComfortably: boolean;
  shortfall: number;
  surplusOrShortfall: number;
  withdrawalRate: number;
  sustainableWithdrawalAmount: number;

  // Year-by-year projection
  yearByYearProjection: YearProjection[];

  // Summary statistics
  totalContributions: number;
  totalEmployerMatch: number;
  totalInterestEarned: number;
  percentageOfIncomeReplaced: number;
  savingsMultiple: number; // Multiple of annual expenses
}

export interface YearProjection {
  age: number;
  year: number;
  phase: 'accumulation' | 'retirement';
  balance: number;
  contribution: number;
  employerMatch: number;
  investmentReturn: number;
  withdrawal: number;
  socialSecurity: number;
  otherIncome: number;
  totalIncome: number;
  inflationAdjustedExpenses: number;
  surplus: number;
}

export interface RetirementIncome {
  withdrawalAmount: number;
  socialSecurity: number;
  otherIncome: number;
  totalAnnualIncome: number;
  totalMonthlyIncome: number;
}

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate future value with compound interest
 */
export function calculateFutureValue(
  presentValue: number,
  annualRate: number,
  years: number
): number {
  return presentValue * Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculate future value of annuity (regular contributions)
 */
export function calculateFutureValueOfAnnuity(
  payment: number,
  annualRate: number,
  years: number
): number {
  if (annualRate === 0) {
    return payment * years;
  }
  const r = annualRate / 100;
  return payment * ((Math.pow(1 + r, years) - 1) / r);
}

/**
 * Calculate present value of future income needs
 */
export function calculatePresentValue(
  futureValue: number,
  annualRate: number,
  years: number
): number {
  return futureValue / Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculate future value adjusted for inflation
 */
export function calculateFutureValueWithInflation(
  amount: number,
  years: number,
  inflationRate: number
): number {
  return amount * Math.pow(1 + inflationRate / 100, years);
}

/**
 * Calculate required savings based on withdrawal rate
 */
export function calculateRequiredSavings(
  desiredAnnualIncome: number,
  socialSecurityIncome: number,
  otherIncome: number,
  withdrawalRate: number
): number {
  const incomeGap = Math.max(
    0,
    desiredAnnualIncome - socialSecurityIncome - otherIncome
  );
  if (incomeGap === 0) return 0;
  return incomeGap / (withdrawalRate / 100);
}

/**
 * Calculate monthly contribution needed to reach target
 */
export function calculateMonthlyContribution(
  targetAmount: number,
  currentSavings: number,
  years: number,
  annualReturn: number,
  employerMatchPercentage: number
): number {
  // Calculate future value of current savings
  const futureValueOfCurrent = calculateFutureValue(
    currentSavings,
    annualReturn,
    years
  );

  // Amount still needed
  const amountNeeded = Math.max(0, targetAmount - futureValueOfCurrent);

  if (amountNeeded === 0) return 0;

  // Monthly rate
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return amountNeeded / months / (1 + employerMatchPercentage / 100);
  }

  // Calculate monthly payment needed
  const monthlyPayment =
    (amountNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);

  // Adjust for employer match
  return monthlyPayment / (1 + employerMatchPercentage / 100);
}

/**
 * Calculate safe withdrawal amount using the 4% rule or custom rate
 */
export function calculateSafeWithdrawalAmount(
  totalSavings: number,
  withdrawalRate: number = 4
): number {
  return totalSavings * (withdrawalRate / 100);
}

/**
 * Calculate total retirement income from all sources
 */
export function calculateRetirementIncome(
  totalSavings: number,
  withdrawalRate: number,
  socialSecurityIncome: number,
  otherIncome: number
): RetirementIncome {
  const withdrawalAmount = calculateSafeWithdrawalAmount(
    totalSavings,
    withdrawalRate
  );
  const totalAnnualIncome =
    withdrawalAmount + socialSecurityIncome + otherIncome;

  return {
    withdrawalAmount,
    socialSecurity: socialSecurityIncome,
    otherIncome,
    totalAnnualIncome,
    totalMonthlyIncome: totalAnnualIncome / 12,
  };
}

/**
 * Project retirement savings year by year
 */
export function projectYearByYear(inputs: RetirementInputs): YearProjection[] {
  const projections: YearProjection[] = [];
  let balance = inputs.currentSavings;
  const currentYear = new Date().getFullYear();

  const totalYears = inputs.lifeExpectancy - inputs.currentAge;

  for (let i = 0; i < totalYears; i++) {
    const age = inputs.currentAge + i + 1;
    const year = currentYear + i + 1;
    const isRetired = age > inputs.retirementAge;

    let contribution = 0;
    let employerMatch = 0;
    let withdrawal = 0;
    let socialSecurity = 0;
    let otherIncome = 0;
    let investmentReturn = 0;

    if (!isRetired) {
      // Accumulation phase
      contribution = inputs.annualContribution;
      employerMatch = contribution * (inputs.employerMatchPercentage / 100);

      // Investment return on beginning balance
      investmentReturn = balance * (inputs.preRetirementReturn / 100);

      // Update balance
      balance = balance + contribution + employerMatch + investmentReturn;
    } else {
      // Retirement phase
      // Calculate inflation-adjusted expenses
      const yearsIntoRetirement = age - inputs.retirementAge;
      const inflationAdjustedExpenses = calculateFutureValueWithInflation(
        inputs.desiredAnnualIncome,
        yearsIntoRetirement,
        inputs.inflationRate
      );

      // Income sources
      socialSecurity = inputs.socialSecurityIncome;
      otherIncome = inputs.otherIncome;

      // Calculate withdrawal needed
      withdrawal = Math.max(
        0,
        inflationAdjustedExpenses - socialSecurity - otherIncome
      );

      // Investment return on remaining balance
      investmentReturn = balance * (inputs.postRetirementReturn / 100);

      // Update balance
      balance = Math.max(0, balance + investmentReturn - withdrawal);
    }

    const totalIncome = withdrawal + socialSecurity + otherIncome;
    const inflationAdjustedExpenses = isRetired
      ? calculateFutureValueWithInflation(
          inputs.desiredAnnualIncome,
          age - inputs.retirementAge,
          inputs.inflationRate
        )
      : 0;

    projections.push({
      age,
      year,
      phase: isRetired ? 'retirement' : 'accumulation',
      balance: Math.round(balance),
      contribution,
      employerMatch,
      investmentReturn: Math.round(investmentReturn),
      withdrawal,
      socialSecurity,
      otherIncome,
      totalIncome,
      inflationAdjustedExpenses,
      surplus: totalIncome - inflationAdjustedExpenses,
    });
  }

  return projections;
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate complete retirement planning results
 */
export function calculateRetirementResults(
  inputs: RetirementInputs
): RetirementResults {
  // Time calculations
  const yearsToRetirement = Math.max(
    0,
    inputs.retirementAge - inputs.currentAge
  );
  const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
  const isRetired = inputs.currentAge >= inputs.retirementAge;

  // Real returns (adjusted for inflation)
  const realPreRetirementReturn =
    inputs.preRetirementReturn - inputs.inflationRate;
  const realPostRetirementReturn =
    inputs.postRetirementReturn - inputs.inflationRate;

  // Calculate future value of current savings
  const futureValueOfCurrentSavings = isRetired
    ? inputs.currentSavings
    : calculateFutureValue(
        inputs.currentSavings,
        inputs.preRetirementReturn,
        yearsToRetirement
      );

  // Calculate total annual contribution including employer match
  const totalAnnualContribution =
    inputs.annualContribution * (1 + inputs.employerMatchPercentage / 100);

  // Calculate future value of contributions
  const futureValueOfContributions = isRetired
    ? 0
    : calculateFutureValueOfAnnuity(
        totalAnnualContribution,
        inputs.preRetirementReturn,
        yearsToRetirement
      );

  // Total at retirement
  const totalAtRetirement =
    futureValueOfCurrentSavings + futureValueOfContributions;

  // Calculate inflation-adjusted income needs
  const inflationAdjustedIncome = calculateFutureValueWithInflation(
    inputs.desiredAnnualIncome,
    yearsToRetirement,
    inputs.inflationRate
  );

  const inflationAdjustedExpenses = inflationAdjustedIncome;

  // Calculate required savings using 4% rule
  const withdrawalRate = 4;
  const requiredSavingsAtRetirement = calculateRequiredSavings(
    inflationAdjustedIncome,
    inputs.socialSecurityIncome,
    inputs.otherIncome,
    withdrawalRate
  );

  // Calculate monthly contribution needed
  const monthlyContributionNeeded = calculateMonthlyContribution(
    requiredSavingsAtRetirement,
    inputs.currentSavings,
    yearsToRetirement,
    inputs.preRetirementReturn,
    inputs.employerMatchPercentage
  );

  const annualContributionNeeded = monthlyContributionNeeded * 12;

  // Calculate retirement income
  const retirementIncome = calculateRetirementIncome(
    totalAtRetirement,
    withdrawalRate,
    inputs.socialSecurityIncome,
    inputs.otherIncome
  );

  // Income gap analysis
  const incomeGap = Math.max(
    0,
    inflationAdjustedIncome - retirementIncome.totalAnnualIncome
  );
  const surplusOrShortfall = totalAtRetirement - requiredSavingsAtRetirement;
  const shortfall = Math.max(0, -surplusOrShortfall);

  // Success metrics
  const canRetireComfortably = totalAtRetirement >= requiredSavingsAtRetirement;
  const sustainableWithdrawalAmount = calculateSafeWithdrawalAmount(
    totalAtRetirement,
    withdrawalRate
  );
  const percentageOfIncomeReplaced =
    inputs.currentIncome > 0
      ? (retirementIncome.totalAnnualIncome / inputs.currentIncome) * 100
      : 0;

  const savingsMultiple =
    inputs.desiredAnnualIncome > 0
      ? totalAtRetirement / inputs.desiredAnnualIncome
      : 0;

  // Calculate totals
  const totalContributions =
    inputs.currentSavings + inputs.annualContribution * yearsToRetirement;
  const totalEmployerMatch =
    inputs.annualContribution *
    (inputs.employerMatchPercentage / 100) *
    yearsToRetirement;
  const totalInterestEarned =
    totalAtRetirement - totalContributions - totalEmployerMatch;

  // Year-by-year projection
  const yearByYearProjection = projectYearByYear(inputs);

  return {
    // Time calculations
    yearsToRetirement,
    yearsInRetirement,
    isRetired,

    // Savings projections
    futureValueOfCurrentSavings,
    futureValueOfContributions,
    totalAtRetirement,
    totalAnnualContribution,

    // Required amounts
    requiredSavingsAtRetirement,
    monthlyContributionNeeded,
    annualContributionNeeded,

    // Income analysis
    projectedAnnualIncome: retirementIncome.totalAnnualIncome,
    withdrawalAmount: retirementIncome.withdrawalAmount,
    totalRetirementIncome: retirementIncome.totalAnnualIncome,
    incomeGap,

    // Inflation adjustments
    inflationAdjustedIncome,
    inflationAdjustedExpenses,
    realPreRetirementReturn,
    realPostRetirementReturn,

    // Success metrics
    canRetireComfortably,
    shortfall,
    surplusOrShortfall,
    withdrawalRate,
    sustainableWithdrawalAmount,

    // Year-by-year projection
    yearByYearProjection,

    // Summary statistics
    totalContributions,
    totalEmployerMatch,
    totalInterestEarned,
    percentageOfIncomeReplaced,
    savingsMultiple,
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate retirement calculator inputs
 */
export function validateRetirementInputs(inputs: RetirementInputs): string[] {
  const errors: string[] = [];

  // Age validations
  if (inputs.currentAge < 0 || inputs.currentAge > 120) {
    errors.push('Current age must be between 0 and 120');
  }

  if (inputs.retirementAge < inputs.currentAge - 1) {
    // Allow for already retired scenarios
    if (inputs.currentAge - inputs.retirementAge > 30) {
      errors.push('Invalid retirement age for current age');
    }
  }

  if (inputs.retirementAge > inputs.lifeExpectancy) {
    errors.push('Retirement age cannot be greater than life expectancy');
  }

  if (inputs.lifeExpectancy < inputs.currentAge) {
    errors.push('Life expectancy must be greater than current age');
  }

  if (inputs.lifeExpectancy > 120) {
    errors.push('Life expectancy cannot exceed 120 years');
  }

  // Financial validations
  if (inputs.currentSavings < 0) {
    errors.push('Current savings cannot be negative');
  }

  if (inputs.annualContribution < 0) {
    errors.push('Annual contribution cannot be negative');
  }

  if (inputs.employerMatchPercentage < 0) {
    errors.push('Employer match percentage cannot be negative');
  }

  if (inputs.employerMatchPercentage > 100) {
    errors.push('Employer match percentage over 100% is unusual');
  }

  if (inputs.currentIncome < 0) {
    errors.push('Current income cannot be negative');
  }

  // Return rate validations
  if (inputs.preRetirementReturn < -20 || inputs.preRetirementReturn > 30) {
    errors.push('Pre-retirement return rate should be between -20% and 30%');
  }

  if (inputs.postRetirementReturn < -20 || inputs.postRetirementReturn > 30) {
    errors.push('Post-retirement return rate should be between -20% and 30%');
  }

  if (inputs.inflationRate < -5 || inputs.inflationRate > 20) {
    errors.push('Inflation rate should be between -5% and 20%');
  }

  // Income validations
  if (inputs.desiredAnnualIncome < 0) {
    errors.push('Desired annual income cannot be negative');
  }

  if (inputs.socialSecurityIncome < 0) {
    errors.push('Social Security income cannot be negative');
  }

  if (inputs.otherIncome < 0) {
    errors.push('Other income cannot be negative');
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
