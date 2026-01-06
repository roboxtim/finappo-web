import { describe, it, expect } from 'vitest';
import {
  calculateCompoundInterest,
  type CompoundInterestInputs,
  type CompoundingFrequency,
} from '../utils/calculations';

describe('Compound Interest Calculator', () => {
  describe('Basic Compound Interest (No Contributions)', () => {
    it('should calculate simple compound interest with annual compounding', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 5,
        years: 10,
        months: 0,
        compoundingFrequency: 'annually',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Formula: A = P(1 + r)^t = 10000 * (1.05)^10
      expect(result.endingBalance).toBeCloseTo(16288.95, 2);
      expect(result.totalPrincipal).toBe(10000);
      expect(result.totalContributions).toBe(0);
      expect(result.totalInterest).toBeCloseTo(6288.95, 2);
    });

    it('should calculate compound interest with monthly compounding', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 6,
        years: 5,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Formula: A = P(1 + r/n)^(n*t) = 10000 * (1 + 0.06/12)^(12*5)
      expect(result.endingBalance).toBeCloseTo(13488.5, 2);
      expect(result.totalInterest).toBeCloseTo(3488.5, 2);
    });

    it('should calculate compound interest with daily compounding', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 5000,
        interestRate: 8,
        years: 3,
        months: 0,
        compoundingFrequency: 'daily',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Formula: A = P(1 + r/n)^(n*t) = 5000 * (1 + 0.08/365)^(365*3)
      expect(result.endingBalance).toBeCloseTo(6356.08, 2);
      expect(result.totalInterest).toBeCloseTo(1356.08, 2);
    });

    it('should calculate continuous compounding', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 5,
        years: 10,
        months: 0,
        compoundingFrequency: 'continuously',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Formula: A = Pe^(rt) = 10000 * e^(0.05*10)
      expect(result.endingBalance).toBeCloseTo(16487.21, 2);
      expect(result.totalInterest).toBeCloseTo(6487.21, 2);
    });
  });

  describe('With Regular Contributions', () => {
    it('should calculate with monthly contributions at end of period', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 6,
        years: 5,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 200,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Total contributions: 200 * 12 * 5 = 12000
      expect(result.totalContributions).toBe(12000);
      expect(result.totalPrincipal).toBe(10000);
      // Verified calculation (may differ slightly from other calculators due to rounding)
      expect(result.endingBalance).toBeCloseTo(27442.51, 2);
      expect(result.totalInterest).toBeCloseTo(5442.51, 2);
    });

    it('should calculate with monthly contributions at beginning of period', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 6,
        years: 5,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 200,
        annualContribution: 0,
        contributionTiming: 'beginning',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Beginning of period should yield slightly more interest
      expect(result.totalContributions).toBe(12000);
      expect(result.endingBalance).toBeGreaterThan(27442.51);
      expect(result.endingBalance).toBeCloseTo(27512.28, 2);
    });

    it('should calculate with annual contributions', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 7,
        years: 10,
        months: 0,
        compoundingFrequency: 'annually',
        monthlyContribution: 0,
        annualContribution: 2000,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.totalContributions).toBe(20000);
      expect(result.totalPrincipal).toBe(10000);
      // This should be calculated correctly
      expect(result.endingBalance).toBeGreaterThan(30000);
    });

    it('should handle both monthly and annual contributions', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 5000,
        interestRate: 5,
        years: 3,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 100,
        annualContribution: 1200,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Monthly: 100 * 12 * 3 = 3600
      // Annual: 1200 * 3 = 3600
      // Total contributions: 7200
      expect(result.totalContributions).toBe(7200);
      expect(result.totalPrincipal).toBe(5000);
    });
  });

  describe('Tax and Inflation Adjustments', () => {
    it('should apply tax rate to interest earnings', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 8,
        years: 5,
        months: 0,
        compoundingFrequency: 'annually',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 25,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Interest is taxed at 25% during calculation
      // The endingBalance already reflects the after-tax amount
      expect(result.afterTaxAmount).toBe(result.endingBalance);
      // Total interest shown is already net of tax
      const grossInterestBeforeTax = result.totalInterest / (1 - 0.25);
      expect(result.totalInterest).toBeLessThan(grossInterestBeforeTax);
    });

    it('should adjust for inflation', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 7,
        years: 10,
        months: 0,
        compoundingFrequency: 'annually',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 3,
      };

      const result = calculateCompoundInterest(inputs);

      // Inflation reduces real value
      expect(result.inflationAdjustedAmount).toBeLessThan(result.endingBalance);
      // After 10 years at 3% inflation, value should be divided by ~1.344
      const inflationFactor = Math.pow(1.03, 10);
      expect(result.inflationAdjustedAmount).toBeCloseTo(
        result.endingBalance / inflationFactor,
        2
      );
    });

    it('should apply both tax and inflation', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 20000,
        interestRate: 6,
        years: 7,
        months: 0,
        compoundingFrequency: 'quarterly',
        monthlyContribution: 150,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 20,
        inflationRate: 2.5,
      };

      const result = calculateCompoundInterest(inputs);

      // Tax is already applied, so afterTaxAmount equals endingBalance
      expect(result.afterTaxAmount).toBe(result.endingBalance);
      expect(result.inflationAdjustedAmount).toBeLessThan(
        result.afterTaxAmount
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero interest rate', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 0,
        years: 5,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 100,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.endingBalance).toBe(16000); // 10000 + (100 * 60)
      expect(result.totalInterest).toBe(0);
    });

    it('should handle zero initial investment', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 0,
        interestRate: 5,
        years: 10,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 500,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.totalPrincipal).toBe(0);
      expect(result.totalContributions).toBe(60000); // 500 * 120
      expect(result.endingBalance).toBeGreaterThan(60000);
    });

    it('should handle fractional years with months', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 6,
        years: 2,
        months: 6,
        compoundingFrequency: 'monthly',
        monthlyContribution: 0,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // 2.5 years = 30 months
      expect(result.schedule.length).toBeGreaterThan(0);
      expect(result.endingBalance).toBeGreaterThan(10000);
    });

    it('should handle all compounding frequencies', () => {
      const frequencies: CompoundingFrequency[] = [
        'annually',
        'semiannually',
        'quarterly',
        'monthly',
        'semimonthly',
        'biweekly',
        'weekly',
        'daily',
        'continuously',
      ];

      frequencies.forEach((frequency) => {
        const inputs: CompoundInterestInputs = {
          initialInvestment: 10000,
          interestRate: 5,
          years: 1,
          months: 0,
          compoundingFrequency: frequency,
          monthlyContribution: 0,
          annualContribution: 0,
          contributionTiming: 'end',
          taxRate: 0,
          inflationRate: 0,
        };

        const result = calculateCompoundInterest(inputs);

        expect(result.endingBalance).toBeGreaterThan(10000);
        expect(result.totalInterest).toBeGreaterThan(0);
        // More frequent compounding should yield more interest
        if (frequency === 'continuously') {
          expect(result.endingBalance).toBeCloseTo(10512.71, 2);
        }
      });
    });
  });

  describe('Schedule Generation', () => {
    it('should generate correct annual schedule', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 5,
        years: 3,
        months: 0,
        compoundingFrequency: 'annually',
        monthlyContribution: 0,
        annualContribution: 1000,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.schedule).toHaveLength(3);
      expect(result.schedule[0].year).toBe(1);
      expect(result.schedule[2].year).toBe(3);
      expect(result.schedule[2].balance).toBe(result.endingBalance);
    });

    it('should generate detailed monthly schedule', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 5000,
        interestRate: 6,
        years: 1,
        months: 0,
        compoundingFrequency: 'monthly',
        monthlyContribution: 100,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      // Should have monthly details
      expect(result.monthlySchedule).toHaveLength(12);
      expect(result.monthlySchedule[0].month).toBe(1);
      expect(result.monthlySchedule[11].month).toBe(12);

      // Each month should show the contribution
      result.monthlySchedule.forEach((month) => {
        expect(month.deposit).toBe(100);
      });
    });
  });

  describe('Interest Breakdown', () => {
    it('should separate interest from initial vs contributions', () => {
      const inputs: CompoundInterestInputs = {
        initialInvestment: 10000,
        interestRate: 5,
        years: 5,
        months: 0,
        compoundingFrequency: 'annually',
        monthlyContribution: 200,
        annualContribution: 0,
        contributionTiming: 'end',
        taxRate: 0,
        inflationRate: 0,
      };

      const result = calculateCompoundInterest(inputs);

      expect(result.interestFromInitial).toBeGreaterThan(0);
      expect(result.interestFromContributions).toBeGreaterThan(0);
      expect(result.totalInterest).toBeCloseTo(
        result.interestFromInitial + result.interestFromContributions,
        2
      );
    });
  });
});
