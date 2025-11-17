/**
 * Calculate personal loan details
 */
export interface PersonalLoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in months
}

export interface PersonalLoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculatePersonalLoan(
  inputs: PersonalLoanInputs
): PersonalLoanResults {
  const { loanAmount, interestRate, loanTerm } = inputs;

  // Calculate monthly payment
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    monthlyPayment =
      (loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
  };
}
