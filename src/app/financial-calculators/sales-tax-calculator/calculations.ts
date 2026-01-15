/**
 * Sales Tax Calculator - Calculation Logic
 * Supports forward calculation, reverse calculation, and tax rate determination
 */

export interface SalesTaxInputs {
  priceBeforeTax?: number;
  totalPrice?: number;
  stateTaxRate?: number;
  localTaxRate?: number;
  calculationMode: 'forward' | 'reverse' | 'rate';
}

export interface SalesTaxResults {
  priceBeforeTax: number;
  totalPrice: number;
  taxAmount: number;
  stateTaxAmount: number;
  localTaxAmount: number;
  effectiveTaxRate: number;
  stateTaxRate?: number;
  localTaxRate?: number;
}

export interface StateComparison {
  state: string;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  difference: number;
}

// 2025 State Sales Tax Rates (base rates, not including local taxes)
export const STATE_TAX_RATES_2025: Record<string, number> = {
  Alabama: 4.0,
  Alaska: 0.0,
  Arizona: 5.6,
  Arkansas: 6.5,
  California: 7.25,
  Colorado: 2.9,
  Connecticut: 6.35,
  Delaware: 0.0,
  'District of Columbia': 6.0,
  Florida: 6.0,
  Georgia: 4.0,
  Hawaii: 4.0,
  Idaho: 6.0,
  Illinois: 6.25,
  Indiana: 7.0,
  Iowa: 6.0,
  Kansas: 6.5,
  Kentucky: 6.0,
  Louisiana: 4.45,
  Maine: 5.5,
  Maryland: 6.0,
  Massachusetts: 6.25,
  Michigan: 6.0,
  Minnesota: 6.875,
  Mississippi: 7.0,
  Missouri: 4.225,
  Montana: 0.0,
  Nebraska: 5.5,
  Nevada: 6.85,
  'New Hampshire': 0.0,
  'New Jersey': 6.625,
  'New Mexico': 5.125,
  'New York': 4.0,
  'North Carolina': 4.75,
  'North Dakota': 5.0,
  Ohio: 5.75,
  Oklahoma: 4.5,
  Oregon: 0.0,
  Pennsylvania: 6.0,
  'Rhode Island': 7.0,
  'South Carolina': 6.0,
  'South Dakota': 4.5,
  Tennessee: 7.0,
  Texas: 6.25,
  Utah: 6.1,
  Vermont: 6.0,
  Virginia: 5.3,
  Washington: 6.5,
  'West Virginia': 6.0,
  Wisconsin: 5.0,
  Wyoming: 4.0,
};

// Maximum typical local tax rates by state (for reference)
export const MAX_LOCAL_TAX_RATES: Record<string, number> = {
  Alabama: 7.5,
  Alaska: 7.85,
  Arizona: 5.3,
  Arkansas: 5.125,
  California: 2.75,
  Colorado: 8.3,
  Florida: 2.5,
  Georgia: 5.0,
  Illinois: 4.75,
  Louisiana: 7.0,
  Missouri: 5.763,
  'New Mexico': 4.3125,
  'New York': 4.875,
  'North Carolina': 2.75,
  Oklahoma: 7.0,
  'South Carolina': 3.0,
  Tennessee: 2.75,
  Texas: 2.0,
  Utah: 3.35,
  Virginia: 0.7,
  Washington: 4.0,
  // Other states typically have minimal or no local taxes
};

/**
 * Forward calculation: Calculate tax and total from price before tax
 */
export function calculateSalesTax(inputs: SalesTaxInputs): SalesTaxResults {
  const { priceBeforeTax = 0, stateTaxRate = 0, localTaxRate = 0 } = inputs;

  const effectiveTaxRate = stateTaxRate + localTaxRate;
  const stateTaxAmount = (priceBeforeTax * stateTaxRate) / 100;
  const localTaxAmount = (priceBeforeTax * localTaxRate) / 100;
  const taxAmount = stateTaxAmount + localTaxAmount;
  const totalPrice = priceBeforeTax + taxAmount;

  return {
    priceBeforeTax,
    totalPrice,
    taxAmount,
    stateTaxAmount,
    localTaxAmount,
    effectiveTaxRate,
    stateTaxRate,
    localTaxRate,
  };
}

