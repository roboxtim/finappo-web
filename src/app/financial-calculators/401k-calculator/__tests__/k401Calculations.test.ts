/**
 * 401(k) Calculator - Comprehensive Test Suite
 *
 * Tests all calculation scenarios based on reference: https://www.calculator.net/401k-calculator.html
 *
 * Test cases include:
 * - Basic 401(k) projections with compound growth
 * - Employee and employer contributions
 * - Two-tier employer matching
 * - IRS contribution limits
 * - Salary increases over time
 * - Inflation adjustments
 * - Safe withdrawal calculations
 * - Edge cases and validation
 */

import { describe, it, expect } from 'vitest';
import {
  calculate401kResults,
  validate401kInputs,
  calculateEmployeeContribution,
  calculateEmployerMatch,
  getEmployeeContributionLimit,
  calculateFutureValue,
  calculatePresentValue,
  calculateSafeWithdrawal,
  IRS_LIMITS_2026,
  type K401Inputs,
} from './k401Calculations';

/**
 * Helper function to compare floating point numbers with tolerance
 */
function expectCloseTo(
  actual: number,
  expected: number,
  tolerance: number = 1
) {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

describe('401(k) Calculator - Test Group 1: Basic 401(k) Calculations', () => {
  it('Test 1.1: Standard 401(k) scenario - 30 year old starting fresh', () => {
    const inputs: K401Inputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 75000,
      current401kBalance: 10000,
      employeeContributionPercent: 10, // 10% of salary = $7,500
      employerMatch1Percent: 100, // 100% match
      employerMatch1Limit: 5, // Up to 5% of salary
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    // Years to retirement: 65 - 30 = 35 years
    expect(results.yearsToRetirement).toBe(35);
    expect(results.yearsInRetirement).toBe(20);

    // First year contributions
    // Employee: 10% of $75,000 = $7,500
    expect(results.firstYearEmployeeContribution).toBe(7500);

    // Employer: 100% match on first 5% = 5% of $75,000 = $3,750
    expect(results.firstYearEmployerContribution).toBe(3750);

    // Total should grow substantially over 35 years
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(1000000);

    // Employer contributions should be significant
    expect(results.totalEmployerContributions).toBeGreaterThan(100000);
  });

  it('Test 1.2: Mid-career with existing balance', () => {
    const inputs: K401Inputs = {
      currentAge: 45,
      retirementAge: 67,
      lifeExpectancy: 90,
      currentAnnualSalary: 100000,
      current401kBalance: 250000,
      employeeContributionPercent: 15, // 15% of salary
      employerMatch1Percent: 50, // 50% match
      employerMatch1Limit: 6, // Up to 6% of salary
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 2,
      expectedAnnualReturn: 7,
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(22);

    // First year employee contribution: 15% of $100,000 = $15,000
    expect(results.firstYearEmployeeContribution).toBe(15000);

    // Employer: 50% match on 6% = 3% of $100,000 = $3,000
    expect(results.firstYearEmployerContribution).toBe(3000);

    // Starting balance should grow
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(250000);

    // Verify year-by-year projections exist
    expect(results.yearByYearProjection.length).toBe(22);
  });

  it('Test 1.3: High earner hitting contribution limits', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 200000,
      current401kBalance: 100000,
      employeeContributionPercent: 20, // 20% of $200k = $40k (exceeds limit)
      employerMatch1Percent: 100,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 4,
      expectedAnnualReturn: 8,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    // First year employee contribution should be capped at IRS limit
    expect(results.firstYearEmployeeContribution).toBe(
      IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50
    );

    // Employer match on 6% of $200k = $12,000
    expect(results.firstYearEmployerContribution).toBe(12000);

    // Check that limit was hit
    const firstYearLimit = results.contributionLimitsInfo[0];
    expect(firstYearLimit.hitLimit).toBe(true);
  });
});

describe('401(k) Calculator - Test Group 2: Employer Matching Calculations', () => {
  it('Test 2.1: Simple 100% match on first 5%', () => {
    const salary = 80000;
    const employeeContribution = 4000; // 5% of salary

    const match = calculateEmployerMatch(
      salary,
      employeeContribution,
      100, // 100% match
      5, // up to 5%
      0,
      0
    );

    // 100% match on 5% = 5% of $80,000 = $4,000
    expect(match).toBe(4000);
  });

  it('Test 2.2: Employee contributes less than match limit', () => {
    const salary = 100000;
    const employeeContribution = 3000; // 3% of salary

    const match = calculateEmployerMatch(
      salary,
      employeeContribution,
      100, // 100% match
      6, // up to 6% (but employee only contributes 3%)
      0,
      0
    );

    // 100% match on 3% = $3,000
    expect(match).toBe(3000);
  });

  it('Test 2.3: Two-tier matching - 100% on first 3%, then 50% on next 2%', () => {
    const salary = 100000;
    const employeeContribution = 5000; // 5% of salary

    const match = calculateEmployerMatch(
      salary,
      employeeContribution,
      100, // Tier 1: 100% match
      3, // up to 3%
      50, // Tier 2: 50% match
      5 // up to 5% total (so tier 2 covers 3-5%)
    );

    // Tier 1: 100% match on 3% = $3,000
    // Tier 2: 50% match on 2% (5% - 3%) = 50% of $2,000 = $1,000
    // Total: $4,000
    expect(match).toBe(4000);
  });

  it('Test 2.4: Two-tier matching - employee contributes beyond both tiers', () => {
    const salary = 75000;
    const employeeContribution = 7500; // 10% of salary

    const match = calculateEmployerMatch(
      salary,
      employeeContribution,
      100, // Tier 1: 100% match
      4, // up to 4%
      50, // Tier 2: 50% match
      6 // up to 6% total
    );

    // Tier 1: 100% match on 4% = $3,000
    // Tier 2: 50% match on 2% (6% - 4%) = 50% of $1,500 = $750
    // Total: $3,750
    expect(match).toBe(3750);
  });

  it('Test 2.5: No employer match', () => {
    const salary = 90000;
    const employeeContribution = 9000;

    const match = calculateEmployerMatch(
      salary,
      employeeContribution,
      0,
      0,
      0,
      0
    );

    expect(match).toBe(0);
  });
});

describe('401(k) Calculator - Test Group 3: IRS Contribution Limits', () => {
  it('Test 3.1: Contribution limit for age under 50', () => {
    const limit = getEmployeeContributionLimit(45);
    expect(limit).toBe(IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50);
    expect(limit).toBe(24500);
  });

  it('Test 3.2: Contribution limit for age 50 and over (with catch-up)', () => {
    const limit = getEmployeeContributionLimit(50);
    expect(limit).toBe(IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS);
    expect(limit).toBe(31000);
  });

  it('Test 3.3: Employee contribution capped at limit', () => {
    const salary = 300000;
    const contributionPercent = 15; // 15% of $300k = $45k (exceeds limit)
    const age = 40;

    const contribution = calculateEmployeeContribution(
      salary,
      contributionPercent,
      age
    );

    // Should be capped at $24,500
    expect(contribution).toBe(IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50);
  });

  it('Test 3.4: Employee contribution under limit', () => {
    const salary = 100000;
    const contributionPercent = 10; // 10% of $100k = $10k (under limit)
    const age = 35;

    const contribution = calculateEmployeeContribution(
      salary,
      contributionPercent,
      age
    );

    expect(contribution).toBe(10000);
  });

  it('Test 3.5: Age 50+ catch-up contribution', () => {
    const salary = 250000;
    const contributionPercent = 20; // 20% of $250k = $50k (exceeds limit)
    const age = 55;

    const contribution = calculateEmployeeContribution(
      salary,
      contributionPercent,
      age
    );

    // Should be capped at $31,000 (includes catch-up)
    expect(contribution).toBe(IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS);
  });
});

describe('401(k) Calculator - Test Group 4: Salary Increases Over Time', () => {
  it('Test 4.1: Salary growth at 3% annually', () => {
    const inputs: K401Inputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 60000,
      current401kBalance: 0,
      employeeContributionPercent: 10,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 2,
    };

    const results = calculate401kResults(inputs);

    // Final year salary after 35 years at 3% growth
    // Formula: 60000 * (1.03)^34 (salary increases happen for years 1-34, not year 0)
    const expectedFinalSalary = 60000 * Math.pow(1.03, 34);
    expectCloseTo(results.finalYearSalary, expectedFinalSalary, 5000);

    // Contributions should increase with salary
    expect(results.finalYearEmployeeContribution).toBeGreaterThan(
      results.firstYearEmployeeContribution
    );
  });

  it('Test 4.2: No salary growth (0% increase)', () => {
    const inputs: K401Inputs = {
      currentAge: 40,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 75000,
      current401kBalance: 50000,
      employeeContributionPercent: 12,
      employerMatch1Percent: 100,
      employerMatch1Limit: 4,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 0,
      expectedAnnualReturn: 6,
      expectedInflation: 2,
    };

    const results = calculate401kResults(inputs);

    // Final salary should equal starting salary
    expect(results.finalYearSalary).toBe(75000);

    // Contributions should be constant
    expect(results.finalYearEmployeeContribution).toBe(
      results.firstYearEmployeeContribution
    );
  });
});

