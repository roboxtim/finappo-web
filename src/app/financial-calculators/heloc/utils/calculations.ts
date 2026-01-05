/**
 * HELOC (Home Equity Line of Credit) Calculator Utilities
 *
 * This module provides calculation functions for HELOCs, which have two distinct periods:
 *
 * 1. Draw Period: Borrower can withdraw funds and typically makes interest-only payments
 * 2. Repayment Period: No more withdrawals; borrower pays principal + interest
 *
 * Key Formulas:
 * - Draw Period Payment: Monthly interest-only = Principal × (Annual Rate / 12)
 * - Repayment Period Payment: Standard amortization = P × [r(1+r)^n] / [(1+r)^n - 1]
 *   where P = principal, r = monthly rate, n = number of months
 *
 * Reference: https://www.calculator.net/heloc-calculator.html
 */

export interface HELOCInputs {
  loanAmount: number;
  interestRate: number; // Annual percentage rate
  drawPeriod: number; // Years
  repaymentPeriod: number; // Years
}

export interface HELOCResults {
  drawPeriodPayment: number;
  repaymentPeriodPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalMonths: number;
  drawMonths: number;
  repaymentMonths: number;
  loanAmount: number;
  interestRate: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Calculate the monthly interest-only payment during the draw period
 *
 * During the draw period, borrowers typically only pay interest on the outstanding balance.
 * This is calculated as: (Loan Amount × Annual Interest Rate) / 12
 *
 * @param loanAmount - The principal amount borrowed
 * @param interestRate - Annual interest rate as a percentage (e.g., 8 for 8%)
 * @returns Monthly interest-only payment
 */
export function calculateDrawPeriodPayment(
  loanAmount: number,
  interestRate: number
): number {
  if (loanAmount <= 0 || interestRate <= 0) {
    return 0;
  }

  const monthlyRate = interestRate / 100 / 12;
  return loanAmount * monthlyRate;
}

/**
 * Calculate the monthly payment during the repayment period
 *
 * During the repayment period, payments include both principal and interest,
 * calculated using the standard amortization formula.
 *
 * Formula: M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 * where:
 *   M = Monthly payment
 *   P = Principal (loan amount)
 *   r = Monthly interest rate (annual rate / 12)
 *   n = Number of months in repayment period
 *
 * @param loanAmount - The principal amount to be repaid
 * @param interestRate - Annual interest rate as a percentage
 * @param repaymentYears - Number of years in the repayment period
 * @returns Monthly payment including principal and interest
 */
export function calculateRepaymentPeriodPayment(
  loanAmount: number,
  interestRate: number,
  repaymentYears: number
): number {
  if (loanAmount <= 0 || repaymentYears <= 0) {
    return 0;
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = repaymentYears * 12;

  // Handle zero interest rate
  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }

  // Standard amortization formula
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
  const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;

  return (loanAmount * numerator) / denominator;
}

/**
 * Calculate complete HELOC results
 *
 * Computes all relevant metrics for a HELOC including:
 * - Draw period payment (interest-only)
 * - Repayment period payment (principal + interest)
 * - Total amount paid over the entire term
 * - Total interest paid
 *
 * @param inputs - HELOC parameters including loan amount, rate, and periods
 * @returns Complete calculation results
 */
export function calculateHELOC(inputs: HELOCInputs): HELOCResults {
  const { loanAmount, interestRate, drawPeriod, repaymentPeriod } = inputs;

  // Calculate draw period payment (interest-only)
  const drawPeriodPayment = calculateDrawPeriodPayment(
    loanAmount,
    interestRate
  );

  // Calculate repayment period payment (principal + interest)
  const repaymentPeriodPayment = calculateRepaymentPeriodPayment(
    loanAmount,
    interestRate,
    repaymentPeriod
  );

  // Calculate time periods
  const drawMonths = drawPeriod * 12;
  const repaymentMonths = repaymentPeriod * 12;
  const totalMonths = drawMonths + repaymentMonths;

  // Calculate total payments
  const totalDrawPayments = drawPeriodPayment * drawMonths;
  const totalRepaymentPayments = repaymentPeriodPayment * repaymentMonths;
  const totalPayment = totalDrawPayments + totalRepaymentPayments;

  // Calculate total interest
  const totalInterest = totalPayment - loanAmount;

  return {
    drawPeriodPayment,
    repaymentPeriodPayment,
    totalPayment,
    totalInterest,
    totalMonths,
    drawMonths,
    repaymentMonths,
    loanAmount,
    interestRate,
  };
}

/**
 * Generate a complete amortization schedule
 *
 * Creates a month-by-month breakdown showing:
 * - Payment amount (interest-only during draw, P&I during repayment)
 * - Principal paid (0 during draw period)
 * - Interest paid
 * - Remaining balance
 *
 * @param results - HELOC calculation results
 * @returns Array of monthly payment details
 */
export function generateAmortizationSchedule(
  results: HELOCResults
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const monthlyRate = results.interestRate / 100 / 12;
  let balance = results.loanAmount;

  // Draw Period: Interest-only payments
  for (let month = 1; month <= results.drawMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = 0; // No principal paid during draw period

    schedule.push({
      month,
      payment: results.drawPeriodPayment,
      principal,
      interest,
      balance,
    });

    // Balance remains unchanged during draw period
  }

  // Repayment Period: Principal + Interest payments
  for (let month = 1; month <= results.repaymentMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = results.repaymentPeriodPayment - interest;

    // Update balance
    balance -= principal;

    // Ensure balance doesn't go negative due to rounding
    if (balance < 0.01) {
      balance = 0;
    }

    schedule.push({
      month: results.drawMonths + month,
      payment: results.repaymentPeriodPayment,
      principal,
      interest,
      balance,
    });
  }

  return schedule;
}

/**
 * Calculate maximum borrowing amount based on home equity
 *
 * Formula: (Home Value × LTV Ratio) - Existing Mortgage Balance
 *
 * @param homeValue - Current market value of the home
 * @param mortgageBalance - Outstanding mortgage balance
 * @param ltvRatio - Loan-to-value ratio as a decimal (e.g., 0.80 for 80%)
 * @returns Maximum available credit
 */
export function calculateMaxBorrowingAmount(
  homeValue: number,
  mortgageBalance: number,
  ltvRatio: number
): number {
  if (homeValue <= 0 || ltvRatio <= 0) {
    return 0;
  }

  const maxLoan = homeValue * ltvRatio;
  const availableCredit = maxLoan - mortgageBalance;

  // Cannot borrow negative amount
  return Math.max(0, availableCredit);
}

/**
 * Format currency values for display
 *
 * @param value - Numeric value to format
 * @returns Formatted currency string (e.g., "$1,234.56")
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
 * Format percentage values for display
 *
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "8.25%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
