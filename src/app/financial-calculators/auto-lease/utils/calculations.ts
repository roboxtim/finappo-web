/**
 * Auto Lease Calculator - Calculation Utilities
 *
 * Formula Reference (based on calculator.net):
 * 1. Adjusted Capitalized Cost (Net Cap Cost) = Negotiated Price - Down Payment - Trade-in Equity + Fees
 * 2. Trade-in Equity = Trade-in Value - Amount Owed on Trade-in
 * 3. Residual Value = MSRP × (Residual Percent / 100)
 * 4. Monthly Depreciation Fee = (Net Cap Cost - Residual Value) / Lease Term
 * 5. Money Factor = (APR / 100) / 24
 * 6. Monthly Finance Fee = (Net Cap Cost + Residual Value) × Money Factor
 * 7. Monthly Sales Tax = (Monthly Depreciation + Monthly Finance Fee) × (Sales Tax Rate / 100)
 * 8. Total Monthly Payment = Monthly Depreciation + Monthly Finance Fee + Monthly Sales Tax
 * 9. Total of Payments = Monthly Payment × Lease Term
 * 10. Amount at Signing = Down Payment + Fees - Trade-in Equity
 * 11. Total Lease Cost = Total of Payments + Amount at Signing
 */

export interface AutoLeaseInputs {
  msrp: number; // Manufacturer's Suggested Retail Price
  negotiatedPrice: number; // Agreed upon value (capitalized cost)
  downPayment: number; // Initial payment to reduce cap cost
  tradeInValue: number; // Value of trade-in vehicle
  amountOwedOnTradeIn: number; // Outstanding loan on trade-in
  leaseTerm: number; // Lease duration in months
  interestRate: number; // APR percentage (converted to money factor)
  residualPercent: number; // Percentage of MSRP as residual value
  salesTaxRate: number; // Sales tax percentage
  fees: number; // Acquisition, documentation, and other fees
}

export interface AutoLeaseResults {
  monthlyPayment: number; // Total monthly lease payment
  monthlyDepreciationFee: number; // Depreciation component
  monthlyFinanceFee: number; // Finance charge (interest) component
  monthlySalesTax: number; // Tax component
  adjustedCapCost: number; // Net capitalized cost
  residualValue: number; // End-of-lease vehicle value
  totalOfPayments: number; // Sum of all monthly payments
  amountAtSigning: number; // Total due at lease signing
  totalLeaseCost: number; // Complete cost of the lease
  moneyFactor: number; // APR converted to money factor
  tradeInEquity: number; // Net trade-in value
  salesTaxRate: number; // Input sales tax rate (for display)
  fees: number; // Input fees (for display)
}

/**
 * Calculate auto lease payment and related values
 */
export function calculateAutoLease(inputs: AutoLeaseInputs): AutoLeaseResults {
  const {
    msrp,
    negotiatedPrice,
    downPayment,
    tradeInValue,
    amountOwedOnTradeIn,
    leaseTerm,
    interestRate,
    residualPercent,
    salesTaxRate,
    fees,
  } = inputs;

  // Calculate trade-in equity (can be positive or negative)
  const tradeInEquity = tradeInValue - amountOwedOnTradeIn;

  // Calculate adjusted capitalized cost (net cap cost)
  // This is the amount being financed in the lease
  const adjustedCapCost = negotiatedPrice - downPayment - tradeInEquity + fees;

  // Calculate residual value (based on MSRP, not negotiated price)
  const residualValue = msrp * (residualPercent / 100);

  // Calculate depreciation amount over the lease term
  const depreciationAmount = adjustedCapCost - residualValue;

  // Calculate monthly depreciation fee
  const monthlyDepreciationFee = depreciationAmount / leaseTerm;

  // Convert APR to money factor
  // Money Factor = (APR / 100) / 24
  const moneyFactor = interestRate / 2400;

  // Calculate monthly finance fee (rent charge)
  // This is the interest component of the lease
  const monthlyFinanceFee = (adjustedCapCost + residualValue) * moneyFactor;

  // Calculate pre-tax monthly payment
  const preTaxMonthlyPayment = monthlyDepreciationFee + monthlyFinanceFee;

  // Calculate monthly sales tax
  const monthlySalesTax = preTaxMonthlyPayment * (salesTaxRate / 100);

  // Calculate total monthly payment
  const monthlyPayment = preTaxMonthlyPayment + monthlySalesTax;

  // Calculate total of all monthly payments
  const totalOfPayments = monthlyPayment * leaseTerm;

  // Calculate amount due at signing
  // This includes down payment and fees, minus trade-in equity
  const amountAtSigning = downPayment + fees - tradeInEquity;

  // Calculate total lease cost
  // This is the complete out-of-pocket cost
  const totalLeaseCost = totalOfPayments + amountAtSigning;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    monthlyDepreciationFee: Math.round(monthlyDepreciationFee * 100) / 100,
    monthlyFinanceFee: Math.round(monthlyFinanceFee * 100) / 100,
    monthlySalesTax: Math.round(monthlySalesTax * 100) / 100,
    adjustedCapCost: Math.round(adjustedCapCost * 100) / 100,
    residualValue: Math.round(residualValue * 100) / 100,
    totalOfPayments: Math.round(totalOfPayments * 100) / 100,
    amountAtSigning: Math.round(amountAtSigning * 100) / 100,
    totalLeaseCost: Math.round(totalLeaseCost * 100) / 100,
    moneyFactor: Math.round(moneyFactor * 1000000) / 1000000,
    tradeInEquity: Math.round(tradeInEquity * 100) / 100,
    salesTaxRate,
    fees,
  };
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
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format money factor for display
 */
export function formatMoneyFactor(value: number): string {
  return value.toFixed(6);
}