describe('401(k) Calculator - Test Group 5: Investment Returns', () => {
  it('Test 5.1: Future value calculation - 7% return over 30 years', () => {
    const presentValue = 10000;
    const annualReturn = 7;
    const years = 30;

    const futureValue = calculateFutureValue(presentValue, annualReturn, years);

    // $10,000 at 7% for 30 years = $76,123
    expectCloseTo(futureValue, 76123, 100);
  });

  it('Test 5.2: Future value with 10% return over 20 years', () => {
    const presentValue = 50000;
    const annualReturn = 10;
    const years = 20;

    const futureValue = calculateFutureValue(presentValue, annualReturn, years);

    // $50,000 at 10% for 20 years = $336,375
    expectCloseTo(futureValue, 336375, 500);
  });

  it('Test 5.3: Conservative 5% return', () => {
    const presentValue = 100000;
    const annualReturn = 5;
    const years = 25;

    const futureValue = calculateFutureValue(presentValue, annualReturn, years);

    // $100,000 at 5% for 25 years = $338,635
    expectCloseTo(futureValue, 338635, 500);
  });
});

describe('401(k) Calculator - Test Group 6: Inflation Adjustments', () => {
  it('Test 6.1: Present value (inflation-adjusted)', () => {
    const futureValue = 100000;
    const inflationRate = 3;
    const years = 20;

    const presentValue = calculatePresentValue(
      futureValue,
      inflationRate,
      years
    );

    // $100,000 in 20 years = $55,368 in today's dollars (at 3% inflation)
    expectCloseTo(presentValue, 55368, 100);
  });

  it('Test 6.2: High inflation impact', () => {
    const futureValue = 200000;
    const inflationRate = 5;
    const years = 30;

    const presentValue = calculatePresentValue(
      futureValue,
      inflationRate,
      years
    );

    // High inflation significantly reduces purchasing power
    expect(presentValue).toBeLessThan(50000);
  });

  it('Test 6.3: Inflation-adjusted balance at retirement', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 80000,
      current401kBalance: 50000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 100,
      employerMatch1Limit: 5,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    // Inflation-adjusted balance should be less than nominal balance
    expect(results.inflationAdjustedBalance).toBeLessThan(
      results.projectedBalanceAtRetirement
    );

    // But still should be substantial
    expect(results.inflationAdjustedBalance).toBeGreaterThan(0);
  });
});

