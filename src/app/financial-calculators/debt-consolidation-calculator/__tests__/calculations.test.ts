import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculatePayoffMonths,
  calculateWeightedAverageRate,
  calculateExistingDebtsSummary,
  calculateConsolidationSummary,
  calculateDebtConsolidation,
  validateConsolidationInputs,
  formatCurrency,
  formatPercentage,
  formatMonthsAsTime,
  type ExistingDebt,
  type ConsolidationLoan,
  type ConsolidationInputs,
} from '../calculations';

describe('Debt Consolidation Calculator', () => {
  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment correctly', () => {
      const payment = calculateMonthlyPayment(10000, 6, 12);
      expect(payment).toBeCloseTo(860.66, 1);
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

  describe('calculateTotalInterest', () => {
    it('should calculate total interest correctly', () => {
      const interest = calculateTotalInterest(10000, 860.66, 12);
      expect(interest).toBeCloseTo(327.92, 1);
    });

    it('should return 0 for 0% interest', () => {
      const interest = calculateTotalInterest(12000, 1000, 12);
      expect(interest).toBe(0);
    });
  });

  describe('calculatePayoffMonths', () => {
    it('should calculate payoff months correctly', () => {
      const months = calculatePayoffMonths(5000, 200, 18);
      expect(months).toBeGreaterThan(0);
      expect(months).toBeLessThan(60);
    });

    it('should return high number if payment is too low', () => {
      const months = calculatePayoffMonths(10000, 10, 20);
      expect(months).toBe(999);
    });

    it('should handle 0% interest', () => {
      const months = calculatePayoffMonths(6000, 500, 0);
      expect(months).toBe(12);
    });
  });

  describe('calculateWeightedAverageRate', () => {
    it('should calculate weighted average rate correctly', () => {
      const debts: ExistingDebt[] = [
        {
          name: 'Card 1',
          balance: 5000,
          monthlyPayment: 150,
          interestRate: 18,
        },
        {
          name: 'Card 2',
          balance: 3000,
          monthlyPayment: 100,
          interestRate: 15,
        },
        { name: 'Loan', balance: 2000, monthlyPayment: 80, interestRate: 12 },
      ];
      const avgRate = calculateWeightedAverageRate(debts);
      // (5000*18 + 3000*15 + 2000*12) / 10000 = 159000/10000 = 15.9
      expect(avgRate).toBeCloseTo(15.9, 1);
    });

    it('should return 0 for empty debts', () => {
      const avgRate = calculateWeightedAverageRate([]);
      expect(avgRate).toBe(0);
    });
  });

  describe('calculateExistingDebtsSummary', () => {
    it('should summarize existing debts correctly', () => {
      const debts: ExistingDebt[] = [
        {
          name: 'Card 1',
          balance: 5000,
          monthlyPayment: 200,
          interestRate: 18,
        },
        {
          name: 'Card 2',
          balance: 3000,
          monthlyPayment: 150,
          interestRate: 15,
        },
      ];
      const summary = calculateExistingDebtsSummary(debts);

      expect(summary.totalBalance).toBe(8000);
      expect(summary.totalMonthlyPayment).toBe(350);
      expect(summary.weightedAverageRate).toBeCloseTo(16.875, 2);
      expect(summary.totalInterest).toBeGreaterThan(0);
      expect(summary.payoffMonths).toBeGreaterThan(0);
    });
  });

  describe('calculateConsolidationSummary', () => {
    it('should calculate consolidation loan summary correctly', () => {
      const loan: ConsolidationLoan = {
        loanAmount: 10000,
        interestRate: 8,
        loanTermYears: 3,
        loanTermMonths: 0,
        loanFeePercent: 2,
      };
      const summary = calculateConsolidationSummary(loan);

      expect(summary.monthlyPayment).toBeGreaterThan(0);
      expect(summary.totalInterest).toBeGreaterThan(0);
      expect(summary.payoffMonths).toBe(36);
      expect(summary.loanFeeDollar).toBe(200);
      expect(summary.realAPR).toBeGreaterThan(loan.interestRate);
    });

    it('should handle loan with no fees', () => {
      const loan: ConsolidationLoan = {
        loanAmount: 5000,
        interestRate: 6,
        loanTermYears: 2,
        loanTermMonths: 0,
        loanFeePercent: 0,
      };
      const summary = calculateConsolidationSummary(loan);

      expect(summary.loanFeeDollar).toBe(0);
      expect(summary.realAPR).toBeCloseTo(loan.interestRate, 1);
    });
  });

  describe('calculateDebtConsolidation', () => {
    it('should determine consolidation is worthwhile when beneficial', () => {
      const inputs: ConsolidationInputs = {
        existingDebts: [
          {
            name: 'Card 1',
            balance: 5000,
            monthlyPayment: 200,
            interestRate: 20,
          },
          {
            name: 'Card 2',
            balance: 3000,
            monthlyPayment: 150,
            interestRate: 18,
          },
        ],
        consolidationLoan: {
          loanAmount: 8000,
          interestRate: 8,
          loanTermYears: 3,
          loanTermMonths: 0,
          loanFeePercent: 1,
        },
      };

      const results = calculateDebtConsolidation(inputs);

      expect(results.isWorthwhile).toBe(true);
      expect(results.savings.totalInterest).toBeGreaterThan(0);
      expect(results.recommendation).toContain('beneficial');
    });

    it('should warn when consolidation has higher APR', () => {
      const inputs: ConsolidationInputs = {
        existingDebts: [
          { name: 'Card', balance: 5000, monthlyPayment: 200, interestRate: 8 },
        ],
        consolidationLoan: {
          loanAmount: 5000,
          interestRate: 15,
          loanTermYears: 2,
          loanTermMonths: 0,
          loanFeePercent: 5,
        },
      };

      const results = calculateDebtConsolidation(inputs);

      expect(results.isWorthwhile).toBe(false);
      expect(results.recommendation).toContain('Warning');
    });
  });

  describe('validateConsolidationInputs', () => {
    it('should pass validation for valid inputs', () => {
      const inputs: ConsolidationInputs = {
        existingDebts: [
          {
            name: 'Card',
            balance: 5000,
            monthlyPayment: 200,
            interestRate: 18,
          },
        ],
        consolidationLoan: {
          loanAmount: 5000,
          interestRate: 8,
          loanTermYears: 3,
          loanTermMonths: 0,
          loanFeePercent: 2,
        },
      };

      const errors = validateConsolidationInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when no debts provided', () => {
      const inputs: ConsolidationInputs = {
        existingDebts: [],
        consolidationLoan: {
          loanAmount: 5000,
          interestRate: 8,
          loanTermYears: 3,
          loanTermMonths: 0,
          loanFeePercent: 2,
        },
      };

      const errors = validateConsolidationInputs(inputs);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('At least one existing debt');
    });

    it('should fail validation for invalid debt balance', () => {
      const inputs: ConsolidationInputs = {
        existingDebts: [
          { name: 'Card', balance: -100, monthlyPayment: 50, interestRate: 18 },
        ],
        consolidationLoan: {
          loanAmount: 5000,
          interestRate: 8,
          loanTermYears: 3,
          loanTermMonths: 0,
          loanFeePercent: 2,
        },
      };

      const errors = validateConsolidationInputs(inputs);
      expect(
        errors.some((e) => e.includes('Balance must be greater than 0'))
      ).toBe(true);
    });

    it('should fail validation for invalid loan term', () => {
      const inputs: ConsolidationInputs = {
        existingDebts: [
          {
            name: 'Card',
            balance: 5000,
            monthlyPayment: 200,
            interestRate: 18,
          },
        ],
        consolidationLoan: {
          loanAmount: 5000,
          interestRate: 8,
          loanTermYears: 0,
          loanTermMonths: 0,
          loanFeePercent: 2,
        },
      };

      const errors = validateConsolidationInputs(inputs);
      expect(
        errors.some((e) => e.includes('Loan term must be greater than 0'))
      ).toBe(true);
    });
  });

  describe('Formatting functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('should format percentage correctly', () => {
      expect(formatPercentage(5.5)).toBe('5.50%');
      expect(formatPercentage(18.75)).toBe('18.75%');
    });

    it('should format months as time correctly', () => {
      expect(formatMonthsAsTime(12)).toBe('1 year');
      expect(formatMonthsAsTime(24)).toBe('2 years');
      expect(formatMonthsAsTime(6)).toBe('6 months');
      expect(formatMonthsAsTime(18)).toBe('1 year 6 months');
      expect(formatMonthsAsTime(37)).toBe('3 years 1 month');
    });
  });
});
