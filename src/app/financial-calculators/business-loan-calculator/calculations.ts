// Business Loan Calculator Types
export interface BusinessLoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  originationFee?: number; // Can be percentage or dollar amount
  originationFeeType?: 'percentage' | 'amount';
  documentationFee?: number;
  otherFees?: number;
}

export interface BusinessLoanResults {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalFees: number;
  totalCost: number;
  apr: number;
  loanAmount: number;
  effectiveInterestRate: number;
}

/**
 * Calculate monthly payment using amortization formula
 * M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 * where:
 * M = monthly payment
 * P = principal (loan amount)
 * r = monthly interest rate
 * n = number of payments
 */
function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) {
    return principal / months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;

  return principal * (numerator / denominator);
}

/**
 * Calculate APR (Annual Percentage Rate) including fees
 * APR accounts for the true cost of borrowing including all fees
 * Simplified calculation: (Total Cost - Principal) / Principal / Years * 100
 */
function calculateAPR(
  loanAmount: number,
  totalInterest: number,
  totalFees: number,
  years: number
): number {
  if (loanAmount <= 0 || years <= 0) {
    return 0;
  }

  // Total cost of borrowing (interest + fees)
  const totalCost = totalInterest + totalFees;

  // APR = (Total Cost / Principal) / Years * 100
  const apr = (totalCost / loanAmount / years) * 100;

  return apr;
}

/**
 * Calculate business loan details including APR and total costs
 */
export function calculateBusinessLoan(
  inputs: BusinessLoanInputs
): BusinessLoanResults {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    originationFee = 0,
    originationFeeType = 'percentage',
    documentationFee = 0,
    otherFees = 0,
  } = inputs;

  // Validate inputs
  if (loanAmount <= 0) {
    throw new Error('Loan amount must be greater than 0');
  }

  if (interestRate < 0) {
    throw new Error('Interest rate cannot be negative');
  }

  if (loanTermYears <= 0) {
    throw new Error('Loan term must be greater than 0');
  }

  // Calculate total number of months
  const totalMonths = loanTermYears * 12;

  // Calculate origination fee
  let originationFeeAmount = 0;
  if (originationFeeType === 'percentage') {
    originationFeeAmount = (loanAmount * originationFee) / 100;
  } else {
    originationFeeAmount = originationFee;
  }

  // Calculate total fees
  const totalFees = originationFeeAmount + documentationFee + otherFees;

  // Calculate monthly payment (based on full loan amount)
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    interestRate,
    totalMonths
  );

  // Calculate total payments
  const totalPayments = monthlyPayment * totalMonths;

  // Calculate total interest
  const totalInterest = totalPayments - loanAmount;

  // Calculate total cost (principal + interest + fees)
  const totalCost = loanAmount + totalInterest + totalFees;

  // Calculate APR (effective rate including fees)
  const apr = calculateAPR(loanAmount, totalInterest, totalFees, loanTermYears);

  // Calculate effective interest rate (percentage of loan that goes to interest)
  const effectiveInterestRate = (totalInterest / loanAmount) * 100;

  return {
    monthlyPayment,
    totalPayments,
    totalInterest,
    totalFees,
    totalCost,
    apr,
    loanAmount,
    effectiveInterestRate,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: BusinessLoanInputs): string[] {
  const errors: string[] = [];

  if (inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0');
  }

  if (inputs.interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  }

  if (inputs.interestRate > 100) {
    errors.push('Interest rate seems unusually high');
  }

  if (inputs.loanTermYears <= 0) {
    errors.push('Loan term must be greater than 0');
  }

  if (inputs.loanTermYears > 30) {
    errors.push('Loan term cannot exceed 30 years');
  }

  if (inputs.originationFee && inputs.originationFee < 0) {
    errors.push('Origination fee cannot be negative');
  }

  if (
    inputs.originationFee &&
    inputs.originationFeeType === 'percentage' &&
    inputs.originationFee > 10
  ) {
    errors.push('Origination fee percentage seems unusually high (max 10%)');
  }

  if (inputs.documentationFee && inputs.documentationFee < 0) {
    errors.push('Documentation fee cannot be negative');
  }

  if (inputs.otherFees && inputs.otherFees < 0) {
    errors.push('Other fees cannot be negative');
  }

  return errors;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
