import { describe, it, expect } from 'vitest';
import {
  calculateAverageReturn,
  calculateGeometricMean,
  calculateArithmeticMean,
  calculateAnnualizedReturn,
  type ReturnPeriod,
} from '../utils/calculations';

describe('Average Return Calculator', () => {
  describe('Arithmetic Mean', () => {
    it('should calculate simple arithmetic mean of returns', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 10, years: 1, months: 0 },
        { returnPercent: 20, years: 1, months: 0 },
        { returnPercent: 15, years: 1, months: 0 },
      ];

      const result = calculateArithmeticMean(periods);
      expect(result).toBeCloseTo(15, 2); // (10 + 20 + 15) / 3 = 15%
    });

    it('should handle negative returns', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 10, years: 1, months: 0 },
        { returnPercent: -5, years: 1, months: 0 },
        { returnPercent: 15, years: 1, months: 0 },
      ];

      const result = calculateArithmeticMean(periods);
      expect(result).toBeCloseTo(6.67, 2); // (10 - 5 + 15) / 3 = 6.67%
    });

    it('should handle single period', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 25, years: 1, months: 0 },
      ];

      const result = calculateArithmeticMean(periods);
      expect(result).toBeCloseTo(25, 2);
    });

    it('should return 0 for empty array', () => {
      const periods: ReturnPeriod[] = [];
      const result = calculateArithmeticMean(periods);
      expect(result).toBe(0);
    });
  });

  describe('Geometric Mean', () => {
    it('should calculate geometric mean of positive returns', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 10, years: 1, months: 0 },
        { returnPercent: 20, years: 1, months: 0 },
        { returnPercent: 15, years: 1, months: 0 },
      ];

      const result = calculateGeometricMean(periods);
      // (1.10 * 1.20 * 1.15)^(1/3) - 1 = 1.518^(1/3) - 1 = 14.93%
      expect(result).toBeCloseTo(14.93, 2);
    });

    it('should handle negative returns correctly', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 10, years: 1, months: 0 },
        { returnPercent: -10, years: 1, months: 0 },
        { returnPercent: 10, years: 1, months: 0 },
      ];

      const result = calculateGeometricMean(periods);
      // (1.10 * 0.90 * 1.10)^(1/3) - 1 = 1.089^(1/3) - 1 = 2.88%
      expect(result).toBeCloseTo(2.88, 2);
    });

    it('should handle large positive returns', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 50, years: 1, months: 0 },
        { returnPercent: 60, years: 1, months: 0 },
      ];

      const result = calculateGeometricMean(periods);
      // (1.50 * 1.60)^(1/2) - 1 = 2.4^(1/2) - 1 = 54.92%
      expect(result).toBeCloseTo(54.92, 2);
    });

    it('should handle mix of positive and negative returns', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 25, years: 1, months: 0 },
        { returnPercent: -20, years: 1, months: 0 },
        { returnPercent: 15, years: 1, months: 0 },
      ];

      const result = calculateGeometricMean(periods);
      // (1.25 * 0.80 * 1.15)^(1/3) - 1 = 1.15^(1/3) - 1 = 4.77%
      expect(result).toBeCloseTo(4.77, 2);
    });

    it('should return 0 when product equals initial investment', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 50, years: 1, months: 0 },
        { returnPercent: -33.33, years: 1, months: 0 },
      ];

      const result = calculateGeometricMean(periods);
      // (1.50 * 0.6667)^(1/2) - 1 ≈ 0%
      expect(result).toBeCloseTo(0, 1);
    });

    it('should handle single period', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 18.5, years: 1, months: 0 },
      ];

      const result = calculateGeometricMean(periods);
      expect(result).toBeCloseTo(18.5, 2);
    });
  });

  describe('Annualized Return', () => {
    it('should annualize return for multi-year period', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 10, years: 2, months: 0 },
        { returnPercent: 15, years: 3, months: 0 },
      ];

      const result = calculateAnnualizedReturn(periods);
      // Total return: (1.10 * 1.15)^(1/1) - 1 = 26.5%
      // Total years: 5
      // Annualized: (1.265)^(1/5) - 1 = 4.81%
      expect(result).toBeCloseTo(4.81, 2);
    });

    it('should handle months in annualization', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 20, years: 1, months: 6 },
      ];

      const result = calculateAnnualizedReturn(periods);
      // 1.5 years total
      // (1.20)^(1/1.5) - 1 = 12.92%
      expect(result).toBeCloseTo(12.92, 2);
    });

    it('should handle less than one year period', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 5, years: 0, months: 6 },
      ];

      const result = calculateAnnualizedReturn(periods);
      // 0.5 years total
      // (1.05)^(1/0.5) - 1 = (1.05)^2 - 1 = 10.25%
      expect(result).toBeCloseTo(10.25, 2);
    });

    it('should handle negative returns', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: -10, years: 2, months: 0 },
      ];

      const result = calculateAnnualizedReturn(periods);
      // (0.90)^(1/2) - 1 = -5.13%
      expect(result).toBeCloseTo(-5.13, 2);
    });

    it('should handle mixed periods with months', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 12, years: 1, months: 3 },
        { returnPercent: 8, years: 2, months: 6 },
      ];

      const result = calculateAnnualizedReturn(periods);
      // Total: 1.25 + 2.5 = 3.75 years
      // Compound: (1.12 * 1.08)^(1/1) - 1 = 20.96%
      // Annualized: (1.2096)^(1/3.75) - 1 = 5.21%
      expect(result).toBeCloseTo(5.21, 2);
    });
  });

  describe('Complete Average Return Calculation', () => {
    it('should calculate all return metrics correctly - Test Case 1', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 10, years: 1, months: 0 },
        { returnPercent: 5, years: 1, months: 0 },
        { returnPercent: 8, years: 1, months: 0 },
        { returnPercent: 12, years: 1, months: 0 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBeCloseTo(8.75, 2); // (10+5+8+12)/4
      expect(result.geometricMean).toBeCloseTo(8.72, 2); // (1.10*1.05*1.08*1.12)^0.25 - 1
      expect(result.annualizedReturn).toBeCloseTo(8.72, 2); // Same as geometric for equal periods
      expect(result.totalPeriods).toBe(4);
      expect(result.totalYears).toBe(4);
      expect(result.cumulativeReturn).toBeCloseTo(39.71, 2); // 1.10*1.05*1.08*1.12 - 1
    });

    it('should calculate all return metrics correctly - Test Case 2 (with negative)', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 20, years: 1, months: 0 },
        { returnPercent: -15, years: 1, months: 0 },
        { returnPercent: 10, years: 1, months: 0 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBeCloseTo(5, 2); // (20-15+10)/3
      expect(result.geometricMean).toBeCloseTo(3.91, 2); // (1.20*0.85*1.10)^(1/3) - 1
      expect(result.cumulativeReturn).toBeCloseTo(12.2, 2); // 1.20*0.85*1.10 - 1
    });

    it('should calculate all return metrics correctly - Test Case 3 (mixed periods)', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 15, years: 2, months: 0 },
        { returnPercent: 8, years: 1, months: 6 },
        { returnPercent: 20, years: 3, months: 0 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBeCloseTo(14.33, 2); // (15+8+20)/3
      expect(result.totalYears).toBe(6.5); // 2 + 1.5 + 3
      expect(result.totalPeriods).toBe(3);
      // Cumulative: 1.15 * 1.08 * 1.20 - 1 = 49.04%
      expect(result.cumulativeReturn).toBeCloseTo(49.04, 2);
    });

    it('should calculate all return metrics correctly - Test Case 4 (sub-year periods)', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 5, years: 0, months: 6 },
        { returnPercent: 3, years: 0, months: 3 },
        { returnPercent: 8, years: 0, months: 9 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBeCloseTo(5.33, 2); // (5+3+8)/3
      expect(result.totalYears).toBe(1.5); // 0.5 + 0.25 + 0.75
      expect(result.totalPeriods).toBe(3);
      expect(result.cumulativeReturn).toBeCloseTo(16.8, 2); // 1.05*1.03*1.08 - 1
    });

    it('should calculate all return metrics correctly - Test Case 5 (large returns)', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 50, years: 1, months: 0 },
        { returnPercent: -30, years: 1, months: 0 },
        { returnPercent: 40, years: 1, months: 0 },
        { returnPercent: 10, years: 1, months: 0 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBeCloseTo(17.5, 2); // (50-30+40+10)/4
      // Geometric: (1.50*0.70*1.40*1.10)^0.25 - 1
      expect(result.geometricMean).toBeCloseTo(12.77, 2);
      expect(result.cumulativeReturn).toBeCloseTo(61.7, 2); // 1.50*0.70*1.40*1.10 - 1
    });

    it('should handle edge case with zero periods', () => {
      const periods: ReturnPeriod[] = [];
      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBe(0);
      expect(result.geometricMean).toBe(0);
      expect(result.annualizedReturn).toBe(0);
      expect(result.cumulativeReturn).toBe(0);
      expect(result.totalPeriods).toBe(0);
      expect(result.totalYears).toBe(0);
    });

    it('should handle edge case with single period', () => {
      const periods: ReturnPeriod[] = [
        { returnPercent: 25, years: 2, months: 6 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBe(25);
      expect(result.geometricMean).toBe(25);
      expect(result.cumulativeReturn).toBe(25);
      expect(result.totalPeriods).toBe(1);
      expect(result.totalYears).toBe(2.5);
      // Annualized: (1.25)^(1/2.5) - 1 = 9.34%
      expect(result.annualizedReturn).toBeCloseTo(9.34, 2);
    });

    it('should calculate correctly - Test Case 6 (real-world scenario)', () => {
      // Simulating a volatile investment over 5 years
      const periods: ReturnPeriod[] = [
        { returnPercent: 15.5, years: 1, months: 0 },
        { returnPercent: -8.2, years: 1, months: 0 },
        { returnPercent: 22.3, years: 1, months: 0 },
        { returnPercent: 5.8, years: 1, months: 0 },
        { returnPercent: 12.1, years: 1, months: 0 },
      ];

      const result = calculateAverageReturn(periods);

      expect(result.arithmeticMean).toBeCloseTo(9.5, 2); // (15.5-8.2+22.3+5.8+12.1)/5
      expect(result.geometricMean).toBeCloseTo(8.99, 2);
      expect(result.annualizedReturn).toBeCloseTo(8.99, 2);
      expect(result.totalPeriods).toBe(5);
      expect(result.totalYears).toBe(5);
    });
  });
});
