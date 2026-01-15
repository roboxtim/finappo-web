// 2025 Federal Tax Brackets
export const TAX_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 0.1 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  marriedFilingJointly: [
    { min: 0, max: 24800, rate: 0.1 },
    { min: 24800, max: 100800, rate: 0.12 },
    { min: 100800, max: 211400, rate: 0.22 },
    { min: 211400, max: 403550, rate: 0.24 },
    { min: 403550, max: 512450, rate: 0.32 },
    { min: 512450, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  headOfHousehold: [
    { min: 0, max: 17450, rate: 0.1 },
    { min: 17450, max: 65450, rate: 0.12 },
    { min: 65450, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// 2025 Standard Deductions
export const STANDARD_DEDUCTION_2025 = {
  single: 15750,
  marriedFilingJointly: 31500,
  headOfHousehold: 23850,
};

// Long-term capital gains tax brackets for 2025
export const CAPITAL_GAINS_BRACKETS_2025 = {
  single: [
    { min: 0, max: 48350, rate: 0.0 },
    { min: 48350, max: 533400, rate: 0.15 },
    { min: 533400, max: Infinity, rate: 0.2 },
  ],
  marriedFilingJointly: [
    { min: 0, max: 96700, rate: 0.0 },
    { min: 96700, max: 600050, rate: 0.15 },
    { min: 600050, max: Infinity, rate: 0.2 },
  ],
};

// Child Tax Credit for 2025
export const CHILD_TAX_CREDIT_2025 = 2000;
export const CHILD_TAX_CREDIT_PHASEOUT = {
  single: 200000,
  marriedFilingJointly: 400000,
};

// SALT deduction cap
export const SALT_CAP = 10000;

export interface ItemizedDeductions {
  mortgageInterest: number;
  charitableDonations: number;
  stateLocalTaxes: number;
  medicalExpenses: number;
  otherDeductions: number;
}

export interface PersonInputs {
  salary: number;
  interestDividends: number;
  capitalGainsShortTerm: number;
  capitalGainsLongTerm: number;
  retirement401k: number;
  healthInsurance: number;
  otherPreTaxDeductions: number;
  filingStatus: 'single' | 'head_of_household';
  itemizedDeductions?: ItemizedDeductions;
}

export interface MarriageCalculatorInputs {
  person1: PersonInputs;
  person2: PersonInputs;
  dependents: number;
  useStandardDeduction: boolean;
  stateLocalTaxRate: number;
}

export interface TaxCalculation {
  grossIncome: number;
  adjustedGrossIncome: number;
  deduction: number;
  taxableIncome: number;
  ordinaryIncome: number;
  capitalGainsIncome: number;
  federalTax: number;
  capitalGainsTax: number;
  totalFederalTax: number;
  effectiveTaxRate: number;
  marginalRate: number;
  childTaxCredit: number;
  finalTax: number;
  stateLocalTax: number;
  totalTax: number;
}

export interface MarriageCalculatorResults {
  person1: TaxCalculation;
  person2: TaxCalculation;
  separateTotalTax: number;
  marriedFilingJointly: TaxCalculation;
  marriagePenaltyOrBonus: number;
  percentageChange: number;
  totalHouseholdIncome: number;
  recommendation: string;
  breakdownDetails: {
    person1TaxSingle: number;
    person2TaxSingle: number;
    combinedSingleTax: number;
    marriedJointTax: number;
    difference: number;
    effectiveTaxRateSingle: number;
    effectiveTaxRateMarried: number;
  };
}

function calculateFederalTax(
  taxableIncome: number,
  brackets: typeof TAX_BRACKETS_2025.single
): number {
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - previousMax;
    tax += taxableInBracket * bracket.rate;

    previousMax = bracket.max;
    if (taxableIncome <= bracket.max) break;
  }

  return tax;
}

function calculateCapitalGainsTax(
  capitalGainsIncome: number,
  ordinaryIncome: number,
  brackets: typeof CAPITAL_GAINS_BRACKETS_2025.single
): number {
  if (capitalGainsIncome <= 0) return 0;

  // Capital gains are stacked on top of ordinary income
  const totalIncome = ordinaryIncome + capitalGainsIncome;

  for (const bracket of brackets) {
    if (totalIncome <= bracket.max) {
      return capitalGainsIncome * bracket.rate;
    }
  }

  // If we're in the highest bracket
  return capitalGainsIncome * brackets[brackets.length - 1].rate;
}

function getMarginalRate(
  taxableIncome: number,
  brackets: typeof TAX_BRACKETS_2025.single
): number {
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      return bracket.rate * 100;
    }
  }
  return 37; // Top rate
}

function calculateChildTaxCredit(
  dependents: number,
  agi: number,
  filingStatus: 'single' | 'marriedFilingJointly' | 'headOfHousehold'
): number {
  if (dependents === 0) return 0;

  const baseCredit = dependents * CHILD_TAX_CREDIT_2025;
  const phaseoutThreshold =
    filingStatus === 'marriedFilingJointly'
      ? CHILD_TAX_CREDIT_PHASEOUT.marriedFilingJointly
      : CHILD_TAX_CREDIT_PHASEOUT.single;

  if (agi <= phaseoutThreshold) {
    return baseCredit;
  }

  // Phase out $50 for each $1,000 over the threshold
  const excessIncome = agi - phaseoutThreshold;
  const reduction = Math.floor(excessIncome / 1000) * 50;

  return Math.max(0, baseCredit - reduction);
}

function calculateItemizedDeduction(deductions: ItemizedDeductions): number {
  const saltCapped = Math.min(deductions.stateLocalTaxes, SALT_CAP);

  return (
    deductions.mortgageInterest +
    deductions.charitableDonations +
    saltCapped +
    deductions.medicalExpenses +
    deductions.otherDeductions
  );
}

function calculatePersonTax(
  person: PersonInputs,
  dependents: number,
  useStandardDeduction: boolean,
  stateLocalTaxRate: number,
  isPartOfCouple: boolean = false
): TaxCalculation {
  // Calculate gross income
  const grossIncome =
    person.salary +
    person.interestDividends +
    person.capitalGainsShortTerm +
    person.capitalGainsLongTerm;

  // Calculate AGI (after pre-tax deductions)
  const totalPreTaxDeductions =
    person.retirement401k +
    person.healthInsurance +
    person.otherPreTaxDeductions;

  const adjustedGrossIncome = grossIncome - totalPreTaxDeductions;

  // Determine filing status for brackets
  const filingStatus =
    person.filingStatus === 'head_of_household' && !isPartOfCouple
      ? 'headOfHousehold'
      : 'single';

  // Calculate deduction
  let deduction: number;
  if (useStandardDeduction) {
    deduction =
      filingStatus === 'headOfHousehold'
        ? STANDARD_DEDUCTION_2025.headOfHousehold
        : STANDARD_DEDUCTION_2025.single;
  } else {
    const itemized = person.itemizedDeductions
      ? calculateItemizedDeduction(person.itemizedDeductions)
      : 0;
    const standard =
      filingStatus === 'headOfHousehold'
        ? STANDARD_DEDUCTION_2025.headOfHousehold
        : STANDARD_DEDUCTION_2025.single;
    deduction = Math.max(itemized, standard);
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction);

  // Separate ordinary income and capital gains
  const capitalGainsIncome = person.capitalGainsLongTerm;
  const ordinaryIncome = Math.max(0, taxableIncome - capitalGainsIncome);

  // Calculate federal tax on ordinary income
  const brackets =
    filingStatus === 'headOfHousehold'
      ? TAX_BRACKETS_2025.headOfHousehold
      : TAX_BRACKETS_2025.single;

  const federalTax = calculateFederalTax(ordinaryIncome, brackets);

  // Calculate capital gains tax
  const capitalGainsTax = calculateCapitalGainsTax(
    capitalGainsIncome,
    ordinaryIncome,
    CAPITAL_GAINS_BRACKETS_2025.single
  );

  // Short-term capital gains are taxed as ordinary income
  const shortTermGainsTax =
    (person.capitalGainsShortTerm * getMarginalRate(ordinaryIncome, brackets)) /
    100;

  const totalFederalTax = federalTax + capitalGainsTax + shortTermGainsTax;

  // Calculate child tax credit
  const childTaxCredit = calculateChildTaxCredit(
    dependents,
    adjustedGrossIncome,
    filingStatus
  );

  // Calculate final tax after credits
  const finalTax = Math.max(0, totalFederalTax - childTaxCredit);

  // Calculate state/local tax
  const stateLocalTax = adjustedGrossIncome * (stateLocalTaxRate / 100);

  // Calculate effective tax rate
  const effectiveTaxRate =
    adjustedGrossIncome > 0 ? (finalTax / adjustedGrossIncome) * 100 : 0;

  return {
    grossIncome,
    adjustedGrossIncome,
    deduction,
    taxableIncome,
    ordinaryIncome,
    capitalGainsIncome,
    federalTax,
    capitalGainsTax,
    totalFederalTax,
    effectiveTaxRate,
    marginalRate: getMarginalRate(taxableIncome, brackets),
    childTaxCredit,
    finalTax,
    stateLocalTax,
    totalTax: finalTax + stateLocalTax,
  };
}

function calculateMarriedFilingJointlyTax(
  inputs: MarriageCalculatorInputs
): TaxCalculation {
  // Combine incomes
  const combinedSalary = inputs.person1.salary + inputs.person2.salary;
  const combinedInterestDividends =
    inputs.person1.interestDividends + inputs.person2.interestDividends;
  const combinedShortTermGains =
    inputs.person1.capitalGainsShortTerm + inputs.person2.capitalGainsShortTerm;
  const combinedLongTermGains =
    inputs.person1.capitalGainsLongTerm + inputs.person2.capitalGainsLongTerm;

  const grossIncome =
    combinedSalary +
    combinedInterestDividends +
    combinedShortTermGains +
    combinedLongTermGains;

  // Combine pre-tax deductions
  const totalPreTaxDeductions =
    inputs.person1.retirement401k +
    inputs.person1.healthInsurance +
    inputs.person1.otherPreTaxDeductions +
    inputs.person2.retirement401k +
    inputs.person2.healthInsurance +
    inputs.person2.otherPreTaxDeductions;

  const adjustedGrossIncome = grossIncome - totalPreTaxDeductions;

  // Calculate deduction
  let deduction: number;
  if (inputs.useStandardDeduction) {
    deduction = STANDARD_DEDUCTION_2025.marriedFilingJointly;
  } else {
    const person1Itemized = inputs.person1.itemizedDeductions
      ? calculateItemizedDeduction(inputs.person1.itemizedDeductions)
      : 0;
    const person2Itemized = inputs.person2.itemizedDeductions
      ? calculateItemizedDeduction(inputs.person2.itemizedDeductions)
      : 0;
    const combinedItemized = person1Itemized + person2Itemized;
    deduction = Math.max(
      combinedItemized,
      STANDARD_DEDUCTION_2025.marriedFilingJointly
    );
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, adjustedGrossIncome - deduction);

  // Separate ordinary income and capital gains
  const capitalGainsIncome = combinedLongTermGains;
  const ordinaryIncome = Math.max(0, taxableIncome - capitalGainsIncome);

  // Calculate federal tax
  const federalTax = calculateFederalTax(
    ordinaryIncome,
    TAX_BRACKETS_2025.marriedFilingJointly
  );

  // Calculate capital gains tax
  const capitalGainsTax = calculateCapitalGainsTax(
    capitalGainsIncome,
    ordinaryIncome,
    CAPITAL_GAINS_BRACKETS_2025.marriedFilingJointly
  );

  // Short-term capital gains tax
  const marginalRate = getMarginalRate(
    ordinaryIncome,
    TAX_BRACKETS_2025.marriedFilingJointly
  );
  const shortTermGainsTax = (combinedShortTermGains * marginalRate) / 100;

  const totalFederalTax = federalTax + capitalGainsTax + shortTermGainsTax;

  // Calculate child tax credit
  const childTaxCredit = calculateChildTaxCredit(
    inputs.dependents,
    adjustedGrossIncome,
    'marriedFilingJointly'
  );

  // Calculate final tax
  const finalTax = Math.max(0, totalFederalTax - childTaxCredit);

  // Calculate state/local tax
  const stateLocalTax = adjustedGrossIncome * (inputs.stateLocalTaxRate / 100);

  // Calculate effective tax rate
  const effectiveTaxRate =
    adjustedGrossIncome > 0 ? (finalTax / adjustedGrossIncome) * 100 : 0;

  return {
    grossIncome,
    adjustedGrossIncome,
    deduction,
    taxableIncome,
    ordinaryIncome,
    capitalGainsIncome,
    federalTax,
    capitalGainsTax,
    totalFederalTax,
    effectiveTaxRate,
    marginalRate,
    childTaxCredit,
    finalTax,
    stateLocalTax,
    totalTax: finalTax + stateLocalTax,
  };
}

export function calculateMarriageTax(
  inputs: MarriageCalculatorInputs
): MarriageCalculatorResults {
  // Calculate taxes for person 1 filing separately
  const person1Tax = calculatePersonTax(
    inputs.person1,
    inputs.person1.filingStatus === 'head_of_household' ? inputs.dependents : 0,
    inputs.useStandardDeduction,
    inputs.stateLocalTaxRate,
    false
  );

  // Calculate taxes for person 2 filing separately
  const person2Tax = calculatePersonTax(
    inputs.person2,
    inputs.person2.filingStatus === 'head_of_household' &&
      inputs.person1.filingStatus !== 'head_of_household'
      ? inputs.dependents
      : 0,
    inputs.useStandardDeduction,
    inputs.stateLocalTaxRate,
    false
  );

  // Calculate combined single taxes
  const separateTotalTax = person1Tax.totalTax + person2Tax.totalTax;

  // Calculate married filing jointly
  const marriedFilingJointlyTax = calculateMarriedFilingJointlyTax(inputs);

  // Calculate marriage penalty or bonus (negative = bonus, positive = penalty)
  const marriagePenaltyOrBonus =
    marriedFilingJointlyTax.totalTax - separateTotalTax;

  // Calculate percentage change
  const percentageChange =
    separateTotalTax > 0
      ? (marriagePenaltyOrBonus / separateTotalTax) * 100
      : 0;

  // Total household income
  const totalHouseholdIncome = person1Tax.grossIncome + person2Tax.grossIncome;

  // Generate recommendation
  let recommendation: string;
  if (marriagePenaltyOrBonus < -1000) {
    recommendation = `Marriage provides a significant tax benefit of ${formatCurrency(Math.abs(marriagePenaltyOrBonus))} per year. Filing jointly would reduce your combined tax liability by ${Math.abs(percentageChange).toFixed(1)}%.`;
  } else if (marriagePenaltyOrBonus > 1000) {
    recommendation = `Marriage results in a tax penalty of ${formatCurrency(marriagePenaltyOrBonus)} per year. This is common for dual high-income earners. Consider maximizing pre-tax deductions to reduce the impact.`;
  } else {
    recommendation = `Marriage has minimal tax impact (${formatCurrency(Math.abs(marriagePenaltyOrBonus))} ${marriagePenaltyOrBonus > 0 ? 'penalty' : 'bonus'}). Your tax situation would remain essentially the same.`;
  }

  return {
    person1: person1Tax,
    person2: person2Tax,
    separateTotalTax,
    marriedFilingJointly: marriedFilingJointlyTax,
    marriagePenaltyOrBonus,
    percentageChange,
    totalHouseholdIncome,
    recommendation,
    breakdownDetails: {
      person1TaxSingle: person1Tax.totalTax,
      person2TaxSingle: person2Tax.totalTax,
      combinedSingleTax: separateTotalTax,
      marriedJointTax: marriedFilingJointlyTax.totalTax,
      difference: marriagePenaltyOrBonus,
      effectiveTaxRateSingle:
        totalHouseholdIncome > 0
          ? (separateTotalTax / totalHouseholdIncome) * 100
          : 0,
      effectiveTaxRateMarried:
        totalHouseholdIncome > 0
          ? (marriedFilingJointlyTax.totalTax / totalHouseholdIncome) * 100
          : 0,
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function validateInputs(inputs: MarriageCalculatorInputs): string[] {
  const errors: string[] = [];

  // Validate person 1 inputs
  if (inputs.person1.salary < 0)
    errors.push('Person 1 salary cannot be negative');
  if (inputs.person1.retirement401k > 30000)
    errors.push('Person 1 401(k) contribution exceeds IRS limit');

  // Validate person 2 inputs
  if (inputs.person2.salary < 0)
    errors.push('Person 2 salary cannot be negative');
  if (inputs.person2.retirement401k > 30000)
    errors.push('Person 2 401(k) contribution exceeds IRS limit');

  // Validate dependents
  if (inputs.dependents < 0)
    errors.push('Number of dependents cannot be negative');
  if (inputs.dependents > 10) errors.push('Please verify number of dependents');

  // Validate state tax rate
  if (inputs.stateLocalTaxRate < 0 || inputs.stateLocalTaxRate > 20) {
    errors.push('State/local tax rate must be between 0% and 20%');
  }

  return errors;
}
