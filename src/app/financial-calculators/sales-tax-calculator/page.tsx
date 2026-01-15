'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  Receipt,
  Calculator,
  MapPin,
  ShoppingCart,
  Percent,
  ArrowUpDown,
  Building2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateSalesTax,
  calculatePriceBeforeTax,
  calculateTaxRate,
  validateSalesTaxInputs,
  formatCurrency,
  formatPercentage,
  parseCurrencyInput,
  compareStates,
  calculateStateSavings,
  getNoTaxStates,
  STATE_TAX_RATES_2025,
  MAX_LOCAL_TAX_RATES,
  type SalesTaxInputs,
  type SalesTaxResults,
  type StateComparison,
} from './calculations';

export default function SalesTaxCalculator() {
  // Input states
  const [priceBeforeTax, setPriceBeforeTax] = useState<number>(100);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedState, setSelectedState] = useState<string>('California');
  const [localTaxRate, setLocalTaxRate] = useState<number>(0);
  const [calculationMode, setCalculationMode] = useState<
    'forward' | 'reverse' | 'rate'
  >('forward');
  const [taxInclusive, setTaxInclusive] = useState<boolean>(false);

  // Results
  const [results, setResults] = useState<SalesTaxResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [stateComparisons, setStateComparisons] = useState<StateComparison[]>(
    []
  );

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [annualSpending, setAnnualSpending] = useState<number>(10000);

  // Get state tax rate
  const getStateTaxRate = useCallback(
    () => STATE_TAX_RATES_2025[selectedState] || 0,
    [selectedState]
  );

  // Get max local tax rate for selected state
  const getMaxLocalRate = () => MAX_LOCAL_TAX_RATES[selectedState] || 0;

  // Calculate Sales Tax
  const calculate = useCallback(() => {
    let inputs: SalesTaxInputs;
    const stateTaxRate = getStateTaxRate();

    if (calculationMode === 'forward') {
      inputs = {
        priceBeforeTax: taxInclusive
          ? priceBeforeTax / (1 + (stateTaxRate + localTaxRate) / 100)
          : priceBeforeTax,
        stateTaxRate,
        localTaxRate,
        calculationMode: 'forward',
      };
    } else if (calculationMode === 'reverse') {
      inputs = {
        totalPrice,
        stateTaxRate,
        localTaxRate,
        calculationMode: 'reverse',
      };
    } else {
      inputs = {
        priceBeforeTax,
        totalPrice,
        calculationMode: 'rate',
      };
    }

    const validationErrors = validateSalesTaxInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);

    let calculatedResults: SalesTaxResults;
    if (calculationMode === 'forward') {
      calculatedResults = calculateSalesTax(inputs);
    } else if (calculationMode === 'reverse') {
      calculatedResults = calculatePriceBeforeTax(inputs);
    } else {
      calculatedResults = calculateTaxRate(inputs);
    }

    setResults(calculatedResults);

    // Calculate state comparisons if in forward mode
    if (calculationMode === 'forward' && priceBeforeTax > 0) {
      const comparisons = compareStates(
        taxInclusive
          ? priceBeforeTax / (1 + (stateTaxRate + localTaxRate) / 100)
          : priceBeforeTax,
        selectedState
      );
      setStateComparisons(comparisons);
    }
  }, [
    priceBeforeTax,
    totalPrice,
    selectedState,
    localTaxRate,
    calculationMode,
    taxInclusive,
    getStateTaxRate,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Format input value for display
  const formatInputValue = (value: number) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Handle calculation mode change
  const handleModeChange = (mode: 'forward' | 'reverse' | 'rate') => {
    setCalculationMode(mode);
    setErrors([]);
  };

  // Get no-tax states
  const noTaxStates = getNoTaxStates();

  // Calculate annual savings if moving states
  const calculateAnnualStateSavings = () => {
    if (!annualSpending || annualSpending <= 0) return null;

    const fromState = selectedState;
    const toState = noTaxStates[0]; // Compare to Alaska (first no-tax state alphabetically)

    return calculateStateSavings(
      annualSpending,
      fromState,
      toState,
      localTaxRate,
      0
    );
  };

  const annualSavings = calculateAnnualStateSavings();

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Sales Tax Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate sales tax, find price before tax, or determine tax
                rates
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
              {/* Calculation Mode */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Calculation Mode
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={() => handleModeChange('forward')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      calculationMode === 'forward'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Calculator
                        className={`w-5 h-5 ${
                          calculationMode === 'forward'
                            ? 'text-purple-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          Calculate Tax & Total
                        </div>
                        <div className="text-sm text-gray-600">
                          Enter price before tax to find total
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleModeChange('reverse')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      calculationMode === 'reverse'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ArrowUpDown
                        className={`w-5 h-5 ${
                          calculationMode === 'reverse'
                            ? 'text-purple-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          Find Price Before Tax
                        </div>
                        <div className="text-sm text-gray-600">
                          Enter total to find original price
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleModeChange('rate')}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      calculationMode === 'rate'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Percent
                        className={`w-5 h-5 ${
                          calculationMode === 'rate'
                            ? 'text-purple-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          Calculate Tax Rate
                        </div>
                        <div className="text-sm text-gray-600">
                          Enter both prices to find tax rate
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Price Information
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
                  {(calculationMode === 'forward' ||
                    calculationMode === 'rate') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {taxInclusive
                          ? 'Price (Tax Inclusive)'
                          : 'Price Before Tax'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatInputValue(priceBeforeTax)}
                          onChange={(e) =>
                            setPriceBeforeTax(
                              parseCurrencyInput(e.target.value)
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                          placeholder="100.00"
                        />
                      </div>
                    </div>
                  )}

                  {(calculationMode === 'reverse' ||
                    calculationMode === 'rate') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Price (After Tax)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formatInputValue(totalPrice)}
                          onChange={(e) =>
                            setTotalPrice(parseCurrencyInput(e.target.value))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                          placeholder="108.25"
                        />
                      </div>
                    </div>
                  )}

                  {calculationMode === 'forward' && (
                    <div>
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="taxInclusive"
                          checked={taxInclusive}
                          onChange={(e) => setTaxInclusive(e.target.checked)}
                          className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <label
                          htmlFor="taxInclusive"
                          className="ml-3 text-sm font-semibold text-gray-700"
                        >
                          Price includes tax (VAT-style)
                        </label>
                      </div>
                      {taxInclusive && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                          <p className="text-sm text-purple-800">
                            The entered price already includes tax. Calculator
                            will show the tax amount and price before tax.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Rates */}
              {calculationMode !== 'rate' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Tax Rates
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                      >
                        {Object.entries(STATE_TAX_RATES_2025).map(
                          ([state, rate]) => (
                            <option key={state} value={state}>
                              {state} ({formatPercentage(rate)})
                            </option>
                          )
                        )}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        2025 State sales tax rate
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Local/City Tax Rate (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={localTaxRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setLocalTaxRate(value ? Number(value) : 0);
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      {getMaxLocalRate() > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedState} max local rate:{' '}
                          {formatPercentage(getMaxLocalRate())}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Combined Tax Rate:
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatPercentage(getStateTaxRate() + localTaxRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {results && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-violet-600 to-purple-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <ShoppingCart className="w-4 h-4" />
                      {calculationMode === 'forward'
                        ? 'Total Price'
                        : calculationMode === 'reverse'
                          ? 'Price Before Tax'
                          : 'Calculated Tax Rate'}
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {calculationMode === 'forward'
                        ? formatCurrency(results.totalPrice)
                        : calculationMode === 'reverse'
                          ? formatCurrency(results.priceBeforeTax)
                          : formatPercentage(results.effectiveTaxRate)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      {calculationMode === 'forward'
                        ? `Including ${formatCurrency(results.taxAmount)} in tax`
                        : calculationMode === 'reverse'
                          ? `From total of ${formatCurrency(results.totalPrice)}`
                          : `Tax amount: ${formatCurrency(results.taxAmount)}`}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          {calculationMode === 'rate'
                            ? 'Price Before Tax'
                            : 'Tax Amount'}
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {calculationMode === 'rate'
                            ? formatCurrency(results.priceBeforeTax)
                            : formatCurrency(results.taxAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          {calculationMode === 'rate'
                            ? 'Total Price'
                            : 'Effective Rate'}
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {calculationMode === 'rate'
                            ? formatCurrency(results.totalPrice)
                            : formatPercentage(results.effectiveTaxRate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Calculation Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Price Before Tax</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.priceBeforeTax)}
                        </span>
                      </div>

                      {results.stateTaxRate !== undefined && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-600">
                            State Tax ({formatPercentage(results.stateTaxRate)})
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.stateTaxAmount)}
                          </span>
                        </div>
                      )}

                      {results.localTaxRate !== undefined &&
                        results.localTaxRate > 0 && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-gray-600">
                              Local Tax (
                              {formatPercentage(results.localTaxRate)})
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(results.localTaxAmount)}
                            </span>
                          </div>
                        )}

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Tax</span>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(results.taxAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <span className="font-semibold text-gray-900">
                          Total Price
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(results.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* State Comparison */}
                  {calculationMode === 'forward' &&
                    stateComparisons.length > 0 && (
                      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900">
                            Compare States
                          </h3>
                          <button
                            onClick={() => setShowComparison(!showComparison)}
                            className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {showComparison ? 'Hide' : 'Show'} Comparison
                          </button>
                        </div>

                        {showComparison && (
                          <div className="space-y-3">
                            {stateComparisons.slice(0, 5).map((comparison) => (
                              <div
                                key={comparison.state}
                                className={`p-4 rounded-xl ${
                                  comparison.state === selectedState
                                    ? 'bg-purple-50 border border-purple-200'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-semibold text-gray-900">
                                      {comparison.state}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-600">
                                      ({formatPercentage(comparison.taxRate)})
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-900">
                                      {formatCurrency(comparison.totalPrice)}
                                    </div>
                                    {comparison.difference !== 0 && (
                                      <div
                                        className={`text-sm ${
                                          comparison.difference > 0
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                        }`}
                                      >
                                        {comparison.difference > 0 ? '+' : ''}
                                        {formatCurrency(comparison.difference)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {noTaxStates.length > 0 && (
                              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                <p className="text-sm font-semibold text-green-800 mb-1">
                                  States with No Sales Tax:
                                </p>
                                <p className="text-sm text-green-700">
                                  {noTaxStates.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Annual Savings Calculator */}
                  {calculationMode === 'forward' && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Annual Tax Impact
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Annual Taxable Spending
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(annualSpending)}
                              onChange={(e) =>
                                setAnnualSpending(
                                  parseCurrencyInput(e.target.value)
                                )
                              }
                              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                              placeholder="10,000"
                            />
                          </div>
                        </div>

                        {annualSavings && (
                          <div className="space-y-3">
                            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6">
                              <div className="flex items-center justify-between mb-4">
                                <span className="font-semibold text-gray-900">
                                  Annual Tax in {selectedState}
                                </span>
                                <span className="text-2xl font-bold text-purple-600">
                                  {formatCurrency(annualSavings.fromTax)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Based on{' '}
                                {formatPercentage(
                                  getStateTaxRate() + localTaxRate
                                )}{' '}
                                combined rate
                              </div>
                            </div>

                            {annualSavings.annualSavings > 0 && (
                              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <p className="text-sm font-semibold text-green-800">
                                  You could save{' '}
                                  {formatCurrency(annualSavings.annualSavings)}{' '}
                                  annually by shopping in a state with no sales
                                  tax!
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tips and Information */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Sales Tax Tips & Information
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isDetailsOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDetailsOpen && (
                      <div className="px-8 pb-8 space-y-4">
                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-purple-600" />
                            Tax-Exclusive vs Tax-Inclusive Pricing
                          </h4>
                          <p className="text-sm text-gray-600">
                            In the US, prices are typically shown without tax
                            (tax-exclusive). The tax is added at checkout. In
                            many other countries, prices include tax
                            (tax-inclusive or VAT).
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            State and Local Taxes
                          </h4>
                          <p className="text-sm text-gray-600">
                            Sales tax rates vary by state and locality. Some
                            states have no sales tax, while others may have
                            combined state and local rates exceeding 10%.
                          </p>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Online Shopping Tax
                          </h4>
                          <p className="text-sm text-gray-600">
                            Online retailers may charge sales tax based on your
                            shipping address or the seller&apos;s location,
                            depending on state laws and nexus requirements.
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-green-600" />
                            Business Considerations
                          </h4>
                          <p className="text-sm text-gray-600">
                            Businesses can often claim sales tax exemptions for
                            resale items or business equipment. Check with your
                            state&apos;s tax authority for specific exemption
                            rules.
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
              Understanding Sales Tax
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Sales Tax?
                </h3>
                <p className="mb-4">
                  Sales tax is a consumption tax imposed by governments on the
                  sale of goods and services. It&apos;s calculated as a
                  percentage of the purchase price and is typically collected by
                  the retailer at the point of sale, then remitted to the
                  government.
                </p>
                <p className="text-sm">
                  In the United States, sales tax is primarily a state and local
                  tax, with rates and regulations varying significantly across
                  jurisdictions. There is no federal sales tax.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Sales Tax Works
                </h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Point of Sale Collection
                    </h4>
                    <p className="text-sm">
                      Retailers add sales tax to the purchase price and collect
                      it from customers. The tax amount appears as a separate
                      line item on receipts.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Tax Remittance
                    </h4>
                    <p className="text-sm">
                      Businesses regularly remit collected sales tax to state
                      and local tax authorities, typically monthly or quarterly
                      depending on sales volume.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">Use Tax</h4>
                    <p className="text-sm">
                      When sales tax isn&apos;t collected (e.g., out-of-state
                      purchases), consumers may owe &quot;use tax&quot; directly
                      to their state, though compliance is often low.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  States with No Sales Tax
                </h3>
                <p className="mb-4">
                  Five states don&apos;t impose a statewide sales tax, though
                  some allow local sales taxes:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Alaska:</strong> No state tax, but localities may
                    impose up to 7.85%
                  </li>
                  <li>
                    <strong>Delaware:</strong> No sales tax at any level
                  </li>
                  <li>
                    <strong>Montana:</strong> No general sales tax (some resort
                    areas have local taxes)
                  </li>
                  <li>
                    <strong>New Hampshire:</strong> No general sales tax (9% on
                    prepared meals and rentals)
                  </li>
                  <li>
                    <strong>Oregon:</strong> No sales tax at any level
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Sales Tax Exemptions
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Groceries:</strong> Many states exempt or reduce tax
                    on unprepared food
                  </li>
                  <li>
                    <strong>Prescription Medications:</strong> Generally exempt
                    in most states
                  </li>
                  <li>
                    <strong>Clothing:</strong> Some states exempt clothing under
                    certain price thresholds
                  </li>
                  <li>
                    <strong>Business Purchases:</strong> Items for resale or
                    manufacturing often exempt
                  </li>
                  <li>
                    <strong>Agricultural Supplies:</strong> Farm equipment and
                    supplies often exempt
                  </li>
                  <li>
                    <strong>Educational Materials:</strong> Textbooks and school
                    supplies sometimes exempt
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Online Sales Tax (Post-Wayfair)
                </h3>
                <p className="mb-4">
                  The 2018 Supreme Court decision in South Dakota v. Wayfair
                  dramatically changed online sales tax collection:
                </p>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Economic Nexus
                    </h4>
                    <p className="text-sm">
                      States can require out-of-state sellers to collect sales
                      tax if they exceed certain thresholds (typically $100,000
                      in sales or 200 transactions annually).
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Marketplace Facilitators
                    </h4>
                    <p className="text-sm">
                      Platforms like Amazon, eBay, and Etsy often collect and
                      remit sales tax on behalf of third-party sellers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Sales Tax Holidays
                </h3>
                <p className="mb-4">
                  Many states offer temporary sales tax exemptions during
                  specific periods:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Back-to-School:</strong> Tax-free weekends for
                    school supplies and clothing
                  </li>
                  <li>
                    • <strong>Emergency Preparedness:</strong> Tax exemptions on
                    safety equipment
                  </li>
                  <li>
                    • <strong>Energy Star:</strong> Reduced taxes on
                    energy-efficient appliances
                  </li>
                  <li>
                    • <strong>Second Amendment:</strong> Some states offer tax
                    holidays on firearms and hunting supplies
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Managing Sales Tax
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      For Consumers
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Factor sales tax into your budget when making
                        purchases
                      </li>
                      <li>
                        • Take advantage of sales tax holidays for major
                        purchases
                      </li>
                      <li>
                        • Consider shopping in neighboring states with lower
                        rates for big-ticket items
                      </li>
                      <li>
                        • Keep receipts for business expenses that may be
                        deductible
                      </li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      For Businesses
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        • Use automated sales tax software for multi-state
                        compliance
                      </li>
                      <li>
                        • Register for sales tax permits in all required
                        jurisdictions
                      </li>
                      <li>• Maintain detailed records of all transactions</li>
                      <li>
                        • Stay updated on changing nexus laws and tax rates
                      </li>
                      <li>
                        • File returns on time to avoid penalties and interest
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  International Comparison: Sales Tax vs. VAT
                </h3>
                <p className="mb-4">
                  While the US uses sales tax, most other countries use Value
                  Added Tax (VAT):
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      US Sales Tax
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Single-stage tax at retail</li>
                      <li>• Prices shown exclude tax</li>
                      <li>• Varies by state/locality</li>
                      <li>• Typically 0-10% combined</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">VAT System</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Multi-stage tax at each level</li>
                      <li>• Prices shown include tax</li>
                      <li>• Uniform national rates</li>
                      <li>• Often 15-25% rates</li>
                    </ul>
                  </div>
                </div>
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
