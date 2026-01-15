// Credit Card Calculator Calculation Logic

export interface CreditCardInputs {
  balance: number;
  apr: number;
  paymentType: 'minimum' | 'fixed' | 'timeframe';
  fixedPayment: number;
  payoffMonths: number;
}

export interface PaymentComparison {
  type: 'minimum' | 'current' | 'double' | 'extra';
  payment: number;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  interestSaved?: number;
  timeSaved?: number;
}

export interface AmortizationMonth {
  month: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

export interface CreditCardResults {
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  effectiveAPR: number;
  minimumPayment: number;
  paymentComparisons: PaymentComparison[];
  amortizationSchedule: AmortizationMonth[];
  dailyInterestRate: number;
  monthlyInterestRate: number;
  firstMonthInterest: number;
  lastPayment: number;
}

// Calculate minimum payment (1% of balance + monthly interest, minimum $15)
export function calculateMinimumPayment(balance: number, apr: number): number {
  if (balance <= 0) return 0;

  // If balance is less than $15, pay it all
  if (balance < 15) return balance;

  // Calculate 1% of balance
  const onePercent = balance * 0.01;

  // Calculate monthly interest
  const monthlyInterest = (balance * (apr / 100)) / 12;

  // Minimum payment is 1% + interest, but at least $15
  const calculatedMinimum = onePercent + monthlyInterest;

  return Math.max(15, calculatedMinimum);
}

// Calculate payment needed to pay off in specific timeframe
export function calculatePaymentForTimeframe(
  balance: number,
  apr: number,
  months: number
): number {
  if (months <= 0 || balance <= 0) return 0;

  const monthlyRate = apr / 100 / 12;

  if (monthlyRate === 0) {
    // No interest, simple division
    return balance / months;
  }

  // Using loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
  const payment =
    (balance * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return payment;
}

// Calculate payoff details for a given payment amount
export function calculatePayoffDetails(
  balance: number,
  apr: number,
  payment: number,
  isMinimumPayment: boolean = false
): {
  months: number;
  totalInterest: number;
  totalPaid: number;
  lastPayment: number;
} {
  if (balance <= 0 || payment <= 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0, lastPayment: 0 };
  }

  const monthlyRate = apr / 100 / 12;
  let remainingBalance = balance;
  let totalInterest = 0;
  let months = 0;
  let lastPayment = 0;
  let totalPaid = 0;

  // Cap at 600 months (50 years) to prevent infinite loops
  const maxMonths = 600;

  while (remainingBalance > 0.01 && months < maxMonths) {
    months++;
    const interestCharge = remainingBalance * monthlyRate;

    // For minimum payment, recalculate each month as balance decreases
    let currentPayment = payment;
    if (isMinimumPayment) {
      currentPayment = calculateMinimumPayment(remainingBalance, apr);
    }

    const principalPayment = currentPayment - interestCharge;

    // Check if payment covers interest
    if (principalPayment <= 0 && currentPayment < remainingBalance) {
      // Payment doesn't cover interest, balance will grow
      return {
        months: maxMonths,
        totalInterest: balance * 2, // Estimate
        totalPaid: currentPayment * maxMonths,
        lastPayment: currentPayment,
      };
    }

    totalInterest += interestCharge;

    if (currentPayment >= remainingBalance + interestCharge) {
      // Final payment
      lastPayment = remainingBalance + interestCharge;
      totalPaid += lastPayment;
      remainingBalance = 0;
    } else {
      remainingBalance -= principalPayment;
      lastPayment = currentPayment;
      totalPaid += currentPayment;
    }
  }

  return { months, totalInterest, totalPaid, lastPayment };
}

// Generate amortization schedule
export function generateAmortizationSchedule(
  balance: number,
  apr: number,
  payment: number,
  maxMonths: number = 60
): AmortizationMonth[] {
  const schedule: AmortizationMonth[] = [];
  const monthlyRate = apr / 100 / 12;
  let remainingBalance = balance;
  let month = 0;

  while (remainingBalance > 0.01 && month < maxMonths) {
    month++;
    const interestPaid = remainingBalance * monthlyRate;
    let actualPayment = payment;
    let principalPaid = payment - interestPaid;

    // Handle last payment
    if (payment >= remainingBalance + interestPaid) {
      actualPayment = remainingBalance + interestPaid;
      principalPaid = remainingBalance;
      remainingBalance = 0;
    } else {
      remainingBalance -= principalPaid;
    }

    schedule.push({
      month,
      payment: actualPayment,
      interestPaid,
      principalPaid,
      remainingBalance: Math.max(0, remainingBalance),
    });

    if (remainingBalance === 0) break;
  }

  return schedule;
}

// Main calculation function
export function calculateCreditCardPayoff(
  inputs: CreditCardInputs
): CreditCardResults {
  const { balance, apr, paymentType, fixedPayment, payoffMonths } = inputs;

  // Calculate daily and monthly interest rates
  const dailyInterestRate = apr / 365 / 100;
  const monthlyInterestRate = apr / 12 / 100;
  const firstMonthInterest = balance * monthlyInterestRate;

  // Calculate minimum payment
  const minimumPayment = calculateMinimumPayment(balance, apr);

  // Determine the payment amount based on payment type
  let monthlyPayment: number;

  switch (paymentType) {
    case 'minimum':
      monthlyPayment = minimumPayment;
      break;
    case 'fixed':
      monthlyPayment = fixedPayment;
      break;
    case 'timeframe':
      monthlyPayment = calculatePaymentForTimeframe(balance, apr, payoffMonths);
      break;
    default:
      monthlyPayment = minimumPayment;
  }

  // Calculate payoff details for current payment
  const currentPayoff =
    paymentType === 'timeframe'
      ? {
          months: payoffMonths,
          totalInterest: monthlyPayment * payoffMonths - balance,
          totalPaid: monthlyPayment * payoffMonths,
          lastPayment: monthlyPayment,
        }
      : calculatePayoffDetails(
          balance,
          apr,
          monthlyPayment,
          paymentType === 'minimum'
        );

  // Generate payment comparisons
  const paymentComparisons: PaymentComparison[] = [];

  // Minimum payment comparison
  if (paymentType !== 'minimum') {
    const minPayoff = calculatePayoffDetails(
      balance,
      apr,
      minimumPayment,
      true
    );
    paymentComparisons.push({
      type: 'minimum',
      payment: minimumPayment,
      monthsToPayoff: minPayoff.months,
      totalInterest: minPayoff.totalInterest,
      totalPaid: minPayoff.totalPaid,
    });
  }

  // Current payment
  paymentComparisons.push({
    type: 'current',
    payment: monthlyPayment,
    monthsToPayoff: currentPayoff.months,
    totalInterest: currentPayoff.totalInterest,
    totalPaid: currentPayoff.totalPaid,
  });

  // Double payment comparison
  if (paymentType === 'fixed' || paymentType === 'minimum') {
    const doublePayment = monthlyPayment * 2;
    const doublePayoff = calculatePayoffDetails(
      balance,
      apr,
      doublePayment,
      false
    );
    paymentComparisons.push({
      type: 'double',
      payment: doublePayment,
      monthsToPayoff: doublePayoff.months,
      totalInterest: doublePayoff.totalInterest,
      totalPaid: doublePayoff.totalPaid,
      interestSaved: currentPayoff.totalInterest - doublePayoff.totalInterest,
      timeSaved: currentPayoff.months - doublePayoff.months,
    });
  }

  // Extra $50 payment comparison (only if not minimum payment mode)
  if (paymentType === 'fixed') {
    const extraPayment = monthlyPayment + 50;
    const extraPayoff = calculatePayoffDetails(
      balance,
      apr,
      extraPayment,
      false
    );
    paymentComparisons.push({
      type: 'extra',
      payment: extraPayment,
      monthsToPayoff: extraPayoff.months,
      totalInterest: extraPayoff.totalInterest,
      totalPaid: extraPayoff.totalPaid,
      interestSaved: currentPayoff.totalInterest - extraPayoff.totalInterest,
      timeSaved: currentPayoff.months - extraPayoff.months,
    });
  }

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    balance,
    apr,
    monthlyPayment,
    Math.min(currentPayoff.months, 60) // Limit to 60 months for display
  );

