import { describe, it, expect } from 'vitest';
import {
  calculateBudget,
  validateInputs,
  type BudgetInputs,
} from '../calculations';

const createBaseInputs = (): BudgetInputs => ({
  period: 'monthly',
  income: {
    salary: 5000,
    pension: 0,
    investments: 0,
    otherIncome: 0,
    incomeTaxRate: 25,
  },
  housing: {
    mortgage: 1200,
    propertyTax: 200,
    rental: 0,
    insurance: 100,
    hoaFee: 0,
    homeMaintenance: 100,
    utilities: 200,
  },
  transportation: {
    autoLoan: 300,
    autoInsurance: 150,
    gasoline: 200,
    autoMaintenance: 100,
    parkingTolls: 50,
    otherTransportation: 0,
  },
  debt: {
    creditCard: 100,
    studentLoan: 200,
    otherLoans: 0,
  },
  living: {
    food: 500,
    clothing: 100,
    householdSupplies: 100,
    mealsOut: 200,
    other: 100,
  },
  healthcare: {
    medicalInsurance: 200,
    medicalSpending: 100,
  },
  childrenEducation: {
    childPersonalCare: 0,
    tuitionSupplies: 0,
    childSupport: 0,
    otherEducation: 0,
  },
  savingsInvestment: {
    retirement401k: 500,
    collegeSaving: 0,
    investments: 0,
    emergencyFund: 200,
  },
  miscellaneous: {
    pet: 50,
    giftsDonations: 100,
    hobbiesSports: 100,
    entertainment: 100,
    travelVacation: 200,
    otherExpenses: 50,
  },
});

describe('Budget Calculator - Basic Calculations', () => {
  it('should calculate gross income correctly', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(5000);
    expect(result.period).toBe('monthly');
  });

  it('should calculate income tax correctly', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.incomeTax).toBe(1250); // 25% of 5000
    expect(result.netIncome).toBe(3750); // 5000 - 1250
  });

  it('should calculate with zero tax rate', () => {
    const inputs = createBaseInputs();
    inputs.income.incomeTaxRate = 0;
    const result = calculateBudget(inputs);

    expect(result.incomeTax).toBe(0);
    expect(result.netIncome).toBe(5000);
  });

  it('should calculate total expenses correctly', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    const housingTotal = 1200 + 200 + 0 + 100 + 0 + 100 + 200; // 1800
    const transportationTotal = 300 + 150 + 200 + 100 + 50 + 0; // 800
    const debtTotal = 100 + 200 + 0; // 300
    const livingTotal = 500 + 100 + 100 + 200 + 100; // 1000
    const healthcareTotal = 200 + 100; // 300
    const childrenEducationTotal = 0; // 0
    const savingsTotal = 500 + 0 + 0 + 200; // 700
    const miscTotal = 50 + 100 + 100 + 100 + 200 + 50; // 600

    const expectedTotal =
      housingTotal +
      transportationTotal +
      debtTotal +
      livingTotal +
      healthcareTotal +
      childrenEducationTotal +
      savingsTotal +
      miscTotal;

    expect(result.totalExpenses).toBe(expectedTotal);
  });

  it('should calculate surplus/deficit correctly', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    const expectedSurplus = result.netIncome - result.totalExpenses;
    expect(result.surplusDeficit).toBe(expectedSurplus);
  });
});

describe('Budget Calculator - Category Totals', () => {
  it('should calculate housing total and percentage', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.housingTotal.total).toBe(1800);
    expect(result.housingTotal.percentage).toBeCloseTo(36, 0); // 1800/5000 = 36%
  });

  it('should calculate transportation total and percentage', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.transportationTotal.total).toBe(800);
    expect(result.transportationTotal.percentage).toBeCloseTo(16, 0); // 800/5000 = 16%
  });

  it('should calculate savings total and percentage', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.savingsInvestmentTotal.total).toBe(700);
    expect(result.savingsInvestmentTotal.percentage).toBeCloseTo(14, 0); // 700/5000 = 14%
  });

  it('should handle zero expenses in a category', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.childrenEducationTotal.total).toBe(0);
    expect(result.childrenEducationTotal.percentage).toBe(0);
  });
});

