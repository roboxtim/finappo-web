/**
 * FHA Loan Calculation Library
 * Based on FHA guidelines and calculator.net methodology
 *
 * FHA Loan Rules:
 * - Minimum down payment: 3.5% (with credit score 580+) or 10% (with credit score 500-579)
 * - UFMIP (Upfront Mortgage Insurance Premium): 1.75% of base loan amount (can be financed)
 * - Annual MIP rates vary based on loan amount, LTV, and term
 * - MIP removal: Can be removed after 11 years if LTV ≤ 90% at origination, otherwise life of loan
 */

// FHA loan limits by year (2024 rates)
export const FHA_CONFORMING_LIMIT = 726200; // Standard conforming loan limit
export const UFMIP_RATE = 0.0175; // 1.75% upfront mortgage insurance premium

export interface FHALoanInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
  financeUFMIP: boolean; // whether to finance upfront MIP into loan
  propertyTax: number; // annual amount
  homeInsurance: number; // annual amount
  hoaFee: number; // monthly amount
  otherCosts: number; // monthly amount
  startDate?: Date;
}

export interface FHALoanDetails {
  baseLoanAmount: number;
  ufmipAmount: number;
  totalLoanAmount: number; // includes UFMIP if financed
  ltv: number; // loan-to-value ratio
  annualMIPRate: number;
  monthlyMIPAmount: number;
  mipDuration: number | null; // months, null means life of loan
}

export interface MonthlyPaymentBreakdown {
  principalAndInterest: number;
  monthlyMIP: number;
  propertyTax: number;
  homeInsurance: number;
  hoaFee: number;
  otherCosts: number;
  totalMonthly: number;
}

export interface AmortizationRow {
  month: number;
  date: Date;
  payment: number; // P&I only
  principal: number;
  interest: number;
  mipPayment: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  cumulativeMIP: number;
}

export interface FHALoanResults {
  loanDetails: FHALoanDetails;
  monthlyPayment: MonthlyPaymentBreakdown;
  totalPayments: {
    totalPrincipalAndInterest: number;
    totalInterest: number;
    totalMIP: number;
    totalPropertyTax: number;
    totalHomeInsurance: number;
    totalHOA: number;
    totalOtherCosts: number;
    totalOfAllPayments: number;
  };
  payoffDate: Date;
  amortizationSchedule: AmortizationRow[];
}

/**
 * Calculate base loan amount (home price - down payment)
 */
export function calculateBaseLoanAmount(
  homePrice: number,
  downPayment: number
): number {
  return Math.max(0, homePrice - downPayment);
}

/**
 * Calculate LTV (Loan-to-Value) ratio
 */
export function calculateLTV(homePrice: number, downPayment: number): number {
  if (homePrice <= 0) return 0;
  const baseLoanAmount = calculateBaseLoanAmount(homePrice, downPayment);
  return (baseLoanAmount / homePrice) * 100;
}

/**
 * Calculate UFMIP (Upfront Mortgage Insurance Premium)
 * UFMIP is always 1.75% of the base loan amount
 */
export function calculateUFMIP(baseLoanAmount: number): number {
  return baseLoanAmount * UFMIP_RATE;
}

/**
 * Calculate total loan amount including UFMIP if financed
 */
export function calculateTotalLoanAmount(
  baseLoanAmount: number,
  financeUFMIP: boolean
): number {
  if (financeUFMIP) {
    return baseLoanAmount + calculateUFMIP(baseLoanAmount);
  }
  return baseLoanAmount;
}

/**
 * Determine annual MIP rate based on FHA guidelines (2024 rates)
 *
 * For loans > 15 years:
 * - Base loan ≤ $726,200 and LTV ≤ 95%: 0.50%
 * - Base loan ≤ $726,200 and LTV > 95%: 0.55%
 * - Base loan > $726,200 and LTV ≤ 95%: 0.70%
 * - Base loan > $726,200 and LTV > 95%: 0.75%
 *
 * For loans ≤ 15 years:
 * - Base loan ≤ $726,200 and LTV ≤ 90%: 0.15%
 * - Base loan ≤ $726,200 and LTV > 90%: 0.40%
 * - Base loan > $726,200 and LTV ≤ 78%: 0.15%
 * - Base loan > $726,200 and LTV > 78% and LTV ≤ 90%: 0.40%
 * - Base loan > $726,200 and LTV > 90%: 0.65%
 */
