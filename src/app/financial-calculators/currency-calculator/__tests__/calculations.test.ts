import {
  convertCurrency,
  getExchangeRate,
  formatCurrency,
  formatCurrencySymbol,
  validateCurrencyInputs,
  CURRENCIES,
  EXCHANGE_RATES,
  type CurrencyCode,
} from '../calculations';

describe('Currency Calculator - Conversion Tests', () => {
  describe('Basic Currency Conversions', () => {
    test('Test Case 1: Convert 100 USD to EUR', () => {
      const result = convertCurrency(100, 'USD', 'EUR');
      expect(result.convertedAmount).toBeCloseTo(92, 0); // ~92 EUR
      expect(result.exchangeRate).toBeCloseTo(0.92, 2);
      expect(result.fromCurrency).toBe('USD');
      expect(result.toCurrency).toBe('EUR');
    });

    test('Test Case 2: Convert 1000 USD to GBP', () => {
      const result = convertCurrency(1000, 'USD', 'GBP');
      expect(result.convertedAmount).toBeCloseTo(790, 0); // ~790 GBP
      expect(result.exchangeRate).toBeCloseTo(0.79, 2);
    });

    test('Test Case 3: Convert 500 USD to JPY', () => {
      const result = convertCurrency(500, 'USD', 'JPY');
      expect(result.convertedAmount).toBeCloseTo(74500, 100); // ~74,500 JPY
      expect(result.exchangeRate).toBeCloseTo(149, 1);
    });

    test('Test Case 4: Convert 250 EUR to USD', () => {
      const result = convertCurrency(250, 'EUR', 'USD');
      const expectedAmount = 250 / 0.92; // ~271.74 USD
      expect(result.convertedAmount).toBeCloseTo(expectedAmount, 0);
      expect(result.exchangeRate).toBeCloseTo(1 / 0.92, 2);
    });

    test('Test Case 5: Convert 10000 CNY to USD', () => {
      const result = convertCurrency(10000, 'CNY', 'USD');
      const expectedAmount = 10000 / 7.24; // ~1381.22 USD
      expect(result.convertedAmount).toBeCloseTo(expectedAmount, 0);
      expect(result.exchangeRate).toBeCloseTo(1 / 7.24, 4);
    });
  });

  describe('Cross-Currency Conversions (Non-USD pairs)', () => {
    test('Test Case 6: Convert 100 EUR to GBP', () => {
      const result = convertCurrency(100, 'EUR', 'GBP');
      // EUR -> USD -> GBP: 100 / 0.92 * 0.79
      const expectedAmount = (100 / 0.92) * 0.79;
      expect(result.convertedAmount).toBeCloseTo(expectedAmount, 0);
    });

    test('Test Case 7: Convert 1000 GBP to JPY', () => {
      const result = convertCurrency(1000, 'GBP', 'JPY');
      // GBP -> USD -> JPY: 1000 / 0.79 * 149
      const expectedAmount = (1000 / 0.79) * 149;
      expect(result.convertedAmount).toBeCloseTo(expectedAmount, 0);
    });

    test('Test Case 8: Convert 5000 CAD to AUD', () => {
      const result = convertCurrency(5000, 'CAD', 'AUD');
      // CAD -> USD -> AUD: 5000 / 1.36 * 1.53
      const expectedAmount = (5000 / 1.36) * 1.53;
      expect(result.convertedAmount).toBeCloseTo(expectedAmount, 0);
    });
  });

  describe('Edge Cases', () => {
    test('Test Case 9: Convert 0 amount', () => {
      const result = convertCurrency(0, 'USD', 'EUR');
      expect(result.convertedAmount).toBe(0);
      expect(result.exchangeRate).toBeCloseTo(0.92, 2);
    });

    test('Test Case 10: Convert very large amount (1,000,000 USD to EUR)', () => {
      const result = convertCurrency(1000000, 'USD', 'EUR');
      expect(result.convertedAmount).toBeCloseTo(920000, 0);
      expect(result.exchangeRate).toBeCloseTo(0.92, 2);
    });

    test('Test Case 11: Convert small decimal amount (0.01 USD to EUR)', () => {
      const result = convertCurrency(0.01, 'USD', 'EUR');
      expect(result.convertedAmount).toBeCloseTo(0.0092, 4);
    });

    test('Test Case 12: Same currency conversion (USD to USD)', () => {
      const result = convertCurrency(100, 'USD', 'USD');
      expect(result.convertedAmount).toBe(100);
      expect(result.exchangeRate).toBe(1);
    });
  });

  describe('Bidirectional Conversions', () => {
    test('Test Case 13: USD to EUR and back should equal original (with small precision loss)', () => {
      const usdToEur = convertCurrency(1000, 'USD', 'EUR');
      const eurToUsd = convertCurrency(usdToEur.convertedAmount, 'EUR', 'USD');
      expect(eurToUsd.convertedAmount).toBeCloseTo(1000, 0);
    });

    test('Test Case 14: Inverse rate calculation', () => {
      const usdToGbp = convertCurrency(1, 'USD', 'GBP');
      const gbpToUsd = convertCurrency(1, 'GBP', 'USD');
      expect(usdToGbp.exchangeRate * gbpToUsd.exchangeRate).toBeCloseTo(1, 4);
    });
  });

  describe('Popular Currency Pairs', () => {
    test('Test Case 15: USD to INR conversion', () => {
      const result = convertCurrency(100, 'USD', 'INR');
      expect(result.convertedAmount).toBeCloseTo(8300, 100); // ~8300 INR
    });

    test('Test Case 16: USD to MXN conversion', () => {
      const result = convertCurrency(100, 'USD', 'MXN');
      expect(result.convertedAmount).toBeCloseTo(1700, 100); // ~1700 MXN
    });

    test('Test Case 17: USD to CHF (Swiss Franc) conversion', () => {
      const result = convertCurrency(100, 'USD', 'CHF');
      expect(result.convertedAmount).toBeCloseTo(88, 2); // ~88 CHF
    });
  });

  describe('Exchange Rate Retrieval', () => {
    test('Get exchange rate for USD to EUR', () => {
      const rate = getExchangeRate('USD', 'EUR');
      expect(rate).toBeCloseTo(0.92, 2);
    });

    test('Get exchange rate for same currency returns 1', () => {
      const rate = getExchangeRate('USD', 'USD');
      expect(rate).toBe(1);
    });

    test('Get exchange rate for cross-currency pair', () => {
      const rate = getExchangeRate('EUR', 'GBP');
      const expectedRate = 0.79 / 0.92;
      expect(rate).toBeCloseTo(expectedRate, 4);
    });
  });

  describe('Validation', () => {
    test('Valid inputs should pass validation', () => {
      const errors = validateCurrencyInputs(100, 'USD', 'EUR');
      expect(errors).toHaveLength(0);
    });

    test('Negative amount should fail validation', () => {
      const errors = validateCurrencyInputs(-100, 'USD', 'EUR');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Amount must be greater than or equal to 0');
    });

    test('Invalid from currency should fail validation', () => {
      const errors = validateCurrencyInputs(
        100,
        'INVALID' as CurrencyCode,
        'EUR'
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    test('Invalid to currency should fail validation', () => {
      const errors = validateCurrencyInputs(
        100,
        'USD',
        'INVALID' as CurrencyCode
      );
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Formatting', () => {
    test('Format USD currency', () => {
      const formatted = formatCurrency(1234.56, 'USD');
      expect(formatted).toContain('1,234.56');
    });

    test('Format EUR currency', () => {
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(formatted).toContain('1,234.56');
    });

    test('Format JPY currency (no decimals)', () => {
      const formatted = formatCurrency(1234, 'JPY');
      expect(formatted).toContain('1,234');
      expect(formatted).not.toContain('.');
    });

    test('Get currency symbol for USD', () => {
      const symbol = formatCurrencySymbol('USD');
      expect(symbol).toBe('$');
    });

    test('Get currency symbol for EUR', () => {
      const symbol = formatCurrencySymbol('EUR');
      expect(symbol).toBe('€');
    });

    test('Get currency symbol for GBP', () => {
      const symbol = formatCurrencySymbol('GBP');
      expect(symbol).toBe('£');
    });
  });

  describe('Currency Data Integrity', () => {
    test('All currencies have exchange rates', () => {
      Object.keys(CURRENCIES).forEach((code) => {
        expect(EXCHANGE_RATES[code as CurrencyCode]).toBeDefined();
        expect(typeof EXCHANGE_RATES[code as CurrencyCode]).toBe('number');
      });
    });

    test('USD exchange rate is 1.00', () => {
      expect(EXCHANGE_RATES.USD).toBe(1);
    });

    test('All exchange rates are positive numbers', () => {
      Object.values(EXCHANGE_RATES).forEach((rate) => {
        expect(rate).toBeGreaterThan(0);
      });
    });
  });
});
