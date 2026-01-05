/**
 * VA Loan Calculation Library
 * Based on VA loan guidelines and calculator.net methodology
 *
 * VA Loan Rules:
 * - No down payment required (0% down is allowed)
 * - VA Funding Fee: Varies by down payment, service type, and usage (first-time vs subsequent)
 * - NO PMI/MIP required (major benefit over FHA and conventional loans)
 * - Funding fee can be financed into the loan
 * - Disabled veterans (10%+ service-related disability) are exempt from funding fee
 * - No prepayment penalties
 */

export interface VAFundingFeeRates {
  firstTimeUse: {
    zeroDown: number; // <5% down
    fiveToTenPercent: number; // 5-10% down
    tenPercentPlus: number; // 10%+ down
  };
  subsequentUse: {
    zeroDown: number; // <5% down
    fiveToTenPercent: number; // 5-10% down
    tenPercentPlus: number; // 10%+ down
  };
  reservesNationalGuard: {
    firstTimeUse: {
      zeroDown: number;
      fiveToTenPercent: number;
      tenPercentPlus: number;
    };
    subsequentUse: {
      zeroDown: number;
      fiveToTenPercent: number;
      tenPercentPlus: number;
    };
  };
}

// VA Funding Fee Rates (2024)
export const VA_FUNDING_FEE_RATES: VAFundingFeeRates = {
  firstTimeUse: {
    zeroDown: 2.15, // 2.15% for 0-5% down, first-time use
    fiveToTenPercent: 1.5, // 1.5% for 5-10% down
    tenPercentPlus: 1.25, // 1.25% for 10%+ down
  },
  subsequentUse: {
    zeroDown: 3.3, // 3.3% for 0-5% down, subsequent use
    fiveToTenPercent: 1.5, // 1.5% for 5-10% down
    tenPercentPlus: 1.25, // 1.25% for 10%+ down
  },
  reservesNationalGuard: {
    firstTimeUse: {
      zeroDown: 2.15,
      fiveToTenPercent: 1.5,
      tenPercentPlus: 1.25,
    },
    subsequentUse: {
      zeroDown: 3.3,
      fiveToTenPercent: 1.5,
      tenPercentPlus: 1.25,
    },
  },
};

export type ServiceType = 'regular' | 'reserves';
export type LoanUsage = 'first' | 'subsequent';

export interface VALoanInputs {
  homePrice: number;
  downPayment: number;
  loanTerm: number; // in years
  interestRate: number; // annual percentage
  serviceType: ServiceType;
  loanUsage: LoanUsage;
  isDisabled: boolean; // 10%+ service-related disability exemption
  financeFundingFee: boolean; // whether to finance funding fee into loan
  propertyTax: number; // annual amount
  homeInsurance: number; // annual amount
  hoaFee: number; // monthly amount
  otherCosts: number; // monthly amount
  startDate?: Date;
}

export interface VALoanDetails {
  baseLoanAmount: number;
  downPaymentPercent: number;
  fundingFeeRate: number; // percentage
  fundingFeeAmount: number;
  totalLoanAmount: number; // includes funding fee if financed
  ltv: number; // loan-to-value ratio
}

