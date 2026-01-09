// Types and Interfaces
export type PaymentFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'semimonthly'
  | 'biweekly';

export interface AnnuityInput {
  principal: number;
  annualRate: number;
  years?: number;
  payoutAmount?: number;
  frequency: PaymentFrequency;
}

export interface AnnuityResult {
  payoutAmount: number;
  totalPayments: number;
  totalPayout: number;
  totalInterest: number;
  years?: number;
  willGrow?: boolean;
  schedule?: AmortizationEntry[];
}

export interface AmortizationEntry {
  year: number;
  beginningBalance: number;
  interest: number;
  principal: number;
  payment: number;
  endingBalance: number;
}

// Helper function to get payments per year based on frequency
export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  const frequencyMap: Record<PaymentFrequency, number> = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    semimonthly: 24,
    biweekly: 26,
  };
  return frequencyMap[frequency];
}

// Calculate annuity payout amount (Fixed Length mode)
export function calculateAnnuityPayout(input: {
  principal: number;
  annualRate: number;
  years: number;
  frequency: PaymentFrequency;
}): AnnuityResult {
  const { principal, annualRate, years, frequency } = input;

  const paymentsPerYear = getPaymentsPerYear(frequency);
  const totalPayments = years * paymentsPerYear;
  const periodicRate = annualRate / 100 / paymentsPerYear;

  let payoutAmount: number;

  if (annualRate === 0) {
    // If no interest, simply divide principal by total payments
    payoutAmount = principal / totalPayments;
  } else {
    // Use the annuity present value formula to calculate payment
    // PMT = PV × [r(1 + r)^n] / [(1 + r)^n - 1]
    const factor = Math.pow(1 + periodicRate, totalPayments);
    payoutAmount = (principal * (periodicRate * factor)) / (factor - 1);
  }

  const totalPayout = payoutAmount * totalPayments;
  const totalInterest = totalPayout - principal;

  // Generate amortization schedule
  const schedule = generateAmortizationSchedule({
    principal,
    annualRate,
    years,
    frequency,
  });

  return {
    payoutAmount,
    totalPayments,
    totalPayout,
    totalInterest,
    schedule,
  };
}

// Calculate payout duration (Fixed Payment mode)
export function calculatePayoutDuration(input: {
  principal: number;
  annualRate: number;
  payoutAmount: number;
  frequency: PaymentFrequency;
}): AnnuityResult {
  const { principal, annualRate, payoutAmount, frequency } = input;

  const paymentsPerYear = getPaymentsPerYear(frequency);
  const periodicRate = annualRate / 100 / paymentsPerYear;

  // Check if payment is less than or equal to interest earned
  const firstPeriodInterest = principal * periodicRate;

  if (payoutAmount <= firstPeriodInterest) {
    // Annuity will grow or never deplete
    return {
      payoutAmount,
      totalPayments: Infinity,
      totalPayout: Infinity,
      totalInterest: Infinity,
      years: Infinity,
      willGrow: payoutAmount < firstPeriodInterest,
    };
  }

  let totalPayments: number;

  if (annualRate === 0) {
    // If no interest, simple division
    totalPayments = principal / payoutAmount;
  } else {
    // Use logarithmic formula to calculate number of payments
    // n = log(PMT / (PMT - PV × r)) / log(1 + r)
    const numerator = Math.log(
      payoutAmount / (payoutAmount - principal * periodicRate)
    );
    const denominator = Math.log(1 + periodicRate);
    totalPayments = numerator / denominator;
  }

  const years = totalPayments / paymentsPerYear;
  const totalPayout = payoutAmount * Math.ceil(totalPayments);
  const totalInterest = totalPayout - principal;

  return {
    payoutAmount,
    totalPayments: Math.ceil(totalPayments),
    totalPayout,
    totalInterest,
    years,
    willGrow: false,
  };
}

// Calculate total payout
export function calculateTotalPayout(
  payoutAmount: number,
  totalPayments: number
): number {
  return payoutAmount * totalPayments;
}

// Calculate total interest earned
export function calculateTotalInterest(
  totalPayout: number,
  principal: number
): number {
  return totalPayout - principal;
}

// Generate year-by-year amortization schedule
export function generateAmortizationSchedule(input: {
  principal: number;
  annualRate: number;
  years: number;
  frequency: PaymentFrequency;
}): AmortizationEntry[] {
  const { principal, annualRate, years, frequency } = input;

  const paymentsPerYear = getPaymentsPerYear(frequency);
  const periodicRate = annualRate / 100 / paymentsPerYear;
  const totalPayments = years * paymentsPerYear;

  // Calculate the periodic payment amount
  let paymentAmount: number;

  if (annualRate === 0) {
    paymentAmount = principal / totalPayments;
  } else {
    const factor = Math.pow(1 + periodicRate, totalPayments);
    paymentAmount = (principal * (periodicRate * factor)) / (factor - 1);
  }

  const schedule: AmortizationEntry[] = [];
  let balance = principal;

  // Generate schedule year by year
  for (let year = 1; year <= years; year++) {
    const beginningBalance = balance;
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;
    let yearlyPayment = 0;

    // Calculate for each payment period in the year
    for (let period = 0; period < paymentsPerYear; period++) {
      if (balance > 0) {
        const periodInterest = balance * periodicRate;
        const periodPrincipal = Math.min(
          paymentAmount - periodInterest,
          balance
        );

        yearlyInterest += periodInterest;
        yearlyPrincipal += periodPrincipal;
        yearlyPayment += paymentAmount;

        balance -= periodPrincipal;

        // Handle rounding for last payment
        if (balance < 0.01) {
          balance = 0;
        }
      }
    }

    schedule.push({
      year,
      beginningBalance,
      interest: yearlyInterest,
      principal: yearlyPrincipal,
      payment: yearlyPayment,
      endingBalance: balance,
    });
  }

  return schedule;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format percentage for display
export function formatPercentage(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

// Validate input values
export function validateAnnuityInput(input: Partial<AnnuityInput>): string[] {
  const errors: string[] = [];

  if (input.principal !== undefined) {
    if (input.principal <= 0) {
      errors.push('Starting principal must be greater than 0');
    }
    if (input.principal > 100000000) {
      errors.push('Starting principal must be less than $100,000,000');
    }
  }

  if (input.annualRate !== undefined) {
    if (input.annualRate < 0) {
      errors.push('Interest rate cannot be negative');
    }
    if (input.annualRate > 50) {
      errors.push('Interest rate must be less than 50%');
    }
  }

  if (input.years !== undefined) {
    if (input.years <= 0) {
      errors.push('Years must be greater than 0');
    }
    if (input.years > 100) {
      errors.push('Years must be less than 100');
    }
  }

  if (input.payoutAmount !== undefined) {
    if (input.payoutAmount <= 0) {
      errors.push('Payout amount must be greater than 0');
    }
  }

  return errors;
}
