/**
 * HELOC Calculator Tests
 *
 * These tests verify the accuracy of HELOC (Home Equity Line of Credit) calculations
 * based on the reference calculator at https://www.calculator.net/heloc-calculator.html
 *
 * HELOC calculations involve two distinct periods:
 * 1. Draw Period: Interest-only payments on outstanding balance
 * 2. Repayment Period: Principal + interest amortized payments
 *
 * Test scenarios cover:
 * - Different loan amounts and interest rates
 * - Various draw and repayment period combinations
 * - Edge cases (zero interest, single period, etc.)
 * - Amortization schedule accuracy
 */

import {
  calculateHELOC,
  calculateDrawPeriodPayment,
  calculateRepaymentPeriodPayment,
  generateAmortizationSchedule,
  type HELOCInputs,
} from '../utils/calculations';

describe('HELOC Calculator', () => {
  describe('Draw Period Payment Calculation', () => {
    it('should calculate interest-only payment correctly for 8% rate on $50,000', () => {
      // Reference: $50,000 at 8% annual = $333.33/month interest only
      const monthlyPayment = calculateDrawPeriodPayment(50000, 8);
      expect(monthlyPayment).toBeCloseTo(333.33, 2);
    });

    it('should calculate interest-only payment for $100,000 at 6.5%', () => {
      // $100,000 * 6.5% / 12 = $541.67/month
      const monthlyPayment = calculateDrawPeriodPayment(100000, 6.5);
      expect(monthlyPayment).toBeCloseTo(541.67, 2);
    });

    it('should calculate interest-only payment for $75,000 at 7.25%', () => {
      // $75,000 * 7.25% / 12 = $453.125/month
      const monthlyPayment = calculateDrawPeriodPayment(75000, 7.25);
      expect(monthlyPayment).toBeCloseTo(453.13, 2);
    });

    it('should return 0 for zero interest rate', () => {
      const monthlyPayment = calculateDrawPeriodPayment(50000, 0);
      expect(monthlyPayment).toBe(0);
    });

    it('should return 0 for zero loan amount', () => {
      const monthlyPayment = calculateDrawPeriodPayment(0, 8);
      expect(monthlyPayment).toBe(0);
    });
  });

  describe('Repayment Period Payment Calculation', () => {
    it('should calculate amortized payment for $50,000 at 8% over 20 years', () => {
      // Using standard amortization formula
      // P * [r(1+r)^n] / [(1+r)^n - 1]
      // where r = 0.08/12, n = 240 months, P = $50,000
      const monthlyPayment = calculateRepaymentPeriodPayment(50000, 8, 20);
      expect(monthlyPayment).toBeCloseTo(418.22, 2);
    });

    it('should calculate amortized payment for $100,000 at 6.5% over 15 years', () => {
      // $100,000 at 6.5% for 15 years (180 months)
      const monthlyPayment = calculateRepaymentPeriodPayment(100000, 6.5, 15);
      expect(monthlyPayment).toBeCloseTo(871.11, 2);
    });

    it('should calculate amortized payment for $75,000 at 7.25% over 12 years', () => {
      // $75,000 at 7.25% for 12 years (144 months)
      const monthlyPayment = calculateRepaymentPeriodPayment(75000, 7.25, 12);
      expect(monthlyPayment).toBeCloseTo(781.32, 2);
    });

    it('should calculate correctly with zero interest rate', () => {
      // With 0% interest, payment = principal / months
      const monthlyPayment = calculateRepaymentPeriodPayment(50000, 0, 10);
      expect(monthlyPayment).toBeCloseTo(416.67, 2); // 50000 / 120 months
    });

    it('should handle single year repayment period', () => {
      const monthlyPayment = calculateRepaymentPeriodPayment(10000, 5, 1);
      expect(monthlyPayment).toBeGreaterThan(0);
      expect(monthlyPayment).toBeLessThan(10000); // Should be less than principal
    });
  });

  describe('Complete HELOC Calculation', () => {
    it('should calculate complete HELOC with 10-year draw, 20-year repayment at 8%', () => {
      const inputs: HELOCInputs = {
        loanAmount: 50000,
        interestRate: 8,
        drawPeriod: 10,
        repaymentPeriod: 20,
      };

      const results = calculateHELOC(inputs);

      // Draw period: interest-only at $333.33/month for 120 months
      expect(results.drawPeriodPayment).toBeCloseTo(333.33, 2);

      // Repayment period: amortized payment for remaining balance
      expect(results.repaymentPeriodPayment).toBeCloseTo(418.22, 2);

      // Total payments = (draw period payments + repayment period payments)
      const expectedTotal = 333.33 * 120 + 418.22 * 240;
      expect(results.totalPayment).toBeCloseTo(expectedTotal, 0);

      // Total interest = total payments - principal
      expect(results.totalInterest).toBeCloseTo(expectedTotal - 50000, 0);

      // Total months
      expect(results.totalMonths).toBe(360); // 10 + 20 years
    });

    it('should calculate HELOC with 5-year draw, 15-year repayment at 6.5%', () => {
      const inputs: HELOCInputs = {
        loanAmount: 100000,
        interestRate: 6.5,
        drawPeriod: 5,
        repaymentPeriod: 15,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBeCloseTo(541.67, 2);
      expect(results.repaymentPeriodPayment).toBeCloseTo(871.11, 2);
      expect(results.totalMonths).toBe(240); // 5 + 15 years
      expect(results.totalInterest).toBeGreaterThan(0);
      expect(results.totalPayment).toBeGreaterThan(100000);
    });

    it('should calculate HELOC with 8-year draw, 12-year repayment at 7.25%', () => {
      const inputs: HELOCInputs = {
        loanAmount: 75000,
        interestRate: 7.25,
        drawPeriod: 8,
        repaymentPeriod: 12,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBeCloseTo(453.13, 2);
      expect(results.repaymentPeriodPayment).toBeCloseTo(781.32, 2);
      expect(results.totalMonths).toBe(240); // 8 + 12 years
    });

    it('should handle minimum values (1-year draw, 1-year repayment)', () => {
      const inputs: HELOCInputs = {
        loanAmount: 25000,
        interestRate: 5,
        drawPeriod: 1,
        repaymentPeriod: 1,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBeGreaterThan(0);
      expect(results.repaymentPeriodPayment).toBeGreaterThan(0);
      expect(results.totalMonths).toBe(24);
      expect(results.totalPayment).toBeGreaterThan(25000);
    });

    it('should handle large loan amounts', () => {
      const inputs: HELOCInputs = {
        loanAmount: 500000,
        interestRate: 7,
        drawPeriod: 10,
        repaymentPeriod: 20,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBeCloseTo(2916.67, 2);
      expect(results.repaymentPeriodPayment).toBeGreaterThan(3000);
      expect(results.totalPayment).toBeGreaterThan(500000);
    });

    it('should handle zero interest rate edge case', () => {
      const inputs: HELOCInputs = {
        loanAmount: 50000,
        interestRate: 0,
        drawPeriod: 5,
        repaymentPeriod: 10,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBe(0); // No interest to pay
      expect(results.repaymentPeriodPayment).toBeCloseTo(416.67, 2); // 50000 / 120
      expect(results.totalPayment).toBe(50000); // No interest paid
      expect(results.totalInterest).toBe(0);
    });
  });

  describe('Amortization Schedule Generation', () => {
    it('should generate correct schedule for basic HELOC', () => {
      const inputs: HELOCInputs = {
        loanAmount: 50000,
        interestRate: 8,
        drawPeriod: 5,
        repaymentPeriod: 10,
      };

      const results = calculateHELOC(inputs);
      const schedule = generateAmortizationSchedule(results);

      // Should have 180 rows (5 + 10 years)
      expect(schedule).toHaveLength(180);

      // First month should be draw period (interest-only)
      expect(schedule[0].month).toBe(1);
      expect(schedule[0].principal).toBeCloseTo(0, 2); // No principal during draw
      expect(schedule[0].interest).toBeCloseTo(333.33, 2);
      expect(schedule[0].balance).toBeCloseTo(50000, 2); // Balance unchanged
      expect(schedule[0].payment).toBeCloseTo(333.33, 2);

      // Last month of draw period (month 60)
      expect(schedule[59].principal).toBeCloseTo(0, 2);
      expect(schedule[59].balance).toBeCloseTo(50000, 2);

      // First month of repayment period (month 61)
      expect(schedule[60].principal).toBeGreaterThan(0);
      expect(schedule[60].interest).toBeGreaterThan(0);
      expect(schedule[60].balance).toBeLessThan(50000);

      // Last month should have near-zero balance
      expect(schedule[179].balance).toBeCloseTo(0, 0);

      // Balance should decrease monotonically during repayment period
      for (let i = 61; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
      }
    });

    it('should have correct payment amounts in each period', () => {
      const inputs: HELOCInputs = {
        loanAmount: 100000,
        interestRate: 6.5,
        drawPeriod: 5,
        repaymentPeriod: 15,
      };

      const results = calculateHELOC(inputs);
      const schedule = generateAmortizationSchedule(results);

      const drawMonths = 5 * 12; // 60 months

      // All draw period payments should be interest-only
      for (let i = 0; i < drawMonths; i++) {
        expect(schedule[i].payment).toBeCloseTo(results.drawPeriodPayment, 2);
        expect(schedule[i].principal).toBeCloseTo(0, 2);
      }

      // All repayment period payments should be amortized
      for (let i = drawMonths; i < schedule.length; i++) {
        expect(schedule[i].payment).toBeCloseTo(
          results.repaymentPeriodPayment,
          2
        );
        expect(schedule[i].principal).toBeGreaterThan(0);
      }
    });

    it('should correctly accumulate interest over full term', () => {
      const inputs: HELOCInputs = {
        loanAmount: 75000,
        interestRate: 7.25,
        drawPeriod: 8,
        repaymentPeriod: 12,
      };

      const results = calculateHELOC(inputs);
      const schedule = generateAmortizationSchedule(results);

      // Sum all interest payments
      const totalInterest = schedule.reduce(
        (sum, row) => sum + row.interest,
        0
      );

      // Should match calculated total interest
      expect(totalInterest).toBeCloseTo(results.totalInterest, 0);

      // Sum all principal payments (repayment period only)
      const totalPrincipal = schedule.reduce(
        (sum, row) => sum + row.principal,
        0
      );

      // Should equal loan amount
      expect(totalPrincipal).toBeCloseTo(inputs.loanAmount, 0);
    });

    it('should maintain balance accuracy throughout schedule', () => {
      const inputs: HELOCInputs = {
        loanAmount: 50000,
        interestRate: 8,
        drawPeriod: 10,
        repaymentPeriod: 20,
      };

      const results = calculateHELOC(inputs);
      const schedule = generateAmortizationSchedule(results);

      // Check balance calculation for each month
      let expectedBalance = inputs.loanAmount;

      for (let i = 0; i < schedule.length; i++) {
        const row = schedule[i];

        // Verify interest calculation
        const monthlyRate = inputs.interestRate / 100 / 12;
        const expectedInterest = expectedBalance * monthlyRate;
        expect(row.interest).toBeCloseTo(expectedInterest, 2);

        // Update expected balance
        expectedBalance -= row.principal;

        // Verify balance (with small tolerance for rounding)
        expect(row.balance).toBeCloseTo(Math.max(0, expectedBalance), 1);
      }

      // Final balance should be zero (or very close)
      expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);
    });

    it('should handle edge case with short periods', () => {
      const inputs: HELOCInputs = {
        loanAmount: 10000,
        interestRate: 5,
        drawPeriod: 1,
        repaymentPeriod: 2,
      };

      const results = calculateHELOC(inputs);
      const schedule = generateAmortizationSchedule(results);

      expect(schedule).toHaveLength(36); // 1 + 2 years

      // First 12 months: draw period
      for (let i = 0; i < 12; i++) {
        expect(schedule[i].balance).toBeCloseTo(10000, 1);
      }

      // Last month: nearly paid off
      expect(schedule[35].balance).toBeCloseTo(0, 0);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle very low interest rates', () => {
      const inputs: HELOCInputs = {
        loanAmount: 50000,
        interestRate: 0.5,
        drawPeriod: 5,
        repaymentPeriod: 10,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBeCloseTo(20.83, 2);
      expect(results.totalInterest).toBeGreaterThan(0);
      expect(results.totalPayment).toBeGreaterThan(50000);
    });

    it('should handle very high interest rates', () => {
      const inputs: HELOCInputs = {
        loanAmount: 50000,
        interestRate: 18,
        drawPeriod: 5,
        repaymentPeriod: 10,
      };

      const results = calculateHELOC(inputs);

      expect(results.drawPeriodPayment).toBeCloseTo(750, 2);
      expect(results.totalInterest).toBeGreaterThan(50000); // Interest exceeds principal
    });

    it('should ensure total payment equals sum of all payments in schedule', () => {
      const inputs: HELOCInputs = {
        loanAmount: 75000,
        interestRate: 7,
        drawPeriod: 6,
        repaymentPeriod: 14,
      };

      const results = calculateHELOC(inputs);
      const schedule = generateAmortizationSchedule(results);

      const totalFromSchedule = schedule.reduce(
        (sum, row) => sum + row.payment,
        0
      );

      expect(totalFromSchedule).toBeCloseTo(results.totalPayment, 0);
    });

    it('should ensure interest + principal equals loan amount', () => {
      const inputs: HELOCInputs = {
        loanAmount: 100000,
        interestRate: 6,
        drawPeriod: 10,
        repaymentPeriod: 15,
      };

      const results = calculateHELOC(inputs);

      expect(results.totalPayment).toBeCloseTo(
        inputs.loanAmount + results.totalInterest,
        0
      );
    });
  });
});