export function getAnnualMIPRate(
  baseLoanAmount: number,
  ltv: number,
  loanTermYears: number
): number {
  const isHighBalance = baseLoanAmount > FHA_CONFORMING_LIMIT;

  if (loanTermYears > 15) {
    // Long-term loans (> 15 years)
    if (!isHighBalance) {
      // Standard conforming loans
      return ltv > 95 ? 0.55 : 0.50;
    } else {
      // High-balance loans
      return ltv > 95 ? 0.75 : 0.70;
    }
  } else {
    // Short-term loans (≤ 15 years)
    if (!isHighBalance) {
      // Standard conforming loans
      return ltv > 90 ? 0.40 : 0.15;
    } else {
      // High-balance loans
      if (ltv <= 78) return 0.15;
      if (ltv <= 90) return 0.40;
      return 0.65;
    }
  }
}

/**
 * Calculate monthly MIP amount
 * MIP is calculated on the base loan amount (not including UFMIP)
 */
export function calculateMonthlyMIP(
  baseLoanAmount: number,
  annualMIPRate: number
): number {
  return (baseLoanAmount * annualMIPRate) / 100 / 12;
}

/**
 * Determine MIP duration in months
 *
 * Rules:
 * - If LTV > 90% at origination: MIP for life of loan (return null)
 * - If LTV ≤ 90% at origination: MIP can be removed after 11 years (132 months)
 * - For loans ≤ 15 years with LTV ≤ 78%: MIP removed after 11 years
 */
export function getMIPDuration(ltv: number): number | null {
  if (ltv > 90) {
    // Life of loan for high LTV
    return null;
  } else {
    // 11 years (132 months) for LTV ≤ 90%
    return 132;
  }
}

/**
 * Calculate monthly payment (principal + interest only)
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
 * Generate complete amortization schedule for FHA loan
 */
export function generateFHAAmortizationSchedule(
  inputs: FHALoanInputs,
  loanDetails: FHALoanDetails
): AmortizationRow[] {
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numberOfPayments = inputs.loanTerm * 12;
  const monthlyPayment = calculateMonthlyPayment(
    loanDetails.totalLoanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  const schedule: AmortizationRow[] = [];
  let remainingBalance = loanDetails.totalLoanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  let cumulativeMIP = 0;

  const startDate = inputs.startDate || new Date(2026, 0, 1);
  const mipDuration = loanDetails.mipDuration;

  for (let month = 1; month <= numberOfPayments; month++) {
    if (remainingBalance <= 0) break;

    // Calculate interest for this month
    const interestPayment = remainingBalance * monthlyRate;

    // Calculate principal payment
    let principalPayment = monthlyPayment - interestPayment;

    // Ensure we don't overpay
    if (principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
    }

    // Update balance
    remainingBalance -= principalPayment;
    remainingBalance = Math.max(0, remainingBalance);

    // Calculate MIP payment for this month
    // MIP is paid only during the MIP duration period
    const mipPayment =
      mipDuration === null || month <= mipDuration
        ? loanDetails.monthlyMIPAmount
        : 0;

    // Update cumulative values
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;
    cumulativeMIP += mipPayment;

    // Calculate date for this payment
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + month - 1);

    schedule.push({
      month,
      date: paymentDate,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      mipPayment,
      balance: remainingBalance,
      cumulativePrincipal,
      cumulativeInterest,
      cumulativeMIP,
    });

    // Stop if loan is paid off
    if (remainingBalance === 0) break;
  }

  return schedule;
}

/**
 * Calculate complete FHA loan results
 */
