import { describe, it, expect } from 'vitest';
import {
  calculateFutureValueOfSavings,
  calculateTotalCollegeCost,
  calculateMonthlySavings,
  calculateCollegeCost,
  validateInputs,
  COLLEGE_PRESETS,
} from '../calculations';

describe('College Cost Calculator', () => {
  describe('calculateFutureValueOfSavings', () => {
    it('should calculate future value with compound interest', () => {
      const futureValue = calculateFutureValueOfSavings(10000, 7, 0, 10);
      expect(futureValue).toBeCloseTo(19671.51, 0);
    });

    it('should account for tax on returns', () => {
      // With 25% tax rate, effective rate is 7% * 0.75 = 5.25%
      const futureValue = calculateFutureValueOfSavings(10000, 7, 25, 10);
      expect(futureValue).toBeCloseTo(16680.96, 0);
    });

    it('should handle 0% return rate', () => {
      const futureValue = calculateFutureValueOfSavings(10000, 0, 0, 10);
      expect(futureValue).toBe(10000);
    });

    it('should handle 0% tax rate (like 529 plans)', () => {
      const futureValueNoTax = calculateFutureValueOfSavings(10000, 7, 0, 10);
      const futureValueWithTax = calculateFutureValueOfSavings(
        10000,
        7,
        20,
        10
      );
      expect(futureValueNoTax).toBeGreaterThan(futureValueWithTax);
    });
  });

  describe('calculateTotalCollegeCost', () => {
    it('should calculate total costs with inflation', () => {
      const { total, yearByYear } = calculateTotalCollegeCost(30000, 5, 0, 4);

      expect(yearByYear).toHaveLength(4);
      expect(total).toBeGreaterThan(120000); // More than 4 * 30000 due to inflation
      expect(total).toBeCloseTo(129303.75, 0);
    });

    it('should apply inflation starting from future year', () => {
      const { total, yearByYear } = calculateTotalCollegeCost(30000, 5, 10, 4);

      // First year cost should be inflated by 10 years
      expect(yearByYear[0].annualCost).toBeCloseTo(48866.85, 0);
      expect(total).toBeGreaterThan(200000);
    });

    it('should handle 0% inflation', () => {
      const { total, yearByYear } = calculateTotalCollegeCost(30000, 0, 0, 4);

      expect(total).toBe(120000);
      yearByYear.forEach((year) => {
        expect(year.annualCost).toBe(30000);
      });
    });

    it('should calculate cumulative costs correctly', () => {
      const { yearByYear } = calculateTotalCollegeCost(30000, 5, 0, 4);

      expect(yearByYear[0].cumulativeCost).toBe(yearByYear[0].annualCost);
      expect(yearByYear[1].cumulativeCost).toBe(
        yearByYear[0].annualCost + yearByYear[1].annualCost
      );
    });
  });

  describe('calculateMonthlySavings', () => {
    it('should calculate required monthly savings', () => {
      const monthlySavings = calculateMonthlySavings(100000, 10000, 7, 0, 10);

      expect(monthlySavings).toBeGreaterThan(0);
      expect(monthlySavings).toBeCloseTo(464.1, 1);
    });

    it('should return 0 if current savings already meet target', () => {
      const monthlySavings = calculateMonthlySavings(10000, 50000, 7, 0, 10);

      expect(monthlySavings).toBe(0);
    });

    it('should return 0 if no time to save', () => {
      const monthlySavings = calculateMonthlySavings(100000, 10000, 7, 0, 0);

      expect(monthlySavings).toBe(0);
    });

    it('should handle 0% return rate', () => {
      const monthlySavings = calculateMonthlySavings(120000, 0, 0, 0, 10);

      expect(monthlySavings).toBe(1000); // 120000 / 120 months
    });

    it('should account for tax on returns', () => {
      const noTax = calculateMonthlySavings(100000, 10000, 7, 0, 10);
      const withTax = calculateMonthlySavings(100000, 10000, 7, 25, 10);

      expect(withTax).toBeGreaterThan(noTax);
    });
  });

  describe('calculateCollegeCost', () => {
    it('should calculate complete college cost scenario', () => {
      const results = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(results.totalCollegeCost).toBeGreaterThan(0);
      expect(results.futureValueOfSavings).toBeGreaterThan(10000);
      expect(results.additionalSavingsNeeded).toBeGreaterThan(0);
      expect(results.monthlySavingsRequired).toBeGreaterThan(0);
      expect(results.yearByYearCosts).toHaveLength(4);
    });

    it('should calculate with private 4-year college costs', () => {
      const results = calculateCollegeCost({
        annualCost: COLLEGE_PRESETS['private-4year'],
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 50000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 15,
      });

      expect(results.totalCollegeCost).toBeGreaterThan(500000);
    });

    it('should handle partial savings coverage', () => {
      const results = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 50, // Only covering 50%
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      const halfCost = results.totalCollegeCost * 0.5;
      expect(results.additionalSavingsNeeded).toBeLessThan(halfCost);
    });

    it('should show 100% coverage if savings exceed needs', () => {
      const results = calculateCollegeCost({
        annualCost: 10000,
        costIncreaseRate: 2,
        attendanceDuration: 2,
        percentFromSavings: 100,
        currentSavings: 100000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(results.percentCoveredBySavings).toBeGreaterThan(100);
      expect(results.monthlySavingsRequired).toBe(0);
    });

    it('should calculate correctly with 529 plan (0% tax)', () => {
      const with529 = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0, // 529 plan
        yearsUntilCollege: 10,
      });

      const withTax = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 25, // Taxable account
        yearsUntilCollege: 10,
      });

      expect(with529.futureValueOfSavings).toBeGreaterThan(
        withTax.futureValueOfSavings
      );
      expect(with529.monthlySavingsRequired).toBeLessThan(
        withTax.monthlySavingsRequired
      );
    });

    it('should handle starting college immediately', () => {
      const results = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 50000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 0,
      });

      expect(results.futureValueOfSavings).toBe(50000); // No growth
      expect(results.monthlySavingsRequired).toBe(0); // No time to save
    });
  });

  describe('College Presets', () => {
    it('should have correct preset values', () => {
      expect(COLLEGE_PRESETS['private-4year']).toBe(65470);
      expect(COLLEGE_PRESETS['public-instate-4year']).toBe(30990);
      expect(COLLEGE_PRESETS['public-outstate-4year']).toBe(50920);
      expect(COLLEGE_PRESETS['public-2year']).toBe(21320);
      expect(COLLEGE_PRESETS.custom).toBe(0);
    });
  });

  describe('validateInputs', () => {
    it('should validate correct inputs', () => {
      const errors = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(errors).toHaveLength(0);
    });

    it('should reject negative annual cost', () => {
      const errors = validateInputs({
        annualCost: -1000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Annual cost');
    });

    it('should reject invalid cost increase rate', () => {
      const errors = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 150,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject attendance duration out of range', () => {
      const errorsLow = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 0,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      const errorsHigh = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 15,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(errorsLow.length).toBeGreaterThan(0);
      expect(errorsHigh.length).toBeGreaterThan(0);
    });

    it('should reject invalid percent from savings', () => {
      const errors = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 150,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative current savings', () => {
      const errors = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: -5000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject years until college out of range', () => {
      const errors = validateInputs({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 35,
      });

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high inflation rates', () => {
      const results = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 20, // 20% inflation
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 10,
      });

      expect(results.totalCollegeCost).toBeGreaterThan(500000);
    });

    it('should handle very long time horizons', () => {
      const results = calculateCollegeCost({
        annualCost: 30000,
        costIncreaseRate: 5,
        attendanceDuration: 4,
        percentFromSavings: 100,
        currentSavings: 1000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 18,
      });

      expect(results.futureValueOfSavings).toBeGreaterThan(1000);
      expect(results.totalCollegeCost).toBeGreaterThan(200000);
    });

    it('should handle 2-year college scenario', () => {
      const results = calculateCollegeCost({
        annualCost: COLLEGE_PRESETS['public-2year'],
        costIncreaseRate: 5,
        attendanceDuration: 2,
        percentFromSavings: 100,
        currentSavings: 10000,
        returnRate: 7,
        taxRate: 0,
        yearsUntilCollege: 5,
      });

      expect(results.yearByYearCosts).toHaveLength(2);
      expect(results.totalCollegeCost).toBeLessThan(100000);
    });
  });
});