/**
 * Reverse calculation: Calculate price before tax from total price
 */
export function calculatePriceBeforeTax(
  inputs: SalesTaxInputs
): SalesTaxResults {
  const { totalPrice = 0, stateTaxRate = 0, localTaxRate = 0 } = inputs;

  const effectiveTaxRate = stateTaxRate + localTaxRate;

  // Price before tax = Total Price / (1 + Tax Rate)
  const priceBeforeTax =
    effectiveTaxRate > 0
      ? totalPrice / (1 + effectiveTaxRate / 100)
      : totalPrice;

  const taxAmount = totalPrice - priceBeforeTax;

  // Proportionally split the tax between state and local
  const stateTaxAmount =
    effectiveTaxRate > 0 ? (taxAmount * stateTaxRate) / effectiveTaxRate : 0;
  const localTaxAmount =
    effectiveTaxRate > 0 ? (taxAmount * localTaxRate) / effectiveTaxRate : 0;

  return {
    priceBeforeTax,
    totalPrice,
    taxAmount,
    stateTaxAmount,
    localTaxAmount,
    effectiveTaxRate,
    stateTaxRate,
    localTaxRate,
  };
}

/**
 * Calculate tax rate from price before tax and total price
 */
export function calculateTaxRate(inputs: SalesTaxInputs): SalesTaxResults {
  const { priceBeforeTax = 0, totalPrice = 0 } = inputs;

  const taxAmount = totalPrice - priceBeforeTax;
  const effectiveTaxRate =
    priceBeforeTax > 0 ? (taxAmount / priceBeforeTax) * 100 : 0;

  return {
    priceBeforeTax,
    totalPrice,
    taxAmount,
    stateTaxAmount: taxAmount, // Can't split without knowing individual rates
    localTaxAmount: 0,
    effectiveTaxRate,
  };
}

/**
 * Validate inputs for sales tax calculation
 */
export function validateSalesTaxInputs(inputs: SalesTaxInputs): string[] {
  const errors: string[] = [];
  const {
    priceBeforeTax,
    totalPrice,
    stateTaxRate,
    localTaxRate,
    calculationMode,
  } = inputs;

  // Mode-specific validation
  if (calculationMode === 'forward') {
    if (priceBeforeTax === undefined || priceBeforeTax === null) {
      errors.push('Price before tax is required for forward calculation');
    } else if (priceBeforeTax < 0) {
      errors.push('Price before tax must be a positive number');
    }

    if (stateTaxRate !== undefined && stateTaxRate < 0) {
      errors.push('State tax rate cannot be negative');
    }

    if (localTaxRate !== undefined && localTaxRate < 0) {
      errors.push('Local tax rate cannot be negative');
    }
  } else if (calculationMode === 'reverse') {
    if (totalPrice === undefined || totalPrice === null) {
      errors.push('Total price is required for reverse calculation');
    } else if (totalPrice < 0) {
      errors.push('Total price must be a positive number');
    }

    if (stateTaxRate !== undefined && stateTaxRate < 0) {
      errors.push('State tax rate cannot be negative');
    }

    if (localTaxRate !== undefined && localTaxRate < 0) {
      errors.push('Local tax rate cannot be negative');
    }
  } else if (calculationMode === 'rate') {
    if (
      priceBeforeTax === undefined ||
      priceBeforeTax === null ||
      totalPrice === undefined ||
      totalPrice === null
    ) {
      errors.push(
        'Both price before tax and total price are required for tax rate calculation'
      );
    } else {
      if (priceBeforeTax < 0) {
        errors.push('Price before tax must be a positive number');
      }
      if (totalPrice < 0) {
        errors.push('Total price must be a positive number');
      }
      if (totalPrice < priceBeforeTax) {
        errors.push('Total price cannot be less than price before tax');
      }
    }
  }

  // Combined tax rate validation
  if (stateTaxRate !== undefined && localTaxRate !== undefined) {
    const combinedRate = (stateTaxRate || 0) + (localTaxRate || 0);
    if (combinedRate > 20) {
      errors.push('Combined tax rate cannot exceed 20%');
    }
  }

  return errors;
}

