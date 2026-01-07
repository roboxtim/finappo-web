/**
 * Future Value Calculator - Calculation Functions and Types
 *
 * This module provides comprehensive Future Value calculations including:
 * - FV of a lump sum (present value)
 * - FV of an ordinary annuity (end of period payments)
 * - FV of an annuity due (beginning of period payments)
 * - FV of a growing annuity
 * - Combined FV calculations
 * - Period-by-period breakdown
 */

// ============================================================================
// Types
// ============================================================================

export type PaymentTiming = 'end' | 'beginning';

export type PaymentFrequency =
  | 'annual'
  | 'semi-annual'
  | 'quarterly'
  | 'monthly'
  | 'weekly'
  | 'daily';

export interface FVInputs {
  presentValue?: number; // Starting lump sum (PV)
  periodicPayment?: number; // Regular payment amount (PMT)
  periods: number; // Number of periods (n)
  interestRate: number; // Annual interest rate as percentage (e.g., 6 for 6%)
  paymentFrequency: PaymentFrequency;
  paymentTiming?: PaymentTiming; // Only relevant if periodicPayment > 0
  growthRate?: number; // Annual growth rate as percentage (for growing annuity)
}

export interface FVResults {
  totalFutureValue: number;
  fvOfLumpSum: number;
  fvOfAnnuity: number;
  presentValue: number;
  periodicPayment: number;
  totalContributions: number; // PV + all payments
  totalInterest: number;
  interestRate: number;
  periodicRate: number;
  effectiveAnnualRate: number;
  numberOfPeriods: number;
  totalPayments: number; // Sum of all periodic payments
  paymentTiming: PaymentTiming;
  isGrowingAnnuity: boolean;
  growthRate?: number;
  totalFuturePayments?: number; // Sum of future payment values for growing annuity
  compoundFactor: number; // (1 + r)^n for lump sum
  periodBreakdown: FVPeriodBreakdown[];
}

export interface FVPeriodBreakdown {
  period: number;
  payment: number; // Payment made in this period
  beginningBalance: number;
  interest: number;
  endingBalance: number;
  contribution: number; // Cumulative contributions up to this period
  cumulativeInterest: number;
}

export interface LumpSumFVResult {
  futureValue: number;
  compoundFactor: number;
  interestEarned: number;
  totalGrowthPercentage: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the number of compounding periods per year for a given frequency
 */
export function getPeriodsPerYear(frequency: PaymentFrequency): number {
  const periods: Record<PaymentFrequency, number> = {
    annual: 1,
    'semi-annual': 2,
    quarterly: 4,
    monthly: 12,
    weekly: 52,
    daily: 365,
  };
  return periods[frequency];
}

/**
 * Convert annual interest rate to periodic rate
 * @param annualRate - Annual rate as percentage (e.g., 6 for 6%)
 * @param frequency - Payment frequency
 * @returns Periodic rate as decimal (e.g., 0.06 for 6%)
 */
export function getPeriodicRate(
  annualRate: number,
  frequency: PaymentFrequency
): number {
  const periodsPerYear = getPeriodsPerYear(frequency);
  return annualRate / periodsPerYear;
}

/**
 * Calculate Effective Annual Rate (EAR) from periodic rate
 * @param periodicRate - Rate per period as percentage
 * @param periodsPerYear - Number of periods in a year
 * @returns EAR as percentage
 */
export function calculateEffectiveAnnualRate(
  periodicRate: number,
  periodsPerYear: number
): number {
  return (Math.pow(1 + periodicRate / 100, periodsPerYear) - 1) * 100;
}

/**
 * Format period label based on frequency
 */
export function formatPeriodLabel(
  period: number,
  frequency: PaymentFrequency
): string {
  const labels: Record<PaymentFrequency, string> = {
    annual: `Year ${period}`,
    'semi-annual': `Period ${period}`,
    quarterly: `Quarter ${period}`,
    monthly: `Month ${period}`,
    weekly: `Week ${period}`,
    daily: `Day ${period}`,
  };
  return labels[frequency];
}

/**
 * Get display name for frequency
 */
export function getFrequencyDisplayName(frequency: PaymentFrequency): string {
  const names: Record<PaymentFrequency, string> = {
    annual: 'Annual',
    'semi-annual': 'Semi-Annual',
    quarterly: 'Quarterly',
    monthly: 'Monthly',
    weekly: 'Weekly',
    daily: 'Daily',
  };
  return names[frequency];
}

// ============================================================================
// FV Calculation Functions
// ============================================================================

/**
 * Calculate Future Value of a lump sum (present value)
 * Formula: FV = PV × (1 + r)^n
 *
 * @param presentValue - Initial lump sum amount
 * @param periodicRate - Interest rate per period as decimal (e.g., 0.06 for 6%)
 * @param periods - Number of compounding periods
 */
export function calculateFVOfLumpSum(
  presentValue: number,
  periodicRate: number,
  periods: number
): LumpSumFVResult {
  const compoundFactor = Math.pow(1 + periodicRate, periods);
  const futureValue = presentValue * compoundFactor;
  const interestEarned = futureValue - presentValue;
  const totalGrowthPercentage = (futureValue / presentValue - 1) * 100;

  return {
    futureValue,
    compoundFactor,
    interestEarned,
    totalGrowthPercentage,
  };
}

/**
 * Calculate Future Value of an ordinary annuity (payments at end of period)
 * Formula: FV = PMT × [((1 + r)^n - 1) / r]
 *
 * @param payment - Payment amount per period
 * @param periodicRate - Interest rate per period as decimal (e.g., 0.06 for 6%)
 * @param periods - Number of payment periods
 */
export function calculateFVOfOrdinaryAnnuity(
  payment: number,
  periodicRate: number,
  periods: number
): number {
  if (periodicRate === 0) {
    // No interest, FV is just sum of payments
    return payment * periods;
  }

  // FV = PMT × [((1 + r)^n - 1) / r]
  const fv =
    payment * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate);
  return fv;
}