describe('Budget Calculator - Annual Period', () => {
  it('should calculate annual budget correctly', () => {
    const inputs = createBaseInputs();
    inputs.period = 'annual';
    inputs.income.salary = 60000; // Annual salary

    const result = calculateBudget(inputs);

    expect(result.period).toBe('annual');
    expect(result.grossIncome).toBe(60000);
  });

  it('should calculate annual tax correctly', () => {
    const inputs = createBaseInputs();
    inputs.period = 'annual';
    inputs.income.salary = 60000;
    inputs.income.incomeTaxRate = 25;

    const result = calculateBudget(inputs);

    expect(result.incomeTax).toBe(15000); // 25% of 60000
    expect(result.netIncome).toBe(45000);
  });
});

describe('Budget Calculator - Multiple Income Sources', () => {
  it('should sum all income sources', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 5000;
    inputs.income.pension = 1000;
    inputs.income.investments = 500;
    inputs.income.otherIncome = 300;

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(6800);
  });

  it('should handle only pension income', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 0;
    inputs.income.pension = 3000;

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(3000);
  });

  it('should handle only investment income', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 0;
    inputs.income.investments = 2000;

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(2000);
  });
});

describe('Budget Calculator - Benchmarks', () => {
  it('should mark housing as good when at 30% or below', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    // Clear all other housing expenses first
    inputs.housing.mortgage = 0;
    inputs.housing.propertyTax = 0;
    inputs.housing.rental = 0;
    inputs.housing.insurance = 0;
    inputs.housing.hoaFee = 0;
    inputs.housing.homeMaintenance = 0;
    inputs.housing.utilities = 0;
    // Now set the ones we want
    inputs.housing.mortgage = 2000;
    inputs.housing.propertyTax = 500;
    inputs.housing.utilities = 500;
    // Total housing: 3000 = 30%

    const result = calculateBudget(inputs);

    expect(result.housingBenchmark.current).toBeCloseTo(30, 0);
    expect(result.housingBenchmark.recommended).toBe(30);
    expect(result.housingBenchmark.status).toBe('good');
  });

  it('should mark housing as warning when between 30-36%', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    // Clear all housing expenses first
    inputs.housing.mortgage = 0;
    inputs.housing.propertyTax = 0;
    inputs.housing.rental = 0;
    inputs.housing.insurance = 0;
    inputs.housing.hoaFee = 0;
    inputs.housing.homeMaintenance = 0;
    inputs.housing.utilities = 0;
    // Set housing to exactly 32%
    inputs.housing.mortgage = 3200;
    // Total housing: 3200 = 32%

    const result = calculateBudget(inputs);

    expect(result.housingBenchmark.current).toBeCloseTo(32, 0);
    expect(result.housingBenchmark.status).toBe('warning');
  });

  it('should mark housing as high when above 36%', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    inputs.housing.mortgage = 4000;
    // Total housing will be >36%

    const result = calculateBudget(inputs);

    expect(result.housingBenchmark.status).toBe('high');
  });

  it('should mark transportation as good when at 15% or below', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    // Clear all transportation expenses first
    inputs.transportation.autoLoan = 0;
    inputs.transportation.autoInsurance = 0;
    inputs.transportation.gasoline = 0;
    inputs.transportation.autoMaintenance = 0;
    inputs.transportation.parkingTolls = 0;
    inputs.transportation.otherTransportation = 0;
    // Set transportation to exactly 15%
    inputs.transportation.autoLoan = 1000;
    inputs.transportation.autoInsurance = 200;
    inputs.transportation.gasoline = 300;
    // Total transportation: 1500 = 15%

    const result = calculateBudget(inputs);

    expect(result.transportationBenchmark.current).toBeCloseTo(15, 0);
    expect(result.transportationBenchmark.status).toBe('good');
  });

  it('should mark savings as good when at 15% or above', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    inputs.savingsInvestment.retirement401k = 1000;
    inputs.savingsInvestment.emergencyFund = 500;
    // Total savings: 1500 = 15%

    const result = calculateBudget(inputs);

    expect(result.savingsBenchmark.current).toBeCloseTo(15, 0);
    expect(result.savingsBenchmark.status).toBe('good');
  });

  it('should mark savings as low when below 12%', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    inputs.savingsInvestment.retirement401k = 500;
    inputs.savingsInvestment.emergencyFund = 500;
    // Total savings: 1000 = 10%

    const result = calculateBudget(inputs);

    expect(result.savingsBenchmark.status).toBe('low');
  });
});

