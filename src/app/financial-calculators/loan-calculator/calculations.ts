// Loan Calculator Types
export interface LoanInputs {
  loanAmount: number;
  interestRate: number; // Annual percentage rate
  loanTermYears: number;
  loanTermMonths: number;
  startDate: Date;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  extraPaymentAmount: number;
  extraPaymentFrequency: 'none' | 'monthly' | 'yearly' | 'one-time';
  oneTimePayment: number;
  oneTimePaymentDate: Date | null;
}

export interface LoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  numberOfPayments: number;
  payoffDate: Date;
  loanAmount: number;
  interestRate: number;
}

export interface AmortizationPayment {
  paymentNumber: number;
  date: Date;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  extraPayment: number;
  balance: number;
}

export interface ComparisonResults {
  withoutExtra: {
    totalInterest: number;
    totalPayment: number;
    payoffDate: Date;
    monthsSaved: number;
  };
  withExtra: {
    totalInterest: number;
    totalPayment: number;
    payoffDate: Date;
  };
  savings: {
    interestSaved: number;
    monthsSaved: number;
  };
}

// Validate loan inputs
export function validateLoanInputs(inputs: LoanInputs): string[] {
  const errors: string[] = [];

  if (inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0');
  }

  if (inputs.interestRate < 0 || inputs.interestRate > 100) {
    errors.push('Interest rate must be between 0 and 100');
  }

  if (inputs.loanTermYears === 0 && inputs.loanTermMonths === 0) {
    errors.push('Loan term must be greater than 0');
  }

  if (inputs.loanTermYears < 0 || inputs.loanTermMonths < 0) {
    errors.push('Loan term cannot be negative');
  }

  if (inputs.extraPaymentAmount < 0) {
    errors.push('Extra payment amount cannot be negative');
  }

  if (inputs.oneTimePayment < 0) {
    errors.push('One-time payment cannot be negative');
  }

  return errors;
}

// Calculate monthly payment using the standard loan formula
// M = P[r(1+r)^n]/[(1+r)^n-1]
// Where:
// M = Monthly payment
// P = Principal loan amount
// r = Monthly interest rate (annual rate / 12)
// n = Number of payments
export function calculateLoanPayment(inputs: LoanInputs): LoanResults {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    loanTermMonths,
    startDate,
    paymentFrequency,
  } = inputs;

  // Calculate total number of months
  const totalMonths = loanTermYears * 12 + loanTermMonths;

  // Adjust for payment frequency
  let numberOfPayments = totalMonths;
  let periodicRate = interestRate / 100 / 12; // Monthly rate

  if (paymentFrequency === 'bi-weekly') {
    numberOfPayments = Math.ceil((totalMonths * 12) / 26); // 26 bi-weekly periods per year
    periodicRate = interestRate / 100 / 26;
  } else if (paymentFrequency === 'weekly') {
    numberOfPayments = totalMonths * 4.33; // Approximate weeks per month
    periodicRate = interestRate / 100 / 52;
  }

  let monthlyPayment: number;

  // Handle zero interest rate special case
  if (interestRate === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    // Standard loan payment formula
    const onePlusR = 1 + periodicRate;
    const onePlusRtoN = Math.pow(onePlusR, numberOfPayments);
    monthlyPayment =
      (loanAmount * (periodicRate * onePlusRtoN)) / (onePlusRtoN - 1);
  }

  // Calculate total payment and interest (for monthly frequency)
  // We'll recalculate based on amortization schedule if extra payments are involved
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  // Calculate payoff date
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + totalMonths);

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    numberOfPayments: totalMonths,
    payoffDate,
    loanAmount,
    interestRate,
  };
}

