/**
 * Pension Calculator - Calculation Functions and Types
 *
 * Based on reference: https://www.calculator.net/pension-calculator.html
 *
 * This module provides comprehensive pension planning calculations including:
 * - Lump sum vs. monthly pension comparison with present value analysis
 * - Single-life vs. joint-and-survivor pension comparison
 * - Early retirement vs. delayed retirement (work longer) analysis
 * - Cost-of-living adjustments (COLA) for inflation protection
 * - Life expectancy and longevity risk analysis
 * - Investment return projections
 */

// ============================================================================
// Types
// ============================================================================

export interface LumpSumVsMonthlyInputs {
  retirementAge: number;
  lumpSumAmount: number;
  monthlyPensionAmount: number;
  investmentReturnPercent: number; // Annual return on lump sum if invested
  colaPercent: number; // Cost-of-living adjustment for monthly pension
  lifeExpectancy: number;
}

export interface LumpSumVsMonthlyResults {
  // Lump sum analysis
  lumpSumInitialValue: number;
  lumpSumProjectedValue: number; // Value at life expectancy if invested
  lumpSumMonthlyWithdrawal: number; // Safe withdrawal amount
  lumpSumTotalWithdrawn: number; // Total withdrawn over lifetime

  // Monthly pension analysis
  monthlyPensionInitialAmount: number;
  monthlyPensionFinalAmount: number; // With COLA adjustments
  monthlyPensionTotalReceived: number; // Total received over lifetime
  monthlyPensionPresentValue: number; // Present value of all payments

  // Comparison
  betterOption: 'lump-sum' | 'monthly-pension';
  differenceDollars: number;
  differencePercent: number;
  breakEvenAge: number; // Age at which monthly pension equals lump sum value

  // Year-by-year projections
  yearByYearProjection: PensionYearProjection[];
}

export interface SingleLifeVsJointInputs {
  retirementAge: number;
  lifeExpectancy: number;
  spouseAgeAtRetirement: number;
  spouseLifeExpectancy: number;
  singleLifePensionAmount: number;
  jointSurvivorPensionAmount: number;
  survivorBenefitPercent: number; // % spouse receives (typically 50%, 66%, 75%, 100%)
  investmentReturnPercent: number;
  colaPercent: number;
}

export interface SingleLifeVsJointResults {
  // Single life analysis
  singleLifeTotalReceived: number;
  singleLifePresentValue: number;
  singleLifeMonthsOfPayment: number;

  // Joint survivor analysis
  jointSurvivorTotalReceived: number;
  jointSurvivorPresentValue: number;
  jointSurvivorMonthsOfPayment: number;
  jointSurvivorSpouseMonthlyAmount: number;
  jointSurvivorSpouseTotalReceived: number;

  // Comparison
  betterOption: 'single-life' | 'joint-survivor';
  differenceDollars: number;
  differencePercent: number;
  breakEvenYears: number; // Years until joint option breaks even

  // Scenario analysis
  ifYouDieFirst: ScenarioAnalysis;
  ifSpouseDiesFirst: ScenarioAnalysis;

  // Year-by-year projections
  yearByYearProjection: PensionYearProjection[];
}

export interface WorkLongerInputs {
  option1RetirementAge: number;
  option1MonthlyAmount: number;
  option2RetirementAge: number;
  option2MonthlyAmount: number;
  lifeExpectancy: number;
  investmentReturnPercent: number;
  colaPercent: number;
  currentAge: number;
}

export interface WorkLongerResults {
  // Option 1 (retire early)
  option1TotalReceived: number;
  option1PresentValue: number;
  option1MonthsOfPayment: number;
  option1YearsOfRetirement: number;

  // Option 2 (retire later)
  option2TotalReceived: number;
  option2PresentValue: number;
  option2MonthsOfPayment: number;
  option2YearsOfRetirement: number;

  // Comparison
  betterOption: 'option1' | 'option2';
  differenceDollars: number;
  differencePercent: number;
  additionalYearsWorked: number;
  breakEvenAge: number;

  // Year-by-year projections
  yearByYearProjection: PensionYearProjection[];
}

