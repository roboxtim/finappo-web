import { describe, it, expect } from 'vitest';
import {
  calculateMargin,
  validateInputs,
  formatCurrency,
  formatPercentage,
} from '../calculations';

describe('calculateMargin', () => {
  describe('Case 1: Cost + Revenue', () => {
    it('should calculate profit and margin from cost and revenue', () => {
      const result = calculateMargin({
        cost: 50,
        revenue: 100,
      });

      expect(result.cost).toBe(50);
      expect(result.revenue).toBe(100);
      expect(result.profit).toBe(50);
      expect(result.margin).toBe(50);
      expect(result.markup).toBe(100);
    });

    it('should handle different cost and revenue values', () => {
      const result = calculateMargin({
        cost: 75,
        revenue: 100,
      });

      expect(result.cost).toBe(75);
      expect(result.revenue).toBe(100);
      expect(result.profit).toBe(25);
      expect(result.margin).toBe(25);
      expect(result.markup).toBeCloseTo(33.33, 2);
    });

    it('should handle zero profit scenario', () => {
      const result = calculateMargin({
        cost: 100,
        revenue: 100,
      });

      expect(result.profit).toBe(0);
      expect(result.margin).toBe(0);
      expect(result.markup).toBe(0);
    });
  });

  describe('Case 2: Cost + Margin', () => {
    it('should calculate revenue and profit from cost and margin', () => {
      const result = calculateMargin({
        cost: 50,
        margin: 50,
      });

      expect(result.cost).toBe(50);
      expect(result.margin).toBe(50);
      expect(result.revenue).toBe(100);
      expect(result.profit).toBe(50);
    });

    it('should handle different margin percentages', () => {
      const result = calculateMargin({
        cost: 60,
        margin: 25,
      });

      expect(result.cost).toBe(60);
      expect(result.margin).toBe(25);
      expect(result.revenue).toBe(80);
      expect(result.profit).toBe(20);
    });

    it('should handle high margin percentage', () => {
      const result = calculateMargin({
        cost: 10,
        margin: 90,
      });

      expect(result.cost).toBe(10);
      expect(result.margin).toBe(90);
      expect(result.revenue).toBeCloseTo(100, 2);
      expect(result.profit).toBeCloseTo(90, 2);
    });
  });

  describe('Case 3: Cost + Profit', () => {
    it('should calculate revenue and margin from cost and profit', () => {
      const result = calculateMargin({
        cost: 50,
        profit: 50,
      });

      expect(result.cost).toBe(50);
      expect(result.profit).toBe(50);
      expect(result.revenue).toBe(100);
      expect(result.margin).toBe(50);
    });

    it('should handle different profit amounts', () => {
      const result = calculateMargin({
        cost: 80,
        profit: 20,
      });

      expect(result.cost).toBe(80);
      expect(result.profit).toBe(20);
      expect(result.revenue).toBe(100);
      expect(result.margin).toBe(20);
    });
  });

  describe('Case 4: Revenue + Margin', () => {
    it('should calculate cost and profit from revenue and margin', () => {
      const result = calculateMargin({
        revenue: 100,
        margin: 50,
      });

      expect(result.revenue).toBe(100);
      expect(result.margin).toBe(50);
      expect(result.profit).toBe(50);
      expect(result.cost).toBe(50);
    });

    it('should handle different margin percentages', () => {
      const result = calculateMargin({
        revenue: 100,
        margin: 25,
      });

      expect(result.revenue).toBe(100);
      expect(result.margin).toBe(25);
      expect(result.profit).toBe(25);
      expect(result.cost).toBe(75);
    });
  });

  describe('Case 5: Revenue + Profit', () => {
    it('should calculate cost and margin from revenue and profit', () => {
      const result = calculateMargin({
        revenue: 100,
        profit: 50,
      });

      expect(result.revenue).toBe(100);
      expect(result.profit).toBe(50);
      expect(result.cost).toBe(50);
      expect(result.margin).toBe(50);
    });

    it('should handle different profit amounts', () => {
      const result = calculateMargin({
        revenue: 100,
        profit: 30,
      });

      expect(result.revenue).toBe(100);
      expect(result.profit).toBe(30);
      expect(result.cost).toBe(70);
      expect(result.margin).toBe(30);
    });
  });

  describe('Case 6: Margin + Profit', () => {
    it('should calculate revenue and cost from margin and profit', () => {
      const result = calculateMargin({
        margin: 50,
        profit: 50,
      });

      expect(result.margin).toBe(50);
      expect(result.profit).toBe(50);
      expect(result.revenue).toBe(100);
      expect(result.cost).toBe(50);
    });

    it('should handle different combinations', () => {
      const result = calculateMargin({
        margin: 25,
        profit: 25,
      });

      expect(result.margin).toBe(25);
      expect(result.profit).toBe(25);
      expect(result.revenue).toBe(100);
      expect(result.cost).toBe(75);
    });
  });

  describe('Error handling', () => {
    it('should throw error when less than 2 values provided', () => {
      expect(() => calculateMargin({ cost: 50 })).toThrow(
        'Please provide at least 2 values'
      );
    });

    it('should throw error when no values provided', () => {
      expect(() => calculateMargin({})).toThrow(
        'Please provide at least 2 values'
      );
    });

    it('should throw error when only zero values provided', () => {
      expect(() => calculateMargin({ cost: 0, revenue: 0, margin: 0 })).toThrow(
        'Please provide at least 2 values'
      );
    });
  });

  describe('Markup calculations', () => {
    it('should calculate markup correctly', () => {
      const result = calculateMargin({
        cost: 50,
        revenue: 100,
      });

      // Markup = (Profit / Cost) × 100 = (50 / 50) × 100 = 100%
      expect(result.markup).toBe(100);
    });

    it('should calculate markup with different values', () => {
      const result = calculateMargin({
        cost: 75,
        revenue: 100,
      });

      // Markup = (25 / 75) × 100 = 33.33%
      expect(result.markup).toBeCloseTo(33.33, 2);
    });

    it('should handle zero cost for markup', () => {
      const result = calculateMargin({
        revenue: 100,
        profit: 100,
      });

      expect(result.cost).toBe(0);
      expect(result.markup).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle very small values', () => {
      const result = calculateMargin({
        cost: 0.01,
        revenue: 0.02,
      });

      expect(result.profit).toBeCloseTo(0.01, 2);
      expect(result.margin).toBe(50);
    });

    it('should handle very large values', () => {
      const result = calculateMargin({
        cost: 1000000,
        revenue: 2000000,
      });

      expect(result.profit).toBe(1000000);
      expect(result.margin).toBe(50);
    });

    it('should handle decimal percentages', () => {
      const result = calculateMargin({
        cost: 90,
        margin: 10.5,
      });

      expect(result.margin).toBe(10.5);
      expect(result.revenue).toBeCloseTo(100.56, 2);
      expect(result.profit).toBeCloseTo(10.56, 2);
    });
  });

  describe('Real-world examples', () => {
    it('should calculate retail margin (product costing $50, selling for $100)', () => {
      const result = calculateMargin({
        cost: 50,
        revenue: 100,
      });

      expect(result.margin).toBe(50);
      expect(result.markup).toBe(100);
      expect(result.profit).toBe(50);
    });

    it('should calculate low-margin scenario (grocery store)', () => {
      const result = calculateMargin({
        cost: 95,
        revenue: 100,
      });

      expect(result.margin).toBe(5);
      expect(result.markup).toBeCloseTo(5.26, 2);
      expect(result.profit).toBe(5);
    });

    it('should calculate high-margin scenario (luxury goods)', () => {
      const result = calculateMargin({
        cost: 20,
        revenue: 100,
      });

      expect(result.margin).toBe(80);
      expect(result.markup).toBe(400);
      expect(result.profit).toBe(80);
    });

    it('should calculate service business margin', () => {
      const result = calculateMargin({
        cost: 1000,
        margin: 40,
      });

      expect(result.revenue).toBeCloseTo(1666.67, 2);
      expect(result.profit).toBeCloseTo(666.67, 2);
    });
  });

  describe('Margin vs Markup relationships', () => {
    it('should show that 50% margin equals 100% markup', () => {
      const result = calculateMargin({
        cost: 50,
        revenue: 100,
      });

      expect(result.margin).toBe(50);
      expect(result.markup).toBe(100);
    });

    it('should show that 25% margin equals 33.33% markup', () => {
      const result = calculateMargin({
        cost: 75,
        revenue: 100,
      });

      expect(result.margin).toBe(25);
      expect(result.markup).toBeCloseTo(33.33, 2);
    });

    it('should show that 80% margin equals 400% markup', () => {
      const result = calculateMargin({
        cost: 20,
        revenue: 100,
      });

      expect(result.margin).toBe(80);
      expect(result.markup).toBe(400);
    });
  });
});

