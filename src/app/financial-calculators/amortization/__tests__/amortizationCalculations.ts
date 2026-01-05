/**
 * Amortization Calculation Library
 * Supports various compound periods and payment frequencies
 * Based on standard amortization formulas matching calculator.net methodology
 */

export type CompoundPeriod =
  | 'monthly'
  | 'semi-monthly'
  | 'bi-weekly'
  | 'weekly'
  | 'daily'
  | 'continuously'
  | 'semi-annually'
  | 'quarterly'
  | 'annually';

export type PaymentFrequency =
  | 'monthly'
  | 'semi-monthly'
  | 'bi-weekly'
  | 'weekly'
  | 'daily'
  | 'semi-annually'
  | 'quarterly'
  | 'annually';

export interface AmortizationInputs {
  loanAmount: number;
  loanTermYears: number;
  loanTermMonths: number;
  interestRate: number; // annual percentage
  compoundPeriod: CompoundPeriod;
  paymentFrequency: PaymentFrequency;
  startDate?: Date;
}

export interface ExtraPayments {
  monthlyExtra: number;
  monthlyExtraStartMonth: number;
  yearlyExtra: number;
  yearlyExtraStartMonth: number;
  oneTimePayments: Array<{
    amount: number;
    month: number;
  }>;
}

export interface AmortizationRow {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface AmortizationResults {
  loanAmount: number;
  regularPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
  payoffDate: Date;
  amortizationSchedule: AmortizationRow[];
  effectiveRate: number;
}

/**
 * Get the number of compound periods per year
 */
export function getCompoundPeriodsPerYear(period: CompoundPeriod): number {
  switch (period) {
    case 'annually':
      return 1;
    case 'semi-annually':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
    case 'semi-monthly':
      return 24;
    case 'bi-weekly':
      return 26;
    case 'weekly':
      return 52;
    case 'daily':
      return 365;
    case 'continuously':
      return Infinity;
    default:
      return 12;
  }
}

/**
 * Get the number of payment periods per year
 */
export function getPaymentPeriodsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'annually':
      return 1;
    case 'semi-annually':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
    case 'semi-monthly':
      return 24;
    case 'bi-weekly':
      return 26;
    case 'weekly':
      return 52;
    case 'daily':
      return 365;
    default:
      return 12;
  }
}

/**
 * Calculate the effective interest rate per payment period
 * This is the key to handling different compound periods and payment frequencies
 */
export function calculateEffectiveRate(
  annualRate: number,
  compoundPeriod: CompoundPeriod,
  paymentFrequency: PaymentFrequency
): number {
  const r = annualRate / 100;
  const c = getCompoundPeriodsPerYear(compoundPeriod);
  const p = getPaymentPeriodsPerYear(paymentFrequency);

  if (compoundPeriod === 'continuously') {
    // For continuous compounding: i = e^(r/p) - 1
    return Math.exp(r / p) - 1;
  } else {
    // For periodic compounding: i = (1 + r/c)^(c/p) - 1
    return Math.pow(1 + r / c, c / p) - 1;
  }
}

/**
 * Calculate total number of payments
 */
export function getTotalPayments(
  termYears: number,
  termMonths: number,
  paymentFrequency: PaymentFrequency
): number {
  const totalMonths = termYears * 12 + termMonths;
  const paymentsPerYear = getPaymentPeriodsPerYear(paymentFrequency);
  return Math.round((totalMonths / 12) * paymentsPerYear);
}

/**
 * Calculate regular payment amount using the amortization formula
 * P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 * where:
 * P = payment amount
 * L = loan amount
 * c = effective interest rate per payment period
 * n = total number of payments
 */
export function calculateRegularPayment(
  loanAmount: number,
  effectiveRate: number,
  totalPayments: number
): number {
  if (loanAmount <= 0 || totalPayments <= 0) return 0;
  if (effectiveRate === 0) return loanAmount / totalPayments;

  const payment =
    (loanAmount * (effectiveRate * Math.pow(1 + effectiveRate, totalPayments))) /
    (Math.pow(1 + effectiveRate, totalPayments) - 1);

  return payment;
}

/**
 * Calculate the date for a given payment number
 */
export function calculatePaymentDate(
  startDate: Date,
  paymentNumber: number,
  paymentFrequency: PaymentFrequency
): Date {
  const date = new Date(startDate);

  switch (paymentFrequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + paymentNumber);
      break;
    case 'semi-monthly':
      // Payments on 1st and 15th of each month
      const semiMonthlyMonths = Math.floor(paymentNumber / 2);
      const isSecondPayment = paymentNumber % 2 === 1;
      date.setMonth(date.getMonth() + semiMonthlyMonths);
      if (isSecondPayment) {
        date.setDate(15);
      } else {
        date.setDate(1);
      }
      break;
    case 'bi-weekly':
      // Every 2 weeks
      date.setDate(date.getDate() + paymentNumber * 14);
      break;
    case 'weekly':
      date.setDate(date.getDate() + paymentNumber * 7);
      break;
    case 'daily':
      date.setDate(date.getDate() + paymentNumber);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + paymentNumber * 3);
      break;
    case 'semi-annually':
      date.setMonth(date.getMonth() + paymentNumber * 6);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + paymentNumber);
      break;
  }

  return date;
}

