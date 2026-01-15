import {
  calculateSalesTax,
  calculatePriceBeforeTax,
  calculateTaxRate,
  formatCurrency,
  formatPercentage,
  validateSalesTaxInputs,
  STATE_TAX_RATES_2025,
  type SalesTaxInputs,
} from '../calculations';

describe('Sales Tax Calculations', () => {
  describe('calculateSalesTax', () => {
    // Test Case 1: Basic Calculation
    test('should calculate basic sales tax correctly', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(100);
      expect(result.taxAmount).toBeCloseTo(8.25, 2);
      expect(result.totalPrice).toBeCloseTo(108.25, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(8.25, 2);
      expect(result.stateTaxAmount).toBeCloseTo(8.25, 2);
      expect(result.localTaxAmount).toBe(0);
    });

    // Test Case 2: Large Amount
    test('should calculate tax for large amounts', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 25000,
        stateTaxRate: 7.5,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(25000);
      expect(result.taxAmount).toBeCloseTo(1875, 2);
      expect(result.totalPrice).toBeCloseTo(26875, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(7.5, 2);
    });

    // Test Case 3: Combined State and Local Tax
    test('should calculate combined state and local tax', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 500,
        stateTaxRate: 6.5,
        localTaxRate: 2.5,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(500);
      expect(result.stateTaxAmount).toBeCloseTo(32.5, 2);
      expect(result.localTaxAmount).toBeCloseTo(12.5, 2);
      expect(result.taxAmount).toBeCloseTo(45, 2);
      expect(result.totalPrice).toBeCloseTo(545, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(9, 2);
    });

    // Test Case 4: Zero Tax
    test('should handle zero tax rate', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 500,
        stateTaxRate: 0,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(500);
      expect(result.taxAmount).toBe(0);
      expect(result.totalPrice).toBe(500);
      expect(result.effectiveTaxRate).toBe(0);
    });

    // Test Case 5: High Tax Rate
    test('should calculate high tax rates correctly', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 150,
        stateTaxRate: 15,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(150);
      expect(result.taxAmount).toBeCloseTo(22.5, 2);
      expect(result.totalPrice).toBeCloseTo(172.5, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(15, 2);
    });

    // Test Case 6: Decimal Amounts
    test('should handle decimal amounts precisely', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 99.99,
        stateTaxRate: 6.625,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(99.99);
      expect(result.taxAmount).toBeCloseTo(6.62, 2);
      expect(result.totalPrice).toBeCloseTo(106.61, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(6.625, 3);
    });

    // Test Case 7: Small amounts
    test('should handle small amounts', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 1.99,
        stateTaxRate: 8,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(1.99);
      expect(result.taxAmount).toBeCloseTo(0.16, 2);
      expect(result.totalPrice).toBeCloseTo(2.15, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(8, 2);
    });

    // Test Case 8: Maximum local tax
    test('should handle maximum combined rates', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 1000,
        stateTaxRate: 7.25, // California
        localTaxRate: 2.75, // Max local
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);

      expect(result.priceBeforeTax).toBe(1000);
      expect(result.stateTaxAmount).toBeCloseTo(72.5, 2);
      expect(result.localTaxAmount).toBeCloseTo(27.5, 2);
      expect(result.taxAmount).toBeCloseTo(100, 2);
      expect(result.totalPrice).toBeCloseTo(1100, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(10, 2);
    });
  });

  describe('calculatePriceBeforeTax (Reverse Calculation)', () => {
    // Test Case 1: Basic Reverse
    test('should calculate price before tax from total', () => {
      const inputs: SalesTaxInputs = {
        totalPrice: 54,
        stateTaxRate: 8,
        localTaxRate: 0,
        calculationMode: 'reverse',
      };

      const result = calculatePriceBeforeTax(inputs);

      expect(result.totalPrice).toBe(54);
      expect(result.priceBeforeTax).toBeCloseTo(50, 2);
      expect(result.taxAmount).toBeCloseTo(4, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(8, 2);
    });

    // Test Case 2: Reverse with Combined Tax
    test('should calculate reverse with combined tax', () => {
      const inputs: SalesTaxInputs = {
        totalPrice: 1100,
        stateTaxRate: 6,
        localTaxRate: 4,
        calculationMode: 'reverse',
      };

      const result = calculatePriceBeforeTax(inputs);

      expect(result.totalPrice).toBe(1100);
      expect(result.priceBeforeTax).toBeCloseTo(1000, 2);
      expect(result.taxAmount).toBeCloseTo(100, 2);
      expect(result.stateTaxAmount).toBeCloseTo(60, 2);
      expect(result.localTaxAmount).toBeCloseTo(40, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(10, 2);
    });

    // Test Case 3: Reverse with zero tax
    test('should handle reverse calculation with zero tax', () => {
      const inputs: SalesTaxInputs = {
        totalPrice: 250,
        stateTaxRate: 0,
        localTaxRate: 0,
        calculationMode: 'reverse',
      };

      const result = calculatePriceBeforeTax(inputs);

      expect(result.totalPrice).toBe(250);
      expect(result.priceBeforeTax).toBe(250);
      expect(result.taxAmount).toBe(0);
      expect(result.effectiveTaxRate).toBe(0);
    });

    // Test Case 4: Reverse with decimal total
    test('should handle reverse with decimal total price', () => {
      const inputs: SalesTaxInputs = {
        totalPrice: 107.25,
        stateTaxRate: 7.25,
        localTaxRate: 0,
        calculationMode: 'reverse',
      };

      const result = calculatePriceBeforeTax(inputs);

      expect(result.totalPrice).toBe(107.25);
      expect(result.priceBeforeTax).toBeCloseTo(100, 2);
      expect(result.taxAmount).toBeCloseTo(7.25, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(7.25, 2);
    });
  });

  describe('calculateTaxRate', () => {
    test('should calculate tax rate from price and total', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        totalPrice: 108.5,
        calculationMode: 'rate',
      };

      const result = calculateTaxRate(inputs);

      expect(result.priceBeforeTax).toBe(100);
      expect(result.totalPrice).toBe(108.5);
      expect(result.taxAmount).toBeCloseTo(8.5, 2);
      expect(result.effectiveTaxRate).toBeCloseTo(8.5, 2);
    });

    test('should handle zero tax rate calculation', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        totalPrice: 100,
        calculationMode: 'rate',
      };

      const result = calculateTaxRate(inputs);

      expect(result.effectiveTaxRate).toBe(0);
      expect(result.taxAmount).toBe(0);
    });

    test('should handle high tax rate calculation', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        totalPrice: 125,
        calculationMode: 'rate',
      };

      const result = calculateTaxRate(inputs);

      expect(result.effectiveTaxRate).toBeCloseTo(25, 2);
      expect(result.taxAmount).toBeCloseTo(25, 2);
    });
  });

  describe('validateSalesTaxInputs', () => {
    test('should validate valid forward calculation inputs', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    test('should validate valid reverse calculation inputs', () => {
      const inputs: SalesTaxInputs = {
        totalPrice: 108.25,
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'reverse',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    test('should validate valid rate calculation inputs', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        totalPrice: 108.25,
        calculationMode: 'rate',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toHaveLength(0);
    });

    test('should return error for negative price', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: -100,
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain('Price before tax must be a positive number');
    });

    test('should return error for negative tax rate', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        stateTaxRate: -5,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain('State tax rate cannot be negative');
    });

    test('should return error for excessive tax rate', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        stateTaxRate: 15,
        localTaxRate: 10,
        calculationMode: 'forward',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain('Combined tax rate cannot exceed 20%');
    });

    test('should return error for missing required fields in forward mode', () => {
      const inputs: SalesTaxInputs = {
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain(
        'Price before tax is required for forward calculation'
      );
    });

    test('should return error for missing required fields in reverse mode', () => {
      const inputs: SalesTaxInputs = {
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'reverse',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain(
        'Total price is required for reverse calculation'
      );
    });

    test('should return error for missing fields in rate calculation', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        calculationMode: 'rate',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain(
        'Both price before tax and total price are required for tax rate calculation'
      );
    });

    test('should return error when total is less than price before tax', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        totalPrice: 90,
        calculationMode: 'rate',
      };

      const errors = validateSalesTaxInputs(inputs);
      expect(errors).toContain(
        'Total price cannot be less than price before tax'
      );
    });
  });

  describe('State Tax Rates', () => {
    test('should have correct 2025 tax rates for sample states', () => {
      // States with no sales tax
      expect(STATE_TAX_RATES_2025['Alaska']).toBe(0);
      expect(STATE_TAX_RATES_2025['Delaware']).toBe(0);
      expect(STATE_TAX_RATES_2025['Montana']).toBe(0);
      expect(STATE_TAX_RATES_2025['New Hampshire']).toBe(0);
      expect(STATE_TAX_RATES_2025['Oregon']).toBe(0);

      // States with sales tax
      expect(STATE_TAX_RATES_2025['California']).toBe(7.25);
      expect(STATE_TAX_RATES_2025['Texas']).toBe(6.25);
      expect(STATE_TAX_RATES_2025['Florida']).toBe(6);
      expect(STATE_TAX_RATES_2025['New York']).toBe(4);
      expect(STATE_TAX_RATES_2025['Tennessee']).toBe(7);
    });

    test('should have all 50 states plus DC', () => {
      const stateCount = Object.keys(STATE_TAX_RATES_2025).length;
      expect(stateCount).toBeGreaterThanOrEqual(51); // 50 states + DC
    });

    test('should have reasonable tax rates', () => {
      Object.entries(STATE_TAX_RATES_2025).forEach(([, rate]) => {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(10); // No state has base rate over 10%
      });
    });
  });

  describe('Formatting Functions', () => {
    test('formatCurrency should format numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(99.999)).toBe('$100.00');
      expect(formatCurrency(0.01)).toBe('$0.01');
    });

    test('formatPercentage should format percentages correctly', () => {
      expect(formatPercentage(8.25)).toBe('8.25%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(100)).toBe('100.00%');
      expect(formatPercentage(7.125)).toBe('7.13%');
      expect(formatPercentage(0.5)).toBe('0.50%');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small amounts', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 0.01,
        stateTaxRate: 8.25,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);
      expect(result.taxAmount).toBeCloseTo(0.0008, 4);
      expect(result.totalPrice).toBeCloseTo(0.0108, 4);
    });

    test('should handle very large amounts', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 1000000,
        stateTaxRate: 8.875,
        localTaxRate: 0,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);
      expect(result.taxAmount).toBeCloseTo(88750, 2);
      expect(result.totalPrice).toBeCloseTo(1088750, 2);
    });

    test('should handle fractional tax rates', () => {
      const inputs: SalesTaxInputs = {
        priceBeforeTax: 100,
        stateTaxRate: 7.125,
        localTaxRate: 1.375,
        calculationMode: 'forward',
      };

      const result = calculateSalesTax(inputs);
      expect(result.effectiveTaxRate).toBeCloseTo(8.5, 2);
      expect(result.taxAmount).toBeCloseTo(8.5, 2);
      expect(result.totalPrice).toBeCloseTo(108.5, 2);
    });
  });

  describe('Tax Comparison', () => {
    test('should calculate tax differences between states', () => {
      const price = 1000;

      // California
      const caInputs: SalesTaxInputs = {
        priceBeforeTax: price,
        stateTaxRate: STATE_TAX_RATES_2025['California'],
        localTaxRate: 0,
        calculationMode: 'forward',
      };
      const caResult = calculateSalesTax(caInputs);

      // Oregon (no sales tax)
      const orInputs: SalesTaxInputs = {
        priceBeforeTax: price,
        stateTaxRate: STATE_TAX_RATES_2025['Oregon'],
        localTaxRate: 0,
        calculationMode: 'forward',
      };
      const orResult = calculateSalesTax(orInputs);

      // Texas
      const txInputs: SalesTaxInputs = {
        priceBeforeTax: price,
        stateTaxRate: STATE_TAX_RATES_2025['Texas'],
        localTaxRate: 0,
        calculationMode: 'forward',
      };
      const txResult = calculateSalesTax(txInputs);

      expect(caResult.taxAmount).toBeCloseTo(72.5, 2); // 7.25%
      expect(orResult.taxAmount).toBe(0); // 0%
      expect(txResult.taxAmount).toBeCloseTo(62.5, 2); // 6.25%

      // California should have higher tax than Texas
      expect(caResult.taxAmount).toBeGreaterThan(txResult.taxAmount);
      // Texas should have higher tax than Oregon
      expect(txResult.taxAmount).toBeGreaterThan(orResult.taxAmount);
    });
  });
});