export interface PensionYearProjection {
  year: number;
  age: number;
  option1Value: number;
  option2Value: number;
  option1CumulativeReceived: number;
  option2CumulativeReceived: number;
  option1MonthlyAmount: number;
  option2MonthlyAmount: number;
}

export interface ScenarioAnalysis {
  totalReceived: number;
  presentValue: number;
  description: string;
}

// ============================================================================
// Constants
// ============================================================================

export const PENSION_CONSTANTS = {
  SAFE_WITHDRAWAL_RATE: 0.04, // 4% rule for lump sum withdrawals
  MONTHS_PER_YEAR: 12,
  DEFAULT_SURVIVOR_BENEFIT: 50, // 50% survivor benefit
  MIN_AGE: 18,
  MAX_AGE: 120,
  MIN_LIFE_EXPECTANCY: 60,
  MAX_LIFE_EXPECTANCY: 120,
};

// ============================================================================
// Validation Functions
// ============================================================================

export function validateLumpSumVsMonthlyInputs(
  inputs: LumpSumVsMonthlyInputs
): string[] {
  const errors: string[] = [];

  if (inputs.retirementAge < PENSION_CONSTANTS.MIN_AGE) {
    errors.push(`Retirement age must be at least ${PENSION_CONSTANTS.MIN_AGE}`);
  }

  if (inputs.lifeExpectancy < inputs.retirementAge) {
    errors.push('Life expectancy must be greater than retirement age');
  }

  if (inputs.lifeExpectancy > PENSION_CONSTANTS.MAX_LIFE_EXPECTANCY) {
    errors.push(
      `Life expectancy cannot exceed ${PENSION_CONSTANTS.MAX_LIFE_EXPECTANCY}`
    );
  }

  if (inputs.lumpSumAmount <= 0) {
    errors.push('Lump sum amount must be greater than zero');
  }

  if (inputs.monthlyPensionAmount <= 0) {
    errors.push('Monthly pension amount must be greater than zero');
  }

  if (inputs.investmentReturnPercent < 0) {
    errors.push('Investment return cannot be negative');
  }

  if (inputs.investmentReturnPercent > 50) {
    errors.push('Investment return seems unrealistically high (max 50%)');
  }

  if (inputs.colaPercent < 0) {
    errors.push('COLA cannot be negative');
  }

  if (inputs.colaPercent > 20) {
    errors.push('COLA seems unrealistically high (max 20%)');
  }

  return errors;
}

export function validateSingleLifeVsJointInputs(
  inputs: SingleLifeVsJointInputs
): string[] {
  const errors: string[] = [];

  if (inputs.retirementAge < PENSION_CONSTANTS.MIN_AGE) {
    errors.push(`Retirement age must be at least ${PENSION_CONSTANTS.MIN_AGE}`);
  }

  if (inputs.lifeExpectancy < inputs.retirementAge) {
    errors.push('Your life expectancy must be greater than retirement age');
  }

  if (inputs.spouseAgeAtRetirement < PENSION_CONSTANTS.MIN_AGE) {
    errors.push(`Spouse age must be at least ${PENSION_CONSTANTS.MIN_AGE}`);
  }

  if (inputs.spouseLifeExpectancy < inputs.spouseAgeAtRetirement) {
    errors.push(
      "Spouse life expectancy must be greater than spouse's age at retirement"
    );
  }

  if (inputs.singleLifePensionAmount <= 0) {
    errors.push('Single life pension amount must be greater than zero');
  }

  if (inputs.jointSurvivorPensionAmount <= 0) {
    errors.push('Joint survivor pension amount must be greater than zero');
  }

  if (inputs.jointSurvivorPensionAmount > inputs.singleLifePensionAmount) {
    errors.push(
      'Joint survivor pension amount cannot exceed single life amount'
    );
  }

  if (
    inputs.survivorBenefitPercent < 0 ||
    inputs.survivorBenefitPercent > 100
  ) {
    errors.push('Survivor benefit percent must be between 0 and 100');
  }

  return errors;
}

