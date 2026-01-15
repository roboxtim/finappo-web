// Types
export type SalaryPeriod =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'biWeekly'
  | 'semiMonthly'
  | 'monthly'
  | 'quarterly'
  | 'annual';
export type FilingStatus = 'single' | 'married' | 'head';
export type StateCode =
  | 'AL'
  | 'AK'
  | 'AZ'
  | 'AR'
  | 'CA'
  | 'CO'
  | 'CT'
  | 'DE'
  | 'FL'
  | 'GA'
  | 'HI'
  | 'ID'
  | 'IL'
  | 'IN'
  | 'IA'
  | 'KS'
  | 'KY'
  | 'LA'
  | 'ME'
  | 'MD'
  | 'MA'
  | 'MI'
  | 'MN'
  | 'MS'
  | 'MO'
  | 'MT'
  | 'NE'
  | 'NV'
  | 'NH'
  | 'NJ'
  | 'NM'
  | 'NY'
  | 'NC'
  | 'ND'
  | 'OH'
  | 'OK'
  | 'OR'
  | 'PA'
  | 'RI'
  | 'SC'
  | 'SD'
  | 'TN'
  | 'TX'
  | 'UT'
  | 'VT'
  | 'VA'
  | 'WA'
  | 'WV'
  | 'WI'
  | 'WY'
  | 'DC';

export interface SalaryInputs {
  salary: number;
  salaryPeriod: SalaryPeriod;
  hoursPerWeek: number;
  daysPerWeek: number;
  holidaysPerYear: number;
  vacationDays: number;
  federalFilingStatus: FilingStatus;
  state: StateCode;
  stateFilingStatus: FilingStatus;
  preTaxDeductions: {
    retirement401k: number;
    healthInsurance: number;
    hsa: number;
    other: number;
  };
  postTaxDeductions: number;
}

export interface PayPeriodAmounts {
  annual: number;
  quarterly: number;
  monthly: number;
  semiMonthly: number;
  biWeekly: number;
  weekly: number;
  daily: number;
  hourly: number;
}

export interface SalaryConversion {
  annual: { unadjusted: number; adjusted: number };
  quarterly: { unadjusted: number; adjusted: number };
  monthly: { unadjusted: number; adjusted: number };
  semiMonthly: { unadjusted: number; adjusted: number };
  biWeekly: { unadjusted: number; adjusted: number };
  weekly: { unadjusted: number; adjusted: number };
  daily: { unadjusted: number; adjusted: number };
  hourly: { unadjusted: number; adjusted: number };
}

export interface FICATaxResult {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
}

export interface SalaryResults {
  gross: PayPeriodAmounts;
  adjustedGross: PayPeriodAmounts;
  federalTax: PayPeriodAmounts;
  stateTax: PayPeriodAmounts;
  fica: {
    socialSecurity: PayPeriodAmounts;
    medicare: PayPeriodAmounts;
    additionalMedicare: PayPeriodAmounts;
    total: PayPeriodAmounts;
  };
  preTaxDeductions: PayPeriodAmounts;
  postTaxDeductions: PayPeriodAmounts;
  net: PayPeriodAmounts;
  takeHomePercentage: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  yearlyBreakdown: {
    gross: number;
    preTaxDeductions: number;
    taxableIncome: number;
    federalTax: number;
    stateTax: number;
    ficaTax: number;
    postTaxDeductions: number;
    netIncome: number;
  };
}

