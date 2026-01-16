import { describe, it, expect } from 'vitest';
import {
  calculateVAT,
  validateInputs,
  formatCurrency,
  formatPercentage,
} from '../calculations';

describe('calculateVAT', () => {
  describe('Case 1: VAT Rate + Net Price', () => {
    it('should calculate tax amount and gross price from VAT rate and net price', () => {
      const result = calculateVAT({
        vatRate: 20,
        netPrice: 100,
      });

      expect(result.vatRate).toBe(20);
      expect(result.netPrice).toBe(100);
      expect(result.taxAmount).toBe(20);
      expect(result.grossPrice).toBe(120);
    });

    it('should handle different VAT rates', () => {
      const result = calculateVAT({
        vatRate: 19,
        netPrice: 1000,
      });

      expect(result.vatRate).toBe(19);
      expect(result.netPrice).toBe(1000);
      expect(result.taxAmount).toBe(190);
      expect(result.grossPrice).toBe(1190);
    });

    it('should handle decimal values', () => {
      const result = calculateVAT({
        vatRate: 21.5,
        netPrice: 250.75,
      });

      expect(result.vatRate).toBe(21.5);
      expect(result.netPrice).toBe(250.75);
      expect(result.taxAmount).toBeCloseTo(53.91, 2);
      expect(result.grossPrice).toBeCloseTo(304.66, 2);
    });
  });

  describe('Case 2: VAT Rate + Gross Price', () => {
    it('should calculate net price and tax amount from VAT rate and gross price', () => {
      const result = calculateVAT({
        vatRate: 20,
        grossPrice: 120,
      });

      expect(result.vatRate).toBe(20);
      expect(result.grossPrice).toBe(120);
      expect(result.netPrice).toBe(100);
      expect(result.taxAmount).toBe(20);
    });

    it('should handle different VAT rates', () => {
      const result = calculateVAT({
        vatRate: 25,
        grossPrice: 1250,
      });

      expect(result.vatRate).toBe(25);
      expect(result.grossPrice).toBe(1250);
      expect(result.netPrice).toBe(1000);
      expect(result.taxAmount).toBe(250);
    });

    it('should handle decimal values', () => {
      const result = calculateVAT({
        vatRate: 19,
        grossPrice: 595,
      });

      expect(result.vatRate).toBe(19);
      expect(result.grossPrice).toBe(595);
      expect(result.netPrice).toBeCloseTo(500, 2);
      expect(result.taxAmount).toBeCloseTo(95, 2);
    });
  });

  describe('Case 3: VAT Rate + Tax Amount', () => {
    it('should calculate net price and gross price from VAT rate and tax amount', () => {
      const result = calculateVAT({
        vatRate: 20,
        taxAmount: 20,
      });

      expect(result.vatRate).toBe(20);
      expect(result.taxAmount).toBe(20);
      expect(result.netPrice).toBe(100);
      expect(result.grossPrice).toBe(120);
    });

    it('should handle different VAT rates', () => {
      const result = calculateVAT({
        vatRate: 22,
        taxAmount: 110,
      });

      expect(result.vatRate).toBe(22);
      expect(result.taxAmount).toBe(110);
      expect(result.netPrice).toBe(500);
      expect(result.grossPrice).toBe(610);
    });
  });

  describe('Case 4: Net Price + Gross Price', () => {
    it('should calculate VAT rate and tax amount from net and gross prices', () => {
      const result = calculateVAT({
        netPrice: 100,
        grossPrice: 120,
      });

      expect(result.netPrice).toBe(100);
      expect(result.grossPrice).toBe(120);
      expect(result.taxAmount).toBe(20);
      expect(result.vatRate).toBe(20);
    });

    it('should handle different price combinations', () => {
      const result = calculateVAT({
        netPrice: 500,
        grossPrice: 595,
      });

      expect(result.netPrice).toBe(500);
      expect(result.grossPrice).toBe(595);
      expect(result.taxAmount).toBe(95);
      expect(result.vatRate).toBe(19);
    });

    it('should calculate fractional VAT rates', () => {
      const result = calculateVAT({
        netPrice: 1000,
        grossPrice: 1215,
      });

      expect(result.netPrice).toBe(1000);
      expect(result.grossPrice).toBe(1215);
      expect(result.taxAmount).toBe(215);
      expect(result.vatRate).toBe(21.5);
    });
  });

  describe('Case 5: Net Price + Tax Amount', () => {
    it('should calculate VAT rate and gross price from net price and tax amount', () => {
      const result = calculateVAT({
        netPrice: 100,
        taxAmount: 20,
      });

      expect(result.netPrice).toBe(100);
      expect(result.taxAmount).toBe(20);
      expect(result.grossPrice).toBe(120);
      expect(result.vatRate).toBe(20);
    });

    it('should handle different combinations', () => {
      const result = calculateVAT({
        netPrice: 800,
        taxAmount: 152,
      });

      expect(result.netPrice).toBe(800);
      expect(result.taxAmount).toBe(152);
      expect(result.grossPrice).toBe(952);
      expect(result.vatRate).toBe(19);
    });
  });

  describe('Case 6: Gross Price + Tax Amount', () => {
    it('should calculate VAT rate and net price from gross price and tax amount', () => {
      const result = calculateVAT({
        grossPrice: 120,
        taxAmount: 20,
      });

      expect(result.grossPrice).toBe(120);
      expect(result.taxAmount).toBe(20);
      expect(result.netPrice).toBe(100);
      expect(result.vatRate).toBe(20);
    });

    it('should handle different combinations', () => {
      const result = calculateVAT({
        grossPrice: 1190,
        taxAmount: 190,
      });

      expect(result.grossPrice).toBe(1190);
      expect(result.taxAmount).toBe(190);
      expect(result.netPrice).toBe(1000);
      expect(result.vatRate).toBe(19);
    });
  });

  describe('Error handling', () => {
    it('should throw error when less than 2 values provided', () => {
      expect(() => calculateVAT({ vatRate: 20 })).toThrow(
        'Please provide at least 2 values'
      );
    });

    it('should throw error when no values provided', () => {
      expect(() => calculateVAT({})).toThrow(
        'Please provide at least 2 values'
      );
    });

    it('should throw error when only zero values provided', () => {
      expect(() =>
        calculateVAT({ vatRate: 0, netPrice: 0, grossPrice: 0 })
      ).toThrow('Please provide at least 2 values');
    });

    it('should throw error for invalid input combination', () => {
      // This would be an edge case where the calculation logic doesn't match any scenario
      expect(() => calculateVAT({ vatRate: 0 })).toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero VAT rate', () => {
      const result = calculateVAT({
        vatRate: 0,
        netPrice: 100,
      });

      expect(result.vatRate).toBe(0);
      expect(result.netPrice).toBe(100);
      expect(result.taxAmount).toBe(0);
      expect(result.grossPrice).toBe(100);
    });

    it('should handle very high VAT rates', () => {
      const result = calculateVAT({
        vatRate: 50,
        netPrice: 100,
      });

      expect(result.vatRate).toBe(50);
      expect(result.netPrice).toBe(100);
      expect(result.taxAmount).toBe(50);
      expect(result.grossPrice).toBe(150);
    });

    it('should handle very small values', () => {
      const result = calculateVAT({
        vatRate: 20,
        netPrice: 0.01,
      });

      expect(result.vatRate).toBe(20);
      expect(result.netPrice).toBe(0.01);
      expect(result.taxAmount).toBeCloseTo(0.002, 3);
      expect(result.grossPrice).toBeCloseTo(0.012, 3);
    });

    it('should handle very large values', () => {
      const result = calculateVAT({
        vatRate: 20,
        netPrice: 1000000,
      });

      expect(result.vatRate).toBe(20);
      expect(result.netPrice).toBe(1000000);
      expect(result.taxAmount).toBe(200000);
      expect(result.grossPrice).toBe(1200000);
    });
  });

  describe('Real-world examples', () => {
    it('should calculate UK VAT (20%)', () => {
      const result = calculateVAT({
        vatRate: 20,
        netPrice: 50,
      });

      expect(result.netPrice).toBe(50);
      expect(result.taxAmount).toBe(10);
      expect(result.grossPrice).toBe(60);
    });

    it('should calculate Germany VAT (19%)', () => {
      const result = calculateVAT({
        vatRate: 19,
        grossPrice: 119,
      });

      expect(result.vatRate).toBe(19);
      expect(result.grossPrice).toBe(119);
      expect(result.netPrice).toBe(100);
      expect(result.taxAmount).toBe(19);
    });

    it('should calculate Spain VAT (21%)', () => {
      const result = calculateVAT({
        netPrice: 200,
        grossPrice: 242,
      });

      expect(result.netPrice).toBe(200);
      expect(result.grossPrice).toBe(242);
      expect(result.taxAmount).toBe(42);
      expect(result.vatRate).toBe(21);
    });

    it('should calculate Italy VAT (22%)', () => {
      const result = calculateVAT({
        vatRate: 22,
        netPrice: 1000,
      });

      expect(result.vatRate).toBe(22);
      expect(result.netPrice).toBe(1000);
      expect(result.taxAmount).toBe(220);
      expect(result.grossPrice).toBe(1220);
    });
  });
});