export function validateWorkLongerInputs(inputs: WorkLongerInputs): string[] {
  const errors: string[] = [];

  if (inputs.currentAge < PENSION_CONSTANTS.MIN_AGE) {
    errors.push(`Current age must be at least ${PENSION_CONSTANTS.MIN_AGE}`);
  }

  if (inputs.option1RetirementAge <= inputs.currentAge) {
    errors.push('Option 1 retirement age must be greater than current age');
  }

  if (inputs.option2RetirementAge <= inputs.currentAge) {
    errors.push('Option 2 retirement age must be greater than current age');
  }

  if (inputs.option1RetirementAge === inputs.option2RetirementAge) {
    errors.push('Retirement ages must be different to compare options');
  }

  if (inputs.lifeExpectancy < inputs.option1RetirementAge) {
    errors.push('Life expectancy must be greater than both retirement ages');
  }

  if (inputs.lifeExpectancy < inputs.option2RetirementAge) {
    errors.push('Life expectancy must be greater than both retirement ages');
  }

  if (inputs.option1MonthlyAmount <= 0) {
    errors.push('Option 1 monthly amount must be greater than zero');
  }

  if (inputs.option2MonthlyAmount <= 0) {
    errors.push('Option 2 monthly amount must be greater than zero');
  }

  return errors;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate present value of a series of payments with COLA adjustments
 * Uses the formula for present value of a growing annuity
 */
export function calculatePresentValue(
  monthlyPayment: number,
  months: number,
  annualReturnRate: number,
  annualColaRate: number
): number {
  if (months <= 0) return 0;

  const monthlyRate = annualReturnRate / 100 / 12;
  const monthlyGrowthRate = annualColaRate / 100 / 12;

  // If rates are equal, use simplified formula
  if (Math.abs(monthlyRate - monthlyGrowthRate) < 0.0001) {
    return (monthlyPayment * months) / (1 + monthlyRate);
  }

  // Growing annuity present value formula
  // PV = PMT * [(1 - ((1 + g)/(1 + r))^n) / (r - g)]
  const factor = (1 + monthlyGrowthRate) / (1 + monthlyRate);
  const numerator = 1 - Math.pow(factor, months);
  const denominator = monthlyRate - monthlyGrowthRate;

  return monthlyPayment * (numerator / denominator);
}

/**
 * Calculate future value of a lump sum with compound interest
 */
export function calculateFutureValue(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0) return principal;
  return principal * Math.pow(1 + annualRate / 100, years);
}

/**
 * Calculate total received from monthly pension with COLA
 */
export function calculateTotalReceived(
  initialMonthlyPayment: number,
  months: number,
  annualColaRate: number
): number {
  if (months <= 0) return 0;

  const monthlyGrowthRate = annualColaRate / 100 / 12;
  let total = 0;

  for (let month = 0; month < months; month++) {
    const payment =
      initialMonthlyPayment * Math.pow(1 + monthlyGrowthRate, month);
    total += payment;
  }

  return total;
}

/**
 * Calculate break-even point between two options
 */
export function calculateBreakEvenAge(
  startAge: number,
  endAge: number,
  option1Callback: (age: number) => number,
  option2Callback: (age: number) => number
): number {
  for (let age = startAge; age <= endAge; age++) {
    const option1Value = option1Callback(age);
    const option2Value = option2Callback(age);

    if (option2Value >= option1Value) {
      return age;
    }
  }

  return endAge; // If no break-even found, return max age
}

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
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format years
 */
export function formatYears(years: number): string {
  return years === 1 ? '1 year' : `${years} years`;
}

/**
 * Format months
 */
export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  if (remainingMonths === 0) {
    return formatYears(years);
  }

  return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

// ============================================================================
// Main Calculation Functions
// ============================================================================

/**
 * Calculate lump sum vs. monthly pension comparison
 */