describe('Budget Calculator - Surplus/Deficit', () => {
  it('should calculate positive surplus', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    inputs.income.incomeTaxRate = 20;
    // Net income: 8000
    // Keep expenses low
    inputs.housing.mortgage = 1000;

    const result = calculateBudget(inputs);

    expect(result.surplusDeficit).toBeGreaterThan(0);
    expect(result.surplusDeficitPercentage).toBeGreaterThan(0);
  });

  it('should calculate deficit when expenses exceed income', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 3000;
    inputs.income.incomeTaxRate = 25;
    // Net income: 2250
    // High expenses
    inputs.housing.mortgage = 2000;

    const result = calculateBudget(inputs);

    expect(result.surplusDeficit).toBeLessThan(0);
    expect(result.surplusDeficitPercentage).toBeLessThan(0);
  });

  it('should calculate zero surplus/deficit when balanced', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 5000;
    inputs.income.incomeTaxRate = 0;

    // Set expenses to exactly match income
    inputs.housing.mortgage = 2000;
    inputs.transportation.autoLoan = 1000;
    inputs.living.food = 1000;
    inputs.savingsInvestment.retirement401k = 1000;
    // Clear all other expenses
    inputs.housing.propertyTax = 0;
    inputs.housing.insurance = 0;
    inputs.housing.homeMaintenance = 0;
    inputs.housing.utilities = 0;
    inputs.transportation.autoInsurance = 0;
    inputs.transportation.gasoline = 0;
    inputs.transportation.autoMaintenance = 0;
    inputs.transportation.parkingTolls = 0;
    inputs.debt.creditCard = 0;
    inputs.debt.studentLoan = 0;
    inputs.living.clothing = 0;
    inputs.living.householdSupplies = 0;
    inputs.living.mealsOut = 0;
    inputs.living.other = 0;
    inputs.healthcare.medicalInsurance = 0;
    inputs.healthcare.medicalSpending = 0;
    inputs.savingsInvestment.emergencyFund = 0;
    inputs.miscellaneous.pet = 0;
    inputs.miscellaneous.giftsDonations = 0;
    inputs.miscellaneous.hobbiesSports = 0;
    inputs.miscellaneous.entertainment = 0;
    inputs.miscellaneous.travelVacation = 0;
    inputs.miscellaneous.otherExpenses = 0;

    const result = calculateBudget(inputs);

    expect(result.surplusDeficit).toBeCloseTo(0, 2);
  });
});

