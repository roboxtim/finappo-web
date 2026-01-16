// Student Loan Calculator Types
export type CalculatorMode = 'simple' | 'repayment' | 'projection';

export interface SimpleInputs {
  loanBalance?: number;
  remainingTerm?: number;
  interestRate?: number;
  monthlyPayment?: number;
}

export interface RepaymentInputs {
  loanBalance: number;
  monthlyPayment: number;
  interestRate: number;
  extraMonthly?: number;
  extraAnnual?: number;
  oneTimePayment?: number;
}

export interface ProjectionInputs {
  yearsToGraduation: number;
  annualLoanAmount: number;
  currentBalance: number;
  loanTerm: number;
  gracePeriod: number;
  interestRate: number;
  interestDuringSchool: boolean;
}

export interface PaymentBreakdown {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface SimpleResults {
  loanBalance: number;
  remainingTerm: number;
  interestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  principalPercentage: number;
  interestPercentage: number;
}

export interface RepaymentResults {
  original: {
    monthlyPayment: number;
    totalMonths: number;
    totalPayments: number;
    totalInterest: number;
  };
  accelerated: {
    monthlyPayment: number;
    totalMonths: number;
    totalPayments: number;
    totalInterest: number;
  };
  savings: {
    monthsSaved: number;
    interestSaved: number;
  };
}

export interface ProjectionResults {
  monthlyRepayment: number;
  amountBorrowed: number;
  balanceAfterGraduation: number;
  balanceAfterGracePeriod: number;
  totalInterest: number;
  totalPayments: number;
  principalPercentage: number;
  interestPercentage: number;
}

/**
 * Calculate monthly payment using standard loan formula
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) {
    return principal / months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return payment;
}

/**
 * Calculate loan term in months
 */
export function calculateLoanTerm(
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
    return 999; // Payment too low
  }

  const months =
    -Math.log(1 - (principal * monthlyRate) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  return Math.ceil(months);
}

/**
 * Calculate principal amount
 */
export function calculatePrincipal(
  monthlyPayment: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) {
    return monthlyPayment * months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const principal =
    (monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, months));

  return principal;
}

/**
 * Calculate interest rate (using Newton-Raphson method)
 */
export function calculateInterestRate(
  principal: number,
  monthlyPayment: number,
  months: number
): number {
  // Use binary search for simplicity and reliability
  let low = 0;
  let high = 50;
  let rate = 5;

  for (let i = 0; i < 100; i++) {
    const testRate = (low + high) / 2;
    const calculatedPayment = calculateMonthlyPayment(
      principal,
      testRate,
      months
    );

    if (Math.abs(calculatedPayment - monthlyPayment) < 0.01) {
      rate = testRate;
      break;
    }

    if (calculatedPayment > monthlyPayment) {
      high = testRate;
    } else {
      low = testRate;
    }
  }

  return rate;
}

/**
 * Generate amortization schedule with extra payments
 */
