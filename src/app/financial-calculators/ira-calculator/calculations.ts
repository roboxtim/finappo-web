// IRA Calculator Calculation Functions

export interface IRAInputs {
  currentBalance: number;
  annualContribution: number;
  expectedReturn: number; // As percentage (e.g., 7 for 7%)
  currentAge: number;
  retirementAge: number;
  currentTaxRate: number; // As percentage
  retirementTaxRate: number; // As percentage
  iraType: 'traditional' | 'roth' | 'both';
  inflationRate?: number; // Optional inflation adjustment
}

export interface IRAResults {
  // Traditional IRA
  traditionalBalance: number; // Before-tax balance at retirement
  traditionalBalanceAfterTax: number; // After-tax balance at retirement
  traditionalTotalContributions: number;
  traditionalTotalEarnings: number;
  traditionalTaxSavingsNow: number; // Tax deduction benefit
  traditionalTaxesAtRetirement: number;

  // Roth IRA
  rothBalance: number; // Tax-free balance at retirement
  rothTotalContributions: number; // After-tax contributions
  rothTotalEarnings: number; // Tax-free earnings
  rothEffectiveContributions: number; // Pre-tax equivalent of contributions

  // Comparison
  yearsToRetirement: number;
  totalContributions: number;
  effectiveReturnRate: number;

  // Annual Schedule
  annualSchedule: AnnualScheduleItem[];
}

export interface AnnualScheduleItem {
  age: number;
  year: number;
  contribution: number;
  traditionalBalance: number;
  rothBalance: number;
  traditionalEarnings: number;
  rothEarnings: number;
}

/**
 * Validate IRA calculator inputs
 */
export function validateIRAInputs(inputs: IRAInputs): string[] {
  const errors: string[] = [];

  if (inputs.currentBalance < 0) {
    errors.push('Current balance cannot be negative');
  }

  if (inputs.annualContribution < 0) {
    errors.push('Annual contribution cannot be negative');
  }

  // IRA contribution limits for 2024/2025
  const contributionLimit = inputs.currentAge >= 50 ? 8000 : 7000;
  if (inputs.annualContribution > contributionLimit * 1.5) {
    // Allow some buffer for future years
    errors.push(
      `Annual contribution seems too high (current limit: $${contributionLimit.toLocaleString()})`
    );
  }

  if (inputs.expectedReturn < -50 || inputs.expectedReturn > 50) {
    errors.push('Expected return must be between -50% and 50%');
  }

  if (inputs.currentAge < 18 || inputs.currentAge > 100) {
    errors.push('Current age must be between 18 and 100');
  }

  if (inputs.retirementAge < inputs.currentAge) {
    errors.push('Retirement age must be greater than current age');
  }

  if (inputs.retirementAge > 100) {
    errors.push('Retirement age cannot exceed 100');
  }

  if (inputs.currentTaxRate < 0 || inputs.currentTaxRate > 100) {
    errors.push('Current tax rate must be between 0% and 100%');
  }

  if (inputs.retirementTaxRate < 0 || inputs.retirementTaxRate > 100) {
    errors.push('Retirement tax rate must be between 0% and 100%');
  }

  return errors;
}

/**
 * Calculate compound interest with annual contributions
 * Using the standard future value of annuity formula
 * FV = PV(1+r)^n + PMT × [((1+r)^n - 1) / r]
 * Assumes contributions are made at the end of each period (ordinary annuity)
 */
function calculateFutureValue(
  presentValue: number,
  annualContribution: number,
  rate: number,
  years: number
): number {
  if (years === 0) return presentValue;
  if (rate === 0) return presentValue + annualContribution * years;

  const r = rate / 100;
  const compoundedPV = presentValue * Math.pow(1 + r, years);

  // Ordinary annuity formula - contributions at end of period
  const compoundedContributions =
    annualContribution * ((Math.pow(1 + r, years) - 1) / r);

  return compoundedPV + compoundedContributions;
}

/**
 * Generate annual schedule for IRA growth
 */
function generateAnnualSchedule(inputs: IRAInputs): AnnualScheduleItem[] {
  const schedule: AnnualScheduleItem[] = [];
  const years = inputs.retirementAge - inputs.currentAge;
  const r = inputs.expectedReturn / 100;

  let traditionalBalance = inputs.currentBalance;
  let rothBalance = inputs.currentBalance;

  // First year entry (starting position)
  schedule.push({
    age: inputs.currentAge,
    year: 0,
    contribution: inputs.annualContribution,
    traditionalBalance: traditionalBalance + inputs.annualContribution,
    rothBalance: rothBalance + inputs.annualContribution,
    traditionalEarnings: 0,
    rothEarnings: 0,
  });

  // Add contribution first, then apply growth
  traditionalBalance += inputs.annualContribution;
  rothBalance += inputs.annualContribution;

  for (let year = 1; year <= years; year++) {
    const age = inputs.currentAge + year;

    // Apply growth to previous year's ending balance
    traditionalBalance = traditionalBalance * (1 + r);
    rothBalance = rothBalance * (1 + r);

    // Calculate earnings for the year
    const traditionalEarnings =
      traditionalBalance - traditionalBalance / (1 + r);
    const rothEarnings = rothBalance - rothBalance / (1 + r);

    // Contribution for the upcoming year (none in the final year)
    const contribution = year < years ? inputs.annualContribution : 0;

    // Add contribution at end of year
    if (contribution > 0) {
      traditionalBalance += contribution;
      rothBalance += contribution;
    }

    schedule.push({
      age,
      year,
      contribution,
      traditionalBalance,
      rothBalance,
      traditionalEarnings,
      rothEarnings,
    });
  }

  return schedule;
}

