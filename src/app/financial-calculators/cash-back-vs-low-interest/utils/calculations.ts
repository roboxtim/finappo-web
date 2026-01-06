/**
 * Cash Back vs Low Interest Calculator Utilities
 *
 * This module provides calculations to compare two financing options:
 * 1. Taking a cash back rebate with a higher interest rate
 * 2. Accepting a lower interest rate without the cash back
 *
 * The calculator uses standard loan amortization formulas to determine
 * monthly payments and total interest paid over the loan term.
 */

export interface CashBackVsLowInterestInputs {
  purchasePrice: number; // Total purchase price
  cashBack: number; // Cash back rebate amount
  standardRate: number; // Interest rate with cash back (annual %)
  reducedRate: number; // Lower interest rate without cash back (annual %)
  loanTermMonths: number; // Loan term in months
  downPayment: number; // Down payment amount
}

export interface FinancingOption {
  loanAmount: number; // Amount financed
  monthlyPayment: number; // Monthly payment
  totalInterest: number; // Total interest paid over loan term
  totalCost: number; // Total cost (loan amount + interest)
  totalPaid: number; // Total amount paid (including down payment)
}

export interface CashBackVsLowInterestResults {
  cashBackOption: FinancingOption;
  lowInterestOption: FinancingOption;
  recommendation: 'cashBack' | 'lowInterest';
  savings: number; // How much the recommended option saves
  savingsPercentage: number; // Percentage savings
  breakEvenMonths: number | null; // When cumulative savings equals cash back (if applicable)
}

/**
 * Calculate monthly payment using loan amortization formula
 * Formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 * Where:
 *   P = Monthly payment
 *   L = Loan amount
 *   c = Monthly interest rate (annual rate / 12 / 100)
 *   n = Number of months
 *
 * For 0% interest, monthly payment = loan amount / number of months
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  months: number
): number {
  if (loanAmount <= 0 || months <= 0) {
    return 0;
  }

  // Handle 0% interest rate
  if (annualRate === 0) {
    return loanAmount / months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numerator =
    loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;

  return numerator / denominator;
}

/**
 * Calculate total interest paid over the loan term
 */
export function calculateTotalInterest(
  monthlyPayment: number,
  loanAmount: number,
  months: number
): number {
  const totalPayments = monthlyPayment * months;
  return Math.max(0, totalPayments - loanAmount);
}

/**
 * Calculate financing details for a single option
 */
export function calculateFinancingOption(
  purchasePrice: number,
  downPayment: number,
  cashBackAmount: number,
  annualRate: number,
  loanTermMonths: number
): FinancingOption {
  // Loan amount = Purchase price - Down payment - Cash back
  const loanAmount = Math.max(0, purchasePrice - downPayment - cashBackAmount);

  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    annualRate,
    loanTermMonths
  );

  // Calculate total interest
  const totalInterest = calculateTotalInterest(
    monthlyPayment,
    loanAmount,
    loanTermMonths
  );

  // Total cost = loan amount + interest
  const totalCost = loanAmount + totalInterest;

  // Total paid = total cost + down payment
  const totalPaid = totalCost + downPayment;

  return {
    loanAmount,
    monthlyPayment,
    totalInterest,
    totalCost,
    totalPaid,
  };
}

/**
 * Calculate break-even point in months
 * This determines after how many months the cumulative savings from lower interest
 * equals the cash back amount foregone
 */
export function calculateBreakEvenMonths(
  cashBackMonthlyPayment: number,
  lowInterestMonthlyPayment: number,
  cashBackAmount: number
): number | null {
  // If low interest option has higher monthly payment, there's no break-even
  if (lowInterestMonthlyPayment >= cashBackMonthlyPayment) {
    return null;
  }

  const monthlySavings = cashBackMonthlyPayment - lowInterestMonthlyPayment;

  if (monthlySavings <= 0) {
    return null;
  }

  return Math.ceil(cashBackAmount / monthlySavings);
}

/**
 * Main calculation function that compares both financing options
 */
export function calculateCashBackVsLowInterest(
  inputs: CashBackVsLowInterestInputs
): CashBackVsLowInterestResults {
  const {
    purchasePrice,
    cashBack,
    standardRate,
    reducedRate,
    loanTermMonths,
    downPayment,
  } = inputs;

  // Option 1: Take cash back with standard (higher) rate
  const cashBackOption = calculateFinancingOption(
    purchasePrice,
    downPayment,
    cashBack, // Apply cash back
    standardRate, // Higher rate
    loanTermMonths
  );

  // Option 2: Accept low interest rate without cash back
  const lowInterestOption = calculateFinancingOption(
    purchasePrice,
    downPayment,
    0, // No cash back
    reducedRate, // Lower rate
    loanTermMonths
  );

  // Determine which option is better (lower total paid)
  const cashBackIsBetter =
    cashBackOption.totalPaid < lowInterestOption.totalPaid;
  const recommendation = cashBackIsBetter ? 'cashBack' : 'lowInterest';

  // Calculate savings
  const savings = Math.abs(
    cashBackOption.totalPaid - lowInterestOption.totalPaid
  );
  const higherTotal = Math.max(
    cashBackOption.totalPaid,
    lowInterestOption.totalPaid
  );
  const savingsPercentage = higherTotal > 0 ? (savings / higherTotal) * 100 : 0;

  // Calculate break-even point
  const breakEvenMonths = calculateBreakEvenMonths(
    cashBackOption.monthlyPayment,
    lowInterestOption.monthlyPayment,
    cashBack
  );

  return {
    cashBackOption,
    lowInterestOption,
    recommendation,
    savings,
    savingsPercentage,
    breakEvenMonths,
  };
}

/**
 * Validate inputs and return error messages if any
 */
export function validateInputs(inputs: CashBackVsLowInterestInputs): string[] {
  const errors: string[] = [];

  if (inputs.purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
  }

  if (inputs.cashBack < 0) {
    errors.push('Cash back cannot be negative');
  }

  if (inputs.cashBack > inputs.purchasePrice) {
    errors.push('Cash back cannot exceed purchase price');
  }

  if (inputs.standardRate < 0) {
    errors.push('Standard interest rate cannot be negative');
  }

  if (inputs.reducedRate < 0) {
    errors.push('Reduced interest rate cannot be negative');
  }

  if (inputs.reducedRate > inputs.standardRate) {
    errors.push('Reduced rate should be lower than standard rate');
  }

  if (inputs.loanTermMonths <= 0) {
    errors.push('Loan term must be greater than 0 months');
  }

  if (inputs.downPayment < 0) {
    errors.push('Down payment cannot be negative');
  }

  if (inputs.downPayment >= inputs.purchasePrice) {
    errors.push('Down payment must be less than purchase price');
  }

  return errors;
}
