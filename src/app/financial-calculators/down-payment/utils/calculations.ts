/**
 * Down Payment Calculator - Calculation Utilities
 *
 * This module provides all calculation functions for the down payment calculator.
 * Based on standard mortgage amortization formulas used by calculator.net
 */

export interface DownPaymentCalculation {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  closingCosts: number;
  totalCashNeeded: number;
  monthlyPayment: number;
  requiresPMI: boolean;
}

/**
 * Calculate down payment amount from home price and percentage
 *
 * @param homePrice - Total price of the home
 * @param downPaymentPercent - Down payment as a percentage (0-100)
 * @returns Down payment amount in dollars
 */
export function calculateDownPaymentFromPrice(
  homePrice: number,
  downPaymentPercent: number
): number {
  return (homePrice * downPaymentPercent) / 100;
}

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * Formula: M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
 *
 * Where:
 * - M = Monthly payment
 * - P = Principal loan amount
 * - r = Monthly interest rate (annual rate / 12)
 * - n = Total number of payments (years × 12)
 *
 * @param principal - Loan amount (home price - down payment)
 * @param annualInterestRate - Annual interest rate as a percentage (e.g., 6.5 for 6.5%)
 * @param loanTermYears - Loan term in years
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  // Handle edge cases
  if (principal === 0) {
    return 0;
  }

  // Convert annual rate to monthly rate (as decimal)
  const monthlyRate = annualInterestRate / 100 / 12;

  // Total number of monthly payments
  const numberOfPayments = loanTermYears * 12;

  // Handle 0% interest rate case
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  // Standard amortization formula
  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return monthlyPayment;
}

/**
 * Calculate total cash needed at closing (down payment + closing costs)
 *
 * @param homePrice - Total price of the home
 * @param downPayment - Down payment amount
 * @param closingCostPercent - Closing costs as percentage of home price (typically 2-3%)
 * @returns Object with closing costs and total cash needed
 */
export function calculateTotalCashNeeded(
  homePrice: number,
  downPayment: number,
  closingCostPercent: number
): {
  closingCosts: number;
  totalCashNeeded: number;
} {
  const closingCosts = (homePrice * closingCostPercent) / 100;
  const totalCashNeeded = downPayment + closingCosts;

  return {
    closingCosts,
    totalCashNeeded,
  };
}

/**
 * Calculate complete loan details for down payment scenarios
 * This is the main calculation function that combines all other calculations
 *
 * @param homePrice - Total price of the home
 * @param downPaymentPercent - Down payment as percentage (0-100)
 * @param closingCostPercent - Closing costs as percentage of home price
 * @param interestRate - Annual interest rate (APR)
 * @param loanTermYears - Loan term in years
 * @returns Complete calculation results
 */
export function calculateLoanDetails(
  homePrice: number,
  downPaymentPercent: number,
  closingCostPercent: number,
  interestRate: number,
  loanTermYears: number
): DownPaymentCalculation {
  // Calculate down payment
  const downPayment = calculateDownPaymentFromPrice(
    homePrice,
    downPaymentPercent
  );

  // Calculate loan amount
  const loanAmount = homePrice - downPayment;

  // Calculate closing costs and total cash needed
  const { closingCosts, totalCashNeeded } = calculateTotalCashNeeded(
    homePrice,
    downPayment,
    closingCostPercent
  );

  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    interestRate,
    loanTermYears
  );

  // Determine if PMI is required (down payment less than 20%)
  const requiresPMI = downPaymentPercent < 20;

  return {
    homePrice,
    downPayment,
    downPaymentPercent,
    loanAmount,
    closingCosts,
    totalCashNeeded,
    monthlyPayment,
    requiresPMI,
  };
}

/**
 * Calculate down payment scenarios for comparison
 * Generates results for different down payment percentages
 *
 * @param homePrice - Total price of the home
 * @param closingCostPercent - Closing costs as percentage
 * @param interestRate - Annual interest rate
 * @param loanTermYears - Loan term in years
 * @returns Array of calculations for different down payment scenarios
 */
export function calculateDownPaymentScenarios(
  homePrice: number,
  closingCostPercent: number,
  interestRate: number,
  loanTermYears: number
): DownPaymentCalculation[] {
  const scenarios = [3.5, 5, 10, 15, 20, 25, 30];

  return scenarios.map((downPaymentPercent) =>
    calculateLoanDetails(
      homePrice,
      downPaymentPercent,
      closingCostPercent,
      interestRate,
      loanTermYears
    )
  );
}

/**
 * Calculate savings from making a larger down payment
 * Compares two down payment scenarios
 *
 * @param scenario1 - First scenario (typically lower down payment)
 * @param scenario2 - Second scenario (typically higher down payment)
 * @returns Savings breakdown
 */
export function calculateDownPaymentSavings(
  scenario1: DownPaymentCalculation,
  scenario2: DownPaymentCalculation
): {
  monthlySavings: number;
  totalLoanSavings: number;
  additionalDownPayment: number;
  pmiSavings: boolean;
} {
  const monthlySavings = scenario1.monthlyPayment - scenario2.monthlyPayment;

  // Calculate total interest paid over life of loan
  const totalPayment1 = scenario1.monthlyPayment * 12 * 30;
  const totalPayment2 = scenario2.monthlyPayment * 12 * 30;
  const totalLoanSavings = totalPayment1 - totalPayment2;

  const additionalDownPayment = scenario2.downPayment - scenario1.downPayment;
  const pmiSavings = scenario1.requiresPMI && !scenario2.requiresPMI;

  return {
    monthlySavings,
    totalLoanSavings,
    additionalDownPayment,
    pmiSavings,
  };
}
