// Depreciation Calculator Types
export type DepreciationMethod =
  | 'straight-line'
  | 'declining-balance'
  | 'double-declining-balance'
  | 'sum-of-years-digits';

export interface DepreciationInputs {
  assetCost: number;
  salvageValue: number;
  usefulLife: number; // in years
  method: DepreciationMethod;
}

export interface YearlyDepreciation {
  year: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

export interface DepreciationResults {
  method: DepreciationMethod;
  assetCost: number;
  salvageValue: number;
  usefulLife: number;
  depreciableBase: number;
  totalDepreciation: number;
  schedule: YearlyDepreciation[];
}

/**
 * Calculate straight-line depreciation
 * Formula: (Asset Cost - Salvage Value) / Useful Life
 */
export function calculateStraightLine(
  assetCost: number,
  salvageValue: number,
  usefulLife: number
): DepreciationResults {
  const depreciableBase = assetCost - salvageValue;
  const annualDepreciation = depreciableBase / usefulLife;
  const schedule: YearlyDepreciation[] = [];

  let accumulatedDepreciation = 0;

  for (let year = 1; year <= usefulLife; year++) {
    accumulatedDepreciation += annualDepreciation;
    const bookValue = assetCost - accumulatedDepreciation;

    schedule.push({
      year,
      annualDepreciation,
      accumulatedDepreciation,
      bookValue,
    });
  }

  return {
    method: 'straight-line',
    assetCost,
    salvageValue,
    usefulLife,
    depreciableBase,
    totalDepreciation: depreciableBase,
    schedule,
  };
}

/**
 * Calculate declining balance depreciation
 * Formula: Book Value × Depreciation Rate
 * Rate = 1 / Useful Life
 */
export function calculateDecliningBalance(
  assetCost: number,
  salvageValue: number,
  usefulLife: number
): DepreciationResults {
  const depreciationRate = 1 / usefulLife;
  const schedule: YearlyDepreciation[] = [];

  let bookValue = assetCost;
  let accumulatedDepreciation = 0;

  for (let year = 1; year <= usefulLife; year++) {
    let annualDepreciation = bookValue * depreciationRate;

    // Ensure we don't depreciate below salvage value
    if (bookValue - annualDepreciation < salvageValue) {
      annualDepreciation = bookValue - salvageValue;
    }

    accumulatedDepreciation += annualDepreciation;
    bookValue -= annualDepreciation;

    schedule.push({
      year,
      annualDepreciation,
      accumulatedDepreciation,
      bookValue,
    });
  }

  return {
    method: 'declining-balance',
    assetCost,
    salvageValue,
    usefulLife,
    depreciableBase: assetCost - salvageValue,
    totalDepreciation: accumulatedDepreciation,
    schedule,
  };
}

/**
 * Calculate double declining balance depreciation
 * Formula: Book Value × (2 / Useful Life)
 */
export function calculateDoubleDecliningBalance(
  assetCost: number,
  salvageValue: number,
  usefulLife: number
): DepreciationResults {
  const depreciationRate = 2 / usefulLife;
  const schedule: YearlyDepreciation[] = [];

  let bookValue = assetCost;
  let accumulatedDepreciation = 0;

  for (let year = 1; year <= usefulLife; year++) {
    let annualDepreciation = bookValue * depreciationRate;

    // Ensure we don't depreciate below salvage value
    if (bookValue - annualDepreciation < salvageValue) {
      annualDepreciation = bookValue - salvageValue;
    }

    accumulatedDepreciation += annualDepreciation;
    bookValue -= annualDepreciation;

    schedule.push({
      year,
      annualDepreciation,
      accumulatedDepreciation,
      bookValue,
    });
  }

  return {
    method: 'double-declining-balance',
    assetCost,
    salvageValue,
    usefulLife,
    depreciableBase: assetCost - salvageValue,
    totalDepreciation: accumulatedDepreciation,
    schedule,
  };
}

/**
 * Calculate sum of years' digits depreciation
 * Formula: (Asset Cost - Salvage Value) × (Remaining Life / Sum of Years' Digits)
 */
export function calculateSumOfYearsDigits(
  assetCost: number,
  salvageValue: number,
  usefulLife: number
): DepreciationResults {
  const depreciableBase = assetCost - salvageValue;
  const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
  const schedule: YearlyDepreciation[] = [];

  let accumulatedDepreciation = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const remainingLife = usefulLife - year + 1;
    const annualDepreciation = depreciableBase * (remainingLife / sumOfYears);

    accumulatedDepreciation += annualDepreciation;
    const bookValue = assetCost - accumulatedDepreciation;

    schedule.push({
      year,
      annualDepreciation,
      accumulatedDepreciation,
      bookValue,
    });
  }

  return {
    method: 'sum-of-years-digits',
    assetCost,
    salvageValue,
    usefulLife,
    depreciableBase,
    totalDepreciation: depreciableBase,
    schedule,
  };
}

/**
 * Calculate depreciation using the specified method
 */
export function calculateDepreciation(
  inputs: DepreciationInputs
): DepreciationResults {
  const { assetCost, salvageValue, usefulLife, method } = inputs;

  // Validation
  if (assetCost <= 0) {
    throw new Error('Asset cost must be greater than 0');
  }

  if (salvageValue < 0) {
    throw new Error('Salvage value cannot be negative');
  }

  if (salvageValue >= assetCost) {
    throw new Error('Salvage value must be less than asset cost');
  }

  if (usefulLife <= 0) {
    throw new Error('Useful life must be greater than 0');
  }

  switch (method) {
    case 'straight-line':
      return calculateStraightLine(assetCost, salvageValue, usefulLife);
    case 'declining-balance':
      return calculateDecliningBalance(assetCost, salvageValue, usefulLife);
    case 'double-declining-balance':
      return calculateDoubleDecliningBalance(
        assetCost,
        salvageValue,
        usefulLife
      );
    case 'sum-of-years-digits':
      return calculateSumOfYearsDigits(assetCost, salvageValue, usefulLife);
    default:
      throw new Error('Invalid depreciation method');
  }
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
 * Get method display name
 */
export function getMethodDisplayName(method: DepreciationMethod): string {
  switch (method) {
    case 'straight-line':
      return 'Straight-Line';
    case 'declining-balance':
      return 'Declining Balance';
    case 'double-declining-balance':
      return 'Double Declining Balance';
    case 'sum-of-years-digits':
      return "Sum of Years' Digits";
    default:
      return method;
  }
}