/**
 * Compare tax across different states
 */
export function compareStates(
  priceBeforeTax: number,
  currentState: string,
  states: string[] = []
): StateComparison[] {
  const comparisons: StateComparison[] = [];

  // Get current state tax for reference
  const currentStateTax = STATE_TAX_RATES_2025[currentState] || 0;
  const currentResult = calculateSalesTax({
    priceBeforeTax,
    stateTaxRate: currentStateTax,
    localTaxRate: 0,
    calculationMode: 'forward',
  });

  // If no specific states provided, use top 10 most populous states
  const statesToCompare =
    states.length > 0
      ? states
      : [
          'California',
          'Texas',
          'Florida',
          'New York',
          'Pennsylvania',
          'Illinois',
          'Ohio',
          'Georgia',
          'North Carolina',
          'Michigan',
        ];

  statesToCompare.forEach((state) => {
    const taxRate = STATE_TAX_RATES_2025[state] || 0;
    const result = calculateSalesTax({
      priceBeforeTax,
      stateTaxRate: taxRate,
      localTaxRate: 0,
      calculationMode: 'forward',
    });

    comparisons.push({
      state,
      taxRate,
      taxAmount: result.taxAmount,
      totalPrice: result.totalPrice,
      difference: result.taxAmount - currentResult.taxAmount,
    });
  });

  // Sort by tax amount (lowest to highest)
  return comparisons.sort((a, b) => a.taxAmount - b.taxAmount);
}

/**
 * Format currency for display
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
 * Format percentage for display
 */
export function formatPercentage(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Parse currency input string to number
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse percentage input string to number
 */
export function parsePercentageInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get states with no sales tax
 */
export function getNoTaxStates(): string[] {
  return Object.entries(STATE_TAX_RATES_2025)
    .filter(([, rate]) => rate === 0)
    .map(([state]) => state)
    .sort();
}

/**
 * Get states by tax rate range
 */
export function getStatesByTaxRange(min: number, max: number): string[] {
  return Object.entries(STATE_TAX_RATES_2025)
    .filter(([, rate]) => rate >= min && rate <= max)
    .map(([state]) => state)
    .sort();
}

/**
 * Calculate savings between states
 */
export function calculateStateSavings(
  annualSpending: number,
  fromState: string,
  toState: string,
  fromLocalRate: number = 0,
  toLocalRate: number = 0
): {
  fromTax: number;
  toTax: number;
  annualSavings: number;
  percentSavings: number;
} {
  const fromStateTax = STATE_TAX_RATES_2025[fromState] || 0;
  const toStateTax = STATE_TAX_RATES_2025[toState] || 0;

  const fromResult = calculateSalesTax({
    priceBeforeTax: annualSpending,
    stateTaxRate: fromStateTax,
    localTaxRate: fromLocalRate,
    calculationMode: 'forward',
  });

  const toResult = calculateSalesTax({
    priceBeforeTax: annualSpending,
    stateTaxRate: toStateTax,
    localTaxRate: toLocalRate,
    calculationMode: 'forward',
  });

  const annualSavings = fromResult.taxAmount - toResult.taxAmount;
  const percentSavings =
    fromResult.taxAmount > 0 ? (annualSavings / fromResult.taxAmount) * 100 : 0;

  return {
    fromTax: fromResult.taxAmount,
    toTax: toResult.taxAmount,
    annualSavings,
    percentSavings,
  };
}
