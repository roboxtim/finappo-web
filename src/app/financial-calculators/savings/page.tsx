'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import { PiggyBank, ChevronDown } from 'lucide-react';
import {
  calculateSavings,
  formatCurrency,
  formatCurrencyWithCents,
  type SavingsInputs,
  type SavingsResults,
  type CompoundFrequency,
} from './savingsCalculations';

export default function SavingsCalculator() {
  // Input states
  const [initialDeposit, setInitialDeposit] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [annualContribution, setAnnualContribution] = useState<number>(1200);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [compoundFrequency, setCompoundFrequency] =
    useState<CompoundFrequency>('monthly');
  const [yearsToGrow, setYearsToGrow] = useState<number>(10);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [contributionIncreaseRate, setContributionIncreaseRate] =
    useState<number>(0);

  // Results
  const [results, setResults] = useState<SavingsResults | null>(null);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [scheduleView, setScheduleView] = useState<'monthly' | 'annual'>(
    'annual'
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Calculate savings
  const calculate = useCallback(() => {
    const inputs: SavingsInputs = {
      initialDeposit,
      monthlyContribution,
      annualContribution,
      interestRate,
      compoundFrequency,
      yearsToGrow,
      taxRate,
      contributionIncreaseRate,
    };

    const calculatedResults = calculateSavings(inputs);
    setResults(calculatedResults);
  }, [
    initialDeposit,
    monthlyContribution,
    annualContribution,
    interestRate,
    compoundFrequency,
    yearsToGrow,
    taxRate,
    contributionIncreaseRate,
  ]);

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

  // Calculate percentages for pie chart
  const contributionsPercentage = results
    ? ((results.initialDeposit + results.totalContributions) /
        results.finalBalance) *
      100
    : 50;
  const interestPercentage = 100 - contributionsPercentage;

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <PiggyBank className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Savings Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate your savings growth with compound interest and regular
                contributions
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
              {/* Basic Savings Parameters */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Savings Details
                </h2>

                <div className="space-y-6">
                  {/* Initial Deposit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Initial Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(initialDeposit)}
                        onChange={(e) => {
                          setInitialDeposit(parseInputValue(e.target.value));
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                  </div>

                  {/* Monthly Contribution */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monthly Contribution
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(monthlyContribution)}
                        onChange={(e) => {
                          setMonthlyContribution(
                            parseInputValue(e.target.value)
                          );
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                  </div>

                  {/* Annual Contribution */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Contribution
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(annualContribution)}
                        onChange={(e) => {
                          setAnnualContribution(
                            parseInputValue(e.target.value)
                          );
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Added in December each year
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate (Annual)
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
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Compound Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Compound Frequency
                    </label>
                    <select
                      value={compoundFrequency}
                      onChange={(e) =>
                        setCompoundFrequency(
                          e.target.value as CompoundFrequency
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="semimonthly">Semi-monthly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semiannually">Semi-annually</option>
                      <option value="annually">Annually</option>
                      <option value="continuous">Continuously</option>
                    </select>
                  </div>

                  {/* Years to Grow */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Years to Grow
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={yearsToGrow || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setYearsToGrow(value ? Number(value) : 0);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Advanced Options
                  </h2>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      showAdvanced ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <div className="mt-6 space-y-6">
                    {/* Tax Rate */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tax Rate on Interest
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={taxRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            const num = value ? Number(value) : 0;
                            if (num >= 0 && num <= 100) {
                              setTaxRate(num);
                            }
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Applied to interest earned
                      </div>
                    </div>

                    {/* Contribution Increase Rate */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Annual Contribution Increase
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={contributionIncreaseRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            const num = value ? Number(value) : 0;
                            if (num >= 0 && num <= 100) {
                              setContributionIncreaseRate(num);
                            }
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Contributions increase each year
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {results && (
                <>
                  {/* Final Balance Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Final Balance After {yearsToGrow} Years
                    </div>
                    <div className="text-5xl font-bold mb-6">
                      {formatCurrency(results.finalBalance)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Total Deposits</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            results.initialDeposit + results.totalContributions
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          Interest Earned
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalInterest)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Savings Breakdown
                    </h3>

                    {/* Bar Chart */}
                    <div className="mb-6">
                      <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                        <div
                          className="bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold"
                          style={{ width: `${contributionsPercentage}%` }}
                        >
                          {contributionsPercentage > 15 &&
                            `Deposits ${contributionsPercentage.toFixed(1)}%`}
                        </div>
                        <div
                          className="bg-teal-500 flex items-center justify-center text-white text-sm font-semibold"
                          style={{ width: `${interestPercentage}%` }}
                        >
                          {interestPercentage > 15 &&
                            `Interest ${interestPercentage.toFixed(1)}%`}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-500"></div>
                            <span className="text-sm text-gray-600">
                              Total Deposits
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              results.initialDeposit +
                                results.totalContributions
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-teal-500"></div>
                            <span className="text-sm text-gray-600">
                              Interest Earned
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.totalInterest)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Initial Deposit</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.initialDeposit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Total Contributions
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.totalContributions)}
                        </span>
                      </div>
                      {results.totalTaxPaid > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax Paid</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(results.totalTaxPaid)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 border-t border-gray-100">
                        <span className="text-gray-900 font-bold">
                          Final Balance
                        </span>
                        <span className="font-bold text-emerald-600 text-lg">
                          {formatCurrency(results.finalBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Growth Over Time Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Savings Growth Over Time
                    </h3>

                    {/* Simple line visualization */}
                    <div className="space-y-2 mb-6">
                      {results.annualSchedule.map((year) => {
                        const percentage =
                          (year.endingBalance / results.finalBalance) * 100;
                        return (
                          <div key={year.year}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">
                                Year {year.year}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(year.endingBalance)}
                              </span>
                            </div>
                            <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule Accordion */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Savings Schedule
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isScheduleOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isScheduleOpen && (
                      <div className="px-8 pb-8">
                        {/* View Toggle */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setScheduleView('annual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              scheduleView === 'annual'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Annual
                          </button>
                          <button
                            onClick={() => setScheduleView('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              scheduleView === 'monthly'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Monthly
                          </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {scheduleView === 'annual' ? (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Year
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Deposits
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Interest
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {results.annualSchedule.map((row) => (
                                  <tr
                                    key={row.year}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.year}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900">
                                      {formatCurrencyWithCents(row.deposits)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-emerald-600">
                                      {formatCurrencyWithCents(row.interest)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                      {formatCurrencyWithCents(
                                        row.endingBalance
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Month
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Deposit
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Interest
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {results.schedule.map((row) => (
                                  <tr
                                    key={row.month}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.month}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900">
                                      {formatCurrencyWithCents(row.deposit)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-emerald-600">
                                      {formatCurrencyWithCents(row.interest)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                      {formatCurrencyWithCents(
                                        row.endingBalance
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
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

      {/* Explanation Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Savings and Compound Interest
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Compound Interest?
                </h3>
                <p className="mb-4">
                  Compound interest is the interest calculated on the initial
                  principal and also on the accumulated interest from previous
                  periods. It&apos;s often called &quot;interest on
                  interest&quot; and is one of the most powerful wealth-building
                  tools available.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl font-mono text-sm">
                  A = P(1 + r/n)^(nt)
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <strong>A</strong> = Final amount
                  </li>
                  <li>
                    <strong>P</strong> = Principal (initial deposit)
                  </li>
                  <li>
                    <strong>r</strong> = Annual interest rate (decimal)
                  </li>
                  <li>
                    <strong>n</strong> = Number of times interest compounds per
                    year
                  </li>
                  <li>
                    <strong>t</strong> = Number of years
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Power of Regular Contributions
                </h3>
                <p className="mb-4">
                  Making regular contributions to your savings can dramatically
                  increase your final balance. Even small, consistent deposits
                  can grow into substantial savings over time thanks to compound
                  interest.
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>Dollar-Cost Averaging:</strong> Regular
                    contributions help smooth out market volatility
                  </li>
                  <li>
                    <strong>Habit Building:</strong> Automatic monthly
                    contributions make saving effortless
                  </li>
                  <li>
                    <strong>Compound Effect:</strong> Each contribution starts
                    earning interest immediately
                  </li>
                  <li>
                    <strong>Goal Achievement:</strong> Consistent saving is the
                    most reliable path to financial goals
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Compounding Frequency Matters
                </h3>
                <p className="mb-4">
                  The frequency at which interest is compounded affects your
                  total return. More frequent compounding means faster growth:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Daily:</strong> Interest compounds 365 times per
                    year
                  </li>
                  <li>
                    <strong>Monthly:</strong> Interest compounds 12 times per
                    year
                  </li>
                  <li>
                    <strong>Quarterly:</strong> Interest compounds 4 times per
                    year
                  </li>
                  <li>
                    <strong>Annually:</strong> Interest compounds once per year
                  </li>
                  <li>
                    <strong>Continuous:</strong> Mathematical maximum
                    compounding frequency
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Best Practices for Building Savings
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Start Early:</strong> Time is your greatest asset
                    when it comes to compound interest
                  </li>
                  <li>
                    <strong>Be Consistent:</strong> Regular contributions, even
                    small ones, add up over time
                  </li>
                  <li>
                    <strong>Maximize Interest:</strong> Shop around for the best
                    savings rates and compounding frequencies
                  </li>
                  <li>
                    <strong>Automate Savings:</strong> Set up automatic
                    transfers to make saving effortless
                  </li>
                  <li>
                    <strong>Increase Over Time:</strong> Try to increase your
                    contributions as your income grows
                  </li>
                  <li>
                    <strong>Consider Tax Implications:</strong> Use
                    tax-advantaged accounts when possible
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Types of Savings Accounts
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>High-Yield Savings:</strong> Online banks often
                    offer higher interest rates than traditional banks
                  </li>
                  <li>
                    <strong>Money Market Accounts:</strong> Typically offer
                    higher rates but may require higher minimum balances
                  </li>
                  <li>
                    <strong>Certificates of Deposit (CDs):</strong> Fixed-term
                    accounts with guaranteed rates, usually higher than savings
                  </li>
                  <li>
                    <strong>Treasury Securities:</strong> Government-backed
                    securities with competitive rates
                  </li>
                  <li>
                    <strong>Retirement Accounts:</strong> Tax-advantaged
                    accounts like IRAs and 401(k)s for long-term savings
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the
                    information you enter
                  </li>
                  <li>
                    • Actual interest rates and compounding frequencies vary by
                    financial institution
                  </li>
                  <li>
                    • Tax rates on interest depend on your personal tax
                    situation
                  </li>
                  <li>
                    • Consider inflation when planning long-term savings goals
                  </li>
                  <li>
                    • FDIC insurance covers up to $250,000 per depositor per
                    bank
                  </li>
                  <li>
                    • Review and adjust your savings plan regularly to meet your
                    goals
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
              <p>© 2025 All rights reserved.</p>
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
