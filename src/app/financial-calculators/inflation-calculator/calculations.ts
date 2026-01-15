// Inflation Calculator Types
export interface InflationInputs {
  initialAmount: number;
  inflationRate: number;
  years: number;
}

export interface YearByYearBreakdown {
  year: number;
  nominalValue: number;
  realValue: number;
  inflationImpact: number;
  cumulativeInflation: number;
}

export interface InflationResults {
  futureValue: number; // What you'll need in the future to have same purchasing power
  purchasingPower: number; // What your money will be worth in today's dollars
  totalInflation: number; // Total inflation percentage over the period
  realValueLoss: number; // How much purchasing power you lose
  yearByYear: YearByYearBreakdown[];
}

// Historical average inflation rates by decade (US data)
export const HISTORICAL_INFLATION_RATES: { [key: string]: number } = {
  '1920s': -1.15,
  '1930s': -1.8,
  '1940s': 5.36,
  '1950s': 2.22,
  '1960s': 2.52,
  '1970s': 7.36,
  '1980s': 5.1,
  '1990s': 2.89,
  '2000s': 2.54,
  '2010s': 1.77,
  '2020s': 3.8, // Estimate based on recent data
};

// Default values
export const DEFAULT_INFLATION_RATE = 3.0; // Historical average is around 3%

/**
 * Calculate future value adjusted for inflation
 * Formula: FV = PV * (1 + inflation_rate)^years
 */
export function calculateRealValue(
  presentValue: number,
  inflationRate: number,
  years: number
): number {
  const rate = inflationRate / 100;
  return presentValue * Math.pow(1 + rate, years);
}

/**
 * Calculate purchasing power (what money will be worth in today's dollars)
 * Formula: PP = PV / (1 + inflation_rate)^years
 */
export function calculatePurchasingPower(
  presentValue: number,
  inflationRate: number,
  years: number
): number {
  if (inflationRate === 0 || years === 0) return presentValue;
  const rate = inflationRate / 100;
  return presentValue / Math.pow(1 + rate, years);
}

/**
 * Calculate inflation rate between two values
 * Formula: r = ((FV/PV)^(1/years) - 1) * 100
 */
export function calculateInflationRate(
  presentValue: number,
  futureValue: number,
  years: number
): number {
  if (years === 0 || presentValue === 0) return 0;
  if (presentValue === futureValue) return 0;

  const rate = Math.pow(futureValue / presentValue, 1 / years) - 1;
  return rate * 100;
}

/**
 * Get average inflation rates by decade
 */
export function getAverageInflationByDecade(): { [key: string]: number } {
  return { ...HISTORICAL_INFLATION_RATES };
}

/**
 * Main calculation function
 */
export function calculateInflation(inputs: InflationInputs): InflationResults {
  const { initialAmount, inflationRate, years } = inputs;

  // Calculate future value (what you'll need to maintain purchasing power)
  const futureValue = calculateRealValue(initialAmount, inflationRate, years);

  // Calculate purchasing power (what your money will be worth)
  const purchasingPower = calculatePurchasingPower(
    initialAmount,
    inflationRate,
    years
  );

  // Calculate total inflation percentage
  const totalInflation =
    years === 0 ? 0 : (futureValue / initialAmount - 1) * 100;

  // Calculate real value loss
  const realValueLoss = initialAmount - purchasingPower;

  // Generate year-by-year breakdown
  const yearByYear: YearByYearBreakdown[] = [];
  for (let year = 1; year <= years; year++) {
    const realValue = calculatePurchasingPower(
      initialAmount,
      inflationRate,
      year
    );
    const inflationImpact = initialAmount - realValue;
    const cumulativeInflation =
      (calculateRealValue(initialAmount, inflationRate, year) / initialAmount -
        1) *
      100;

    yearByYear.push({
      year,
      nominalValue: initialAmount,
      realValue,
      inflationImpact,
      cumulativeInflation,
    });
  }

  return {
    futureValue,
    purchasingPower,
    totalInflation,
    realValueLoss,
    yearByYear,
  };
}

/**
 * Validate inputs
 */
export function validateInflationInputs(inputs: InflationInputs): string[] {
  const errors: string[] = [];

  if (inputs.initialAmount <= 0) {
    errors.push('Initial amount must be greater than 0');
  }

  if (inputs.inflationRate < 0) {
    errors.push('Inflation rate cannot be negative');
  }

  if (inputs.inflationRate > 100) {
    errors.push('Inflation rate must be 100% or less');
  }

  if (inputs.years < 0) {
    errors.push('Number of years must be at least 0');
  }

  if (inputs.years > 100) {
    errors.push('Number of years cannot exceed 100');
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format years
 */
export function formatYears(years: number): string {
  return years === 1 ? '1 year' : `${years} years`;
}
