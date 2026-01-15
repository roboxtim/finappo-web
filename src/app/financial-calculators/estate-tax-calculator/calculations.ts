/**
 * Estate Tax Calculator - Calculations
 *
 * Calculates federal and state estate taxes based on 2025 tax law.
 * Federal exemption: $13.99M (single) / $27.98M (married)
 * Federal tax rates: 18% to 40% graduated
 */

// 2025 Federal Estate Tax Exemption and Rates
export const ESTATE_TAX_2025 = {
  FEDERAL_EXEMPTION_SINGLE: 13990000, // $13.99M
  FEDERAL_EXEMPTION_MARRIED: 27980000, // $27.98M (with portability)
  MAX_ANNUAL_GIFT_EXCLUSION: 19000, // $19,000 per recipient (2025)
};

// Federal Estate Tax Brackets (Graduated)
// Source: IRS Estate Tax Rate Schedule
export interface EstateTaxBracket {
  min: number;
  max: number | null;
  baseTax: number;
  rate: number;
}

export const FEDERAL_ESTATE_TAX_BRACKETS: EstateTaxBracket[] = [
  { min: 0, max: 10000, baseTax: 0, rate: 0.18 },
  { min: 10000, max: 20000, baseTax: 1800, rate: 0.2 },
  { min: 20000, max: 40000, baseTax: 3800, rate: 0.22 },
  { min: 40000, max: 60000, baseTax: 8200, rate: 0.24 },
  { min: 60000, max: 80000, baseTax: 13000, rate: 0.26 },
  { min: 80000, max: 100000, baseTax: 18200, rate: 0.28 },
  { min: 100000, max: 150000, baseTax: 23800, rate: 0.3 },
  { min: 150000, max: 250000, baseTax: 38800, rate: 0.32 },
  { min: 250000, max: 500000, baseTax: 70800, rate: 0.34 },
  { min: 500000, max: 750000, baseTax: 155800, rate: 0.37 },
  { min: 750000, max: 1000000, baseTax: 248300, rate: 0.39 },
  { min: 1000000, max: null, baseTax: 345800, rate: 0.4 }, // 40% on amounts over $1M
];

// State Estate Tax Information
export interface StateEstateTax {
  name: string;
  exemption: number;
  maxRate: number;
  hasInheritanceTax: boolean;
}