/**
 * Calculate Future Value of an annuity due (payments at beginning of period)
 * Formula: FV = FV_ordinary × (1 + r)
 *
 * @param payment - Payment amount per period
 * @param periodicRate - Interest rate per period as decimal (e.g., 0.06 for 6%)
 * @param periods - Number of payment periods
 */
export function calculateFVOfAnnuityDue(
  payment: number,
  periodicRate: number,
  periods: number
): number {
  const fvOrdinary = calculateFVOfOrdinaryAnnuity(
    payment,
    periodicRate,
    periods
  );
  // Annuity due is worth more because each payment earns one extra period of interest
  return fvOrdinary * (1 + periodicRate);
}

/**
 * Calculate Future Value of a growing annuity
 * Formula: FV = PMT × [((1 + r)^n - (1 + g)^n) / (r - g)]
 * Special case when r = g: FV = PMT × n × (1 + r)^(n-1)
 *
 * @param payment - Initial payment amount
 * @param periodicRate - Interest rate per period as decimal
 * @param growthRate - Payment growth rate per period as decimal
 * @param periods - Number of payment periods
 * @param timing - Payment timing (beginning or end)
 */
export function calculateFVOfGrowingAnnuity(
  payment: number,
  periodicRate: number,
  growthRate: number,
  periods: number,
  timing: PaymentTiming = 'end'
): number {
  let fv: number;

  if (growthRate === periodicRate) {
    // Special case: when growth rate equals interest rate
    // FV = PMT × n × (1 + r)^(n-1)
    fv = payment * periods * Math.pow(1 + periodicRate, periods - 1);
  } else if (growthRate === 0) {
    // No growth, use regular annuity formula
    fv =
      timing === 'beginning'
        ? calculateFVOfAnnuityDue(payment, periodicRate, periods)
        : calculateFVOfOrdinaryAnnuity(payment, periodicRate, periods);
  } else {
    // Standard growing annuity formula
    // FV = PMT × [((1 + r)^n - (1 + g)^n) / (r - g)]
    const numerator =
      Math.pow(1 + periodicRate, periods) - Math.pow(1 + growthRate, periods);
    const denominator = periodicRate - growthRate;
    fv = payment * (numerator / denominator);

    // Adjust for annuity due (beginning of period)
    if (timing === 'beginning') {
      fv = fv * (1 + periodicRate);
    }
  }

  return fv;
}

/**
 * Generate period-by-period breakdown for FV calculation
 */
function generatePeriodBreakdown(
  presentValue: number,
  periodicPayment: number,
  periodicRate: number,
  periods: number,
  paymentTiming: PaymentTiming,
  growthRate: number
): FVPeriodBreakdown[] {
  const breakdown: FVPeriodBreakdown[] = [];
  let balance = presentValue;
  let cumulativeContributions = presentValue;
  let cumulativeInterest = 0;

  for (let i = 1; i <= periods; i++) {
    const beginningBalance = balance;

    // Determine payment for this period (considering growth)
    let payment = periodicPayment;
    if (growthRate > 0 && periodicPayment > 0) {
      // For growing annuity, payment grows each period
      // First payment is periodicPayment, then grows by (1 + g) each period
      payment = periodicPayment * Math.pow(1 + growthRate, i - 1);
    }

    let interest: number;
    let endingBalance: number;

    if (paymentTiming === 'beginning') {
      // Payment at beginning: add payment first, then calculate interest
      const balanceAfterPayment = beginningBalance + payment;
      interest = balanceAfterPayment * periodicRate;
      endingBalance = balanceAfterPayment + interest;
    } else {
      // Payment at end: calculate interest first, then add payment
      interest = beginningBalance * periodicRate;
      endingBalance = beginningBalance + interest + payment;
    }

    cumulativeContributions += payment;
    cumulativeInterest += interest;

    breakdown.push({
      period: i,
      payment,
      beginningBalance,
      interest,
      endingBalance,
      contribution: cumulativeContributions,
      cumulativeInterest,
    });

    balance = endingBalance;
  }

  return breakdown;
}