export function calculateLumpSumVsMonthly(
  inputs: LumpSumVsMonthlyInputs
): LumpSumVsMonthlyResults {
  const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
  const monthsInRetirement =
    yearsInRetirement * PENSION_CONSTANTS.MONTHS_PER_YEAR;

  // Lump sum analysis
  const lumpSumProjectedValue = calculateFutureValue(
    inputs.lumpSumAmount,
    inputs.investmentReturnPercent,
    yearsInRetirement
  );
  const lumpSumMonthlyWithdrawal =
    (inputs.lumpSumAmount * PENSION_CONSTANTS.SAFE_WITHDRAWAL_RATE) / 12;
  const lumpSumTotalWithdrawn = lumpSumMonthlyWithdrawal * monthsInRetirement;

  // Monthly pension analysis
  const monthlyPensionTotalReceived = calculateTotalReceived(
    inputs.monthlyPensionAmount,
    monthsInRetirement,
    inputs.colaPercent
  );
  const monthlyPensionPresentValue = calculatePresentValue(
    inputs.monthlyPensionAmount,
    monthsInRetirement,
    inputs.investmentReturnPercent,
    inputs.colaPercent
  );
  const monthlyGrowthRate = inputs.colaPercent / 100 / 12;
  const monthlyPensionFinalAmount =
    inputs.monthlyPensionAmount *
    Math.pow(1 + monthlyGrowthRate, monthsInRetirement - 1);

  // Year-by-year projections
  const yearByYearProjection: PensionYearProjection[] = [];
  let lumpSumCumulative = 0;
  let pensionCumulative = 0;

  for (let year = 0; year <= yearsInRetirement; year++) {
    const age = inputs.retirementAge + year;
    const monthsElapsed = year * PENSION_CONSTANTS.MONTHS_PER_YEAR;

    // Lump sum value if kept invested
    const lumpSumValue = calculateFutureValue(
      inputs.lumpSumAmount,
      inputs.investmentReturnPercent,
      year
    );

    // Add withdrawals for this year
    if (year > 0) {
      for (let m = 0; m < 12; m++) {
        lumpSumCumulative += lumpSumMonthlyWithdrawal;
      }
    }

    // Pension value for this year
    const currentMonthlyPension =
      inputs.monthlyPensionAmount *
      Math.pow(1 + monthlyGrowthRate, monthsElapsed);

    if (year > 0) {
      for (let m = 0; m < 12; m++) {
        const monthPension =
          inputs.monthlyPensionAmount *
          Math.pow(1 + monthlyGrowthRate, monthsElapsed + m);
        pensionCumulative += monthPension;
      }
    }

    yearByYearProjection.push({
      year,
      age,
      option1Value: lumpSumValue,
      option2Value: pensionCumulative,
      option1CumulativeReceived: lumpSumCumulative,
      option2CumulativeReceived: pensionCumulative,
      option1MonthlyAmount: lumpSumMonthlyWithdrawal,
      option2MonthlyAmount: currentMonthlyPension,
    });
  }

  // Determine better option (compare present values)
  const lumpSumPresentValue = inputs.lumpSumAmount;
  const betterOption =
    lumpSumPresentValue >= monthlyPensionPresentValue
      ? 'lump-sum'
      : 'monthly-pension';
  const differenceDollars = Math.abs(
    lumpSumPresentValue - monthlyPensionPresentValue
  );
  const differencePercent =
    (differenceDollars /
      Math.max(lumpSumPresentValue, monthlyPensionPresentValue)) *
    100;

  // Calculate break-even age
  const breakEvenAge = calculateBreakEvenAge(
    inputs.retirementAge,
    inputs.lifeExpectancy,
    (age) => {
      const years = age - inputs.retirementAge;
      const months = years * 12;
      return calculateTotalReceived(
        inputs.monthlyPensionAmount,
        months,
        inputs.colaPercent
      );
    },
    () => inputs.lumpSumAmount
  );

  return {
    lumpSumInitialValue: inputs.lumpSumAmount,
    lumpSumProjectedValue,
    lumpSumMonthlyWithdrawal,
    lumpSumTotalWithdrawn,
    monthlyPensionInitialAmount: inputs.monthlyPensionAmount,
    monthlyPensionFinalAmount,
    monthlyPensionTotalReceived,
    monthlyPensionPresentValue,
    betterOption,
    differenceDollars,
    differencePercent,
    breakEvenAge,
    yearByYearProjection,
  };
}

/**
 * Calculate single-life vs. joint-and-survivor comparison
 */
