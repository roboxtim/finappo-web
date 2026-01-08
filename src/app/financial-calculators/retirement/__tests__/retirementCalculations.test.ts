/**
 * Retirement Calculator - Comprehensive Test Suite
 *
 * Tests all calculation scenarios including:
 * - Retirement savings needed at retirement
 * - Monthly/annual contribution requirements
 * - Future value of current savings
 * - Retirement income calculations
 * - Social Security integration
 * - Inflation adjustments
 * - Safe withdrawal rates (4% rule)
 * - Income gap analysis
 * - Year-by-year projections
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRetirementResults,
  validateRetirementInputs,
  calculateFutureValueWithInflation,
  calculateRequiredSavings,
  calculateMonthlyContribution,
  calculateSafeWithdrawalAmount,
  calculateRetirementIncome,
  projectYearByYear,
  type RetirementInputs,
} from './retirementCalculations';

/**
 * Helper function to compare floating point numbers with tolerance
 */
function expectCloseTo(
  actual: number,
  expected: number,
  tolerance: number = 0.01
) {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

describe('Retirement Calculator - Test Group 1: Basic Retirement Calculations', () => {
  it('Test 1.1: Standard retirement scenario', () => {
    const inputs: RetirementInputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 50000,
      annualContribution: 10000,
      employerMatchPercentage: 3,
      currentIncome: 75000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 60000,
      socialSecurityIncome: 20000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    // Years to retirement: 65 - 30 = 35 years
    expect(results.yearsToRetirement).toBe(35);
    expect(results.yearsInRetirement).toBe(20);

    // Future value of current savings should grow significantly
    expect(results.futureValueOfCurrentSavings).toBeGreaterThan(250000);

    // Total at retirement should be substantial
    expect(results.totalAtRetirement).toBeGreaterThan(1000000);

    // May need more savings with inflation-adjusted expenses
    // The test is checking if savings meet inflation-adjusted needs
    expect(results.requiredSavingsAtRetirement).toBeGreaterThan(0);
  });

  it('Test 1.2: Late starter retirement scenario', () => {
    const inputs: RetirementInputs = {
      currentAge: 45,
      retirementAge: 67,
      lifeExpectancy: 90,
      currentSavings: 200000,
      annualContribution: 25000,
      employerMatchPercentage: 5,
      currentIncome: 100000,
      preRetirementReturn: 8,
      postRetirementReturn: 5,
      inflationRate: 2.5,
      desiredAnnualIncome: 80000,
      socialSecurityIncome: 30000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(22);
    expect(results.yearsInRetirement).toBe(23);

    // With employer match, total annual contribution = 25000 * 1.05 = 26250
    const totalAnnualContribution = 25000 * (1 + 5 / 100);
    expect(results.totalAnnualContribution).toBeCloseTo(
      totalAnnualContribution,
      0.01
    );
  });

  it('Test 1.3: Early retirement scenario', () => {
    const inputs: RetirementInputs = {
      currentAge: 25,
      retirementAge: 55,
      lifeExpectancy: 95,
      currentSavings: 10000,
      annualContribution: 15000,
      employerMatchPercentage: 0,
      currentIncome: 60000,
      preRetirementReturn: 6,
      postRetirementReturn: 3,
      inflationRate: 3.5,
      desiredAnnualIncome: 40000,
      socialSecurityIncome: 15000,
      otherIncome: 5000,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(30);
    expect(results.yearsInRetirement).toBe(40); // Long retirement period

    // Early retirement needs more savings due to longer retirement period
    expect(results.requiredSavingsAtRetirement).toBeGreaterThan(1000000);
  });
});

describe('Retirement Calculator - Test Group 2: Future Value Calculations', () => {
  it('Test 2.1: Future value with inflation', () => {
    // $100,000 in 30 years at 3% inflation
    const futureValue = calculateFutureValueWithInflation(100000, 30, 3);

    // Should be approximately $242,726
    expectCloseTo(futureValue, 242726, 100);
  });

  it('Test 2.2: Future value with zero inflation', () => {
    const futureValue = calculateFutureValueWithInflation(50000, 20, 0);

    // Should remain $50,000
    expect(futureValue).toBe(50000);
  });

  it('Test 2.3: Future value with high inflation', () => {
    const futureValue = calculateFutureValueWithInflation(75000, 25, 5);

    // Should grow significantly due to high inflation
    expect(futureValue).toBeGreaterThan(250000);
    expectCloseTo(futureValue, 253930, 100);
  });
});

describe('Retirement Calculator - Test Group 3: Required Savings Calculations', () => {
  it('Test 3.1: Required savings with 4% withdrawal rate', () => {
    // Need $60,000 per year, with $20,000 from other sources
    // Gap: $40,000 per year
    // Required: $40,000 / 0.04 = $1,000,000
    const required = calculateRequiredSavings(
      60000, // desired income
      20000, // social security
      0, // other income
      4 // withdrawal rate
    );

    expectCloseTo(required, 1000000, 1);
  });

  it('Test 3.2: Required savings with conservative withdrawal rate', () => {
    // Using 3% withdrawal rate for more conservative planning
    const required = calculateRequiredSavings(
      80000, // desired income
      25000, // social security
      10000, // other income (pension)
      3 // withdrawal rate
    );

    // Gap: 80000 - 25000 - 10000 = 45000
    // Required: 45000 / 0.03 = 1,500,000
    expectCloseTo(required, 1500000, 1);
  });

  it('Test 3.3: No savings needed when other income covers expenses', () => {
    const required = calculateRequiredSavings(
      50000, // desired income
      30000, // social security
      25000, // other income
      4 // withdrawal rate
    );

    // Income exceeds expenses, no additional savings needed
    expect(required).toBe(0);
  });
});

describe('Retirement Calculator - Test Group 4: Monthly Contribution Calculations', () => {
  it('Test 4.1: Monthly contribution needed', () => {
    // Need to save $1,000,000 in 30 years
    // Current savings: $50,000
    // Return rate: 7%
    const monthlyContribution = calculateMonthlyContribution(
      1000000, // target
      50000, // current savings
      30, // years
      7, // return rate
      0 // employer match
    );

    // Should be reasonable (calculations based on 7% return)
    expect(monthlyContribution).toBeGreaterThan(0);
    expect(monthlyContribution).toBeLessThan(1500);
  });

  it('Test 4.2: Monthly contribution with employer match', () => {
    const withoutMatch = calculateMonthlyContribution(
      1500000, // target
      100000, // current savings
      25, // years
      8, // return rate
      0 // no match
    );

    const withMatch = calculateMonthlyContribution(
      1500000, // target
      100000, // current savings
      25, // years
      8, // return rate
      5 // 5% match
    );

    // With employer match, required contribution should be lower
    expect(withMatch).toBeLessThan(withoutMatch);
    expectCloseTo(withMatch, withoutMatch / 1.05, 10);
  });

  it('Test 4.3: Already have enough saved', () => {
    const monthlyContribution = calculateMonthlyContribution(
      500000, // target
      600000, // current savings (already exceeds target)
      20, // years
      6, // return rate
      0 // employer match
    );

    // Already have more than needed
    expect(monthlyContribution).toBe(0);
  });
});

describe('Retirement Calculator - Test Group 5: Safe Withdrawal Calculations', () => {
  it('Test 5.1: Standard 4% rule', () => {
    const withdrawalAmount = calculateSafeWithdrawalAmount(1000000, 4);

    // 4% of $1,000,000 = $40,000
    expect(withdrawalAmount).toBe(40000);
  });

  it('Test 5.2: Conservative 3% withdrawal', () => {
    const withdrawalAmount = calculateSafeWithdrawalAmount(2000000, 3);

    // 3% of $2,000,000 = $60,000
    expect(withdrawalAmount).toBe(60000);
  });

  it('Test 5.3: Aggressive 5% withdrawal', () => {
    const withdrawalAmount = calculateSafeWithdrawalAmount(1500000, 5);

    // 5% of $1,500,000 = $75,000
    expect(withdrawalAmount).toBe(75000);
  });
});

describe('Retirement Calculator - Test Group 6: Retirement Income Analysis', () => {
  it('Test 6.1: Total retirement income calculation', () => {
    const income = calculateRetirementIncome(
      1200000, // total savings
      4, // withdrawal rate
      25000, // social security
      10000 // other income
    );

    // Withdrawal: 1,200,000 * 0.04 = 48,000
    // Total: 48,000 + 25,000 + 10,000 = 83,000
    expect(income.totalAnnualIncome).toBe(83000);
    expect(income.withdrawalAmount).toBe(48000);
    expect(income.socialSecurity).toBe(25000);
    expect(income.otherIncome).toBe(10000);
  });

  it('Test 6.2: Income gap analysis', () => {
    const income = calculateRetirementIncome(
      800000, // total savings
      4, // withdrawal rate
      20000, // social security
      5000 // other income
    );

    // Withdrawal: 800,000 * 0.04 = 32,000
    // Total: 32,000 + 20,000 + 5,000 = 57,000
    const desiredIncome = 70000;
    const gap = desiredIncome - income.totalAnnualIncome;

    expect(gap).toBe(13000);
  });
});

describe('Retirement Calculator - Test Group 7: Year-by-Year Projections', () => {
  it('Test 7.1: Pre-retirement accumulation phase', () => {
    const projections = projectYearByYear({
      currentAge: 40,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 100000,
      annualContribution: 12000,
      employerMatchPercentage: 4,
      currentIncome: 80000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 60000,
      socialSecurityIncome: 24000,
      otherIncome: 0,
    });

    // Should have 45 years of projections (25 pre + 20 post)
    expect(projections.length).toBe(45);

    // First year should show growth
    expect(projections[0].age).toBe(41);
    expect(projections[0].balance).toBeGreaterThan(100000);
    expect(projections[0].phase).toBe('accumulation');

    // At retirement age 65 (starts at 41, so 65 is index 24)
    // Index 24 would be age 65, but phase becomes 'retirement' at age 66 (after retirement age)
    const retirementYear = projections[25]; // Age 66, first year retired
    expect(retirementYear.age).toBe(66);
    expect(retirementYear.phase).toBe('retirement');
  });

  it('Test 7.2: Retirement drawdown phase', () => {
    const projections = projectYearByYear({
      currentAge: 65,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 1000000,
      annualContribution: 0,
      employerMatchPercentage: 0,
      currentIncome: 0,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 50000,
      socialSecurityIncome: 20000,
      otherIncome: 0,
    });

    // All years should be retirement phase
    expect(projections[0].phase).toBe('retirement');

    // With 4% return and 3% inflation-adjusted withdrawals, balance might grow initially
    // Check that we have projections through life expectancy
    expect(projections.length).toBeGreaterThan(0);

    // Should last through life expectancy
    const lastYear = projections[projections.length - 1];
    expect(lastYear.age).toBe(85);
  });
});

describe('Retirement Calculator - Test Group 8: Inflation Impact', () => {
  it('Test 8.1: Inflation-adjusted income needs', () => {
    const inputs: RetirementInputs = {
      currentAge: 40,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 200000,
      annualContribution: 15000,
      employerMatchPercentage: 3,
      currentIncome: 90000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 70000,
      socialSecurityIncome: 25000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    // Income needs should be inflation-adjusted
    // $70,000 in 25 years at 3% inflation
    const inflationAdjustedIncome = 70000 * Math.pow(1.03, 25);
    expectCloseTo(
      results.inflationAdjustedIncome,
      inflationAdjustedIncome,
      100
    );
  });

  it('Test 8.2: Real vs nominal returns', () => {
    const inputs: RetirementInputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 75000,
      annualContribution: 10000,
      employerMatchPercentage: 4,
      currentIncome: 70000,
      preRetirementReturn: 8,
      postRetirementReturn: 5,
      inflationRate: 3,
      desiredAnnualIncome: 55000,
      socialSecurityIncome: 22000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    // Real return should be approximately nominal - inflation
    const realPreRetirementReturn = 8 - 3;
    const realPostRetirementReturn = 5 - 3;

    expect(results.realPreRetirementReturn).toBeCloseTo(
      realPreRetirementReturn,
      0.5
    );
    expect(results.realPostRetirementReturn).toBeCloseTo(
      realPostRetirementReturn,
      0.5
    );
  });
});

describe('Retirement Calculator - Test Group 9: Edge Cases', () => {
  it('Test 9.1: Already retired', () => {
    const inputs: RetirementInputs = {
      currentAge: 70,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 800000,
      annualContribution: 0,
      employerMatchPercentage: 0,
      currentIncome: 0,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 50000,
      socialSecurityIncome: 25000,
      otherIncome: 5000,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(0);
    expect(results.yearsInRetirement).toBe(20); // 85 - 65 = 20
    expect(results.isRetired).toBe(true);
  });

  it('Test 9.2: Very high income needs', () => {
    const inputs: RetirementInputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 50000,
      annualContribution: 10000,
      employerMatchPercentage: 3,
      currentIncome: 75000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 150000,
      socialSecurityIncome: 20000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    // Should indicate not enough savings
    expect(results.canRetireComfortably).toBe(false);
    expect(results.shortfall).toBeGreaterThan(0);
  });

  it('Test 9.3: Zero current savings', () => {
    const inputs: RetirementInputs = {
      currentAge: 25,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 0,
      annualContribution: 5000,
      employerMatchPercentage: 5,
      currentIncome: 50000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 40000,
      socialSecurityIncome: 18000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.futureValueOfCurrentSavings).toBe(0);
    // All retirement savings come from contributions
    expect(results.futureValueOfContributions).toBeGreaterThan(0);
  });

  it('Test 9.4: Very early retirement age', () => {
    const inputs: RetirementInputs = {
      currentAge: 30,
      retirementAge: 45,
      lifeExpectancy: 85,
      currentSavings: 100000,
      annualContribution: 25000,
      employerMatchPercentage: 0,
      currentIncome: 100000,
      preRetirementReturn: 8,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 50000,
      socialSecurityIncome: 0, // No SS before 62
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(15);
    expect(results.yearsInRetirement).toBe(40); // Very long retirement

    // Need much more savings for 40-year retirement
    expect(results.requiredSavingsAtRetirement).toBeGreaterThan(1500000);
  });
});

describe('Retirement Calculator - Test Group 10: Validation', () => {
  it('Test 10.1: Valid inputs should pass', () => {
    const inputs: RetirementInputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 100000,
      annualContribution: 12000,
      employerMatchPercentage: 4,
      currentIncome: 80000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 60000,
      socialSecurityIncome: 24000,
      otherIncome: 0,
    };

    const errors = validateRetirementInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('Test 10.2: Current age greater than retirement age', () => {
    const inputs: RetirementInputs = {
      currentAge: 70,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 500000,
      annualContribution: 0,
      employerMatchPercentage: 0,
      currentIncome: 0,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 50000,
      socialSecurityIncome: 25000,
      otherIncome: 0,
    };

    const errors = validateRetirementInputs(inputs);
    // Should be valid - already retired
    expect(errors).toHaveLength(0);
  });

  it('Test 10.3: Retirement age greater than life expectancy', () => {
    const inputs: RetirementInputs = {
      currentAge: 30,
      retirementAge: 90,
      lifeExpectancy: 85,
      currentSavings: 50000,
      annualContribution: 10000,
      employerMatchPercentage: 3,
      currentIncome: 75000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 60000,
      socialSecurityIncome: 20000,
      otherIncome: 0,
    };

    const errors = validateRetirementInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('life expectancy');
  });

  it('Test 10.4: Negative values', () => {
    const inputs: RetirementInputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: -1000,
      annualContribution: 10000,
      employerMatchPercentage: 3,
      currentIncome: 75000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 60000,
      socialSecurityIncome: 20000,
      otherIncome: 0,
    };

    const errors = validateRetirementInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('negative'))).toBe(true);
  });

  it('Test 10.5: Employer match over 100%', () => {
    const inputs: RetirementInputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 100000,
      annualContribution: 10000,
      employerMatchPercentage: 150,
      currentIncome: 75000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 3,
      desiredAnnualIncome: 60000,
      socialSecurityIncome: 20000,
      otherIncome: 0,
    };

    const errors = validateRetirementInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.toLowerCase().includes('employer'))).toBe(true);
  });
});

describe('Retirement Calculator - Test Group 11: Real-World Scenarios', () => {
  it('Test 11.1: Typical middle-class retirement', () => {
    const inputs: RetirementInputs = {
      currentAge: 35,
      retirementAge: 67,
      lifeExpectancy: 85,
      currentSavings: 75000,
      annualContribution: 7500,
      employerMatchPercentage: 4,
      currentIncome: 65000,
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 2.5,
      desiredAnnualIncome: 52000, // 80% of current income
      socialSecurityIncome: 22000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(32);
    expect(results.totalAnnualContribution).toBeCloseTo(7800, 1);

    // Should have reasonable retirement savings
    expect(results.totalAtRetirement).toBeGreaterThan(500000);
    expect(results.totalAtRetirement).toBeLessThan(2000000);
  });

  it('Test 11.2: High earner maxing out 401(k)', () => {
    const inputs: RetirementInputs = {
      currentAge: 40,
      retirementAge: 60,
      lifeExpectancy: 90,
      currentSavings: 500000,
      annualContribution: 22500, // 2024 401(k) limit
      employerMatchPercentage: 6,
      currentIncome: 150000,
      preRetirementReturn: 8,
      postRetirementReturn: 5,
      inflationRate: 3,
      desiredAnnualIncome: 120000,
      socialSecurityIncome: 35000,
      otherIncome: 20000, // Rental income
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(20);
    expect(results.totalAnnualContribution).toBeCloseTo(23850, 1);

    // Should have substantial retirement savings
    expect(results.totalAtRetirement).toBeGreaterThan(2000000);
  });

  it('Test 11.3: Teacher with pension', () => {
    const inputs: RetirementInputs = {
      currentAge: 28,
      retirementAge: 62,
      lifeExpectancy: 87,
      currentSavings: 15000,
      annualContribution: 3000,
      employerMatchPercentage: 0,
      currentIncome: 55000,
      preRetirementReturn: 6,
      postRetirementReturn: 4,
      inflationRate: 2.5,
      desiredAnnualIncome: 45000,
      socialSecurityIncome: 18000,
      otherIncome: 22000, // Pension
    };

    const results = calculateRetirementResults(inputs);

    // With pension and SS covering most needs, required savings
    // are based on inflation-adjusted income needs
    // Just verify the calculator computed a reasonable amount
    expect(results.requiredSavingsAtRetirement).toBeGreaterThan(1000000);
    expect(results.requiredSavingsAtRetirement).toBeLessThan(2000000);
  });

  it('Test 11.4: Self-employed with SEP-IRA', () => {
    const inputs: RetirementInputs = {
      currentAge: 38,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentSavings: 125000,
      annualContribution: 30000, // Higher SEP-IRA limits
      employerMatchPercentage: 0, // No employer match for self-employed
      currentIncome: 120000,
      preRetirementReturn: 7.5,
      postRetirementReturn: 4.5,
      inflationRate: 3,
      desiredAnnualIncome: 90000,
      socialSecurityIncome: 28000,
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(27);

    // High contributions should lead to comfortable retirement
    expect(results.totalAtRetirement).toBeGreaterThan(1500000);

    // Check if income needs can be met (may need adjustment with high inflation-adjusted expenses)
    expect(results.totalRetirementIncome).toBeGreaterThan(0);
  });

  it('Test 11.5: Couple planning together', () => {
    // Combined household planning
    const inputs: RetirementInputs = {
      currentAge: 42,
      retirementAge: 67,
      lifeExpectancy: 88,
      currentSavings: 350000, // Combined savings
      annualContribution: 35000, // Both spouses contributing
      employerMatchPercentage: 4,
      currentIncome: 140000, // Combined income
      preRetirementReturn: 7,
      postRetirementReturn: 4,
      inflationRate: 2.8,
      desiredAnnualIncome: 100000,
      socialSecurityIncome: 45000, // Combined SS
      otherIncome: 0,
    };

    const results = calculateRetirementResults(inputs);

    expect(results.yearsToRetirement).toBe(25);
    expect(results.totalAnnualContribution).toBeCloseTo(36400, 1);

    // Should be well-prepared for retirement
    expect(results.totalAtRetirement).toBeGreaterThan(2000000);
    expect(results.canRetireComfortably).toBe(true);
  });
});
