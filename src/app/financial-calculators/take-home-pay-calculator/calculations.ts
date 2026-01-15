// Take Home Pay Calculator Logic
// Based on 2025 Tax Brackets and FICA rates

export type PayFrequency =
  | 'weekly'
  | 'bi-weekly'
  | 'semi-monthly'
  | 'monthly'
  | 'annually';

export type FilingStatus =
  | 'single'
  | 'married'
  | 'married-separate'
  | 'head-of-household';

export interface TakeHomePayInputs {
  grossSalary: number;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  state: string; // state code or 'none'
  federalAllowances: number;
  preTaxDeductions: number; // annual amount (401k, HSA, health insurance)
  postTaxDeductions: number; // annual amount
  stateIncomeTaxRate?: number; // optional override
}

export interface PayBreakdown {
  annually: number;
  monthly: number;
  semiMonthly: number;
  biWeekly: number;
  weekly: number;
}

export interface TakeHomePayResults {
  // Gross pay
  grossPay: number;
  grossPayByPeriod: PayBreakdown;

  // Deductions
  preTaxDeductions: number;
  postTaxDeductions: number;

  // Taxable amounts
  taxableIncome: number;
  ficaWages: number;

  // Taxes
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateIncomeTax: number;
  totalTaxes: number;

  // Net pay
  netPayBeforePostTax: number;
  netPay: number;
  netPayByPeriod: PayBreakdown;

  // Percentages
  effectiveTaxRate: number;
  takeHomePercentage: number;
}

// 2025 Tax Constants
export const TAX_CONSTANTS_2025 = {
  // FICA rates
  SOCIAL_SECURITY_RATE: 0.062,
  SOCIAL_SECURITY_WAGE_BASE: 176100, // 2025 limit
  MEDICARE_RATE: 0.0145,
  ADDITIONAL_MEDICARE_RATE: 0.009, // 0.9% additional on high earners
  ADDITIONAL_MEDICARE_THRESHOLD_SINGLE: 200000,
  ADDITIONAL_MEDICARE_THRESHOLD_MARRIED: 250000,
  ADDITIONAL_MEDICARE_THRESHOLD_MARRIED_SEPARATE: 125000,

  // Standard deductions 2025
  STANDARD_DEDUCTION_SINGLE: 15000,
  STANDARD_DEDUCTION_MARRIED: 30000,
  STANDARD_DEDUCTION_MARRIED_SEPARATE: 15000,
  STANDARD_DEDUCTION_HEAD_OF_HOUSEHOLD: 22500,
};

// 2025 Federal Tax Brackets
export const FEDERAL_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.1, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48400 },
    { rate: 0.22, min: 48400, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 626350 },
    { rate: 0.37, min: 626350, max: Infinity },
  ],
  married: [
    { rate: 0.1, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96800 },
    { rate: 0.22, min: 96800, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501000 },
    { rate: 0.35, min: 501000, max: 751600 },
    { rate: 0.37, min: 751600, max: Infinity },
  ],
  'married-separate': [
    { rate: 0.1, min: 0, max: 11925 },
    { rate: 0.12, min: 11925, max: 48400 },
    { rate: 0.22, min: 48400, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 375800 },
    { rate: 0.37, min: 375800, max: Infinity },
  ],
  'head-of-household': [
    { rate: 0.1, min: 0, max: 17000 },
    { rate: 0.12, min: 17000, max: 64850 },
    { rate: 0.22, min: 64850, max: 103350 },
    { rate: 0.24, min: 103350, max: 197300 },
    { rate: 0.32, min: 197300, max: 250500 },
    { rate: 0.35, min: 250500, max: 626350 },
    { rate: 0.37, min: 626350, max: Infinity },
  ],
};

