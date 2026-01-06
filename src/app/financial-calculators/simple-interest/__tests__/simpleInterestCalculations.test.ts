/**
 * Simple Interest Calculator Tests
 *
 * Tests based on reference: https://www.calculator.net/simple-interest-calculator.html
 *
 * Simple Interest Formula: I = P × r × t
 * Where:
 * - I = Interest
 * - P = Principal amount
 * - r = Annual interest rate (as decimal)
 * - t = Time in years
 *
 * End Balance = Principal + Total Interest
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSimpleInterest,
  type SimpleInterestInputs,
} from '../simpleInterestCalculations';

describe('Simple Interest Calculator', () => {
  describe('Basic Calculations', () => {
    it('Test 1: $10,000 at 5% for 5 years', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 5,
        years: 5,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 10000 × 0.05 × 5 = 2500
      expect(results.totalInterest).toBeCloseTo(2500, 2);
      expect(results.endBalance).toBeCloseTo(12500, 2);
      expect(results.principal).toBe(10000);
    });

    it('Test 2: $20,000 at 3% for 10 years (Reference Example)', () => {
      const inputs: SimpleInterestInputs = {
        principal: 20000,
        interestRate: 3,
        years: 10,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 20000 × 0.03 × 10 = 6000
      expect(results.totalInterest).toBeCloseTo(6000, 2);
      expect(results.endBalance).toBeCloseTo(26000, 2);
      expect(results.principal).toBe(20000);
    });

    it('Test 3: $50,000 at 4.5% for 3 years', () => {
      const inputs: SimpleInterestInputs = {
        principal: 50000,
        interestRate: 4.5,
        years: 3,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 50000 × 0.045 × 3 = 6750
      expect(results.totalInterest).toBeCloseTo(6750, 2);
      expect(results.endBalance).toBeCloseTo(56750, 2);
      expect(results.principal).toBe(50000);
    });

    it('Test 4: $100,000 at 6.25% for 7 years', () => {
      const inputs: SimpleInterestInputs = {
        principal: 100000,
        interestRate: 6.25,
        years: 7,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 100000 × 0.0625 × 7 = 43750
      expect(results.totalInterest).toBeCloseTo(43750, 2);
      expect(results.endBalance).toBeCloseTo(143750, 2);
      expect(results.principal).toBe(100000);
    });

    it('Test 5: $5,000 at 2.5% for 2 years', () => {
      const inputs: SimpleInterestInputs = {
        principal: 5000,
        interestRate: 2.5,
        years: 2,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 5000 × 0.025 × 2 = 250
      expect(results.totalInterest).toBeCloseTo(250, 2);
      expect(results.endBalance).toBeCloseTo(5250, 2);
      expect(results.principal).toBe(5000);
    });
  });

  describe('Calculations with Months', () => {
    it('Test 6: $10,000 at 5% for 6 months', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 5,
        years: 0,
        months: 6,
      };

      const results = calculateSimpleInterest(inputs);

      // t = 6/12 = 0.5 years
      // I = 10000 × 0.05 × 0.5 = 250
      expect(results.totalInterest).toBeCloseTo(250, 2);
      expect(results.endBalance).toBeCloseTo(10250, 2);
      expect(results.totalTimeInYears).toBeCloseTo(0.5, 2);
    });

    it('Test 7: $15,000 at 4% for 2 years 3 months', () => {
      const inputs: SimpleInterestInputs = {
        principal: 15000,
        interestRate: 4,
        years: 2,
        months: 3,
      };

      const results = calculateSimpleInterest(inputs);

      // t = 2 + 3/12 = 2.25 years
      // I = 15000 × 0.04 × 2.25 = 1350
      expect(results.totalInterest).toBeCloseTo(1350, 2);
      expect(results.endBalance).toBeCloseTo(16350, 2);
      expect(results.totalTimeInYears).toBeCloseTo(2.25, 2);
    });

    it('Test 8: $25,000 at 3.5% for 18 months', () => {
      const inputs: SimpleInterestInputs = {
        principal: 25000,
        interestRate: 3.5,
        years: 0,
        months: 18,
      };

      const results = calculateSimpleInterest(inputs);

      // t = 18/12 = 1.5 years
      // I = 25000 × 0.035 × 1.5 = 1312.50
      expect(results.totalInterest).toBeCloseTo(1312.5, 2);
      expect(results.endBalance).toBeCloseTo(26312.5, 2);
      expect(results.totalTimeInYears).toBeCloseTo(1.5, 2);
    });

    it('Test 9: $8,000 at 7% for 5 years 9 months', () => {
      const inputs: SimpleInterestInputs = {
        principal: 8000,
        interestRate: 7,
        years: 5,
        months: 9,
      };

      const results = calculateSimpleInterest(inputs);

      // t = 5 + 9/12 = 5.75 years
      // I = 8000 × 0.07 × 5.75 = 3220
      expect(results.totalInterest).toBeCloseTo(3220, 2);
      expect(results.endBalance).toBeCloseTo(11220, 2);
      expect(results.totalTimeInYears).toBeCloseTo(5.75, 2);
    });
  });

  describe('Edge Cases', () => {
    it('Test 10: Zero interest rate', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 0,
        years: 5,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 10000 × 0 × 5 = 0
      expect(results.totalInterest).toBe(0);
      expect(results.endBalance).toBe(10000);
    });

    it('Test 11: Zero time period', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 5,
        years: 0,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 10000 × 0.05 × 0 = 0
      expect(results.totalInterest).toBe(0);
      expect(results.endBalance).toBe(10000);
      expect(results.totalTimeInYears).toBe(0);
    });

    it('Test 12: Very high interest rate', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 25,
        years: 4,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 10000 × 0.25 × 4 = 10000
      expect(results.totalInterest).toBeCloseTo(10000, 2);
      expect(results.endBalance).toBeCloseTo(20000, 2);
    });

    it('Test 13: Large principal amount', () => {
      const inputs: SimpleInterestInputs = {
        principal: 1000000,
        interestRate: 3.75,
        years: 10,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // I = 1000000 × 0.0375 × 10 = 375000
      expect(results.totalInterest).toBeCloseTo(375000, 2);
      expect(results.endBalance).toBeCloseTo(1375000, 2);
    });

    it('Test 14: Small principal amount with decimal', () => {
      const inputs: SimpleInterestInputs = {
        principal: 500.5,
        interestRate: 4.25,
        years: 1,
        months: 6,
      };

      const results = calculateSimpleInterest(inputs);

      // t = 1.5 years
      // I = 500.50 × 0.0425 × 1.5 = 31.906875
      expect(results.totalInterest).toBeCloseTo(31.91, 2);
      expect(results.endBalance).toBeCloseTo(532.41, 2);
      expect(results.totalTimeInYears).toBeCloseTo(1.5, 2);
    });
  });

  describe('Yearly Schedule Generation', () => {
    it('Test 15: Generates correct yearly schedule for 5 years', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 5,
        years: 5,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      expect(results.schedule).toHaveLength(5);

      // Year 1: Interest = 10000 × 0.05 × 1 = 500, Balance = 10500
      expect(results.schedule[0].year).toBe(1);
      expect(results.schedule[0].interestEarned).toBeCloseTo(500, 2);
      expect(results.schedule[0].endBalance).toBeCloseTo(10500, 2);

      // Year 2: Interest = 10000 × 0.05 × 1 = 500, Balance = 11000
      expect(results.schedule[1].year).toBe(2);
      expect(results.schedule[1].interestEarned).toBeCloseTo(500, 2);
      expect(results.schedule[1].endBalance).toBeCloseTo(11000, 2);

      // Year 5: Interest = 10000 × 0.05 × 1 = 500, Balance = 12500
      expect(results.schedule[4].year).toBe(5);
      expect(results.schedule[4].interestEarned).toBeCloseTo(500, 2);
      expect(results.schedule[4].endBalance).toBeCloseTo(12500, 2);
    });

    it('Test 16: Handles partial year correctly in schedule', () => {
      const inputs: SimpleInterestInputs = {
        principal: 10000,
        interestRate: 6,
        years: 2,
        months: 6,
      };

      const results = calculateSimpleInterest(inputs);

      expect(results.schedule).toHaveLength(3); // 2 full years + 1 partial year

      // Year 1: Interest = 10000 × 0.06 × 1 = 600
      expect(results.schedule[0].interestEarned).toBeCloseTo(600, 2);
      expect(results.schedule[0].endBalance).toBeCloseTo(10600, 2);

      // Year 2: Interest = 10000 × 0.06 × 1 = 600
      expect(results.schedule[1].interestEarned).toBeCloseTo(600, 2);
      expect(results.schedule[1].endBalance).toBeCloseTo(11200, 2);

      // Year 3 (partial): Interest = 10000 × 0.06 × 0.5 = 300
      expect(results.schedule[2].year).toBe(3);
      expect(results.schedule[2].interestEarned).toBeCloseTo(300, 2);
      expect(results.schedule[2].endBalance).toBeCloseTo(11500, 2);
    });
  });

  describe('Interest Percentage Calculation', () => {
    it('Test 17: Calculates correct interest percentage', () => {
      const inputs: SimpleInterestInputs = {
        principal: 20000,
        interestRate: 3,
        years: 10,
        months: 0,
      };

      const results = calculateSimpleInterest(inputs);

      // Total Interest = 6000, Principal = 20000
      // Interest percentage = (6000 / 26000) × 100 = 23.08%
      // Principal percentage = (20000 / 26000) × 100 = 76.92%
      expect(results.interestPercentage).toBeCloseTo(23.08, 1);
      expect(results.principalPercentage).toBeCloseTo(76.92, 1);
    });
  });
});
