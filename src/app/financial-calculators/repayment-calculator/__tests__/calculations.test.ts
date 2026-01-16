import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculatePayoffMonths,
  generateAmortizationSchedule,
  calculateTotalInterest,
  calculateTotalPrincipal,
  calculateRepayment,
  validateRepaymentInputs,
  formatCurrency,
  formatPercentage,
  formatMonthsAsTime,
  formatPaymentFrequency,
  type LoanInputs,
} from '../calculations';

describe('Repayment Calculator', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment correctly', () => {
      const payment = calculateMonthlyPayment(10000, 5, 12);
      expect(payment).toBeCloseTo(856.07, 1);
    });

    it('should handle 0% interest rate', () => {
      const payment = calculateMonthlyPayment(12000, 0, 12);
      expect(payment).toBe(1000);
    });

    it('should calculate payment for 30-year mortgage', () => {
      const payment = calculateMonthlyPayment(300000, 4.5, 360);
      expect(payment).toBeCloseTo(1520.06, 1);
    });
  });

  describe('calculatePayoffMonths', () => {
    it('should calculate payoff months correctly', () => {
      const months = calculatePayoffMonths(10000, 500, 5);
      expect(months).toBeGreaterThan(0);
      expect(months).toBeLessThan(30);
    });

    it('should return 999 if payment is too low', () => {
      const months = calculatePayoffMonths(10000, 10, 20);
      expect(months).toBe(999);
    });

    it('should handle 0% interest', () => {
      const months = calculatePayoffMonths(12000, 1000, 0);
      expect(months).toBe(12);
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('should generate correct amortization schedule', () => {
      const schedule = generateAmortizationSchedule(10000, 856.07, 5, 12);

      expect(schedule).toHaveLength(12);
      expect(schedule[0].paymentNumber).toBe(1);
      expect(schedule[0].balance).toBeLessThan(10000);
      expect(schedule[11].balance).toBeCloseTo(0, 0);
    });

    it('should have decreasing balance each month', () => {
      const schedule = generateAmortizationSchedule(5000, 500, 6, 11);

      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
      }
    });

    it('should have interest decreasing and principal increasing', () => {
      const schedule = generateAmortizationSchedule(10000, 856.07, 5, 12);

      expect(schedule[11].interest).toBeLessThan(schedule[0].interest);
      expect(schedule[11].principal).toBeGreaterThan(schedule[0].principal);
    });
  });

  describe('calculateTotalInterest', () => {
    it('should sum up all interest payments', () => {
      const schedule = generateAmortizationSchedule(10000, 856.07, 5, 12);
      const totalInterest = calculateTotalInterest(schedule);

      expect(totalInterest).toBeGreaterThan(0);
      expect(totalInterest).toBeCloseTo(272.84, 0);
    });
  });

  describe('calculateTotalPrincipal', () => {
    it('should sum up all principal payments', () => {
      const schedule = generateAmortizationSchedule(10000, 856.07, 5, 12);
      const totalPrincipal = calculateTotalPrincipal(schedule);

      expect(totalPrincipal).toBeCloseTo(10000, 0);
    });
  });

  describe('calculateRepayment', () => {
    it('should calculate correctly in fixed-term mode', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 5,
        mode: 'fixed-term',
        years: 1,
        months: 0,
        paymentFrequency: 'monthly',
      };

      const results = calculateRepayment(inputs);

      expect(results.monthlyPayment).toBeCloseTo(856.07, 1);
      expect(results.payoffMonths).toBe(12);
      expect(results.totalPrincipal).toBeCloseTo(10000, 0);
      expect(results.totalInterest).toBeGreaterThan(0);
      expect(
        results.principalPercentage + results.interestPercentage
      ).toBeCloseTo(100, 1);
    });

    it('should calculate correctly in fixed-payment mode', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 5,
        mode: 'fixed-payment',
        monthlyPayment: 900,
        paymentFrequency: 'monthly',
      };

      const results = calculateRepayment(inputs);

      expect(results.monthlyPayment).toBe(900);
      expect(results.payoffMonths).toBeGreaterThan(0);
      expect(results.payoffMonths).toBeLessThanOrEqual(12);
      expect(results.totalPrincipal).toBeCloseTo(10000, 0);
    });

    it('should throw error if payment too low in fixed-payment mode', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 10,
        mode: 'fixed-payment',
        monthlyPayment: 50,
        paymentFrequency: 'monthly',
      };

      expect(() => calculateRepayment(inputs)).toThrow();
    });

    it('should generate amortization schedule', () => {
      const inputs: LoanInputs = {
        loanBalance: 5000,
        interestRate: 6,
        mode: 'fixed-term',
        years: 0,
        months: 6,
        paymentFrequency: 'monthly',
      };

      const results = calculateRepayment(inputs);

      expect(results.amortizationSchedule).toHaveLength(6);
      expect(results.amortizationSchedule[5].balance).toBeCloseTo(0, 0);
    });
  });

  describe('validateRepaymentInputs', () => {
    it('should pass validation for valid fixed-term inputs', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 5,
        mode: 'fixed-term',
        years: 5,
        months: 0,
        paymentFrequency: 'monthly',
      };

      const errors = validateRepaymentInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation for valid fixed-payment inputs', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 5,
        mode: 'fixed-payment',
        monthlyPayment: 500,
        paymentFrequency: 'monthly',
      };

      const errors = validateRepaymentInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for negative loan balance', () => {
      const inputs: LoanInputs = {
        loanBalance: -1000,
        interestRate: 5,
        mode: 'fixed-term',
        years: 1,
        months: 0,
        paymentFrequency: 'monthly',
      };

      const errors = validateRepaymentInputs(inputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Loan balance'))).toBe(true);
    });

    it('should fail validation for invalid interest rate', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 150,
        mode: 'fixed-term',
        years: 1,
        months: 0,
        paymentFrequency: 'monthly',
      };

      const errors = validateRepaymentInputs(inputs);
      expect(errors.some((e) => e.includes('Interest rate'))).toBe(true);
    });

    it('should fail validation for zero term in fixed-term mode', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 5,
        mode: 'fixed-term',
        years: 0,
        months: 0,
        paymentFrequency: 'monthly',
      };

      const errors = validateRepaymentInputs(inputs);
      expect(errors.some((e) => e.includes('Loan term'))).toBe(true);
    });

    it('should fail validation for payment too low in fixed-payment mode', () => {
      const inputs: LoanInputs = {
        loanBalance: 10000,
        interestRate: 10,
        mode: 'fixed-payment',
        monthlyPayment: 50,
        paymentFrequency: 'monthly',
      };

      const errors = validateRepaymentInputs(inputs);
      expect(
        errors.some((e) => e.includes('Monthly payment must be greater'))
      ).toBe(true);
    });
  });

  describe('Formatting functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should format percentage correctly', () => {
      expect(formatPercentage(5.5)).toBe('5.5%');
      expect(formatPercentage(18.75)).toBe('18.8%');
    });

    it('should format months as time correctly', () => {
      expect(formatMonthsAsTime(12)).toBe('1 year');
      expect(formatMonthsAsTime(24)).toBe('2 years');
      expect(formatMonthsAsTime(6)).toBe('6 months');
      expect(formatMonthsAsTime(18)).toBe('1 year 6 months');
      expect(formatMonthsAsTime(37)).toBe('3 years 1 month');
    });

    it('should format payment frequency correctly', () => {
      expect(formatPaymentFrequency('monthly')).toBe('Monthly');
      expect(formatPaymentFrequency('bi-weekly')).toBe('Bi-weekly');
      expect(formatPaymentFrequency('weekly')).toBe('Weekly');
    });
  });
});
