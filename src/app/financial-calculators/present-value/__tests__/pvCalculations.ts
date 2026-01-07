/**
 * Present Value Calculator - Core Calculation Logic
 *
 * This module implements comprehensive present value calculations including:
 * - PV of lump sum (future value)
 * - PV of ordinary annuity (payments at end of period)
 * - PV of annuity due (payments at beginning of period)
 * - PV of growing annuity (payments that increase over time)
 * - Combined calculations (lump sum + annuity)
 * - Support for multiple payment frequencies
 *
 * Formulas:
 * - PV of Lump Sum: PV = FV / (1 + r)^n
 * - PV of Ordinary Annuity: PV = PMT × [(1 - (1 + r)^-n) / r]
 * - PV of Annuity Due: PV = PV_ordinary × (1 + r)
 * - PV of Growing Annuity: PV = PMT × [(1 - ((1 + g) / (1 + r))^n) / (r - g)]
 * - Discount Factor: DF = 1 / (1 + r)^n
 */

export type PaymentTiming = 'end' | 'beginning';
export type PaymentFrequency =
  | 'annual'
  | 'semi-annual'
  | 'quarterly'
  | 'monthly'
  | 'weekly'
  | 'daily';

export interface PVInputs {
  // Lump Sum Inputs
  futureValue?: number;

  // Annuity Inputs
  periodicPayment?: number;
  paymentTiming?: PaymentTiming;

  // Growing Annuity
  growthRate?: number; // Annual percentage

  // Common Inputs
  periods: number; // Number of payment periods
  interestRate: number; // Annual percentage
  paymentFrequency?: PaymentFrequency;
}

export interface PVResults {
  // Main Results
  totalPresentValue: number;
  pvOfLumpSum: number;
  pvOfAnnuity: number;

  // Lump Sum Details
  futureValue: number;
  discountFactor: number;
  discountAmount: number;
  discountPercentage: number;

  // Annuity Details
  periodicPayment: number;
  numberOfPeriods: number;
  totalPayments: number;
  annuityDiscountAmount: number;
  paymentTiming: PaymentTiming;

  // Rate Information
  interestRate: number; // Annual rate as entered
  periodicRate: number; // Rate per payment period
  effectiveAnnualRate: number; // EAR
  paymentFrequency: PaymentFrequency;

  // Growing Annuity (if applicable)
  isGrowingAnnuity: boolean;
  growthRate?: number;
  totalFuturePayments?: number;

  // Period Breakdown
  periodBreakdown: PeriodDetail[];

  // Comparison Metrics
  futureValueComparison: number; // What the PV would grow to at the same rate
}

export interface PeriodDetail {
  period: number;
  payment: number; // Payment in this period (may grow)
  presentValue: number; // PV of this period's payment
  cumulativePV: number;
  discountFactor: number;
}

/**
 * Calculate periodic rate from annual rate based on payment frequency
 */
export function getPeriodicRate(
  annualRate: number,
  frequency: PaymentFrequency
): number {
  const rate = annualRate / 100; // Convert percentage to decimal

  switch (frequency) {
    case 'annual':
      return rate;
    case 'semi-annual':
      return rate / 2;
    case 'quarterly':
      return rate / 4;
    case 'monthly':
      return rate / 12;
    case 'weekly':
      return rate / 52;
    case 'daily':
      return rate / 365;
    default:
      return rate;
  }
}

/**
 * Get number of periods per year for a given frequency
 */
export function getPeriodsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'annual':
      return 1;
    case 'semi-annual':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
    case 'weekly':
      return 52;
    case 'daily':
      return 365;
    default:
      return 1;
  }
}

/**
 * Calculate Effective Annual Rate (EAR)
 * EAR = (1 + periodic_rate)^periods_per_year - 1
 */
export function calculateEffectiveAnnualRate(
  periodicRate: number,
  periodsPerYear: number
): number {
  return (Math.pow(1 + periodicRate, periodsPerYear) - 1) * 100;
}

