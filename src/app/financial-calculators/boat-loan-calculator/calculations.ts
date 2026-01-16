// Boat Loan Calculator Types
export interface BoatLoanInputs {
  boatPrice: number;
  interestRate: number;
  loanTermYears: number;
  downPayment?: number;
  downPaymentType?: 'percentage' | 'amount';
  tradeInValue?: number;
  salesTax?: number;
  salesTaxType?: 'percentage' | 'amount';
  fees?: number;
  includeFeesInLoan?: boolean;
}

export interface BoatLoanResults {
  monthlyPayment: number;
  loanAmount: number;
  totalPayments: number;
  totalInterest: number;
  totalCost: number;
  upfrontPayment: number;
  salesTaxAmount: number;
  downPaymentAmount: number;
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
 * Calculate boat loan details including all costs and fees
 */
export function calculateBoatLoan(inputs: BoatLoanInputs): BoatLoanResults {
  const {
    boatPrice,
    interestRate,
    loanTermYears,
    downPayment = 0,
    downPaymentType = 'amount',
    tradeInValue = 0,
    salesTax = 0,
    salesTaxType = 'percentage',
    fees = 0,
    includeFeesInLoan = false,
  } = inputs;

  // Validate inputs
  if (boatPrice <= 0) {
    throw new Error('Boat price must be greater than 0');
  }

  if (interestRate < 0) {
    throw new Error('Interest rate cannot be negative');
  }

  if (loanTermYears <= 0) {
    throw new Error('Loan term must be greater than 0');
  }

  // Calculate down payment amount
  let downPaymentAmount = 0;
  if (downPaymentType === 'percentage') {
    downPaymentAmount = (boatPrice * downPayment) / 100;
  } else {
    downPaymentAmount = downPayment;
  }

  // Calculate sales tax amount
  let salesTaxAmount = 0;
  if (salesTaxType === 'percentage') {
    salesTaxAmount = (boatPrice * salesTax) / 100;
  } else {
    salesTaxAmount = salesTax;
  }

  // Calculate loan amount
  // Loan Amount = Boat Price - Down Payment - Trade-In Value + Sales Tax + (Fees if included)
  let loanAmount =
    boatPrice - downPaymentAmount - tradeInValue + salesTaxAmount;

  if (includeFeesInLoan) {
    loanAmount += fees;
  }

  // Ensure loan amount is not negative
  if (loanAmount < 0) {
    loanAmount = 0;
  }

  // Calculate upfront payment
  // Upfront = Down Payment + (Fees if not included in loan)
  let upfrontPayment = downPaymentAmount;
  if (!includeFeesInLoan) {
    upfrontPayment += fees;
  }

  // Calculate total number of months
  const totalMonths = loanTermYears * 12;

  // Calculate monthly payment
  const monthlyPayment =
    loanAmount > 0
      ? calculateMonthlyPayment(loanAmount, interestRate, totalMonths)
      : 0;

  // Calculate total payments
  const totalPayments = monthlyPayment * totalMonths;

  // Calculate total interest
  const totalInterest = totalPayments - loanAmount;

  // Calculate total cost (boat price + sales tax + fees + interest)
  const totalCost = boatPrice + salesTaxAmount + fees + totalInterest;

  // Calculate effective interest rate (percentage of boat price that goes to interest)
  const effectiveInterestRate =
    boatPrice > 0 ? (totalInterest / boatPrice) * 100 : 0;

  return {
    monthlyPayment,
    loanAmount,
    totalPayments,
    totalInterest,
    totalCost,
    upfrontPayment,
    salesTaxAmount,
    downPaymentAmount,
    effectiveInterestRate,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: BoatLoanInputs): string[] {
  const errors: string[] = [];

  if (inputs.boatPrice <= 0) {
    errors.push('Boat price must be greater than 0');
  }

  if (inputs.boatPrice > 10000000) {
    errors.push('Boat price seems unusually high');
  }

  if (inputs.interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  }

  if (inputs.interestRate > 50) {
    errors.push('Interest rate seems unusually high');
  }

  if (inputs.loanTermYears <= 0) {
    errors.push('Loan term must be greater than 0');
  }

  if (inputs.loanTermYears > 30) {
    errors.push('Loan term cannot exceed 30 years');
  }

  if (inputs.downPayment && inputs.downPayment < 0) {
    errors.push('Down payment cannot be negative');
  }

  if (
    inputs.downPayment &&
    inputs.downPaymentType === 'percentage' &&
    inputs.downPayment > 100
  ) {
    errors.push('Down payment percentage cannot exceed 100%');
  }

  if (inputs.tradeInValue && inputs.tradeInValue < 0) {
    errors.push('Trade-in value cannot be negative');
  }

  if (inputs.tradeInValue && inputs.tradeInValue > inputs.boatPrice) {
    errors.push('Trade-in value cannot exceed boat price');
  }

  if (inputs.salesTax && inputs.salesTax < 0) {
    errors.push('Sales tax cannot be negative');
  }

  if (
    inputs.salesTax &&
    inputs.salesTaxType === 'percentage' &&
    inputs.salesTax > 20
  ) {
    errors.push('Sales tax percentage seems unusually high');
  }

  if (inputs.fees && inputs.fees < 0) {
    errors.push('Fees cannot be negative');
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
