/**
 * Calculate auto loan details
 */
export interface AutoLoanInputs {
  autoPrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number; // in months
  tradeInValue: number;
  salesTax: number; // percentage
  otherFees: number;
  includeTaxFeesInLoan: boolean;
}

export interface AutoLoanResults {
  monthlyPayment: number;
  totalLoanAmount: number;
  totalInterest: number;
  totalCost: number;
}

export function calculateAutoLoan(inputs: AutoLoanInputs): AutoLoanResults {
  const {
    autoPrice,
    downPayment,
    interestRate,
    loanTerm,
    tradeInValue,
    salesTax,
    otherFees,
    includeTaxFeesInLoan,
  } = inputs;

  // Calculate loan amount
  const carPriceAfterTrade = autoPrice - tradeInValue;
  const taxAmount = (carPriceAfterTrade * salesTax) / 100;

  let loanAmount: number;
  if (includeTaxFeesInLoan) {
    // Include tax and fees in the loan
    const totalAmountNeeded = carPriceAfterTrade + taxAmount + otherFees;
    loanAmount = totalAmountNeeded - downPayment;
  } else {
    // Tax and fees paid upfront, not included in loan
    loanAmount = carPriceAfterTrade - downPayment;
  }

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

  const totalPayments = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayments - loanAmount;
  const totalCost = totalPayments + downPayment;

  return {
    monthlyPayment,
    totalLoanAmount: loanAmount,
    totalInterest,
    totalCost,
  };
}