export interface MonthlyPaymentBreakdown {
  principalAndInterest: number;
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
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface VALoanResults {
  loanDetails: VALoanDetails;
  monthlyPayment: MonthlyPaymentBreakdown;
  totalPayments: {
    totalPrincipalAndInterest: number;
    totalInterest: number;
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
 * Calculate down payment percentage
 */
export function calculateDownPaymentPercent(
  homePrice: number,
  downPayment: number
): number {
  if (homePrice <= 0) return 0;
  return (downPayment / homePrice) * 100;
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
 * Determine VA funding fee rate based on service type, usage, and down payment
 * Returns 0 if disabled veteran
 */
export function getVAFundingFeeRate(
  downPaymentPercent: number,
  serviceType: ServiceType,
  loanUsage: LoanUsage,
  isDisabled: boolean
): number {
  // Disabled veterans are exempt from funding fee
  if (isDisabled) return 0;

  const rates =
    serviceType === 'regular'
      ? VA_FUNDING_FEE_RATES
      : VA_FUNDING_FEE_RATES.reservesNationalGuard;

  const usageRates =
    loanUsage === 'first' ? rates.firstTimeUse : rates.subsequentUse;

  // Determine rate based on down payment percentage
  if (downPaymentPercent >= 10) {
    return usageRates.tenPercentPlus;
  } else if (downPaymentPercent >= 5) {
    return usageRates.fiveToTenPercent;
  } else {
    return usageRates.zeroDown;
  }
}

/**
 * Calculate VA funding fee amount
 */
export function calculateVAFundingFee(
  baseLoanAmount: number,
  fundingFeeRate: number
): number {
  return (baseLoanAmount * fundingFeeRate) / 100;
}

/**
 * Calculate total loan amount including funding fee if financed
 */
export function calculateTotalLoanAmount(
  baseLoanAmount: number,
  fundingFeeAmount: number,
  financeFundingFee: boolean
): number {
  if (financeFundingFee) {
    return baseLoanAmount + fundingFeeAmount;
  }
  return baseLoanAmount;
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
 * Generate complete amortization schedule for VA loan
 */
export function generateVAAmortizationSchedule(
  inputs: VALoanInputs,
  loanDetails: VALoanDetails
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

  const startDate = inputs.startDate || new Date(2026, 0, 1);

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

    // Update cumulative values
    cumulativePrincipal += principalPayment;
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
 * Calculate complete VA loan results
 */
export function calculateVALoan(inputs: VALoanInputs): VALoanResults {
  // Step 1: Calculate base loan amount and down payment percentage
  const baseLoanAmount = calculateBaseLoanAmount(
    inputs.homePrice,
    inputs.downPayment
  );
  const downPaymentPercent = calculateDownPaymentPercent(
    inputs.homePrice,
    inputs.downPayment
  );
  const ltv = calculateLTV(inputs.homePrice, inputs.downPayment);

  // Step 2: Calculate VA funding fee
  const fundingFeeRate = getVAFundingFeeRate(
    downPaymentPercent,
    inputs.serviceType,
    inputs.loanUsage,
    inputs.isDisabled
  );
  const fundingFeeAmount = calculateVAFundingFee(
    baseLoanAmount,
    fundingFeeRate
  );
  const totalLoanAmount = calculateTotalLoanAmount(
    baseLoanAmount,
    fundingFeeAmount,
    inputs.financeFundingFee
  );

  const loanDetails: VALoanDetails = {
    baseLoanAmount,
    downPaymentPercent,
    fundingFeeRate,
    fundingFeeAmount,
    totalLoanAmount,
    ltv,
  };

  // Step 3: Calculate monthly payment (P&I)
  const monthlyPayment = calculateMonthlyPayment(
    totalLoanAmount,
    inputs.interestRate,
    inputs.loanTerm
  );

  // Step 4: Generate amortization schedule
  const schedule = generateVAAmortizationSchedule(inputs, loanDetails);

  // Step 5: Calculate monthly payment breakdown
  const monthlyPropertyTax = inputs.propertyTax / 12;
  const monthlyHomeInsurance = inputs.homeInsurance / 12;

  const monthlyBreakdown: MonthlyPaymentBreakdown = {
    principalAndInterest: monthlyPayment,
    propertyTax: monthlyPropertyTax,
    homeInsurance: monthlyHomeInsurance,
    hoaFee: inputs.hoaFee,
    otherCosts: inputs.otherCosts,
    totalMonthly:
      monthlyPayment +
      monthlyPropertyTax +
      monthlyHomeInsurance +
      inputs.hoaFee +
      inputs.otherCosts,
  };

  // Step 6: Calculate totals
  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const actualMonths = schedule.length;

  const totalPropertyTax = monthlyPropertyTax * actualMonths;
  const totalHomeInsurance = monthlyHomeInsurance * actualMonths;
  const totalHOA = inputs.hoaFee * actualMonths;
  const totalOtherCosts = inputs.otherCosts * actualMonths;

  const totalPrincipalAndInterest = totalLoanAmount + totalInterest;
  const totalOfAllPayments =
    totalPrincipalAndInterest +
    totalPropertyTax +
    totalHomeInsurance +
    totalHOA +
    totalOtherCosts;

  // If funding fee not financed, add it to total costs
  const totalFundingFeeCost = inputs.financeFundingFee ? 0 : fundingFeeAmount;

  // Step 7: Calculate payoff date
  const startDate = inputs.startDate || new Date(2026, 0, 1);
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(startDate.getMonth() + actualMonths);

  return {
    loanDetails,
    monthlyPayment: monthlyBreakdown,
    totalPayments: {
      totalPrincipalAndInterest,
      totalInterest,
      totalPropertyTax,
      totalHomeInsurance,
      totalHOA,
      totalOtherCosts,
      totalOfAllPayments: totalOfAllPayments + totalFundingFeeCost,
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
  pmiRequired: boolean;
  monthlyPMI: number;
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

  // PMI required if less than 20% down
  const pmiRequired = downPaymentPercent < 20;
  const monthlyPMI = pmiRequired ? (loanAmount * 0.005) / 12 : 0; // 0.5% annual PMI estimate

  return {
    loanAmount,
    monthlyPayment,
    totalInterest,
    totalPayment,
    pmiRequired,
    monthlyPMI,
  };
}

/**
 * Calculate FHA loan for comparison
 */
export interface FHALoanResults {
  loanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  monthlyMIP: number;
  ufmip: number;
}

export function calculateFHALoan(
  homePrice: number,
  downPaymentPercent: number,
  loanTerm: number,
  interestRate: number
): FHALoanResults {
  const downPayment = homePrice * (downPaymentPercent / 100);
  const baseLoanAmount = homePrice - downPayment;

  // UFMIP is 1.75% of base loan
  const ufmip = baseLoanAmount * 0.0175;
  const totalLoanAmount = baseLoanAmount + ufmip;

  const monthlyPayment = calculateMonthlyPayment(
    totalLoanAmount,
    interestRate,
    loanTerm
  );

  // Annual MIP is typically 0.55% for 30-year loans with LTV > 95%
  const ltv = (baseLoanAmount / homePrice) * 100;
  const annualMIPRate = ltv > 95 ? 0.55 : 0.5;
  const monthlyMIP = (baseLoanAmount * annualMIPRate) / 100 / 12;

  const totalPayment = monthlyPayment * loanTerm * 12;
  const totalInterest = totalPayment - totalLoanAmount;

  return {
    loanAmount: totalLoanAmount,
    monthlyPayment,
    totalInterest,
    totalPayment,
    monthlyMIP,
    ufmip,
  };
}
