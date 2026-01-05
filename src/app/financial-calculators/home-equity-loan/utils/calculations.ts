/**
 * Home Equity Loan Calculator Utility Functions
 * Implements calculations based on calculator.net/home-equity-loan-calculator.html
 */

export interface LoanDetails {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principalAmount: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface EquityDetails {
  homeValue: number;
  mortgageBalance: number;
  availableEquity: number;
  currentLTV: number;
  maxBorrowable: number;
  remainingEquity: number;
  cltvAfterLoan: number;
}

/**
 * Calculate monthly payment for a home equity loan
 * Uses standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1]
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  if (loanAmount <= 0 || loanTermYears <= 0) return 0;

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Handle 0% interest rate
  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }

  const payment = loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return payment;
}

/**
 * Calculate complete loan details including total payment and interest
 */
export function calculateLoanDetails(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): LoanDetails {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears);
  const numberOfPayments = loanTermYears * 12;
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    principalAmount: loanAmount
  };
}

/**
 * Generate complete amortization schedule
 */
export function calculateAmortizationSchedule(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): AmortizationRow[] {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, loanTermYears);
  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  const schedule: AmortizationRow[] = [];
  let remainingBalance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;

    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    // Handle last payment rounding
    if (month === numberOfPayments && remainingBalance < 0.01) {
      remainingBalance = 0;
    }

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
      cumulativePrincipal,
      cumulativeInterest
    });
  }

  return schedule;
}

/**
 * Calculate Loan-to-Value ratio (current mortgage / home value)
 */
export function calculateLTV(mortgageBalance: number, homeValue: number): number {
  if (homeValue <= 0) return 0;
  return (mortgageBalance / homeValue) * 100;
}

/**
 * Calculate Combined Loan-to-Value ratio (current mortgage + new loan / home value)
 */
export function calculateCLTV(
  mortgageBalance: number,
  newLoanAmount: number,
  homeValue: number
): number {
  if (homeValue <= 0) return 0;
  return ((mortgageBalance + newLoanAmount) / homeValue) * 100;
}

/**
 * Calculate maximum borrowable amount based on LTV limit
 */
export function calculateMaxBorrowable(
  homeValue: number,
  mortgageBalance: number,
  maxLTVPercent: number
): number {
  const maxTotalDebt = homeValue * (maxLTVPercent / 100);
  const maxBorrowable = maxTotalDebt - mortgageBalance;
  return Math.max(0, maxBorrowable);
}

/**
 * Calculate available home equity
 */
export function calculateAvailableEquity(
  homeValue: number,
  mortgageBalance: number
): number {
  return homeValue - mortgageBalance;
}

/**
 * Calculate complete equity details
 */
export function calculateEquityDetails(
  homeValue: number,
  mortgageBalance: number,
  loanAmount: number,
  maxLTVPercent: number
): EquityDetails {
  const availableEquity = calculateAvailableEquity(homeValue, mortgageBalance);
  const currentLTV = calculateLTV(mortgageBalance, homeValue);
  const maxBorrowable = calculateMaxBorrowable(homeValue, mortgageBalance, maxLTVPercent);
  const cltvAfterLoan = calculateCLTV(mortgageBalance, loanAmount, homeValue);
  const remainingEquity = availableEquity - loanAmount;

  return {
    homeValue,
    mortgageBalance,
    availableEquity,
    currentLTV,
    maxBorrowable,
    remainingEquity,
    cltvAfterLoan
  };
}

/**
 * Get annual summary from monthly amortization schedule
 */
export function getAnnualSummary(schedule: AmortizationRow[]): Array<{
  year: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  endingBalance: number;
}> {
  const annualData = [];
  const yearsCount = Math.ceil(schedule.length / 12);

  for (let year = 1; year <= yearsCount; year++) {
    const startMonth = (year - 1) * 12;
    const endMonth = Math.min(year * 12, schedule.length);
    const yearMonths = schedule.slice(startMonth, endMonth);

    const totalPayment = yearMonths.reduce((sum, month) => sum + month.payment, 0);
    const totalPrincipal = yearMonths.reduce((sum, month) => sum + month.principal, 0);
    const totalInterest = yearMonths.reduce((sum, month) => sum + month.interest, 0);
    const endingBalance = yearMonths[yearMonths.length - 1]?.balance || 0;

    annualData.push({
      year,
      totalPayment,
      totalPrincipal,
      totalInterest,
      endingBalance
    });
  }

  return annualData;
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Parse formatted number string to number
 */
export function parseFormattedNumber(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0;
}

/**
 * Validate loan parameters
 */
export function validateLoanParameters(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0');
  }
  if (loanAmount > 1000000) {
    errors.push('Most lenders cap home equity loans at $1,000,000');
  }
  if (interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  }
  if (interestRate > 50) {
    errors.push('Interest rate seems unusually high');
  }
  if (loanTermYears <= 0) {
    errors.push('Loan term must be greater than 0');
  }
  if (loanTermYears > 30) {
    errors.push('Loan term typically does not exceed 30 years');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if borrower qualifies based on LTV
 */
export function checkQualification(
  homeValue: number,
  mortgageBalance: number,
  requestedLoan: number,
  maxLTVPercent: number
): { qualified: boolean; message: string } {
  const currentLTV = calculateLTV(mortgageBalance, homeValue);
  const cltvAfterLoan = calculateCLTV(mortgageBalance, requestedLoan, homeValue);
  const maxBorrowable = calculateMaxBorrowable(homeValue, mortgageBalance, maxLTVPercent);

  if (currentLTV > maxLTVPercent) {
    return {
      qualified: false,
      message: `Your current LTV of ${currentLTV.toFixed(1)}% exceeds the maximum allowed ${maxLTVPercent}%. You may not qualify for a home equity loan.`
    };
  }

  if (requestedLoan > maxBorrowable) {
    return {
      qualified: false,
      message: `The requested loan amount exceeds the maximum borrowable amount of ${formatCurrency(maxBorrowable)} based on ${maxLTVPercent}% LTV limit.`
    };
  }

  if (cltvAfterLoan > maxLTVPercent) {
    return {
      qualified: false,
      message: `This loan would result in a CLTV of ${cltvAfterLoan.toFixed(1)}%, exceeding the ${maxLTVPercent}% limit.`
    };
  }

  return {
    qualified: true,
    message: 'You appear to qualify for this home equity loan based on LTV requirements.'
  };
}