export function calculateSingleLifeVsJoint(
  inputs: SingleLifeVsJointInputs
): SingleLifeVsJointResults {
  const yourYearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
  const yourMonthsInRetirement =
    yourYearsInRetirement * PENSION_CONSTANTS.MONTHS_PER_YEAR;

  const spouseYearsInRetirement =
    inputs.spouseLifeExpectancy - inputs.spouseAgeAtRetirement;
  const spouseMonthsInRetirement =
    spouseYearsInRetirement * PENSION_CONSTANTS.MONTHS_PER_YEAR;

  // Single life analysis
  const singleLifeTotalReceived = calculateTotalReceived(
    inputs.singleLifePensionAmount,
    yourMonthsInRetirement,
    inputs.colaPercent
  );
  const singleLifePresentValue = calculatePresentValue(
    inputs.singleLifePensionAmount,
    yourMonthsInRetirement,
    inputs.investmentReturnPercent,
    inputs.colaPercent
  );

  // Joint survivor analysis
  const jointSurvivorTotalReceived = calculateTotalReceived(
    inputs.jointSurvivorPensionAmount,
    yourMonthsInRetirement,
    inputs.colaPercent
  );
  const jointSurvivorPresentValue = calculatePresentValue(
    inputs.jointSurvivorPensionAmount,
    yourMonthsInRetirement,
    inputs.investmentReturnPercent,
    inputs.colaPercent
  );

  // Calculate spouse benefit after primary dies
  const monthlyGrowthRate = inputs.colaPercent / 100 / 12;
  const finalJointAmount =
    inputs.jointSurvivorPensionAmount *
    Math.pow(1 + monthlyGrowthRate, yourMonthsInRetirement);
  const jointSurvivorSpouseMonthlyAmount =
    finalJointAmount * (inputs.survivorBenefitPercent / 100);

  // Spouse receives benefits after primary dies until spouse's life expectancy
  const spouseMonthsAfterPrimaryDies = Math.max(
    0,
    spouseMonthsInRetirement - yourMonthsInRetirement
  );
  const jointSurvivorSpouseTotalReceived = calculateTotalReceived(
    jointSurvivorSpouseMonthlyAmount,
    spouseMonthsAfterPrimaryDies,
    inputs.colaPercent
  );

  const jointSurvivorTotalWithSpouse =
    jointSurvivorTotalReceived + jointSurvivorSpouseTotalReceived;

  // Scenario analysis
  const ifYouDieFirst: ScenarioAnalysis = {
    totalReceived: jointSurvivorTotalWithSpouse,
    presentValue:
      jointSurvivorPresentValue +
      calculatePresentValue(
        jointSurvivorSpouseMonthlyAmount,
        spouseMonthsAfterPrimaryDies,
        inputs.investmentReturnPercent,
        inputs.colaPercent
      ),
    description: 'Joint survivor provides continued income for your spouse',
  };

  const ifSpouseDiesFirst: ScenarioAnalysis = {
    totalReceived: jointSurvivorTotalReceived,
    presentValue: jointSurvivorPresentValue,
    description:
      'You receive reduced joint survivor benefit but spouse received nothing',
  };

  // Determine better option
  const betterOption =
    singleLifePresentValue >= jointSurvivorPresentValue
      ? 'single-life'
      : 'joint-survivor';
  const differenceDollars = Math.abs(
    singleLifePresentValue - jointSurvivorPresentValue
  );
  const differencePercent =
    (differenceDollars /
      Math.max(singleLifePresentValue, jointSurvivorPresentValue)) *
    100;

  // Calculate break-even years (when does joint option total equal single option)
  const monthlyDifference =
    inputs.singleLifePensionAmount - inputs.jointSurvivorPensionAmount;
  const breakEvenMonths = Math.ceil(
    (monthlyDifference * yourMonthsInRetirement) /
      (inputs.jointSurvivorPensionAmount *
        (inputs.survivorBenefitPercent / 100))
  );
  const breakEvenYears = breakEvenMonths / 12;

  // Year-by-year projections
  const yearByYearProjection: PensionYearProjection[] = [];
  let singleLifeCumulative = 0;
  let jointSurvivorCumulative = 0;

  const maxYears = Math.max(yourYearsInRetirement, spouseYearsInRetirement);

  for (let year = 0; year <= maxYears; year++) {
    const age = inputs.retirementAge + year;
    const spouseAge = inputs.spouseAgeAtRetirement + year;
    const monthsElapsed = year * PENSION_CONSTANTS.MONTHS_PER_YEAR;

    // Single life (stops when you die)
    let singleLifeMonthly = 0;
    if (age <= inputs.lifeExpectancy) {
      singleLifeMonthly =
        inputs.singleLifePensionAmount *
        Math.pow(1 + monthlyGrowthRate, monthsElapsed);
      if (year > 0) {
        for (let m = 0; m < 12; m++) {
          const payment =
            inputs.singleLifePensionAmount *
            Math.pow(1 + monthlyGrowthRate, monthsElapsed + m);
          singleLifeCumulative += payment;
        }
      }
    }

    // Joint survivor (continues for spouse after you die)
    let jointSurvivorMonthly = 0;
    if (age <= inputs.lifeExpectancy) {
      // You're alive, receiving full joint benefit
      jointSurvivorMonthly =
        inputs.jointSurvivorPensionAmount *
        Math.pow(1 + monthlyGrowthRate, monthsElapsed);
      if (year > 0) {
        for (let m = 0; m < 12; m++) {
          const payment =
            inputs.jointSurvivorPensionAmount *
            Math.pow(1 + monthlyGrowthRate, monthsElapsed + m);
          jointSurvivorCumulative += payment;
        }
      }
    } else if (
      spouseAge <= inputs.spouseLifeExpectancy &&
      age > inputs.lifeExpectancy
    ) {
      // You've passed, spouse receiving survivor benefit
      const monthsSinceYouDied =
        (age - inputs.lifeExpectancy) * PENSION_CONSTANTS.MONTHS_PER_YEAR;
      jointSurvivorMonthly =
        jointSurvivorSpouseMonthlyAmount *
        Math.pow(1 + monthlyGrowthRate, monthsSinceYouDied);
      if (year > 0) {
        for (let m = 0; m < 12; m++) {
          const payment =
            jointSurvivorSpouseMonthlyAmount *
            Math.pow(1 + monthlyGrowthRate, monthsSinceYouDied + m);
          jointSurvivorCumulative += payment;
        }
      }
    }

    yearByYearProjection.push({
      year,
      age,
      option1Value: singleLifeCumulative,
      option2Value: jointSurvivorCumulative,
      option1CumulativeReceived: singleLifeCumulative,
      option2CumulativeReceived: jointSurvivorCumulative,
      option1MonthlyAmount: singleLifeMonthly,
      option2MonthlyAmount: jointSurvivorMonthly,
    });
  }

  return {
    singleLifeTotalReceived,
    singleLifePresentValue,
    singleLifeMonthsOfPayment: yourMonthsInRetirement,
    jointSurvivorTotalReceived: jointSurvivorTotalWithSpouse,
    jointSurvivorPresentValue: ifYouDieFirst.presentValue,
    jointSurvivorMonthsOfPayment:
      yourMonthsInRetirement + spouseMonthsAfterPrimaryDies,
    jointSurvivorSpouseMonthlyAmount,
    jointSurvivorSpouseTotalReceived,
    betterOption,
    differenceDollars,
    differencePercent,
    breakEvenYears,
    ifYouDieFirst,
    ifSpouseDiesFirst,
    yearByYearProjection,
  };
}

