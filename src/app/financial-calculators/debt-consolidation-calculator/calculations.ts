// Debt Consolidation Calculator Types
export interface ExistingDebt {
  name: string;
  balance: number;
  monthlyPayment: number;
  interestRate: number;
}

export interface ConsolidationLoan {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  loanTermMonths: number;
  loanFeePercent: number;
}

export interface ConsolidationInputs {
  existingDebts: ExistingDebt[];
  consolidationLoan: ConsolidationLoan;
}

export interface DebtSummary {
  totalBalance: number;
  totalMonthlyPayment: number;
  weightedAverageRate: number;
  totalInterest: number;
  payoffMonths: number;
}

export interface ConsolidationSummary {
  monthlyPayment: number;
  totalInterest: number;
  payoffMonths: number;
  totalCost: number;
  realAPR: number;
  loanFeeDollar: number;
}

export interface ConsolidationResults {
  existingDebts: DebtSummary;
  consolidatedLoan: ConsolidationSummary;
  savings: {
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    timeMonths: number;
  };
  isWorthwhile: boolean;
  recommendation: string;
}

/**
 * Calculate monthly payment for a loan using amortization formula
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
 * Calculate total interest paid on a loan
 */
export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  months: number
): number {
  return monthlyPayment * months - principal;
}

/**
 * Calculate number of months to pay off a debt with fixed monthly payment
 */
export function calculatePayoffMonths(
  balance: number,
  monthlyPayment: number,
  annualRate: number
): number {
  if (annualRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }

  const monthlyRate = annualRate / 100 / 12;

  // If payment is less than or equal to interest, it will never be paid off
  if (monthlyPayment <= balance * monthlyRate) {
    return 999; // Return a large number to indicate it won't be paid off
  }

  const months =
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  return Math.ceil(months);
}

/**
 * Calculate weighted average interest rate for multiple debts
 */
export function calculateWeightedAverageRate(debts: ExistingDebt[]): number {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);

  if (totalBalance === 0) return 0;

  const weightedSum = debts.reduce(
    (sum, debt) => sum + debt.balance * debt.interestRate,
    0
  );

  return weightedSum / totalBalance;
}

/**
 * Calculate summary for existing debts
 */
export function calculateExistingDebtsSummary(
  debts: ExistingDebt[]
): DebtSummary {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMonthlyPayment = debts.reduce(
    (sum, debt) => sum + debt.monthlyPayment,
    0
  );
  const weightedAverageRate = calculateWeightedAverageRate(debts);

  // Calculate payoff time for each debt and find the longest
  let maxPayoffMonths = 0;
  let totalInterest = 0;

  debts.forEach((debt) => {
    const months = calculatePayoffMonths(
      debt.balance,
      debt.monthlyPayment,
      debt.interestRate
    );
    maxPayoffMonths = Math.max(maxPayoffMonths, months);

    const interest = calculateTotalInterest(
      debt.balance,
      debt.monthlyPayment,
      months
    );
    totalInterest += interest;
  });

  return {
    totalBalance,
    totalMonthlyPayment,
    weightedAverageRate,
    totalInterest,
    payoffMonths: maxPayoffMonths,
  };
}

/**
 * Calculate real APR including upfront fees
 */
export function calculateRealAPR(
  loanAmount: number,
  annualRate: number,
  months: number,
  loanFee: number
): number {
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    annualRate,
    months
  );
  const netLoanAmount = loanAmount - loanFee;

  // Use binary search to find the APR that makes the present value equal to net loan amount
  let low = 0;
  let high = 50;
  let realAPR = annualRate;

  for (let i = 0; i < 100; i++) {
    const testAPR = (low + high) / 2;
    const monthlyRate = testAPR / 100 / 12;

    let presentValue = 0;
    for (let month = 1; month <= months; month++) {
      presentValue += monthlyPayment / Math.pow(1 + monthlyRate, month);
    }

    if (Math.abs(presentValue - netLoanAmount) < 0.01) {
      realAPR = testAPR;
      break;
    }

    if (presentValue > netLoanAmount) {
      low = testAPR;
    } else {
      high = testAPR;
    }
  }

  return realAPR;
}