  // Calculate effective APR (considering compounding)
  const effectiveAPR = (Math.pow(1 + monthlyInterestRate, 12) - 1) * 100;

  return {
    monthlyPayment,
    monthsToPayoff: currentPayoff.months,
    totalInterest: currentPayoff.totalInterest,
    totalPaid: currentPayoff.totalPaid,
    effectiveAPR,
    minimumPayment,
    paymentComparisons,
    amortizationSchedule,
    dailyInterestRate,
    monthlyInterestRate,
    firstMonthInterest,
    lastPayment: currentPayoff.lastPayment,
  };
}

// Validation function
export function validateCreditCardInputs(inputs: CreditCardInputs): string[] {
  const errors: string[] = [];
  const { balance, apr, paymentType, fixedPayment, payoffMonths } = inputs;

  if (balance <= 0) {
    errors.push('Balance must be greater than $0');
  }

  if (balance > 999999) {
    errors.push('Balance must be less than $1,000,000');
  }

  if (apr < 0) {
    errors.push('APR cannot be negative');
  }

  if (apr > 40) {
    errors.push('APR must be between 0% and 40%');
  }

  if (paymentType === 'fixed') {
    if (fixedPayment < 15) {
      errors.push('Fixed payment must be at least $15');
    }

    if (fixedPayment > balance) {
      errors.push('Fixed payment cannot exceed the balance');
    }

    // Check if payment covers interest
    const monthlyInterest = (balance * (apr / 100)) / 12;
    if (fixedPayment <= monthlyInterest) {
      errors.push(
        `Payment must be greater than the monthly interest of ${formatCurrency(monthlyInterest)}`
      );
    }
  }

  if (paymentType === 'timeframe') {
    if (payoffMonths < 1) {
      errors.push('Payoff timeframe must be at least 1 month');
    }

    if (payoffMonths > 360) {
      errors.push('Payoff timeframe cannot exceed 30 years (360 months)');
    }
  }

  return errors;
}

// Formatting utilities
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonths(months: number): string {
  if (months === 0) return '0 months';
  if (months === 1) return '1 month';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} months`;
  }

  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const yearText = years === 1 ? '1 year' : `${years} years`;
  const monthText =
    remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;

  return `${yearText} ${monthText}`;
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