describe('Budget Calculator - Edge Cases', () => {
  it('should handle zero income', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 0;
    inputs.income.pension = 0;

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(0);
    expect(result.netIncome).toBe(0);
    expect(result.surplusDeficit).toBeLessThan(0);
  });

  it('should handle all zero expenses', () => {
    const inputs = createBaseInputs();
    // Zero out all expenses
    Object.keys(inputs.housing).forEach((key) => {
      inputs.housing[key as keyof typeof inputs.housing] = 0;
    });
    Object.keys(inputs.transportation).forEach((key) => {
      inputs.transportation[key as keyof typeof inputs.transportation] = 0;
    });
    Object.keys(inputs.debt).forEach((key) => {
      inputs.debt[key as keyof typeof inputs.debt] = 0;
    });
    Object.keys(inputs.living).forEach((key) => {
      inputs.living[key as keyof typeof inputs.living] = 0;
    });
    Object.keys(inputs.healthcare).forEach((key) => {
      inputs.healthcare[key as keyof typeof inputs.healthcare] = 0;
    });
    Object.keys(inputs.savingsInvestment).forEach((key) => {
      inputs.savingsInvestment[key as keyof typeof inputs.savingsInvestment] =
        0;
    });
    Object.keys(inputs.miscellaneous).forEach((key) => {
      inputs.miscellaneous[key as keyof typeof inputs.miscellaneous] = 0;
    });

    const result = calculateBudget(inputs);

    expect(result.totalExpenses).toBe(0);
    expect(result.surplusDeficit).toBe(result.netIncome);
  });

  it('should handle very high tax rate', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    inputs.income.incomeTaxRate = 50;

    const result = calculateBudget(inputs);

    expect(result.incomeTax).toBe(5000);
    expect(result.netIncome).toBe(5000);
  });

  it('should handle very large income', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 1000000;

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(1000000);
    expect(result.housingTotal.percentage).toBeLessThan(1); // Housing will be tiny percentage
  });

  it('should handle very large expenses', () => {
    const inputs = createBaseInputs();
    inputs.housing.mortgage = 50000;

    const result = calculateBudget(inputs);

    expect(result.housingTotal.percentage).toBeGreaterThan(100);
    expect(result.surplusDeficit).toBeLessThan(0);
  });
});

describe('Budget Calculator - Validation', () => {
  it('should return empty array for valid inputs', () => {
    const inputs = createBaseInputs();
    const errors = validateInputs(inputs);

    expect(errors).toHaveLength(0);
  });

  it('should detect negative income tax rate', () => {
    const inputs = createBaseInputs();
    inputs.income.incomeTaxRate = -5;

    const errors = validateInputs(inputs);

    expect(errors).toContain('Income tax rate cannot be negative');
  });

  it('should detect tax rate over 100%', () => {
    const inputs = createBaseInputs();
    inputs.income.incomeTaxRate = 105;

    const errors = validateInputs(inputs);

    expect(errors).toContain('Income tax rate cannot exceed 100%');
  });

  it('should detect negative income values', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = -1000;

    const errors = validateInputs(inputs);

    expect(errors.some((e) => e.includes('cannot be negative'))).toBe(true);
  });

  it('should detect negative expense values', () => {
    const inputs = createBaseInputs();
    inputs.housing.mortgage = -500;

    const errors = validateInputs(inputs);

    expect(errors.some((e) => e.includes('cannot be negative'))).toBe(true);
  });

  it('should return multiple errors for multiple issues', () => {
    const inputs = createBaseInputs();
    inputs.income.incomeTaxRate = -5;
    inputs.income.salary = -1000;
    inputs.housing.mortgage = -500;

    const errors = validateInputs(inputs);

    expect(errors.length).toBeGreaterThan(1);
  });
});