// State tax rates (simplified - using flat rates for common states)
export const STATE_TAX_RATES: { [key: string]: number } = {
  none: 0,
  AL: 0.05, // Alabama
  AK: 0, // Alaska
  AZ: 0.025, // Arizona
  AR: 0.049, // Arkansas
  CA: 0.093, // California (top rate, simplified)
  CO: 0.044, // Colorado
  CT: 0.0699, // Connecticut
  DE: 0.066, // Delaware
  FL: 0, // Florida
  GA: 0.0575, // Georgia
  HI: 0.11, // Hawaii
  ID: 0.058, // Idaho
  IL: 0.0495, // Illinois
  IN: 0.0315, // Indiana
  IA: 0.06, // Iowa
  KS: 0.057, // Kansas
  KY: 0.04, // Kentucky
  LA: 0.0425, // Louisiana
  ME: 0.075, // Maine
  MD: 0.0575, // Maryland
  MA: 0.05, // Massachusetts
  MI: 0.0425, // Michigan
  MN: 0.0985, // Minnesota
  MS: 0.05, // Mississippi
  MO: 0.048, // Missouri
  MT: 0.0675, // Montana
  NE: 0.0684, // Nebraska
  NV: 0, // Nevada
  NH: 0, // New Hampshire
  NJ: 0.1075, // New Jersey
  NM: 0.059, // New Mexico
  NY: 0.109, // New York
  NC: 0.0475, // North Carolina
  ND: 0.029, // North Dakota
  OH: 0.0375, // Ohio
  OK: 0.05, // Oklahoma
  OR: 0.099, // Oregon
  PA: 0.0307, // Pennsylvania
  RI: 0.0599, // Rhode Island
  SC: 0.07, // South Carolina
  SD: 0, // South Dakota
  TN: 0, // Tennessee
  TX: 0, // Texas
  UT: 0.0465, // Utah
  VT: 0.0875, // Vermont
  VA: 0.0575, // Virginia
  WA: 0, // Washington
  WV: 0.065, // West Virginia
  WI: 0.0765, // Wisconsin
  WY: 0, // Wyoming
};

export function validateTakeHomePayInputs(inputs: TakeHomePayInputs): string[] {
  const errors: string[] = [];

  if (inputs.grossSalary <= 0) {
    errors.push('Gross salary must be positive');
  }

  if (inputs.federalAllowances < 0) {
    errors.push('Federal allowances cannot be negative');
  }

  if (inputs.preTaxDeductions < 0) {
    errors.push('Pre-tax deductions cannot be negative');
  }

  if (inputs.postTaxDeductions < 0) {
    errors.push('Post-tax deductions cannot be negative');
  }

  if (inputs.stateIncomeTaxRate !== undefined) {
    if (inputs.stateIncomeTaxRate < 0 || inputs.stateIncomeTaxRate > 0.15) {
      errors.push('State income tax rate must be between 0% and 15%');
    }
  }

  return errors;
}

function getStandardDeduction(filingStatus: FilingStatus): number {
  switch (filingStatus) {
    case 'single':
      return TAX_CONSTANTS_2025.STANDARD_DEDUCTION_SINGLE;
    case 'married':
      return TAX_CONSTANTS_2025.STANDARD_DEDUCTION_MARRIED;
    case 'married-separate':
      return TAX_CONSTANTS_2025.STANDARD_DEDUCTION_MARRIED_SEPARATE;
    case 'head-of-household':
      return TAX_CONSTANTS_2025.STANDARD_DEDUCTION_HEAD_OF_HOUSEHOLD;
    default:
      return TAX_CONSTANTS_2025.STANDARD_DEDUCTION_SINGLE;
  }
}

function calculateFederalTax(
  taxableIncome: number,
  filingStatus: FilingStatus
): number {
  if (taxableIncome <= 0) return 0;

  const brackets = FEDERAL_TAX_BRACKETS_2025[filingStatus];
  let tax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      break;
    }

    const taxableInBracket = Math.min(
      taxableIncome - bracket.min,
      bracket.max - bracket.min
    );
    tax += taxableInBracket * bracket.rate;

    if (taxableIncome <= bracket.max) {
      break;
    }
  }

  return Math.round(tax);
}

