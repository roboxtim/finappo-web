// Budget Calculator Types
export type PeriodType = 'monthly' | 'annual';

export interface IncomeInputs {
  salary: number;
  pension: number;
  investments: number;
  otherIncome: number;
  incomeTaxRate: number; // percentage
}

export interface HousingExpenses {
  mortgage: number;
  propertyTax: number;
  rental: number;
  insurance: number;
  hoaFee: number;
  homeMaintenance: number;
  utilities: number;
}

export interface TransportationExpenses {
  autoLoan: number;
  autoInsurance: number;
  gasoline: number;
  autoMaintenance: number;
  parkingTolls: number;
  otherTransportation: number;
}

export interface DebtExpenses {
  creditCard: number;
  studentLoan: number;
  otherLoans: number;
}

export interface LivingExpenses {
  food: number;
  clothing: number;
  householdSupplies: number;
  mealsOut: number;
  other: number;
}

export interface HealthcareExpenses {
  medicalInsurance: number;
  medicalSpending: number;
}

export interface ChildrenEducationExpenses {
  childPersonalCare: number;
  tuitionSupplies: number;
  childSupport: number;
  otherEducation: number;
}

export interface SavingsInvestmentExpenses {
  retirement401k: number;
  collegeSaving: number;
  investments: number;
  emergencyFund: number;
}

export interface MiscellaneousExpenses {
  pet: number;
  giftsDonations: number;
  hobbiesSports: number;
  entertainment: number;
  travelVacation: number;
  otherExpenses: number;
}

export interface BudgetInputs {
  period: PeriodType;
  income: IncomeInputs;
  housing: HousingExpenses;
  transportation: TransportationExpenses;
  debt: DebtExpenses;
  living: LivingExpenses;
  healthcare: HealthcareExpenses;
  childrenEducation: ChildrenEducationExpenses;
  savingsInvestment: SavingsInvestmentExpenses;
  miscellaneous: MiscellaneousExpenses;
}

export interface CategoryTotal {
  total: number;
  percentage: number; // of gross income
}

export interface BudgetResults {
  period: PeriodType;
  grossIncome: number;
  incomeTax: number;
  netIncome: number;

  housingTotal: CategoryTotal;
  transportationTotal: CategoryTotal;
  debtTotal: CategoryTotal;
  livingTotal: CategoryTotal;
  healthcareTotal: CategoryTotal;
  childrenEducationTotal: CategoryTotal;
  savingsInvestmentTotal: CategoryTotal;
  miscellaneousTotal: CategoryTotal;

  totalExpenses: number;
  totalExpensesPercentage: number;
  surplusDeficit: number;
  surplusDeficitPercentage: number;

  // Benchmarks
  housingBenchmark: {
    current: number;
    recommended: number;
    status: 'good' | 'warning' | 'high' | 'low';
  };
  transportationBenchmark: {
    current: number;
    recommended: number;
    status: 'good' | 'warning' | 'high' | 'low';
  };
  savingsBenchmark: {
    current: number;
    recommended: number;
    status: 'good' | 'warning' | 'high' | 'low';
  };
}

/**
 * Sum all values in an object
 */
function sumObjectValues(obj: object): number {
  return Object.values(obj).reduce(
    (sum, val) => sum + (typeof val === 'number' ? val : 0),
    0
  );
}

/**
 * Calculate category total and percentage
 */
function calculateCategoryTotal(
  categoryExpenses: object,
  grossIncome: number
): CategoryTotal {
  const total = sumObjectValues(categoryExpenses);
  const percentage = grossIncome > 0 ? (total / grossIncome) * 100 : 0;
  return { total, percentage };
}

/**
 * Determine benchmark status
 */
function getBenchmarkStatus(
  current: number,
  recommended: number,
  type: 'expense' | 'savings'
): 'good' | 'warning' | 'high' | 'low' {
  if (type === 'expense') {
    if (current <= recommended) return 'good';
    if (current <= recommended * 1.2) return 'warning';
    return 'high';
  } else {
    // savings
    if (current >= recommended) return 'good';
    if (current >= recommended * 0.8) return 'warning';
    return 'low';
  }
}

/**
 * Calculate budget breakdown and analysis
 */
