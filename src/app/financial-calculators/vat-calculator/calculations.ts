// VAT Calculator Types
export interface VATInputs {
  vatRate?: number;
  netPrice?: number;
  grossPrice?: number;
  taxAmount?: number;
}

export interface VATResults {
  vatRate: number;
  netPrice: number;
  grossPrice: number;
  taxAmount: number;
}

/**
 * Calculate VAT values from any two inputs
 */
export function calculateVAT(inputs: VATInputs): VATResults {
  const { vatRate, netPrice, grossPrice, taxAmount } = inputs;

  // Count how many values are provided (0 is a valid value for VAT rate)
  const providedValues = [
    { name: 'vatRate', value: vatRate },
    { name: 'netPrice', value: netPrice },
    { name: 'grossPrice', value: grossPrice },
    { name: 'taxAmount', value: taxAmount },
  ].filter((v) => v.value !== undefined && v.value !== null);

  if (providedValues.length < 2) {
    throw new Error('Please provide at least 2 values');
  }

  // Check if all provided values are zero (not meaningful)
  const allZero = providedValues.every((v) => v.value === 0);
  if (allZero) {
    throw new Error('Please provide at least 2 values');
  }

  // Calculate based on what's provided
  let calculatedVatRate = vatRate ?? 0;
  let calculatedNetPrice = netPrice ?? 0;
  let calculatedGrossPrice = grossPrice ?? 0;
  let calculatedTaxAmount = taxAmount ?? 0;

  // Case 1: VAT Rate + Net Price
  if (vatRate !== undefined && netPrice !== undefined) {
    calculatedVatRate = vatRate;
    calculatedNetPrice = netPrice;
    calculatedTaxAmount = netPrice * (vatRate / 100);
    calculatedGrossPrice = netPrice + calculatedTaxAmount;
  }
  // Case 2: VAT Rate + Gross Price
  else if (vatRate !== undefined && grossPrice !== undefined) {
    calculatedVatRate = vatRate;
    calculatedGrossPrice = grossPrice;
    calculatedNetPrice = grossPrice / (1 + vatRate / 100);
    calculatedTaxAmount = calculatedGrossPrice - calculatedNetPrice;
  }
  // Case 3: VAT Rate + Tax Amount
  else if (vatRate !== undefined && taxAmount !== undefined) {
    calculatedVatRate = vatRate;
    calculatedTaxAmount = taxAmount;
    calculatedNetPrice = taxAmount / (vatRate / 100);
    calculatedGrossPrice = calculatedNetPrice + taxAmount;
  }
  // Case 4: Net Price + Gross Price
  else if (netPrice !== undefined && grossPrice !== undefined) {
    calculatedNetPrice = netPrice;
    calculatedGrossPrice = grossPrice;
    calculatedTaxAmount = grossPrice - netPrice;
    calculatedVatRate = (calculatedTaxAmount / netPrice) * 100;
  }
  // Case 5: Net Price + Tax Amount
  else if (netPrice !== undefined && taxAmount !== undefined) {
    calculatedNetPrice = netPrice;
    calculatedTaxAmount = taxAmount;
    calculatedGrossPrice = netPrice + taxAmount;
    calculatedVatRate = (taxAmount / netPrice) * 100;
  }
  // Case 6: Gross Price + Tax Amount
  else if (grossPrice !== undefined && taxAmount !== undefined) {
    calculatedGrossPrice = grossPrice;
    calculatedTaxAmount = taxAmount;
    calculatedNetPrice = grossPrice - taxAmount;
    calculatedVatRate = (taxAmount / calculatedNetPrice) * 100;
  } else {
    throw new Error('Invalid combination of inputs');
  }

  return {
    vatRate: calculatedVatRate,
    netPrice: calculatedNetPrice,
    grossPrice: calculatedGrossPrice,
    taxAmount: calculatedTaxAmount,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: VATInputs): string[] {
  const errors: string[] = [];

  const { vatRate, netPrice, grossPrice, taxAmount } = inputs;

  // Count provided values (0 is a valid value for VAT rate)
  const providedValues = [vatRate, netPrice, grossPrice, taxAmount].filter(
    (v) => v !== undefined && v !== null
  );

  if (providedValues.length < 2) {
    errors.push('Please provide at least 2 values to calculate');
  }

  // Check for negative values
  if (vatRate !== undefined && vatRate < 0) {
    errors.push('VAT rate cannot be negative');
  }

  if (netPrice !== undefined && netPrice < 0) {
    errors.push('Net price cannot be negative');
  }

  if (grossPrice !== undefined && grossPrice < 0) {
    errors.push('Gross price cannot be negative');
  }

  if (taxAmount !== undefined && taxAmount < 0) {
    errors.push('Tax amount cannot be negative');
  }

  // Check logical consistency if all values provided
  if (providedValues.length >= 3) {
    if (
      netPrice !== undefined &&
      grossPrice !== undefined &&
      grossPrice < netPrice
    ) {
      errors.push('Gross price must be greater than or equal to net price');
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