// 2025 Federal Tax Brackets
export const FEDERAL_TAX_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married: [
    { min: 0, max: 23850, rate: 0.1 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  head: [
    { min: 0, max: 17000, rate: 0.1 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// 2025 Standard Deductions
export const STANDARD_DEDUCTIONS_2025 = {
  single: 15750,
  married: 31500,
  head: 23625,
};

// 2025 FICA Limits
export const FICA_LIMITS_2025 = {
  SOCIAL_SECURITY_RATE: 0.062,
  SOCIAL_SECURITY_WAGE_BASE: 176100,
  MEDICARE_RATE: 0.0145,
  ADDITIONAL_MEDICARE_RATE: 0.009,
  ADDITIONAL_MEDICARE_THRESHOLD_SINGLE: 200000,
  ADDITIONAL_MEDICARE_THRESHOLD_MARRIED: 250000,
  MAX_401K_CONTRIBUTION: 23000,
  MAX_401K_CATCH_UP: 7500,
  MAX_HSA_INDIVIDUAL: 4300,
  MAX_HSA_FAMILY: 8550,
  MAX_HSA_CATCH_UP: 1000,
};

// State Tax Rates (simplified - actual rates are more complex)
export const STATE_TAX_RATES: Record<
  StateCode,
  { rate: number; type: 'flat' | 'progressive' | 'none' }
> = {
  AL: { rate: 0.05, type: 'flat' },
  AK: { rate: 0, type: 'none' },
  AZ: { rate: 0.025, type: 'flat' },
  AR: { rate: 0.047, type: 'progressive' },
  CA: { rate: 0.093, type: 'progressive' }, // Top rate, actual is progressive
  CO: { rate: 0.044, type: 'flat' },
  CT: { rate: 0.0699, type: 'progressive' },
  DE: { rate: 0.066, type: 'progressive' },
  FL: { rate: 0, type: 'none' },
  GA: { rate: 0.0549, type: 'flat' },
  HI: { rate: 0.11, type: 'progressive' },
  ID: { rate: 0.058, type: 'flat' },
  IL: { rate: 0.0495, type: 'flat' },
  IN: { rate: 0.0315, type: 'flat' },
  IA: { rate: 0.057, type: 'flat' },
  KS: { rate: 0.057, type: 'progressive' },
  KY: { rate: 0.04, type: 'flat' },
  LA: { rate: 0.0425, type: 'progressive' },
  ME: { rate: 0.0715, type: 'progressive' },
  MD: { rate: 0.0575, type: 'progressive' },
  MA: { rate: 0.05, type: 'flat' },
  MI: { rate: 0.04, type: 'flat' },
  MN: { rate: 0.0985, type: 'progressive' },
  MS: { rate: 0.045, type: 'flat' },
  MO: { rate: 0.0495, type: 'progressive' },
  MT: { rate: 0.0675, type: 'progressive' },
  NE: { rate: 0.0664, type: 'progressive' },
  NV: { rate: 0, type: 'none' },
  NH: { rate: 0, type: 'none' }, // Tax on interest/dividends only
  NJ: { rate: 0.1075, type: 'progressive' },
  NM: { rate: 0.059, type: 'progressive' },
  NY: { rate: 0.109, type: 'progressive' },
  NC: { rate: 0.045, type: 'flat' },
  ND: { rate: 0.029, type: 'progressive' },
  OH: { rate: 0.035, type: 'progressive' },
  OK: { rate: 0.0475, type: 'progressive' },
  OR: { rate: 0.099, type: 'progressive' },
  PA: { rate: 0.0307, type: 'flat' },
  RI: { rate: 0.0599, type: 'progressive' },
  SC: { rate: 0.064, type: 'progressive' },
  SD: { rate: 0, type: 'none' },
  TN: { rate: 0, type: 'none' },
  TX: { rate: 0, type: 'none' },
  UT: { rate: 0.0485, type: 'flat' },
  VT: { rate: 0.0875, type: 'progressive' },
  VA: { rate: 0.0575, type: 'progressive' },
  WA: { rate: 0, type: 'none' },
  WV: { rate: 0.065, type: 'progressive' },
  WI: { rate: 0.0765, type: 'progressive' },
  WY: { rate: 0, type: 'none' },
  DC: { rate: 0.1075, type: 'progressive' },
};

// California Progressive Tax Brackets (simplified)
const CA_TAX_BRACKETS_SINGLE = [
  { min: 0, max: 10099, rate: 0.01 },
  { min: 10099, max: 23942, rate: 0.02 },
  { min: 23942, max: 37788, rate: 0.04 },
  { min: 37788, max: 52455, rate: 0.06 },
  { min: 52455, max: 66295, rate: 0.08 },
  { min: 66295, max: 338639, rate: 0.093 },
  { min: 338639, max: 406364, rate: 0.103 },
  { min: 406364, max: 677275, rate: 0.113 },
  { min: 677275, max: Infinity, rate: 0.123 },
];

// New York Progressive Tax Brackets (simplified)
const NY_TAX_BRACKETS_SINGLE = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8500, max: 11700, rate: 0.045 },
  { min: 11700, max: 13900, rate: 0.0525 },
  { min: 13900, max: 80650, rate: 0.0585 },
  { min: 80650, max: 215400, rate: 0.0625 },
  { min: 215400, max: 1077550, rate: 0.0685 },
  { min: 1077550, max: 25000000, rate: 0.0965 },
  { min: 25000000, max: Infinity, rate: 0.109 },
];

// Convert salary between different periods
export function convertSalary(
  amount: number,
  period: SalaryPeriod,
  hoursPerWeek: number,
  daysPerWeek: number,
  holidaysPerYear: number,
  vacationDays: number
): SalaryConversion {
  const weeksPerYear = 52;
  const workingDaysPerYear = daysPerWeek * weeksPerYear;
  const adjustedWorkingDays =
    workingDaysPerYear -
    holidaysPerYear * (daysPerWeek / 5) -
    vacationDays * (daysPerWeek / 5);
  const adjustedWeeks = adjustedWorkingDays / daysPerWeek;

  // First convert to annual (unadjusted)
  let annualUnadjusted: number;
  switch (period) {
    case 'hourly':
      annualUnadjusted = amount * hoursPerWeek * weeksPerYear;
      break;
    case 'daily':
      annualUnadjusted = amount * workingDaysPerYear;
      break;
    case 'weekly':
      annualUnadjusted = amount * weeksPerYear;
      break;
    case 'biWeekly':
      annualUnadjusted = amount * 26;
      break;
    case 'semiMonthly':
      annualUnadjusted = amount * 24;
      break;
    case 'monthly':
      annualUnadjusted = amount * 12;
      break;
    case 'quarterly':
      annualUnadjusted = amount * 4;
      break;
    case 'annual':
      annualUnadjusted = amount;
      break;
    default:
      annualUnadjusted = amount;
  }

  // Calculate annual adjusted based on actual working time
  let annualAdjusted: number;
  if (period === 'hourly') {
    annualAdjusted = amount * hoursPerWeek * adjustedWeeks;
  } else if (period === 'daily') {
    annualAdjusted = amount * adjustedWorkingDays;
  } else {
    // For other periods, adjust proportionally
    const adjustmentFactor = adjustedWeeks / weeksPerYear;
    annualAdjusted = annualUnadjusted * adjustmentFactor;
  }

  // Convert from annual to all other periods
  const result: SalaryConversion = {
    annual: { unadjusted: annualUnadjusted, adjusted: annualAdjusted },
    quarterly: {
      unadjusted: annualUnadjusted / 4,
      adjusted: annualAdjusted / 4,
    },
    monthly: {
      unadjusted: annualUnadjusted / 12,
      adjusted: annualAdjusted / 12,
    },
    semiMonthly: {
      unadjusted: annualUnadjusted / 24,
      adjusted: annualAdjusted / 24,
    },
    biWeekly: {
      unadjusted: annualUnadjusted / 26,
      adjusted: annualAdjusted / 26,
    },
    weekly: {
      unadjusted: annualUnadjusted / weeksPerYear,
      adjusted: annualAdjusted / adjustedWeeks,
    },
    daily: {
      unadjusted: annualUnadjusted / workingDaysPerYear,
      adjusted: annualAdjusted / adjustedWorkingDays,
    },
    hourly: {
      unadjusted: annualUnadjusted / (hoursPerWeek * weeksPerYear),
      adjusted: annualAdjusted / (hoursPerWeek * adjustedWeeks),
    },
  };

  return result;
}

// Calculate federal income tax
export function calculateFederalTax(
  annualIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number
): number {
  const taxableIncome = Math.max(
    0,
    annualIncome - preTaxDeductions - STANDARD_DEDUCTIONS_2025[filingStatus]
  );

  if (taxableIncome === 0) return 0;

  const brackets = FEDERAL_TAX_BRACKETS_2025[filingStatus];
  let tax = 0;

  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(
        taxableIncome - bracket.min,
        bracket.max - bracket.min
      );
      tax += taxableInBracket * bracket.rate;
    }
  }

  return tax;
}

