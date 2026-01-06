/**
 * Comprehensive Test Suite for CD Calculator
 *
 * These tests validate the calculation logic against known compound interest formulas:
 * - Standard Compounding: A = P(1 + r/n)^(nt)
 * - Continuous Compounding: A = Pe^(rt)
 *
 * Test cases cover:
 * 1. Different compounding frequencies (daily, monthly, quarterly, semiannually, annually, continuously)
 * 2. Various deposit amounts
 * 3. Different term lengths
 * 4. Different interest rates
 * 5. Edge cases (0% interest, very short/long terms)
 */

import { describe, it, expect } from 'vitest';
import { calculateCD, type CDInputs } from './calculations';

/**
 * Helper function to round to 2 decimal places for currency comparison
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

describe('CD Calculator - Standard Compounding', () => {
  /**
   * Test Case 1: Annual Compounding
   * Formula: A = P(1 + r/n)^(nt)
   * $10,000 at 5% for 3 years, compounded annually
   * A = 10000(1 + 0.05/1)^(1*3) = 10000(1.05)^3 = $11,576.25
   */
  it('should calculate correctly with annual compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 5,
      years: 3,
      months: 0,
      compoundingFrequency: 'annually',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(11576.25);
    expect(round(result.totalInterest)).toBe(1576.25);
    expect(result.totalDeposit).toBe(10000);
    expect(result.schedule.length).toBe(36); // 3 years * 12 months
  });

  /**
   * Test Case 2: Monthly Compounding
   * $10,000 at 5% for 3 years, compounded monthly
   * A = 10000(1 + 0.05/12)^(12*3) = $11,614.72
   */
  it('should calculate correctly with monthly compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 5,
      years: 3,
      months: 0,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(11614.72);
    expect(round(result.totalInterest)).toBe(1614.72);
    expect(result.totalDeposit).toBe(10000);
  });

  /**
   * Test Case 3: Quarterly Compounding
   * $5,000 at 3% for 5 years, compounded quarterly
   * A = 5000(1 + 0.03/4)^(4*5) = $5,805.92
   */
  it('should calculate correctly with quarterly compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 5000,
      interestRate: 3,
      years: 5,
      months: 0,
      compoundingFrequency: 'quarterly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(5805.92);
    expect(round(result.totalInterest)).toBe(805.92);
    expect(result.totalDeposit).toBe(5000);
    expect(result.schedule.length).toBe(60); // 5 years * 12 months
  });

  /**
   * Test Case 4: Semiannual Compounding
   * $15,000 at 4% for 2 years, compounded semiannually
   * A = 15000(1 + 0.04/2)^(2*2) = $16,236.48
   */
  it('should calculate correctly with semiannual compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 15000,
      interestRate: 4,
      years: 2,
      months: 0,
      compoundingFrequency: 'semiannually',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(16236.48);
    expect(round(result.totalInterest)).toBe(1236.48);
    expect(result.totalDeposit).toBe(15000);
  });

  /**
   * Test Case 5: Daily Compounding
   * $25,000 at 4.5% for 2 years, compounded daily
   * A = 25000(1 + 0.045/365)^(365*2) = $27,354.21
   */
  it('should calculate correctly with daily compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 25000,
      interestRate: 4.5,
      years: 2,
      months: 0,
      compoundingFrequency: 'daily',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(27354.21);
    expect(round(result.totalInterest)).toBe(2354.21);
    expect(result.totalDeposit).toBe(25000);
  });
});

describe('CD Calculator - Continuous Compounding', () => {
  /**
   * Test Case 6: Continuous Compounding
   * Formula: A = Pe^(rt)
   * $1,000 at 2% for 1 year, compounded continuously
   * A = 1000 * e^(0.02*1) = $1,020.20
   */
  it('should calculate correctly with continuous compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 1000,
      interestRate: 2,
      years: 1,
      months: 0,
      compoundingFrequency: 'continuously',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(1020.2);
    expect(round(result.totalInterest)).toBe(20.2);
    expect(result.totalDeposit).toBe(1000);
  });

  /**
   * Test Case 7: Continuous Compounding - Higher Rate
   * $10,000 at 6% for 5 years, compounded continuously
   * A = 10000 * e^(0.06*5) = $13,498.59
   */
  it('should calculate correctly with continuous compounding and higher rate', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 6,
      years: 5,
      months: 0,
      compoundingFrequency: 'continuously',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(13498.59);
    expect(round(result.totalInterest)).toBe(3498.59);
    expect(result.totalDeposit).toBe(10000);
  });
});