describe('401(k) Calculator - Test Group 7: Withdrawal Calculations', () => {
  it('Test 7.1: Safe withdrawal using 4% rule', () => {
    const balance = 1000000;
    const withdrawal = calculateSafeWithdrawal(balance);

    // 4% of $1M = $40,000
    expect(withdrawal).toBe(40000);
  });

  it('Test 7.2: Conservative 3% withdrawal', () => {
    const balance = 1500000;
    const withdrawal = calculateSafeWithdrawal(balance, 3);

    // 3% of $1.5M = $45,000
    expect(withdrawal).toBe(45000);
  });

  it('Test 7.3: Monthly withdrawal calculation', () => {
    const inputs: K401Inputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 70000,
      current401kBalance: 20000,
      employeeContributionPercent: 12,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    // Monthly should be annual / 12
    expectCloseTo(
      results.monthlyWithdrawal,
      results.firstYearWithdrawal / 12,
      1
    );
  });
});

describe('401(k) Calculator - Test Group 8: Success Metrics', () => {
  it('Test 8.1: Income replacement ratio', () => {
    const inputs: K401Inputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 75000,
      current401kBalance: 10000,
      employeeContributionPercent: 15,
      employerMatch1Percent: 100,
      employerMatch1Limit: 5,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 8,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    // Replacement ratio should be reasonable (typically 40-80% of final salary)
    expect(results.replacementRatio).toBeGreaterThan(30);
    expect(results.replacementRatio).toBeLessThan(100);
  });

  it('Test 8.2: Savings multiple', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 67,
      lifeExpectancy: 90,
      currentAnnualSalary: 100000,
      current401kBalance: 100000,
      employeeContributionPercent: 15,
      employerMatch1Percent: 100,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 2.5,
      expectedAnnualReturn: 7,
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    // Savings multiple (balance / final salary) should be several times salary
    expect(results.savingsMultiple).toBeGreaterThan(5);
  });
});