// Calculate FICA taxes
export function calculateFICATax(annualIncome: number): FICATaxResult {
  // Social Security (capped at wage base)
  const socialSecurityTaxable = Math.min(
    annualIncome,
    FICA_LIMITS_2025.SOCIAL_SECURITY_WAGE_BASE
  );
  const socialSecurity =
    socialSecurityTaxable * FICA_LIMITS_2025.SOCIAL_SECURITY_RATE;

  // Medicare
  const medicare = annualIncome * FICA_LIMITS_2025.MEDICARE_RATE;

  // Additional Medicare Tax for high earners (using single threshold as default)
  let additionalMedicare = 0;
  if (annualIncome > FICA_LIMITS_2025.ADDITIONAL_MEDICARE_THRESHOLD_SINGLE) {
    additionalMedicare =
      (annualIncome - FICA_LIMITS_2025.ADDITIONAL_MEDICARE_THRESHOLD_SINGLE) *
      FICA_LIMITS_2025.ADDITIONAL_MEDICARE_RATE;
  }

  return {
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    additionalMedicare: Math.round(additionalMedicare * 100) / 100,
    total:
      Math.round((socialSecurity + medicare + additionalMedicare) * 100) / 100,
  };
}

// Calculate state income tax (simplified)
export function calculateStateTax(
  annualIncome: number,
  state: StateCode
): number {
  const stateInfo = STATE_TAX_RATES[state];

  if (stateInfo.type === 'none') {
    return 0;
  }

  // For progressive states, use simplified calculation
  if (state === 'CA') {
    // Use California's progressive brackets (simplified)
    let tax = 0;
    for (const bracket of CA_TAX_BRACKETS_SINGLE) {
      if (annualIncome > bracket.min) {
        const taxableInBracket = Math.min(
          annualIncome - bracket.min,
          bracket.max - bracket.min
        );
        tax += taxableInBracket * bracket.rate;
      }
    }
    return tax;
  } else if (state === 'NY') {
    // Use New York's progressive brackets (simplified)
    let tax = 0;
    for (const bracket of NY_TAX_BRACKETS_SINGLE) {
      if (annualIncome > bracket.min) {
        const taxableInBracket = Math.min(
          annualIncome - bracket.min,
          bracket.max - bracket.min
        );
        tax += taxableInBracket * bracket.rate;
      }
    }
    return tax;
  } else if (stateInfo.type === 'flat') {
    // Simple flat tax calculation
    return annualIncome * stateInfo.rate;
  } else {
    // For other progressive states, use a simplified average rate
    return annualIncome * stateInfo.rate * 0.7; // Approximation
  }
}

