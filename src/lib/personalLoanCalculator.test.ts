import { describe, it, expect } from 'vitest';
import {
  calculatePersonalLoan,
  PersonalLoanInputs,
} from './personalLoanCalculator';

describe('Personal Loan Calculator', () => {
  describe('Basic calculations', () => {
    it('should calculate monthly payment for $10k loan, 6% APR, 36 months', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 10000,
        interestRate: 6,
        loanTerm: 36,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(304.22, 2);
      expect(result.totalPayment).toBeCloseTo(10951.9, 1);
      expect(result.totalInterest).toBeCloseTo(951.9, 1);
    });

    it('should calculate monthly payment for $20k loan, 5% APR, 60 months', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 20000,
        interestRate: 5,
        loanTerm: 60,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(377.42, 2);
      expect(result.totalPayment).toBeCloseTo(22645.48, 1);
      expect(result.totalInterest).toBeCloseTo(2645.48, 1);
    });

    it('should calculate monthly payment for $100k loan, 7% APR, 120 months', () => {
      // Example from calculator.net
      const inputs: PersonalLoanInputs = {
        loanAmount: 100000,
        interestRate: 7,
        loanTerm: 120,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(1161.08, 2);
      expect(result.totalPayment).toBeCloseTo(139330.18, 1);
      expect(result.totalInterest).toBeCloseTo(39330.18, 1);
    });

    it('should handle 0% interest rate', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 15000,
        interestRate: 0,
        loanTerm: 36,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(416.67, 2);
      expect(result.totalPayment).toBe(15000);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe('Different loan terms', () => {
    it('should calculate for 12 month loan', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 5000,
        interestRate: 8,
        loanTerm: 12,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(434.94, 2);
      expect(result.totalPayment).toBeCloseTo(5219.31, 1);
      expect(result.totalInterest).toBeCloseTo(219.31, 1);
    });

    it('should calculate for 24 month loan', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 8000,
        interestRate: 6.5,
        loanTerm: 24,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(356.37, 2);
      expect(result.totalPayment).toBeCloseTo(8552.88, 1);
      expect(result.totalInterest).toBeCloseTo(552.88, 1);
    });

    it('should calculate for 84 month loan', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 30000,
        interestRate: 9,
        loanTerm: 84,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(482.67, 2);
      expect(result.totalPayment).toBeCloseTo(40544.46, 1);
      expect(result.totalInterest).toBeCloseTo(10544.46, 1);
    });
  });

  describe('Different interest rates', () => {
    it('should calculate with low interest rate (3%)', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 15000,
        interestRate: 3,
        loanTerm: 48,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(332.01, 2);
      expect(result.totalPayment).toBeCloseTo(15936.72, 1);
      expect(result.totalInterest).toBeCloseTo(936.72, 1);
    });

    it('should calculate with high interest rate (15%)', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 10000,
        interestRate: 15,
        loanTerm: 36,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(346.65, 2);
      expect(result.totalPayment).toBeCloseTo(12479.52, 1);
      expect(result.totalInterest).toBeCloseTo(2479.52, 1);
    });

    it('should calculate with very low rate (1.5%)', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 25000,
        interestRate: 1.5,
        loanTerm: 60,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(432.75, 2);
      expect(result.totalPayment).toBeCloseTo(25964.83, 1);
      expect(result.totalInterest).toBeCloseTo(964.83, 1);
    });
  });

  describe('Edge cases', () => {
    it('should handle large loan amounts', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 500000,
        interestRate: 4.5,
        loanTerm: 120,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(5181.92, 2);
      expect(result.totalPayment).toBeCloseTo(621830.45, 1);
      expect(result.totalInterest).toBeCloseTo(121830.45, 1);
    });

    it('should handle small loan amounts', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 1000,
        interestRate: 10,
        loanTerm: 12,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(87.92, 2);
      expect(result.totalPayment).toBeCloseTo(1054.99, 1);
      expect(result.totalInterest).toBeCloseTo(54.99, 1);
    });

    it('should handle very short term (6 months)', () => {
      const inputs: PersonalLoanInputs = {
        loanAmount: 3000,
        interestRate: 12,
        loanTerm: 6,
      };

      const result = calculatePersonalLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(517.65, 2);
      expect(result.totalPayment).toBeCloseTo(3105.87, 1);
      expect(result.totalInterest).toBeCloseTo(105.87, 1);
    });
  });
});
