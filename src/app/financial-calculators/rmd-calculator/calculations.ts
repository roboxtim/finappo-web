/**
 * RMD Calculator - Calculation Functions and Types
 *
 * Based on reference: https://www.calculator.net/rmd-calculator.html
 *
 * This module provides comprehensive Required Minimum Distribution (RMD) calculations including:
 * - IRS Uniform Lifetime Table
 * - IRS Single Life Table
 * - IRS Joint Life and Last Survivor Table
 * - Age-based RMD calculations
 * - Multiple beneficiary scenarios
 * - Year-by-year withdrawal schedules
 * - Account balance projections with growth
 */

// ============================================================================
// IRS Life Expectancy Tables
// ============================================================================

/**
 * IRS Uniform Lifetime Table
 * Used for most RMD calculations when:
 * - No spouse beneficiary, or
 * - Spouse is not more than 10 years younger
 * Source: IRS Publication 590-B
 */
export const UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4,
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2,
  91: 11.5,
  92: 10.8,
  93: 10.1,
  94: 9.5,
  95: 8.9,
  96: 8.4,
  97: 7.8,
  98: 7.3,
  99: 6.8,
  100: 6.4,
  101: 6.0,
  102: 5.6,
  103: 5.2,
  104: 4.9,
  105: 4.6,
  106: 4.3,
  107: 4.1,
  108: 3.9,
  109: 3.7,
  110: 3.5,
  111: 3.4,
  112: 3.3,
  113: 3.1,
  114: 3.0,
  115: 2.9,
  116: 2.8,
  117: 2.7,
  118: 2.5,
  119: 2.3,
  120: 2.0,
};

/**
 * IRS Single Life Table (Simplified subset for beneficiaries)
 * Used when account owner has passed and beneficiary is taking distributions
 * This is a subset - full table goes from age 0-111+
 */
export const SINGLE_LIFE_TABLE: Record<number, number> = {
  0: 84.6,
  1: 83.7,
  5: 79.7,
  10: 74.8,
  15: 69.9,
  20: 65.0,
  25: 60.2,
  30: 55.3,
  35: 50.5,
  40: 45.7,
  45: 41.0,
  50: 36.2,
  55: 31.6,
  60: 27.1,
  65: 22.9,
  70: 19.0,
  71: 18.0,
  72: 17.1,
  73: 16.2,
  74: 15.3,
  75: 14.5,
  76: 13.6,
  77: 12.8,
  78: 12.0,
  79: 11.2,
  80: 10.5,
  81: 9.8,
  82: 9.1,
  83: 8.5,
  84: 7.9,
  85: 7.3,
  86: 6.8,
  87: 6.3,
  88: 5.8,
  89: 5.4,
  90: 5.0,
  91: 4.6,
  92: 4.3,
  93: 4.0,
  94: 3.7,
  95: 3.5,
  96: 3.3,
  97: 3.0,
  98: 2.8,
  99: 2.6,
  100: 2.5,
  105: 1.8,
  110: 1.3,
  111: 1.1,
};

/**
 * Joint Life Table Sample - For spouse more than 10 years younger
 * This is simplified. Full table considers both ages.
 * Key: "ownerAge-spouseAge" -> distribution period
 */
export const JOINT_LIFE_TABLE_SAMPLE: Record<string, number> = {
  '73-60': 28.6,
  '73-61': 27.7,
  '73-62': 26.8,
  '73-63': 25.9,
  '74-60': 27.7,
  '74-61': 26.8,
  '74-62': 25.9,
  '74-63': 25.0,
  '75-60': 26.8,
  '75-61': 25.9,
  '75-62': 25.0,
  '75-63': 24.1,
  '75-64': 23.3,
  '75-65': 22.4,
  '76-60': 25.9,
  '76-61': 25.0,
  '76-62': 24.1,
  '76-63': 23.3,
  '76-64': 22.4,
  '76-65': 21.6,
  '77-60': 25.0,
  '77-61': 24.2,
  '77-62': 23.3,
  '77-63': 22.5,
  '77-64': 21.6,
  '77-65': 20.8,
  '80-60': 22.5,
  '80-65': 18.4,
  '80-70': 15.0,
};

// ============================================================================
// Types
// ============================================================================

export interface RMDInputs {
  // Birth Information
  birthYear: number;

  // RMD Year
  rmdYear: number;

  // Account Information
  accountBalance: number; // Balance as of Dec 31 prior year

