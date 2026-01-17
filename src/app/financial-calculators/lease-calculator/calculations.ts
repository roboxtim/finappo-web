// Lease Calculator Types
export interface LeaseInputs {
  assetValue: number;
  residualValue: number;
  leaseTerm: number; // in months
  interestRate?: number; // annual rate
  monthlyPayment?: number; // for reverse calculation
}

export interface LeaseResults {
  monthlyPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalDepreciation: number;
  depreciationFee: number;
  financeFee: number;
  effectiveRate?: number; // for reverse calculation
}

/**
 * Calculate monthly lease payment using standard lease formula
 * Monthly Payment = Depreciation Fee + Finance Fee
 * where:
 * Depreciation Fee = (Asset Value - Residual Value) / Number of Months
 * Finance Fee = (Asset Value + Residual Value) × Money Factor
 * Money Factor = Annual Interest Rate / 2400
 */
function calculateMonthlyPayment(
  assetValue: number,
  residualValue: number,
  months: number,
  annualRate: number
): { monthlyPayment: number; depreciationFee: number; financeFee: number } {
  // Calculate depreciation (the amount the asset loses over the lease term)
  const totalDepreciation = assetValue - residualValue;
  const depreciationFee = totalDepreciation / months;

  // Calculate finance charge (interest on the average value of the asset)
  const moneyFactor = annualRate / 100 / 24; // Convert annual rate to money factor
  const financeFee = (assetValue + residualValue) * moneyFactor;

  const monthlyPayment = depreciationFee + financeFee;

  return { monthlyPayment, depreciationFee, financeFee };
}

/**
 * Calculate effective interest rate given a fixed monthly payment
 * Uses iterative approximation (Newton's method)
 */
function calculateEffectiveRate(
  assetValue: number,
  residualValue: number,
  months: number,
  targetPayment: number
): number {
  // Binary search for the interest rate
  let low = 0;
  let high = 50; // Maximum 50% annual rate
  let rate = 5; // Start with 5%
  const tolerance = 0.001; // 0.001% tolerance
  let iterations = 0;
  const maxIterations = 100;

  while (iterations < maxIterations) {
    const { monthlyPayment } = calculateMonthlyPayment(
      assetValue,
      residualValue,
      months,
      rate
    );

    const difference = monthlyPayment - targetPayment;

    if (Math.abs(difference) < tolerance) {
      return rate;
    }

    if (difference > 0) {
      // Payment too high, rate too high
      high = rate;
    } else {
      // Payment too low, rate too low
      low = rate;
    }

    rate = (low + high) / 2;
    iterations++;
  }

  return rate;
}

/**
 * Calculate lease details
 */
export function calculateLease(inputs: LeaseInputs): LeaseResults {
  const { assetValue, residualValue, leaseTerm, interestRate, monthlyPayment } =
    inputs;

  // Validate inputs
  if (assetValue <= 0) {
    throw new Error('Asset value must be greater than 0');
  }

  if (residualValue < 0) {
    throw new Error('Residual value cannot be negative');
  }

  if (residualValue >= assetValue) {
    throw new Error('Residual value must be less than asset value');
  }

  if (leaseTerm <= 0) {
    throw new Error('Lease term must be greater than 0');
  }

  const totalDepreciation = assetValue - residualValue;

  // Mode 1: Calculate payment from interest rate
  if (interestRate !== undefined) {
    if (interestRate < 0) {
      throw new Error('Interest rate cannot be negative');
    }

    const { monthlyPayment, depreciationFee, financeFee } =
      calculateMonthlyPayment(
        assetValue,
        residualValue,
        leaseTerm,
        interestRate
      );

    const totalPayments = monthlyPayment * leaseTerm;
    const totalInterest = totalPayments - totalDepreciation;

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      totalDepreciation,
      depreciationFee,
      financeFee,
    };
  }

  // Mode 2: Calculate effective rate from payment
  if (monthlyPayment !== undefined) {
    if (monthlyPayment <= 0) {
      throw new Error('Monthly payment must be greater than 0');
    }

    const minPayment = totalDepreciation / leaseTerm;
    if (monthlyPayment < minPayment) {
      throw new Error(
        'Monthly payment is too low to cover depreciation. Minimum payment: $' +
          minPayment.toFixed(2)
      );
    }

    const effectiveRate = calculateEffectiveRate(
      assetValue,
      residualValue,
      leaseTerm,
      monthlyPayment
    );

    const { depreciationFee, financeFee } = calculateMonthlyPayment(
      assetValue,
      residualValue,
      leaseTerm,
      effectiveRate
    );

    const totalPayments = monthlyPayment * leaseTerm;
    const totalInterest = totalPayments - totalDepreciation;

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      totalDepreciation,
      depreciationFee,
      financeFee,
      effectiveRate,
    };
  }

  throw new Error('Either interest rate or monthly payment must be provided');
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: LeaseInputs): string[] {
  const errors: string[] = [];

  if (inputs.assetValue <= 0) {
    errors.push('Asset value must be greater than 0');
  }

  if (inputs.assetValue > 100000000) {
    errors.push('Asset value seems unusually high');
  }

  if (inputs.residualValue < 0) {
    errors.push('Residual value cannot be negative');
  }

  if (inputs.residualValue >= inputs.assetValue) {
    errors.push('Residual value must be less than asset value');
  }

  if (inputs.leaseTerm <= 0) {
    errors.push('Lease term must be greater than 0');
  }

  if (inputs.leaseTerm > 360) {
    errors.push('Lease term cannot exceed 360 months (30 years)');
  }

  if (inputs.interestRate !== undefined) {
    if (inputs.interestRate < 0) {
      errors.push('Interest rate cannot be negative');
    }

    if (inputs.interestRate > 50) {
      errors.push('Interest rate seems unusually high');
    }
  }

  if (inputs.monthlyPayment !== undefined) {
    if (inputs.monthlyPayment <= 0) {
      errors.push('Monthly payment must be greater than 0');
    }

    const totalDepreciation = inputs.assetValue - inputs.residualValue;
    const minPayment = totalDepreciation / inputs.leaseTerm;
    if (inputs.monthlyPayment < minPayment) {
      errors.push(
        `Monthly payment is too low. Minimum: $${minPayment.toFixed(2)}`
      );
    }
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
