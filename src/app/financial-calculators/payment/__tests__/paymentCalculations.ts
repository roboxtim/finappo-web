/**
 * Payment Calculator Logic
 *
 * This calculator computes loan payments using the standard annuity formula
 * with support for different compounding frequencies and payment types.
 *
 * Formula: PMT = [PV * r * (1 + r)^n] / [(1 + r)^n - 1] - FV * [r / ((1 + r)^n - 1)]
 *
 * Where:
 * - PMT = Payment amount per period
 * - PV = Present Value (loan amount)
 * - FV = Future Value (balloon payment)
 * - r = Interest rate per payment period
 * - n = Total number of payment periods
 */

export type CompoundingFrequency =
  | 'monthly'
  | 'quarterly'
  | 'semi-annually'
  | 'annually';

export type PaymentType = 'end' | 'beginning';

export interface PaymentInputs {
  presentValue: number; // Loan amount
  futureValue: number; // Balloon payment (default 0)
  annualInterestRate: number; // Annual interest rate as percentage (e.g., 6 for 6%)
  numberOfPeriods: number; // Total payment periods
  compounding: CompoundingFrequency;
  paymentType: PaymentType; // 'end' = end of period, 'beginning' = beginning of period
}

export interface PaymentScheduleRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface PaymentResult {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
  schedule: PaymentScheduleRow[];
}

/**
 * Get the number of compounding periods per year
 */
export function getCompoundingPeriodsPerYear(compounding: CompoundingFrequency): number {
  switch (compounding) {
    case 'annually':
      return 1;
    case 'semi-annually':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
  }
}

/**
 * Calculate the effective interest rate per payment period
 * This handles the case where compounding frequency differs from payment frequency
 */
function calculateEffectiveRate(
  annualRate: number,
  compounding: CompoundingFrequency,
  paymentsPerYear: number = 12 // Default to monthly payments
): number {
  const compoundingPeriodsPerYear = getCompoundingPeriodsPerYear(compounding);
  const ratePerCompoundPeriod = annualRate / compoundingPeriodsPerYear;

  // Convert compounding rate to effective rate per payment period
  const compoundPeriodsPerPayment = compoundingPeriodsPerYear / paymentsPerYear;
  const effectiveRate = Math.pow(1 + ratePerCompoundPeriod, compoundPeriodsPerPayment) - 1;

  return effectiveRate;
}

/**
 * Calculate the payment amount using the annuity formula
 */
export function calculatePayment(inputs: PaymentInputs): number {
  const { presentValue, futureValue, annualInterestRate, numberOfPeriods, compounding, paymentType } = inputs;

  // Handle zero interest rate case
  if (annualInterestRate === 0) {
    return (presentValue - futureValue) / numberOfPeriods;
  }

  // Convert annual rate to decimal
  const annualRateDecimal = annualInterestRate / 100;

  // Calculate effective rate per payment period
  const r = calculateEffectiveRate(annualRateDecimal, compounding, 12);

  // Calculate payment using the annuity formula
  const pvFactor = (r * Math.pow(1 + r, numberOfPeriods)) / (Math.pow(1 + r, numberOfPeriods) - 1);
  const fvFactor = r / (Math.pow(1 + r, numberOfPeriods) - 1);

  let payment = presentValue * pvFactor - futureValue * fvFactor;

  // Adjust for payment at beginning of period
  if (paymentType === 'beginning') {
    payment = payment / (1 + r);
  }

  return payment;
}

/**
 * Calculate the complete payment schedule with amortization
 */
export function calculatePaymentSchedule(inputs: PaymentInputs): PaymentResult {
  const { presentValue, futureValue, annualInterestRate, numberOfPeriods, compounding, paymentType } = inputs;

  const payment = calculatePayment(inputs);
  const annualRateDecimal = annualInterestRate / 100;
  const r = calculateEffectiveRate(annualRateDecimal, compounding, 12);

  const schedule: PaymentScheduleRow[] = [];
  let balance = presentValue;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let period = 1; period <= numberOfPeriods; period++) {
    let interestPayment: number;
    let principalPayment: number;

    if (paymentType === 'beginning') {
      // For beginning of period payments, principal is paid first, then interest accrues
      principalPayment = payment - balance * r;
      balance -= principalPayment;
      interestPayment = balance * r;
    } else {
      // For end of period payments, interest accrues first
      interestPayment = balance * r;
      principalPayment = payment - interestPayment;
      balance -= principalPayment;
    }

    // Handle the last payment which might need adjustment for balloon payment
    if (period === numberOfPeriods && futureValue > 0) {
      // Adjust for balloon payment in final period
      principalPayment = payment - interestPayment;
      balance = futureValue;
    }

    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    schedule.push({
      period,
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  const totalPayments = payment * numberOfPeriods;
  const totalInterest = cumulativeInterest;

  return {
    monthlyPayment: payment,
    totalPayments,
    totalInterest,
    totalPrincipal: presentValue - futureValue,
    schedule,
  };
}
