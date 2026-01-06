/**
 * IRR (Internal Rate of Return) Calculator - Calculation Logic and Types
 *
 * This module implements IRR and MIRR calculations using iterative numerical methods.
 * IRR is the discount rate at which the net present value (NPV) of cash flows equals zero.
 *
 * Mathematical Formula:
 * 0 = Σ[CFt / (1 + IRR)^t] where t = 0 to n
 *
 * Implementation uses Newton-Raphson method for faster convergence
 * with fallback to bisection method for robustness.
 */

export interface CashFlow {
  period: number; // Time period (0 for initial investment, 1+ for subsequent flows)
  amount: number; // Cash flow amount (negative for outflows, positive for inflows)
  label?: string; // Optional label for the cash flow
}

export interface IRRInputs {
  cashFlows: CashFlow[]; // Array of cash flows
  financeRate?: number; // Finance rate for MIRR calculation (as percentage)
  reinvestmentRate?: number; // Reinvestment rate for MIRR calculation (as percentage)
}

export interface IRRResults {
  irr: number; // Internal Rate of Return (as percentage)
  mirr?: number; // Modified IRR (as percentage) if rates provided
  npv: number; // NPV at calculated IRR (should be ~0)
  npvAtZero: number; // NPV at 0% discount rate (sum of all cash flows)
  totalInvestment: number; // Sum of all negative cash flows
  totalReturns: number; // Sum of all positive cash flows
  profitLoss: number; // Total returns minus total investment
  paybackPeriod?: number; // Period when cumulative cash flow becomes positive
  cashFlowSchedule: CashFlowDetail[]; // Detailed schedule with calculations
}

export interface CashFlowDetail {
  period: number;
  amount: number;
  label?: string;
  discountedValue: number; // Present value at calculated IRR
  cumulativeCashFlow: number; // Running total of cash flows
  presentValueFactor: number; // (1 + IRR)^-period
}

/**
 * Calculate NPV for given cash flows and discount rate
 * NPV = Σ[CFt / (1 + r)^t]
 */
export function calculateNPV(
  cashFlows: CashFlow[],
  discountRate: number
): number {
  return cashFlows.reduce((npv, cf) => {
    const discountFactor = Math.pow(1 + discountRate, -cf.period);
    return npv + cf.amount * discountFactor;
  }, 0);
}

/**
 * Calculate NPV derivative with respect to discount rate
 * Used for Newton-Raphson method
 * dNPV/dr = -Σ[t * CFt / (1 + r)^(t+1)]
 */
function calculateNPVDerivative(
  cashFlows: CashFlow[],
  discountRate: number
): number {
  return cashFlows.reduce((derivative, cf) => {
    if (cf.period === 0) return derivative;
    const denominator = Math.pow(1 + discountRate, cf.period + 1);
    return derivative - (cf.period * cf.amount) / denominator;
  }, 0);
}

/**
 * Calculate IRR using Newton-Raphson method with bisection fallback
 * IRR is the rate where NPV = 0
 */
