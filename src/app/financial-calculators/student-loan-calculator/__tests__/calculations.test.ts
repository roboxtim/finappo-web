import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateLoanTerm,
  calculatePrincipal,
  calculateInterestRate,
  calculateSimple,
  calculateRepayment,
  calculateProjection,
  validateSimpleInputs,
  validateRepaymentInputs,
  validateProjectionInputs,
  generateAmortizationSchedule,
} from '../calculations';

describe('Student Loan Calculator', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment correctly', () => {
      const payment = calculateMonthlyPayment(25000, 5.5, 120);
      expect(payment).toBeCloseTo(271.32, 2);
    });

    it('should handle 0% interest rate', () => {
      const payment = calculateMonthlyPayment(24000, 0, 120);
      expect(payment).toBe(200);
    });

    it('should calculate for different loan amounts', () => {
      const payment = calculateMonthlyPayment(50000, 6.0, 120);
      expect(payment).toBeCloseTo(555.1, 2);
    });
  });

  describe('calculateLoanTerm', () => {
    it('should calculate loan term correctly', () => {
      const months = calculateLoanTerm(25000, 271.32, 5.5);
      expect(months).toBeLessThanOrEqual(120);
    });

    it('should handle 0% interest rate', () => {
      const months = calculateLoanTerm(24000, 200, 0);
      expect(months).toBe(120);
    });

    it('should return 999 if payment is too low', () => {
      const months = calculateLoanTerm(25000, 50, 5.5);
      expect(months).toBe(999);
    });
  });

  describe('calculatePrincipal', () => {
    it('should calculate principal correctly', () => {
      const principal = calculatePrincipal(271.32, 5.5, 120);
      expect(principal).toBeCloseTo(25000, 0);
    });

    it('should handle 0% interest rate', () => {
      const principal = calculatePrincipal(200, 0, 120);
      expect(principal).toBe(24000);
    });
  });

  describe('calculateInterestRate', () => {
    it('should calculate interest rate correctly', () => {
      const rate = calculateInterestRate(25000, 271.32, 120);
      expect(rate).toBeCloseTo(5.5, 1);
    });

    it('should handle different scenarios', () => {
      const rate = calculateInterestRate(50000, 555.1, 120);
      expect(rate).toBeCloseTo(6.0, 1);
    });
  });

  describe('calculateSimple', () => {
    it('should calculate missing monthly payment', () => {
      const results = calculateSimple({
        loanBalance: 25000,
        remainingTerm: 10,
        interestRate: 5.5,
      });

      expect(results.monthlyPayment).toBeCloseTo(271.32, 2);
      expect(results.loanBalance).toBe(25000);
      expect(results.remainingTerm).toBe(10);
      expect(results.interestRate).toBe(5.5);
      expect(results.totalPayments).toBeGreaterThan(25000);
      expect(results.totalInterest).toBeGreaterThan(0);
    });

    it('should calculate missing loan balance', () => {
      const results = calculateSimple({
        monthlyPayment: 271.32,
        remainingTerm: 10,
        interestRate: 5.5,
      });

      expect(results.loanBalance).toBeCloseTo(25000, 0);
      expect(results.monthlyPayment).toBeCloseTo(271.32, 2);
    });

    it('should calculate missing term', () => {
      const results = calculateSimple({
        loanBalance: 25000,
        monthlyPayment: 271.32,
        interestRate: 5.5,
      });

      expect(results.remainingTerm).toBeCloseTo(10, 1);
    });

    it('should calculate missing interest rate', () => {
      const results = calculateSimple({
        loanBalance: 25000,
        remainingTerm: 10,
        monthlyPayment: 271.32,
      });

      expect(results.interestRate).toBeCloseTo(5.5, 1);
    });

    it('should throw error if not exactly 3 values provided', () => {
      expect(() => {
        calculateSimple({
          loanBalance: 25000,
          remainingTerm: 10,
        });
      }).toThrow('Please provide exactly 3 values');
    });

    it('should calculate percentages correctly', () => {
      const results = calculateSimple({
        loanBalance: 25000,
        remainingTerm: 10,
        interestRate: 5.5,
      });

      expect(
        results.principalPercentage + results.interestPercentage
      ).toBeCloseTo(100, 1);
      expect(results.principalPercentage).toBeGreaterThan(50);
      expect(results.interestPercentage).toBeLessThan(50);
    });
  });

  describe('calculateRepayment', () => {
    it('should calculate repayment with extra monthly payment', () => {
      const results = calculateRepayment({
        loanBalance: 30000,
        monthlyPayment: 350,
        interestRate: 6.0,
        extraMonthly: 100,
      });

      expect(results.original.monthlyPayment).toBe(350);
      expect(results.accelerated.monthlyPayment).toBe(450);
      expect(results.accelerated.totalMonths).toBeLessThan(
        results.original.totalMonths
      );
      expect(results.savings.monthsSaved).toBeGreaterThan(0);
      expect(results.savings.interestSaved).toBeGreaterThan(0);
    });

    it('should calculate repayment with extra annual payment', () => {
      const results = calculateRepayment({
        loanBalance: 30000,
        monthlyPayment: 350,
        interestRate: 6.0,
        extraAnnual: 1000,
      });

      expect(results.accelerated.totalMonths).toBeLessThan(
        results.original.totalMonths
      );
      expect(results.savings.interestSaved).toBeGreaterThan(0);
    });

    it('should calculate repayment with one-time payment', () => {
      const results = calculateRepayment({
        loanBalance: 30000,
        monthlyPayment: 350,
        interestRate: 6.0,
        oneTimePayment: 5000,
      });

      expect(results.accelerated.totalMonths).toBeLessThan(
        results.original.totalMonths
      );
      expect(results.savings.interestSaved).toBeGreaterThan(0);
    });

    it('should handle no extra payments', () => {
      const results = calculateRepayment({
        loanBalance: 30000,
        monthlyPayment: 350,
        interestRate: 6.0,
      });

      expect(results.original.totalMonths).toBe(
        results.accelerated.totalMonths
      );
      expect(results.savings.monthsSaved).toBe(0);
      expect(results.savings.interestSaved).toBeCloseTo(0, 1);
    });

    it('should calculate with all extra payment types combined', () => {
      const results = calculateRepayment({
        loanBalance: 30000,
        monthlyPayment: 350,
        interestRate: 6.0,
        extraMonthly: 50,
        extraAnnual: 500,
        oneTimePayment: 2000,
      });

      expect(results.savings.monthsSaved).toBeGreaterThan(10);
      expect(results.savings.interestSaved).toBeGreaterThan(1000);
    });
  });

  describe('calculateProjection', () => {
    it('should project loan costs without interest during school', () => {
      const results = calculateProjection({
        yearsToGraduation: 4,
        annualLoanAmount: 8000,
        currentBalance: 0,
        loanTerm: 10,
        gracePeriod: 6,
        interestRate: 5.5,
        interestDuringSchool: false,
      });

      expect(results.amountBorrowed).toBe(32000);
      expect(results.balanceAfterGraduation).toBe(32000);
      expect(results.balanceAfterGracePeriod).toBeGreaterThan(32000);
      expect(results.monthlyRepayment).toBeGreaterThan(0);
      expect(results.totalInterest).toBeGreaterThan(0);
    });

    it('should project loan costs with interest during school', () => {
      const results = calculateProjection({
        yearsToGraduation: 4,
        annualLoanAmount: 8000,
        currentBalance: 0,
        loanTerm: 10,
        gracePeriod: 6,
        interestRate: 5.5,
        interestDuringSchool: true,
      });

      expect(results.amountBorrowed).toBe(32000);
      expect(results.balanceAfterGraduation).toBeGreaterThan(32000);
      expect(results.balanceAfterGracePeriod).toBeGreaterThan(
        results.balanceAfterGraduation
      );
      expect(results.totalInterest).toBeGreaterThan(5000);
    });

    it('should include current balance in calculations', () => {
      const results = calculateProjection({
        yearsToGraduation: 2,
        annualLoanAmount: 10000,
        currentBalance: 15000,
        loanTerm: 10,
        gracePeriod: 6,
        interestRate: 6.0,
        interestDuringSchool: false,
      });

      expect(results.amountBorrowed).toBe(35000); // 15000 + (2 * 10000)
      expect(results.balanceAfterGraduation).toBe(35000);
    });

    it('should calculate percentages correctly', () => {
      const results = calculateProjection({
        yearsToGraduation: 4,
        annualLoanAmount: 8000,
        currentBalance: 0,
        loanTerm: 10,
        gracePeriod: 6,
        interestRate: 5.5,
        interestDuringSchool: false,
      });

      expect(
        results.principalPercentage + results.interestPercentage
      ).toBeCloseTo(100, 1);
    });

    it('should handle zero grace period', () => {
      const results = calculateProjection({
        yearsToGraduation: 4,
        annualLoanAmount: 8000,
        currentBalance: 0,
        loanTerm: 10,
        gracePeriod: 0,
        interestRate: 5.5,
        interestDuringSchool: false,
      });

      expect(results.balanceAfterGracePeriod).toBe(
        results.balanceAfterGraduation
      );
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate amortization schedule without extra payments', () => {
      const schedule = generateAmortizationSchedule(10000, 200, 6.0, 0, 0, 0);

      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule[0].balance).toBeLessThan(10000);
      expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);

      // Check that payments decrease balance over time
      expect(schedule[0].balance).toBeGreaterThan(
        schedule[schedule.length - 1].balance
      );
    });

    it('should apply extra monthly payment', () => {
      const scheduleNormal = generateAmortizationSchedule(
        10000,
        200,
        6.0,
        0,
        0,
        0
      );
      const scheduleExtra = generateAmortizationSchedule(
        10000,
        200,
        6.0,
        50,
        0,
        0
      );

      expect(scheduleExtra.length).toBeLessThan(scheduleNormal.length);
    });

    it('should apply one-time payment upfront', () => {
      const scheduleNormal = generateAmortizationSchedule(
        10000,
        200,
        6.0,
        0,
        0,
        0
      );
      const scheduleOneTime = generateAmortizationSchedule(
        10000,
        200,
        6.0,
        0,
        0,
        2000
      );

      expect(scheduleOneTime.length).toBeLessThan(scheduleNormal.length);
    });

    it('should include extra annual payment in December', () => {
      const schedule = generateAmortizationSchedule(10000, 200, 6.0, 0, 500, 0);

      // Payment in month 12 should be higher
      if (schedule.length >= 12) {
        expect(schedule[11].payment).toBeGreaterThan(schedule[10].payment);
      }
    });
  });

  describe('Validation', () => {
    describe('validateSimpleInputs', () => {
      it('should validate correct inputs', () => {
        const errors = validateSimpleInputs({
          loanBalance: 25000,
          remainingTerm: 10,
          interestRate: 5.5,
        });
        expect(errors.length).toBe(0);
      });

      it('should require exactly 3 values', () => {
        const errors = validateSimpleInputs({
          loanBalance: 25000,
          remainingTerm: 10,
        });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('at least 3 values');
      });

      it('should reject negative values', () => {
        const errors = validateSimpleInputs({
          loanBalance: -1000,
          remainingTerm: 10,
          interestRate: 5.5,
        });
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject invalid interest rate', () => {
        const errors = validateSimpleInputs({
          loanBalance: 25000,
          remainingTerm: 10,
          interestRate: 150,
        });
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateRepaymentInputs', () => {
      it('should validate correct inputs', () => {
        const errors = validateRepaymentInputs({
          loanBalance: 30000,
          monthlyPayment: 350,
          interestRate: 6.0,
        });
        expect(errors.length).toBe(0);
      });

      it('should require positive loan balance', () => {
        const errors = validateRepaymentInputs({
          loanBalance: 0,
          monthlyPayment: 350,
          interestRate: 6.0,
        });
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should require sufficient monthly payment', () => {
        const errors = validateRepaymentInputs({
          loanBalance: 30000,
          monthlyPayment: 10,
          interestRate: 6.0,
        });
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject negative extra payments', () => {
        const errors = validateRepaymentInputs({
          loanBalance: 30000,
          monthlyPayment: 350,
          interestRate: 6.0,
          extraMonthly: -50,
        });
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateProjectionInputs', () => {
      it('should validate correct inputs', () => {
        const errors = validateProjectionInputs({
          yearsToGraduation: 4,
          annualLoanAmount: 8000,
          currentBalance: 0,
          loanTerm: 10,
          gracePeriod: 6,
          interestRate: 5.5,
          interestDuringSchool: false,
        });
        expect(errors.length).toBe(0);
      });

      it('should limit years to graduation', () => {
        const errors = validateProjectionInputs({
          yearsToGraduation: 15,
          annualLoanAmount: 8000,
          currentBalance: 0,
          loanTerm: 10,
          gracePeriod: 6,
          interestRate: 5.5,
          interestDuringSchool: false,
        });
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should limit grace period', () => {
        const errors = validateProjectionInputs({
          yearsToGraduation: 4,
          annualLoanAmount: 8000,
          currentBalance: 0,
          loanTerm: 10,
          gracePeriod: 24,
          interestRate: 5.5,
          interestDuringSchool: false,
        });
        expect(errors.length).toBeGreaterThan(0);
      });

      it('should reject negative values', () => {
        const errors = validateProjectionInputs({
          yearsToGraduation: 4,
          annualLoanAmount: -1000,
          currentBalance: 0,
          loanTerm: 10,
          gracePeriod: 6,
          interestRate: 5.5,
          interestDuringSchool: false,
        });
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});
