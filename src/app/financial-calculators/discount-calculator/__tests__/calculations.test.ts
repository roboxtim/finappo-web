import { describe, it, expect } from 'vitest';
import {
  calculateDiscount,
  validateInputs,
  formatCurrency,
  formatPercentage,
} from '../calculations';

describe('calculateDiscount', () => {
  describe('Percent mode calculations', () => {
    it('should calculate from original price and discount percent', () => {
      const result = calculateDiscount({
        originalPrice: 100,
        discountPercent: 20,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(100);
      expect(result.discountPercent).toBe(20);
      expect(result.discountAmount).toBe(20);
      expect(result.finalPrice).toBe(80);
      expect(result.savings).toBe(20);
    });

    it('should calculate from original price and final price', () => {
      const result = calculateDiscount({
        originalPrice: 100,
        finalPrice: 75,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(100);
      expect(result.finalPrice).toBe(75);
      expect(result.discountAmount).toBe(25);
      expect(result.discountPercent).toBe(25);
      expect(result.savings).toBe(25);
    });

    it('should calculate from discount percent and final price', () => {
      const result = calculateDiscount({
        discountPercent: 20,
        finalPrice: 80,
        mode: 'percent',
      });

      expect(result.discountPercent).toBe(20);
      expect(result.finalPrice).toBe(80);
      expect(result.originalPrice).toBe(100);
      expect(result.discountAmount).toBe(20);
      expect(result.savings).toBe(20);
    });

    it('should handle 50% discount correctly', () => {
      const result = calculateDiscount({
        originalPrice: 200,
        discountPercent: 50,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(200);
      expect(result.discountPercent).toBe(50);
      expect(result.discountAmount).toBe(100);
      expect(result.finalPrice).toBe(100);
      expect(result.savings).toBe(100);
    });

    it('should handle small percentage discounts', () => {
      const result = calculateDiscount({
        originalPrice: 99.99,
        discountPercent: 5,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(99.99);
      expect(result.discountPercent).toBe(5);
      expect(result.discountAmount).toBeCloseTo(4.9995, 2);
      expect(result.finalPrice).toBeCloseTo(94.9905, 2);
    });

    it('should handle large percentage discounts', () => {
      const result = calculateDiscount({
        originalPrice: 500,
        discountPercent: 75,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(500);
      expect(result.discountPercent).toBe(75);
      expect(result.discountAmount).toBe(375);
      expect(result.finalPrice).toBe(125);
    });
  });

  describe('Fixed amount mode calculations', () => {
    it('should calculate from original price and discount amount', () => {
      const result = calculateDiscount({
        originalPrice: 100,
        discountAmount: 25,
        mode: 'fixed',
      });

      expect(result.originalPrice).toBe(100);
      expect(result.discountAmount).toBe(25);
      expect(result.finalPrice).toBe(75);
      expect(result.discountPercent).toBe(25);
      expect(result.savings).toBe(25);
    });

    it('should calculate from original price and final price', () => {
      const result = calculateDiscount({
        originalPrice: 150,
        finalPrice: 120,
        mode: 'fixed',
      });

      expect(result.originalPrice).toBe(150);
      expect(result.finalPrice).toBe(120);
      expect(result.discountAmount).toBe(30);
      expect(result.discountPercent).toBe(20);
      expect(result.savings).toBe(30);
    });

    it('should calculate from discount amount and final price', () => {
      const result = calculateDiscount({
        discountAmount: 20,
        finalPrice: 80,
        mode: 'fixed',
      });

      expect(result.discountAmount).toBe(20);
      expect(result.finalPrice).toBe(80);
      expect(result.originalPrice).toBe(100);
      expect(result.discountPercent).toBe(20);
      expect(result.savings).toBe(20);
    });

    it('should handle fixed $10 discount correctly', () => {
      const result = calculateDiscount({
        originalPrice: 45,
        discountAmount: 10,
        mode: 'fixed',
      });

      expect(result.originalPrice).toBe(45);
      expect(result.discountAmount).toBe(10);
      expect(result.finalPrice).toBe(35);
      expect(result.discountPercent).toBeCloseTo(22.22, 2);
    });

    it('should handle large fixed discounts', () => {
      const result = calculateDiscount({
        originalPrice: 1000,
        discountAmount: 250,
        mode: 'fixed',
      });

      expect(result.originalPrice).toBe(1000);
      expect(result.discountAmount).toBe(250);
      expect(result.finalPrice).toBe(750);
      expect(result.discountPercent).toBe(25);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero discount', () => {
      const result = calculateDiscount({
        originalPrice: 100,
        discountPercent: 0,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(100);
      expect(result.discountPercent).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalPrice).toBe(100);
    });

    it('should handle 100% discount', () => {
      const result = calculateDiscount({
        originalPrice: 100,
        discountPercent: 100,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(100);
      expect(result.discountPercent).toBe(100);
      expect(result.discountAmount).toBe(100);
      expect(result.finalPrice).toBe(0);
    });

    it('should throw error when less than 2 values provided', () => {
      expect(() =>
        calculateDiscount({
          originalPrice: 100,
          mode: 'percent',
        })
      ).toThrow('Please provide at least 2 values');
    });

    it('should throw error when all values are zero', () => {
      expect(() =>
        calculateDiscount({
          originalPrice: 0,
          discountPercent: 0,
          mode: 'percent',
        })
      ).toThrow('Please provide at least 2 values');
    });

    it('should handle decimal prices correctly', () => {
      const result = calculateDiscount({
        originalPrice: 49.99,
        discountPercent: 15,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(49.99);
      expect(result.discountPercent).toBe(15);
      expect(result.discountAmount).toBeCloseTo(7.4985, 2);
      expect(result.finalPrice).toBeCloseTo(42.4915, 2);
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate Black Friday 30% off $200 jacket', () => {
      const result = calculateDiscount({
        originalPrice: 200,
        discountPercent: 30,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(200);
      expect(result.discountPercent).toBe(30);
      expect(result.discountAmount).toBe(60);
      expect(result.finalPrice).toBe(140);
      expect(result.savings).toBe(60);
    });

    it('should calculate $25 coupon on $150 purchase', () => {
      const result = calculateDiscount({
        originalPrice: 150,
        discountAmount: 25,
        mode: 'fixed',
      });

      expect(result.originalPrice).toBe(150);
      expect(result.discountAmount).toBe(25);
      expect(result.finalPrice).toBe(125);
      expect(result.discountPercent).toBeCloseTo(16.67, 2);
    });

    it('should calculate clearance sale 70% off', () => {
      const result = calculateDiscount({
        originalPrice: 299.99,
        discountPercent: 70,
        mode: 'percent',
      });

      expect(result.originalPrice).toBe(299.99);
      expect(result.discountPercent).toBe(70);
      expect(result.discountAmount).toBeCloseTo(209.993, 2);
      expect(result.finalPrice).toBeCloseTo(89.997, 2);
    });
  });
});

describe('validateInputs', () => {
  it('should return no errors for valid percent mode inputs', () => {
    const errors = validateInputs({
      originalPrice: 100,
      discountPercent: 20,
      mode: 'percent',
    });

    expect(errors).toHaveLength(0);
  });

  it('should return no errors for valid fixed mode inputs', () => {
    const errors = validateInputs({
      originalPrice: 100,
      discountAmount: 25,
      mode: 'fixed',
    });

    expect(errors).toHaveLength(0);
  });

  it('should return error when less than 2 values provided', () => {
    const errors = validateInputs({
      originalPrice: 100,
      mode: 'percent',
    });

    expect(errors).toContain('Please provide at least 2 values to calculate');
  });

  it('should return error for negative original price', () => {
    const errors = validateInputs({
      originalPrice: -100,
      discountPercent: 20,
      mode: 'percent',
    });

    expect(errors).toContain('Original price cannot be negative');
  });

  it('should return error for negative discount percent', () => {
    const errors = validateInputs({
      originalPrice: 100,
      discountPercent: -20,
      mode: 'percent',
    });

    expect(errors).toContain('Discount percent cannot be negative');
  });

  it('should return error for discount percent > 100', () => {
    const errors = validateInputs({
      originalPrice: 100,
      discountPercent: 120,
      mode: 'percent',
    });

    expect(errors).toContain('Discount percent cannot be greater than 100%');
  });

  it('should return error for negative discount amount', () => {
    const errors = validateInputs({
      originalPrice: 100,
      discountAmount: -25,
      mode: 'fixed',
    });

    expect(errors).toContain('Discount amount cannot be negative');
  });

  it('should return error for negative final price', () => {
    const errors = validateInputs({
      originalPrice: 100,
      finalPrice: -20,
      mode: 'percent',
    });

    expect(errors).toContain('Final price cannot be negative');
  });

  it('should return error when final price > original price', () => {
    const errors = validateInputs({
      originalPrice: 100,
      finalPrice: 150,
      mode: 'percent',
    });

    expect(errors).toContain(
      'Final price cannot be greater than original price'
    );
  });

  it('should return error when discount amount > original price', () => {
    const errors = validateInputs({
      originalPrice: 100,
      discountAmount: 150,
      mode: 'fixed',
    });

    expect(errors).toContain(
      'Discount amount cannot be greater than original price'
    );
  });

  it('should return multiple errors for multiple invalid inputs', () => {
    const errors = validateInputs({
      originalPrice: -100,
      discountPercent: 150,
      mode: 'percent',
    });

    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('Original price cannot be negative');
    expect(errors).toContain('Discount percent cannot be greater than 100%');
  });
});

describe('formatCurrency', () => {
  it('should format whole numbers correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large numbers with commas', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(10.555)).toBe('$10.56');
    expect(formatCurrency(10.554)).toBe('$10.55');
  });
});

describe('formatPercentage', () => {
  it('should format whole numbers correctly', () => {
    expect(formatPercentage(20)).toBe('20.00%');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatPercentage(16.67)).toBe('16.67%');
  });

  it('should format zero correctly', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });

  it('should round to 2 decimal places', () => {
    expect(formatPercentage(20.556)).toBe('20.56%');
  });
});