describe('Budget Calculator - Real-world Scenarios', () => {
  it('should calculate budget for single person with moderate income', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 4000;
    inputs.income.incomeTaxRate = 22;
    inputs.housing.rental = 1200;
    inputs.housing.utilities = 150;
    inputs.transportation.autoLoan = 300;
    inputs.transportation.gasoline = 150;
    inputs.living.food = 400;
    inputs.savingsInvestment.retirement401k = 400;

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(4000);
    expect(result.netIncome).toBeCloseTo(3120, 0);
    expect(result.totalExpenses).toBeGreaterThan(0);
  });

  it('should calculate budget for family with children', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 8000;
    inputs.income.incomeTaxRate = 24;
    inputs.housing.mortgage = 2000;
    inputs.housing.utilities = 300;
    inputs.childrenEducation.childPersonalCare = 500;
    inputs.childrenEducation.tuitionSupplies = 400;
    inputs.living.food = 1000;
    inputs.healthcare.medicalInsurance = 500;

    const result = calculateBudget(inputs);

    expect(result.childrenEducationTotal.total).toBe(900);
    expect(result.housingTotal.percentage).toBeGreaterThan(0);
  });

  it('should calculate budget for retiree', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 0;
    inputs.income.pension = 3000;
    inputs.income.investments = 1000;
    inputs.income.incomeTaxRate = 15;
    inputs.housing.mortgage = 0; // Paid off
    inputs.housing.propertyTax = 300;
    inputs.transportation.autoLoan = 0; // Paid off

    const result = calculateBudget(inputs);

    expect(result.grossIncome).toBe(4000);
    expect(result.debtTotal.total).toBeGreaterThan(0); // Still has some debt
  });

  it('should calculate budget for high earner', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 15000;
    inputs.income.incomeTaxRate = 35;
    // Net income: 15000 * 0.65 = 9750

    // Clear all expenses and set only what we want
    inputs.housing.mortgage = 3500;
    inputs.housing.propertyTax = 0;
    inputs.housing.rental = 0;
    inputs.housing.insurance = 0;
    inputs.housing.hoaFee = 0;
    inputs.housing.homeMaintenance = 0;
    inputs.housing.utilities = 200;

    inputs.transportation.autoLoan = 0;
    inputs.transportation.autoInsurance = 0;
    inputs.transportation.gasoline = 0;
    inputs.transportation.autoMaintenance = 0;
    inputs.transportation.parkingTolls = 0;
    inputs.transportation.otherTransportation = 0;

    inputs.debt.creditCard = 0;
    inputs.debt.studentLoan = 0;
    inputs.debt.otherLoans = 0;

    inputs.living.food = 800;
    inputs.living.clothing = 200;
    inputs.living.householdSupplies = 0;
    inputs.living.mealsOut = 300;
    inputs.living.other = 0;

    inputs.healthcare.medicalInsurance = 0;
    inputs.healthcare.medicalSpending = 0;

    inputs.savingsInvestment.retirement401k = 1500;
    inputs.savingsInvestment.collegeSaving = 0;
    inputs.savingsInvestment.investments = 1000;
    inputs.savingsInvestment.emergencyFund = 0;

    inputs.miscellaneous.pet = 0;
    inputs.miscellaneous.giftsDonations = 0;
    inputs.miscellaneous.hobbiesSports = 0;
    inputs.miscellaneous.entertainment = 0;
    inputs.miscellaneous.travelVacation = 800;
    inputs.miscellaneous.otherExpenses = 0;

    // Total expenses: 3500 + 200 + 800 + 200 + 300 + 1500 + 1000 + 800 = 8300
    // Surplus: 9750 - 8300 = 1450

    const result = calculateBudget(inputs);

    expect(result.savingsBenchmark.status).toBe('good'); // (1500+1000)/15000 = 16.67%
    expect(result.surplusDeficit).toBeGreaterThan(0);
  });
});

describe('Budget Calculator - Percentage Calculations', () => {
  it('should calculate expense percentages correctly', () => {
    const inputs = createBaseInputs();
    inputs.income.salary = 10000;
    // Clear all housing expenses first
    inputs.housing.mortgage = 0;
    inputs.housing.propertyTax = 0;
    inputs.housing.rental = 0;
    inputs.housing.insurance = 0;
    inputs.housing.hoaFee = 0;
    inputs.housing.homeMaintenance = 0;
    inputs.housing.utilities = 0;
    // Set housing to exactly 30%
    inputs.housing.mortgage = 3000;

    const result = calculateBudget(inputs);

    expect(result.housingTotal.percentage).toBeCloseTo(30, 0);
  });

  it('should calculate total expense percentage', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    expect(result.totalExpensesPercentage).toBeGreaterThan(0);
    expect(result.totalExpensesPercentage).toBeLessThan(200); // Sanity check
  });

  it('should calculate surplus/deficit percentage', () => {
    const inputs = createBaseInputs();
    const result = calculateBudget(inputs);

    const expectedPercentage =
      (result.surplusDeficit / result.grossIncome) * 100;
    expect(result.surplusDeficitPercentage).toBeCloseTo(expectedPercentage, 1);
  });
});
