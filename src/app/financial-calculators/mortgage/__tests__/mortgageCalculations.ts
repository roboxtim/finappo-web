/**
 * Mortgage Calculation Library
 * Based on standard amortization formulas matching calculator.net methodology
 */

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
  propertyTax: number; // annual amount
  homeInsurance: number; // annual amount
  pmi: number; // annual amount
  hoaFee: number; // monthly amount
  otherCosts: number; // monthly amount
  startDate?: Date;
}

export interface ExtraPayments {
  monthlyExtra: number;
  monthlyExtraStartMonth: number; // 1-based month number
  yearlyExtra: number;
  yearlyExtraStartMonth: number;
  oneTimePayments: Array<{
    amount: number;
    month: number; // 1-based month number
  }>;
}

export interface MonthlyPaymentBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoaFee: number;
  otherCosts: number;
  totalMonthly: number;
}

export interface AmortizationRow {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface MortgageResults {
  loanAmount: number;
  monthlyPayment: MonthlyPaymentBreakdown;
  totalPayments: {
    totalMortgagePayment: number;
    totalInterest: number;
    totalOfAllPayments: number;
    totalPropertyTax: number;
    totalHomeInsurance: number;
    totalPMI: number;
    totalHOA: number;
    totalOtherCosts: number;
  };
  payoffDate: Date;
  amortizationSchedule: AmortizationRow[];
}

/**
 * Calculate monthly mortgage payment (principal + interest only)
 * Using standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  if (annualRate === 0) return principal / (termYears * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return payment;
}

/**
 * Calculate loan amount from home price and down payment
 */
export function calculateLoanAmount(
  homePrice: number,
  downPayment: number
): number {
  return Math.max(0, homePrice - downPayment);
}

/**
 * Determine if PMI is required (less than 20% down payment)
 */
export function isPMIRequired(homePrice: number, downPayment: number): boolean {
  return downPayment / homePrice < 0.2;
}

/**
 * Calculate PMI removal month (when loan balance reaches 78% of original home value)
 */
export function calculatePMIRemovalMonth(
  homePrice: number,
  schedule: AmortizationRow[]
): number | null {
  const pmiRemovalThreshold = homePrice * 0.78;

  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].balance <= pmiRemovalThreshold) {
      return i + 1;
    }
  }

  return null;
}

/**
 * Generate complete amortization schedule
 */
export function generateAmortizationSchedule(
  inputs: MortgageInputs,
  extraPayments?: ExtraPayments
): AmortizationRow[] {
  const loanAmount = calculateLoanAmount(inputs.homePrice, inputs.downPayment);
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numberOfPayments = inputs.loanTerm * 12;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  const schedule: AmortizationRow[] = [];
  let remainingBalance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  const startDate = inputs.startDate || new Date(2026, 0, 1); // Default to Jan 1, 2026

  for (let month = 1; month <= numberOfPayments; month++) {
    if (remainingBalance <= 0) break;

    // Calculate interest for this month
    const interestPayment = remainingBalance * monthlyRate;

    // Calculate principal payment
    let principalPayment = monthlyPayment - interestPayment;

    // Calculate extra payment for this month
    let extraPayment = 0;

    if (extraPayments) {
      // Monthly extra payment
      if (
        extraPayments.monthlyExtra > 0 &&
        month >= extraPayments.monthlyExtraStartMonth
      ) {
        extraPayment += extraPayments.monthlyExtra;
      }

      // Yearly extra payment (on anniversary month)
      if (
        extraPayments.yearlyExtra > 0 &&
        month >= extraPayments.yearlyExtraStartMonth &&
        (month - extraPayments.yearlyExtraStartMonth) % 12 === 0
      ) {
        extraPayment += extraPayments.yearlyExtra;
      }

      // One-time payments
      const oneTimePayment = extraPayments.oneTimePayments.find(
        (p) => p.month === month
      );
      if (oneTimePayment) {
        extraPayment += oneTimePayment.amount;
      }
    }

    // Ensure we don't overpay
    const totalPaymentThisMonth = principalPayment + extraPayment;
    if (totalPaymentThisMonth > remainingBalance) {
      principalPayment = remainingBalance;
      extraPayment = 0;
    } else if (extraPayment > 0 && principalPayment + extraPayment > remainingBalance) {
      extraPayment = remainingBalance - principalPayment;
    }

    // Update balance
    remainingBalance -= (principalPayment + extraPayment);
    remainingBalance = Math.max(0, remainingBalance);

    // Update cumulative values
    cumulativePrincipal += principalPayment + extraPayment;
    cumulativeInterest += interestPayment;

    // Calculate date for this payment
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + month - 1);

    schedule.push({
      month,
      date: paymentDate,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      extraPayment,
      balance: remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });

    // Stop if loan is paid off
    if (remainingBalance === 0) break;
  }

  return schedule;
}

