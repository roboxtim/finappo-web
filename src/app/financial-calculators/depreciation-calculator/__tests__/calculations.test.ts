import { describe, it, expect } from 'vitest';
import {
  calculateStraightLine,
  calculateDecliningBalance,
  calculateDoubleDecliningBalance,
  calculateSumOfYearsDigits,
  calculateDepreciation,
  formatCurrency,
  getMethodDisplayName,
} from '../calculations';

describe('calculateStraightLine', () => {
  it('should calculate straight-line depreciation correctly', () => {
    const result = calculateStraightLine(50000, 5000, 5);

    expect(result.method).toBe('straight-line');
    expect(result.assetCost).toBe(50000);
    expect(result.salvageValue).toBe(5000);
    expect(result.usefulLife).toBe(5);
    expect(result.depreciableBase).toBe(45000);
    expect(result.totalDepreciation).toBe(45000);
    expect(result.schedule).toHaveLength(5);
  });

  it('should have equal annual depreciation for all years', () => {
    const result = calculateStraightLine(50000, 5000, 5);
    const annualDepreciation = 9000;

    result.schedule.forEach((year) => {
      expect(year.annualDepreciation).toBe(annualDepreciation);
    });
  });

  it('should have correct year-by-year values', () => {
    const result = calculateStraightLine(10000, 1000, 3);

    expect(result.schedule[0]).toEqual({
      year: 1,
      annualDepreciation: 3000,
      accumulatedDepreciation: 3000,
      bookValue: 7000,
    });

    expect(result.schedule[1]).toEqual({
      year: 2,
      annualDepreciation: 3000,
      accumulatedDepreciation: 6000,
      bookValue: 4000,
    });

    expect(result.schedule[2]).toEqual({
      year: 3,
      annualDepreciation: 3000,
      accumulatedDepreciation: 9000,
      bookValue: 1000,
    });
  });

  it('should end with book value equal to salvage value', () => {
    const result = calculateStraightLine(50000, 5000, 5);
    const lastYear = result.schedule[result.schedule.length - 1];

    expect(lastYear.bookValue).toBeCloseTo(5000, 2);
  });

  it('should handle zero salvage value', () => {
    const result = calculateStraightLine(10000, 0, 5);

    expect(result.depreciableBase).toBe(10000);
    expect(result.totalDepreciation).toBe(10000);
    expect(result.schedule[0].annualDepreciation).toBe(2000);
  });
});

describe('calculateDecliningBalance', () => {
  it('should calculate declining balance depreciation correctly', () => {
    const result = calculateDecliningBalance(10000, 1000, 5);

    expect(result.method).toBe('declining-balance');
    expect(result.assetCost).toBe(10000);
    expect(result.salvageValue).toBe(1000);
    expect(result.usefulLife).toBe(5);
    expect(result.schedule).toHaveLength(5);
  });

  it('should have decreasing annual depreciation', () => {
    const result = calculateDecliningBalance(10000, 1000, 5);

    for (let i = 0; i < result.schedule.length - 1; i++) {
      expect(result.schedule[i].annualDepreciation).toBeGreaterThanOrEqual(
        result.schedule[i + 1].annualDepreciation
      );
    }
  });

  it('should not depreciate below salvage value', () => {
    const result = calculateDecliningBalance(10000, 1000, 5);
    const lastYear = result.schedule[result.schedule.length - 1];

    expect(lastYear.bookValue).toBeGreaterThanOrEqual(1000);
  });

  it('should calculate first year with correct rate', () => {
    const result = calculateDecliningBalance(10000, 1000, 5);
    const rate = 1 / 5; // 20%

    expect(result.schedule[0].annualDepreciation).toBe(10000 * rate);
  });
});

