// Currency Calculator Calculations
// Based on approximate exchange rates (demonstration purposes)
// Note: For production use, integrate with a real-time exchange rate API

export type CurrencyCode =
  | 'USD' // US Dollar
  | 'EUR' // Euro
  | 'GBP' // British Pound
  | 'JPY' // Japanese Yen
  | 'CNY' // Chinese Yuan
  | 'CAD' // Canadian Dollar
  | 'AUD' // Australian Dollar
  | 'CHF' // Swiss Franc
  | 'INR' // Indian Rupee
  | 'MXN' // Mexican Peso
  | 'BRL' // Brazilian Real
  | 'KRW' // South Korean Won
  | 'SEK' // Swedish Krona
  | 'NOK' // Norwegian Krone
  | 'DKK' // Danish Krone
  | 'SGD' // Singapore Dollar
  | 'HKD' // Hong Kong Dollar
  | 'NZD' // New Zealand Dollar
  | 'ZAR' // South African Rand
  | 'TRY'; // Turkish Lira

// Currency information with symbols and names
export const CURRENCIES: Record<
  CurrencyCode,
  { name: string; symbol: string; decimals: number }
> = {
  USD: { name: 'US Dollar', symbol: '$', decimals: 2 },
  EUR: { name: 'Euro', symbol: '€', decimals: 2 },
  GBP: { name: 'British Pound', symbol: '£', decimals: 2 },
  JPY: { name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  CNY: { name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
  AUD: { name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  INR: { name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  MXN: { name: 'Mexican Peso', symbol: 'Mex$', decimals: 2 },
  BRL: { name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  KRW: { name: 'South Korean Won', symbol: '₩', decimals: 0 },
  SEK: { name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
  DKK: { name: 'Danish Krone', symbol: 'kr', decimals: 2 },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
  ZAR: { name: 'South African Rand', symbol: 'R', decimals: 2 },
  TRY: { name: 'Turkish Lira', symbol: '₺', decimals: 2 },
};

// Exchange rates relative to USD (1 USD = X currency)
// These are approximate rates for demonstration purposes
// Last updated: January 2025 (approximate)
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.0,
  CNY: 7.24,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  INR: 83.0,
  MXN: 17.0,
  BRL: 4.95,
  KRW: 1320.0,
  SEK: 10.45,
  NOK: 10.75,
  DKK: 6.88,
  SGD: 1.34,
  HKD: 7.82,
  NZD: 1.65,
  ZAR: 18.5,
  TRY: 32.5,
};

// Popular currency pairs for quick access
export const POPULAR_CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'CAD',
  'AUD',
  'CHF',
];

export interface ConversionResult {
  amount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  convertedAmount: number;
  exchangeRate: number;
  inverseRate: number;
  timestamp: Date;
}

export interface MultiCurrencyComparison {
  baseCurrency: CurrencyCode;
  baseAmount: number;
  conversions: Array<{
    currency: CurrencyCode;
    amount: number;
    rate: number;
  }>;
}

export interface CommonConversions {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  values: Array<{
    amount: number;
    converted: number;
  }>;
}

/**
 * Get exchange rate between two currencies
 * Uses USD as the base currency for cross-currency conversions
 */
export function getExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  // Get rates relative to USD
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  // Convert: from -> USD -> to
  // If fromRate = 0.92 (EUR), 1 EUR = 1/0.92 USD
  // Then multiply by toRate to get target currency
  return toRate / fromRate;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): ConversionResult {
  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount * exchangeRate;
  const inverseRate = 1 / exchangeRate;

  return {
    amount,
    fromCurrency,
    toCurrency,
    convertedAmount,
    exchangeRate,
    inverseRate,
    timestamp: new Date(),
  };
}

/**
 * Get conversions to multiple currencies
 */
export function getMultiCurrencyComparison(
  amount: number,
  fromCurrency: CurrencyCode,
  targetCurrencies: CurrencyCode[]
): MultiCurrencyComparison {
  const conversions = targetCurrencies
    .filter((currency) => currency !== fromCurrency)
    .map((currency) => {
      const result = convertCurrency(amount, fromCurrency, currency);
      return {
        currency,
        amount: result.convertedAmount,
        rate: result.exchangeRate,
      };
    });

  return {
    baseCurrency: fromCurrency,
    baseAmount: amount,
    conversions,
  };
}

/**
 * Get common conversion values (1, 10, 100, 1000, 10000)
 */
export function getCommonConversions(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): CommonConversions {
  const commonAmounts = [1, 10, 100, 1000, 10000];
  const values = commonAmounts.map((amount) => {
    const result = convertCurrency(amount, fromCurrency, toCurrency);
    return {
      amount,
      converted: result.convertedAmount,
    };
  });

  return {
    fromCurrency,
    toCurrency,
    values,
  };
}

/**
 * Validate currency conversion inputs
 */
export function validateCurrencyInputs(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): string[] {
  const errors: string[] = [];

  if (amount < 0) {
    errors.push('Amount must be greater than or equal to 0');
  }

  if (isNaN(amount)) {
    errors.push('Amount must be a valid number');
  }

  if (!CURRENCIES[fromCurrency]) {
    errors.push('Invalid from currency');
  }

  if (!CURRENCIES[toCurrency]) {
    errors.push('Invalid to currency');
  }

  return errors;
}

/**
 * Format currency value with proper symbol and decimals
 */
export function formatCurrency(
  value: number,
  currencyCode: CurrencyCode
): string {
  const currency = CURRENCIES[currencyCode];
  const decimals = currency.decimals;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Get currency symbol
 */
export function formatCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format exchange rate for display (e.g., "1 USD = 0.92 EUR")
 */
export function formatExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate: number
): string {
  const currency = CURRENCIES[toCurrency];
  const formattedRate = formatNumber(rate, currency.decimals);
  return `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
}

/**
 * Calculate percentage change between two amounts
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get all available currencies as options
 */
export function getAllCurrencies(): Array<{
  code: CurrencyCode;
  name: string;
  symbol: string;
}> {
  return Object.entries(CURRENCIES).map(([code, info]) => ({
    code: code as CurrencyCode,
    name: info.name,
    symbol: info.symbol,
  }));
}

/**
 * Check if a currency code is valid
 */
export function isValidCurrency(code: string): code is CurrencyCode {
  return code in CURRENCIES;
}
