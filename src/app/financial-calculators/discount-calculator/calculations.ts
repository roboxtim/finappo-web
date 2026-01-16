// Discount Calculator Types
export type DiscountMode = 'percent' | 'fixed';

export interface DiscountInputs {
  originalPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;
  mode: DiscountMode;
}

export interface DiscountResults {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}

/**
 * Calculate discount values from any two inputs
 * Formulas:
 * - Discount Amount = Original Price × (Discount Percent / 100)
 * - Final Price = Original Price - Discount Amount
 * - Discount Percent = (Discount Amount / Original Price) × 100
 */
export function calculateDiscount(inputs: DiscountInputs): DiscountResults {
  const { originalPrice, discountPercent, discountAmount, finalPrice, mode } =
    inputs;

  // Count how many values are provided
  const providedValues = [
    { name: 'originalPrice', value: originalPrice },
    { name: 'discountPercent', value: discountPercent },
    { name: 'discountAmount', value: discountAmount },
    { name: 'finalPrice', value: finalPrice },
  ].filter((v) => v.value !== undefined && v.value !== null);

  if (providedValues.length < 2) {
    throw new Error('Please provide at least 2 values');
  }

  // Check if all provided values are zero (not meaningful)
  const allZero = providedValues.every((v) => v.value === 0);
  if (allZero) {
    throw new Error('Please provide at least 2 values');
  }

  let calculatedOriginalPrice = originalPrice ?? 0;
  let calculatedDiscountPercent = discountPercent ?? 0;
  let calculatedDiscountAmount = discountAmount ?? 0;
  let calculatedFinalPrice = finalPrice ?? 0;

  if (mode === 'percent') {
    // Percent mode calculations
    // Case 1: Original Price + Discount Percent
    if (originalPrice !== undefined && discountPercent !== undefined) {
      calculatedOriginalPrice = originalPrice;
      calculatedDiscountPercent = discountPercent;
      calculatedDiscountAmount = originalPrice * (discountPercent / 100);
      calculatedFinalPrice = originalPrice - calculatedDiscountAmount;
    }
    // Case 2: Original Price + Final Price
    else if (originalPrice !== undefined && finalPrice !== undefined) {
      calculatedOriginalPrice = originalPrice;
      calculatedFinalPrice = finalPrice;
      calculatedDiscountAmount = originalPrice - finalPrice;
      calculatedDiscountPercent =
        (calculatedDiscountAmount / originalPrice) * 100;
    }
    // Case 3: Discount Percent + Final Price
    else if (discountPercent !== undefined && finalPrice !== undefined) {
      calculatedDiscountPercent = discountPercent;
      calculatedFinalPrice = finalPrice;
      // Final Price = Original Price × (1 - Percent/100)
      // Original Price = Final Price / (1 - Percent/100)
      calculatedOriginalPrice = finalPrice / (1 - discountPercent / 100);
      calculatedDiscountAmount = calculatedOriginalPrice - calculatedFinalPrice;
    } else {
      throw new Error(
        'Invalid combination. Provide original price and discount percent, or original price and final price, or discount percent and final price.'
      );
    }
  } else {
    // Fixed amount mode calculations
    // Case 1: Original Price + Discount Amount
    if (originalPrice !== undefined && discountAmount !== undefined) {
      calculatedOriginalPrice = originalPrice;
      calculatedDiscountAmount = discountAmount;
      calculatedFinalPrice = originalPrice - discountAmount;
      calculatedDiscountPercent = (discountAmount / originalPrice) * 100;
    }
    // Case 2: Original Price + Final Price
    else if (originalPrice !== undefined && finalPrice !== undefined) {
      calculatedOriginalPrice = originalPrice;
      calculatedFinalPrice = finalPrice;
      calculatedDiscountAmount = originalPrice - finalPrice;
      calculatedDiscountPercent =
        (calculatedDiscountAmount / originalPrice) * 100;
    }
    // Case 3: Discount Amount + Final Price
    else if (discountAmount !== undefined && finalPrice !== undefined) {
      calculatedDiscountAmount = discountAmount;
      calculatedFinalPrice = finalPrice;
      calculatedOriginalPrice = finalPrice + discountAmount;
      calculatedDiscountPercent =
        (discountAmount / calculatedOriginalPrice) * 100;
    } else {
      throw new Error(
        'Invalid combination. Provide original price and discount amount, or original price and final price, or discount amount and final price.'
      );
    }
  }

  return {
    originalPrice: calculatedOriginalPrice,
    discountPercent: calculatedDiscountPercent,
    discountAmount: calculatedDiscountAmount,
    finalPrice: calculatedFinalPrice,
    savings: calculatedDiscountAmount,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: DiscountInputs): string[] {
  const errors: string[] = [];
  const { originalPrice, discountPercent, discountAmount, finalPrice } = inputs;

  // Count provided values
  const providedValues = [
    originalPrice,
    discountPercent,
    discountAmount,
    finalPrice,
  ].filter((v) => v !== undefined && v !== null);

  if (providedValues.length < 2) {
    errors.push('Please provide at least 2 values to calculate');
  }

  // Check for negative values
  if (originalPrice !== undefined && originalPrice < 0) {
    errors.push('Original price cannot be negative');
  }

  if (discountPercent !== undefined && discountPercent < 0) {
    errors.push('Discount percent cannot be negative');
  }

  if (discountPercent !== undefined && discountPercent > 100) {
    errors.push('Discount percent cannot be greater than 100%');
  }

  if (discountAmount !== undefined && discountAmount < 0) {
    errors.push('Discount amount cannot be negative');
  }

  if (finalPrice !== undefined && finalPrice < 0) {
    errors.push('Final price cannot be negative');
  }

  // Logical consistency checks
  if (
    originalPrice !== undefined &&
    finalPrice !== undefined &&
    finalPrice > originalPrice
  ) {
    errors.push('Final price cannot be greater than original price');
  }

  if (
    originalPrice !== undefined &&
    discountAmount !== undefined &&
    discountAmount > originalPrice
  ) {
    errors.push('Discount amount cannot be greater than original price');
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