describe('validateInputs', () => {
  it('should return no errors for valid inputs', () => {
    const errors = validateInputs({
      vatRate: 20,
      netPrice: 100,
    });

    expect(errors).toHaveLength(0);
  });

  it('should return error when less than 2 values provided', () => {
    const errors = validateInputs({
      vatRate: 20,
    });

    expect(errors).toContain('Please provide at least 2 values to calculate');
  });

  it('should return error for negative VAT rate', () => {
    const errors = validateInputs({
      vatRate: -5,
      netPrice: 100,
    });

    expect(errors).toContain('VAT rate cannot be negative');
  });

  it('should return error for negative net price', () => {
    const errors = validateInputs({
      vatRate: 20,
      netPrice: -100,
    });

    expect(errors).toContain('Net price cannot be negative');
  });

  it('should return error for negative gross price', () => {
    const errors = validateInputs({
      vatRate: 20,
      grossPrice: -120,
    });

    expect(errors).toContain('Gross price cannot be negative');
  });

  it('should return error for negative tax amount', () => {
    const errors = validateInputs({
      vatRate: 20,
      taxAmount: -20,
    });

    expect(errors).toContain('Tax amount cannot be negative');
  });

  it('should return error when gross price is less than net price', () => {
    const errors = validateInputs({
      netPrice: 100,
      grossPrice: 90,
      taxAmount: 10,
    });

    expect(errors).toContain(
      'Gross price must be greater than or equal to net price'
    );
  });

  it('should return multiple errors when multiple issues exist', () => {
    const errors = validateInputs({
      vatRate: -5,
      netPrice: -100,
    });

    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('VAT rate cannot be negative');
    expect(errors).toContain('Net price cannot be negative');
  });
});

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should format decimal amounts correctly', () => {
    expect(formatCurrency(100.5)).toBe('$100.50');
    expect(formatCurrency(100.99)).toBe('$100.99');
    expect(formatCurrency(100.1)).toBe('$100.10');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format negative amounts correctly', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
    expect(formatCurrency(-1000.5)).toBe('-$1,000.50');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(100.555)).toBe('$100.56');
    expect(formatCurrency(100.554)).toBe('$100.55');
  });
});

describe('formatPercentage', () => {
  it('should format whole numbers correctly', () => {
    expect(formatPercentage(20)).toBe('20.00%');
    expect(formatPercentage(100)).toBe('100.00%');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatPercentage(20.5)).toBe('20.50%');
    expect(formatPercentage(19.99)).toBe('19.99%');
  });

  it('should format zero correctly', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });

  it('should round to 2 decimal places', () => {
    expect(formatPercentage(20.556)).toBe('20.56%');
    expect(formatPercentage(20.554)).toBe('20.55%');
  });

  it('should format negative percentages', () => {
    expect(formatPercentage(-5)).toBe('-5.00%');
  });
});