describe('CD Calculator - Mixed Time Periods', () => {
  /**
   * Test Case 8: Years and Months Combined
   * $8,000 at 3.5% for 2 years 6 months, compounded monthly
   * A = 8000(1 + 0.035/12)^(12*2.5) = $8,730.43
   */
  it('should handle years and months correctly', () => {
    const inputs: CDInputs = {
      initialDeposit: 8000,
      interestRate: 3.5,
      years: 2,
      months: 6,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(8730.43);
    expect(round(result.totalInterest)).toBe(730.43);
    expect(result.schedule.length).toBe(30); // 2.5 years * 12 months
  });

  /**
   * Test Case 9: Only Months
   * $3,000 at 4% for 0 years 6 months, compounded monthly
   * A = 3000(1 + 0.04/12)^(12*0.5) = $3,060.50
   */
  it('should calculate correctly with only months', () => {
    const inputs: CDInputs = {
      initialDeposit: 3000,
      interestRate: 4,
      years: 0,
      months: 6,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(3060.5);
    expect(round(result.totalInterest)).toBe(60.5);
    expect(result.schedule.length).toBe(6);
  });
});

describe('CD Calculator - Edge Cases', () => {
  /**
   * Test Case 10: Zero Interest Rate
   * $5,000 at 0% for 3 years
   * Should return the original deposit
   */
  it('should handle zero interest rate', () => {
    const inputs: CDInputs = {
      initialDeposit: 5000,
      interestRate: 0,
      years: 3,
      months: 0,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(5000.0);
    expect(round(result.totalInterest)).toBe(0.0);
    expect(result.totalDeposit).toBe(5000);
  });

  /**
   * Test Case 11: Very Short Term
   * $10,000 at 5% for 1 month, compounded monthly
   * A = 10000(1 + 0.05/12)^(12*(1/12)) = $10,041.67
   */
  it('should handle very short term (1 month)', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 5,
      years: 0,
      months: 1,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(10041.67);
    expect(round(result.totalInterest)).toBe(41.67);
  });

  /**
   * Test Case 12: Long Term CD
   * $20,000 at 3% for 10 years, compounded annually
   * A = 20000(1.03)^10 = $26,878.33
   */
  it('should handle long term (10 years)', () => {
    const inputs: CDInputs = {
      initialDeposit: 20000,
      interestRate: 3,
      years: 10,
      months: 0,
      compoundingFrequency: 'annually',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(26878.33);
    expect(round(result.totalInterest)).toBe(6878.33);
    expect(result.schedule.length).toBe(120); // 10 years * 12 months
  });

  /**
   * Test Case 13: Small Deposit
   * $100 at 2.5% for 1 year, compounded monthly
   * A = 100(1 + 0.025/12)^12 = $102.53
   */
  it('should handle small deposit amounts', () => {
    const inputs: CDInputs = {
      initialDeposit: 100,
      interestRate: 2.5,
      years: 1,
      months: 0,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(102.53);
    expect(round(result.totalInterest)).toBe(2.53);
  });

  /**
   * Test Case 14: Large Deposit
   * $100,000 at 5.5% for 5 years, compounded daily
   * A = 100000(1 + 0.055/365)^(365*5) = $131,650.34
   */
  it('should handle large deposit amounts', () => {
    const inputs: CDInputs = {
      initialDeposit: 100000,
      interestRate: 5.5,
      years: 5,
      months: 0,
      compoundingFrequency: 'daily',
    };

    const result = calculateCD(inputs);

    expect(round(result.endingBalance)).toBe(131650.34);
    expect(round(result.totalInterest)).toBe(31650.34);
  });
});

describe('CD Calculator - APY Calculation', () => {
  /**
   * Test Case 15: APY for Monthly Compounding
   * For 5% interest rate compounded monthly
   * APY = (1 + 0.05/12)^12 - 1 = 5.1162%
   */
  it('should calculate APY correctly for monthly compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 5,
      years: 1,
      months: 0,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    expect(round(result.effectiveAnnualRate * 100) / 100).toBe(5.1162);
  });

  /**
   * Test Case 16: APY for Daily Compounding
   * For 4% interest rate compounded daily
   * APY = (1 + 0.04/365)^365 - 1 ≈ 4.0808%
   */
  it('should calculate APY correctly for daily compounding', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 4,
      years: 1,
      months: 0,
      compoundingFrequency: 'daily',
    };

    const result = calculateCD(inputs);

    expect(round(result.effectiveAnnualRate * 100) / 100).toBe(4.0808);
  });
});

describe('CD Calculator - Schedule Validation', () => {
  /**
   * Test Case 17: Schedule Accuracy
   * Verify that the monthly schedule accumulates correctly
   */
  it('should generate accurate monthly schedule', () => {
    const inputs: CDInputs = {
      initialDeposit: 10000,
      interestRate: 6,
      years: 1,
      months: 0,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    // Check first month
    expect(result.schedule[0].period).toBe(1);
    expect(result.schedule[0].deposit).toBe(10000);
    expect(round(result.schedule[0].balance)).toBeGreaterThan(10000);

    // Check last month
    const lastMonth = result.schedule[result.schedule.length - 1];
    expect(lastMonth.period).toBe(12);
    expect(round(lastMonth.balance)).toBe(round(result.endingBalance));

    // Verify all interest adds up
    const totalInterestFromSchedule = result.schedule.reduce(
      (sum, period) => sum + period.interestEarned,
      0
    );
    expect(round(totalInterestFromSchedule)).toBe(round(result.totalInterest));
  });

  /**
   * Test Case 18: Balance Growth Monotonicity
   * Verify that balance increases every month (for positive interest)
   */
  it('should show monotonically increasing balance', () => {
    const inputs: CDInputs = {
      initialDeposit: 5000,
      interestRate: 4,
      years: 2,
      months: 0,
      compoundingFrequency: 'monthly',
    };

    const result = calculateCD(inputs);

    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].balance).toBeGreaterThan(
        result.schedule[i - 1].balance
      );
    }
  });
});
