// 2025 Federal Tax Brackets
export const TAX_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  marriedJointly: [
    { min: 0, max: 23850, rate: 0.1 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  marriedSeparately: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 },
  ],
  headOfHousehold: [
    { min: 0, max: 17000, rate: 0.1 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// 2025 Standard Deductions
export const STANDARD_DEDUCTIONS_2025 = {
  single: 15750,
  marriedJointly: 31500,
  marriedSeparately: 15750,
  headOfHousehold: 23625,
};

// 2025 Child Tax Credit
export const CHILD_TAX_CREDIT_2025 = {
  creditPerChild: 2200,
  refundablePerChild: 1700,
  creditOtherDependent: 500,
  phaseOutSingle: 200000,
  phaseOutMarried: 400000,
  phaseOutRate: 50, // $50 per $1,000 over threshold
};

// 2025 Earned Income Tax Credit
export const EITC_2025 = {
  maxCredit: {
    0: 649,
    1: 4328,
    2: 7152,
    3: 8046,
  },
  phaseOutStart: {
    single: {
      0: 10330,
      1: 23080,
      2: 23080,
      3: 23080,
    },
    married: {
      0: 17800,
      1: 30550,
      2: 30550,
      3: 30550,
    },
  },
  phaseOutEnd: {
    single: {
      0: 19104,
      1: 50954,
      2: 56838,
      3: 60794,
    },
    married: {
      0: 26575,
      1: 58424,
      2: 64308,
      3: 68265,
    },
  },
};

export type FilingStatus =
  | 'single'
  | 'marriedJointly'
  | 'marriedSeparately'
  | 'headOfHousehold';

export interface TaxInputs {
  filingStatus: FilingStatus;
  grossIncome: number;
  dependentsUnder17: number;
  dependentsOver17: number;
  preTaxDeductions: number; // 401k, HSA, etc.
  itemizedDeductions: number;
  federalWithholding: number;
  stateWithholding: number;
  otherCredits: number;
  // Additional income types
  interestIncome?: number;
  dividendIncome?: number;
  capitalGainsShort?: number;
  capitalGainsLong?: number;
  businessIncome?: number;
  // Itemized deduction details
  mortgageInterest?: number;
  stateLocalTaxes?: number;
  charitableDonations?: number;
  medicalExpenses?: number;
  // Credits
  educationCredits?: number;
  energyCredits?: number;
  retirementSavingsCredit?: number;
}

export interface TaxResults {
  grossIncome: number;
  adjustedGrossIncome: number;
  standardDeduction: number;
  deductionUsed: number;
  deductionType: 'standard' | 'itemized';
  taxableIncome: number;
  federalTax: number;
  marginalRate: number;
  effectiveRate: number;
  childTaxCredit: {
    total: number;
    refundable: number;
    nonRefundable: number;
  };
  earnedIncomeCredit: number;
  otherCredits: number;
  totalCredits: number;
  taxAfterCredits: number;
  totalWithholding: number;
  refundOrOwed: number;
  takeHomePay: number;
  monthlyTakeHome: number;
  biweeklyTakeHome: number;
  // Breakdown by bracket
  taxByBracket: Array<{
    bracket: string;
    income: number;
    tax: number;
    rate: number;
  }>;
  // State tax estimate (simplified)
  estimatedStateTax: number;
  totalTaxLiability: number;
}

export function getStandardDeduction(filingStatus: FilingStatus): number {
  return STANDARD_DEDUCTIONS_2025[filingStatus];
}

export function calculateTaxByBracket(
  taxableIncome: number,
  filingStatus: FilingStatus
): {
  federalTax: number;
  marginalRate: number;
  effectiveRate: number;
  breakdown: Array<{
    bracket: string;
    income: number;
    tax: number;
    rate: number;
  }>;
} {
  const brackets = TAX_BRACKETS_2025[filingStatus];
  let totalTax = 0;
  let marginalRate = 0;
  const breakdown: Array<{
    bracket: string;
    income: number;
    tax: number;
    rate: number;
  }> = [];

  for (const bracket of brackets) {
    if (taxableIncome <= 0) break;

    const bracketMin = bracket.min;
    const bracketMax =
      bracket.max === Infinity
        ? taxableIncome
        : Math.min(bracket.max, taxableIncome);

    if (taxableIncome > bracketMin) {
      const taxableInBracket = Math.min(
        bracketMax - bracketMin,
        taxableIncome - bracketMin
      );
      const taxForBracket = taxableInBracket * bracket.rate;

      totalTax += taxForBracket;
      marginalRate = bracket.rate * 100;

      if (taxableInBracket > 0) {
        breakdown.push({
          bracket: `${(bracket.rate * 100).toFixed(0)}%`,
          income: taxableInBracket,
          tax: taxForBracket,
          rate: bracket.rate,
        });
      }
    }
  }

  const effectiveRate =
    taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    federalTax: Math.round(totalTax * 100) / 100,
    marginalRate,
    effectiveRate,
    breakdown,
  };
}

export function calculateChildTaxCredit(
  childrenUnder17: number,
  otherDependents: number,
  agi: number,
  filingStatus: FilingStatus
): {
  total: number;
  refundable: number;
  nonRefundable: number;
} {
  const phaseOutThreshold =
    filingStatus === 'marriedJointly'
      ? CHILD_TAX_CREDIT_2025.phaseOutMarried
      : CHILD_TAX_CREDIT_2025.phaseOutSingle;

  // Calculate phase-out reduction
  let reduction = 0;
  if (agi > phaseOutThreshold) {
    const excessIncome = agi - phaseOutThreshold;
    const reductionAmount =
      Math.floor(excessIncome / 1000) * CHILD_TAX_CREDIT_2025.phaseOutRate;
    reduction = reductionAmount;
  }

  // Calculate child tax credit
  let childCredit = childrenUnder17 * CHILD_TAX_CREDIT_2025.creditPerChild;
  childCredit = Math.max(0, childCredit - Math.min(childCredit, reduction));

  // Calculate other dependent credit
  let otherCredit =
    otherDependents * CHILD_TAX_CREDIT_2025.creditOtherDependent;
  const remainingReduction = Math.max(
    0,
    reduction -
      (childrenUnder17 * CHILD_TAX_CREDIT_2025.creditPerChild - childCredit)
  );
  otherCredit = Math.max(
    0,
    otherCredit - Math.min(otherCredit, remainingReduction)
  );

  // Calculate refundable portion (only for children under 17)
  const refundableAmount = Math.min(
    childCredit,
    childrenUnder17 * CHILD_TAX_CREDIT_2025.refundablePerChild
  );

  const total = childCredit + otherCredit;
  const nonRefundable = total - refundableAmount;

  return {
    total,
    refundable: refundableAmount,
    nonRefundable,
  };
}

export function calculateEITC(
  earnedIncome: number,
  filingStatus: FilingStatus,
  numChildren: number
): number {
  // Cap at 3+ children
  const childrenKey = Math.min(3, numChildren) as 0 | 1 | 2 | 3;
  const isMarried = filingStatus === 'marriedJointly';
  const statusKey = isMarried ? 'married' : 'single';

  const maxCredit = EITC_2025.maxCredit[childrenKey];
  const phaseOutStart = EITC_2025.phaseOutStart[statusKey][childrenKey];
  const phaseOutEnd = EITC_2025.phaseOutEnd[statusKey][childrenKey];

  // Check if income is too high
  if (earnedIncome > phaseOutEnd) {
    return 0;
  }

  // Check if in phase-out range
  if (earnedIncome > phaseOutStart) {
    const phaseOutRange = phaseOutEnd - phaseOutStart;
    const incomeAboveStart = earnedIncome - phaseOutStart;
    const phaseOutPercentage = incomeAboveStart / phaseOutRange;
    return Math.max(0, Math.round(maxCredit * (1 - phaseOutPercentage)));
  }

  // Below phase-out, calculate credit
  // Simplified calculation - actual EITC has specific phase-in rates
  const phaseInRate =
    childrenKey === 0
      ? 0.0765
      : childrenKey === 1
        ? 0.34
        : childrenKey === 2
          ? 0.4
          : 0.45;
  const calculatedCredit = earnedIncome * phaseInRate;

  return Math.min(maxCredit, Math.round(calculatedCredit));
}

export function calculateEstimatedStateTax(
  agi: number,
  filingStatus: FilingStatus
): number {
  // Simplified state tax estimate (average ~5% effective rate)
  // This varies significantly by state
  const averageStateRate = 0.05;
  const standardDeduction = getStandardDeduction(filingStatus);
  const stateTaxableIncome = Math.max(0, agi - standardDeduction * 0.5); // Simplified
  return Math.round(stateTaxableIncome * averageStateRate);
}

export function calculateTax(inputs: TaxInputs): TaxResults {
  // Calculate total gross income
  const totalGrossIncome =
    inputs.grossIncome +
    (inputs.interestIncome || 0) +
    (inputs.dividendIncome || 0) +
    (inputs.capitalGainsShort || 0) +
    (inputs.capitalGainsLong || 0) +
    (inputs.businessIncome || 0);

  // Calculate AGI
  const adjustedGrossIncome = totalGrossIncome - inputs.preTaxDeductions;

  // Determine deduction to use
  const standardDeduction = getStandardDeduction(inputs.filingStatus);
  const itemizedTotal =
    inputs.itemizedDeductions ||
    (inputs.mortgageInterest || 0) +
      Math.min(10000, inputs.stateLocalTaxes || 0) + // SALT cap
      (inputs.charitableDonations || 0) +
      Math.max(0, (inputs.medicalExpenses || 0) - adjustedGrossIncome * 0.075); // Medical expenses over 7.5% AGI

  const deductionUsed = Math.max(standardDeduction, itemizedTotal);
  const deductionType =
    deductionUsed === standardDeduction ? 'standard' : 'itemized';

  // Calculate taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deductionUsed);

  // Calculate federal tax
  const taxCalc = calculateTaxByBracket(taxableIncome, inputs.filingStatus);

  // Calculate credits
  const childTaxCredit = calculateChildTaxCredit(
    inputs.dependentsUnder17,
    inputs.dependentsOver17,
    adjustedGrossIncome,
    inputs.filingStatus
  );

  const earnedIncomeCredit = calculateEITC(
    inputs.grossIncome, // Using wages/earned income only
    inputs.filingStatus,
    inputs.dependentsUnder17 + inputs.dependentsOver17
  );

  const otherCredits =
    (inputs.otherCredits || 0) +
    (inputs.educationCredits || 0) +
    (inputs.energyCredits || 0) +
    (inputs.retirementSavingsCredit || 0);

  const totalCredits = childTaxCredit.nonRefundable + otherCredits;

  // Calculate tax after non-refundable credits
  const taxAfterNonRefundableCredits = Math.max(
    0,
    taxCalc.federalTax - totalCredits
  );

  // Apply refundable credits
  const totalRefundableCredits = childTaxCredit.refundable + earnedIncomeCredit;
  const taxAfterCredits = taxAfterNonRefundableCredits - totalRefundableCredits;

  // Calculate refund or amount owed
  const totalWithholding = inputs.federalWithholding + inputs.stateWithholding;
  const refundOrOwed = totalWithholding - Math.max(0, taxAfterCredits);

  // Calculate estimated state tax
  const estimatedStateTax = calculateEstimatedStateTax(
    adjustedGrossIncome,
    inputs.filingStatus
  );

  // Calculate total tax liability
  const totalTaxLiability = Math.max(0, taxAfterCredits) + estimatedStateTax;

  // Calculate take-home pay
  const takeHomePay =
    totalGrossIncome - totalTaxLiability - inputs.preTaxDeductions;
  const monthlyTakeHome = takeHomePay / 12;
  const biweeklyTakeHome = takeHomePay / 26;

  return {
    grossIncome: totalGrossIncome,
    adjustedGrossIncome,
    standardDeduction,
    deductionUsed,
    deductionType,
    taxableIncome,
    federalTax: taxCalc.federalTax,
    marginalRate: taxCalc.marginalRate,
    effectiveRate: taxCalc.effectiveRate,
    childTaxCredit,
    earnedIncomeCredit,
    otherCredits,
    totalCredits: totalCredits + totalRefundableCredits,
    taxAfterCredits,
    totalWithholding,
    refundOrOwed,
    takeHomePay,
    monthlyTakeHome,
    biweeklyTakeHome,
    taxByBracket: taxCalc.breakdown,
    estimatedStateTax,
    totalTaxLiability,
  };
}

export function validateTaxInputs(inputs: TaxInputs): string[] {
  const errors: string[] = [];

  if (inputs.grossIncome < 0) {
    errors.push('Gross income cannot be negative');
  }

  if (inputs.preTaxDeductions < 0) {
    errors.push('Pre-tax deductions cannot be negative');
  }

  if (inputs.preTaxDeductions > inputs.grossIncome) {
    errors.push('Pre-tax deductions cannot exceed gross income');
  }

  if (inputs.dependentsUnder17 < 0) {
    errors.push('Number of dependents cannot be negative');
  }

  if (inputs.dependentsOver17 < 0) {
    errors.push('Number of dependents cannot be negative');
  }

  if (inputs.itemizedDeductions < 0) {
    errors.push('Itemized deductions cannot be negative');
  }

  if (inputs.federalWithholding < 0) {
    errors.push('Federal withholding cannot be negative');
  }

  return errors;
}

// Formatting utilities
export function formatCurrency(amount: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
