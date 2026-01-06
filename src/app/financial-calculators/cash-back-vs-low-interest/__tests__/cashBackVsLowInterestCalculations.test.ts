/**
 * Tests for Cash Back vs Low Interest Calculator
 *
 * These tests verify the accuracy of calculations for comparing
 * cash back rebates versus low interest rate financing options.
 */

import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateFinancingOption,
  calculateBreakEvenMonths,
  calculateCashBackVsLowInterest,
  validateInputs,
  type CashBackVsLowInterestInputs,
} from '../utils/calculations';

describe('Cash Back vs Low Interest Calculator', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment for standard loan', () => {
      // $20,000 loan at 5% for 60 months
      const payment = calculateMonthlyPayment(20000, 5, 60);
      expect(payment).toBeCloseTo(377.42, 2);
    });

    it('should calculate monthly payment for 0% interest', () => {
      // $24,000 loan at 0% for 48 months
      const payment = calculateMonthlyPayment(24000, 0, 48);
      expect(payment).toBeCloseTo(500, 2);
    });

    it('should handle high interest rates', () => {
      // $15,000 loan at 12% for 36 months
      const payment = calculateMonthlyPayment(15000, 12, 36);
      expect(payment).toBeCloseTo(498.21, 2);
    });

    it('should return 0 for zero loan amount', () => {
      const payment = calculateMonthlyPayment(0, 5, 60);
      expect(payment).toBe(0);
    });

    it('should return 0 for zero months', () => {
      const payment = calculateMonthlyPayment(20000, 5, 0);
      expect(payment).toBe(0);
    });
  });

  describe('calculateTotalInterest', () => {
    it('should calculate total interest correctly', () => {
      const monthlyPayment = 377.42;
      const loanAmount = 20000;
      const months = 60;
      const interest = calculateTotalInterest(
        monthlyPayment,
        loanAmount,
        months
      );
      expect(interest).toBeCloseTo(2645.2, 1);
    });

    it('should return 0 for 0% interest loans', () => {
      const monthlyPayment = 500;
      const loanAmount = 24000;
      const months = 48;
      const interest = calculateTotalInterest(
        monthlyPayment,
        loanAmount,
        months
      );
      expect(interest).toBeCloseTo(0, 2);
    });

    it('should never return negative interest', () => {
      const interest = calculateTotalInterest(100, 10000, 12);
      expect(interest).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateFinancingOption', () => {
    it('should calculate financing details with cash back', () => {
      const result = calculateFinancingOption(
        30000, // purchase price
        5000, // down payment
        2000, // cash back
        6, // annual rate
        60 // months
      );

      expect(result.loanAmount).toBe(23000);
      expect(result.monthlyPayment).toBeCloseTo(444.65, 1);
      expect(result.totalInterest).toBeCloseTo(3679.26, 1);
      expect(result.totalCost).toBeCloseTo(26679.26, 1);
      expect(result.totalPaid).toBeCloseTo(31679.26, 1);
    });

    it('should calculate financing details without cash back', () => {
      const result = calculateFinancingOption(
        30000, // purchase price
        5000, // down payment
        0, // no cash back
        2, // annual rate
        60 // months
      );

      expect(result.loanAmount).toBe(25000);
      expect(result.monthlyPayment).toBeCloseTo(438.19, 1);
      expect(result.totalInterest).toBeCloseTo(1291.64, 1);
      expect(result.totalCost).toBeCloseTo(26291.64, 1);
      expect(result.totalPaid).toBeCloseTo(31291.64, 1);
    });

    it('should handle zero down payment', () => {
      const result = calculateFinancingOption(
        25000, // purchase price
        0, // no down payment
        1500, // cash back
        5, // annual rate
        48 // months
      );

      expect(result.loanAmount).toBe(23500);
      expect(result.monthlyPayment).toBeCloseTo(541.19, 1);
      expect(result.totalInterest).toBeCloseTo(2477.04, 0);
      expect(result.totalPaid).toBeCloseTo(25977.04, 0);
    });
  });

  describe('calculateBreakEvenMonths', () => {
    it('should calculate break-even point when low interest saves money monthly', () => {
      const cashBackPayment = 444.82;
      const lowInterestPayment = 438.71;
      const cashBack = 2000;

      const breakEven = calculateBreakEvenMonths(
        cashBackPayment,
        lowInterestPayment,
        cashBack
      );

      // It takes about 327 months for the monthly savings to equal the $2000 cash back
      expect(breakEven).toBeCloseTo(328, 0);
    });

    it('should return null when low interest payment is higher', () => {
      const cashBackPayment = 400;
      const lowInterestPayment = 450;
      const cashBack = 2000;

      const breakEven = calculateBreakEvenMonths(
        cashBackPayment,
        lowInterestPayment,
        cashBack
      );

      expect(breakEven).toBeNull();
    });

    it('should return null when payments are equal', () => {
      const breakEven = calculateBreakEvenMonths(400, 400, 2000);
      expect(breakEven).toBeNull();
    });
  });

  describe('calculateCashBackVsLowInterest - Full Scenarios', () => {
    it('Test Case 1: $30k car, $2k cash back, 6% vs 2%, 60 months, $5k down', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $23,000 financed at 6%
      expect(results.cashBackOption.loanAmount).toBe(23000);
      expect(results.cashBackOption.monthlyPayment).toBeCloseTo(444.65, 1);
      expect(results.cashBackOption.totalInterest).toBeCloseTo(3679.26, 1);
      expect(results.cashBackOption.totalPaid).toBeCloseTo(31679.26, 1);

      // Low Interest Option: $25,000 financed at 2%
      expect(results.lowInterestOption.loanAmount).toBe(25000);
      expect(results.lowInterestOption.monthlyPayment).toBeCloseTo(438.19, 1);
      expect(results.lowInterestOption.totalInterest).toBeCloseTo(1291.64, 1);
      expect(results.lowInterestOption.totalPaid).toBeCloseTo(31291.64, 1);

      // Low interest is better (saves ~$387.62)
      expect(results.recommendation).toBe('lowInterest');
      expect(results.savings).toBeCloseTo(387.62, 1);
    });

    it('Test Case 2: $25k car, $1.5k cash back, 5% vs 0%, 48 months, no down payment', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 25000,
        cashBack: 1500,
        standardRate: 5,
        reducedRate: 0,
        loanTermMonths: 48,
        downPayment: 0,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $23,500 financed at 5%
      expect(results.cashBackOption.loanAmount).toBe(23500);
      expect(results.cashBackOption.monthlyPayment).toBeCloseTo(541.19, 1);
      expect(results.cashBackOption.totalInterest).toBeCloseTo(2477.04, 0);
      expect(results.cashBackOption.totalPaid).toBeCloseTo(25977.04, 0);

      // Low Interest Option: $25,000 financed at 0%
      expect(results.lowInterestOption.loanAmount).toBe(25000);
      expect(results.lowInterestOption.monthlyPayment).toBeCloseTo(520.83, 1);
      expect(results.lowInterestOption.totalInterest).toBeCloseTo(0, 0);
      expect(results.lowInterestOption.totalPaid).toBeCloseTo(25000, 0);

      // Low interest is better (saves ~$977.04)
      expect(results.recommendation).toBe('lowInterest');
      expect(results.savings).toBeCloseTo(977.04, 0);
    });

    it('Test Case 3: $40k car, $3k cash back, 7% vs 3.5%, 72 months, $8k down', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 40000,
        cashBack: 3000,
        standardRate: 7,
        reducedRate: 3.5,
        loanTermMonths: 72,
        downPayment: 8000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $29,000 financed at 7%
      expect(results.cashBackOption.loanAmount).toBe(29000);
      expect(results.cashBackOption.monthlyPayment).toBeCloseTo(494.42, 1);
      expect(results.cashBackOption.totalInterest).toBeCloseTo(6598.33, 0);
      expect(results.cashBackOption.totalPaid).toBeCloseTo(43598.33, 0);

      // Low Interest Option: $32,000 financed at 3.5%
      expect(results.lowInterestOption.loanAmount).toBe(32000);
      expect(results.lowInterestOption.monthlyPayment).toBeCloseTo(493.39, 1);
      expect(results.lowInterestOption.totalInterest).toBeCloseTo(3524.08, 0);
      expect(results.lowInterestOption.totalPaid).toBeCloseTo(43524.08, 0);

      // Low interest is better (saves ~$74.25)
      expect(results.recommendation).toBe('lowInterest');
      expect(results.savings).toBeCloseTo(74.25, 0);
    });

    it('Test Case 4: Large cash back makes it clearly better', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 5000,
        standardRate: 5,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 3000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $22,000 financed at 5%
      expect(results.cashBackOption.loanAmount).toBe(22000);
      expect(results.cashBackOption.monthlyPayment).toBeCloseTo(415.17, 2);

      // Low Interest Option: $27,000 financed at 2%
      expect(results.lowInterestOption.loanAmount).toBe(27000);
      expect(results.lowInterestOption.monthlyPayment).toBeCloseTo(473.25, 1);

      // Cash back should be better
      expect(results.recommendation).toBe('cashBack');
      expect(results.cashBackOption.totalPaid).toBeLessThan(
        results.lowInterestOption.totalPaid
      );
    });

    it('Test Case 5: Very low interest rate (0.9%) makes it better', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 35000,
        cashBack: 2000,
        standardRate: 5,
        reducedRate: 0.9,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $28,000 financed at 5%
      expect(results.cashBackOption.loanAmount).toBe(28000);

      // Low Interest Option: $30,000 financed at 0.9%
      expect(results.lowInterestOption.loanAmount).toBe(30000);

      // Low interest should be better due to very low rate
      expect(results.recommendation).toBe('lowInterest');
    });

    it('Test Case 6: Short term loan (24 months)', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 20000,
        cashBack: 1000,
        standardRate: 4,
        reducedRate: 1,
        loanTermMonths: 24,
        downPayment: 2000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $17,000 financed at 4%
      expect(results.cashBackOption.loanAmount).toBe(17000);
      expect(results.cashBackOption.monthlyPayment).toBeCloseTo(738.22, 1);

      // Low Interest Option: $18,000 financed at 1%
      expect(results.lowInterestOption.loanAmount).toBe(18000);
      expect(results.lowInterestOption.monthlyPayment).toBeCloseTo(757.84, 1);

      // Should favor cash back for short terms
      expect(results.recommendation).toBe('cashBack');
    });

    it('Test Case 7: Long term loan (84 months)', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 45000,
        cashBack: 2500,
        standardRate: 6,
        reducedRate: 2.5,
        loanTermMonths: 84,
        downPayment: 10000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash Back Option: $32,500 financed at 6%
      expect(results.cashBackOption.loanAmount).toBe(32500);
      expect(results.cashBackOption.monthlyPayment).toBeCloseTo(474.78, 1);

      // Low Interest Option: $35,000 financed at 2.5%
      expect(results.lowInterestOption.loanAmount).toBe(35000);
      expect(results.lowInterestOption.monthlyPayment).toBeCloseTo(454.62, 1);

      // Long term favors low interest
      expect(results.recommendation).toBe('lowInterest');
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum cash back equal to financed amount', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 20000,
        cashBack: 15000, // Very high cash back
        standardRate: 5,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      // Cash back option should have minimal financing
      expect(results.cashBackOption.loanAmount).toBe(0);
      expect(results.cashBackOption.monthlyPayment).toBe(0);
      expect(results.cashBackOption.totalInterest).toBe(0);
    });

    it('should handle 0% interest on both options', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 25000,
        cashBack: 2000,
        standardRate: 0,
        reducedRate: 0,
        loanTermMonths: 48,
        downPayment: 5000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      expect(results.cashBackOption.totalInterest).toBe(0);
      expect(results.lowInterestOption.totalInterest).toBe(0);
      expect(results.recommendation).toBe('cashBack'); // Cash back wins with no interest
    });

    it('should handle same interest rates (cash back always wins)', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: 4,
        reducedRate: 4, // Same as standard
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      expect(results.recommendation).toBe('cashBack');
      expect(results.savings).toBeCloseTo(2209.98, 1);
    });

    it('should handle very small loan amounts', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 5000,
        cashBack: 500,
        standardRate: 5,
        reducedRate: 2,
        loanTermMonths: 36,
        downPayment: 1000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      expect(results.cashBackOption.loanAmount).toBe(3500);
      expect(results.lowInterestOption.loanAmount).toBe(4000);
      expect(results.recommendation).toBeDefined();
    });

    it('should handle very large loan amounts', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 100000,
        cashBack: 5000,
        standardRate: 6,
        reducedRate: 3,
        loanTermMonths: 72,
        downPayment: 20000,
      };

      const results = calculateCashBackVsLowInterest(inputs);

      expect(results.cashBackOption.loanAmount).toBe(75000);
      expect(results.lowInterestOption.loanAmount).toBe(80000);
      expect(results.recommendation).toBeDefined();
    });
  });

  describe('validateInputs', () => {
    it('should validate correct inputs', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should catch invalid purchase price', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 0,
        cashBack: 2000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toContain('Purchase price must be greater than 0');
    });

    it('should catch negative cash back', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: -1000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toContain('Cash back cannot be negative');
    });

    it('should catch cash back exceeding purchase price', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 35000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toContain('Cash back cannot exceed purchase price');
    });

    it('should catch reduced rate higher than standard rate', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: 2,
        reducedRate: 6, // Higher than standard
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toContain(
        'Reduced rate should be lower than standard rate'
      );
    });

    it('should catch negative interest rates', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: -1,
        reducedRate: -2,
        loanTermMonths: 60,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should catch invalid loan term', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 0,
        downPayment: 5000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toContain('Loan term must be greater than 0 months');
    });

    it('should catch down payment exceeding purchase price', () => {
      const inputs: CashBackVsLowInterestInputs = {
        purchasePrice: 30000,
        cashBack: 2000,
        standardRate: 6,
        reducedRate: 2,
        loanTermMonths: 60,
        downPayment: 35000,
      };

      const errors = validateInputs(inputs);
      expect(errors).toContain('Down payment must be less than purchase price');
    });
  });
});
