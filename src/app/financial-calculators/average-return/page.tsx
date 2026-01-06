'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Plus,
  X,
  Calculator,
  Info,
  BarChart3,
  LineChart,
} from 'lucide-react';
import {
  calculateAverageReturn,
  type ReturnPeriod,
  type AverageReturnResults,
} from './utils/calculations';

export default function AverageReturnCalculator() {
  // Input states
  const [periods, setPeriods] = useState<ReturnPeriod[]>([
    { returnPercent: 10, years: 1, months: 0 },
    { returnPercent: 5, years: 1, months: 0 },
    { returnPercent: 8, years: 1, months: 0 },
  ]);

  // Results state
  const [results, setResults] = useState<AverageReturnResults | null>(null);

  // UI state
  // const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Calculate results
  const calculate = useCallback(() => {
    // Filter out periods with 0 time
    const validPeriods = periods.filter(
      (p) => p.years > 0 || p.months > 0 || p.returnPercent !== 0
    );
    const calculatedResults = calculateAverageReturn(validPeriods);
    setResults(calculatedResults);
  }, [periods]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Add a new return period
  const addPeriod = () => {
    setPeriods([...periods, { returnPercent: 0, years: 1, months: 0 }]);
  };

  // Remove a return period
  const removePeriod = (index: number) => {
    if (periods.length > 1) {
      setPeriods(periods.filter((_, i) => i !== index));
    }
  };

  // Update a period's return percentage
  const updateReturn = (index: number, value: string) => {
    const newPeriods = [...periods];
    const parsed = value.replace(/[^0-9.-]/g, '');
    const parts = parsed.split('.');
    const formatted =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : parsed;
    newPeriods[index].returnPercent = formatted ? Number(formatted) : 0;
    setPeriods(newPeriods);
  };

  // Update a period's years
  const updateYears = (index: number, value: number) => {
    const newPeriods = [...periods];
    newPeriods[index].years = Math.max(0, value);
    setPeriods(newPeriods);
  };

  // Update a period's months
  const updateMonths = (index: number, value: number) => {
    const newPeriods = [...periods];
    newPeriods[index].months = Math.max(0, Math.min(11, value));
    setPeriods(newPeriods);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatYears = (years: number) => {
    if (years === 1) return '1 year';
    return `${years.toFixed(2)} years`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-10 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
              Average Return{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Calculator
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Calculate arithmetic mean, geometric mean, and annualized returns
              for your investments. Understand the true performance of your
              portfolio across multiple periods.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                Investment Returns
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {periods.map((period, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Period {index + 1}
                      </span>
                      {periods.length > 1 && (
                        <button
                          onClick={() => removePeriod(index)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Return Percentage */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Return
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={period.returnPercent || ''}
                            onChange={(e) =>
                              updateReturn(index, e.target.value)
                            }
                            className="w-full pl-4 pr-8 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                            %
                          </span>
                        </div>
                      </div>

                      {/* Holding Period */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Holding Period
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              value={period.years}
                              onChange={(e) =>
                                updateYears(index, Number(e.target.value) || 0)
                              }
                              min="0"
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                            />
                            <span className="text-xs text-gray-500 mt-1 block text-center">
                              Years
                            </span>
                          </div>
                          <div>
                            <input
                              type="number"
                              value={period.months}
                              onChange={(e) =>
                                updateMonths(index, Number(e.target.value) || 0)
                              }
                              min="0"
                              max="11"
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                            />
                            <span className="text-xs text-gray-500 mt-1 block text-center">
                              Months
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Period Button */}
                <button
                  onClick={addPeriod}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Period
                </button>
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Total Periods
                </div>
                <div className="text-5xl font-bold mb-2">
                  {results?.totalPeriods || 0}
                </div>
                <div className="text-sm opacity-75">
                  Spanning {formatYears(results?.totalYears || 0)}
                </div>
              </div>

              {/* Return Metrics */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Return Metrics
                </h3>

                <div className="space-y-5">
                  {/* Arithmetic Mean */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          Arithmetic Mean
                        </div>
                        <div className="text-xs text-gray-600">
                          Simple average of returns
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPercent(results?.arithmeticMean || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Geometric Mean */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          Geometric Mean (CAGR)
                        </div>
                        <div className="text-xs text-gray-600">
                          Compound average return
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {formatPercent(results?.geometricMean || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Annualized Return */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          Annualized Return
                        </div>
                        <div className="text-xs text-gray-600">
                          Time-weighted annual return
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercent(results?.annualizedReturn || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Cumulative Return */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          Cumulative Return
                        </div>
                        <div className="text-xs text-gray-600">
                          Total return over all periods
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatPercent(results?.cumulativeReturn || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  Return Comparison
                </h3>

                {/* Visual Bar Chart */}
                <div className="space-y-4">
                  {results && (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Arithmetic Mean
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPercent(results.arithmeticMean)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                Math.abs(results.arithmeticMean) * 2,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Geometric Mean
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPercent(results.geometricMean)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                Math.abs(results.geometricMean) * 2,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Annualized Return
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPercent(results.annualizedReturn)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                Math.abs(results.annualizedReturn) * 2,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">
                      Why are the values different?
                    </p>
                    <p className="text-blue-800 leading-relaxed">
                      Arithmetic mean is a simple average, while geometric mean
                      accounts for compounding. Annualized return adjusts for
                      the actual time invested. For volatile returns, geometric
                      mean is typically lower and more accurate.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Average Returns
            </h2>

            <div className="space-y-6">
              {/* Arithmetic Mean */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Arithmetic Mean
                </h3>
                <p className="text-gray-600 mb-3">
                  The arithmetic mean is the simple average of all returns. It
                  adds up all the returns and divides by the number of periods.
                </p>
                <div className="bg-blue-50 rounded-xl p-4 font-mono text-sm text-gray-900">
                  Arithmetic Mean = (R1 + R2 + ... + Rn) / n
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  This measure is easy to understand but doesn&apos;t account
                  for compounding effects, which can overestimate actual
                  returns.
                </p>
              </div>

              {/* Geometric Mean */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Geometric Mean (CAGR)
                </h3>
                <p className="text-gray-600 mb-3">
                  The geometric mean calculates the compound average growth
                  rate. It&apos;s more accurate for investment returns because
                  it accounts for the compounding effect.
                </p>
                <div className="bg-indigo-50 rounded-xl p-4 font-mono text-sm text-gray-900">
                  Geometric Mean = [(1+R1) × (1+R2) × ... × (1+Rn)]^(1/n) - 1
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  This is the same as Compound Annual Growth Rate (CAGR) when
                  all periods are equal. It always equals or is less than the
                  arithmetic mean.
                </p>
              </div>

              {/* Annualized Return */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Annualized Return
                </h3>
                <p className="text-gray-600 mb-3">
                  The annualized return converts your total return into an
                  equivalent annual rate, accounting for the actual time
                  invested (years and months).
                </p>
                <div className="bg-purple-50 rounded-xl p-4 font-mono text-sm text-gray-900">
                  Annualized Return = [(1 + Total Return)]^(1 / Years) - 1
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  This metric is especially useful when comparing investments
                  held for different time periods.
                </p>
              </div>

              {/* When to Use Each */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Which Measure Should You Use?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>
                      <strong>Arithmetic Mean:</strong> Best for predicting
                      future single-period returns or when returns are
                      independent
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-600 font-bold">•</span>
                    <div>
                      <strong>Geometric Mean:</strong> Best for measuring past
                      performance and actual growth over multiple periods
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">•</span>
                    <div>
                      <strong>Annualized Return:</strong> Best for comparing
                      investments with different time horizons
                    </div>
                  </li>
                </ul>
              </div>

              {/* Example */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Real-World Example
                </h3>
                <p className="text-gray-600 mb-4">
                  Consider an investment with these annual returns:
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-600">Year 1</div>
                    <div className="text-lg font-bold text-green-600">+20%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-600">Year 2</div>
                    <div className="text-lg font-bold text-red-600">-10%</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-600">Year 3</div>
                    <div className="text-lg font-bold text-green-600">+15%</div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Arithmetic Mean:</strong> (20 - 10 + 15) / 3 = 8.33%
                  </li>
                  <li>
                    <strong>Geometric Mean:</strong> (1.20 × 0.90 × 1.15)^(1/3)
                    - 1 = 7.29%
                  </li>
                  <li>
                    <strong>Actual Result:</strong> $10,000 grows to $12,420
                    (24.2% total)
                  </li>
                </ul>
                <p className="text-gray-600 mt-4 text-sm">
                  Notice how the geometric mean (7.29%) more accurately reflects
                  the actual compound growth compared to the arithmetic mean
                  (8.33%).
                </p>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Past performance does not guarantee future results</li>
                  <li>
                    • Returns don&apos;t include fees, taxes, or transaction
                    costs
                  </li>
                  <li>
                    • Negative returns have a larger impact than positive
                    returns of the same magnitude
                  </li>
                  <li>
                    • More volatile returns lead to larger differences between
                    arithmetic and geometric means
                  </li>
                  <li>
                    • Always consider risk-adjusted returns, not just average
                    returns
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 text-sm">
            <p>
              This calculator is for educational purposes only. Consult with a
              financial advisor for investment decisions.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Finappo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