export const STATE_ESTATE_TAXES: { [key: string]: StateEstateTax } = {
  none: {
    name: 'No State Estate Tax',
    exemption: 0,
    maxRate: 0,
    hasInheritanceTax: false,
  },
  CT: {
    name: 'Connecticut',
    exemption: 13990000,
    maxRate: 0.12,
    hasInheritanceTax: false,
  },
  HI: {
    name: 'Hawaii',
    exemption: 5490000,
    maxRate: 0.2,
    hasInheritanceTax: false,
  },
  IL: {
    name: 'Illinois',
    exemption: 4000000,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  ME: {
    name: 'Maine',
    exemption: 6800000,
    maxRate: 0.12,
    hasInheritanceTax: false,
  },
  MD: {
    name: 'Maryland',
    exemption: 5000000,
    maxRate: 0.16,
    hasInheritanceTax: true,
  },
  MA: {
    name: 'Massachusetts',
    exemption: 2000000,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  MN: {
    name: 'Minnesota',
    exemption: 3000000,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  NY: {
    name: 'New York',
    exemption: 7160000,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  OR: {
    name: 'Oregon',
    exemption: 1000000,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  RI: {
    name: 'Rhode Island',
    exemption: 1733264,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  VT: {
    name: 'Vermont',
    exemption: 5000000,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
  WA: {
    name: 'Washington',
    exemption: 2193000,
    maxRate: 0.2,
    hasInheritanceTax: false,
  },
  DC: {
    name: 'Washington DC',
    exemption: 4528800,
    maxRate: 0.16,
    hasInheritanceTax: false,
  },
};

export interface EstateTaxInputs {
  totalAssets: number;
  totalDebts: number;
  maritalStatus: 'single' | 'married';
  state: string;
  giftsGivenLifetime: number;
  charitableDeductions: number;
}

export interface EstateTaxResults {
  grossEstate: number;
  totalDeductions: number;
  adjustedGrossEstate: number;
  taxableEstate: number;
  federalExemption: number;
  federalTaxableAmount: number;
  federalEstateTax: number;
  stateEstateTax: number;
  totalEstateTax: number;
  netToHeirs: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;

  // Breakdown
  totalTaxPaid: number;
  taxAsPercentOfEstate: number;

  // State info
  stateName: string;
  stateExemption: number;
}

/**
 * Calculate federal estate tax using graduated brackets
 */
function calculateFederalEstateTax(taxableAmount: number): number {
  if (taxableAmount <= 0) return 0;

  let tax = 0;

  for (const bracket of FEDERAL_ESTATE_TAX_BRACKETS) {
    if (taxableAmount <= bracket.min) break;

    const bracketMax = bracket.max || Infinity;
    const amountInBracket = Math.min(taxableAmount, bracketMax) - bracket.min;

    if (amountInBracket > 0) {
      tax = bracket.baseTax + amountInBracket * bracket.rate;
    }

    if (!bracket.max || taxableAmount <= bracket.max) break;
  }

  return Math.round(tax);
}

/**
 * Calculate state estate tax (simplified flat rate above exemption)
 */
function calculateStateEstateTax(
  taxableEstate: number,
  stateCode: string
): { tax: number; stateName: string; exemption: number } {
  const stateInfo = STATE_ESTATE_TAXES[stateCode] || STATE_ESTATE_TAXES['none'];

  if (stateInfo.exemption === 0) {
    return { tax: 0, stateName: stateInfo.name, exemption: 0 };
  }

  const stateTaxableAmount = Math.max(0, taxableEstate - stateInfo.exemption);
  const stateTax = Math.round(stateTaxableAmount * stateInfo.maxRate);

  return {
    tax: stateTax,
    stateName: stateInfo.name,
    exemption: stateInfo.exemption,
  };
}

/**
 * Get marginal tax rate for the taxable estate amount
 */
function getMarginalTaxRate(taxableAmount: number): number {
  if (taxableAmount <= 0) return 0;

  for (let i = FEDERAL_ESTATE_TAX_BRACKETS.length - 1; i >= 0; i--) {
    const bracket = FEDERAL_ESTATE_TAX_BRACKETS[i];
    if (taxableAmount > bracket.min) {
      return bracket.rate;
    }
  }

  return 0.18; // Minimum rate
}

/**
 * Main calculation function for estate tax
 */
export function calculateEstateTax(inputs: EstateTaxInputs): EstateTaxResults {
  // Calculate gross estate
  const grossEstate = inputs.totalAssets;

  // Calculate total deductions
  const totalDeductions = inputs.totalDebts + inputs.charitableDeductions;

  // Calculate adjusted gross estate
  const adjustedGrossEstate = Math.max(0, grossEstate - totalDeductions);

  // Add back lifetime gifts to determine taxable estate
  const taxableEstate = adjustedGrossEstate + inputs.giftsGivenLifetime;

  // Determine federal exemption based on marital status
  const federalExemption =
    inputs.maritalStatus === 'married'
      ? ESTATE_TAX_2025.FEDERAL_EXEMPTION_MARRIED
      : ESTATE_TAX_2025.FEDERAL_EXEMPTION_SINGLE;

  // Calculate federal taxable amount
  const federalTaxableAmount = Math.max(0, taxableEstate - federalExemption);

  // Calculate federal estate tax
  const federalEstateTax = calculateFederalEstateTax(federalTaxableAmount);

  // Calculate state estate tax
  const stateResult = calculateStateEstateTax(taxableEstate, inputs.state);
  const stateEstateTax = stateResult.tax;

  // Total estate tax
  const totalEstateTax = federalEstateTax + stateEstateTax;

  // Net to heirs
  const netToHeirs = Math.max(0, adjustedGrossEstate - totalEstateTax);

  // Effective tax rate (total tax / adjusted gross estate)
  const effectiveTaxRate =
    adjustedGrossEstate > 0 ? (totalEstateTax / adjustedGrossEstate) * 100 : 0;

  // Marginal tax rate
  const marginalTaxRate = getMarginalTaxRate(federalTaxableAmount) * 100;

  // Tax as percent of estate
  const taxAsPercentOfEstate =
    grossEstate > 0 ? (totalEstateTax / grossEstate) * 100 : 0;

  return {
    grossEstate,
    totalDeductions,
    adjustedGrossEstate,
    taxableEstate,
    federalExemption,
    federalTaxableAmount,
    federalEstateTax,
    stateEstateTax,
    totalEstateTax,
    netToHeirs,
    effectiveTaxRate,
    marginalTaxRate,
    totalTaxPaid: totalEstateTax,
    taxAsPercentOfEstate,
    stateName: stateResult.stateName,
    stateExemption: stateResult.exemption,
  };
}

/**
 * Validate estate tax inputs
 */
export function validateEstateTaxInputs(inputs: EstateTaxInputs): string[] {
  const errors: string[] = [];

  if (inputs.totalAssets < 0) {
    errors.push('Total assets cannot be negative');
  }

  if (inputs.totalDebts < 0) {
    errors.push('Total debts cannot be negative');
  }

  if (inputs.giftsGivenLifetime < 0) {
    errors.push('Lifetime gifts cannot be negative');
  }

  if (inputs.charitableDeductions < 0) {
    errors.push('Charitable deductions cannot be negative');
  }

  if (inputs.totalDebts > inputs.totalAssets) {
    errors.push('Total debts cannot exceed total assets');
  }

  if (!['single', 'married'].includes(inputs.maritalStatus)) {
    errors.push('Marital status must be either single or married');
  }

  return errors;
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
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompact(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}
