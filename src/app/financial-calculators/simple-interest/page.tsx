'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import {
  calculateSimpleInterest,
  formatCurrency,
  formatCurrencyWithCents,
  type SimpleInterestInputs,
  type SimpleInterestResults,
} from './simpleInterestCalculations';

export default function SimpleInterestCalculator() {
  // Input states
  const [principal, setPrincipal] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(5);
  const [months, setMonths] = useState<number>(0);

  // Results
  const [results, setResults] = useState<SimpleInterestResults | null>(null);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  // Calculate simple interest
  const calculate = useCallback(() => {
    const inputs: SimpleInterestInputs = {
      principal,
      interestRate,
      years,
      months,
    };

    const calculatedResults = calculateSimpleInterest(inputs);
    setResults(calculatedResults);
  }, [principal, interestRate, years, months]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatInputValue = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Simple Interest Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate interest earned on a fixed principal amount over time
              </p>
            </div>
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
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 self-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Investment Details
              </h2>

              <div className="space-y-6">
                {/* Principal Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Principal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(principal)}
                      onChange={(e) => {
                        setPrincipal(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    The initial amount invested or borrowed
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={interestRate || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setInterestRate(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Annual percentage rate (APR)
                  </div>
                </div>

                {/* Time Period - Years */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Period (Years)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={years || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setYears(value ? Number(value) : 0);
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  />
                </div>

                {/* Time Period - Months */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Months
                  </label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {i} {i === 1 ? 'month' : 'months'}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-xs text-gray-500">
                    Total time: {results?.totalTimeInYears.toFixed(2) || '0.00'}{' '}
                    years
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
              {/* Total Interest Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Total Interest Earned
                </div>
                <div className="text-5xl font-bold mb-6">
                  {results ? formatCurrency(results.totalInterest) : '$0'}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Principal</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(principal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">End Balance</div>
                    <div className="text-xl font-semibold mt-1">
                      {results ? formatCurrency(results.endBalance) : '$0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Balance Breakdown
                </h3>

                {/* Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                      style={{
                        width: `${results?.principalPercentage || 50}%`,
                      }}
                    >
                      {results && results.principalPercentage > 15
                        ? `Principal ${results.principalPercentage.toFixed(1)}%`
                        : ''}
                    </div>
                    <div
                      className="bg-amber-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                      style={{
                        width: `${results?.interestPercentage || 50}%`,
                      }}
                    >
                      {results && results.interestPercentage > 15
                        ? `Interest ${results.interestPercentage.toFixed(1)}%`
                        : ''}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Principal</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(principal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-amber-500"></div>
                        <span className="text-sm text-gray-600">
                          Total Interest
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {results ? formatCurrency(results.totalInterest) : '$0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Final Balance</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {results ? formatCurrency(results.endBalance) : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Period</span>
                    <span className="font-semibold text-gray-900">
                      {years > 0 &&
                        `${years} ${years === 1 ? 'year' : 'years'}`}
                      {years > 0 && months > 0 && ', '}
                      {months > 0 &&
                        `${months} ${months === 1 ? 'month' : 'months'}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-gray-900">
                      {interestRate}% per year
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Explanation */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  How It&apos;s Calculated
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4">
                    <div className="font-mono text-sm text-center mb-2">
                      <span className="text-blue-600 font-bold">I</span> ={' '}
                      <span className="text-gray-700 font-bold">P</span> ×{' '}
                      <span className="text-gray-700 font-bold">r</span> ×{' '}
                      <span className="text-gray-700 font-bold">t</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="text-blue-600 font-semibold">I</span> ={' '}
                        Interest earned
                      </div>
                      <div>
                        <span className="font-semibold">P</span> = Principal (
                        {formatCurrency(principal)})
                      </div>
                      <div>
                        <span className="font-semibold">r</span> = Interest rate
                        ({interestRate}% = {(interestRate / 100).toFixed(4)})
                      </div>
                      <div>
                        <span className="font-semibold">t</span> = Time (
                        {results?.totalTimeInYears.toFixed(2)} years)
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4">
                    <div className="text-sm text-gray-700 text-center">
                      <div className="font-semibold mb-1">
                        Your Calculation:
                      </div>
                      <div className="font-mono">
                        {formatCurrency(principal)} ×{' '}
                        {(interestRate / 100).toFixed(4)} ×{' '}
                        {results?.totalTimeInYears.toFixed(2)} ={' '}
                        <span className="text-blue-600 font-bold">
                          {results
                            ? formatCurrency(results.totalInterest)
                            : '$0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yearly Schedule Accordion */}
              {results && results.schedule.length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                    className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-gray-900">
                      Yearly Schedule
                    </h3>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        isScheduleOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isScheduleOpen && (
                    <div className="px-8 pb-8 max-h-96 overflow-y-auto">
                      <div className="text-sm text-gray-600 mb-4">
                        Year-by-year breakdown of interest accumulation
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                Year
                              </th>
                              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                Interest Earned
                              </th>
                              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                Cumulative Interest
                              </th>
                              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                End Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {results.schedule.map((row) => (
                              <tr
                                key={row.year}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-900 font-medium">
                                  {row.year}
                                </td>
                                <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                  {formatCurrencyWithCents(row.interestEarned)}
                                </td>
                                <td className="px-4 py-3 text-right text-amber-600 font-medium">
                                  {formatCurrencyWithCents(
                                    row.cumulativeInterest
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                                  {formatCurrencyWithCents(row.endBalance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Simple Interest
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Simple Interest?
                </h3>
                <p className="mb-4">
                  Simple interest is a method of calculating interest on a loan
                  or investment where the interest is calculated only on the
                  original principal amount. Unlike compound interest, simple
                  interest does not earn interest on previously earned interest.
                </p>
                <p>
                  The formula is straightforward: Interest = Principal × Rate ×
                  Time. This makes simple interest calculations easy to
                  understand and predict.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Simple Interest vs Compound Interest
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Simple Interest
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Compound Interest
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          Calculation Basis
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          Original principal only
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          Principal + accumulated interest
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          Interest Growth
                        </td>
                        <td className="px-4 py-3 text-gray-600">Linear</td>
                        <td className="px-4 py-3 text-gray-600">Exponential</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          Returns
                        </td>
                        <td className="px-4 py-3 text-gray-600">Lower</td>
                        <td className="px-4 py-3 text-gray-600">Higher</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          Common Uses
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          Short-term loans, car loans
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          Savings accounts, investments
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When is Simple Interest Used?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    <div>
                      <strong>Auto Loans:</strong> Many car loans use simple
                      interest, making it easy to calculate your total interest
                      cost upfront.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    <div>
                      <strong>Short-term Personal Loans:</strong> Simple
                      interest is common for loans with terms under 5 years.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    <div>
                      <strong>Commercial Loans:</strong> Some business loans use
                      simple interest for predictable payments.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">•</span>
                    <div>
                      <strong>Bonds and Treasury Bills:</strong> Certain
                      fixed-income securities calculate returns using simple
                      interest.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Example Calculation
                </h3>
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-gray-900 mb-2">Scenario:</p>
                  <p className="text-gray-700">
                    You invest $10,000 at 5% annual interest for 3 years.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Principal (P):</span>
                    <span className="font-semibold">$10,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate (r):</span>
                    <span className="font-semibold">5% = 0.05</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time (t):</span>
                    <span className="font-semibold">3 years</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Interest (I = P × r × t):</span>
                      <span className="text-blue-600">
                        $10,000 × 0.05 × 3 = $1,500
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base mt-2">
                      <span>Final Balance:</span>
                      <span className="text-gray-900">
                        $10,000 + $1,500 = $11,500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Advantages
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span>Easy to calculate and understand</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span>Predictable interest payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span>
                      Lower total interest cost than compound interest
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span>Ideal for short-term loans and investments</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • Simple interest typically results in lower returns for
                    investors compared to compound interest over long periods
                  </li>
                  <li>
                    • For borrowers, simple interest loans may be advantageous
                    as they cost less over time
                  </li>
                  <li>
                    • The calculation assumes no additional deposits or
                    withdrawals during the term
                  </li>
                  <li>
                    • Always verify whether a financial product uses simple or
                    compound interest
                  </li>
                  <li>
                    • This calculator provides estimates for planning purposes
                    only
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
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              This simple interest calculator is provided for informational
              purposes only.
            </p>
            <p>
              Results are estimates and should not be considered financial
              advice. Consult with a financial advisor for personalized
              guidance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
