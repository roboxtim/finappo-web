import { describe, it, expect } from 'vitest';
import {
  calculateAPR,
  calculateMonthlyPayment,
  calculateAmortizationSchedule,
  type LoanInputs,
} from './aprCalculations';

describe('APR Calculator', () => {
  describe('Monthly Payment Calculation', () => {
    it('should calculate monthly payment correctly with interest', () => {
      const payment = calculateMonthlyPayment(10000, 6, 36);
      expect(payment).toBeCloseTo(304.22, 2);
    });

    it('should calculate monthly payment correctly with zero interest', () => {
      const payment = calculateMonthlyPayment(10000, 0, 36);
      expect(payment).toBeCloseTo(277.78, 2);
    });

    it('should calculate monthly payment for different term lengths', () => {
      const payment24 = calculateMonthlyPayment(5000, 12, 24);
      const payment36 = calculateMonthlyPayment(5000, 12, 36);
      expect(payment24).toBeGreaterThan(payment36);
    });
  });

  describe('APR Calculation - No Fees', () => {
    it('should return nominal rate when there are no fees', () => {
      const inputs: LoanInputs = {
        loanAmount: 10000,
        interestRate: 6,
        loanTermMonths: 36,
        loanedFees: 0,
        upfrontFees: 0,
      };

      const results = calculateAPR(inputs);
      expect(results.nominalRate).toBe(6);
      expect(results.effectiveAPR).toBeCloseTo(6, 1);
      expect(results.totalFees).toBe(0);
      expect(results.netAmountReceived).toBe(10000);
    });
  });

  describe('APR Calculation - With Loaned Fees', () => {
    it('should calculate higher APR when fees are rolled into loan', () => {
      const inputs: LoanInputs = {
        loanAmount: 10000,
        interestRate: 6,
        loanTermMonths: 36,
        loanedFees: 500, // $500 fee added to principal
        upfrontFees: 0,
      };

      const results = calculateAPR(inputs);

      // With fees rolled into loan, borrower receives $10,000 but pays back
      // based on $10,500 at 6%, making effective APR higher
      expect(results.amountFinanced).toBe(10500);
      expect(results.netAmountReceived).toBe(10000);
      expect(results.effectiveAPR).toBeGreaterThan(results.nominalRate);
      expect(results.totalFees).toBe(500);

      // Monthly payment should be based on $10,500
      const expectedPayment = calculateMonthlyPayment(10500, 6, 36);
      expect(results.monthlyPayment).toBeCloseTo(expectedPayment, 2);
    });

    it('should calculate APR for loan with significant loaned fees', () => {
      const inputs: LoanInputs = {
        loanAmount: 5000,
        interestRate: 12,
        loanTermMonths: 24,
        loanedFees: 300,
        upfrontFees: 0,
      };

      const results = calculateAPR(inputs);
      expect(results.amountFinanced).toBe(5300);
      expect(results.netAmountReceived).toBe(5000);
      expect(results.effectiveAPR).toBeGreaterThan(12);
      expect(results.effectiveAPR).toBeLessThan(20); // Fee percentage is 6%, so APR increase is reasonable
    });
  });

  describe('APR Calculation - With Upfront Fees', () => {
    it('should calculate higher APR when upfront fees reduce amount received', () => {
      const inputs: LoanInputs = {
        loanAmount: 10000,
        interestRate: 6,
        loanTermMonths: 36,
        loanedFees: 0,
        upfrontFees: 500, // $500 paid upfront
      };

      const results = calculateAPR(inputs);

      // Borrower receives only $9,500 but pays back based on $10,000
      expect(results.amountFinanced).toBe(10000);
      expect(results.netAmountReceived).toBe(9500);
      expect(results.effectiveAPR).toBeGreaterThan(results.nominalRate);
      expect(results.totalCost).toBe(results.totalPayments + 500);
    });

    it('should calculate APR for loan with upfront fees only', () => {
      const inputs: LoanInputs = {
        loanAmount: 5000,
        interestRate: 12,
        loanTermMonths: 24,
        loanedFees: 0,
        upfrontFees: 200,
      };

      const results = calculateAPR(inputs);
      expect(results.netAmountReceived).toBe(4800);
      expect(results.effectiveAPR).toBeGreaterThan(12);
      expect(results.totalFees).toBe(200);
    });
  });

  describe('APR Calculation - With Both Fee Types', () => {
    it('should calculate APR with both loaned and upfront fees', () => {
      const inputs: LoanInputs = {
        loanAmount: 20000,
        interestRate: 8.5,
        loanTermMonths: 60,
        loanedFees: 1000, // Rolled into loan
        upfrontFees: 500,  // Paid out of pocket
      };

      const results = calculateAPR(inputs);

      // Amount financed: $20,000 + $1,000 = $21,000
      expect(results.amountFinanced).toBe(21000);

      // Net received: $20,000 - $500 = $19,500
      expect(results.netAmountReceived).toBe(19500);

      // Total fees: $1,000 + $500 = $1,500
      expect(results.totalFees).toBe(1500);

      // Effective APR should be significantly higher than nominal rate
      expect(results.effectiveAPR).toBeGreaterThan(8.5);

      // Payment based on $21,000 at 8.5%
      const expectedPayment = calculateMonthlyPayment(21000, 8.5, 60);
      expect(results.monthlyPayment).toBeCloseTo(expectedPayment, 2);
    });

    it('should calculate APR for complex scenario', () => {
      const inputs: LoanInputs = {
        loanAmount: 15000,
        interestRate: 10,
        loanTermMonths: 48,
        loanedFees: 750,
        upfrontFees: 250,
      };

      const results = calculateAPR(inputs);
      expect(results.amountFinanced).toBe(15750);
      expect(results.netAmountReceived).toBe(14750);
      expect(results.effectiveAPR).toBeGreaterThan(10);
      expect(results.totalFees).toBe(1000);
    });
  });

  describe('APR Calculation - Edge Cases', () => {
    it('should handle very small loan amounts', () => {
      const inputs: LoanInputs = {
        loanAmount: 1000,
        interestRate: 15,
        loanTermMonths: 12,
        loanedFees: 50,
        upfrontFees: 25,
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(15);
      expect(results.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle very large loan amounts', () => {
      const inputs: LoanInputs = {
        loanAmount: 500000,
        interestRate: 4.5,
        loanTermMonths: 360,
        loanedFees: 5000,
        upfrontFees: 2000,
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(4.5);
      expect(results.effectiveAPR).toBeLessThan(5.5);
    });

    it('should handle high fee percentage scenarios', () => {
      const inputs: LoanInputs = {
        loanAmount: 3000,
        interestRate: 20,
        loanTermMonths: 12,
        loanedFees: 500, // 16.7% of loan
        upfrontFees: 300, // 10% of loan
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(20);
      expect(results.effectiveAPR).toBeGreaterThan(results.nominalRate);
    });

    it('should handle short-term loans', () => {
      const inputs: LoanInputs = {
        loanAmount: 5000,
        interestRate: 8,
        loanTermMonths: 6,
        loanedFees: 200,
        upfrontFees: 0,
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(8);
      expect(results.totalPayments).toBeCloseTo(results.monthlyPayment * 6, 1);
    });

    it('should handle long-term loans', () => {
      const inputs: LoanInputs = {
        loanAmount: 300000,
        interestRate: 3.5,
        loanTermMonths: 360, // 30 years
        loanedFees: 3000,
        upfrontFees: 2000,
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(3.5);
      expect(results.effectiveAPR).toBeLessThan(4); // Fees have less impact on long loans
    });
  });

  describe('Amortization Schedule', () => {
    it('should generate correct amortization schedule', () => {
      const schedule = calculateAmortizationSchedule(10000, 6, 12);

      expect(schedule).toHaveLength(12);
      expect(schedule[0].month).toBe(1);
      expect(schedule[11].month).toBe(12);
      expect(schedule[11].balance).toBeCloseTo(0, 0);
    });

    it('should have decreasing interest and increasing principal over time', () => {
      const schedule = calculateAmortizationSchedule(10000, 6, 36);

      expect(schedule[0].interest).toBeGreaterThan(schedule[35].interest);
      expect(schedule[0].principal).toBeLessThan(schedule[35].principal);
    });

    it('should have consistent payment amounts', () => {
      const schedule = calculateAmortizationSchedule(5000, 12, 24);

      const firstPayment = schedule[0].payment;
      schedule.forEach(row => {
        expect(row.payment).toBeCloseTo(firstPayment, 2);
      });
    });

    it('should correctly sum to total principal', () => {
      const principal = 15000;
      const schedule = calculateAmortizationSchedule(principal, 8, 48);

      const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
      expect(totalPrincipal).toBeCloseTo(principal, 0);
    });
  });

  describe('Comprehensive Test Cases', () => {
    it('Test Case 1: Standard personal loan with loaned fees', () => {
      const inputs: LoanInputs = {
        loanAmount: 10000,
        interestRate: 6,
        loanTermMonths: 36,
        loanedFees: 500,
        upfrontFees: 0,
      };

      const results = calculateAPR(inputs);

      // Verify all key calculations
      expect(results.nominalRate).toBe(6);
      expect(results.amountFinanced).toBe(10500);
      expect(results.netAmountReceived).toBe(10000);
      expect(results.effectiveAPR).toBeGreaterThan(6);
      expect(results.effectiveAPR).toBeCloseTo(9.3, 1); // Fees increase APR significantly
      expect(results.totalFees).toBe(500);
      expect(results.monthlyPayment).toBeGreaterThan(300);
      expect(results.totalPayments).toBeCloseTo(results.monthlyPayment * 36, 1);
    });

    it('Test Case 2: Auto loan with upfront fees', () => {
      const inputs: LoanInputs = {
        loanAmount: 25000,
        interestRate: 5.5,
        loanTermMonths: 60,
        loanedFees: 0,
        upfrontFees: 1000,
      };

      const results = calculateAPR(inputs);
      expect(results.netAmountReceived).toBe(24000);
      expect(results.effectiveAPR).toBeGreaterThan(5.5);
      expect(results.totalCost).toBe(results.totalPayments + 1000);
    });

    it('Test Case 3: High-rate short-term loan', () => {
      const inputs: LoanInputs = {
        loanAmount: 3000,
        interestRate: 18,
        loanTermMonths: 12,
        loanedFees: 200,
        upfrontFees: 100,
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(18);
      expect(results.effectiveAPR).toBeLessThan(45); // With 10% total fees on short-term loan, APR can be high
      expect(results.totalFees).toBe(300);
    });

    it('Test Case 4: Large mortgage-style loan', () => {
      const inputs: LoanInputs = {
        loanAmount: 200000,
        interestRate: 4.25,
        loanTermMonths: 360,
        loanedFees: 2000,
        upfrontFees: 3000,
      };

      const results = calculateAPR(inputs);
      expect(results.effectiveAPR).toBeGreaterThan(4.25);
      expect(results.effectiveAPR).toBeLessThan(4.5);
      expect(results.totalFees).toBe(5000);
    });

    it('Test Case 5: Zero interest loan with fees', () => {
      const inputs: LoanInputs = {
        loanAmount: 5000,
        interestRate: 0,
        loanTermMonths: 24,
        loanedFees: 300,
        upfrontFees: 200,
      };

      const results = calculateAPR(inputs);

      // With 0% interest but $500 in fees on $5000 over 24 months
      expect(results.nominalRate).toBe(0);
      expect(results.effectiveAPR).toBeGreaterThan(0);
      expect(results.totalInterest).toBe(0);
      expect(results.totalFees).toBe(500);
    });
  });
});