  // Beneficiary Information
  hasSpouseBeneficiary: boolean;
  spouseBirthYear?: number;

  // Optional Projections
  estimatedReturnRate?: number; // Annual return percentage
  yearsToProject?: number; // Number of years to project
}

export interface RMDResults {
  // Current RMD Calculation
  currentAge: number;
  rmdAge: number;
  distributionPeriod: number;
  rmdAmount: number;

  // RMD Start Information
  rmdStartAge: number;
  rmdStartYear: number;
  firstRMDDeadline: string;

  // Table Used
  tableUsed: 'Uniform' | 'Joint' | 'Single';

  // Projection (if requested)
  projections?: YearlyProjection[];

  // Summary Statistics
  totalRMDs?: number;
  finalBalance?: number;
  averageRMD?: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  beginningBalance: number;
  distributionPeriod: number;
  rmdAmount: number;
  earnings: number; // Based on estimated return
  endingBalance: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines the RMD start age based on birth year
 * - Born before 1951: Age 72
 * - Born 1951-1959: Age 73
 * - Born 1960 or later: Age 75 (starting 2033)
 */
export function getRMDStartAge(birthYear: number): number {
  if (birthYear < 1951) return 72;
  if (birthYear <= 1959) return 73;
  // SECURE Act 2.0: Age 75 starting in 2033
  const currentYear = new Date().getFullYear();
  if (currentYear >= 2033) return 75;
  return 73; // Until 2033, still 73 for those born 1960+
}

/**
 * Gets the appropriate distribution period based on age and beneficiary situation
 */
export function getDistributionPeriod(
  ownerAge: number,
  hasSpouseBeneficiary: boolean,
  spouseAge?: number
): { period: number; table: 'Uniform' | 'Joint' | 'Single' } {
  // For spouse more than 10 years younger as sole beneficiary
  if (hasSpouseBeneficiary && spouseAge !== undefined) {
    const ageDifference = ownerAge - spouseAge;
    if (ageDifference > 10) {
      // Use Joint Life Table - simplified calculation
      // In reality, would need full joint table lookup
      const jointKey = `${ownerAge}-${spouseAge}`;
      if (JOINT_LIFE_TABLE_SAMPLE[jointKey]) {
        return { period: JOINT_LIFE_TABLE_SAMPLE[jointKey], table: 'Joint' };
      }
      // Fallback: estimate based on younger spouse's single life expectancy
      const spousePeriod = SINGLE_LIFE_TABLE[spouseAge] || 40;
      return {
        period: Math.min(spousePeriod, UNIFORM_LIFETIME_TABLE[ownerAge] || 2.0),
        table: 'Joint',
      };
    }
  }

  // Use Uniform Lifetime Table for most cases
  let period = UNIFORM_LIFETIME_TABLE[ownerAge];
  if (!period) {
    // For ages over 120, use 2.0
    period = ownerAge > 120 ? 2.0 : UNIFORM_LIFETIME_TABLE[120];
  }

  return { period, table: 'Uniform' };
}

/**
 * Calculates RMD amount based on balance and distribution period
 */
export function calculateRMD(
  accountBalance: number,
  distributionPeriod: number
): number {
  if (distributionPeriod === 0) return 0;
  return accountBalance / distributionPeriod;
}

/**
 * Formats currency for display
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
 * Formats percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================================================
// Main Calculation Functions
// ============================================================================

/**
 * Validates RMD inputs
 */
export function validateRMDInputs(inputs: RMDInputs): string[] {
  const errors: string[] = [];

  const currentYear = new Date().getFullYear();

  // Validate birth year
  if (inputs.birthYear < 1900 || inputs.birthYear > currentYear - 20) {
    errors.push('Invalid birth year');
  }

  // Validate RMD year
  if (inputs.rmdYear < currentYear - 5 || inputs.rmdYear > currentYear + 10) {
    errors.push('RMD year should be within 5 years past or 10 years future');
  }

  // Validate account balance
  if (inputs.accountBalance < 0) {
    errors.push('Account balance cannot be negative');
  }

  // Validate spouse birth year if provided
  if (inputs.hasSpouseBeneficiary && inputs.spouseBirthYear) {
    if (inputs.spouseBirthYear < 1900 || inputs.spouseBirthYear > currentYear) {
      errors.push('Invalid spouse birth year');
    }
  }

  // Validate return rate if provided
  if (inputs.estimatedReturnRate !== undefined) {
    if (inputs.estimatedReturnRate < -50 || inputs.estimatedReturnRate > 50) {
      errors.push('Return rate should be between -50% and 50%');
    }
  }

  return errors;
}

/**
 * Main RMD calculation function
 */
export function calculateRMDResults(inputs: RMDInputs): RMDResults {
  // Calculate ages
  const currentAge = inputs.rmdYear - inputs.birthYear;
  const rmdStartAge = getRMDStartAge(inputs.birthYear);
  const rmdStartYear = inputs.birthYear + rmdStartAge;

  // Calculate first RMD deadline
  const firstRMDDeadline = `April 1, ${rmdStartYear + 1}`;

  // Calculate spouse age if applicable
  const spouseAge =
    inputs.hasSpouseBeneficiary && inputs.spouseBirthYear
      ? inputs.rmdYear - inputs.spouseBirthYear
      : undefined;

  // Get distribution period
  const { period: distributionPeriod, table: tableUsed } =
    getDistributionPeriod(currentAge, inputs.hasSpouseBeneficiary, spouseAge);

  // Calculate RMD amount
  const rmdAmount = calculateRMD(inputs.accountBalance, distributionPeriod);

  // Build base results
  const results: RMDResults = {
    currentAge,
    rmdAge: currentAge,
    distributionPeriod,
    rmdAmount,
    rmdStartAge,
    rmdStartYear,
    firstRMDDeadline,
    tableUsed,
  };

  // Add projections if requested
  if (inputs.yearsToProject && inputs.yearsToProject > 0) {
    const projections = calculateProjections(
      inputs.accountBalance,
      currentAge,
      inputs.rmdYear,
      inputs.yearsToProject,
      inputs.estimatedReturnRate || 0,
      inputs.hasSpouseBeneficiary,
      spouseAge
    );

    results.projections = projections;

    // Calculate summary statistics
    if (projections.length > 0) {
      results.totalRMDs = projections.reduce((sum, p) => sum + p.rmdAmount, 0);
      results.finalBalance = projections[projections.length - 1].endingBalance;
      results.averageRMD = results.totalRMDs / projections.length;
    }
  }

  return results;
}

/**
 * Calculates year-by-year RMD projections
 */
function calculateProjections(
  initialBalance: number,
  startAge: number,
  startYear: number,
  yearsToProject: number,
  annualReturn: number,
  hasSpouseBeneficiary: boolean,
  initialSpouseAge?: number
): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  let currentBalance = initialBalance;
  const returnRate = annualReturn / 100;