/**
 * Calculate present value of a future lump sum
 * PV = FV / (1 + r)^n
 */
export function calculatePVOfLumpSum(
  futureValue: number,
  periodicRate: number,
  periods: number
): {
  presentValue: number;
  discountFactor: number;
  discountAmount: number;
  discountPercentage: number;
} {
  if (futureValue === 0) {
    return {
      presentValue: 0,
      discountFactor: 0,
      discountAmount: 0,
      discountPercentage: 0,
    };
  }

  const discountFactor = 1 / Math.pow(1 + periodicRate, periods);
  const presentValue = futureValue * discountFactor;
  const discountAmount = futureValue - presentValue;
  const discountPercentage = (discountAmount / futureValue) * 100;

  return {
    presentValue,
    discountFactor,
    discountAmount,
    discountPercentage,
  };
}

/**
 * Calculate present value of an ordinary annuity (payments at end of period)
 * PV = PMT × [(1 - (1 + r)^-n) / r]
 */
export function calculatePVOfOrdinaryAnnuity(
  payment: number,
  periodicRate: number,
  periods: number
): number {
  if (payment === 0 || periods === 0) {
    return 0;
  }

  // Special case: if rate is 0, PV = payment × periods
  if (periodicRate === 0) {
    return payment * periods;
  }

  const factor = (1 - Math.pow(1 + periodicRate, -periods)) / periodicRate;
  return payment * factor;
}

/**
 * Calculate present value of an annuity due (payments at beginning of period)
 * PV_due = PV_ordinary × (1 + r)
 */
export function calculatePVOfAnnuityDue(
  payment: number,
  periodicRate: number,
  periods: number
): number {
  const pvOrdinary = calculatePVOfOrdinaryAnnuity(
    payment,
    periodicRate,
    periods
  );

  // Special case: if rate is 0, no adjustment needed
  if (periodicRate === 0) {
    return pvOrdinary;
  }

  return pvOrdinary * (1 + periodicRate);
}

/**
 * Calculate present value of a growing annuity
 * PV = PMT × [(1 - ((1 + g) / (1 + r))^n) / (r - g)]
 * Special case when r = g: PV = PMT × n / (1 + r)
 *
 * Note: growthRate parameter should be passed as a decimal (not percentage)
 * e.g., for 3% growth, pass 0.03
 */
export function calculatePVOfGrowingAnnuity(
  initialPayment: number,
  periodicRate: number,
  growthRateDecimal: number, // Pass as decimal, not percentage
  periods: number,
  timing: PaymentTiming = 'end'
): number {
  if (initialPayment === 0 || periods === 0) {
    return 0;
  }

  const g = growthRateDecimal; // Already in decimal form

  // Special case: growth rate equals interest rate
  if (Math.abs(periodicRate - g) < 0.0000001) {
    const pv = (initialPayment * periods) / (1 + periodicRate);
    return timing === 'beginning' ? pv * (1 + periodicRate) : pv;
  }

  // Special case: zero growth rate (regular annuity)
  if (g === 0) {
    return timing === 'beginning'
      ? calculatePVOfAnnuityDue(initialPayment, periodicRate, periods)
      : calculatePVOfOrdinaryAnnuity(initialPayment, periodicRate, periods);
  }

  // Standard growing annuity formula
  const factor =
    (1 - Math.pow((1 + g) / (1 + periodicRate), periods)) / (periodicRate - g);
  const pv = initialPayment * factor;

  // Adjust for annuity due if needed
  return timing === 'beginning' ? pv * (1 + periodicRate) : pv;
}

/**
 * Calculate total future value of growing annuity payments
 */
export function calculateTotalFuturePayments(
  initialPayment: number,
  growthRate: number,
  periods: number
): number {
  const g = growthRate / 100;
  let total = 0;

  for (let i = 0; i < periods; i++) {
    total += initialPayment * Math.pow(1 + g, i);
  }

  return total;
}

/**
 * Generate period-by-period breakdown
 */
