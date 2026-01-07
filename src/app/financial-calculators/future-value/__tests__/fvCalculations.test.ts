/**
 * Future Value Calculator - Comprehensive Test Suite
 *
 * Tests all calculation scenarios including:
 * - FV of lump sum (present value)
 * - FV of ordinary annuity (end of period)
 * - FV of annuity due (beginning of period)
 * - FV of growing annuity
 * - Combined calculations (lump sum + annuity)
 * - Different payment frequencies
 * - Edge cases and validation
 * - Real-world scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFVResults,
  validateFVInputs,
  calculateFVOfLumpSum,
  calculateFVOfOrdinaryAnnuity,
  calculateFVOfAnnuityDue,
  calculateFVOfGrowingAnnuity,
  getPeriodicRate,
  getPeriodsPerYear,
  calculateEffectiveAnnualRate,
  type FVInputs,
} from './fvCalculations';

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

describe('Future Value Calculator - Utility Functions', () => {
  describe('getPeriodicRate', () => {
    it('should convert annual rate correctly for different frequencies', () => {
      expect(getPeriodicRate(12, 'annual')).toBeCloseTo(12);
      expect(getPeriodicRate(12, 'semi-annual')).toBeCloseTo(6);
      expect(getPeriodicRate(12, 'quarterly')).toBeCloseTo(3);
      expect(getPeriodicRate(12, 'monthly')).toBeCloseTo(1);
    });
  });

  describe('getPeriodsPerYear', () => {
    it('should return correct periods per year for each frequency', () => {
      expect(getPeriodsPerYear('annual')).toBe(1);
      expect(getPeriodsPerYear('semi-annual')).toBe(2);
      expect(getPeriodsPerYear('quarterly')).toBe(4);
      expect(getPeriodsPerYear('monthly')).toBe(12);
      expect(getPeriodsPerYear('weekly')).toBe(52);
      expect(getPeriodsPerYear('daily')).toBe(365);
    });
  });

  describe('calculateEffectiveAnnualRate', () => {
    it('should calculate EAR correctly', () => {
      // Monthly compounding at 12% annual (1% per month)
      const monthlyRate = 1; // 1% per month
      const ear = calculateEffectiveAnnualRate(monthlyRate, 12);
      expectCloseTo(ear, 12.68, 0.01); // (1.01)^12 - 1 = 12.68%
    });

    it('should handle quarterly compounding', () => {
      // Quarterly compounding at 8% annual (2% per quarter)
      const quarterlyRate = 2; // 2% per quarter
      const ear = calculateEffectiveAnnualRate(quarterlyRate, 4);
      expectCloseTo(ear, 8.24, 0.01); // (1.02)^4 - 1 = 8.24%
    });
  });
});

describe('Future Value Calculator - Test Group 1: FV of Lump Sum', () => {
  it('Test 1.1: Basic Lump Sum FV', () => {
    // PV = $10,000, n = 10, r = 6%
    // FV = 10000 × (1.06)^10 = $17,908.48
    const result = calculateFVOfLumpSum(10000, 0.06, 10);

    expectCloseTo(result.futureValue, 17908.48, 0.01);
    expectCloseTo(result.compoundFactor, 1.790848, 0.000001);
    expectCloseTo(result.interestEarned, 7908.48, 0.01);
    expectCloseTo(result.totalGrowthPercentage, 79.08, 0.01);
  });

  it('Test 1.2: High Interest Rate Lump Sum', () => {
    // PV = $5,000, n = 20, r = 10%
    // FV = 5000 × (1.10)^20 = $33,637.50
    const result = calculateFVOfLumpSum(5000, 0.1, 20);

    expectCloseTo(result.futureValue, 33637.5, 0.01);
    expectCloseTo(result.compoundFactor, 6.7275, 0.001);
    expectCloseTo(result.interestEarned, 28637.5, 0.01);
  });

  it('Test 1.3: Zero Interest Rate', () => {
    // PV = $10,000, n = 5, r = 0%
    // FV should equal PV when rate is 0
    const result = calculateFVOfLumpSum(10000, 0, 5);

    expect(result.futureValue).toBe(10000);
    expect(result.interestEarned).toBe(0);
    expect(result.totalGrowthPercentage).toBe(0);
    expect(result.compoundFactor).toBe(1);
  });

  it('Test 1.4: Short Period High Rate', () => {
    // PV = $1,000, n = 3, r = 15%
    // FV = 1000 × (1.15)^3 = $1,520.88
    const result = calculateFVOfLumpSum(1000, 0.15, 3);

    expectCloseTo(result.futureValue, 1520.88, 0.01);
    expectCloseTo(result.interestEarned, 520.88, 0.01);
  });

  it('Test 1.5: Verify compound growth formula', () => {
    // If we divide FV by compound factor, we should get PV
    const pv = 25000;
    const rate = 0.07;
    const periods = 15;

    const result = calculateFVOfLumpSum(pv, rate, periods);
    const calculatedPV = result.futureValue / result.compoundFactor;

    expectCloseTo(calculatedPV, pv, 0.01);
  });
});

describe('Future Value Calculator - Test Group 2: FV of Ordinary Annuity', () => {
  it('Test 2.1: Basic Ordinary Annuity', () => {
    // PMT = $1,000, n = 10, r = 5%
    // FV = 1000 × [((1.05)^10 - 1) / 0.05] = $12,577.89
    const fv = calculateFVOfOrdinaryAnnuity(1000, 0.05, 10);

    expectCloseTo(fv, 12577.89, 0.01);
  });

  it('Test 2.2: High Rate Ordinary Annuity', () => {
    // PMT = $500, n = 15, r = 8%
    // FV = 500 × [((1.08)^15 - 1) / 0.08] = $13,576.06
    const fv = calculateFVOfOrdinaryAnnuity(500, 0.08, 15);

    expectCloseTo(fv, 13576.06, 0.01);
  });

  it('Test 2.3: Zero Rate Annuity', () => {
    // PMT = $1,000, n = 10, r = 0%
    // FV = 1000 × 10 = $10,000
    const fv = calculateFVOfOrdinaryAnnuity(1000, 0, 10);

    expect(fv).toBe(10000);
  });

  it('Test 2.4: Monthly Savings Example', () => {
    // PMT = $200, n = 60 months, r = 0.5% per month (6% annual / 12)
    // Saving $200/month for 5 years at 6% annual
    const fv = calculateFVOfOrdinaryAnnuity(200, 0.005, 60);

    expectCloseTo(fv, 13954.01, 1);
  });

  it('Test 2.5: Large Number of Periods', () => {
    // PMT = $100, n = 240 months (20 years), r = 0.5% per month
    const fv = calculateFVOfOrdinaryAnnuity(100, 0.005, 240);

    // Should grow significantly
    expect(fv).toBeGreaterThan(30000);
    expectCloseTo(fv, 46204.09, 1);
  });
});

describe('Future Value Calculator - Test Group 3: FV of Annuity Due', () => {
  it('Test 3.1: Basic Annuity Due', () => {
    // PMT = $1,000, n = 10, r = 5%
    // FV_ordinary = $12,577.89
    // FV_due = 12,577.89 × 1.05 = $13,206.79
    const fv = calculateFVOfAnnuityDue(1000, 0.05, 10);

    expectCloseTo(fv, 13206.79, 0.01);
  });

  it('Test 3.2: Annuity Due with Higher Rate', () => {
    // PMT = $2,000, n = 8, r = 7%
    // FV_ordinary = 2000 × [((1.07)^8 - 1) / 0.07] = $20,522.41
    // FV_due = 20,522.41 × 1.07 = $21,955.98
    const fv = calculateFVOfAnnuityDue(2000, 0.07, 8);

    expectCloseTo(fv, 21955.98, 0.01);
  });

  it('Test 3.3: Verify difference between ordinary and due', () => {
    const payment = 1000;
    const rate = 0.06;
    const periods = 12;

    const fvOrdinary = calculateFVOfOrdinaryAnnuity(payment, rate, periods);
    const fvDue = calculateFVOfAnnuityDue(payment, rate, periods);

    // Due should be ordinary × (1 + rate)
    expectCloseTo(fvDue, fvOrdinary * (1 + rate), 0.01);
    // Due should be higher than ordinary
    expect(fvDue).toBeGreaterThan(fvOrdinary);
  });

  it('Test 3.4: Retirement Savings - Beginning of Month', () => {
    // $500/month for 30 years at 7% annual (0.5833% monthly)
    // Beginning of month contributions
    const monthlyRate = 0.07 / 12;
    const fv = calculateFVOfAnnuityDue(500, monthlyRate, 360);

    expectCloseTo(fv, 613543.75, 10);
  });
});

describe('Future Value Calculator - Test Group 4: FV of Growing Annuity', () => {
  it('Test 4.1: Basic Growing Annuity', () => {
    // PMT = $1,000, n = 10, r = 8%, g = 3%
    // FV = 1000 × [((1.08)^10 - (1.03)^10) / (0.08 - 0.03)] = $16,300.17
    const fv = calculateFVOfGrowingAnnuity(1000, 0.08, 0.03, 10, 'end');

    expectCloseTo(fv, 16300.17, 2);
  });

  it('Test 4.2: High Growth Rate', () => {
    // PMT = $500, n = 15, r = 10%, g = 5%
    // Growing payments should result in higher FV than flat payments
    const fvGrowing = calculateFVOfGrowingAnnuity(500, 0.1, 0.05, 15, 'end');
    const fvFlat = calculateFVOfOrdinaryAnnuity(500, 0.1, 15);

    expect(fvGrowing).toBeGreaterThan(fvFlat);
    expectCloseTo(fvGrowing, 20983.2, 2);
  });

  it('Test 4.3: Growth Rate Equals Interest Rate (Special Case)', () => {
    // PMT = $1,000, n = 10, r = 6%, g = 6%
    // Special formula: FV = PMT × n × (1 + r)^(n-1)
    // FV = 1000 × 10 × (1.06)^9 = $16,894.79
    const fv = calculateFVOfGrowingAnnuity(1000, 0.06, 0.06, 10, 'end');

    expectCloseTo(fv, 16894.79, 0.01);
  });

  it('Test 4.4: Zero Growth Rate (Should match regular annuity)', () => {
    // PMT = $1,000, n = 10, r = 5%, g = 0%
    // Should equal ordinary annuity
    const fvGrowing = calculateFVOfGrowingAnnuity(1000, 0.05, 0, 10, 'end');
    const fvOrdinary = calculateFVOfOrdinaryAnnuity(1000, 0.05, 10);

    expectCloseTo(fvGrowing, fvOrdinary, 0.01);
  });

  it('Test 4.5: Growing Annuity Due', () => {
    // Test growing annuity with beginning of period payments
    const fvEnd = calculateFVOfGrowingAnnuity(1000, 0.08, 0.03, 10, 'end');
    const fvBeginning = calculateFVOfGrowingAnnuity(
      1000,
      0.08,
      0.03,
      10,
      'beginning'
    );

    // Beginning should be higher than end
    expect(fvBeginning).toBeGreaterThan(fvEnd);
    // Beginning should be approximately end × (1 + rate)
    expectCloseTo(fvBeginning, fvEnd * 1.08, 2);
  });

  it('Test 4.6: Salary Increases - Growing Contributions', () => {
    // $2,000/year initial contribution, growing at 4% annually
    // Interest rate 7%, 20 years
    const fv = calculateFVOfGrowingAnnuity(2000, 0.07, 0.04, 20, 'end');

    // Should be significantly more than flat contributions
    const fvFlat = calculateFVOfOrdinaryAnnuity(2000, 0.07, 20);
    expect(fv).toBeGreaterThan(fvFlat);
    expectCloseTo(fv, 111904.09, 10);
  });
});

describe('Future Value Calculator - Test Group 5: Combined Calculations', () => {
  it('Test 5.1: Lump Sum + Ordinary Annuity', () => {
    // PV = $5,000, PMT = $500, n = 8, r = 6%
    const inputs: FVInputs = {
      presentValue: 5000,
      periodicPayment: 500,
      periods: 8,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    // FV of Lump Sum: 5000 × (1.06)^8 = $7,969.24
    expectCloseTo(results.fvOfLumpSum, 7969.24, 0.01);

    // FV of Annuity: 500 × [((1.06)^8 - 1) / 0.06] = $4,948.73
    expectCloseTo(results.fvOfAnnuity, 4948.73, 1);

    // Total FV = 7,969.24 + 4,948.73 = $12,917.97
    expectCloseTo(results.totalFutureValue, 12917.97, 1);

    // Total contributions = 5000 + (500 × 8) = $9,000
    expect(results.totalContributions).toBe(9000);

    // Total interest = 12,917.97 - 9,000 = $3,917.97
    expectCloseTo(results.totalInterest, 3917.97, 1);
  });

  it('Test 5.2: Lump Sum + Annuity Due', () => {
    // PV = $10,000, PMT = $1,000, n = 5, r = 6%, timing = beginning
    const inputs: FVInputs = {
      presentValue: 10000,
      periodicPayment: 1000,
      periods: 5,
      interestRate: 6,
      paymentTiming: 'beginning',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    // FV of Lump Sum: 10000 × (1.06)^5 = $13,382.26
    expectCloseTo(results.fvOfLumpSum, 13382.26, 0.01);

    // FV of Annuity Due: should be higher than ordinary
    expect(results.fvOfAnnuity).toBeGreaterThan(5000);
    expectCloseTo(results.fvOfAnnuity, 5975.32, 0.01);

    // Total FV
    expectCloseTo(results.totalFutureValue, 19357.58, 0.01);
  });

  it('Test 5.3: Only Lump Sum (No Annuity)', () => {
    const inputs: FVInputs = {
      presentValue: 20000,
      periods: 10,
      interestRate: 7,
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    expect(results.fvOfAnnuity).toBe(0);
    expect(results.totalFutureValue).toBe(results.fvOfLumpSum);
    expectCloseTo(results.totalFutureValue, 39343.03, 0.02);
  });

  it('Test 5.4: Only Annuity (No Lump Sum)', () => {
    const inputs: FVInputs = {
      periodicPayment: 2000,
      periods: 6,
      interestRate: 5,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    expect(results.fvOfLumpSum).toBe(0);
    expect(results.totalFutureValue).toBe(results.fvOfAnnuity);
    expectCloseTo(results.totalFutureValue, 13603.83, 1);
  });

  it('Test 5.5: Lump Sum + Growing Annuity', () => {
    // Starting with $10,000, contributing $1,000/year growing at 3%
    // 7% interest, 15 years
    const inputs: FVInputs = {
      presentValue: 10000,
      periodicPayment: 1000,
      periods: 15,
      interestRate: 7,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
      growthRate: 3,
    };

    const results = calculateFVResults(inputs);

    expect(results.isGrowingAnnuity).toBe(true);

    // FV of lump sum
    expectCloseTo(results.fvOfLumpSum, 27590.32, 1);

    // Growing annuity should be more than flat
    expect(results.fvOfAnnuity).toBeGreaterThan(15000);

    // Total FV
    expect(results.totalFutureValue).toBeGreaterThan(45000);
  });
});

describe('Future Value Calculator - Test Group 6: Different Payment Frequencies', () => {
  it('Test 6.1: Monthly Payments', () => {
    // PMT = $100/month, Time = 2 years (24 months), Annual Rate = 6%
    // Monthly Rate = 0.5%, n = 24
    // FV = 100 × [((1.005)^24 - 1) / 0.005] = $2,543.20
    const inputs: FVInputs = {
      periodicPayment: 100,
      periods: 24,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
    };

    const results = calculateFVResults(inputs);

    expectCloseTo(results.fvOfAnnuity, 2543.2, 0.01);
    expectCloseTo(results.periodicRate, 0.5, 0.01); // 0.5% per month
    expect(results.totalPayments).toBe(2400);
    expectCloseTo(results.totalInterest, 143.2, 0.01);
  });

  it('Test 6.2: Quarterly Payments', () => {
    // PMT = $1,000/quarter, Time = 5 years (20 quarters), Annual Rate = 8%
    // Quarterly Rate = 2%, n = 20
    // FV = 1000 × [((1.02)^20 - 1) / 0.02] = $24,297.37
    const inputs: FVInputs = {
      periodicPayment: 1000,
      periods: 20,
      interestRate: 8,
      paymentTiming: 'end',
      paymentFrequency: 'quarterly',
    };

    const results = calculateFVResults(inputs);

    expectCloseTo(results.fvOfAnnuity, 24297.37, 0.01);
    expectCloseTo(results.periodicRate, 2.0, 0.01); // 2% per quarter
  });

  it('Test 6.3: Semi-Annual Payments (Annuity Due)', () => {
    // PMT = $2,500 semi-annually, Time = 10 years (20 periods), Annual Rate = 6%
    // Semi-annual Rate = 3%, n = 20
    const inputs: FVInputs = {
      periodicPayment: 2500,
      periods: 20,
      interestRate: 6,
      paymentTiming: 'beginning',
      paymentFrequency: 'semi-annual',
    };

    const results = calculateFVResults(inputs);

    expectCloseTo(results.fvOfAnnuity, 69190.21, 5);
    expectCloseTo(results.periodicRate, 3.0, 0.01); // 3% per period
  });

  it('Test 6.4: Weekly Payments', () => {
    // PMT = $50/week, Time = 52 weeks (1 year), Annual Rate = 5.2%
    // Weekly Rate = 5.2% / 52 = 0.1%
    const inputs: FVInputs = {
      periodicPayment: 50,
      periods: 52,
      interestRate: 5.2,
      paymentTiming: 'end',
      paymentFrequency: 'weekly',
    };

    const results = calculateFVResults(inputs);

    // Total payments = $2,600
    expect(results.totalPayments).toBe(2600);
    // FV should be more due to interest
    expect(results.fvOfAnnuity).toBeGreaterThan(2600);
    expectCloseTo(results.fvOfAnnuity, 2667.42, 1);
  });

  it('Test 6.5: Compare frequencies - same annual amount', () => {
    // Compare $12,000 annual vs $1,000 monthly over 10 years at 6%
    const annual: FVInputs = {
      periodicPayment: 12000,
      periods: 10,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const monthly: FVInputs = {
      periodicPayment: 1000,
      periods: 120,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
    };

    const annualResults = calculateFVResults(annual);
    const monthlyResults = calculateFVResults(monthly);

    // Monthly should have higher FV due to more frequent compounding
    expect(monthlyResults.totalFutureValue).toBeGreaterThan(
      annualResults.totalFutureValue
    );
  });
});

describe('Future Value Calculator - Test Group 7: Edge Cases', () => {
  it('Test 7.1: Zero Payment Amount', () => {
    const inputs: FVInputs = {
      periodicPayment: 0,
      presentValue: 5000,
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    expect(results.fvOfAnnuity).toBe(0);
    expect(results.totalFutureValue).toBe(results.fvOfLumpSum);
  });

  it('Test 7.2: Single Period', () => {
    // PMT = $1,000, n = 1, r = 10%
    // FV = 1000 × 1.10 = $1,100
    const inputs: FVInputs = {
      periodicPayment: 1000,
      periods: 1,
      interestRate: 10,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    expectCloseTo(results.fvOfAnnuity, 1000, 0.01); // No interest for end payment in period 1
  });

  it('Test 7.3: Very High Interest Rate (100%)', () => {
    // PV = $1,000, n = 5, r = 100%
    // FV = 1000 × (2)^5 = $32,000
    const result = calculateFVOfLumpSum(1000, 1.0, 5);

    expectCloseTo(result.futureValue, 32000, 0.01);
  });

  it('Test 7.4: Very Long Time Period', () => {
    // PV = $1,000, n = 50, r = 8%
    // Should grow exponentially
    const result = calculateFVOfLumpSum(1000, 0.08, 50);

    expectCloseTo(result.futureValue, 46901.61, 1);
    expect(result.futureValue).toBeGreaterThan(40000);
  });

  it('Test 7.5: Very Small Interest Rate', () => {
    // PMT = $1,000, n = 10, r = 0.1%
    const fv = calculateFVOfOrdinaryAnnuity(1000, 0.001, 10);

    // Should be close to $10,000 (sum of payments)
    expect(fv).toBeGreaterThan(10000);
    expectCloseTo(fv, 10045.11, 0.1);
  });

  it('Test 7.6: Very Small Payment', () => {
    // PMT = $1, n = 100, r = 5%
    const fv = calculateFVOfOrdinaryAnnuity(1, 0.05, 100);

    expect(fv).toBeGreaterThan(100);
    expect(fv).toBeLessThan(20000);
  });
});

describe('Future Value Calculator - Test Group 8: Validation', () => {
  it('Test 8.1: Should accept valid inputs', () => {
    const inputs: FVInputs = {
      presentValue: 10000,
      periodicPayment: 1000,
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('Test 8.2: Should reject missing present value and payment', () => {
    const inputs: FVInputs = {
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('present value or periodic payment');
  });

  it('Test 8.3: Should reject negative present value', () => {
    const inputs: FVInputs = {
      presentValue: -5000,
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    expect(errors.some((e) => e.includes('non-negative'))).toBe(true);
  });

  it('Test 8.4: Should reject negative interest rate', () => {
    const inputs: FVInputs = {
      presentValue: 10000,
      periods: 10,
      interestRate: -5,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    expect(errors.some((e) => e.toLowerCase().includes('interest rate'))).toBe(
      true
    );
  });

  it('Test 8.5: Should reject zero or negative periods', () => {
    const inputs: FVInputs = {
      presentValue: 10000,
      periods: 0,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    expect(errors.some((e) => e.includes('periods'))).toBe(true);
  });

  it('Test 8.6: Should warn about growth rate exceeding interest rate', () => {
    const inputs: FVInputs = {
      periodicPayment: 1000,
      periods: 10,
      interestRate: 5,
      growthRate: 8,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    expect(errors.some((e) => e.includes('Growth rate'))).toBe(true);
  });

  it('Test 8.7: Should accept growth rate equal to interest rate', () => {
    const inputs: FVInputs = {
      periodicPayment: 1000,
      periods: 10,
      interestRate: 6,
      growthRate: 6,
      paymentFrequency: 'annual',
    };

    const errors = validateFVInputs(inputs);
    // Should not have errors (special case is handled)
    expect(errors).toHaveLength(0);
  });
});

describe('Future Value Calculator - Test Group 9: Results Completeness', () => {
  it('Test 9.1: Should provide complete results structure', () => {
    const inputs: FVInputs = {
      presentValue: 10000,
      periodicPayment: 1000,
      periods: 5,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    // Check all required fields exist
    expect(results.totalFutureValue).toBeDefined();
    expect(results.fvOfLumpSum).toBeDefined();
    expect(results.fvOfAnnuity).toBeDefined();
    expect(results.presentValue).toBeDefined();
    expect(results.periodicPayment).toBeDefined();
    expect(results.totalContributions).toBeDefined();
    expect(results.totalInterest).toBeDefined();
    expect(results.numberOfPeriods).toBeDefined();
    expect(results.totalPayments).toBeDefined();
    expect(results.interestRate).toBeDefined();
    expect(results.periodicRate).toBeDefined();
    expect(results.effectiveAnnualRate).toBeDefined();
    expect(results.compoundFactor).toBeDefined();
    expect(results.periodBreakdown).toBeDefined();
    expect(results.periodBreakdown.length).toBe(5);
  });

  it('Test 9.2: Period breakdown should be accurate', () => {
    const inputs: FVInputs = {
      periodicPayment: 1000,
      periods: 3,
      interestRate: 10,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    expect(results.periodBreakdown).toHaveLength(3);

    // Check ending balances increase
    expect(results.periodBreakdown[1].endingBalance).toBeGreaterThan(
      results.periodBreakdown[0].endingBalance
    );
    expect(results.periodBreakdown[2].endingBalance).toBeGreaterThan(
      results.periodBreakdown[1].endingBalance
    );

    // Final ending balance should equal total FV
    expectCloseTo(
      results.periodBreakdown[2].endingBalance,
      results.totalFutureValue,
      0.01
    );
  });

  it('Test 9.3: Growing annuity breakdown should show increasing payments', () => {
    const inputs: FVInputs = {
      periodicPayment: 1000,
      periods: 5,
      interestRate: 8,
      growthRate: 3,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    expect(results.isGrowingAnnuity).toBe(true);
    expect(results.growthRate).toBe(3);

    // Check that payments grow
    expect(results.periodBreakdown[1].payment).toBeGreaterThan(
      results.periodBreakdown[0].payment
    );
    expect(results.periodBreakdown[2].payment).toBeGreaterThan(
      results.periodBreakdown[1].payment
    );

    // First payment should be initial payment
    expect(results.periodBreakdown[0].payment).toBe(1000);

    // Second payment should be first × (1 + growth rate / periods per year)
    const annualGrowthRate = 0.03;
    const periodicGrowthRate = annualGrowthRate / 1; // annual frequency
    expectCloseTo(
      results.periodBreakdown[1].payment,
      1000 * (1 + periodicGrowthRate),
      0.01
    );
  });

  it('Test 9.4: Cumulative interest should match total interest', () => {
    const inputs: FVInputs = {
      presentValue: 5000,
      periodicPayment: 500,
      periods: 10,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    const lastPeriod =
      results.periodBreakdown[results.periodBreakdown.length - 1];
    expectCloseTo(lastPeriod.cumulativeInterest, results.totalInterest, 0.5);
  });
});

describe('Future Value Calculator - Test Group 10: Real-World Scenarios', () => {
  it('Test 10.1: Retirement Savings - 401(k) Example', () => {
    // Start with $50,000, contribute $500/month for 30 years at 7% annual return
    const inputs: FVInputs = {
      presentValue: 50000,
      periodicPayment: 500,
      periods: 360, // 30 years × 12 months
      interestRate: 7,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
    };

    const results = calculateFVResults(inputs);

    // Should grow to over $1 million
    expect(results.totalFutureValue).toBeGreaterThan(900000);
    expectCloseTo(results.totalFutureValue, 1015810.37, 100);

    // Contributions: 50,000 + (500 × 360) = $230,000
    expect(results.totalContributions).toBe(230000);

    // Interest earned should be substantial
    expect(results.totalInterest).toBeGreaterThan(700000);
  });

  it('Test 10.2: College Savings - 529 Plan', () => {
    // Start with $10,000, contribute $300/month for 18 years at 6% return
    const inputs: FVInputs = {
      presentValue: 10000,
      periodicPayment: 300,
      periods: 216, // 18 years × 12 months
      interestRate: 6,
      paymentTiming: 'beginning', // Beginning of month
      paymentFrequency: 'monthly',
    };

    const results = calculateFVResults(inputs);

    expectCloseTo(results.totalFutureValue, 146154.65, 20);

    // Total contributions = 10,000 + (300 × 216) = $74,800
    expect(results.totalContributions).toBe(74800);
  });

  it('Test 10.3: Emergency Fund - High-Yield Savings', () => {
    // Save $200/month for 3 years at 4.5% APY
    const inputs: FVInputs = {
      periodicPayment: 200,
      periods: 36, // 3 years × 12 months
      interestRate: 4.5,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
    };

    const results = calculateFVResults(inputs);

    // Total saved = $7,200
    expect(results.totalPayments).toBe(7200);

    // With interest
    expectCloseTo(results.totalFutureValue, 7693.22, 2);
    expectCloseTo(results.totalInterest, 493.22, 2);
  });

  it('Test 10.4: Down Payment Savings with Raises', () => {
    // Save for house down payment: $500/month growing at 5% annually
    // Over 5 years at 5% interest
    const inputs: FVInputs = {
      periodicPayment: 500,
      periods: 60, // 5 years × 12 months
      interestRate: 5,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
      growthRate: 5,
    };

    const results = calculateFVResults(inputs);

    expect(results.isGrowingAnnuity).toBe(true);

    // Should be more than flat $500/month
    const flatInputs: FVInputs = {
      ...inputs,
      growthRate: 0,
    };
    const flatResults = calculateFVResults(flatInputs);

    expect(results.totalFutureValue).toBeGreaterThan(
      flatResults.totalFutureValue
    );
  });

  it('Test 10.5: Inheritance Investment', () => {
    // Receive $100,000 inheritance, invest for 25 years at 8% return
    const inputs: FVInputs = {
      presentValue: 100000,
      periods: 25,
      interestRate: 8,
      paymentFrequency: 'annual',
    };

    const results = calculateFVResults(inputs);

    // Should grow to over $600,000
    expectCloseTo(results.totalFutureValue, 684847.54, 1);

    // Interest earned
    expectCloseTo(results.totalInterest, 584847.54, 1);

    // Compound factor
    expectCloseTo(results.compoundFactor, 6.848, 0.001);
  });

  it('Test 10.6: Business Expansion Fund', () => {
    // Start with $25,000, save $1,000/quarter for 10 years at 6.5% return
    const inputs: FVInputs = {
      presentValue: 25000,
      periodicPayment: 1000,
      periods: 40, // 10 years × 4 quarters
      interestRate: 6.5,
      paymentTiming: 'end',
      paymentFrequency: 'quarterly',
    };

    const results = calculateFVResults(inputs);

    expectCloseTo(results.totalFutureValue, 103365.66, 100);

    // Total contributions = 25,000 + 40,000 = $65,000
    expect(results.totalContributions).toBe(65000);
  });
});

describe('Future Value Calculator - Test Group 11: Mathematical Properties', () => {
  it('Test 11.1: Doubling time rule of 72', () => {
    // Rule of 72: Years to double ≈ 72 / interest rate
    // At 8%, should double in approximately 9 years
    const result = calculateFVOfLumpSum(1000, 0.08, 9);

    // Should be close to $2,000
    expectCloseTo(result.futureValue, 1999.0, 1);
  });

  it('Test 11.2: FV / (1+r)^n should equal PV', () => {
    const pv = 10000;
    const rate = 0.06;
    const periods = 10;

    const result = calculateFVOfLumpSum(pv, rate, periods);

    // If we discount the FV back, we should get PV
    const backToPV = result.futureValue / Math.pow(1 + rate, periods);
    expectCloseTo(backToPV, pv, 0.01);
  });

  it('Test 11.3: Longer periods mean higher FV', () => {
    const pv = 10000;
    const rate = 0.08;

    const result5 = calculateFVOfLumpSum(pv, rate, 5);
    const result10 = calculateFVOfLumpSum(pv, rate, 10);
    const result20 = calculateFVOfLumpSum(pv, rate, 20);

    // More periods should result in higher FV
    expect(result10.futureValue).toBeGreaterThan(result5.futureValue);
    expect(result20.futureValue).toBeGreaterThan(result10.futureValue);
  });

  it('Test 11.4: Higher rate means higher FV', () => {
    const pv = 10000;
    const periods = 10;

    const result5pct = calculateFVOfLumpSum(pv, 0.05, periods);
    const result10pct = calculateFVOfLumpSum(pv, 0.1, periods);

    expect(result10pct.futureValue).toBeGreaterThan(result5pct.futureValue);
  });

  it('Test 11.5: Compound interest grows exponentially', () => {
    const pv = 1000;
    const rate = 0.1;

    // Calculate FV for different periods
    const results = [5, 10, 15, 20, 25].map((periods) =>
      calculateFVOfLumpSum(pv, rate, periods)
    );

    // Growth should accelerate (not linear)
    const growth1 = results[1].futureValue - results[0].futureValue;
    const growth2 = results[4].futureValue - results[3].futureValue;

    expect(growth2).toBeGreaterThan(growth1 * 2);
  });
});
