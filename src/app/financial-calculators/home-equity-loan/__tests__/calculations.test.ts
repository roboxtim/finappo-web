/**
 * Home Equity Loan Calculator Test Suite
 * Tests based on calculator.net/home-equity-loan-calculator.html
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateLoanDetails,
  calculateAmortizationSchedule,
  calculateLTV,
  calculateCLTV,
  calculateMaxBorrowable,
  calculateAvailableEquity,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';

describe('Home Equity Loan Calculations', () => {
  describe('Monthly Payment Calculation', () => {
    it('should calculate monthly payment for $100,000 at 7.5% for 10 years', () => {
      const payment = calculateMonthlyPayment(100000, 7.5, 10);
      expect(payment).toBeCloseTo(1187.02, 2);
    });

    it('should calculate monthly payment for $50,000 at 6% for 15 years', () => {
      const payment = calculateMonthlyPayment(50000, 6, 15);
      expect(payment).toBeCloseTo(421.93, 2);
    });

    it('should calculate monthly payment for $150,000 at 8% for 20 years', () => {
      const payment = calculateMonthlyPayment(150000, 8, 20);
      expect(payment).toBeCloseTo(1254.66, 2);
    });

    it('should handle 0% interest rate', () => {
      const payment = calculateMonthlyPayment(100000, 0, 10);
      expect(payment).toBeCloseTo(833.33, 2); // 100000 / 120 months
    });

    it('should calculate monthly payment for $75,000 at 5.5% for 5 years', () => {
      const payment = calculateMonthlyPayment(75000, 5.5, 5);
      expect(payment).toBeCloseTo(1432.59, 2);
    });
  });

  describe('Loan Details Calculation', () => {
    it('should calculate total payment and interest for $100,000 at 7.5% for 10 years', () => {
      const details = calculateLoanDetails(100000, 7.5, 10);
      expect(details.monthlyPayment).toBeCloseTo(1187.02, 2);
      expect(details.totalPayment).toBeCloseTo(142442.12, 2); // 1187.02 * 120
      expect(details.totalInterest).toBeCloseTo(42442.12, 2);
    });

    it('should calculate total payment and interest for $50,000 at 6% for 15 years', () => {
      const details = calculateLoanDetails(50000, 6, 15);
      expect(details.monthlyPayment).toBeCloseTo(421.93, 2);
      expect(details.totalPayment).toBeCloseTo(75947.11, 2); // 421.93 * 180
      expect(details.totalInterest).toBeCloseTo(25947.11, 2);
    });

    it('should handle edge case of 1 year term', () => {
      const details = calculateLoanDetails(10000, 5, 1);
      expect(details.monthlyPayment).toBeCloseTo(856.07, 2);
      expect(details.totalPayment).toBeCloseTo(10272.90, 2); // 856.07 * 12
      expect(details.totalInterest).toBeCloseTo(272.90, 2);
    });
  });

  describe('Amortization Schedule', () => {
    it('should generate correct amortization for first 3 months of $100,000 at 7.5% for 10 years', () => {
      const schedule = calculateAmortizationSchedule(100000, 7.5, 10);

      // Month 1
      expect(schedule[0].month).toBe(1);
      expect(schedule[0].payment).toBeCloseTo(1187.02, 2);
      expect(schedule[0].interest).toBeCloseTo(625.00, 2);
      expect(schedule[0].principal).toBeCloseTo(562.02, 2);
      expect(schedule[0].balance).toBeCloseTo(99437.98, 2);

      // Month 2
      expect(schedule[1].month).toBe(2);
      expect(schedule[1].interest).toBeCloseTo(621.49, 2);
      expect(schedule[1].principal).toBeCloseTo(565.53, 2);
      expect(schedule[1].balance).toBeCloseTo(98872.45, 2);

      // Month 3
      expect(schedule[2].month).toBe(3);
      expect(schedule[2].interest).toBeCloseTo(617.95, 2);
      expect(schedule[2].principal).toBeCloseTo(569.06, 2);
      expect(schedule[2].balance).toBeCloseTo(98303.39, 2);
    });

    it('should have zero balance at the end of term', () => {
      const schedule = calculateAmortizationSchedule(50000, 6, 15);
      const lastMonth = schedule[schedule.length - 1];
      expect(lastMonth.balance).toBeCloseTo(0, 2);
    });

    it('should have 120 payments for 10-year term', () => {
      const schedule = calculateAmortizationSchedule(100000, 7.5, 10);
      expect(schedule.length).toBe(120);
    });
  });

  describe('LTV and CLTV Calculations', () => {
    it('should calculate LTV ratio correctly', () => {
      const ltv = calculateLTV(200000, 500000);
      expect(ltv).toBe(40);
    });

    it('should calculate CLTV with new loan', () => {
      const cltv = calculateCLTV(200000, 100000, 500000);
      expect(cltv).toBe(60); // (200000 + 100000) / 500000 * 100
    });

    it('should handle zero mortgage balance', () => {
      const ltv = calculateLTV(0, 300000);
      expect(ltv).toBe(0);
    });

    it('should calculate CLTV at maximum 80%', () => {
      const cltv = calculateCLTV(200000, 200000, 500000);
      expect(cltv).toBe(80);
    });
  });

  describe('Maximum Borrowable Amount', () => {
    it('should calculate max borrowable with 80% LTV limit', () => {
      const maxBorrow = calculateMaxBorrowable(500000, 200000, 80);
      expect(maxBorrow).toBe(200000); // (500000 * 0.8) - 200000
    });

    it('should return 0 if already at max LTV', () => {
      const maxBorrow = calculateMaxBorrowable(500000, 400000, 80);
      expect(maxBorrow).toBe(0);
    });

    it('should handle 90% LTV limit', () => {
      const maxBorrow = calculateMaxBorrowable(400000, 100000, 90);
      expect(maxBorrow).toBe(260000); // (400000 * 0.9) - 100000
    });

    it('should return 0 for negative available amount', () => {
      const maxBorrow = calculateMaxBorrowable(300000, 250000, 80);
      expect(maxBorrow).toBe(0); // (300000 * 0.8) = 240000, which is less than 250000
    });
  });

  describe('Available Equity', () => {
    it('should calculate available equity', () => {
      const equity = calculateAvailableEquity(500000, 200000);
      expect(equity).toBe(300000);
    });

    it('should handle no mortgage balance', () => {
      const equity = calculateAvailableEquity(400000, 0);
      expect(equity).toBe(400000);
    });

    it('should handle underwater mortgage', () => {
      const equity = calculateAvailableEquity(200000, 250000);
      expect(equity).toBe(-50000);
    });
  });

  describe('Formatting Functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format percentage correctly', () => {
      expect(formatPercentage(45.5)).toBe('45.50%');
      expect(formatPercentage(100)).toBe('100.00%');
      expect(formatPercentage(0)).toBe('0.00%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small loan amounts', () => {
      const payment = calculateMonthlyPayment(1000, 5, 1);
      expect(payment).toBeCloseTo(85.61, 2);
    });

    it('should handle very high interest rates', () => {
      const payment = calculateMonthlyPayment(10000, 25, 5);
      expect(payment).toBeCloseTo(293.51, 2);
    });

    it('should handle very long terms', () => {
      const payment = calculateMonthlyPayment(200000, 6, 30);
      expect(payment).toBeCloseTo(1199.10, 2);
    });
  });
});