/**
 * APR Calculation Functions
 *
 * These functions calculate the Annual Percentage Rate (APR) which represents
 * the true cost of borrowing, including both interest and fees.
 *
 * APR Formula:
 * APR = ((Total Interest + Total Fees) / Principal / Term in Years) × 100
 *
 * However, when fees reduce the amount received, we need to use iterative
 * methods (Newton-Raphson) to solve for the effective APR that makes the
 * present value of payments equal to the net amount received.
 */

export interface LoanInputs {
  loanAmount: number;
  interestRate: number; // Annual percentage
  loanTermMonths: number;
  loanedFees: number; // Fees added to principal
  upfrontFees: number; // Fees paid out of pocket
}

export interface APRResults {
  nominalRate: number; // The stated interest rate
  effectiveAPR: number; // True APR including fees
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalFees: number;
  amountFinanced: number; // Principal + loaned fees
  netAmountReceived: number; // Amount actually received (after upfront fees)
  totalCost: number; // Total paid over life of loan
}

/**
 * Calculate monthly payment using standard amortization formula
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
 * Calculate effective APR using iterative method (Newton-Raphson)
 * This finds the APR that makes the present value of payments equal to net amount received
 */
export function calculateEffectiveAPR(
  monthlyPayment: number,
  netAmountReceived: number,
  months: number,
  initialGuess: number = 0.1
): number {
  let apr = initialGuess;
  const tolerance = 0.000001;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    const monthlyRate = apr / 12;

    // Present value of all payments
    let pv = 0;
    let pvDerivative = 0;

    for (let month = 1; month <= months; month++) {
      const discountFactor = Math.pow(1 + monthlyRate, -month);
      pv += monthlyPayment * discountFactor;
      pvDerivative += monthlyPayment * (-month) * Math.pow(1 + monthlyRate, -month - 1) / 12;
    }

    const difference = pv - netAmountReceived;

    if (Math.abs(difference) < tolerance) {
      return apr * 100; // Convert to percentage
    }

    // Newton-Raphson update
    apr = apr - difference / pvDerivative;

    // Prevent negative rates
    if (apr < 0) {
      apr = 0.001;
    }
  }

  return apr * 100; // Convert to percentage
}

/**
 * Main APR calculation function
 */
export function calculateAPR(inputs: LoanInputs): APRResults {
  const {
    loanAmount,
    interestRate,
    loanTermMonths,
    loanedFees,
    upfrontFees,
  } = inputs;

  // Amount financed is the principal plus any fees rolled into the loan
  const amountFinanced = loanAmount + loanedFees;

  // Net amount received is what the borrower actually gets
  // (loan amount minus upfront fees)
  const netAmountReceived = loanAmount - upfrontFees;

  // Calculate monthly payment based on amount financed and nominal rate
  const monthlyPayment = calculateMonthlyPayment(
    amountFinanced,
    interestRate,
    loanTermMonths
  );

  // Total of all payments
  const totalPayments = monthlyPayment * loanTermMonths;

  // Total interest is total payments minus amount financed
  const totalInterest = totalPayments - amountFinanced;

  // Total fees
  const totalFees = loanedFees + upfrontFees;

  // Total cost is everything paid
  const totalCost = totalPayments + upfrontFees;

  // Calculate effective APR
  // If there are no fees, effective APR equals nominal rate
  let effectiveAPR = interestRate;

  if (totalFees > 0) {
    // Use iterative method to find the APR
    effectiveAPR = calculateEffectiveAPR(
      monthlyPayment,
      netAmountReceived,
      loanTermMonths,
      interestRate / 100 // Initial guess is the nominal rate
    );
  }

  return {
    nominalRate: interestRate,
    effectiveAPR: Math.round(effectiveAPR * 1000) / 1000, // Round to 3 decimal places
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayments: Math.round(totalPayments * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalFees,
    amountFinanced,
    netAmountReceived,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Calculate amortization schedule
 */
export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  const monthlyRate = annualRate / 100 / 12;
  const schedule: AmortizationRow[] = [];
  let remainingBalance = principal;

  for (let month = 1; month <= months; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    schedule.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.max(0, Math.round(remainingBalance * 100) / 100),
    });
  }

  return schedule;
}