export function calculateFHALoan(inputs: FHALoanInputs): FHALoanResults {
  // Step 1: Calculate base loan amount and LTV
  const baseLoanAmount = calculateBaseLoanAmount(
    inputs.homePrice,
    inputs.downPayment
  );
  const ltv = calculateLTV(inputs.homePrice, inputs.downPayment);

  // Step 2: Calculate UFMIP and total loan amount
  const ufmipAmount = calculateUFMIP(baseLoanAmount);
  const totalLoanAmount = calculateTotalLoanAmount(
    baseLoanAmount,
    inputs.financeUFMIP
  );

  // Step 3: Determine MIP rate and monthly MIP
  const annualMIPRate = getAnnualMIPRate(baseLoanAmount, ltv, inputs.loanTerm);
  const monthlyMIPAmount = calculateMonthlyMIP(baseLoanAmount, annualMIPRate);
  const mipDuration = getMIPDuration(ltv);

  const loanDetails: FHALoanDetails = {
    baseLoanAmount,
    ufmipAmount,
    totalLoanAmount,
    ltv,
    annualMIPRate,
    monthlyMIPAmount,
    mipDuration,
  };

  // Step 4: Calculate monthly payment (P&I)
  const monthlyPayment = calculateMonthlyPayment(
    totalLoanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  // Step 5: Generate amortization schedule
  const schedule = generateFHAAmortizationSchedule(inputs, loanDetails);

  // Step 6: Calculate monthly payment breakdown
  const monthlyPropertyTax = inputs.propertyTax / 12;
  const monthlyHomeInsurance = inputs.homeInsurance / 12;

  const monthlyBreakdown: MonthlyPaymentBreakdown = {
    principalAndInterest: monthlyPayment,
    monthlyMIP: monthlyMIPAmount,
    propertyTax: monthlyPropertyTax,
    homeInsurance: monthlyHomeInsurance,
    hoaFee: inputs.hoaFee,
    otherCosts: inputs.otherCosts,
    totalMonthly:
      monthlyPayment +
      monthlyMIPAmount +
      monthlyPropertyTax +
      monthlyHomeInsurance +
      inputs.hoaFee +
      inputs.otherCosts,
  };

  // Step 7: Calculate totals
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalMIP = schedule.reduce((sum, row) => sum + row.mipPayment, 0);
  const actualMonths = schedule.length;

  const totalPropertyTax = monthlyPropertyTax * actualMonths;
  const totalHomeInsurance = monthlyHomeInsurance * actualMonths;
  const totalHOA = inputs.hoaFee * actualMonths;
  const totalOtherCosts = inputs.otherCosts * actualMonths;

  const totalPrincipalAndInterest = totalLoanAmount + totalInterest;
  const totalOfAllPayments =
    totalPrincipalAndInterest +
    totalMIP +
    totalPropertyTax +
    totalHomeInsurance +
    totalHOA +
    totalOtherCosts;

  // If UFMIP not financed, add it to total costs
  const totalUFMIPCost = inputs.financeUFMIP ? 0 : ufmipAmount;

  // Step 8: Calculate payoff date
  const startDate = inputs.startDate || new Date(2026, 0, 1);
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(startDate.getMonth() + actualMonths);

  return {
    loanDetails,
    monthlyPayment: monthlyBreakdown,
    totalPayments: {
      totalPrincipalAndInterest,
      totalInterest,
      totalMIP: totalMIP + totalUFMIPCost,
      totalPropertyTax,
      totalHomeInsurance,
      totalHOA,
      totalOtherCosts,
      totalOfAllPayments: totalOfAllPayments + totalUFMIPCost,
    },
    payoffDate,
    amortizationSchedule: schedule,
  };
}

/**
 * Calculate conventional loan for comparison
 * Assumes 20% down payment to avoid PMI
 */
export interface ConventionalLoanResults {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

export function calculateConventionalLoan(
  homePrice: number,
  downPaymentPercent: number,
  loanTerm: number,
  interestRate: number
): ConventionalLoanResults {
  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    interestRate,
    loanTerm
  );
  const totalPayment = monthlyPayment * loanTerm * 12;
  const totalInterest = totalPayment - loanAmount;

  return {
    loanAmount,
    monthlyPayment,
    totalInterest,
    totalPayment,
  };
}
