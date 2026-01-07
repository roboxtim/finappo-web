/**
 * Present Value Calculator - Comprehensive Test Suite
 *
 * Tests all calculation scenarios including:
 * - PV of lump sum
 * - PV of ordinary annuity
 * - PV of annuity due
 * - PV of growing annuity
 * - Combined calculations
 * - Different payment frequencies
 * - Edge cases and validation
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePVResults,
  validatePVInputs,
  calculatePVOfLumpSum,
  calculatePVOfOrdinaryAnnuity,
  calculatePVOfAnnuityDue,
  calculatePVOfGrowingAnnuity,
  getPeriodicRate,
  getPeriodsPerYear,
  calculateEffectiveAnnualRate,
  type PVInputs,
} from './pvCalculations';

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

describe('Present Value Calculator - Utility Functions', () => {
  describe('getPeriodicRate', () => {
    it('should convert annual rate correctly for different frequencies', () => {
      expect(getPeriodicRate(12, 'annual')).toBeCloseTo(0.12);
      expect(getPeriodicRate(12, 'semi-annual')).toBeCloseTo(0.06);
      expect(getPeriodicRate(12, 'quarterly')).toBeCloseTo(0.03);
      expect(getPeriodicRate(12, 'monthly')).toBeCloseTo(0.01);
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
      // Monthly compounding at 12% annual
      const monthlyRate = 0.01; // 1% per month
      const ear = calculateEffectiveAnnualRate(monthlyRate, 12);
      expectCloseTo(ear, 12.68, 0.01); // (1.01)^12 - 1 = 12.68%
    });
  });
});

describe('Present Value Calculator - Test Group 1: PV of Lump Sum', () => {
  it('Test 1.1: Basic Lump Sum PV', () => {
    // FV = $10,000, n = 5, r = 6%
    // PV = 10000 / (1.06)^5 = $7,472.58
    const result = calculatePVOfLumpSum(10000, 0.06, 5);

    expectCloseTo(result.presentValue, 7472.58, 0.01);
    expectCloseTo(result.discountFactor, 0.747258, 0.000001);
    expectCloseTo(result.discountAmount, 2527.42, 0.01);
    expectCloseTo(result.discountPercentage, 25.27, 0.01);
  });

  it('Test 1.2: High Interest Rate Lump Sum', () => {
    // FV = $50,000, n = 10, r = 12%
    // PV = 50000 / (1.12)^10 = $16,098.66
    const result = calculatePVOfLumpSum(50000, 0.12, 10);

    expectCloseTo(result.presentValue, 16098.66, 0.01);
    expectCloseTo(result.discountFactor, 0.321973, 0.000001);
    expectCloseTo(result.discountPercentage, 67.8, 0.01);
  });

  it('Test 1.3: Zero Interest Rate', () => {
    // FV = $10,000, n = 5, r = 0%
    // PV should equal FV when rate is 0
    const result = calculatePVOfLumpSum(10000, 0, 5);

    expect(result.presentValue).toBe(10000);
    expect(result.discountAmount).toBe(0);
    expect(result.discountPercentage).toBe(0);
  });
});

describe('Present Value Calculator - Test Group 2: PV of Ordinary Annuity', () => {
  it('Test 2.1: Basic Ordinary Annuity', () => {
    // PMT = $1,000, n = 10, r = 5%
    // PV = 1000 × [(1 - (1.05)^-10) / 0.05] = $7,721.73
    const pv = calculatePVOfOrdinaryAnnuity(1000, 0.05, 10);

    expectCloseTo(pv, 7721.73, 0.01);
  });

  it('Test 2.2: High Rate Ordinary Annuity', () => {
    // PMT = $500, n = 20, r = 8%
    // PV = 500 × [(1 - (1.08)^-20) / 0.08] = $4,909.07
    const pv = calculatePVOfOrdinaryAnnuity(500, 0.08, 20);

    expectCloseTo(pv, 4909.07, 0.01);
  });

  it('Test 2.3: Zero Rate Annuity', () => {
    // PMT = $1,000, n = 10, r = 0%
    // PV = 1000 × 10 = $10,000
    const pv = calculatePVOfOrdinaryAnnuity(1000, 0, 10);

    expect(pv).toBe(10000);
  });
});

describe('Present Value Calculator - Test Group 3: PV of Annuity Due', () => {
  it('Test 3.1: Basic Annuity Due', () => {
    // PMT = $1,000, n = 10, r = 5%
    // PV_ordinary = $7,721.73
    // PV_due = 7,721.73 × 1.05 = $8,107.82
    const pv = calculatePVOfAnnuityDue(1000, 0.05, 10);

    expectCloseTo(pv, 8107.82, 0.01);
  });

  it('Test 3.2: Annuity Due with Higher Rate', () => {
    // PMT = $2,000, n = 5, r = 10%
    // PV_ordinary = 2000 × [(1 - (1.10)^-5) / 0.10] = $7,581.57
    // PV_due = 7,581.57 × 1.10 = $8,339.73
    const pv = calculatePVOfAnnuityDue(2000, 0.1, 5);

    expectCloseTo(pv, 8339.73, 0.01);
  });

  it('Test 3.3: Verify difference between ordinary and due', () => {
    const payment = 1000;
    const rate = 0.06;
    const periods = 8;

    const pvOrdinary = calculatePVOfOrdinaryAnnuity(payment, rate, periods);
    const pvDue = calculatePVOfAnnuityDue(payment, rate, periods);

    // Due should be ordinary × (1 + rate)
    expectCloseTo(pvDue, pvOrdinary * (1 + rate), 0.01);
    // Due should be higher than ordinary
    expect(pvDue).toBeGreaterThan(pvOrdinary);
  });
});

describe('Present Value Calculator - Test Group 4: PV of Growing Annuity', () => {
  it('Test 4.1: Basic Growing Annuity', () => {
    // PMT = $1,000, n = 10, r = 8%, g = 3%
    // PV = 1000 × [(1 - (1.03/1.08)^10) / (0.08 - 0.03)] = $7,550.13
    const pv = calculatePVOfGrowingAnnuity(1000, 0.08, 0.03, 10, 'end');

    expectCloseTo(pv, 7550.13, 1); // Slightly more tolerance for growing annuity
  });

  it('Test 4.2: High Growth Rate', () => {
    // PMT = $500, n = 15, r = 10%, g = 5%
    // PV = 500 × [(1 - (1.05/1.10)^15) / (0.10 - 0.05)] = $5,023.21
    const pv = calculatePVOfGrowingAnnuity(500, 0.1, 0.05, 15, 'end');

    expectCloseTo(pv, 5023.21, 1);
  });

  it('Test 4.3: Growth Rate Equals Interest Rate (Special Case)', () => {
    // PMT = $1,000, n = 10, r = 6%, g = 6%
    // Special formula: PV = PMT × n / (1 + r) = 1000 × 10 / 1.06 = $9,433.96
    const pv = calculatePVOfGrowingAnnuity(1000, 0.06, 0.06, 10, 'end');

    expectCloseTo(pv, 9433.96, 0.01);
  });

  it('Test 4.4: Zero Growth Rate (Should match regular annuity)', () => {
    // PMT = $1,000, n = 10, r = 5%, g = 0%
    // Should equal ordinary annuity
    const pvGrowing = calculatePVOfGrowingAnnuity(1000, 0.05, 0, 10, 'end');
    const pvOrdinary = calculatePVOfOrdinaryAnnuity(1000, 0.05, 10);

    expectCloseTo(pvGrowing, pvOrdinary, 0.01);
  });

  it('Test 4.5: Growing Annuity Due', () => {
    // Test growing annuity with beginning of period payments
    const pvEnd = calculatePVOfGrowingAnnuity(1000, 0.08, 0.03, 10, 'end');
    const pvBeginning = calculatePVOfGrowingAnnuity(
      1000,
      0.08,
      0.03,
      10,
      'beginning'
    );

    // Beginning should be higher than end
    expect(pvBeginning).toBeGreaterThan(pvEnd);
    // Beginning should be approximately end × (1 + rate)
    expectCloseTo(pvBeginning, pvEnd * 1.08, 1);
  });
});

describe('Present Value Calculator - Test Group 5: Combined Calculations', () => {
  it('Test 5.1: Lump Sum + Ordinary Annuity', () => {
    // FV = $5,000, PMT = $500, n = 8, r = 4%
    const inputs: PVInputs = {
      futureValue: 5000,
      periodicPayment: 500,
      periods: 8,
      interestRate: 4,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    // PV of Lump Sum: 5000 / (1.04)^8 = $3,653.45
    expectCloseTo(results.pvOfLumpSum, 3653.45, 0.01);

    // PV of Annuity: 500 × [(1 - (1.04)^-8) / 0.04] = $3,366.37
    expectCloseTo(results.pvOfAnnuity, 3366.37, 0.5);

    // Total PV = 3,653.83 + 3,366.37 = 7,020.20
    expectCloseTo(results.totalPresentValue, 7020.2, 0.5);
  });

  it('Test 5.2: Lump Sum + Annuity Due', () => {
    // FV = $10,000, PMT = $1,000, n = 5, r = 6%, timing = beginning
    const inputs: PVInputs = {
      futureValue: 10000,
      periodicPayment: 1000,
      periods: 5,
      interestRate: 6,
      paymentTiming: 'beginning',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    // PV of Lump Sum: 10000 / (1.06)^5 = $7,472.58
    expectCloseTo(results.pvOfLumpSum, 7472.58, 0.01);

    // PV of Annuity Due: should be higher than ordinary
    expect(results.pvOfAnnuity).toBeGreaterThan(4000);
    expectCloseTo(results.pvOfAnnuity, 4465.11, 0.01);

    // Total PV
    expectCloseTo(results.totalPresentValue, 11937.69, 0.01);
  });

  it('Test 5.3: Only Lump Sum (No Annuity)', () => {
    const inputs: PVInputs = {
      futureValue: 20000,
      periods: 10,
      interestRate: 7,
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    expect(results.pvOfAnnuity).toBe(0);
    expect(results.totalPresentValue).toBe(results.pvOfLumpSum);
  });

  it('Test 5.4: Only Annuity (No Lump Sum)', () => {
    const inputs: PVInputs = {
      periodicPayment: 2000,
      periods: 6,
      interestRate: 5,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    expect(results.pvOfLumpSum).toBe(0);
    expect(results.totalPresentValue).toBe(results.pvOfAnnuity);
  });
});

describe('Present Value Calculator - Test Group 6: Different Payment Frequencies', () => {
  it('Test 6.1: Monthly Payments', () => {
    // PMT = $100/month, Time = 2 years (24 months), Annual Rate = 12%
    // Monthly Rate = 1%, n = 24
    // PV = 100 × [(1 - (1.01)^-24) / 0.01] = $2,124.34
    const inputs: PVInputs = {
      periodicPayment: 100,
      periods: 24,
      interestRate: 12,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
    };

    const results = calculatePVResults(inputs);

    expectCloseTo(results.pvOfAnnuity, 2124.34, 0.01);
    expectCloseTo(results.periodicRate, 1.0, 0.01); // 1% per month
    expect(results.totalPayments).toBe(2400);
  });

  it('Test 6.2: Quarterly Payments', () => {
    // PMT = $1,000/quarter, Time = 5 years (20 quarters), Annual Rate = 8%
    // Quarterly Rate = 2%, n = 20
    // PV = 1000 × [(1 - (1.02)^-20) / 0.02] = $16,351.43
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 20,
      interestRate: 8,
      paymentTiming: 'end',
      paymentFrequency: 'quarterly',
    };

    const results = calculatePVResults(inputs);

    expectCloseTo(results.pvOfAnnuity, 16351.43, 0.01);
    expectCloseTo(results.periodicRate, 2.0, 0.01); // 2% per quarter
  });

  it('Test 6.3: Semi-Annual Payments (Annuity Due)', () => {
    // PMT = $2,500 semi-annually, Time = 10 years (20 periods), Annual Rate = 6%
    // Semi-annual Rate = 3%, n = 20
    const inputs: PVInputs = {
      periodicPayment: 2500,
      periods: 20,
      interestRate: 6,
      paymentTiming: 'beginning',
      paymentFrequency: 'semi-annual',
    };

    const results = calculatePVResults(inputs);

    expectCloseTo(results.pvOfAnnuity, 38309.5, 1);
    expectCloseTo(results.periodicRate, 3.0, 0.01); // 3% per period
  });

  it('Test 6.4: Weekly Payments', () => {
    // PMT = $50/week, Time = 52 weeks (1 year), Annual Rate = 5.2%
    // Weekly Rate = 5.2% / 52 = 0.1%
    const inputs: PVInputs = {
      periodicPayment: 50,
      periods: 52,
      interestRate: 5.2,
      paymentTiming: 'end',
      paymentFrequency: 'weekly',
    };

    const results = calculatePVResults(inputs);

    // Total payments = $2,600
    expect(results.totalPayments).toBe(2600);
    // PV should be less due to discounting
    expect(results.pvOfAnnuity).toBeLessThan(2600);
    expect(results.pvOfAnnuity).toBeGreaterThan(2500);
  });
});

describe('Present Value Calculator - Test Group 7: Edge Cases', () => {
  it('Test 7.1: Zero Payment Amount', () => {
    const inputs: PVInputs = {
      periodicPayment: 0,
      futureValue: 5000,
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    expect(results.pvOfAnnuity).toBe(0);
    expect(results.totalPresentValue).toBe(results.pvOfLumpSum);
  });

  it('Test 7.2: Single Period', () => {
    // PMT = $1,000, n = 1, r = 10%
    // PV = 1000 / 1.10 = $909.09
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 1,
      interestRate: 10,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    expectCloseTo(results.pvOfAnnuity, 909.09, 0.01);
  });

  it('Test 7.3: Very High Interest Rate (100%)', () => {
    // FV = $10,000, n = 5, r = 100%
    // PV = 10000 / (2)^5 = $312.50
    const result = calculatePVOfLumpSum(10000, 1.0, 5);

    expectCloseTo(result.presentValue, 312.5, 0.01);
  });

  it('Test 7.4: Very Long Time Period', () => {
    // PMT = $1,000, n = 100, r = 5%
    // PV should converge toward 1/r = 20,000
    const pv = calculatePVOfOrdinaryAnnuity(1000, 0.05, 100);

    expectCloseTo(pv, 19847.85, 1);
    // Should be close to but less than 20,000
    expect(pv).toBeLessThan(20000);
    expect(pv).toBeGreaterThan(19800);
  });

  it('Test 7.5: Very Small Interest Rate', () => {
    // PMT = $1,000, n = 10, r = 0.1%
    const pv = calculatePVOfOrdinaryAnnuity(1000, 0.001, 10);

    // Should be close to $10,000 (sum of payments)
    expect(pv).toBeGreaterThan(9900);
    expect(pv).toBeLessThan(10000);
  });
});

describe('Present Value Calculator - Test Group 8: Validation', () => {
  it('Test 8.1: Should accept valid inputs', () => {
    const inputs: PVInputs = {
      futureValue: 10000,
      periodicPayment: 1000,
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    expect(errors).toHaveLength(0);
  });

  it('Test 8.2: Should reject missing future value and payment', () => {
    const inputs: PVInputs = {
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('future value or periodic payment');
  });

  it('Test 8.3: Should reject negative future value', () => {
    const inputs: PVInputs = {
      futureValue: -5000,
      periods: 10,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    expect(errors.some((e) => e.includes('non-negative'))).toBe(true);
  });

  it('Test 8.4: Should reject negative interest rate', () => {
    const inputs: PVInputs = {
      futureValue: 10000,
      periods: 10,
      interestRate: -5,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    expect(errors.some((e) => e.toLowerCase().includes('interest rate'))).toBe(
      true
    );
  });

  it('Test 8.5: Should reject zero or negative periods', () => {
    const inputs: PVInputs = {
      futureValue: 10000,
      periods: 0,
      interestRate: 5,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    expect(errors.some((e) => e.includes('periods'))).toBe(true);
  });

  it('Test 8.6: Should reject growth rate exceeding interest rate', () => {
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 10,
      interestRate: 5,
      growthRate: 8,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    expect(errors.some((e) => e.includes('Growth rate'))).toBe(true);
  });

  it('Test 8.7: Should accept growth rate equal to interest rate', () => {
    // This is a special case that should be handled but not rejected
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 10,
      interestRate: 6,
      growthRate: 6,
      paymentFrequency: 'annual',
    };

    const errors = validatePVInputs(inputs);
    // Should not have growth rate error (it's handled specially)
    expect(errors.every((e) => !e.includes('Growth rate'))).toBe(true);
  });
});

describe('Present Value Calculator - Test Group 9: Results Completeness', () => {
  it('Test 9.1: Should provide complete results structure', () => {
    const inputs: PVInputs = {
      futureValue: 10000,
      periodicPayment: 1000,
      periods: 5,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    // Check all required fields exist
    expect(results.totalPresentValue).toBeDefined();
    expect(results.pvOfLumpSum).toBeDefined();
    expect(results.pvOfAnnuity).toBeDefined();
    expect(results.discountFactor).toBeDefined();
    expect(results.discountAmount).toBeDefined();
    expect(results.discountPercentage).toBeDefined();
    expect(results.periodicPayment).toBeDefined();
    expect(results.numberOfPeriods).toBeDefined();
    expect(results.totalPayments).toBeDefined();
    expect(results.annuityDiscountAmount).toBeDefined();
    expect(results.interestRate).toBeDefined();
    expect(results.periodicRate).toBeDefined();
    expect(results.effectiveAnnualRate).toBeDefined();
    expect(results.periodBreakdown).toBeDefined();
    expect(results.periodBreakdown.length).toBe(5);
  });

  it('Test 9.2: Period breakdown should be accurate', () => {
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 3,
      interestRate: 10,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    expect(results.periodBreakdown).toHaveLength(3);

    // Check first period
    expect(results.periodBreakdown[0].period).toBe(1);
    expect(results.periodBreakdown[0].payment).toBe(1000);
    expectCloseTo(results.periodBreakdown[0].presentValue, 909.09, 0.01);

    // Check cumulative PV increases
    expect(results.periodBreakdown[1].cumulativePV).toBeGreaterThan(
      results.periodBreakdown[0].cumulativePV
    );
    expect(results.periodBreakdown[2].cumulativePV).toBeGreaterThan(
      results.periodBreakdown[1].cumulativePV
    );

    // Final cumulative should equal total annuity PV
    expectCloseTo(
      results.periodBreakdown[2].cumulativePV,
      results.pvOfAnnuity,
      0.01
    );
  });

  it('Test 9.3: Growing annuity breakdown should show increasing payments', () => {
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 5,
      interestRate: 8,
      growthRate: 3,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

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

    // Second payment should be first × (1 + growth rate)
    expectCloseTo(results.periodBreakdown[1].payment, 1030, 0.01);
  });
});

describe('Present Value Calculator - Test Group 10: Real-World Scenarios', () => {
  it('Test 10.1: Retirement Planning - Lump Sum Needed Today', () => {
    // Need $1,000,000 in 30 years, assuming 7% annual return
    // What lump sum is needed today?
    const inputs: PVInputs = {
      futureValue: 1000000,
      periods: 30,
      interestRate: 7,
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    // PV = 1,000,000 / (1.07)^30 = $131,367.15
    expectCloseTo(results.totalPresentValue, 131367.15, 1);
    expect(results.discountPercentage).toBeGreaterThan(85);
  });

  it('Test 10.2: Lottery Annuity vs Lump Sum', () => {
    // Lottery: $1M/year for 20 years OR $15M lump sum today
    // Which is worth more at 5% discount rate?
    const inputs: PVInputs = {
      periodicPayment: 1000000,
      periods: 20,
      interestRate: 5,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    // PV of annuity should be around $12.46M
    expectCloseTo(results.totalPresentValue, 12462210, 10000);

    // So $15M lump sum is better!
    expect(15000000).toBeGreaterThan(results.totalPresentValue);
  });

  it('Test 10.3: Pension Value - Monthly Payments', () => {
    // Pension pays $3,000/month for 25 years
    // What's it worth today at 4% annual rate?
    const inputs: PVInputs = {
      periodicPayment: 3000,
      periods: 25 * 12, // 300 months
      interestRate: 4,
      paymentTiming: 'beginning', // Pensions typically pay at start
      paymentFrequency: 'monthly',
    };

    const results = calculatePVResults(inputs);

    // Should be substantial (over $500k)
    expect(results.totalPresentValue).toBeGreaterThan(500000);
    expect(results.totalPresentValue).toBeLessThan(900000);

    // Total payments would be $900,000
    expect(results.totalPayments).toBe(900000);
  });

  it('Test 10.4: Investment Property - Cash Flows with Appreciation', () => {
    // Property: $2,000/month rent for 10 years + $500,000 sale
    // Assuming 6% annual discount rate
    const inputs: PVInputs = {
      futureValue: 500000, // Sale price
      periodicPayment: 2000, // Monthly rent
      periods: 10 * 12, // 120 months
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'monthly',
    };

    const results = calculatePVResults(inputs);

    // PV of rents
    expect(results.pvOfAnnuity).toBeGreaterThan(180000);
    expect(results.pvOfAnnuity).toBeLessThan(240000);

    // PV of sale
    expect(results.pvOfLumpSum).toBeGreaterThan(250000);
    expect(results.pvOfLumpSum).toBeLessThan(300000);

    // Total should be substantial
    expect(results.totalPresentValue).toBeGreaterThan(450000);
  });

  it('Test 10.5: Structured Settlement with Growth', () => {
    // Structured settlement: $50,000/year growing at 2%/year for 15 years
    // Discount rate: 5%
    const inputs: PVInputs = {
      periodicPayment: 50000,
      periods: 15,
      interestRate: 5,
      growthRate: 2,
      paymentTiming: 'beginning',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    expect(results.isGrowingAnnuity).toBe(true);

    // Should be worth more than flat $50k/year annuity
    const flatAnnuityInputs: PVInputs = {
      periodicPayment: 50000,
      periods: 15,
      interestRate: 5,
      paymentTiming: 'beginning',
      paymentFrequency: 'annual',
    };
    const flatResults = calculatePVResults(flatAnnuityInputs);

    expect(results.totalPresentValue).toBeGreaterThan(
      flatResults.totalPresentValue
    );
  });
});

describe('Present Value Calculator - Test Group 11: Mathematical Properties', () => {
  it('Test 11.1: PV × (1+r)^n should approximately equal FV', () => {
    const fv = 10000;
    const rate = 0.06;
    const periods = 10;

    const result = calculatePVOfLumpSum(fv, rate, periods);

    // If we compound the PV back, we should get FV
    const backToFV = result.presentValue * Math.pow(1 + rate, periods);
    expectCloseTo(backToFV, fv, 0.01);
  });

  it('Test 11.2: Longer periods mean greater discount', () => {
    const fv = 10000;
    const rate = 0.08;

    const result5 = calculatePVOfLumpSum(fv, rate, 5);
    const result10 = calculatePVOfLumpSum(fv, rate, 10);
    const result20 = calculatePVOfLumpSum(fv, rate, 20);

    // More periods should result in lower PV (higher discount)
    expect(result10.presentValue).toBeLessThan(result5.presentValue);
    expect(result20.presentValue).toBeLessThan(result10.presentValue);

    // Discount amounts should increase with time
    expect(result10.discountAmount).toBeGreaterThan(result5.discountAmount);
    expect(result20.discountAmount).toBeGreaterThan(result10.discountAmount);
  });

  it('Test 11.3: Higher rate means lower PV', () => {
    const fv = 10000;
    const periods = 10;

    const result5pct = calculatePVOfLumpSum(fv, 0.05, periods);
    const result10pct = calculatePVOfLumpSum(fv, 0.1, periods);

    expect(result10pct.presentValue).toBeLessThan(result5pct.presentValue);
  });

  it('Test 11.4: Sum of period PVs equals total annuity PV', () => {
    const inputs: PVInputs = {
      periodicPayment: 1000,
      periods: 10,
      interestRate: 6,
      paymentTiming: 'end',
      paymentFrequency: 'annual',
    };

    const results = calculatePVResults(inputs);

    const sumOfPeriods = results.periodBreakdown.reduce(
      (sum, period) => sum + period.presentValue,
      0
    );

    expectCloseTo(sumOfPeriods, results.pvOfAnnuity, 0.01);
  });
});
