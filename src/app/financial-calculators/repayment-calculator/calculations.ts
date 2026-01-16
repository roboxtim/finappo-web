// Loan Repayment Calculator Types
export type CalculationMode = 'fixed-term' | 'fixed-payment';

export type PaymentFrequency =
  | 'monthly'
  | 'bi-weekly'
  | 'weekly'
  | 'daily'
  | 'quarterly'
  | 'semi-annually'
  | 'annually';

export interface LoanInputs {
  loanBalance: number;
  interestRate: number;
  mode: CalculationMode;
  // For fixed-term mode
  years?: number;
  months?: number;
  // For fixed-payment mode
  monthlyPayment?: number;
  // Payment frequency
  paymentFrequency: PaymentFrequency;
}

export interface PaymentBreakdown {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface RepaymentResults {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
  payoffMonths: number;
  principalPercentage: number;
  interestPercentage: number;
  amortizationSchedule: PaymentBreakdown[];
}

// Payment frequency to periods per year mapping
export const PAYMENT_FREQUENCY_PERIODS: Record<PaymentFrequency, number> = {
  monthly: 12,
  'bi-weekly': 26,
  weekly: 52,
  daily: 365,
  quarterly: 4,
  'semi-annually': 2,
  annually: 1,
};

/**
 * Calculate monthly payment for a loan using amortization formula
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  totalMonths: number
): number {
  if (annualRate === 0) {
    return principal / totalMonths;
  }

  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return payment;
}

/**
 * Calculate number of months needed to pay off loan with fixed payment
 */
export function calculatePayoffMonths(
  principal: number,
  monthlyPayment: number,
  annualRate: number
): number {
  if (annualRate === 0) {
    return Math.ceil(principal / monthlyPayment);
  }

  const monthlyRate = annualRate / 100 / 12;

  // Check if payment is sufficient
  const minPayment = principal * monthlyRate;
  if (monthlyPayment <= minPayment) {
    return 999; // Payment too low, will never pay off
  }

  // Use logarithmic formula to calculate months
  const months =
    -Math.log(1 - (principal * monthlyRate) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  return Math.ceil(months);
}

/**
 * Generate amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  totalMonths: number
): PaymentBreakdown[] {
  const schedule: PaymentBreakdown[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 100 / 12;

  for (let month = 1; month <= totalMonths && balance > 0.01; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(
      monthlyPayment - interestPayment,
      balance
    );
    const payment = principalPayment + interestPayment;

    balance -= principalPayment;

    schedule.push({
      paymentNumber: month,
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

/**
 * Calculate total interest paid
 */
export function calculateTotalInterest(
  amortizationSchedule: PaymentBreakdown[]
): number {
  return amortizationSchedule.reduce(
    (sum, payment) => sum + payment.interest,
    0
  );
}

/**
 * Calculate total principal paid
 */
export function calculateTotalPrincipal(
  amortizationSchedule: PaymentBreakdown[]
): number {
  return amortizationSchedule.reduce(
    (sum, payment) => sum + payment.principal,
    0
  );
}

/**
 * Main calculation function
 */
export function calculateRepayment(inputs: LoanInputs): RepaymentResults {
  const { loanBalance, interestRate, mode } = inputs;

  let monthlyPayment: number;
  let payoffMonths: number;

  if (mode === 'fixed-term') {
    // Calculate payment based on fixed term
    const years = inputs.years || 0;
    const months = inputs.months || 0;
    payoffMonths = years * 12 + months;

    if (payoffMonths === 0) {
      throw new Error('Term must be greater than 0');
    }

    monthlyPayment = calculateMonthlyPayment(
      loanBalance,
      interestRate,
      payoffMonths
    );
  } else {
    // Calculate term based on fixed payment
    monthlyPayment = inputs.monthlyPayment || 0;

    if (monthlyPayment === 0) {
      throw new Error('Monthly payment must be greater than 0');
    }

    payoffMonths = calculatePayoffMonths(
      loanBalance,
      monthlyPayment,
      interestRate
    );

    if (payoffMonths >= 999) {
      throw new Error(
        'Monthly payment is too low to pay off the loan. Increase payment amount.'
      );
    }
  }

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    loanBalance,
    monthlyPayment,
    interestRate,
    payoffMonths
  );

  // Calculate totals
  const totalInterest = calculateTotalInterest(amortizationSchedule);
  const totalPrincipal = calculateTotalPrincipal(amortizationSchedule);
  const totalPayments = totalInterest + totalPrincipal;

  // Calculate percentages
  const principalPercentage = (totalPrincipal / totalPayments) * 100;
  const interestPercentage = (totalInterest / totalPayments) * 100;

  return {
    monthlyPayment,
    totalPayments,
    totalInterest,
    totalPrincipal,
    payoffMonths,
    principalPercentage,
    interestPercentage,
    amortizationSchedule,
  };
}

/**
 * Validate inputs
 */
export function validateRepaymentInputs(inputs: LoanInputs): string[] {
  const errors: string[] = [];

  if (inputs.loanBalance <= 0) {
    errors.push('Loan balance must be greater than 0');
  }

  if (inputs.interestRate < 0 || inputs.interestRate > 100) {
    errors.push('Interest rate must be between 0 and 100');
  }

  if (inputs.mode === 'fixed-term') {
    const years = inputs.years || 0;
    const months = inputs.months || 0;
    const totalMonths = years * 12 + months;

    if (totalMonths <= 0) {
      errors.push('Loan term must be greater than 0');
    }

    if (totalMonths > 600) {
      errors.push('Loan term cannot exceed 50 years (600 months)');
    }
  } else if (inputs.mode === 'fixed-payment') {
    if (!inputs.monthlyPayment || inputs.monthlyPayment <= 0) {
      errors.push('Monthly payment must be greater than 0');
    }

    // Check if payment is sufficient
    const monthlyRate = inputs.interestRate / 100 / 12;
    const minPayment = inputs.loanBalance * monthlyRate;

    if (inputs.monthlyPayment && inputs.monthlyPayment <= minPayment) {
      errors.push(
        `Monthly payment must be greater than ${formatCurrency(minPayment)} to pay off the loan`
      );
    }
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
  return `${value.toFixed(1)}%`;
}

/**
 * Format months as years and months
 */
export function formatMonthsAsTime(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Format payment frequency display name
 */
export function formatPaymentFrequency(frequency: PaymentFrequency): string {
  const names: Record<PaymentFrequency, string> = {
    monthly: 'Monthly',
    'bi-weekly': 'Bi-weekly',
    weekly: 'Weekly',
    daily: 'Daily',
    quarterly: 'Quarterly',
    'semi-annually': 'Semi-annually',
    annually: 'Annually',
  };

  return names[frequency] || frequency;
}
