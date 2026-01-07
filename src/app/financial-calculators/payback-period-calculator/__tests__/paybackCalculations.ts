/**
 * Payback Period Calculator - Core Calculation Logic
 *
 * This module implements payback period calculations including:
 * - Simple (undiscounted) payback period
 * - Discounted payback period
 * - Cumulative cash flow tracking
 * - ROI and NPV calculations for comparison
 *
 * Formulas:
 * - Simple Payback Period = Initial Investment / Average Annual Cash Flow (for even flows)
 * - For uneven flows: Period when cumulative cash flow turns positive
 * - Discounted Payback = Same but using Present Value: PV = CF / (1 + r)^t
 * - NPV = Σ[CFt / (1 + r)^t] - Initial Investment
 * - ROI = (Total Returns - Initial Investment) / Initial Investment * 100
 */

export type PeriodType = 'annual' | 'monthly';

export interface CashFlow {
  period: number;
  amount: number;
  label?: string;
}

export interface CashFlowWithCumulative extends CashFlow {
  cumulativeCashFlow: number;
  discountedValue: number;
  discountedCumulativeCashFlow: number;
}

export interface PaybackInputs {
  initialInvestment: number;
  cashFlows: CashFlow[];
  discountRate: number; // Percentage (0-100)
  periodType?: PeriodType;
}

export interface PaybackResults {
  // Simple Payback
  simplePaybackPeriod: number | null; // In periods (years or months)
  simplePaybackYears: number | null;
  simplePaybackMonths: number | null;
  paysBack: boolean;

  // Discounted Payback
  discountedPaybackPeriod: number | null;
  discountedPaybackYears: number | null;
  discountedPaybackMonths: number | null;
  discountedPaysBack: boolean;

  // Financial Metrics
  totalCashInflows: number;
  profitAfterPayback: number;
  roi: number;
  npv: number;

  // Cash Flow Schedule
  cashFlowSchedule: CashFlowWithCumulative[];

  // Metadata
  periodType: PeriodType;
  discountRate: number;
  initialInvestment: number;
}

/**
 * Calculate simple payback period (undiscounted)
 * Returns the period when cumulative cash flows equal initial investment
 */
export function calculateSimplePayback(
  cashFlows: CashFlow[],
  initialInvestment: number
): number | null {
  let cumulativeCashFlow = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    const previousCumulative = cumulativeCashFlow;
    cumulativeCashFlow += cashFlows[i].amount;

    if (cumulativeCashFlow >= initialInvestment) {
      // Calculate fractional period
      const remainingAmount = initialInvestment - previousCumulative;
      const periodFraction = remainingAmount / cashFlows[i].amount;
      return cashFlows[i].period - 1 + periodFraction;
    }
  }

  // Never pays back
  return null;
}

/**
 * Calculate discounted payback period
 * Uses present value of cash flows: PV = CF / (1 + r)^t
 */
export function calculateDiscountedPayback(
  cashFlows: CashFlow[],
  initialInvestment: number,
  discountRate: number // As percentage
): number | null {
  const rate = discountRate / 100;
  let cumulativePV = 0;

  for (let i = 0; i < cashFlows.length; i++) {
    const previousCumulative = cumulativePV;
    const presentValue =
      cashFlows[i].amount / Math.pow(1 + rate, cashFlows[i].period);
    cumulativePV += presentValue;

    if (cumulativePV >= initialInvestment) {
      // Calculate fractional period
      const remainingAmount = initialInvestment - previousCumulative;
      const currentPV = presentValue;
      const periodFraction = remainingAmount / currentPV;
      return cashFlows[i].period - 1 + periodFraction;
    }
  }

  // Never pays back with discounting
  return null;
}

/**
 * Calculate cumulative cash flows (both simple and discounted)
 */
export function calculateCumulativeCashFlows(
  cashFlows: CashFlow[],
  initialInvestment: number,
  discountRate: number
): CashFlowWithCumulative[] {
  const rate = discountRate / 100;
  let cumulativeCashFlow = 0;
  let cumulativeDiscountedCashFlow = 0;

  return cashFlows.map((cf) => {
    // Simple cumulative
    cumulativeCashFlow += cf.amount;

    // Discounted value
    const discountedValue = cf.amount / Math.pow(1 + rate, cf.period);
    cumulativeDiscountedCashFlow += discountedValue;

    return {
      ...cf,
      cumulativeCashFlow: cumulativeCashFlow - initialInvestment,
      discountedValue,
      discountedCumulativeCashFlow:
        cumulativeDiscountedCashFlow - initialInvestment,
    };
  });
}

/**
 * Convert period to years and months
 */
export function convertToYearsAndMonths(
  periods: number,
  periodType: PeriodType
): { years: number; months: number } {
  if (periodType === 'monthly') {
    const years = Math.floor(periods / 12);
    const months = Math.round(periods % 12);
    return { years, months };
  } else {
    // Annual
    const years = Math.floor(periods);
    const months = Math.round((periods - years) * 12);
    return { years, months };
  }
}