export function generateAmortizationSchedule(
  principal: number,
  monthlyPayment: number,
  annualRate: number,
  extraMonthly: number = 0,
  extraAnnual: number = 0,
  oneTimePayment: number = 0
): PaymentBreakdown[] {
  const schedule: PaymentBreakdown[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 100 / 12;
  let month = 1;

  // Apply one-time payment upfront
  if (oneTimePayment > 0) {
    balance -= oneTimePayment;
  }

  while (balance > 0.01 && month <= 600) {
    const interestPayment = balance * monthlyRate;
    let totalPayment = monthlyPayment + extraMonthly;

    // Add annual extra payment if it's December (month 12, 24, 36, etc.)
    if (month % 12 === 0 && extraAnnual > 0) {
      totalPayment += extraAnnual;
    }

    const principalPayment = Math.min(totalPayment - interestPayment, balance);
    const actualPayment = principalPayment + interestPayment;

    balance -= principalPayment;

    schedule.push({
      paymentNumber: month,
      payment: actualPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });

    month++;
  }

  return schedule;
}

/**
 * Simple Calculator - solve for missing variable
 */
export function calculateSimple(inputs: SimpleInputs): SimpleResults {
  const providedCount = [
    inputs.loanBalance,
    inputs.remainingTerm,
    inputs.interestRate,
    inputs.monthlyPayment,
  ].filter((v) => v !== undefined && v !== null && v > 0).length;

  if (providedCount !== 3) {
    throw new Error('Please provide exactly 3 values to calculate the 4th');
  }

  let loanBalance = inputs.loanBalance || 0;
  let remainingTerm = inputs.remainingTerm || 0;
  let interestRate = inputs.interestRate || 0;
  let monthlyPayment = inputs.monthlyPayment || 0;

  // Calculate missing value
  if (!inputs.monthlyPayment || inputs.monthlyPayment === 0) {
    const months = remainingTerm * 12;
    monthlyPayment = calculateMonthlyPayment(loanBalance, interestRate, months);
  } else if (!inputs.remainingTerm || inputs.remainingTerm === 0) {
    const months = calculateLoanTerm(loanBalance, monthlyPayment, interestRate);
    remainingTerm = months / 12;
  } else if (!inputs.loanBalance || inputs.loanBalance === 0) {
    const months = remainingTerm * 12;
    loanBalance = calculatePrincipal(monthlyPayment, interestRate, months);
  } else if (!inputs.interestRate || inputs.interestRate === 0) {
    const months = remainingTerm * 12;
    interestRate = calculateInterestRate(loanBalance, monthlyPayment, months);
  }

  // Calculate totals
  const totalMonths = remainingTerm * 12;
  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = totalPayments - loanBalance;
  const principalPercentage = (loanBalance / totalPayments) * 100;
  const interestPercentage = (totalInterest / totalPayments) * 100;

  return {
    loanBalance,
    remainingTerm,
    interestRate,
    monthlyPayment,
    totalInterest,
    totalPayments,
    principalPercentage,
    interestPercentage,
  };
}

/**
 * Repayment Calculator - compare original vs accelerated payoff
 */
export function calculateRepayment(inputs: RepaymentInputs): RepaymentResults {
  const { loanBalance, monthlyPayment, interestRate } = inputs;
  const extraMonthly = inputs.extraMonthly || 0;
  const extraAnnual = inputs.extraAnnual || 0;
  const oneTimePayment = inputs.oneTimePayment || 0;

  // Original schedule (no extra payments)
  const originalSchedule = generateAmortizationSchedule(
    loanBalance,
    monthlyPayment,
    interestRate,
    0,
    0,
    0
  );

  const originalTotalInterest = originalSchedule.reduce(
    (sum, p) => sum + p.interest,
    0
  );
  const originalTotalPayments = originalSchedule.reduce(
    (sum, p) => sum + p.payment,
    0
  );

  // Accelerated schedule (with extra payments)
  const acceleratedSchedule = generateAmortizationSchedule(
    loanBalance,
    monthlyPayment,
    interestRate,
    extraMonthly,
    extraAnnual,
    oneTimePayment
  );

  const acceleratedTotalInterest = acceleratedSchedule.reduce(
    (sum, p) => sum + p.interest,
    0
  );
  const acceleratedTotalPayments = acceleratedSchedule.reduce(
    (sum, p) => sum + p.payment,
    0
  );

  return {
    original: {
      monthlyPayment,
      totalMonths: originalSchedule.length,
      totalPayments: originalTotalPayments,
      totalInterest: originalTotalInterest,
    },
    accelerated: {
      monthlyPayment: monthlyPayment + extraMonthly,
      totalMonths: acceleratedSchedule.length,
      totalPayments: acceleratedTotalPayments,
      totalInterest: acceleratedTotalInterest,
    },
    savings: {
      monthsSaved: originalSchedule.length - acceleratedSchedule.length,
      interestSaved: originalTotalInterest - acceleratedTotalInterest,
    },
  };
}

/**
 * Projection Calculator - for students not yet graduated
 */
export function calculateProjection(
  inputs: ProjectionInputs
): ProjectionResults {
  const {
    yearsToGraduation,
    annualLoanAmount,
    currentBalance,
    loanTerm,
    gracePeriod,
    interestRate,
    interestDuringSchool,
  } = inputs;

  const monthlyRate = interestRate / 100 / 12;
  let balance = currentBalance;

  // Accumulate loans during school years
  const totalBorrowed = annualLoanAmount * yearsToGraduation;

  if (interestDuringSchool) {
    // Interest accrues during school
    for (let year = 0; year < yearsToGraduation; year++) {
      // Add annual loan at start of year
      balance += annualLoanAmount;

      // Compound interest monthly for the year
      for (let month = 0; month < 12; month++) {
        balance *= 1 + monthlyRate;
      }
    }
  } else {
    // No interest during school
    balance += totalBorrowed;
  }

  const balanceAfterGraduation = balance;

  // Interest during grace period
  for (let month = 0; month < gracePeriod; month++) {
    balance *= 1 + monthlyRate;
  }

  const balanceAfterGracePeriod = balance;

  // Calculate monthly repayment
  const loanTermMonths = loanTerm * 12;
  const monthlyRepayment = calculateMonthlyPayment(
    balanceAfterGracePeriod,
    interestRate,
    loanTermMonths
  );

  const totalPayments = monthlyRepayment * loanTermMonths;
  const amountBorrowed = currentBalance + totalBorrowed;
  const totalInterest = totalPayments - amountBorrowed;
  const principalPercentage = (amountBorrowed / totalPayments) * 100;
  const interestPercentage = (totalInterest / totalPayments) * 100;

  return {
    monthlyRepayment,
    amountBorrowed,
    balanceAfterGraduation,
    balanceAfterGracePeriod,
    totalInterest,
    totalPayments,
    principalPercentage,
    interestPercentage,
  };
}

/**
 * Validate simple calculator inputs
 */
export function validateSimpleInputs(inputs: SimpleInputs): string[] {
  const errors: string[] = [];

  const values = [
    inputs.loanBalance,
    inputs.remainingTerm,
    inputs.interestRate,
    inputs.monthlyPayment,
  ];
  const providedCount = values.filter(
    (v) => v !== undefined && v !== null && v > 0
  ).length;

  if (providedCount < 3) {
    errors.push('Please provide at least 3 values');
  }

  if (providedCount > 3) {
    errors.push('Please provide exactly 3 values (leave one blank)');
  }

  if (inputs.loanBalance && inputs.loanBalance < 0) {
    errors.push('Loan balance cannot be negative');
  }

  if (inputs.remainingTerm && inputs.remainingTerm < 0) {
    errors.push('Remaining term cannot be negative');
  }

  if (
    inputs.interestRate &&
    (inputs.interestRate < 0 || inputs.interestRate > 100)
  ) {
    errors.push('Interest rate must be between 0 and 100');
  }

  if (inputs.monthlyPayment && inputs.monthlyPayment < 0) {
    errors.push('Monthly payment cannot be negative');
  }

  return errors;
}

/**
 * Validate repayment calculator inputs
 */
export function validateRepaymentInputs(inputs: RepaymentInputs): string[] {
  const errors: string[] = [];

  if (inputs.loanBalance <= 0) {
    errors.push('Loan balance must be greater than 0');
  }

  if (inputs.monthlyPayment <= 0) {
    errors.push('Monthly payment must be greater than 0');
  }

  if (inputs.interestRate < 0 || inputs.interestRate > 100) {
    errors.push('Interest rate must be between 0 and 100');
  }

  // Check if payment is sufficient
  const monthlyRate = inputs.interestRate / 100 / 12;
  const minPayment = inputs.loanBalance * monthlyRate;

  if (inputs.monthlyPayment <= minPayment) {
    errors.push(
      `Monthly payment must be greater than ${formatCurrency(minPayment)} to pay off the loan`
    );
  }

  if (inputs.extraMonthly && inputs.extraMonthly < 0) {
    errors.push('Extra monthly payment cannot be negative');
  }

  if (inputs.extraAnnual && inputs.extraAnnual < 0) {
    errors.push('Extra annual payment cannot be negative');
  }

  if (inputs.oneTimePayment && inputs.oneTimePayment < 0) {
    errors.push('One-time payment cannot be negative');
  }

  return errors;
}

/**
 * Validate projection calculator inputs
 */
export function validateProjectionInputs(inputs: ProjectionInputs): string[] {
  const errors: string[] = [];

  if (inputs.yearsToGraduation < 0 || inputs.yearsToGraduation > 10) {
    errors.push('Years to graduation must be between 0 and 10');
  }

  if (inputs.annualLoanAmount < 0) {
    errors.push('Annual loan amount cannot be negative');
  }

  if (inputs.currentBalance < 0) {
    errors.push('Current balance cannot be negative');
  }

  if (inputs.loanTerm <= 0 || inputs.loanTerm > 50) {
    errors.push('Loan term must be between 1 and 50 years');
  }

  if (inputs.gracePeriod < 0 || inputs.gracePeriod > 12) {
    errors.push('Grace period must be between 0 and 12 months');
  }

  if (inputs.interestRate < 0 || inputs.interestRate > 100) {
    errors.push('Interest rate must be between 0 and 100');
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
  const remainingMonths = Math.round(months % 12);

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}