/**
 * Calculate work longer (early vs. delayed retirement) comparison
 */
export function calculateWorkLonger(
  inputs: WorkLongerInputs
): WorkLongerResults {
  const option1YearsInRetirement =
    inputs.lifeExpectancy - inputs.option1RetirementAge;
  const option1MonthsInRetirement =
    option1YearsInRetirement * PENSION_CONSTANTS.MONTHS_PER_YEAR;

  const option2YearsInRetirement =
    inputs.lifeExpectancy - inputs.option2RetirementAge;
  const option2MonthsInRetirement =
    option2YearsInRetirement * PENSION_CONSTANTS.MONTHS_PER_YEAR;

  const additionalYearsWorked = Math.abs(
    inputs.option2RetirementAge - inputs.option1RetirementAge
  );

  // Option 1 analysis
  const option1TotalReceived = calculateTotalReceived(
    inputs.option1MonthlyAmount,
    option1MonthsInRetirement,
    inputs.colaPercent
  );
  const option1PresentValue = calculatePresentValue(
    inputs.option1MonthlyAmount,
    option1MonthsInRetirement,
    inputs.investmentReturnPercent,
    inputs.colaPercent
  );

  // Option 2 analysis
  const option2TotalReceived = calculateTotalReceived(
    inputs.option2MonthlyAmount,
    option2MonthsInRetirement,
    inputs.colaPercent
  );
  const option2PresentValue = calculatePresentValue(
    inputs.option2MonthlyAmount,
    option2MonthsInRetirement,
    inputs.investmentReturnPercent,
    inputs.colaPercent
  );

  // Determine better option
  const betterOption =
    option1PresentValue >= option2PresentValue ? 'option1' : 'option2';
  const differenceDollars = Math.abs(option1PresentValue - option2PresentValue);
  const differencePercent =
    (differenceDollars / Math.max(option1PresentValue, option2PresentValue)) *
    100;

  // Calculate break-even age
  const earlierAge = Math.min(
    inputs.option1RetirementAge,
    inputs.option2RetirementAge
  );
  const breakEvenAge = calculateBreakEvenAge(
    earlierAge,
    inputs.lifeExpectancy,
    (age) => {
      if (age < inputs.option1RetirementAge) return 0;
      const months = (age - inputs.option1RetirementAge) * 12;
      return calculateTotalReceived(
        inputs.option1MonthlyAmount,
        months,
        inputs.colaPercent
      );
    },
    (age) => {
      if (age < inputs.option2RetirementAge) return 0;
      const months = (age - inputs.option2RetirementAge) * 12;
      return calculateTotalReceived(
        inputs.option2MonthlyAmount,
        months,
        inputs.colaPercent
      );
    }
  );

  // Year-by-year projections
  const yearByYearProjection: PensionYearProjection[] = [];
  let option1Cumulative = 0;
  let option2Cumulative = 0;

  const startAge = inputs.currentAge;
  const endAge = inputs.lifeExpectancy;
  const monthlyGrowthRate = inputs.colaPercent / 100 / 12;

  for (let age = startAge; age <= endAge; age++) {
    const year = age - startAge;

    // Option 1 values
    let option1Monthly = 0;
    let option1Value = 0;
    if (age >= inputs.option1RetirementAge) {
      const monthsRetired =
        (age - inputs.option1RetirementAge) * PENSION_CONSTANTS.MONTHS_PER_YEAR;
      option1Monthly =
        inputs.option1MonthlyAmount *
        Math.pow(1 + monthlyGrowthRate, monthsRetired);
      if (age > inputs.option1RetirementAge) {
        for (let m = 0; m < 12; m++) {
          const payment =
            inputs.option1MonthlyAmount *
            Math.pow(1 + monthlyGrowthRate, monthsRetired + m);
          option1Cumulative += payment;
        }
      }
      option1Value = option1Cumulative;
    }

    // Option 2 values
    let option2Monthly = 0;
    let option2Value = 0;
    if (age >= inputs.option2RetirementAge) {
      const monthsRetired =
        (age - inputs.option2RetirementAge) * PENSION_CONSTANTS.MONTHS_PER_YEAR;
      option2Monthly =
        inputs.option2MonthlyAmount *
        Math.pow(1 + monthlyGrowthRate, monthsRetired);
      if (age > inputs.option2RetirementAge) {
        for (let m = 0; m < 12; m++) {
          const payment =
            inputs.option2MonthlyAmount *
            Math.pow(1 + monthlyGrowthRate, monthsRetired + m);
          option2Cumulative += payment;
        }
      }
      option2Value = option2Cumulative;
    }

    yearByYearProjection.push({
      year,
      age,
      option1Value,
      option2Value,
      option1CumulativeReceived: option1Cumulative,
      option2CumulativeReceived: option2Cumulative,
      option1MonthlyAmount: option1Monthly,
      option2MonthlyAmount: option2Monthly,
    });
  }

  return {
    option1TotalReceived,
    option1PresentValue,
    option1MonthsOfPayment: option1MonthsInRetirement,
    option1YearsOfRetirement: option1YearsInRetirement,
    option2TotalReceived,
    option2PresentValue,
    option2MonthsOfPayment: option2MonthsInRetirement,
    option2YearsOfRetirement: option2YearsInRetirement,
    betterOption,
    differenceDollars,
    differencePercent,
    additionalYearsWorked,
    breakEvenAge,
    yearByYearProjection,
  };
}