describe('401(k) Calculator - Test Group 9: Year-by-Year Projections', () => {
  it('Test 9.1: Verify projection array length', () => {
    const inputs: K401Inputs = {
      currentAge: 40,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 85000,
      current401kBalance: 150000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    // Should have 25 years of projections (65 - 40)
    expect(results.yearByYearProjection.length).toBe(25);
  });

  it('Test 9.2: Balance should grow each year', () => {
    const inputs: K401Inputs = {
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancy: 85,
      currentAnnualSalary: 70000,
      current401kBalance: 30000,
      employeeContributionPercent: 12,
      employerMatch1Percent: 100,
      employerMatch1Limit: 5,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 2,
    };

    const results = calculate401kResults(inputs);

    // Each year's balance should be greater than previous (with positive returns)
    for (let i = 1; i < results.yearByYearProjection.length; i++) {
      expect(results.yearByYearProjection[i].balance).toBeGreaterThan(
        results.yearByYearProjection[i - 1].balance
      );
    }
  });

  it('Test 9.3: First projection should include starting balance', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 90000,
      current401kBalance: 75000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 2,
      expectedAnnualReturn: 6,
      expectedInflation: 2,
    };

    const results = calculate401kResults(inputs);

    const firstYear = results.yearByYearProjection[0];

    // First year balance should include starting balance + return + contributions
    expect(firstYear.balance).toBeGreaterThan(inputs.current401kBalance);
  });
});