  // Limit projections to age 120
  const maxAge = 120;
  const effectiveYears = Math.min(yearsToProject, maxAge - startAge);

  for (let i = 0; i < effectiveYears; i++) {
    const year = startYear + i;
    const age = startAge + i;
    const spouseAge =
      initialSpouseAge !== undefined ? initialSpouseAge + i : undefined;

    // Get distribution period for this age
    const { period } = getDistributionPeriod(
      age,
      hasSpouseBeneficiary,
      spouseAge
    );

    // Calculate RMD
    const rmdAmount = calculateRMD(currentBalance, period);

    // Calculate earnings on remaining balance after RMD
    const balanceAfterRMD = Math.max(0, currentBalance - rmdAmount);
    const earnings = balanceAfterRMD * returnRate;

    // Calculate ending balance
    const endingBalance = balanceAfterRMD + earnings;

    projections.push({
      year,
      age,
      beginningBalance: currentBalance,
      distributionPeriod: period,
      rmdAmount,
      earnings,
      endingBalance,
    });

    // Update balance for next year
    currentBalance = endingBalance;

    // Stop if balance reaches zero
    if (currentBalance <= 0) break;
  }

  return projections;
}

// ============================================================================
// Export convenience functions
// ============================================================================

export function isRMDRequired(birthYear: number, currentYear: number): boolean {
  const age = currentYear - birthYear;
  const rmdStartAge = getRMDStartAge(birthYear);
  return age >= rmdStartAge;
}

export function getFirstRMDYear(birthYear: number): number {
  return birthYear + getRMDStartAge(birthYear);
}

export function getRMDDeadline(birthYear: number, rmdYear: number): string {
  const firstRMDYear = getFirstRMDYear(birthYear);

  if (rmdYear === firstRMDYear) {
    // First RMD can be delayed until April 1 of following year
    return `April 1, ${rmdYear + 1}`;
  } else {
    // Subsequent RMDs must be taken by December 31
    return `December 31, ${rmdYear}`;
  }
}