/**
 * Calculate ROI (Return on Investment)
 * ROI = (Total Returns - Initial Investment) / Initial Investment * 100
 */
export function calculateROI(
  initialInvestment: number,
  totalReturns: number
): number {
  return ((totalReturns - initialInvestment) / initialInvestment) * 100;
}

/**
 * Calculate NPV (Net Present Value)
 * NPV = Σ[CFt / (1 + r)^t] - Initial Investment
 */
export function calculateNPV(
  cashFlows: CashFlow[],
  initialInvestment: number,
  discountRate: number
): number {
  const rate = discountRate / 100;

  const presentValueOfCashFlows = cashFlows.reduce((sum, cf) => {
    const pv = cf.amount / Math.pow(1 + rate, cf.period);
    return sum + pv;
  }, 0);

  return presentValueOfCashFlows - initialInvestment;
}

/**
 * Main calculation function that returns complete results
 */
export function calculatePaybackResults(inputs: PaybackInputs): PaybackResults {
  const {
    initialInvestment,
    cashFlows,
    discountRate,
    periodType = 'annual',
  } = inputs;

  // Calculate simple payback period
  const simplePaybackPeriod = calculateSimplePayback(
    cashFlows,
    initialInvestment
  );

  const paysBack = simplePaybackPeriod !== null;

  let simplePaybackYears: number | null = null;
  let simplePaybackMonths: number | null = null;

  if (simplePaybackPeriod !== null) {
    const { years, months } = convertToYearsAndMonths(
      simplePaybackPeriod,
      periodType
    );
    simplePaybackYears = years;
    simplePaybackMonths = months;
  }

  // Calculate discounted payback period
  const discountedPaybackPeriod = calculateDiscountedPayback(
    cashFlows,
    initialInvestment,
    discountRate
  );

  const discountedPaysBack = discountedPaybackPeriod !== null;

  let discountedPaybackYears: number | null = null;
  let discountedPaybackMonths: number | null = null;

  if (discountedPaybackPeriod !== null) {
    const { years, months } = convertToYearsAndMonths(
      discountedPaybackPeriod,
      periodType
    );
    discountedPaybackYears = years;
    discountedPaybackMonths = months;
  }

  // Calculate cumulative cash flows
  const cashFlowSchedule = calculateCumulativeCashFlows(
    cashFlows,
    initialInvestment,
    discountRate
  );

  // Calculate total cash inflows
  const totalCashInflows = cashFlows.reduce((sum, cf) => sum + cf.amount, 0);

  // Calculate profit after payback
  const profitAfterPayback = totalCashInflows - initialInvestment;

  // Calculate ROI
  const roi = calculateROI(initialInvestment, totalCashInflows);

  // Calculate NPV
  const npv = calculateNPV(cashFlows, initialInvestment, discountRate);

  return {
    simplePaybackPeriod,
    simplePaybackYears,
    simplePaybackMonths,
    paysBack,
    discountedPaybackPeriod,
    discountedPaybackYears,
    discountedPaybackMonths,
    discountedPaysBack,
    totalCashInflows,
    profitAfterPayback,
    roi,
    npv,
    cashFlowSchedule,
    periodType,
    discountRate,
    initialInvestment,
  };
}

/**
 * Validate payback period inputs
 */
export function validatePaybackInputs(inputs: PaybackInputs): string[] {
  const errors: string[] = [];

  // Validate initial investment
  if (
    !inputs.initialInvestment ||
    inputs.initialInvestment <= 0 ||
    isNaN(inputs.initialInvestment)
  ) {
    errors.push('Initial investment must be greater than zero');
  }

  // Validate cash flows
  if (!inputs.cashFlows || inputs.cashFlows.length === 0) {
    errors.push('At least one cash flow period is required');
  } else {
    // Check for negative cash flows
    const hasNegativeCashFlow = inputs.cashFlows.some(
      (cf) => cf.amount < 0 || isNaN(cf.amount)
    );
    if (hasNegativeCashFlow) {
      errors.push('All cash flows must be greater than or equal to zero');
    }

    // Check for duplicate periods
    const periods = inputs.cashFlows.map((cf) => cf.period);
    const uniquePeriods = new Set(periods);
    if (periods.length !== uniquePeriods.size) {
      errors.push('Each period must be unique');
    }

    // Check for valid periods
    const hasInvalidPeriod = inputs.cashFlows.some(
      (cf) => cf.period < 1 || !Number.isInteger(cf.period)
    );
    if (hasInvalidPeriod) {
      errors.push('All periods must be positive integers starting from 1');
    }
  }

  // Validate discount rate
  if (
    inputs.discountRate < 0 ||
    inputs.discountRate > 100 ||
    isNaN(inputs.discountRate)
  ) {
    errors.push('Discount rate must be between 0 and 100');
  }

  return errors;
}

/**
 * Format currency for display
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
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format period for display
 */
export function formatPeriod(
  years: number | null,
  months: number | null
): string {
  if (years === null && months === null) {
    return 'Never';
  }

  const parts: string[] = [];

  if (years && years > 0) {
    parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  }

  if (months && months > 0) {
    parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(' ') : '0 months';
}