export function generatePeriodBreakdown(
  inputs: PVInputs,
  periodicRate: number
): PeriodDetail[] {
  const periods = inputs.periods;
  const payment = inputs.periodicPayment || 0;
  const growthRate = inputs.growthRate || 0;
  const g = growthRate / 100;
  const isGrowing = growthRate > 0;
  const timing = inputs.paymentTiming || 'end';

  const breakdown: PeriodDetail[] = [];
  let cumulativePV = 0;

  for (let period = 1; period <= periods; period++) {
    // Calculate payment for this period (may grow)
    const periodPayment = isGrowing
      ? payment * Math.pow(1 + g, period - 1)
      : payment;

    // Calculate discount factor for this period
    // For annuity due, adjust the period by -1 since payment is at start
    const effectivePeriod = timing === 'beginning' ? period - 1 : period;
    const discountFactor = 1 / Math.pow(1 + periodicRate, effectivePeriod);

    // Calculate PV of this period's payment
    const presentValue = periodPayment * discountFactor;
    cumulativePV += presentValue;

    breakdown.push({
      period,
      payment: periodPayment,
      presentValue,
      cumulativePV,
      discountFactor,
    });
  }

  return breakdown;
}

/**
 * Validate inputs and return error messages
 */
export function validatePVInputs(inputs: PVInputs): string[] {
  const errors: string[] = [];

  // Check that at least one value source is provided
  if (
    (!inputs.futureValue || inputs.futureValue === 0) &&
    (!inputs.periodicPayment || inputs.periodicPayment === 0)
  ) {
    errors.push(
      'Please enter either a future value or periodic payment (or both)'
    );
  }

  // Validate future value
  if (inputs.futureValue !== undefined && inputs.futureValue < 0) {
    errors.push('Future value must be non-negative');
  }

  // Validate periodic payment
  if (inputs.periodicPayment !== undefined && inputs.periodicPayment < 0) {
    errors.push('Periodic payment must be non-negative');
  }

  // Validate periods
  if (!inputs.periods || inputs.periods <= 0) {
    errors.push('Number of periods must be greater than zero');
  }

  // Validate interest rate
  if (inputs.interestRate === undefined || inputs.interestRate < 0) {
    errors.push('Interest rate must be non-negative');
  }

  // Validate growth rate
  if (inputs.growthRate !== undefined && inputs.growthRate < 0) {
    errors.push('Growth rate must be non-negative');
  }

  // Check if growth rate exceeds interest rate (problematic scenario)
  // Note: Equal rates are allowed as they're handled as a special case
  if (
    inputs.growthRate !== undefined &&
    inputs.growthRate > 0 &&
    inputs.periodicPayment &&
    inputs.periodicPayment > 0
  ) {
    const frequency = inputs.paymentFrequency || 'annual';
    const periodicRate = getPeriodicRate(inputs.interestRate, frequency);
    const periodicGrowthRate = getPeriodicRate(inputs.growthRate, frequency);

    // Only reject if growth rate is STRICTLY GREATER than interest rate
    if (periodicGrowthRate > periodicRate) {
      errors.push(
        'Growth rate must be less than or equal to the discount rate for a finite present value'
      );
    }
  }

  return errors;
}

/**
 * Main calculation function for present value
 */
