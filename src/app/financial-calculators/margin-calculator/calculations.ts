// Margin Calculator Types
export interface MarginInputs {
  cost?: number;
  revenue?: number;
  margin?: number;
  profit?: number;
}

export interface MarginResults {
  cost: number;
  revenue: number;
  margin: number;
  profit: number;
  markup: number;
}

/**
 * Calculate profit margin values from any two inputs
 * Formulas:
 * - Profit = Revenue - Cost
 * - Margin = (Profit / Revenue) × 100%
 * - Markup = (Profit / Cost) × 100%
 */
export function calculateMargin(inputs: MarginInputs): MarginResults {
  const { cost, revenue, margin, profit } = inputs;

  // Count how many values are provided
  const providedValues = [
    { name: 'cost', value: cost },
    { name: 'revenue', value: revenue },
    { name: 'margin', value: margin },
    { name: 'profit', value: profit },
  ].filter((v) => v.value !== undefined && v.value !== null);

  if (providedValues.length < 2) {
    throw new Error('Please provide at least 2 values');
  }

  // Check if all provided values are zero (not meaningful)
  const allZero = providedValues.every((v) => v.value === 0);
  if (allZero) {
    throw new Error('Please provide at least 2 values');
  }

  let calculatedCost = cost ?? 0;
  let calculatedRevenue = revenue ?? 0;
  let calculatedMargin = margin ?? 0;
  let calculatedProfit = profit ?? 0;

  // Case 1: Cost + Revenue
  if (cost !== undefined && revenue !== undefined) {
    calculatedCost = cost;
    calculatedRevenue = revenue;
    calculatedProfit = revenue - cost;
    calculatedMargin = (calculatedProfit / revenue) * 100;
  }
  // Case 2: Cost + Margin
  else if (cost !== undefined && margin !== undefined) {
    calculatedCost = cost;
    calculatedMargin = margin;
    // Margin = (Profit / Revenue) × 100
    // Profit = Revenue - Cost
    // Margin = ((Revenue - Cost) / Revenue) × 100
    // Revenue = Cost / (1 - Margin/100)
    calculatedRevenue = cost / (1 - margin / 100);
    calculatedProfit = calculatedRevenue - cost;
  }
  // Case 3: Cost + Profit
  else if (cost !== undefined && profit !== undefined) {
    calculatedCost = cost;
    calculatedProfit = profit;
    calculatedRevenue = cost + profit;
    calculatedMargin = (profit / calculatedRevenue) * 100;
  }
  // Case 4: Revenue + Margin
  else if (revenue !== undefined && margin !== undefined) {
    calculatedRevenue = revenue;
    calculatedMargin = margin;
    calculatedProfit = (margin / 100) * revenue;
    calculatedCost = revenue - calculatedProfit;
  }
  // Case 5: Revenue + Profit
  else if (revenue !== undefined && profit !== undefined) {
    calculatedRevenue = revenue;
    calculatedProfit = profit;
    calculatedCost = revenue - profit;
    calculatedMargin = (profit / revenue) * 100;
  }
  // Case 6: Margin + Profit
  else if (margin !== undefined && profit !== undefined) {
    calculatedMargin = margin;
    calculatedProfit = profit;
    // Margin = (Profit / Revenue) × 100
    // Revenue = Profit / (Margin / 100)
    calculatedRevenue = profit / (margin / 100);
    calculatedCost = calculatedRevenue - profit;
  } else {
    throw new Error('Invalid combination of inputs');
  }

  // Calculate markup
  const calculatedMarkup =
    calculatedCost > 0 ? (calculatedProfit / calculatedCost) * 100 : 0;

  return {
    cost: calculatedCost,
    revenue: calculatedRevenue,
    margin: calculatedMargin,
    profit: calculatedProfit,
    markup: calculatedMarkup,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: MarginInputs): string[] {
  const errors: string[] = [];
  const { cost, revenue, margin, profit } = inputs;

  // Count provided values
  const providedValues = [cost, revenue, margin, profit].filter(
    (v) => v !== undefined && v !== null
  );

  if (providedValues.length < 2) {
    errors.push('Please provide at least 2 values to calculate');
  }

  // Check for negative values
  if (cost !== undefined && cost < 0) {
    errors.push('Cost cannot be negative');
  }

  if (revenue !== undefined && revenue < 0) {
    errors.push('Revenue cannot be negative');
  }

  if (profit !== undefined && profit < 0) {
    errors.push('Profit cannot be negative');
  }

  if (margin !== undefined && margin < 0) {
    errors.push('Margin cannot be negative');
  }

  if (margin !== undefined && margin >= 100) {
    errors.push('Margin must be less than 100%');
  }

  // Logical consistency checks
  if (revenue !== undefined && cost !== undefined && revenue < cost) {
    errors.push('Revenue must be greater than or equal to cost');
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