// Convert annual amount to all pay periods
function createPayPeriodAmounts(annual: number): PayPeriodAmounts {
  return {
    annual: annual,
    quarterly: annual / 4,
    monthly: annual / 12,
    semiMonthly: annual / 24,
    biWeekly: annual / 26,
    weekly: annual / 52,
    daily: annual / 260,
    hourly: annual / 2080,
  };
}

// Calculate complete salary results
export function calculateSalaryResults(inputs: SalaryInputs): SalaryResults {
  // Convert salary to annual
  const salaryConversion = convertSalary(
    inputs.salary,
    inputs.salaryPeriod,
    inputs.hoursPerWeek,
    inputs.daysPerWeek,
    inputs.holidaysPerYear,
    inputs.vacationDays
  );

  const grossAnnual = salaryConversion.annual.unadjusted;
  const adjustedGrossAnnual = salaryConversion.annual.adjusted;

  // Calculate pre-tax deductions
  const preTaxDeductionsAnnual =
    inputs.preTaxDeductions.retirement401k +
    inputs.preTaxDeductions.healthInsurance +
    inputs.preTaxDeductions.hsa +
    inputs.preTaxDeductions.other;

  // Calculate taxes
  const federalTaxAnnual = calculateFederalTax(
    grossAnnual,
    inputs.federalFilingStatus,
    preTaxDeductionsAnnual
  );

  const stateTaxAnnual = calculateStateTax(
    grossAnnual - preTaxDeductionsAnnual,
    inputs.state
  );

  const ficaTax = calculateFICATax(grossAnnual);

  // Calculate net pay
  const netAnnual =
    grossAnnual -
    preTaxDeductionsAnnual -
    federalTaxAnnual -
    stateTaxAnnual -
    ficaTax.total -
    inputs.postTaxDeductions;

  // Calculate rates
  const totalTax = federalTaxAnnual + stateTaxAnnual + ficaTax.total;
  const effectiveTaxRate = (totalTax / grossAnnual) * 100;
  const takeHomePercentage = (netAnnual / grossAnnual) * 100;

  // Determine marginal tax rate
  const taxableIncome =
    grossAnnual -
    preTaxDeductionsAnnual -
    STANDARD_DEDUCTIONS_2025[inputs.federalFilingStatus];
  const brackets = FEDERAL_TAX_BRACKETS_2025[inputs.federalFilingStatus];
  let marginalTaxRate = 0;
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      marginalTaxRate = bracket.rate * 100;
    }
  }

  return {
    gross: createPayPeriodAmounts(grossAnnual),
    adjustedGross: createPayPeriodAmounts(adjustedGrossAnnual),
    federalTax: createPayPeriodAmounts(federalTaxAnnual),
    stateTax: createPayPeriodAmounts(stateTaxAnnual),
    fica: {
      socialSecurity: createPayPeriodAmounts(ficaTax.socialSecurity),
      medicare: createPayPeriodAmounts(ficaTax.medicare),
      additionalMedicare: createPayPeriodAmounts(ficaTax.additionalMedicare),
      total: createPayPeriodAmounts(ficaTax.total),
    },
    preTaxDeductions: createPayPeriodAmounts(preTaxDeductionsAnnual),
    postTaxDeductions: createPayPeriodAmounts(inputs.postTaxDeductions),
    net: createPayPeriodAmounts(netAnnual),
    takeHomePercentage,
    effectiveTaxRate,
    marginalTaxRate,
    yearlyBreakdown: {
      gross: grossAnnual,
      preTaxDeductions: preTaxDeductionsAnnual,
      taxableIncome: grossAnnual - preTaxDeductionsAnnual,
      federalTax: federalTaxAnnual,
      stateTax: stateTaxAnnual,
      ficaTax: ficaTax.total,
      postTaxDeductions: inputs.postTaxDeductions,
      netIncome: netAnnual,
    },
  };
}

