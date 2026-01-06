/**
 * Bond Calculator Tests
 *
 * These tests validate bond pricing and yield calculations against known values.
 * Test cases are designed to cover various scenarios including:
 * - Different coupon frequencies (annual, semi-annual, quarterly, monthly)
 * - Premium bonds (price > face value, YTM < coupon rate)
 * - Discount bonds (price < face value, YTM > coupon rate)
 * - Par bonds (price = face value, YTM = coupon rate)
 * - Zero coupon bonds
 * - Edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBondPrice,
  calculateYieldToMaturity,
  validateBondInputs,
  type BondInputs,
} from './bondCalculations';

describe('Bond Price Calculations', () => {
  it('Test 1: Semi-annual bond at discount (YTM > Coupon)', () => {
    // $1,000 face value, 5% coupon, 10 years, 6% YTM, semi-annual
    // Expected: Bond trades at discount
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 6,
      couponFrequency: 2, // semi-annual
    };

    const result = calculateBondPrice(inputs);

    // Bond should trade at discount since YTM > coupon rate
    expect(result.price).toBeLessThan(1000);
    expect(result.price).toBeCloseTo(925.61, 1); // Expected ~$925.61
    expect(result.couponPayment).toBe(25); // $1000 * 5% / 2
    expect(result.numberOfPayments).toBe(20); // 10 years * 2
    expect(result.totalCouponPayments).toBe(500); // $25 * 20
    expect(result.annualCouponAmount).toBe(50);
  });

  it('Test 2: Annual bond at premium (YTM < Coupon)', () => {
    // $1,000 face value, 8% coupon, 5 years, 6% YTM, annual
    // Expected: Bond trades at premium
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 8,
      yearsToMaturity: 5,
      yieldToMaturity: 6,
      couponFrequency: 1, // annual
    };

    const result = calculateBondPrice(inputs);

    // Bond should trade at premium since YTM < coupon rate
    expect(result.price).toBeGreaterThan(1000);
    expect(result.price).toBeCloseTo(1084.25, 1); // Expected ~$1,084.25
    expect(result.couponPayment).toBe(80); // $1000 * 8%
    expect(result.numberOfPayments).toBe(5); // 5 years * 1
    expect(result.totalCouponPayments).toBe(400);
  });

  it('Test 3: Quarterly bond at discount', () => {
    // $1,000 face value, 3% coupon, 20 years, 4% YTM, quarterly
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 3,
      yearsToMaturity: 20,
      yieldToMaturity: 4,
      couponFrequency: 4, // quarterly
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeLessThan(1000);
    expect(result.price).toBeCloseTo(862.78, 1); // Expected ~$862.78
    expect(result.couponPayment).toBe(7.5); // $1000 * 3% / 4
    expect(result.numberOfPayments).toBe(80); // 20 years * 4
  });

  it('Test 4: Monthly bond at premium (smaller face value)', () => {
    // $500 face value, 6% coupon, 7 years, 5% YTM, monthly
    const inputs: BondInputs = {
      faceValue: 500,
      couponRate: 6,
      yearsToMaturity: 7,
      yieldToMaturity: 5,
      couponFrequency: 12, // monthly
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeGreaterThan(500);
    expect(result.price).toBeCloseTo(529.48, 1); // Expected ~$529.48
    expect(result.couponPayment).toBe(2.5); // $500 * 6% / 12
    expect(result.numberOfPayments).toBe(84); // 7 years * 12
  });

  it('Test 5: Large bond at discount (semi-annual)', () => {
    // $10,000 face value, 4.5% coupon, 15 years, 5.5% YTM, semi-annual
    const inputs: BondInputs = {
      faceValue: 10000,
      couponRate: 4.5,
      yearsToMaturity: 15,
      yieldToMaturity: 5.5,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeLessThan(10000);
    expect(result.price).toBeCloseTo(8987.53, 1); // Expected ~$8,987.53
    expect(result.couponPayment).toBe(225); // $10000 * 4.5% / 2
    expect(result.numberOfPayments).toBe(30); // 15 years * 2
  });

  it('Test 6: Par bond (YTM = Coupon Rate)', () => {
    // When YTM equals coupon rate, price should equal face value
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 5,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeCloseTo(1000, 0.5);
    expect(result.currentYield).toBeCloseTo(5, 0.1);
  });

  it('Test 7: Zero coupon bond', () => {
    // Bond with 0% coupon rate
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 0,
      yearsToMaturity: 10,
      yieldToMaturity: 6,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    // Price should be present value of face value only
    expect(result.price).toBeCloseTo(553.68, 1);
    expect(result.couponPayment).toBe(0);
    expect(result.totalCouponPayments).toBe(0);
  });

  it('Test 8: Zero yield bond', () => {
    // Bond with 0% yield
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 0,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    // Price = all cash flows undiscounted
    expect(result.price).toBe(1500); // $1000 face + $500 coupons
  });

  it('Test 9: Short-term bond (1 year)', () => {
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 4,
      yearsToMaturity: 1,
      yieldToMaturity: 3.5,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeCloseTo(1004.88, 1);
    expect(result.numberOfPayments).toBe(2);
  });

  it('Test 10: Long-term bond (30 years)', () => {
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 7,
      yearsToMaturity: 30,
      yieldToMaturity: 8,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeCloseTo(886.88, 1);
    expect(result.numberOfPayments).toBe(60);
  });

  it('Test 11: Current yield calculation', () => {
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 6,
      yearsToMaturity: 10,
      yieldToMaturity: 7,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    // Current yield = Annual coupon / Price * 100
    const expectedCurrentYield = (60 / result.price) * 100;
    expect(result.currentYield).toBeCloseTo(expectedCurrentYield, 2);
    expect(result.annualCouponAmount).toBe(60);
  });
});

describe('Yield to Maturity Calculations', () => {
  it('Test 12: Calculate YTM from discount bond price', () => {
    // If bond is priced at $925.61, YTM should be ~6%
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 0, // This will be calculated
      couponFrequency: 2,
      price: 925.61,
    };

    const ytm = calculateYieldToMaturity(inputs);

    expect(ytm).toBeCloseTo(6, 0.1);
  });

  it('Test 13: Calculate YTM from premium bond price', () => {
    // If bond is priced at $1,084.25, YTM should be ~6%
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 8,
      yearsToMaturity: 5,
      yieldToMaturity: 0,
      couponFrequency: 1,
      price: 1084.25,
    };

    const ytm = calculateYieldToMaturity(inputs);

    expect(ytm).toBeCloseTo(6, 0.1);
  });

  it('Test 14: Calculate YTM from par bond', () => {
    // At par, YTM should equal coupon rate
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 0,
      couponFrequency: 2,
      price: 1000,
    };

    const ytm = calculateYieldToMaturity(inputs);

    expect(ytm).toBeCloseTo(5, 0.1);
  });
});

describe('Input Validation', () => {
  it('Test 15: Validates face value', () => {
    const errors = validateBondInputs({
      faceValue: 0,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 6,
      couponFrequency: 2,
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('Face value'))).toBe(true);
  });

  it('Test 16: Validates negative coupon rate', () => {
    const errors = validateBondInputs({
      faceValue: 1000,
      couponRate: -1,
      yearsToMaturity: 10,
      yieldToMaturity: 6,
      couponFrequency: 2,
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('Coupon rate'))).toBe(true);
  });

  it('Test 17: Validates years to maturity', () => {
    const errors = validateBondInputs({
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 0,
      yieldToMaturity: 6,
      couponFrequency: 2,
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.includes('Years to maturity'))).toBe(true);
  });

  it('Test 18: Valid inputs return no errors', () => {
    const errors = validateBondInputs({
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 6,
      couponFrequency: 2,
    });

    expect(errors.length).toBe(0);
  });
});

describe('Edge Cases', () => {
  it('Test 19: Very high YTM', () => {
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 10,
      yieldToMaturity: 25,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeGreaterThan(0);
    expect(result.price).toBeLessThan(500);
  });

  it('Test 20: Very long maturity', () => {
    const inputs: BondInputs = {
      faceValue: 1000,
      couponRate: 5,
      yearsToMaturity: 50,
      yieldToMaturity: 6,
      couponFrequency: 2,
    };

    const result = calculateBondPrice(inputs);

    expect(result.price).toBeGreaterThan(0);
    expect(result.numberOfPayments).toBe(100);
  });
});
