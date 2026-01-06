/**
 * Interest Rate Calculator - Calculation Logic
 *
 * This calculator solves for the interest rate given:
 * - Loan amount (principal)
 * - Loan term (in months)
 * - Monthly payment
 *
 * Uses Newton-Raphson method to find the rate that satisfies the loan equation:
 * P = M * [(1 - (1 + r)^-n) / r]
 *
 * Where:
 * P = Principal (loan amount)
 * M = Monthly payment
 * r = Monthly interest rate
 * n = Number of payments
 */

export interface InterestRateInputs {
  loanAmount: number;
  loanTermMonths: number;
  monthlyPayment: number;
}

export interface InterestRateResults {
  annualInterestRate: number; // Annual percentage rate
  totalPayment: number;
  totalInterest: number;
  monthlyRate: number; // Monthly rate for internal use
}

/**
 * Calculate the monthly payment for a given rate (used in Newton-Raphson method)
 */
function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  numberOfPayments: number
): number {
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

/**
 * Calculate the derivative of the payment function with respect to rate
 * (used for Newton-Raphson method - currently using finite difference method instead)
 * Kept for reference and potential future optimization
 */
// function calculatePaymentDerivative(
//   principal: number,
//   monthlyRate: number,
//   numberOfPayments: number
// ): number {
//   if (monthlyRate === 0) {
//     return 0;
//   }

//   const numerator =
//     principal *
//     numberOfPayments *
//     Math.pow(1 + monthlyRate, numberOfPayments - 1);
//   const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
//   const term1 = numerator / denominator;

//   const term2 =
//     (principal *
//       monthlyRate *
//       numberOfPayments *
//       Math.pow(1 + monthlyRate, numberOfPayments - 1)) /
//     (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

//   const term3 =
//     (principal *
//       monthlyRate *
//       Math.pow(1 + monthlyRate, numberOfPayments) *
//       numberOfPayments *
//       Math.pow(1 + monthlyRate, numberOfPayments - 1)) /
//     Math.pow(Math.pow(1 + monthlyRate, numberOfPayments) - 1, 2);

//   return term1 + term2 - term3;
// }

/**
 * Find the interest rate using Newton-Raphson method
 */
function findInterestRate(
  principal: number,
  numberOfPayments: number,
  targetPayment: number
): number {
  // Initial guess: use a simple approximation
  // Total interest = (payment * months) - principal
  // Approximate rate = (total interest / principal) / (months / 12)
  const totalInterest = targetPayment * numberOfPayments - principal;
  const years = numberOfPayments / 12;
  let guess = totalInterest / principal / years;

  // Ensure a reasonable starting guess (between 0.1% and 50% annually)
  guess = Math.max(0.001, Math.min(0.5, guess));
  let monthlyRate = guess / 12;

  const maxIterations = 100;
  const tolerance = 0.0000001;

  for (let i = 0; i < maxIterations; i++) {
    const payment = calculateMonthlyPayment(
      principal,
      monthlyRate,
      numberOfPayments
    );
    const difference = payment - targetPayment;

    // Check if we're close enough
    if (Math.abs(difference) < tolerance) {
      break;
    }

    // Calculate derivative using finite difference method for better stability
    const delta = 0.0000001;
    const paymentPlus = calculateMonthlyPayment(
      principal,
      monthlyRate + delta,
      numberOfPayments
    );
    const derivative = (paymentPlus - payment) / delta;

    // Avoid division by zero
    if (Math.abs(derivative) < 0.0000001) {
      break;
    }

    // Newton-Raphson step
    monthlyRate = monthlyRate - difference / derivative;

    // Keep the rate positive
    if (monthlyRate < 0) {
      monthlyRate = 0.00001;
    }
  }

  return monthlyRate;
}

/**
 * Main calculation function
 */
export function calculateInterestRate(
  inputs: InterestRateInputs
): InterestRateResults {
  const { loanAmount, loanTermMonths, monthlyPayment } = inputs;

  // Validate inputs
  if (loanAmount <= 0 || loanTermMonths <= 0 || monthlyPayment <= 0) {
    throw new Error('All inputs must be positive numbers');
  }

  // Check if the monthly payment is sufficient to cover the loan
  const minimumPayment = loanAmount / loanTermMonths;
  if (monthlyPayment < minimumPayment) {
    throw new Error(
      'Monthly payment is too low to repay the loan within the specified term'
    );
  }

  // Find the monthly interest rate
  const monthlyRate = findInterestRate(
    loanAmount,
    loanTermMonths,
    monthlyPayment
  );

  // Convert to annual rate
  const annualInterestRate = monthlyRate * 12 * 100; // Convert to percentage

  // Calculate totals
  const totalPayment = monthlyPayment * loanTermMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    annualInterestRate,
    totalPayment,
    totalInterest,
    monthlyRate,
  };
}

/**
 * Verify the calculated rate by computing the monthly payment
 * This is used for testing to ensure our calculation is correct
 */
export function verifyInterestRate(
  principal: number,
  annualRate: number,
  numberOfPayments: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  return calculateMonthlyPayment(principal, monthlyRate, numberOfPayments);
}