/**
 * Calculate complete mortgage results
 */
export function calculateMortgage(
  inputs: MortgageInputs,
  extraPayments?: ExtraPayments
): MortgageResults {
  const loanAmount = calculateLoanAmount(inputs.homePrice, inputs.downPayment);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  const schedule = generateAmortizationSchedule(inputs, extraPayments);

  // Calculate monthly breakdown
  const monthlyPropertyTax = inputs.propertyTax / 12;
  const monthlyHomeInsurance = inputs.homeInsurance / 12;
  const monthlyPMI = isPMIRequired(inputs.homePrice, inputs.downPayment)
    ? inputs.pmi / 12
    : 0;

  const monthlyBreakdown: MonthlyPaymentBreakdown = {
    principalAndInterest: monthlyPayment,
    propertyTax: monthlyPropertyTax,
    homeInsurance: monthlyHomeInsurance,
    pmi: monthlyPMI,
    hoaFee: inputs.hoaFee,
    otherCosts: inputs.otherCosts,
    totalMonthly:
      monthlyPayment +
      monthlyPropertyTax +
      monthlyHomeInsurance +
      monthlyPMI +
      inputs.hoaFee +
      inputs.otherCosts,
  };

  // Calculate totals
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalMortgagePayment = loanAmount + totalInterest;
  const actualMonths = schedule.length;

  // PMI is only paid until 78% LTV is reached
  const pmiRemovalMonth = calculatePMIRemovalMonth(inputs.homePrice, schedule);
  const pmiMonths = pmiRemovalMonth || actualMonths;

  const totalPropertyTax = monthlyPropertyTax * actualMonths;
  const totalHomeInsurance = monthlyHomeInsurance * actualMonths;
  const totalPMI = monthlyPMI * pmiMonths;
  const totalHOA = inputs.hoaFee * actualMonths;
  const totalOtherCosts = inputs.otherCosts * actualMonths;

  const totalOfAllPayments =
    totalMortgagePayment +
    totalPropertyTax +
    totalHomeInsurance +
    totalPMI +
    totalHOA +
    totalOtherCosts;

  // Calculate payoff date
  const startDate = inputs.startDate || new Date(2026, 0, 1);
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(startDate.getMonth() + actualMonths);

  return {
    loanAmount,
    monthlyPayment: monthlyBreakdown,
    totalPayments: {
      totalMortgagePayment,
      totalInterest,
      totalOfAllPayments,
      totalPropertyTax,
      totalHomeInsurance,
      totalPMI,
      totalHOA,
      totalOtherCosts,
    },
    payoffDate,
    amortizationSchedule: schedule,
  };
}

/**
 * Calculate monthly payment including all costs
 */
export function calculateTotalMonthlyPayment(
  inputs: MortgageInputs
): MonthlyPaymentBreakdown {
  const loanAmount = calculateLoanAmount(inputs.homePrice, inputs.downPayment);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  const monthlyPropertyTax = inputs.propertyTax / 12;
  const monthlyHomeInsurance = inputs.homeInsurance / 12;
  const monthlyPMI = isPMIRequired(inputs.homePrice, inputs.downPayment)
    ? inputs.pmi / 12
    : 0;

  return {
    principalAndInterest: monthlyPayment,
    propertyTax: monthlyPropertyTax,
    homeInsurance: monthlyHomeInsurance,
    pmi: monthlyPMI,
    hoaFee: inputs.hoaFee,
    otherCosts: inputs.otherCosts,
    totalMonthly:
      monthlyPayment +
      monthlyPropertyTax +
      monthlyHomeInsurance +
      monthlyPMI +
      inputs.hoaFee +
      inputs.otherCosts,
  };
}