describe('calculateDoubleDecliningBalance', () => {
  it('should calculate double declining balance correctly', () => {
    const result = calculateDoubleDecliningBalance(10000, 1000, 5);

    expect(result.method).toBe('double-declining-balance');
    expect(result.assetCost).toBe(10000);
    expect(result.salvageValue).toBe(1000);
    expect(result.usefulLife).toBe(5);
    expect(result.schedule).toHaveLength(5);
  });

  it('should use double the straight-line rate', () => {
    const result = calculateDoubleDecliningBalance(10000, 1000, 5);
    const doubleRate = 2 / 5; // 40%

    expect(result.schedule[0].annualDepreciation).toBe(10000 * doubleRate);
  });

  it('should have higher first-year depreciation than declining balance', () => {
    const ddb = calculateDoubleDecliningBalance(10000, 1000, 5);
    const db = calculateDecliningBalance(10000, 1000, 5);

    expect(ddb.schedule[0].annualDepreciation).toBeGreaterThan(
      db.schedule[0].annualDepreciation
    );
  });

  it('should not depreciate below salvage value', () => {
    const result = calculateDoubleDecliningBalance(10000, 1000, 5);
    const lastYear = result.schedule[result.schedule.length - 1];

    expect(lastYear.bookValue).toBeGreaterThanOrEqual(1000);
  });

  it('should have decreasing annual depreciation', () => {
    const result = calculateDoubleDecliningBalance(10000, 1000, 3);

    // Check that depreciation decreases or reaches salvage limit
    for (let i = 0; i < result.schedule.length - 1; i++) {
      if (result.schedule[i + 1].bookValue > 1000) {
        expect(result.schedule[i].annualDepreciation).toBeGreaterThanOrEqual(
          result.schedule[i + 1].annualDepreciation
        );
      }
    }
  });
});

describe('calculateSumOfYearsDigits', () => {
  it('should calculate sum of years digits correctly', () => {
    const result = calculateSumOfYearsDigits(10000, 1000, 5);

    expect(result.method).toBe('sum-of-years-digits');
    expect(result.assetCost).toBe(10000);
    expect(result.salvageValue).toBe(1000);
    expect(result.usefulLife).toBe(5);
    expect(result.depreciableBase).toBe(9000);
    expect(result.totalDepreciation).toBe(9000);
    expect(result.schedule).toHaveLength(5);
  });

  it('should calculate sum of years correctly', () => {
    const result = calculateSumOfYearsDigits(10000, 1000, 5);
    const sumOfYears = (5 * (5 + 1)) / 2; // = 15

    // Year 1: (5/15) * 9000 = 3000
    expect(result.schedule[0].annualDepreciation).toBe(9000 * (5 / sumOfYears));
    // Year 2: (4/15) * 9000 = 2400
    expect(result.schedule[1].annualDepreciation).toBe(9000 * (4 / sumOfYears));
  });

  it('should have decreasing annual depreciation', () => {
    const result = calculateSumOfYearsDigits(10000, 1000, 5);

    for (let i = 0; i < result.schedule.length - 1; i++) {
      expect(result.schedule[i].annualDepreciation).toBeGreaterThan(
        result.schedule[i + 1].annualDepreciation
      );
    }
  });

  it('should end with book value equal to salvage value', () => {
    const result = calculateSumOfYearsDigits(50000, 5000, 5);
    const lastYear = result.schedule[result.schedule.length - 1];

    expect(lastYear.bookValue).toBeCloseTo(5000, 2);
  });

  it('should have correct year-by-year values for 3-year life', () => {
    const result = calculateSumOfYearsDigits(9000, 0, 3);
    // Sum of years: 1+2+3 = 6

    // Year 1: 3/6 * 9000 = 4500
    expect(result.schedule[0].annualDepreciation).toBe(4500);
    // Year 2: 2/6 * 9000 = 3000
    expect(result.schedule[1].annualDepreciation).toBe(3000);
    // Year 3: 1/6 * 9000 = 1500
    expect(result.schedule[2].annualDepreciation).toBe(1500);
  });
});