// Generate detailed amortization schedule
export function calculateAmortizationSchedule(
  inputs: LoanInputs
): AmortizationPayment[] {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    loanTermMonths,
    startDate,
    extraPaymentAmount,
    extraPaymentFrequency,
    oneTimePayment,
    oneTimePaymentDate,
  } = inputs;

  const schedule: AmortizationPayment[] = [];
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12 + loanTermMonths;

  // Calculate base monthly payment (without extra payments)
  let monthlyPayment: number;
  if (interestRate === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    const onePlusR = 1 + monthlyRate;
    const onePlusRtoN = Math.pow(onePlusR, totalMonths);
    monthlyPayment =
      (loanAmount * (monthlyRate * onePlusRtoN)) / (onePlusRtoN - 1);
  }

  let remainingBalance = loanAmount;
  let paymentNumber = 1;
  const currentDate = new Date(startDate);

  // Continue until loan is paid off
  while (remainingBalance > 0.01 && paymentNumber <= totalMonths * 2) {
    // Safety check
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    // Determine extra payment for this period
    let extraPayment = 0;
    if (extraPaymentFrequency === 'monthly') {
      extraPayment = extraPaymentAmount;
    } else if (extraPaymentFrequency === 'yearly' && paymentNumber % 12 === 0) {
      extraPayment = extraPaymentAmount;
    } else if (
      extraPaymentFrequency === 'one-time' &&
      oneTimePaymentDate &&
      currentDate.getTime() >= oneTimePaymentDate.getTime() &&
      paymentNumber === 1
    ) {
      extraPayment = oneTimePayment;
    }

    // Apply one-time payment if the date matches
    if (
      oneTimePayment > 0 &&
      oneTimePaymentDate &&
      paymentNumber > 1 &&
      schedule[paymentNumber - 2]?.date.getTime() <
        oneTimePaymentDate.getTime() &&
      currentDate.getTime() >= oneTimePaymentDate.getTime()
    ) {
      extraPayment = oneTimePayment;
    }

    // Total principal payment including extra
    const totalPrincipalPayment = principalPayment + extraPayment;

    // If this is the last payment, adjust to pay off exactly
    if (totalPrincipalPayment >= remainingBalance) {
      principalPayment = remainingBalance - extraPayment;
      if (principalPayment < 0) {
        extraPayment = remainingBalance;
        principalPayment = 0;
      }
      remainingBalance = 0;
    } else {
      remainingBalance -= totalPrincipalPayment;
    }

    schedule.push({
      paymentNumber,
      date: new Date(currentDate),
      payment: monthlyPayment,
      principalPayment,
      interestPayment,
      extraPayment,
      balance: remainingBalance,
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    paymentNumber++;
  }

  return schedule;
}

// Calculate comparison with and without extra payments
export function calculateComparison(
  inputs: LoanInputs
): ComparisonResults | null {
  // Only calculate if there are extra payments
  if (inputs.extraPaymentAmount === 0 && inputs.oneTimePayment === 0) {
    return null;
  }

  // Calculate with extra payments
  const scheduleWithExtra = calculateAmortizationSchedule(inputs);
  const totalInterestWithExtra = scheduleWithExtra.reduce(
    (sum, payment) => sum + payment.interestPayment,
    0
  );
  const totalPaymentWithExtra = scheduleWithExtra.reduce(
    (sum, payment) => sum + payment.payment + payment.extraPayment,
    0
  );
  const payoffDateWithExtra =
    scheduleWithExtra[scheduleWithExtra.length - 1].date;

  // Calculate without extra payments
  const inputsNoExtra: LoanInputs = {
    ...inputs,
    extraPaymentAmount: 0,
    extraPaymentFrequency: 'none',
    oneTimePayment: 0,
    oneTimePaymentDate: null,
  };
  const scheduleNoExtra = calculateAmortizationSchedule(inputsNoExtra);
  const totalInterestNoExtra = scheduleNoExtra.reduce(
    (sum, payment) => sum + payment.interestPayment,
    0
  );
  const totalPaymentNoExtra = scheduleNoExtra.reduce(
    (sum, payment) => sum + payment.payment,
    0
  );
  const payoffDateNoExtra = scheduleNoExtra[scheduleNoExtra.length - 1].date;

  const monthsSaved = scheduleNoExtra.length - scheduleWithExtra.length;
  const interestSaved = totalInterestNoExtra - totalInterestWithExtra;

  return {
    withoutExtra: {
      totalInterest: totalInterestNoExtra,
      totalPayment: totalPaymentNoExtra,
      payoffDate: payoffDateNoExtra,
      monthsSaved,
    },
    withExtra: {
      totalInterest: totalInterestWithExtra,
      totalPayment: totalPaymentWithExtra,
      payoffDate: payoffDateWithExtra,
    },
    savings: {
      interestSaved,
      monthsSaved,
    },
  };
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Format month/year
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date);
}

// Calculate years and months from number of months
export function formatLoanTerm(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${
      remainingMonths !== 1 ? 's' : ''
    }`;
  }
}