/**
 * Generate complete amortization schedule
 */
export function generateAmortizationSchedule(
  inputs: AmortizationInputs,
  extraPayments?: ExtraPayments
): AmortizationRow[] {
  const effectiveRate = calculateEffectiveRate(
    inputs.interestRate,
    inputs.compoundPeriod,
    inputs.paymentFrequency
  );

  const totalPayments = getTotalPayments(
    inputs.loanTermYears,
    inputs.loanTermMonths,
    inputs.paymentFrequency
  );

  const regularPayment = calculateRegularPayment(
    inputs.loanAmount,
    effectiveRate,
    totalPayments
  );

  const schedule: AmortizationRow[] = [];
  let remainingBalance = inputs.loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  const startDate = inputs.startDate || new Date(2026, 0, 1);

  for (let paymentNum = 1; paymentNum <= totalPayments; paymentNum++) {
    if (remainingBalance <= 0.01) break; // Stop if essentially paid off

    // Calculate interest for this period
    const interestPayment = remainingBalance * effectiveRate;

    // Calculate principal payment
    let principalPayment = regularPayment - interestPayment;

    // Calculate extra payment for this period
    let extraPayment = 0;

    if (extraPayments) {
      // Convert payment number to equivalent month for extra payment logic
      const equivalentMonth = Math.ceil(
        (paymentNum / getPaymentPeriodsPerYear(inputs.paymentFrequency)) * 12
      );

      // Monthly extra payment
      if (
        extraPayments.monthlyExtra > 0 &&
        equivalentMonth >= extraPayments.monthlyExtraStartMonth
      ) {
        // Prorate based on payment frequency
        const paymentsPerMonth = getPaymentPeriodsPerYear(inputs.paymentFrequency) / 12;
        extraPayment += extraPayments.monthlyExtra / paymentsPerMonth;
      }

      // Yearly extra payment
      if (
        extraPayments.yearlyExtra > 0 &&
        equivalentMonth >= extraPayments.yearlyExtraStartMonth &&
        (equivalentMonth - extraPayments.yearlyExtraStartMonth) % 12 === 0
      ) {
        extraPayment += extraPayments.yearlyExtra;
      }

      // One-time payments
      const oneTimePayment = extraPayments.oneTimePayments.find(
        (p) => p.month === equivalentMonth
      );
      if (oneTimePayment) {
        extraPayment += oneTimePayment.amount;
      }
    }

    // Ensure we don't overpay
    const totalPaymentThisMonth = principalPayment + extraPayment;
    if (totalPaymentThisMonth > remainingBalance) {
      principalPayment = remainingBalance;
      extraPayment = 0;
    } else if (
      extraPayment > 0 &&
      principalPayment + extraPayment > remainingBalance
    ) {
      extraPayment = remainingBalance - principalPayment;
    }

    // Update balance
    remainingBalance -= principalPayment + extraPayment;
    remainingBalance = Math.max(0, remainingBalance);

    // Update cumulative values
    cumulativePrincipal += principalPayment + extraPayment;
    cumulativeInterest += interestPayment;

    // Calculate date for this payment
    const paymentDate = calculatePaymentDate(
      startDate,
      paymentNum - 1,
      inputs.paymentFrequency
    );

    schedule.push({
      paymentNumber: paymentNum,
      date: paymentDate,
      payment: regularPayment,
      principal: principalPayment,
      interest: interestPayment,
      extraPayment,
      balance: remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });

    // Stop if loan is paid off
    if (remainingBalance <= 0.01) break;
  }

  return schedule;
}

/**
 * Calculate complete amortization results
 */
export function calculateAmortization(
  inputs: AmortizationInputs,
  extraPayments?: ExtraPayments
): AmortizationResults {
  const effectiveRate = calculateEffectiveRate(
    inputs.interestRate,
    inputs.compoundPeriod,
    inputs.paymentFrequency
  );

  const totalPayments = getTotalPayments(
    inputs.loanTermYears,
    inputs.loanTermMonths,
    inputs.paymentFrequency
  );

  const regularPayment = calculateRegularPayment(
    inputs.loanAmount,
    effectiveRate,
    totalPayments
  );

  const schedule = generateAmortizationSchedule(inputs, extraPayments);

  // Calculate totals
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPrincipal = schedule.reduce(
    (sum, row) => sum + row.principal + row.extraPayment,
    0
  );
  const totalPaid = totalPrincipal + totalInterest;

  // Calculate payoff date
  const startDate = inputs.startDate || new Date(2026, 0, 1);
  const lastPayment = schedule[schedule.length - 1];
  const payoffDate = lastPayment ? lastPayment.date : startDate;

  return {
    loanAmount: inputs.loanAmount,
    regularPayment,
    totalPayments: totalPaid,
    totalInterest,
    totalPrincipal,
    payoffDate,
    amortizationSchedule: schedule,
    effectiveRate,
  };
}