export function calculateIRR(cashFlows: CashFlow[]): number | null {
  // Check if cash flows have both positive and negative values
  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  const hasNegative = cashFlows.some((cf) => cf.amount < 0);

  if (!hasPositive || !hasNegative) {
    return null; // IRR doesn't exist if all cash flows have same sign
  }

  // Sort cash flows by period
  const sortedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period);

  // Initial guess using simple approximation
  const totalInvestment = Math.abs(
    sortedCashFlows
      .filter((cf) => cf.amount < 0)
      .reduce((sum, cf) => sum + cf.amount, 0)
  );
  const totalReturns = sortedCashFlows
    .filter((cf) => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0);

  // Initial IRR guess based on simple return
  let irr =
    (totalReturns - totalInvestment) /
    totalInvestment /
    (sortedCashFlows[sortedCashFlows.length - 1].period || 1);

  // Bounds for bisection method fallback
  let lowerBound = -0.99;
  let upperBound = 10;

  // Find bounds that bracket the solution
  const npvLower = calculateNPV(sortedCashFlows, lowerBound);
  const npvUpper = calculateNPV(sortedCashFlows, upperBound);

  if (npvLower * npvUpper > 0) {
    // Try to expand bounds
    if (Math.abs(npvLower) < Math.abs(npvUpper)) {
      lowerBound = -0.999;
    } else {
      upperBound = 100;
    }
  }

  const maxIterations = 100;
  const tolerance = 1e-7;
  let useNewtonRaphson = true;

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(sortedCashFlows, irr);

    // Check convergence
    if (Math.abs(npv) < tolerance) {
      return irr * 100; // Convert to percentage
    }

    if (useNewtonRaphson) {
      // Newton-Raphson method
      const npvDerivative = calculateNPVDerivative(sortedCashFlows, irr);

      if (Math.abs(npvDerivative) < tolerance) {
        // Derivative too small, switch to bisection
        useNewtonRaphson = false;
        continue;
      }

      const newIrr = irr - npv / npvDerivative;

      // Check if Newton-Raphson is converging properly
      if (newIrr < lowerBound || newIrr > upperBound || !isFinite(newIrr)) {
        useNewtonRaphson = false;
        continue;
      }

      irr = newIrr;
    } else {
      // Bisection method fallback
      const midPoint = (lowerBound + upperBound) / 2;
      const npvMid = calculateNPV(sortedCashFlows, midPoint);

      if (Math.abs(npvMid) < tolerance) {
        return midPoint * 100;
      }

      const npvLower = calculateNPV(sortedCashFlows, lowerBound);

      if (npvLower * npvMid < 0) {
        upperBound = midPoint;
      } else {
        lowerBound = midPoint;
      }

      irr = midPoint;
    }
  }

  // Return best estimate if didn't converge
  return irr * 100;
}

/**
 * Calculate Modified IRR (MIRR)
 * MIRR addresses some limitations of IRR by using different rates for
 * borrowing (finance rate) and reinvestment
 *
 * Formula:
 * MIRR = [(FV of positive cash flows / PV of negative cash flows)^(1/n)] - 1
 */
export function calculateMIRR(
  cashFlows: CashFlow[],
  financeRate: number,
  reinvestmentRate: number
): number | null {
  const sortedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period);
  const n = Math.max(...sortedCashFlows.map((cf) => cf.period));

  if (n === 0) return null;

  const financeRateDecimal = financeRate / 100;
  const reinvestmentRateDecimal = reinvestmentRate / 100;

  // Calculate PV of negative cash flows (investments)
  const pvNegative = sortedCashFlows
    .filter((cf) => cf.amount < 0)
    .reduce((pv, cf) => {
      const discountFactor = Math.pow(1 + financeRateDecimal, -cf.period);
      return pv + Math.abs(cf.amount) * discountFactor;
    }, 0);

  // Calculate FV of positive cash flows (returns)
  const fvPositive = sortedCashFlows
    .filter((cf) => cf.amount > 0)
    .reduce((fv, cf) => {
      const compoundFactor = Math.pow(
        1 + reinvestmentRateDecimal,
        n - cf.period
      );
      return fv + cf.amount * compoundFactor;
    }, 0);

  if (pvNegative === 0) return null;

  const mirr = Math.pow(fvPositive / pvNegative, 1 / n) - 1;
  return mirr * 100; // Convert to percentage
}

/**
 * Calculate payback period
 * The period when cumulative cash flow becomes positive
 */
export function calculatePaybackPeriod(
  cashFlows: CashFlow[]
): number | undefined {
  const sortedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period);
  let cumulative = 0;

  for (const cf of sortedCashFlows) {
    cumulative += cf.amount;
    if (cumulative >= 0) {
      // Linear interpolation for fractional period
      const previousCumulative = cumulative - cf.amount;
      if (cf.amount !== 0 && previousCumulative < 0) {
        const fraction = Math.abs(previousCumulative) / cf.amount;
        return cf.period - (1 - fraction);
      }
      return cf.period;
    }
  }

  return undefined; // Payback period exceeds cash flow timeline
}