/**
 * Calculate IRA results
 */
export function calculateIRAResults(inputs: IRAInputs): IRAResults {
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const totalContributions = inputs.annualContribution * yearsToRetirement;

  // Calculate future values
  const futureValue = calculateFutureValue(
    inputs.currentBalance,
    inputs.annualContribution,
    inputs.expectedReturn,
    yearsToRetirement
  );

  // Traditional IRA calculations
  const traditionalBalance = futureValue;
  const traditionalTotalContributions =
    inputs.currentBalance + totalContributions;
  const traditionalTotalEarnings =
    traditionalBalance - traditionalTotalContributions;
  const traditionalTaxSavingsNow =
    totalContributions * (inputs.currentTaxRate / 100);
  const traditionalTaxesAtRetirement =
    traditionalBalance * (inputs.retirementTaxRate / 100);
  const traditionalBalanceAfterTax =
    traditionalBalance - traditionalTaxesAtRetirement;

  // Roth IRA calculations
  // Roth contributions are made with after-tax dollars
  const rothEffectiveContributions =
    traditionalTotalContributions / (1 - inputs.currentTaxRate / 100);
  const rothBalance = futureValue; // Same growth, but tax-free at withdrawal
  const rothTotalContributions = traditionalTotalContributions; // After-tax amount
  const rothTotalEarnings = rothBalance - rothTotalContributions;

  // Generate annual schedule
  const annualSchedule = generateAnnualSchedule(inputs);

  // Calculate effective return rate (for display)
  const effectiveReturnRate = inputs.expectedReturn;

  return {
    // Traditional IRA
    traditionalBalance,
    traditionalBalanceAfterTax,
    traditionalTotalContributions,
    traditionalTotalEarnings,
    traditionalTaxSavingsNow,
    traditionalTaxesAtRetirement,

    // Roth IRA
    rothBalance,
    rothTotalContributions,
    rothTotalEarnings,
    rothEffectiveContributions,

    // Comparison
    yearsToRetirement,
    totalContributions,
    effectiveReturnRate,

    // Annual Schedule
    annualSchedule,
  };
}

/**
 * Format currency for display
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
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate which IRA type is better based on inputs
 */
export function compareIRATypes(results: IRAResults): {
  better: 'traditional' | 'roth';
  difference: number;
  reason: string;
} {
  const traditionalValue = results.traditionalBalanceAfterTax;
  const rothValue = results.rothBalance;
  const difference = Math.abs(traditionalValue - rothValue);

  if (traditionalValue > rothValue) {
    return {
      better: 'traditional',
      difference,
      reason:
        'Lower tax rate in retirement makes Traditional IRA more beneficial',
    };
  } else {
    return {
      better: 'roth',
      difference,
      reason: 'Tax-free growth and withdrawals make Roth IRA more beneficial',
    };
  }
}

/**
 * Calculate the break-even tax rate
 */
export function calculateBreakEvenTaxRate(inputs: IRAInputs): number {
  // The break-even tax rate is where Traditional and Roth give same after-tax value
  // This is approximately equal to the current tax rate for most scenarios
  return inputs.currentTaxRate;
}

/**
 * Project IRA value for additional years beyond retirement
 */
export function projectBeyondRetirement(
  retirementBalance: number,
  additionalYears: number,
  growthRate: number
): number {
  return calculateFutureValue(
    retirementBalance,
    0,
    growthRate,
    additionalYears
  );
}

/**
 * Calculate required monthly savings to reach a target
 */
export function calculateRequiredMonthlySavings(
  targetAmount: number,
  currentBalance: number,
  years: number,
  expectedReturn: number
): number {
  if (years === 0) return 0;
  if (expectedReturn === 0) {
    return (targetAmount - currentBalance) / (years * 12);
  }

  const r = expectedReturn / 100 / 12; // Monthly rate
  const n = years * 12; // Total months

  const futureValueOfCurrent = currentBalance * Math.pow(1 + r, n);
  const remainingNeeded = targetAmount - futureValueOfCurrent;

  if (remainingNeeded <= 0) return 0;

  // PMT = FV × r / ((1 + r)^n - 1)
  // Using ordinary annuity formula (contributions at end of period)
  const monthlyPayment = (remainingNeeded * r) / (Math.pow(1 + r, n) - 1);

  return monthlyPayment;
}