/**
 * Calculate summary for consolidation loan
 */
export function calculateConsolidationSummary(
  loan: ConsolidationLoan
): ConsolidationSummary {
  const totalMonths = loan.loanTermYears * 12 + loan.loanTermMonths;
  const loanFeeDollar = (loan.loanAmount * loan.loanFeePercent) / 100;

  const monthlyPayment = calculateMonthlyPayment(
    loan.loanAmount,
    loan.interestRate,
    totalMonths
  );

  const totalInterest = calculateTotalInterest(
    loan.loanAmount,
    monthlyPayment,
    totalMonths
  );

  const totalCost = totalInterest + loanFeeDollar;

  const realAPR = calculateRealAPR(
    loan.loanAmount,
    loan.interestRate,
    totalMonths,
    loanFeeDollar
  );

  return {
    monthlyPayment,
    totalInterest,
    payoffMonths: totalMonths,
    totalCost,
    realAPR,
    loanFeeDollar,
  };
}

/**
 * Main calculation function
 */
export function calculateDebtConsolidation(
  inputs: ConsolidationInputs
): ConsolidationResults {
  const existingDebts = calculateExistingDebtsSummary(inputs.existingDebts);
  const consolidatedLoan = calculateConsolidationSummary(
    inputs.consolidationLoan
  );

  const savings = {
    monthlyPayment:
      existingDebts.totalMonthlyPayment - consolidatedLoan.monthlyPayment,
    totalInterest: existingDebts.totalInterest - consolidatedLoan.totalCost,
    totalCost: existingDebts.totalInterest - consolidatedLoan.totalCost,
    timeMonths: existingDebts.payoffMonths - consolidatedLoan.payoffMonths,
  };

  // Determine if consolidation is worthwhile
  const isWorthwhile =
    consolidatedLoan.realAPR < existingDebts.weightedAverageRate &&
    savings.totalCost > 0;

  let recommendation = '';
  if (isWorthwhile) {
    recommendation =
      'Debt consolidation appears beneficial. You will save money on interest and potentially reduce your monthly payment.';
  } else if (consolidatedLoan.realAPR >= existingDebts.weightedAverageRate) {
    recommendation =
      'Warning: The consolidation loan has a higher real APR than your current debts. This may not be a good financial decision.';
  } else {
    recommendation =
      'Debt consolidation may not save you money overall. Consider other debt repayment strategies.';
  }

  return {
    existingDebts,
    consolidatedLoan,
    savings,
    isWorthwhile,
    recommendation,
  };
}

/**
 * Validate inputs
 */
export function validateConsolidationInputs(
  inputs: ConsolidationInputs
): string[] {
  const errors: string[] = [];

  if (inputs.existingDebts.length === 0) {
    errors.push('At least one existing debt is required');
  }

  inputs.existingDebts.forEach((debt, index) => {
    if (!debt.name || debt.name.trim() === '') {
      errors.push(`Debt ${index + 1}: Name is required`);
    }
    if (debt.balance <= 0) {
      errors.push(`Debt ${index + 1}: Balance must be greater than 0`);
    }
    if (debt.monthlyPayment <= 0) {
      errors.push(`Debt ${index + 1}: Monthly payment must be greater than 0`);
    }
    if (debt.interestRate < 0 || debt.interestRate > 100) {
      errors.push(`Debt ${index + 1}: Interest rate must be between 0 and 100`);
    }
  });

  if (inputs.consolidationLoan.loanAmount <= 0) {
    errors.push('Consolidation loan amount must be greater than 0');
  }

  if (
    inputs.consolidationLoan.interestRate < 0 ||
    inputs.consolidationLoan.interestRate > 100
  ) {
    errors.push('Consolidation loan interest rate must be between 0 and 100');
  }

  const totalMonths =
    inputs.consolidationLoan.loanTermYears * 12 +
    inputs.consolidationLoan.loanTermMonths;
  if (totalMonths <= 0) {
    errors.push('Loan term must be greater than 0');
  }

  if (inputs.consolidationLoan.loanFeePercent < 0) {
    errors.push('Loan fee cannot be negative');
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
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