// ============================================================================
// Main Calculation Function
// ============================================================================

/**
 * Calculate complete Future Value results
 */
export function calculateFVResults(inputs: FVInputs): FVResults {
  const {
    presentValue = 0,
    periodicPayment = 0,
    periods,
    interestRate,
    paymentFrequency,
    paymentTiming = 'end',
    growthRate: growthRatePercent = 0,
  } = inputs;

  // Convert rates to decimals per period
  const periodicRatePercent = getPeriodicRate(interestRate, paymentFrequency);
  const periodicRate = periodicRatePercent / 100;
  const periodsPerYear = getPeriodsPerYear(paymentFrequency);

  // Convert growth rate to periodic rate
  const annualGrowthRate = growthRatePercent / 100;
  const periodicGrowthRate = annualGrowthRate / periodsPerYear;

  // Calculate FV of lump sum
  let fvOfLumpSum = 0;
  let compoundFactor = 1;
  if (presentValue > 0) {
    const lumpSumResult = calculateFVOfLumpSum(
      presentValue,
      periodicRate,
      periods
    );
    fvOfLumpSum = lumpSumResult.futureValue;
    compoundFactor = lumpSumResult.compoundFactor;
  }

  // Calculate FV of annuity
  let fvOfAnnuity = 0;
  let totalFuturePayments = 0;
  const isGrowingAnnuity = growthRatePercent > 0 && periodicPayment > 0;

  if (periodicPayment > 0) {
    if (isGrowingAnnuity) {
      // Growing annuity
      fvOfAnnuity = calculateFVOfGrowingAnnuity(
        periodicPayment,
        periodicRate,
        periodicGrowthRate,
        periods,
        paymentTiming
      );

      // Calculate sum of all future payment values
      for (let i = 0; i < periods; i++) {
        totalFuturePayments +=
          periodicPayment * Math.pow(1 + periodicGrowthRate, i);
      }
    } else {
      // Regular annuity (no growth)
      fvOfAnnuity =
        paymentTiming === 'beginning'
          ? calculateFVOfAnnuityDue(periodicPayment, periodicRate, periods)
          : calculateFVOfOrdinaryAnnuity(
              periodicPayment,
              periodicRate,
              periods
            );
    }
  }

  // Total future value
  const totalFutureValue = fvOfLumpSum + fvOfAnnuity;

  // Total contributions
  const totalPayments = isGrowingAnnuity
    ? totalFuturePayments
    : periodicPayment * periods;
  const totalContributions = presentValue + totalPayments;

  // Total interest earned
  const totalInterest = totalFutureValue - totalContributions;

  // Effective Annual Rate
  const effectiveAnnualRate = calculateEffectiveAnnualRate(
    periodicRatePercent,
    periodsPerYear
  );

  // Period breakdown
  const periodBreakdown = generatePeriodBreakdown(
    presentValue,
    periodicPayment,
    periodicRate,
    periods,
    paymentTiming,
    periodicGrowthRate
  );

  return {
    totalFutureValue,
    fvOfLumpSum,
    fvOfAnnuity,
    presentValue,
    periodicPayment,
    totalContributions,
    totalInterest,
    interestRate,
    periodicRate: periodicRatePercent,
    effectiveAnnualRate,
    numberOfPeriods: periods,
    totalPayments,
    paymentTiming,
    isGrowingAnnuity,
    growthRate: growthRatePercent,
    totalFuturePayments: isGrowingAnnuity ? totalFuturePayments : undefined,
    compoundFactor,
    periodBreakdown,
  };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate FV calculator inputs
 */
export function validateFVInputs(inputs: FVInputs): string[] {
  const errors: string[] = [];

  // Must have either present value or periodic payment
  if (
    (!inputs.presentValue || inputs.presentValue <= 0) &&
    (!inputs.periodicPayment || inputs.periodicPayment <= 0)
  ) {
    errors.push(
      'Please enter either a present value or periodic payment amount'
    );
  }

  // Validate present value if provided
  if (inputs.presentValue !== undefined && inputs.presentValue < 0) {
    errors.push('Present value must be non-negative');
  }

  // Validate periodic payment if provided
  if (inputs.periodicPayment !== undefined && inputs.periodicPayment < 0) {
    errors.push('Periodic payment must be non-negative');
  }

  // Validate periods
  if (!inputs.periods || inputs.periods <= 0) {
    errors.push('Number of periods must be greater than zero');
  }

  // Validate interest rate
  if (inputs.interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  }

  // Validate growth rate
  if (inputs.growthRate !== undefined) {
    if (inputs.growthRate < 0) {
      errors.push('Growth rate cannot be negative');
    }

    // Growth rate should typically be less than interest rate
    // (though mathematically it can be equal or greater)
    if (
      inputs.growthRate > inputs.interestRate &&
      inputs.growthRate - inputs.interestRate > 0.01
    ) {
      // Warning: growth rate exceeds interest rate (unusual but allowed)
      errors.push(
        'Growth rate exceeds interest rate. This is unusual but mathematically valid. Results may be very large.'
      );
    }
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