/**
 * Main calculation function for IRR
 */
export function calculateIRRResults(inputs: IRRInputs): IRRResults {
  const { cashFlows, financeRate, reinvestmentRate } = inputs;

  // Sort cash flows by period
  const sortedCashFlows = [...cashFlows].sort((a, b) => a.period - b.period);

  // Calculate IRR
  const irrDecimal = calculateIRR(sortedCashFlows);
  const irr = irrDecimal !== null ? irrDecimal : 0;

  // Calculate MIRR if rates provided
  let mirr: number | undefined;
  if (financeRate !== undefined && reinvestmentRate !== undefined) {
    const mirrResult = calculateMIRR(
      sortedCashFlows,
      financeRate,
      reinvestmentRate
    );
    mirr = mirrResult !== null ? mirrResult : undefined;
  }

  // Calculate NPV at IRR (should be ~0)
  const npv =
    irrDecimal !== null ? calculateNPV(sortedCashFlows, irrDecimal / 100) : 0;

  // Calculate NPV at 0% (sum of all cash flows)
  const npvAtZero = sortedCashFlows.reduce((sum, cf) => sum + cf.amount, 0);

  // Calculate totals
  const totalInvestment = Math.abs(
    sortedCashFlows
      .filter((cf) => cf.amount < 0)
      .reduce((sum, cf) => sum + cf.amount, 0)
  );

  const totalReturns = sortedCashFlows
    .filter((cf) => cf.amount > 0)
    .reduce((sum, cf) => sum + cf.amount, 0);

  const profitLoss = totalReturns - totalInvestment;

  // Calculate payback period
  const paybackPeriod = calculatePaybackPeriod(sortedCashFlows);

  // Build detailed cash flow schedule
  let cumulativeCashFlow = 0;
  const cashFlowSchedule: CashFlowDetail[] = sortedCashFlows.map((cf) => {
    cumulativeCashFlow += cf.amount;
    const presentValueFactor =
      irrDecimal !== null ? Math.pow(1 + irrDecimal / 100, -cf.period) : 1;
    const discountedValue = cf.amount * presentValueFactor;

    return {
      period: cf.period,
      amount: cf.amount,
      label: cf.label,
      discountedValue,
      cumulativeCashFlow,
      presentValueFactor,
    };
  });

  return {
    irr,
    mirr,
    npv,
    npvAtZero,
    totalInvestment,
    totalReturns,
    profitLoss,
    paybackPeriod,
    cashFlowSchedule,
  };
}

/**
 * Validate IRR inputs
 */
export function validateIRRInputs(inputs: Partial<IRRInputs>): string[] {
  const errors: string[] = [];

  if (!inputs.cashFlows || inputs.cashFlows.length < 2) {
    errors.push('At least two cash flows are required');
  }

  if (inputs.cashFlows) {
    const hasPositive = inputs.cashFlows.some((cf) => cf.amount > 0);
    const hasNegative = inputs.cashFlows.some((cf) => cf.amount < 0);

    if (!hasPositive) {
      errors.push('At least one positive cash flow (return) is required');
    }

    if (!hasNegative) {
      errors.push('At least one negative cash flow (investment) is required');
    }

    // Check for duplicate periods
    const periods = inputs.cashFlows.map((cf) => cf.period);
    const uniquePeriods = new Set(periods);
    if (periods.length !== uniquePeriods.size) {
      errors.push('Each period must be unique');
    }
  }

  if (inputs.financeRate !== undefined) {
    if (inputs.financeRate < -100 || inputs.financeRate > 100) {
      errors.push('Finance rate must be between -100% and 100%');
    }
  }

  if (inputs.reinvestmentRate !== undefined) {
    if (inputs.reinvestmentRate < -100 || inputs.reinvestmentRate > 100) {
      errors.push('Reinvestment rate must be between -100% and 100%');
    }
  }

  return errors;
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 3): string {
  if (!isFinite(value)) return 'N/A';
  return value.toFixed(decimals) + '%';
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
