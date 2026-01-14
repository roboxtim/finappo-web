/**
 * RMD Calculator - Comprehensive Test Suite
 *
 * Tests based on reference calculator: https://www.calculator.net/rmd-calculator.html
 * Validates calculations against IRS tables and expected RMD amounts
 */

import {
  calculateRMDResults,
  validateRMDInputs,
  getRMDStartAge,
  getDistributionPeriod,
  calculateRMD,
  formatCurrency,
  formatPercentage,
  isRMDRequired,
  getFirstRMDYear,
  getRMDDeadline,
  UNIFORM_LIFETIME_TABLE,
  type RMDInputs,
} from '../calculations';

describe('RMD Calculator', () => {
  describe('getRMDStartAge', () => {
    test('should return 72 for birth year before 1951', () => {
      expect(getRMDStartAge(1950)).toBe(72);
      expect(getRMDStartAge(1949)).toBe(72);
      expect(getRMDStartAge(1940)).toBe(72);
    });

    test('should return 73 for birth year 1951-1959', () => {
      expect(getRMDStartAge(1951)).toBe(73);
      expect(getRMDStartAge(1955)).toBe(73);
      expect(getRMDStartAge(1959)).toBe(73);
    });

    test('should return 73 for birth year 1960+ (before 2033)', () => {
      // Assuming current year is before 2033
      expect(getRMDStartAge(1960)).toBe(73);
      expect(getRMDStartAge(1965)).toBe(73);
      expect(getRMDStartAge(1970)).toBe(73);
    });
  });

  describe('getDistributionPeriod', () => {
    test('should use Uniform Lifetime Table for single person', () => {
      const result = getDistributionPeriod(75, false);
      expect(result.period).toBe(24.6);
      expect(result.table).toBe('Uniform');
    });

    test('should use Uniform Lifetime Table when spouse is not more than 10 years younger', () => {
      const result = getDistributionPeriod(75, true, 70);
      expect(result.period).toBe(24.6);
      expect(result.table).toBe('Uniform');
    });

    test('should use Joint Life Table when spouse is more than 10 years younger', () => {
      const result = getDistributionPeriod(75, true, 60);
      expect(result.table).toBe('Joint');
      // The period should be longer than uniform table
      expect(result.period).toBeGreaterThan(24.6);
    });

    test('should handle ages over 120', () => {
      const result = getDistributionPeriod(121, false);
      expect(result.period).toBe(2.0);
      expect(result.table).toBe('Uniform');
    });
  });

  describe('calculateRMD', () => {
    test('should calculate RMD correctly', () => {
      // Test case from reference: $300,000 / 24.6 = $12,195.12
      const rmd = calculateRMD(300000, 24.6);
      expect(rmd).toBeCloseTo(12195.12, 2);
    });

    test('should handle zero distribution period', () => {
      const rmd = calculateRMD(100000, 0);
      expect(rmd).toBe(0);
    });

    test('should calculate various RMD amounts', () => {
      // Test multiple scenarios
      expect(calculateRMD(500000, 26.5)).toBeCloseTo(18867.92, 2);
      expect(calculateRMD(500000, 25.5)).toBeCloseTo(19607.84, 2);
      expect(calculateRMD(500000, 24.6)).toBeCloseTo(20325.2, 2);
      expect(calculateRMD(500000, 23.7)).toBeCloseTo(21097.05, 2);
      expect(calculateRMD(500000, 22.9)).toBeCloseTo(21834.06, 2);
    });
  });

  describe('calculateRMDResults - Reference Calculator Test Cases', () => {
    test('Test Case 1: Age 74 in 2024, $500,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1950,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(74);
      expect(results.distributionPeriod).toBe(25.5);
      expect(results.rmdAmount).toBeCloseTo(19607.84, 2);
      expect(results.tableUsed).toBe('Uniform');
      expect(results.rmdStartAge).toBe(72);
    });

    test('Test Case 2: Age 75 in 2024, $500,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1949,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(75);
      expect(results.distributionPeriod).toBe(24.6);
      expect(results.rmdAmount).toBeCloseTo(20325.2, 2);
      expect(results.tableUsed).toBe('Uniform');
    });

    test('Test Case 3: Age 76 in 2024, $500,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1948,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(76);
      expect(results.distributionPeriod).toBe(23.7);
      expect(results.rmdAmount).toBeCloseTo(21097.05, 2);
      expect(results.tableUsed).toBe('Uniform');
    });

    test('Test Case 4: Age 77 in 2024, $500,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1947,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(77);
      expect(results.distributionPeriod).toBe(22.9);
      expect(results.rmdAmount).toBeCloseTo(21834.06, 2);
      expect(results.tableUsed).toBe('Uniform');
    });

    test('Test Case 5: Age 79 in 2024, $500,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1945,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(79);
      expect(results.distributionPeriod).toBe(21.1);
      expect(results.rmdAmount).toBeCloseTo(23696.68, 2);
      expect(results.tableUsed).toBe('Uniform');
    });

    test('Test Case 6: Reference example - Age 75 in 2026, $300,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1951,
        rmdYear: 2026,
        accountBalance: 300000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(75);
      expect(results.distributionPeriod).toBe(24.6);
      expect(results.rmdAmount).toBeCloseTo(12195.12, 2);
      expect(results.tableUsed).toBe('Uniform');
      expect(results.rmdStartAge).toBe(73);
      expect(results.rmdStartYear).toBe(2024);
    });

    test('Test Case 7: Age 73 (first RMD year), $1,000,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1951,
        rmdYear: 2024,
        accountBalance: 1000000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(73);
      expect(results.distributionPeriod).toBe(26.5);
      expect(results.rmdAmount).toBeCloseTo(37735.85, 2);
      expect(results.firstRMDDeadline).toBe('April 1, 2025');
    });

    test('Test Case 8: Spouse beneficiary more than 10 years younger', () => {
      const inputs: RMDInputs = {
        birthYear: 1949,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: true,
        spouseBirthYear: 1964, // 15 years younger
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(75);
      expect(results.tableUsed).toBe('Joint');
      // Joint table should give longer distribution period
      expect(results.distributionPeriod).toBeGreaterThan(24.6);
    });

    test('Test Case 9: Very high age (90), $250,000 balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1934,
        rmdYear: 2024,
        accountBalance: 250000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(90);
      expect(results.distributionPeriod).toBe(12.2);
      expect(results.rmdAmount).toBeCloseTo(20491.8, 2);
    });

    test('Test Case 10: Edge case - Age 120+', () => {
      const inputs: RMDInputs = {
        birthYear: 1903,
        rmdYear: 2024,
        accountBalance: 10000,
        hasSpouseBeneficiary: false,
      };

      const results = calculateRMDResults(inputs);

      expect(results.currentAge).toBe(121);
      expect(results.distributionPeriod).toBe(2.0);
      expect(results.rmdAmount).toBeCloseTo(5000, 2);
    });
  });

  describe('calculateRMDResults - With Projections', () => {
    test('should calculate multi-year projections with growth', () => {
      const inputs: RMDInputs = {
        birthYear: 1949,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
        estimatedReturnRate: 5,
        yearsToProject: 5,
      };

      const results = calculateRMDResults(inputs);

      expect(results.projections).toBeDefined();
      expect(results.projections!.length).toBe(5);

      // First year
      const firstYear = results.projections![0];
      expect(firstYear.year).toBe(2024);
      expect(firstYear.age).toBe(75);
      expect(firstYear.beginningBalance).toBe(500000);
      expect(firstYear.distributionPeriod).toBe(24.6);
      expect(firstYear.rmdAmount).toBeCloseTo(20325.2, 2);

      // Check that balance grows with returns
      const lastYear = results.projections![4];
      expect(lastYear.age).toBe(79);
      expect(lastYear.beginningBalance).toBeGreaterThan(0);

      // Verify summary statistics
      expect(results.totalRMDs).toBeGreaterThan(0);
      expect(results.finalBalance).toBeGreaterThan(0);
      expect(results.averageRMD).toBeGreaterThan(0);
    });

    test('should handle negative returns', () => {
      const inputs: RMDInputs = {
        birthYear: 1949,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
        estimatedReturnRate: -3, // Negative return
        yearsToProject: 5,
      };

      const results = calculateRMDResults(inputs);

      expect(results.projections).toBeDefined();

      // Balance should decrease faster with negative returns
      const lastYear = results.projections![4];
      expect(lastYear.endingBalance).toBeLessThan(400000);
    });
  });

  describe('validateRMDInputs', () => {
    test('should validate valid inputs', () => {
      const inputs: RMDInputs = {
        birthYear: 1950,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const errors = validateRMDInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    test('should catch invalid birth year', () => {
      const inputs: RMDInputs = {
        birthYear: 1850,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
      };

      const errors = validateRMDInputs(inputs);
      expect(errors).toContain('Invalid birth year');
    });

    test('should catch negative account balance', () => {
      const inputs: RMDInputs = {
        birthYear: 1950,
        rmdYear: 2024,
        accountBalance: -1000,
        hasSpouseBeneficiary: false,
      };

      const errors = validateRMDInputs(inputs);
      expect(errors).toContain('Account balance cannot be negative');
    });

    test('should catch invalid return rate', () => {
      const inputs: RMDInputs = {
        birthYear: 1950,
        rmdYear: 2024,
        accountBalance: 500000,
        hasSpouseBeneficiary: false,
        estimatedReturnRate: 100,
      };

      const errors = validateRMDInputs(inputs);
      expect(errors).toContain('Return rate should be between -50% and 50%');
    });
  });

  describe('Helper Functions', () => {
    test('isRMDRequired', () => {
      expect(isRMDRequired(1950, 2024)).toBe(true); // Age 74, past RMD age (72)
      expect(isRMDRequired(1951, 2024)).toBe(true); // Age 73, at RMD age (73)
      expect(isRMDRequired(1960, 2024)).toBe(false); // Age 64, before RMD age
    });

    test('getFirstRMDYear', () => {
      expect(getFirstRMDYear(1950)).toBe(2022); // Born 1950, RMD at 72
      expect(getFirstRMDYear(1951)).toBe(2024); // Born 1951, RMD at 73
      expect(getFirstRMDYear(1955)).toBe(2028); // Born 1955, RMD at 73
    });

    test('getRMDDeadline', () => {
      // First RMD year - can delay until April 1
      expect(getRMDDeadline(1951, 2024)).toBe('April 1, 2025');

      // Subsequent years - must take by Dec 31
      expect(getRMDDeadline(1951, 2025)).toBe('December 31, 2025');
      expect(getRMDDeadline(1951, 2026)).toBe('December 31, 2026');
    });

    test('formatCurrency', () => {
      expect(formatCurrency(12195.12)).toBe('$12,195');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(0)).toBe('$0');
    });

    test('formatPercentage', () => {
      expect(formatPercentage(5)).toBe('5.0%');
      expect(formatPercentage(3.75)).toBe('3.8%');
      expect(formatPercentage(0)).toBe('0.0%');
    });
  });

  describe('IRS Table Verification', () => {
    test('should have correct Uniform Lifetime Table values', () => {
      // Verify key ages from IRS Publication 590-B
      expect(UNIFORM_LIFETIME_TABLE[73]).toBe(26.5);
      expect(UNIFORM_LIFETIME_TABLE[74]).toBe(25.5);
      expect(UNIFORM_LIFETIME_TABLE[75]).toBe(24.6);
      expect(UNIFORM_LIFETIME_TABLE[76]).toBe(23.7);
      expect(UNIFORM_LIFETIME_TABLE[77]).toBe(22.9);
      expect(UNIFORM_LIFETIME_TABLE[78]).toBe(22.0);
      expect(UNIFORM_LIFETIME_TABLE[79]).toBe(21.1);
      expect(UNIFORM_LIFETIME_TABLE[80]).toBe(20.2);
      expect(UNIFORM_LIFETIME_TABLE[85]).toBe(16.0);
      expect(UNIFORM_LIFETIME_TABLE[90]).toBe(12.2);
      expect(UNIFORM_LIFETIME_TABLE[95]).toBe(8.9);
      expect(UNIFORM_LIFETIME_TABLE[100]).toBe(6.4);
      expect(UNIFORM_LIFETIME_TABLE[110]).toBe(3.5);
      expect(UNIFORM_LIFETIME_TABLE[120]).toBe(2.0);
    });
  });
});
