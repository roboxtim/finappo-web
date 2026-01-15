'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  Info,
  ChevronDown,
  Search,
  RefreshCw,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import {
  convertCurrency,
  getMultiCurrencyComparison,
  getCommonConversions,
  formatCurrency,
  formatExchangeRate,
  formatNumber,
  validateCurrencyInputs,
  getAllCurrencies,
  POPULAR_CURRENCIES,
  type CurrencyCode,
  type ConversionResult,
} from './calculations';

export default function CurrencyCalculator() {
  // Input states
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('EUR');
  const [searchFrom, setSearchFrom] = useState<string>('');
  const [searchTo, setSearchTo] = useState<string>('');
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);
  const [showPopularOnly, setShowPopularOnly] = useState<boolean>(false);

  // Results
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Get all currencies
  const allCurrencies = useMemo(() => getAllCurrencies(), []);

  // Filter currencies based on search
  const getFilteredCurrencies = useCallback(
    (searchTerm: string) => {
      const currencies = showPopularOnly
        ? allCurrencies.filter((c) => POPULAR_CURRENCIES.includes(c.code))
        : allCurrencies;

      if (!searchTerm) return currencies;

      const search = searchTerm.toLowerCase();
      return currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(search) ||
          c.name.toLowerCase().includes(search)
      );
    },
    [allCurrencies, showPopularOnly]
  );

  const filteredFromCurrencies = useMemo(
    () => getFilteredCurrencies(searchFrom),
    [searchFrom, getFilteredCurrencies]
  );

  const filteredToCurrencies = useMemo(
    () => getFilteredCurrencies(searchTo),
    [searchTo, getFilteredCurrencies]
  );

  // Calculate currency conversion
  const calculate = useCallback(() => {
    const validationErrors = validateCurrencyInputs(
      amount,
      fromCurrency,
      toCurrency
    );
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    setErrors([]);
    const calculatedResult = convertCurrency(amount, fromCurrency, toCurrency);
    setResult(calculatedResult);
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Get multi-currency comparison
  const multiCurrencyComparison = useMemo(() => {
    if (!result) return null;
    const targetCurrencies = POPULAR_CURRENCIES.filter(
      (c) => c !== fromCurrency
    ).slice(0, 6);
    return getMultiCurrencyComparison(amount, fromCurrency, targetCurrencies);
  }, [amount, fromCurrency, result]);

  // Get common conversions
  const commonConversions = useMemo(() => {
    if (!result) return null;
    return getCommonConversions(fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency, result]);

  // Format input value for display
  const formatInputValue = (value: number) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Parse input value
  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  // Swap currencies
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Quick amount buttons
  const quickAmounts = [1, 10, 100, 1000, 10000];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-white to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-6 lg:pt-28 lg:pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/financial-calculators"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Calculators
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Currency Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Convert between world currencies with real-time exchange rates
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Currency Converter */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Currency Converter
                </h2>

                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      Please fix the following errors:
                    </p>
                    <ul className="space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formatInputValue(amount)}
                        onChange={(e) =>
                          setAmount(parseInputValue(e.target.value))
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="100"
                      />
                    </div>
                    {/* Quick amounts */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {quickAmounts.map((quickAmount) => (
                        <button
                          key={quickAmount}
                          onClick={() => setAmount(quickAmount)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            amount === quickAmount
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {formatNumber(quickAmount, 0)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* From Currency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium text-left flex items-center justify-between"
                      >
                        <span>
                          {fromCurrency} -{' '}
                          {
                            allCurrencies.find((c) => c.code === fromCurrency)
                              ?.name
                          }
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>

                      {showFromDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={searchFrom}
                                onChange={(e) => setSearchFrom(e.target.value)}
                                placeholder="Search currencies..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                              />
                            </div>
                            <label className="flex items-center gap-2 mt-2 text-sm">
                              <input
                                type="checkbox"
                                checked={showPopularOnly}
                                onChange={(e) =>
                                  setShowPopularOnly(e.target.checked)
                                }
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-gray-600">
                                Popular currencies only
                              </span>
                            </label>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {filteredFromCurrencies.map((currency) => (
                              <button
                                key={currency.code}
                                onClick={() => {
                                  setFromCurrency(currency.code);
                                  setShowFromDropdown(false);
                                  setSearchFrom('');
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                  currency.code === fromCurrency
                                    ? 'bg-green-50 text-green-900'
                                    : 'text-gray-900'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold">
                                      {currency.code}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {currency.name}
                                    </div>
                                  </div>
                                  <div className="text-xl">
                                    {currency.symbol}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={swapCurrencies}
                      className="p-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      title="Swap currencies"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* To Currency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      To
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium text-left flex items-center justify-between"
                      >
                        <span>
                          {toCurrency} -{' '}
                          {
                            allCurrencies.find((c) => c.code === toCurrency)
                              ?.name
                          }
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>

                      {showToDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                placeholder="Search currencies..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                              />
                            </div>
                            <label className="flex items-center gap-2 mt-2 text-sm">
                              <input
                                type="checkbox"
                                checked={showPopularOnly}
                                onChange={(e) =>
                                  setShowPopularOnly(e.target.checked)
                                }
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-gray-600">
                                Popular currencies only
                              </span>
                            </label>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {filteredToCurrencies.map((currency) => (
                              <button
                                key={currency.code}
                                onClick={() => {
                                  setToCurrency(currency.code);
                                  setShowToDropdown(false);
                                  setSearchTo('');
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                  currency.code === toCurrency
                                    ? 'bg-green-50 text-green-900'
                                    : 'text-gray-900'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold">
                                      {currency.code}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {currency.name}
                                    </div>
                                  </div>
                                  <div className="text-xl">
                                    {currency.symbol}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {result && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-green-600 to-emerald-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      Converted Amount
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(result.convertedAmount, toCurrency)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      {formatCurrency(amount, fromCurrency)}
                    </div>

                    <div className="pt-6 border-t border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm opacity-75">Exchange Rate</div>
                        <div className="text-lg font-semibold">
                          {formatExchangeRate(
                            fromCurrency,
                            toCurrency,
                            result.exchangeRate
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm opacity-75">Inverse Rate</div>
                        <div className="text-lg font-semibold">
                          {formatExchangeRate(
                            toCurrency,
                            fromCurrency,
                            result.inverseRate
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Conversions */}
                  {commonConversions && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Common Conversions
                      </h3>

                      <div className="space-y-3">
                        {commonConversions.values.map((value) => (
                          <div
                            key={value.amount}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(value.amount, fromCurrency)}
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                              <div className="font-semibold text-green-600">
                                {formatCurrency(value.converted, toCurrency)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multi-Currency Comparison */}
                  {multiCurrencyComparison && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Compare to Other Currencies
                      </h3>

                      <div className="space-y-3">
                        {multiCurrencyComparison.conversions.map(
                          (conversion) => (
                            <div
                              key={conversion.currency}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
                            >
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {conversion.currency}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {
                                    allCurrencies.find(
                                      (c) => c.code === conversion.currency
                                    )?.name
                                  }
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                  {formatCurrency(
                                    conversion.amount,
                                    conversion.currency
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Rate: {formatNumber(conversion.rate, 4)}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Understanding Results */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Understanding Exchange Rates
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isDetailsOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDetailsOpen && (
                      <div className="px-8 pb-8 space-y-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-green-600" />
                            What is an Exchange Rate?
                          </h4>
                          <p className="text-sm text-gray-600">
                            An exchange rate tells you how much one currency is
                            worth in terms of another. For example, if 1 USD =
                            0.92 EUR, it means one US Dollar can be exchanged
                            for 0.92 Euros.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Why Exchange Rates Change
                          </h4>
                          <p className="text-sm text-gray-600">
                            Exchange rates fluctuate based on supply and demand,
                            interest rates, economic indicators, political
                            stability, and market speculation. Rates can change
                            multiple times per day in the forex market.
                          </p>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-amber-600" />
                            Important Note
                          </h4>
                          <p className="text-sm text-gray-600">
                            The rates shown here are for demonstration purposes
                            based on approximate January 2025 values. For actual
                            currency exchange, always check with your bank or
                            currency exchange service for current rates, which
                            may include fees and margins.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Currency Exchange
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What Affects Exchange Rates?
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Interest Rates:</strong> Higher interest rates
                    attract foreign investment, increasing demand for a
                    currency.
                  </li>
                  <li>
                    <strong>Inflation:</strong> Lower inflation typically
                    strengthens a currency as purchasing power increases.
                  </li>
                  <li>
                    <strong>Economic Growth:</strong> Strong GDP growth and low
                    unemployment make a currency more attractive.
                  </li>
                  <li>
                    <strong>Political Stability:</strong> Countries with stable
                    governments tend to have stronger currencies.
                  </li>
                  <li>
                    <strong>Trade Balance:</strong> Countries with trade
                    surpluses generally see their currencies appreciate.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Popular Currency Pairs
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Major Pairs
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• EUR/USD - Euro vs US Dollar</li>
                      <li>• USD/JPY - US Dollar vs Japanese Yen</li>
                      <li>• GBP/USD - British Pound vs US Dollar</li>
                      <li>• USD/CHF - US Dollar vs Swiss Franc</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Minor Pairs
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• EUR/GBP - Euro vs British Pound</li>
                      <li>• AUD/CAD - Australian vs Canadian Dollar</li>
                      <li>• NZD/JPY - New Zealand Dollar vs Yen</li>
                      <li>• GBP/CAD - British Pound vs Canadian Dollar</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Currency Exchange
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Compare Rates:</strong> Different banks and
                    exchange services offer varying rates and fees.
                  </li>
                  <li>
                    • <strong>Avoid Airport Exchanges:</strong> Airport kiosks
                    typically have the worst rates.
                  </li>
                  <li>
                    • <strong>Use Credit Cards Wisely:</strong> Cards often
                    offer competitive exchange rates but watch for foreign
                    transaction fees.
                  </li>
                  <li>
                    • <strong>Plan Ahead:</strong> Exchange currency before
                    traveling to get better rates.
                  </li>
                  <li>
                    • <strong>Consider Timing:</strong> Exchange rates can vary
                    significantly throughout the day.
                  </li>
                  <li>
                    • <strong>Watch for Hidden Fees:</strong> Always ask about
                    commission fees and service charges.
                  </li>
                  <li>
                    • <strong>Use ATMs Abroad:</strong> Often provide better
                    rates than exchange bureaus.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Understanding Currency Symbols
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="font-bold text-lg text-purple-600">$</div>
                    <div className="text-gray-900 font-semibold">USD</div>
                    <div className="text-gray-600">US Dollar</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="font-bold text-lg text-purple-600">€</div>
                    <div className="text-gray-900 font-semibold">EUR</div>
                    <div className="text-gray-600">Euro</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="font-bold text-lg text-purple-600">£</div>
                    <div className="text-gray-900 font-semibold">GBP</div>
                    <div className="text-gray-600">British Pound</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="font-bold text-lg text-purple-600">¥</div>
                    <div className="text-gray-900 font-semibold">JPY</div>
                    <div className="text-gray-600">Japanese Yen</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="font-bold text-lg text-purple-600">₹</div>
                    <div className="text-gray-900 font-semibold">INR</div>
                    <div className="text-gray-600">Indian Rupee</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="font-bold text-lg text-purple-600">₩</div>
                    <div className="text-gray-900 font-semibold">KRW</div>
                    <div className="text-gray-600">Korean Won</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Forex Market Basics
                </h3>
                <p className="mb-4">
                  The foreign exchange (forex) market is the world&apos;s
                  largest financial market, with over $7 trillion traded daily.
                  It operates 24 hours a day, 5 days a week across major
                  financial centers worldwide.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Market Hours:</strong> Trading moves from Sydney
                    to Tokyo to London to New York
                  </li>
                  <li>
                    • <strong>Participants:</strong> Banks, corporations,
                    governments, and individual traders
                  </li>
                  <li>
                    • <strong>Liquidity:</strong> High liquidity ensures tight
                    spreads and efficient pricing
                  </li>
                  <li>
                    • <strong>Volatility:</strong> Currencies can move
                    significantly based on news and events
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm text-gray-600 text-center md:text-left">
              <p className="font-medium text-gray-900">Finappo</p>
              <p>&copy; 2025 All rights reserved.</p>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link
                href="/financial-calculators"
                className="hover:text-gray-900 transition-colors"
              >
                Calculators
              </Link>
              <Link
                href="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