export function calculateBudget(inputs: BudgetInputs): BudgetResults {
  const {
    period,
    income,
    housing,
    transportation,
    debt,
    living,
    healthcare,
    childrenEducation,
    savingsInvestment,
    miscellaneous,
  } = inputs;

  // Calculate gross income (sum of all income sources, excluding tax rate)
  const { incomeTaxRate, ...incomeWithoutTaxRate } = income;
  const grossIncome = sumObjectValues(incomeWithoutTaxRate);

  // Calculate income tax
  const incomeTax = grossIncome * (incomeTaxRate / 100);
  const netIncome = grossIncome - incomeTax;

  // Calculate category totals
  const housingTotal = calculateCategoryTotal(housing, grossIncome);
  const transportationTotal = calculateCategoryTotal(
    transportation,
    grossIncome
  );
  const debtTotal = calculateCategoryTotal(debt, grossIncome);
  const livingTotal = calculateCategoryTotal(living, grossIncome);
  const healthcareTotal = calculateCategoryTotal(healthcare, grossIncome);
  const childrenEducationTotal = calculateCategoryTotal(
    childrenEducation,
    grossIncome
  );
  const savingsInvestmentTotal = calculateCategoryTotal(
    savingsInvestment,
    grossIncome
  );
  const miscellaneousTotal = calculateCategoryTotal(miscellaneous, grossIncome);

  // Calculate total expenses
  const totalExpenses =
    housingTotal.total +
    transportationTotal.total +
    debtTotal.total +
    livingTotal.total +
    healthcareTotal.total +
    childrenEducationTotal.total +
    savingsInvestmentTotal.total +
    miscellaneousTotal.total;

  const totalExpensesPercentage =
    grossIncome > 0 ? (totalExpenses / grossIncome) * 100 : 0;

  // Calculate surplus/deficit
  const surplusDeficit = netIncome - totalExpenses;
  const surplusDeficitPercentage =
    grossIncome > 0 ? (surplusDeficit / grossIncome) * 100 : 0;

  // Benchmarks (based on gross income)
  const housingBenchmark = {
    current: housingTotal.percentage,
    recommended: 30, // 30% or less
    status: getBenchmarkStatus(housingTotal.percentage, 30, 'expense'),
  };

  const transportationBenchmark = {
    current: transportationTotal.percentage,
    recommended: 15, // 15% or less
    status: getBenchmarkStatus(transportationTotal.percentage, 15, 'expense'),
  };

  const savingsBenchmark = {
    current: savingsInvestmentTotal.percentage,
    recommended: 15, // 15% or more
    status: getBenchmarkStatus(
      savingsInvestmentTotal.percentage,
      15,
      'savings'
    ),
  };

  return {
    period,
    grossIncome,
    incomeTax,
    netIncome,
    housingTotal,
    transportationTotal,
    debtTotal,
    livingTotal,
    healthcareTotal,
    childrenEducationTotal,
    savingsInvestmentTotal,
    miscellaneousTotal,
    totalExpenses,
    totalExpensesPercentage,
    surplusDeficit,
    surplusDeficitPercentage,
    housingBenchmark,
    transportationBenchmark,
    savingsBenchmark,
  };
}

/**
 * Validate inputs
 */
export function validateInputs(inputs: BudgetInputs): string[] {
  const errors: string[] = [];

  // Validate income tax rate
  if (inputs.income.incomeTaxRate < 0) {
    errors.push('Income tax rate cannot be negative');
  }

  if (inputs.income.incomeTaxRate > 100) {
    errors.push('Income tax rate cannot exceed 100%');
  }

  // Check for negative values in income
  Object.entries(inputs.income).forEach(([key, value]) => {
    if (key !== 'incomeTaxRate' && value < 0) {
      errors.push(`Income field ${key} cannot be negative`);
    }
  });

  // Check for negative values in all expense categories
  const allExpenses = {
    ...inputs.housing,
    ...inputs.transportation,
    ...inputs.debt,
    ...inputs.living,
    ...inputs.healthcare,
    ...inputs.childrenEducation,
    ...inputs.savingsInvestment,
    ...inputs.miscellaneous,
  };

  Object.entries(allExpenses).forEach(([key, value]) => {
    if (value < 0) {
      errors.push(`Expense field ${key} cannot be negative`);
    }
  });

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
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
