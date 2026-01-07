/**
 * ROI (Return on Investment) Calculator - Calculation Logic and Types
 *
 * This module implements ROI calculations including basic ROI, annualized ROI,
 * and handles additional costs and gains for comprehensive investment analysis.
 *
 * Basic ROI Formula:
 * ROI = ((Final Value - Initial Investment) / Initial Investment) × 100
 *
 * Annualized ROI Formula:
 * Annualized ROI = ((1 + ROI)^(1/Years) - 1) × 100
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type PeriodType = 'years' | 'months' | 'days';

export interface ROIInputs {
  initialInvestment: number; // Initial amount invested
  finalValue: number; // Final value of investment
  investmentPeriod: number; // Time period of investment
  periodType: PeriodType; // Type of period (years, months, days)
  additionalCosts: number; // Additional costs (fees, maintenance, etc.)
  additionalGains: number; // Additional gains (dividends, rental income, etc.)
}

export interface ROIResults {
  roi: number; // Basic ROI percentage
  annualizedROI: number; // Annualized ROI percentage
  totalReturn: number; // Total amount returned (final value + additional gains)
  netProfit: number; // Net profit/loss (total return - total invested)
  totalInvested: number; // Total amount invested (initial + additional costs)
  totalGain: number; // Total gain amount
  effectivePeriodInYears: number; // Investment period converted to years
  monthlyGrowthRate?: number; // Average monthly growth rate
  dailyGrowthRate?: number; // Average daily growth rate
  breakEvenPoint?: number; // Time to break even (if applicable)
  realROI?: number; // Inflation-adjusted ROI (if inflation rate provided)
}

export interface InvestmentScenario {
  name: string;
  initialInvestment: number;
  finalValue: number;
  period: number;
  periodType: PeriodType;
  additionalCosts?: number;
  additionalGains?: number;
}

export interface ComparisonResult {
  scenario: string;
  roi: number;
  annualizedROI: number;
  netProfit: number;
  rank: number;
}

export interface GrowthProjection {
  year: number;
  projectedValue: number;
  projectedROI: number;
  cumulativeGain: number;
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate basic ROI percentage
 * @param initialInvestment - Initial amount invested
 * @param finalValue - Final value of investment
 * @returns ROI as a percentage
 */
export function calculateBasicROI(
  initialInvestment: number,
  finalValue: number
): number {
  if (initialInvestment === 0) {
    return Infinity;
  }
  return ((finalValue - initialInvestment) / initialInvestment) * 100;
}

/**
 * Calculate annualized ROI
 * @param roi - Basic ROI percentage
 * @param years - Investment period in years
 * @returns Annualized ROI as a percentage
 */
export function calculateAnnualizedROI(roi: number, years: number): number {
  if (years === 0) {
    return Infinity;
  }

  // Handle total loss case
  if (roi === -100) {
    return -100;
  }

  // Convert ROI percentage to decimal for calculation
  const roiDecimal = roi / 100;

  // Calculate annualized return
  const annualizedReturn = Math.pow(1 + roiDecimal, 1 / years) - 1;

  // Convert back to percentage
  return annualizedReturn * 100;
}

/**
 * Convert investment period to years based on period type
 * @param period - Investment period
 * @param periodType - Type of period
 * @returns Period in years
 */
export function convertToYears(period: number, periodType: PeriodType): number {
  switch (periodType) {
    case 'years':
      return period;
    case 'months':
      return period / 12;
    case 'days':
      return period / 365;
    default:
      return period;
  }
}

/**
 * Calculate complete ROI results
 * @param inputs - ROI calculation inputs
 * @returns Comprehensive ROI results
 */
export function calculateROIResults(inputs: ROIInputs): ROIResults {
  const {
    initialInvestment,
    finalValue,
    investmentPeriod,
    periodType,
    additionalCosts,
    additionalGains,
  } = inputs;

  // Calculate totals
  const totalInvested = initialInvestment + additionalCosts;
  const totalReturn = finalValue + additionalGains;
  const netProfit = totalReturn - totalInvested;
  const totalGain = netProfit;

  // Calculate ROI
  const roi = calculateBasicROI(totalInvested, totalReturn);

  // Convert period to years
  const effectivePeriodInYears = convertToYears(investmentPeriod, periodType);

  // Calculate annualized ROI
  const annualizedROI = calculateAnnualizedROI(roi, effectivePeriodInYears);

  // Calculate growth rates
  const monthlyGrowthRate =
    effectivePeriodInYears > 0
      ? calculateAnnualizedROI(roi, effectivePeriodInYears * 12) / 12
      : 0;

  const dailyGrowthRate =
    effectivePeriodInYears > 0
      ? calculateAnnualizedROI(roi, effectivePeriodInYears * 365) / 365
      : 0;

  // Calculate break-even point if there's a loss
  let breakEvenPoint: number | undefined;
  if (netProfit < 0 && annualizedROI !== -100) {
    // Estimate break-even based on current rate
    // This is a simplified calculation
    breakEvenPoint = undefined; // Would need more data for accurate calculation
  }

  return {
    roi,
    annualizedROI,
    totalReturn,
    netProfit,
    totalInvested,
    totalGain,
    effectivePeriodInYears,
    monthlyGrowthRate,
    dailyGrowthRate,
    breakEvenPoint,
  };
}

/**
 * Calculate ROI with inflation adjustment
 * @param results - Base ROI results
 * @param inflationRate - Annual inflation rate as percentage
 * @returns Real (inflation-adjusted) ROI
 */