describe('401(k) Calculator - Test Group 10: Edge Cases', () => {
  it('Test 10.1: Zero starting balance', () => {
    const inputs: K401Inputs = {
      currentAge: 25,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 50000,
      current401kBalance: 0,
      employeeContributionPercent: 6,
      employerMatch1Percent: 100,
      employerMatch1Limit: 3,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    expect(results.current401kBalance).toBe(0);
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(0);
  });

  it('Test 10.2: Near retirement age', () => {
    const inputs: K401Inputs = {
      currentAge: 63,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 120000,
      current401kBalance: 800000,
      employeeContributionPercent: 15,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 2,
      expectedAnnualReturn: 6,
      expectedInflation: 2,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(2);
    expect(results.yearByYearProjection.length).toBe(2);
  });

  it('Test 10.3: Very low salary', () => {
    const inputs: K401Inputs = {
      currentAge: 25,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 25000,
      current401kBalance: 1000,
      employeeContributionPercent: 8,
      employerMatch1Percent: 100,
      employerMatch1Limit: 4,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 4,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    // First year: 8% of $25,000 = $2,000
    expect(results.firstYearEmployeeContribution).toBe(2000);

    // Employer: 100% match on 4% = $1,000
    expect(results.firstYearEmployerContribution).toBe(1000);
  });

  it('Test 10.4: Maximum contribution percentage', () => {
    const inputs: K401Inputs = {
      currentAge: 30,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 60000,
      current401kBalance: 15000,
      employeeContributionPercent: 100, // Contribute entire salary (will be capped)
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const results = calculate401kResults(inputs);

    // Should be capped at IRS limit, not 100% of salary
    expect(results.firstYearEmployeeContribution).toBe(
      IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50
    );
  });
});

describe('401(k) Calculator - Test Group 11: Validation', () => {
  it('Test 11.1: Valid inputs should pass', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 80000,
      current401kBalance: 50000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 100,
      employerMatch1Limit: 5,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const errors = validate401kInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('Test 11.2: Retirement age less than current age', () => {
    const inputs: K401Inputs = {
      currentAge: 65,
      retirementAge: 60,
      lifeExpectancy: 85,
      currentAnnualSalary: 80000,
      current401kBalance: 500000,
      employeeContributionPercent: 0,
      employerMatch1Percent: 0,
      employerMatch1Limit: 0,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 0,
      expectedAnnualReturn: 5,
      expectedInflation: 2,
    };

    const errors = validate401kInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('Test 11.3: Life expectancy less than retirement age', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 90,
      lifeExpectancy: 85,
      currentAnnualSalary: 75000,
      current401kBalance: 50000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const errors = validate401kInputs(inputs);
    expect(errors.some((e) => e.includes('Retirement age'))).toBe(true);
  });

  it('Test 11.4: Negative values', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: -50000,
      current401kBalance: 50000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const errors = validate401kInputs(inputs);
    expect(errors.some((e) => e.includes('negative'))).toBe(true);
  });

  it('Test 11.5: Invalid tier 2 match limit', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancy: 85,
      currentAnnualSalary: 80000,
      current401kBalance: 50000,
      employeeContributionPercent: 10,
      employerMatch1Percent: 100,
      employerMatch1Limit: 5,
      employerMatch2Percent: 50,
      employerMatch2Limit: 3, // Invalid: less than tier 1 limit
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7,
      expectedInflation: 3,
    };

    const errors = validate401kInputs(inputs);
    expect(errors.some((e) => e.includes('match 2 limit'))).toBe(true);
  });
});

describe('401(k) Calculator - Test Group 12: Real-World Scenarios', () => {
  it('Test 12.1: Young professional starting career', () => {
    const inputs: K401Inputs = {
      currentAge: 25,
      retirementAge: 65,
      lifeExpectancy: 90,
      currentAnnualSalary: 55000,
      current401kBalance: 2000,
      employeeContributionPercent: 6, // Contributing enough to get full match
      employerMatch1Percent: 100,
      employerMatch1Limit: 3,
      employerMatch2Percent: 50,
      employerMatch2Limit: 5,
      expectedSalaryIncrease: 4, // Higher early career growth
      expectedAnnualReturn: 8, // Aggressive allocation
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(40);

    // With 40 years of compound growth, should have substantial savings
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(1000000);

    // Employer contributions are valuable
    expect(results.totalEmployerContributions).toBeGreaterThan(50000);
  });

  it('Test 12.2: Mid-career professional maximizing contributions', () => {
    const inputs: K401Inputs = {
      currentAge: 40,
      retirementAge: 67,
      lifeExpectancy: 88,
      currentAnnualSalary: 125000,
      current401kBalance: 300000,
      employeeContributionPercent: 20, // Maxing out
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 2.5,
      expectedAnnualReturn: 7,
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(27);

    // Should hit contribution limits
    expect(results.firstYearEmployeeContribution).toBe(
      IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50
    );

    // Should have multi-million dollar balance
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(2000000);
  });

  it('Test 12.3: Late starter with catch-up contributions', () => {
    const inputs: K401Inputs = {
      currentAge: 50,
      retirementAge: 67,
      lifeExpectancy: 85,
      currentAnnualSalary: 95000,
      current401kBalance: 150000,
      employeeContributionPercent: 25, // Aggressive catch-up
      employerMatch1Percent: 100,
      employerMatch1Limit: 4,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 2,
      expectedAnnualReturn: 6.5,
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(17);

    // At age 50, eligible for catch-up contributions
    expect(results.firstYearEmployeeContribution).toBeLessThanOrEqual(
      IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS
    );

    // Still time to build reasonable nest egg
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(400000);
  });

  it('Test 12.4: High earner with generous employer match', () => {
    const inputs: K401Inputs = {
      currentAge: 35,
      retirementAge: 62,
      lifeExpectancy: 90,
      currentAnnualSalary: 175000,
      current401kBalance: 200000,
      employeeContributionPercent: 15,
      employerMatch1Percent: 100,
      employerMatch1Limit: 6,
      employerMatch2Percent: 50,
      employerMatch2Limit: 8,
      expectedSalaryIncrease: 3,
      expectedAnnualReturn: 7.5,
      expectedInflation: 2.8,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(27);

    // Should hit IRS limits
    const firstYearLimit = results.contributionLimitsInfo[0];
    expect(firstYearLimit.hitLimit).toBe(true);

    // Generous match means high employer contributions
    expect(results.totalEmployerContributions).toBeGreaterThan(200000);

    // Should accumulate substantial wealth
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(2500000);
  });

  it('Test 12.5: Conservative investor near retirement', () => {
    const inputs: K401Inputs = {
      currentAge: 60,
      retirementAge: 67,
      lifeExpectancy: 87,
      currentAnnualSalary: 110000,
      current401kBalance: 750000,
      employeeContributionPercent: 18,
      employerMatch1Percent: 50,
      employerMatch1Limit: 6,
      employerMatch2Percent: 0,
      employerMatch2Limit: 0,
      expectedSalaryIncrease: 1.5, // Modest raises near retirement
      expectedAnnualReturn: 5, // Conservative allocation
      expectedInflation: 2.5,
    };

    const results = calculate401kResults(inputs);

    expect(results.yearsToRetirement).toBe(7);

    // With large existing balance, should reach $1M+
    expect(results.projectedBalanceAtRetirement).toBeGreaterThan(1000000);

    // Withdrawal calculations should provide comfortable income
    expect(results.firstYearWithdrawal).toBeGreaterThan(40000);
    expect(results.replacementRatio).toBeGreaterThan(35);
  });
});