function calculateFICATaxes(
  wages: number,
  filingStatus: FilingStatus
): { socialSecurity: number; medicare: number } {
  // Social Security (capped at wage base)
  const socialSecurityWages = Math.min(
    wages,
    TAX_CONSTANTS_2025.SOCIAL_SECURITY_WAGE_BASE
  );
  const socialSecurity = Math.round(
    socialSecurityWages * TAX_CONSTANTS_2025.SOCIAL_SECURITY_RATE
  );

  // Medicare (no cap on base rate)
  let medicare = wages * TAX_CONSTANTS_2025.MEDICARE_RATE;

  // Additional Medicare tax for high earners
  let additionalMedicareThreshold;
  switch (filingStatus) {
    case 'married':
      additionalMedicareThreshold =
        TAX_CONSTANTS_2025.ADDITIONAL_MEDICARE_THRESHOLD_MARRIED;
      break;
    case 'married-separate':
      additionalMedicareThreshold =
        TAX_CONSTANTS_2025.ADDITIONAL_MEDICARE_THRESHOLD_MARRIED_SEPARATE;
      break;
    default:
      additionalMedicareThreshold =
        TAX_CONSTANTS_2025.ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;
  }

  if (wages > additionalMedicareThreshold) {
    const additionalMedicareWages = wages - additionalMedicareThreshold;
    medicare +=
      additionalMedicareWages * TAX_CONSTANTS_2025.ADDITIONAL_MEDICARE_RATE;
  }

  return {
    socialSecurity,
    medicare: Math.round(medicare),
  };
}

function convertAnnualToPeriods(annual: number): PayBreakdown {
  return {
    annually: Math.round(annual),
    monthly: Math.round(annual / 12),
    semiMonthly: Math.round(annual / 24),
    biWeekly: Math.round(annual / 26),
    weekly: Math.round(annual / 52),
  };
}

export function calculateTakeHomePay(
  inputs: TakeHomePayInputs
): TakeHomePayResults {
  // Convert input to annual if needed
  let annualGrossPay = inputs.grossSalary;
  switch (inputs.payFrequency) {
    case 'weekly':
      annualGrossPay = inputs.grossSalary * 52;
      break;
    case 'bi-weekly':
      annualGrossPay = inputs.grossSalary * 26;
      break;
    case 'semi-monthly':
      annualGrossPay = inputs.grossSalary * 24;
      break;
    case 'monthly':
      annualGrossPay = inputs.grossSalary * 12;
      break;
    case 'annually':
      annualGrossPay = inputs.grossSalary;
      break;
  }

  // Calculate FICA wages (gross - pre-tax deductions)
  const ficaWages = annualGrossPay - inputs.preTaxDeductions;

  // Calculate FICA taxes
  const fica = calculateFICATaxes(ficaWages, inputs.filingStatus);

  // Calculate taxable income (gross - pre-tax deductions - standard deduction)
  const standardDeduction = getStandardDeduction(inputs.filingStatus);
  const adjustedGrossIncome = annualGrossPay - inputs.preTaxDeductions;
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);

  // Calculate federal income tax
  const federalIncomeTax = calculateFederalTax(
    taxableIncome,
    inputs.filingStatus
  );

  // Calculate state income tax
  const stateRate =
    inputs.stateIncomeTaxRate !== undefined
      ? inputs.stateIncomeTaxRate
      : STATE_TAX_RATES[inputs.state] || 0;
  const stateIncomeTax = Math.round(taxableIncome * stateRate);

  // Total taxes
  const totalTaxes =
    federalIncomeTax + fica.socialSecurity + fica.medicare + stateIncomeTax;

  // Net pay before post-tax deductions
  const netPayBeforePostTax =
    annualGrossPay -
    federalIncomeTax -
    fica.socialSecurity -
    fica.medicare -
    stateIncomeTax -
    inputs.preTaxDeductions;

  // Final net pay
  const netPay = netPayBeforePostTax - inputs.postTaxDeductions;

  // Calculate percentages
  const effectiveTaxRate = (totalTaxes / annualGrossPay) * 100;
  const takeHomePercentage = (netPay / annualGrossPay) * 100;

  return {
    grossPay: annualGrossPay,
    grossPayByPeriod: convertAnnualToPeriods(annualGrossPay),

    preTaxDeductions: inputs.preTaxDeductions,
    postTaxDeductions: inputs.postTaxDeductions,

    taxableIncome,
    ficaWages,

    federalIncomeTax,
    socialSecurityTax: fica.socialSecurity,
    medicareTax: fica.medicare,
    stateIncomeTax,
    totalTaxes,

    netPayBeforePostTax,
    netPay,
    netPayByPeriod: convertAnnualToPeriods(netPay),

    effectiveTaxRate,
    takeHomePercentage,
  };
}

// Utility functions
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.round(absValue).toLocaleString('en-US')}`;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}