export function calculateRealROI(
  results: ROIResults,
  inflationRate: number
): number {
  const { annualizedROI } = results;

  // Fisher equation: (1 + nominal) = (1 + real) × (1 + inflation)
  // Therefore: real = ((1 + nominal) / (1 + inflation)) - 1

  const nominalRate = annualizedROI / 100;
  const inflationRateDecimal = inflationRate / 100;

  const realRate = (1 + nominalRate) / (1 + inflationRateDecimal) - 1;

  return realRate * 100;
}

/**
 * Project future value based on current ROI
 * @param initialValue - Starting value
 * @param annualizedROI - Annual ROI percentage
 * @param years - Number of years to project
 * @returns Array of growth projections
 */
export function projectGrowth(
  initialValue: number,
  annualizedROI: number,
  years: number
): GrowthProjection[] {
  const projections: GrowthProjection[] = [];
  const growthRate = 1 + annualizedROI / 100;

  for (let year = 1; year <= years; year++) {
    const projectedValue = initialValue * Math.pow(growthRate, year);
    const cumulativeGain = projectedValue - initialValue;
    const projectedROI = ((projectedValue - initialValue) / initialValue) * 100;

    projections.push({
      year,
      projectedValue,
      projectedROI,
      cumulativeGain,
    });
  }

  return projections;
}

/**
 * Compare multiple investment scenarios
 * @param scenarios - Array of investment scenarios
 * @returns Sorted comparison results
 */
export function compareScenarios(
  scenarios: InvestmentScenario[]
): ComparisonResult[] {
  const results = scenarios.map((scenario) => {
    const inputs: ROIInputs = {
      initialInvestment: scenario.initialInvestment,
      finalValue: scenario.finalValue,
      investmentPeriod: scenario.period,
      periodType: scenario.periodType,
      additionalCosts: scenario.additionalCosts || 0,
      additionalGains: scenario.additionalGains || 0,
    };

    const result = calculateROIResults(inputs);

    return {
      scenario: scenario.name,
      roi: result.roi,
      annualizedROI: result.annualizedROI,
      netProfit: result.netProfit,
      rank: 0, // Will be set after sorting
    };
  });

  // Sort by annualized ROI (descending)
  results.sort((a, b) => b.annualizedROI - a.annualizedROI);

  // Assign ranks
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate ROI calculation inputs
 * @param inputs - ROI calculation inputs
 * @returns Array of validation errors
 */
export function validateROIInputs(inputs: ROIInputs): string[] {
  const errors: string[] = [];

  if (inputs.initialInvestment <= 0) {
    errors.push('Initial investment must be greater than 0');
  }

  if (inputs.finalValue < 0) {
    errors.push('Final value must be greater than or equal to 0');
  }

  if (inputs.investmentPeriod <= 0) {
    errors.push('Investment period must be greater than 0');
  }

  if (inputs.additionalCosts < 0) {
    errors.push('Additional costs cannot be negative');
  }

  if (inputs.additionalGains < 0) {
    errors.push('Additional gains cannot be negative');
  }

  // Validate period type
  const validPeriodTypes: PeriodType[] = ['years', 'months', 'days'];
  if (!validPeriodTypes.includes(inputs.periodType)) {
    errors.push('Invalid period type. Must be years, months, or days');
  }

  return errors;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format number as percentage
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (!isFinite(value)) {
    return 'N/A';
  }
  return value.toFixed(decimals) + '%';
}

/**
 * Format number as currency
 * @param value - Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

/**
 * Format period for display
 * @param period - Period value
 * @param periodType - Type of period
 * @returns Formatted period string
 */
export function formatPeriod(period: number, periodType: PeriodType): string {
  const singular = period === 1;

  switch (periodType) {
    case 'years':
      return `${period} ${singular ? 'year' : 'years'}`;
    case 'months':
      return `${period} ${singular ? 'month' : 'months'}`;
    case 'days':
      return `${period} ${singular ? 'day' : 'days'}`;
    default:
      return `${period} periods`;
  }
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare data for ROI breakdown pie chart
 * @param results - ROI calculation results
 * @returns Chart data structure
 */
export function prepareBreakdownChartData(results: ROIResults) {
  return {
    labels: ['Initial Investment', 'Net Profit'],
    datasets: [
      {
        data: [
          results.totalInvested,
          Math.max(0, results.netProfit), // Don't show negative values in pie chart
        ],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)', // Purple for investment
          results.netProfit >= 0
            ? 'rgba(16, 185, 129, 0.8)' // Green for profit
            : 'rgba(239, 68, 68, 0.8)', // Red for loss
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          results.netProfit >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };
}

/**
 * Prepare data for growth projection line chart
 * @param initialValue - Starting value
 * @param projections - Growth projections
 * @returns Chart data structure
 */
export function prepareGrowthChartData(
  initialValue: number,
  projections: GrowthProjection[]
) {
  const labels = ['Start', ...projections.map((p) => `Year ${p.year}`)];
  const values = [initialValue, ...projections.map((p) => p.projectedValue)];

  return {
    labels,
    datasets: [
      {
        label: 'Projected Value',
        data: values,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
}

/**
 * Prepare data for scenario comparison bar chart
 * @param comparisons - Comparison results
 * @returns Chart data structure
 */
export function prepareComparisonChartData(comparisons: ComparisonResult[]) {
  return {
    labels: comparisons.map((c) => c.scenario),
    datasets: [
      {
        label: 'ROI %',
        data: comparisons.map((c) => c.roi),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
      },
      {
        label: 'Annualized ROI %',
        data: comparisons.map((c) => c.annualizedROI),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };
}
