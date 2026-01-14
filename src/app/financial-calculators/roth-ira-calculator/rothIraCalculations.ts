// Roth IRA Calculator Logic

export interface RothIraInputs {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualContribution: number;
  maximizeContributions: boolean;
  expectedReturn: number;
  marginalTaxRate: number;
}

export interface YearByYearProjection {
  age: number;
  year: number;
  annualContribution: number;
  rothBalance: number;
  rothInterest: number;
  taxableBalance: number;
  taxableInterest: number;
  taxableAnnualTax: number;
  rothCumulativePrincipal: number;
  taxableCumulativePrincipal: number;
}

export interface RothIraResults {
  yearsToRetirement: number;
  rothIraBalance: number;
  taxableAccountBalance: number;
  totalPrincipal: number;
  rothIraInterest: number;
  taxableAccountInterest: number;
  rothIraTotalTax: number;
  taxableAccountTotalTax: number;
  difference: number;
  yearByYearProjection: YearByYearProjection[];
  effectiveTaxSavings: number;
  percentageAdvantage: number;
}

// 2025 IRS Contribution Limits
export const IRS_LIMITS_2025 = {
  CONTRIBUTION_LIMIT_UNDER_50: 7000,
  CONTRIBUTION_LIMIT_50_PLUS: 8000,
  CATCH_UP_CONTRIBUTION: 1000,
  // Income limits for Roth IRA eligibility (phase-out begins)
  SINGLE_INCOME_LIMIT: 153000,
  MARRIED_INCOME_LIMIT: 230000,
  // Income limits for phase-out complete
  SINGLE_INCOME_LIMIT_MAX: 168000,
  MARRIED_INCOME_LIMIT_MAX: 240000,
};

export function validateRothIraInputs(inputs: RothIraInputs): string[] {
  const errors: string[] = [];

  // Age validations
  if (inputs.currentAge < 18 || inputs.currentAge > 100) {
    errors.push('Current age must be between 18 and 100');
  }
  if (inputs.retirementAge < 50 || inputs.retirementAge > 100) {
    errors.push('Retirement age must be between 50 and 100');
  }
  if (inputs.currentAge >= inputs.retirementAge) {
    errors.push('Current age must be less than retirement age');
  }

  // Balance and contribution validations
  if (inputs.currentBalance < 0) {
    errors.push('Current balance cannot be negative');
  }
  if (inputs.annualContribution < 0) {
    errors.push('Annual contribution cannot be negative');
  }

  // Check contribution limits if not maximizing
  if (!inputs.maximizeContributions && inputs.annualContribution > 0) {
    const limit =
      inputs.currentAge >= 50
        ? IRS_LIMITS_2025.CONTRIBUTION_LIMIT_50_PLUS
        : IRS_LIMITS_2025.CONTRIBUTION_LIMIT_UNDER_50;

    if (inputs.annualContribution > limit) {
      errors.push(
        `Annual contribution exceeds 2025 IRS limit of ${formatCurrency(limit)}`
      );
    }
  }

  // Return and tax rate validations
  if (inputs.expectedReturn < 0) {
    errors.push('Expected return cannot be negative');
  }
  if (inputs.expectedReturn > 50) {
    errors.push('Expected return seems unrealistic (over 50%)');
  }
  if (inputs.marginalTaxRate < 0) {
    errors.push('Tax rate cannot be negative');
  }
  if (inputs.marginalTaxRate > 50) {
    errors.push('Tax rate cannot exceed 50%');
  }

  return errors;
}

export function calculateRothIraResults(inputs: RothIraInputs): RothIraResults {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const returnRate = inputs.expectedReturn / 100;
  const taxRate = inputs.marginalTaxRate / 100;

  let rothBalance = inputs.currentBalance;
  let taxableBalance = inputs.currentBalance;
  let totalPrincipal = inputs.currentBalance;
  let rothInterestTotal = 0;
  let taxableInterestTotal = 0;
  let taxableTotalTax = 0;

  const yearByYearProjection: YearByYearProjection[] = [];
  const currentYear = new Date().getFullYear();

  for (let year = 0; year <= yearsToRetirement; year++) {
    const age = inputs.currentAge + year;

    // Determine annual contribution
    let annualContribution = 0;
    if (year > 0) {
      annualContribution = inputs.annualContribution;
      if (inputs.maximizeContributions) {
        annualContribution =
          age >= 50
            ? IRS_LIMITS_2025.CONTRIBUTION_LIMIT_50_PLUS
            : IRS_LIMITS_2025.CONTRIBUTION_LIMIT_UNDER_50;
      }
    }

    // Calculate interest for the year on beginning balance
    const rothInterest = rothBalance * returnRate;
    const taxableInterest = taxableBalance * returnRate;

    // Apply interest
    rothBalance += rothInterest;
    rothInterestTotal += rothInterest;

    // For taxable account, apply tax on gains annually
    const taxableGainAfterTax = taxableInterest * (1 - taxRate);
    const taxOnGain = taxableInterest * taxRate;
    taxableBalance += taxableGainAfterTax;
    taxableInterestTotal += taxableGainAfterTax;
    taxableTotalTax += taxOnGain;

    // Add contribution at end of year (after interest calculation)
    if (year > 0) {
      rothBalance += annualContribution;
      taxableBalance += annualContribution;
      totalPrincipal += annualContribution;
    }

    // Record year projection
    yearByYearProjection.push({
      age,
      year: currentYear + year,
      annualContribution,
      rothBalance: Math.round(rothBalance),
      rothInterest: Math.round(rothInterest),
      taxableBalance: Math.round(taxableBalance),
      taxableInterest: Math.round(taxableInterest),
      taxableAnnualTax: Math.round(taxOnGain),
      rothCumulativePrincipal: totalPrincipal,
      taxableCumulativePrincipal: totalPrincipal,
    });
  }

  const difference = rothBalance - taxableBalance;
  const effectiveTaxSavings = taxableTotalTax;
  const percentageAdvantage =
    taxableBalance > 0
      ? ((rothBalance - taxableBalance) / taxableBalance) * 100
      : 0;

  return {
    yearsToRetirement,
    rothIraBalance: Math.round(rothBalance),
    taxableAccountBalance: Math.round(taxableBalance),
    totalPrincipal,
    rothIraInterest: Math.round(rothInterestTotal),
    taxableAccountInterest: Math.round(taxableInterestTotal),
    rothIraTotalTax: 0,
    taxableAccountTotalTax: Math.round(taxableTotalTax),
    difference: Math.round(difference),
    yearByYearProjection,
    effectiveTaxSavings: Math.round(effectiveTaxSavings),
    percentageAdvantage,
  };
}

// Utility functions
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.round(absValue).toLocaleString('en-US')}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

export function formatYears(years: number): string {
  if (years === 1) return '1 year';
  return `${years} years`;
}