describe('calculateDepreciation', () => {
  it('should call correct method for straight-line', () => {
    const result = calculateDepreciation({
      assetCost: 10000,
      salvageValue: 1000,
      usefulLife: 5,
      method: 'straight-line',
    });

    expect(result.method).toBe('straight-line');
    expect(result.schedule[0].annualDepreciation).toBe(1800);
  });

  it('should call correct method for declining-balance', () => {
    const result = calculateDepreciation({
      assetCost: 10000,
      salvageValue: 1000,
      usefulLife: 5,
      method: 'declining-balance',
    });

    expect(result.method).toBe('declining-balance');
  });

  it('should call correct method for double-declining-balance', () => {
    const result = calculateDepreciation({
      assetCost: 10000,
      salvageValue: 1000,
      usefulLife: 5,
      method: 'double-declining-balance',
    });

    expect(result.method).toBe('double-declining-balance');
  });

  it('should call correct method for sum-of-years-digits', () => {
    const result = calculateDepreciation({
      assetCost: 10000,
      salvageValue: 1000,
      usefulLife: 5,
      method: 'sum-of-years-digits',
    });

    expect(result.method).toBe('sum-of-years-digits');
  });

  it('should throw error for zero or negative asset cost', () => {
    expect(() =>
      calculateDepreciation({
        assetCost: 0,
        salvageValue: 1000,
        usefulLife: 5,
        method: 'straight-line',
      })
    ).toThrow('Asset cost must be greater than 0');

    expect(() =>
      calculateDepreciation({
        assetCost: -10000,
        salvageValue: 1000,
        usefulLife: 5,
        method: 'straight-line',
      })
    ).toThrow('Asset cost must be greater than 0');
  });

  it('should throw error for negative salvage value', () => {
    expect(() =>
      calculateDepreciation({
        assetCost: 10000,
        salvageValue: -1000,
        usefulLife: 5,
        method: 'straight-line',
      })
    ).toThrow('Salvage value cannot be negative');
  });

  it('should throw error when salvage value >= asset cost', () => {
    expect(() =>
      calculateDepreciation({
        assetCost: 10000,
        salvageValue: 10000,
        usefulLife: 5,
        method: 'straight-line',
      })
    ).toThrow('Salvage value must be less than asset cost');

    expect(() =>
      calculateDepreciation({
        assetCost: 10000,
        salvageValue: 15000,
        usefulLife: 5,
        method: 'straight-line',
      })
    ).toThrow('Salvage value must be less than asset cost');
  });

  it('should throw error for zero or negative useful life', () => {
    expect(() =>
      calculateDepreciation({
        assetCost: 10000,
        salvageValue: 1000,
        usefulLife: 0,
        method: 'straight-line',
      })
    ).toThrow('Useful life must be greater than 0');

    expect(() =>
      calculateDepreciation({
        assetCost: 10000,
        salvageValue: 1000,
        usefulLife: -5,
        method: 'straight-line',
      })
    ).toThrow('Useful life must be greater than 0');
  });
});

describe('Real-world examples', () => {
  it('should calculate vehicle depreciation (straight-line)', () => {
    const result = calculateStraightLine(30000, 3000, 5);

    expect(result.depreciableBase).toBe(27000);
    expect(result.schedule[0].annualDepreciation).toBe(5400);
    expect(result.schedule[4].bookValue).toBe(3000);
  });

  it('should calculate equipment depreciation (DDB)', () => {
    const result = calculateDoubleDecliningBalance(100000, 10000, 10);

    expect(result.schedule[0].annualDepreciation).toBe(20000); // 40% of 100000
    expect(result.schedule[0].bookValue).toBe(80000);
  });

  it('should calculate computer depreciation (SYD)', () => {
    const result = calculateSumOfYearsDigits(5000, 500, 3);
    const depreciableBase = 4500;
    const sumOfYears = 6;

    expect(result.schedule[0].annualDepreciation).toBe(
      depreciableBase * (3 / sumOfYears)
    );
    expect(result.schedule[2].bookValue).toBeCloseTo(500, 2);
  });
});

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    expect(formatCurrency(50000)).toBe('$50,000.00');
    expect(formatCurrency(1000.5)).toBe('$1,000.50');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(100.556)).toBe('$100.56');
  });
});

describe('getMethodDisplayName', () => {
  it('should return correct display names', () => {
    expect(getMethodDisplayName('straight-line')).toBe('Straight-Line');
    expect(getMethodDisplayName('declining-balance')).toBe('Declining Balance');
    expect(getMethodDisplayName('double-declining-balance')).toBe(
      'Double Declining Balance'
    );
    expect(getMethodDisplayName('sum-of-years-digits')).toBe(
      "Sum of Years' Digits"
    );
  });
});

describe('Edge cases and precision', () => {
  it('should handle very large asset costs', () => {
    const result = calculateStraightLine(10000000, 100000, 10);

    expect(result.depreciableBase).toBe(9900000);
    expect(result.schedule[0].annualDepreciation).toBe(990000);
  });

  it('should handle single year depreciation', () => {
    const result = calculateStraightLine(10000, 1000, 1);

    expect(result.schedule).toHaveLength(1);
    expect(result.schedule[0].annualDepreciation).toBe(9000);
    expect(result.schedule[0].bookValue).toBe(1000);
  });

  it('should handle many years', () => {
    const result = calculateStraightLine(100000, 10000, 20);

    expect(result.schedule).toHaveLength(20);
    expect(result.schedule[0].annualDepreciation).toBe(4500);
  });
});
