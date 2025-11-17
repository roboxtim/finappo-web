import { describe, it, expect } from 'vitest';
import { calculateAutoLoan, AutoLoanInputs } from './autoLoanCalculator';

describe('Auto Loan Calculator', () => {
  describe('Basic calculations without tax/fees in loan', () => {
    it('should calculate monthly payment for $40k car with $5k down, $10k trade-in, 5% APR, 60 months', () => {
      // Test case: $40k price - $10k trade-in - $5k down = $25k loan
      const inputs: AutoLoanInputs = {
        autoPrice: 40000,
        downPayment: 5000,
        interestRate: 5,
        loanTerm: 60,
        tradeInValue: 10000,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(471.78, 2);
      expect(result.totalLoanAmount).toBe(25000);
      expect(result.totalInterest).toBeCloseTo(3306.85, 1);
      // Total cost includes down payment: 28306.85 (payments) + 5000 (down) = 33306.85
      expect(result.totalCost).toBeCloseTo(33306.85, 1);
    });

    it('should calculate monthly payment for $50k car with $10k down, $0 trade-in, 5% APR, 60 months', () => {
      // Our default test case
      const inputs: AutoLoanInputs = {
        autoPrice: 50000,
        downPayment: 10000,
        interestRate: 5,
        loanTerm: 60,
        tradeInValue: 0,
        salesTax: 7,
        otherFees: 2500,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(754.85, 2);
      expect(result.totalLoanAmount).toBe(40000);
      expect(result.totalInterest).toBeCloseTo(5290.96, 2);
      expect(result.totalCost).toBeCloseTo(55290.96, 2);
    });

    it('should handle 0% interest rate', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 30000,
        downPayment: 5000,
        interestRate: 0,
        loanTerm: 60,
        tradeInValue: 0,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(416.67, 2); // 25000 / 60
      expect(result.totalLoanAmount).toBe(25000);
      expect(result.totalInterest).toBeCloseTo(0, 2);
      expect(result.totalCost).toBe(30000);
    });

    it('should calculate for 36 month loan', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 25000,
        downPayment: 5000,
        interestRate: 4.5,
        loanTerm: 36,
        tradeInValue: 0,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(594.94, 2);
      expect(result.totalLoanAmount).toBe(20000);
      expect(result.totalInterest).toBeCloseTo(1417.79, 1);
    });

    it('should calculate for 72 month loan', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 35000,
        downPayment: 7000,
        interestRate: 6,
        loanTerm: 72,
        tradeInValue: 0,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.monthlyPayment).toBeCloseTo(464.04, 2);
      expect(result.totalLoanAmount).toBe(28000);
      expect(result.totalInterest).toBeCloseTo(5410.94, 1);
    });
  });

  describe('Calculations with tax/fees included in loan', () => {
    it('should include sales tax and fees in loan amount', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 50000,
        downPayment: 10000,
        interestRate: 5,
        loanTerm: 60,
        tradeInValue: 0,
        salesTax: 7, // 7% = $3,500
        otherFees: 2500,
        includeTaxFeesInLoan: true,
      };

      const result = calculateAutoLoan(inputs);

      // Loan amount should be: 50000 + 3500 (tax) + 2500 (fees) - 10000 (down) = 46000
      expect(result.totalLoanAmount).toBe(46000);
      expect(result.monthlyPayment).toBeCloseTo(868.08, 2);
    });

    it('should calculate with trade-in and tax/fees in loan', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 40000,
        downPayment: 5000,
        interestRate: 5,
        loanTerm: 60,
        tradeInValue: 10000,
        salesTax: 6, // 6% of $30,000 = $1,800
        otherFees: 1500,
        includeTaxFeesInLoan: true,
      };

      const result = calculateAutoLoan(inputs);

      // After trade-in: 40000 - 10000 = 30000
      // Tax: 30000 * 0.06 = 1800
      // Total needed: 30000 + 1800 + 1500 = 33300
      // Loan amount: 33300 - 5000 = 28300
      expect(result.totalLoanAmount).toBe(28300);
      expect(result.monthlyPayment).toBeCloseTo(534.06, 2);
    });
  });

  describe('Edge cases', () => {
    it('should handle very high interest rates', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 20000,
        downPayment: 2000,
        interestRate: 15,
        loanTerm: 60,
        tradeInValue: 0,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.totalLoanAmount).toBe(18000);
      expect(result.monthlyPayment).toBeCloseTo(428.22, 2);
      expect(result.totalInterest).toBeCloseTo(7693.12, 2);
    });

    it('should handle large down payment', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 30000,
        downPayment: 20000,
        interestRate: 4,
        loanTerm: 48,
        tradeInValue: 0,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      expect(result.totalLoanAmount).toBe(10000);
      expect(result.monthlyPayment).toBeCloseTo(225.79, 2);
    });

    it('should handle trade-in equal to price minus down payment', () => {
      const inputs: AutoLoanInputs = {
        autoPrice: 25000,
        downPayment: 10000,
        interestRate: 5,
        loanTerm: 60,
        tradeInValue: 15000,
        salesTax: 0,
        otherFees: 0,
        includeTaxFeesInLoan: false,
      };

      const result = calculateAutoLoan(inputs);

      // After trade-in: 25000 - 15000 = 10000
      // Loan: 10000 - 10000 = 0
      expect(result.totalLoanAmount).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalInterest).toBe(0);
    });
  });
});
