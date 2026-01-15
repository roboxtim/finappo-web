import {
  calculateInflation,
  calculatePurchasingPower,
  calculateRealValue,
  calculateInflationRate,
  getAverageInflationByDecade,
  formatCurrency,
  formatPercentage,
  validateInflationInputs,
  type InflationInputs,
} from '../calculations';

describe('Inflation Calculator', () => {
  describe('calculateInflation', () => {
    it('should calculate future value with positive inflation', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 3,
        years: 5,
      };
      const results = calculateInflation(inputs);

      // Future value = 1000 * (1 + 0.03)^5 = 1159.27
      expect(results.futureValue).toBeCloseTo(1159.27, 2);
      expect(results.totalInflation).toBeCloseTo(15.93, 2); // ((1159.27/1000) - 1) * 100
      expect(results.purchasingPower).toBeCloseTo(862.61, 2); // 1000 / (1.03^5)
      expect(results.realValueLoss).toBeCloseTo(137.39, 2); // 1000 - 862.61
    });

    it('should calculate with 10 years at 2.5% inflation', () => {
      const inputs: InflationInputs = {
        initialAmount: 5000,
        inflationRate: 2.5,
        years: 10,
      };
      const results = calculateInflation(inputs);

      // Future value = 5000 * (1.025)^10 = 6400.42
      expect(results.futureValue).toBeCloseTo(6400.42, 1);
      expect(results.totalInflation).toBeCloseTo(28.01, 1);
      expect(results.purchasingPower).toBeCloseTo(3906, 0);
      expect(results.realValueLoss).toBeCloseTo(1094, 0);
    });

    it('should calculate with 20 years at 4% inflation', () => {
      const inputs: InflationInputs = {
        initialAmount: 10000,
        inflationRate: 4,
        years: 20,
      };
      const results = calculateInflation(inputs);

      // Future value = 10000 * (1.04)^20 = 21911.23
      expect(results.futureValue).toBeCloseTo(21911.23, 2);
      expect(results.totalInflation).toBeCloseTo(119.11, 2);
      expect(results.purchasingPower).toBeCloseTo(4563.87, 2);
      expect(results.realValueLoss).toBeCloseTo(5436.13, 2);
    });

    it('should calculate with 30 years at 3.5% inflation', () => {
      const inputs: InflationInputs = {
        initialAmount: 100,
        inflationRate: 3.5,
        years: 30,
      };
      const results = calculateInflation(inputs);

      // Future value = 100 * (1.035)^30 = 280.68
      expect(results.futureValue).toBeCloseTo(280.68, 2);
      expect(results.totalInflation).toBeCloseTo(180.68, 2);
      expect(results.purchasingPower).toBeCloseTo(35.63, 2);
      expect(results.realValueLoss).toBeCloseTo(64.37, 2);
    });

    it('should handle 1 year calculation', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 5,
        years: 1,
      };
      const results = calculateInflation(inputs);

      expect(results.futureValue).toBeCloseTo(1050, 2);
      expect(results.totalInflation).toBeCloseTo(5, 2);
      expect(results.purchasingPower).toBeCloseTo(952.38, 2);
    });

    it('should handle 0% inflation rate', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 0,
        years: 10,
      };
      const results = calculateInflation(inputs);

      expect(results.futureValue).toBe(1000);
      expect(results.totalInflation).toBe(0);
      expect(results.purchasingPower).toBe(1000);
      expect(results.realValueLoss).toBe(0);
    });

    it('should generate year-by-year breakdown', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 3,
        years: 3,
      };
      const results = calculateInflation(inputs);

      expect(results.yearByYear).toHaveLength(3);
      expect(results.yearByYear[0]).toEqual({
        year: 1,
        nominalValue: 1000,
        realValue: expect.closeTo(970.87, 2),
        inflationImpact: expect.closeTo(29.13, 2),
        cumulativeInflation: expect.closeTo(3, 2),
      });
      expect(results.yearByYear[2]).toEqual({
        year: 3,
        nominalValue: 1000,
        realValue: expect.closeTo(915.14, 2),
        inflationImpact: expect.closeTo(84.86, 2),
        cumulativeInflation: expect.closeTo(9.27, 2),
      });
    });

    it('should handle large amounts', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000000,
        inflationRate: 2.5,
        years: 15,
      };
      const results = calculateInflation(inputs);

      expect(results.futureValue).toBeCloseTo(1448298.17, 1);
      expect(results.purchasingPower).toBeCloseTo(690465.56, 1);
    });

    it('should handle high inflation rates', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 10,
        years: 5,
      };
      const results = calculateInflation(inputs);

      expect(results.futureValue).toBeCloseTo(1610.51, 2);
      expect(results.totalInflation).toBeCloseTo(61.05, 2);
      expect(results.purchasingPower).toBeCloseTo(620.92, 2);
    });

    it('should handle decimal inflation rates', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 2.75,
        years: 7,
      };
      const results = calculateInflation(inputs);

      expect(results.futureValue).toBeCloseTo(1209.13, 1);
      expect(results.purchasingPower).toBeCloseTo(827.04, 1);
    });
  });

  describe('calculatePurchasingPower', () => {
    it('should calculate purchasing power correctly', () => {
      expect(calculatePurchasingPower(1000, 3, 5)).toBeCloseTo(862.61, 2);
      expect(calculatePurchasingPower(5000, 2, 10)).toBeCloseTo(4101.74, 2);
      expect(calculatePurchasingPower(100, 5, 20)).toBeCloseTo(37.69, 2);
    });

    it('should handle 0% inflation', () => {
      expect(calculatePurchasingPower(1000, 0, 10)).toBe(1000);
    });

    it('should handle 0 years', () => {
      expect(calculatePurchasingPower(1000, 5, 0)).toBe(1000);
    });
  });

  describe('calculateRealValue', () => {
    it('should calculate real value correctly', () => {
      expect(calculateRealValue(1000, 3, 5)).toBeCloseTo(1159.27, 2);
      expect(calculateRealValue(5000, 2.5, 10)).toBeCloseTo(6400.42, 2);
      expect(calculateRealValue(100, 4, 20)).toBeCloseTo(219.11, 2);
    });

    it('should handle 0% inflation', () => {
      expect(calculateRealValue(1000, 0, 10)).toBe(1000);
    });

    it('should handle 0 years', () => {
      expect(calculateRealValue(1000, 5, 0)).toBe(1000);
    });
  });

  describe('calculateInflationRate', () => {
    it('should calculate inflation rate between two values', () => {
      expect(calculateInflationRate(1000, 1159.27, 5)).toBeCloseTo(3, 1);
      expect(calculateInflationRate(5000, 6400.42, 10)).toBeCloseTo(2.5, 1);
      expect(calculateInflationRate(100, 219.11, 20)).toBeCloseTo(4, 1);
    });

    it('should handle same values', () => {
      expect(calculateInflationRate(1000, 1000, 5)).toBe(0);
    });

    it('should handle 1 year period', () => {
      expect(calculateInflationRate(1000, 1050, 1)).toBeCloseTo(5, 1);
    });
  });

  describe('validateInflationInputs', () => {
    it('should accept valid inputs', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 3,
        years: 10,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative amount', () => {
      const inputs: InflationInputs = {
        initialAmount: -100,
        inflationRate: 3,
        years: 10,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toContain('Initial amount must be greater than 0');
    });

    it('should reject zero amount', () => {
      const inputs: InflationInputs = {
        initialAmount: 0,
        inflationRate: 3,
        years: 10,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toContain('Initial amount must be greater than 0');
    });

    it('should reject negative inflation rate', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: -2,
        years: 10,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toContain('Inflation rate cannot be negative');
    });

    it('should reject very high inflation rate', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 101,
        years: 10,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toContain('Inflation rate must be 100% or less');
    });

    it('should reject negative years', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 3,
        years: -5,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toContain('Number of years must be at least 0');
    });

    it('should reject too many years', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 3,
        years: 101,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toContain('Number of years cannot exceed 100');
    });

    it('should accept 0 years', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000,
        inflationRate: 3,
        years: 0,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    it('should accept maximum valid values', () => {
      const inputs: InflationInputs = {
        initialAmount: 1000000000,
        inflationRate: 100,
        years: 100,
      };
      const errors = validateInflationInputs(inputs);
      expect(errors).toHaveLength(0);
    });
  });

  describe('getAverageInflationByDecade', () => {
    it('should return correct average rates by decade', () => {
      const rates = getAverageInflationByDecade();

      expect(rates['1920s']).toBeCloseTo(-1.15, 2);
      expect(rates['1930s']).toBeCloseTo(-1.8, 2);
      expect(rates['1940s']).toBeCloseTo(5.36, 2);
      expect(rates['1950s']).toBeCloseTo(2.22, 2);
      expect(rates['1960s']).toBeCloseTo(2.52, 2);
      expect(rates['1970s']).toBeCloseTo(7.36, 2);
      expect(rates['1980s']).toBeCloseTo(5.1, 2);
      expect(rates['1990s']).toBeCloseTo(2.89, 2);
      expect(rates['2000s']).toBeCloseTo(2.54, 2);
      expect(rates['2010s']).toBeCloseTo(1.77, 2);
      expect(rates['2020s']).toBeCloseTo(3.8, 2); // Estimate for current decade
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(999.99)).toBe('$1,000');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(3)).toBe('3.00%');
      expect(formatPercentage(3.5)).toBe('3.50%');
      expect(formatPercentage(10.123)).toBe('10.12%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(100)).toBe('100.00%');
    });
  });
});
