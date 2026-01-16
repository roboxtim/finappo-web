// College Cost Calculator Types
export type CollegeType =
  | 'custom'
  | 'private-4year'
  | 'public-instate-4year'
  | 'public-outstate-4year'
  | 'public-2year';

export interface CollegeInputs {
  annualCost: number;
  costIncreaseRate: number;
  attendanceDuration: number;
  percentFromSavings: number;
  currentSavings: number;
  returnRate: number;
  taxRate: number;
  yearsUntilCollege: number;
}

export interface CollegeResults {
  totalCollegeCost: number;
  futureValueOfSavings: number;
  additionalSavingsNeeded: number;
  monthlySavingsRequired: number;
  percentCoveredBySavings: number;
  yearByYearCosts: YearCost[];
}

export interface YearCost {
  year: number;
  annualCost: number;
  cumulativeCost: number;
}

// Preset college costs (2024 averages)
export const COLLEGE_PRESETS: Record<CollegeType, number> = {
  custom: 0,
  'private-4year': 65470,
  'public-instate-4year': 30990,
  'public-outstate-4year': 50920,
  'public-2year': 21320,
};

/**
 * Calculate future value of current savings
 */
export function calculateFutureValueOfSavings(
  currentSavings: number,
  returnRate: number,
  taxRate: number,
  years: number
): number {
  // After-tax return rate
  const afterTaxRate = (returnRate * (1 - taxRate / 100)) / 100;

  // Future value with compound interest
  const futureValue = currentSavings * Math.pow(1 + afterTaxRate, years);

  return futureValue;
}

/**
 * Calculate total college costs with inflation
 */
export function calculateTotalCollegeCost(
  currentAnnualCost: number,
  inflationRate: number,
  yearsUntilStart: number,
  duration: number
): { total: number; yearByYear: YearCost[] } {
  const yearByYear: YearCost[] = [];
  let cumulativeCost = 0;

  for (let year = 0; year < duration; year++) {
    // Years from now when this cost is incurred
    const yearsFromNow = yearsUntilStart + year;

    // Cost for this year with inflation
    const annualCost =
      currentAnnualCost * Math.pow(1 + inflationRate / 100, yearsFromNow);

    cumulativeCost += annualCost;

    yearByYear.push({
      year: year + 1,
      annualCost,
      cumulativeCost,
    });
  }

  return {
    total: cumulativeCost,
    yearByYear,
  };
}

/**
 * Calculate required monthly savings
 */
export function calculateMonthlySavings(
  targetAmount: number,
  currentSavings: number,
  returnRate: number,
  taxRate: number,
  yearsToSave: number
): number {
  if (yearsToSave <= 0) return 0;

  // After-tax return rate
  const afterTaxRate = (returnRate * (1 - taxRate / 100)) / 100;
  const monthlyRate = afterTaxRate / 12;
  const months = yearsToSave * 12;

  // Future value of current savings
  const futureValueCurrent =
    currentSavings * Math.pow(1 + afterTaxRate, yearsToSave);

  // Amount still needed
  const amountNeeded = targetAmount - futureValueCurrent;

  if (amountNeeded <= 0) return 0;

  // Calculate monthly payment using future value of annuity formula
  if (monthlyRate === 0) {
    return amountNeeded / months;
  }

  const monthlyPayment =
    (amountNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);

  return monthlyPayment;
}

/**
 * Main calculation function
 */
export function calculateCollegeCost(inputs: CollegeInputs): CollegeResults {
  const {
    annualCost,
    costIncreaseRate,
    attendanceDuration,
    percentFromSavings,
    currentSavings,
    returnRate,
    taxRate,
    yearsUntilCollege,
  } = inputs;

  // Calculate total college costs
  const { total: totalCollegeCost, yearByYear } = calculateTotalCollegeCost(
    annualCost,
    costIncreaseRate,
    yearsUntilCollege,
    attendanceDuration
  );

  // Calculate future value of current savings
  const futureValueOfSavings = calculateFutureValueOfSavings(
    currentSavings,
    returnRate,
    taxRate,
    yearsUntilCollege
  );

  // Calculate amount needed from savings
  const amountFromSavings = totalCollegeCost * (percentFromSavings / 100);

  // Additional savings needed
  const additionalSavingsNeeded = Math.max(
    0,
    amountFromSavings - futureValueOfSavings
  );

  // Monthly savings required
  const monthlySavingsRequired = calculateMonthlySavings(
    amountFromSavings,
    currentSavings,
    returnRate,
    taxRate,
    yearsUntilCollege
  );

  // Percent covered by savings
  const percentCoveredBySavings =
    totalCollegeCost > 0 ? (futureValueOfSavings / totalCollegeCost) * 100 : 0;

  return {
    totalCollegeCost,
    futureValueOfSavings,
    additionalSavingsNeeded,
    monthlySavingsRequired,
    percentCoveredBySavings,
    yearByYearCosts: yearByYear,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: CollegeInputs): string[] {
  const errors: string[] = [];

  if (inputs.annualCost < 0) {
    errors.push('Annual cost cannot be negative');
  }

  if (inputs.costIncreaseRate < 0 || inputs.costIncreaseRate > 100) {
    errors.push('Cost increase rate must be between 0 and 100');
  }

  if (inputs.attendanceDuration < 1 || inputs.attendanceDuration > 10) {
    errors.push('Attendance duration must be between 1 and 10 years');
  }

  if (inputs.percentFromSavings < 0 || inputs.percentFromSavings > 100) {
    errors.push('Percent from savings must be between 0 and 100');
  }

  if (inputs.currentSavings < 0) {
    errors.push('Current savings cannot be negative');
  }

  if (inputs.returnRate < 0 || inputs.returnRate > 100) {
    errors.push('Return rate must be between 0 and 100');
  }

  if (inputs.taxRate < 0 || inputs.taxRate > 100) {
    errors.push('Tax rate must be between 0 and 100');
  }

  if (inputs.yearsUntilCollege < 0 || inputs.yearsUntilCollege > 30) {
    errors.push('Years until college must be between 0 and 30');
  }

  return errors;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get college type display name
 */
export function getCollegeTypeName(type: CollegeType): string {
  const names: Record<CollegeType, string> = {
    custom: 'Custom',
    'private-4year': '4-Year Private College',
    'public-instate-4year': '4-Year Public (In-State)',
    'public-outstate-4year': '4-Year Public (Out-of-State)',
    'public-2year': '2-Year Public College',
  };

  return names[type] || type;
}