export function calculatePVResults(inputs: PVInputs): PVResults {
  const frequency = inputs.paymentFrequency || 'annual';
  const periodicRate = getPeriodicRate(inputs.interestRate, frequency);
  const periodsPerYear = getPeriodsPerYear(frequency);
  const effectiveAnnualRate = calculateEffectiveAnnualRate(
    periodicRate,
    periodsPerYear
  );

  const futureValue = inputs.futureValue || 0;
  const periodicPayment = inputs.periodicPayment || 0;
  const periods = inputs.periods;
  const growthRate = inputs.growthRate || 0;
  const isGrowingAnnuity = growthRate > 0 && periodicPayment > 0;
  const paymentTiming = inputs.paymentTiming || 'end';

  // Calculate PV of lump sum
  const lumpSumResult = calculatePVOfLumpSum(
    futureValue,
    periodicRate,
    periods
  );

  // Calculate PV of annuity (if applicable)
  let pvOfAnnuity = 0;
  let totalPayments = 0;
  let totalFuturePayments = 0;

  if (periodicPayment > 0) {
    if (isGrowingAnnuity) {
      // Growing annuity
      const periodicGrowthRate = getPeriodicRate(growthRate, frequency);
      pvOfAnnuity = calculatePVOfGrowingAnnuity(
        periodicPayment,
        periodicRate,
        periodicGrowthRate, // Already in decimal form
        periods,
        paymentTiming
      );
      totalFuturePayments = calculateTotalFuturePayments(
        periodicPayment,
        periodicGrowthRate * 100, // Convert to percentage for this function
        periods
      );
      totalPayments = totalFuturePayments;
    } else {
      // Regular annuity
      if (paymentTiming === 'beginning') {
        pvOfAnnuity = calculatePVOfAnnuityDue(
          periodicPayment,
          periodicRate,
          periods
        );
      } else {
        pvOfAnnuity = calculatePVOfOrdinaryAnnuity(
          periodicPayment,
          periodicRate,
          periods
        );
      }
      totalPayments = periodicPayment * periods;
    }
  }

  const annuityDiscountAmount = totalPayments - pvOfAnnuity;

  // Calculate total present value
  const totalPresentValue = lumpSumResult.presentValue + pvOfAnnuity;

  // Generate period breakdown
  const periodBreakdown = generatePeriodBreakdown(inputs, periodicRate);

  // Calculate what the PV would grow to (for comparison)
  const futureValueComparison =
    totalPresentValue * Math.pow(1 + periodicRate, periods);

  return {
    // Main results
    totalPresentValue,
    pvOfLumpSum: lumpSumResult.presentValue,
    pvOfAnnuity,

    // Lump sum details
    futureValue,
    discountFactor: lumpSumResult.discountFactor,
    discountAmount: lumpSumResult.discountAmount,
    discountPercentage: lumpSumResult.discountPercentage,

    // Annuity details
    periodicPayment,
    numberOfPeriods: periods,
    totalPayments,
    annuityDiscountAmount,
    paymentTiming,

    // Rate information
    interestRate: inputs.interestRate,
    periodicRate: periodicRate * 100, // Convert to percentage
    effectiveAnnualRate,
    paymentFrequency: frequency,

    // Growing annuity
    isGrowingAnnuity,
    growthRate: isGrowingAnnuity ? growthRate : undefined,
    totalFuturePayments: isGrowingAnnuity ? totalFuturePayments : undefined,

    // Period breakdown
    periodBreakdown,

    // Comparison
    futureValueComparison,
  };
}

/**
 * Format currency with proper rounding
 */
export function formatCurrency(value: number): string {
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
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format period label based on frequency
 */
export function formatPeriodLabel(
  period: number,
  frequency: PaymentFrequency
): string {
  switch (frequency) {
    case 'annual':
      return `Year ${period}`;
    case 'semi-annual':
      return `Period ${period}`;
    case 'quarterly':
      return `Quarter ${period}`;
    case 'monthly':
      return `Month ${period}`;
    case 'weekly':
      return `Week ${period}`;
    case 'daily':
      return `Day ${period}`;
    default:
      return `Period ${period}`;
  }
}

/**
 * Get frequency display name
 */
export function getFrequencyDisplayName(frequency: PaymentFrequency): string {
  switch (frequency) {
    case 'annual':
      return 'Annual';
    case 'semi-annual':
      return 'Semi-Annual';
    case 'quarterly':
      return 'Quarterly';
    case 'monthly':
      return 'Monthly';
    case 'weekly':
      return 'Weekly';
    case 'daily':
      return 'Daily';
    default:
      return frequency;
  }
}