describe('validateInputs', () => {
  it('should return no errors for valid inputs', () => {
    const errors = validateInputs({
      cost: 50,
      revenue: 100,
    });

    expect(errors).toHaveLength(0);
  });

  it('should return error when less than 2 values provided', () => {
    const errors = validateInputs({
      cost: 50,
    });

    expect(errors).toContain('Please provide at least 2 values to calculate');
  });

  it('should return error for negative cost', () => {
    const errors = validateInputs({
      cost: -50,
      revenue: 100,
    });

    expect(errors).toContain('Cost cannot be negative');
  });

  it('should return error for negative revenue', () => {
    const errors = validateInputs({
      cost: 50,
      revenue: -100,
    });

    expect(errors).toContain('Revenue cannot be negative');
  });

  it('should return error for negative profit', () => {
    const errors = validateInputs({
      cost: 50,
      profit: -10,
    });

    expect(errors).toContain('Profit cannot be negative');
  });

  it('should return error for negative margin', () => {
    const errors = validateInputs({
      cost: 50,
      margin: -10,
    });

    expect(errors).toContain('Margin cannot be negative');
  });

  it('should return error for margin >= 100%', () => {
    const errors = validateInputs({
      cost: 50,
      margin: 100,
    });

    expect(errors).toContain('Margin must be less than 100%');
  });

  it('should return error when revenue < cost', () => {
    const errors = validateInputs({
      cost: 100,
      revenue: 50,
    });

    expect(errors).toContain('Revenue must be greater than or equal to cost');
  });

  it('should return multiple errors when multiple issues exist', () => {
    const errors = validateInputs({
      cost: -50,
      revenue: -100,
    });

    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('Cost cannot be negative');
    expect(errors).toContain('Revenue cannot be negative');
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
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(100.556)).toBe('$100.56');
  });
});

describe('formatPercentage', () => {
  it('should format whole numbers correctly', () => {
    expect(formatPercentage(50)).toBe('50.00%');
    expect(formatPercentage(100)).toBe('100.00%');
  });

  it('should format decimal numbers correctly', () => {
    expect(formatPercentage(50.5)).toBe('50.50%');
    expect(formatPercentage(33.33)).toBe('33.33%');
  });

  it('should format zero correctly', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });
});