// Validate inputs
export function validateSalaryInputs(inputs: SalaryInputs): string[] {
  const errors: string[] = [];

  // Validate salary
  if (inputs.salary < 0) {
    errors.push('Salary must be a positive number');
  }
  if (inputs.salary === 0) {
    errors.push('Salary must be greater than 0');
  }

  // Validate hours per week
  if (inputs.hoursPerWeek < 1 || inputs.hoursPerWeek > 168) {
    errors.push('Hours per week must be between 1 and 168');
  }

  // Validate days per week
  if (inputs.daysPerWeek < 1 || inputs.daysPerWeek > 7) {
    errors.push('Days per week must be between 1 and 7');
  }

  // Validate holidays
  if (inputs.holidaysPerYear < 0 || inputs.holidaysPerYear > 260) {
    errors.push('Holidays must be between 0 and 260');
  }

  // Validate vacation days
  if (inputs.vacationDays < 0 || inputs.vacationDays > 260) {
    errors.push('Vacation days cannot exceed 260 working days per year');
  }

  // Validate total time off
  if (inputs.holidaysPerYear + inputs.vacationDays > 260) {
    errors.push(
      'Total holidays and vacation days cannot exceed 260 working days'
    );
  }

  // Validate 401k contribution
  if (
    inputs.preTaxDeductions.retirement401k >
    FICA_LIMITS_2025.MAX_401K_CONTRIBUTION
  ) {
    errors.push(
      `401(k) contribution cannot exceed $${FICA_LIMITS_2025.MAX_401K_CONTRIBUTION.toLocaleString()} (2025 limit)`
    );
  }

  // Validate HSA contribution
  const hsaLimit =
    inputs.federalFilingStatus === 'married'
      ? FICA_LIMITS_2025.MAX_HSA_FAMILY
      : FICA_LIMITS_2025.MAX_HSA_INDIVIDUAL;

  if (inputs.preTaxDeductions.hsa > hsaLimit) {
    const coverage =
      inputs.federalFilingStatus === 'married' ? 'family' : 'individual';
    errors.push(
      `HSA contribution cannot exceed $${hsaLimit.toLocaleString()} for ${coverage} coverage (2025 limit)`
    );
  }

  // Validate total pre-tax deductions don't exceed salary
  const totalPreTax =
    inputs.preTaxDeductions.retirement401k +
    inputs.preTaxDeductions.healthInsurance +
    inputs.preTaxDeductions.hsa +
    inputs.preTaxDeductions.other;

  // Convert salary to annual for comparison
  const annualSalary = convertSalary(
    inputs.salary,
    inputs.salaryPeriod,
    inputs.hoursPerWeek,
    inputs.daysPerWeek,
    0,
    0
  ).annual.unadjusted;

  if (totalPreTax > annualSalary) {
    errors.push('Total pre-tax deductions cannot exceed gross salary');
  }

  // Validate negative deductions
  if (
    inputs.preTaxDeductions.retirement401k < 0 ||
    inputs.preTaxDeductions.healthInsurance < 0 ||
    inputs.preTaxDeductions.hsa < 0 ||
    inputs.preTaxDeductions.other < 0 ||
    inputs.postTaxDeductions < 0
  ) {
    errors.push('Deductions cannot be negative');
  }

  return errors;
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Get state name from code
export function getStateName(code: StateCode): string {
  const stateNames: Record<StateCode, string> = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
    DC: 'District of Columbia',
  };
  return stateNames[code];
}
