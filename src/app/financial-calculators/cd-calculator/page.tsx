'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank,
  ChevronDown,
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
} from 'lucide-react';
import {
  calculateCD,
  formatCurrency,
  formatPercent,
  type CDInputs,
  type CDResults,
  type CompoundingFrequency,
} from './utils/calculations';

export default function CDCalculator() {
  // Input states
  const [initialDeposit, setInitialDeposit] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(0);
  const [compoundingFrequency, setCompoundingFrequency] =
    useState<CompoundingFrequency>('monthly');

  // Results state
  const [results, setResults] = useState<CDResults | null>(null);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    period: number;
    balance: number;
    interest: number;
    x: number;
  } | null>(null);

  // Calculate CD
  const calculate = useCallback(() => {
    const inputs: CDInputs = {
      initialDeposit,
      interestRate,
      years,
      months,
      compoundingFrequency,
    };

    const calculatedResults = calculateCD(inputs);
    setResults(calculatedResults);
  }, [initialDeposit, interestRate, years, months, compoundingFrequency]);

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

  const parseDecimalInput = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const formatted =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    return formatted ? Number(formatted) : 0;
  };

  // Calculate percentages for pie chart
  const principalPercentage =
    results && results.endingBalance > 0
      ? (results.totalDeposit / results.endingBalance) * 100
      : 50;
  const interestPercentage = 100 - principalPercentage;

  return (
    <CalculatorLayout
      title="CD Calculator"
      description="Calculate your Certificate of Deposit returns with precision. Compare compounding frequencies and see how your money grows over time with guaranteed returns."
      icon={<PiggyBank className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
    >
      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 self-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
                CD Details
              </h2>

              <div className="space-y-5">
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
                      onChange={(e) =>
                        setInitialDeposit(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Amount you&apos;ll deposit into the CD
                  </p>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Percent className="w-4 h-4 mr-1 text-blue-600" />
                    Annual Interest Rate (APR)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={interestRate || ''}
                      onChange={(e) =>
                        setInterestRate(parseDecimalInput(e.target.value))
                      }
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Annual percentage rate offered by the bank
                  </p>
                </div>

                {/* CD Term */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                    CD Term
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={years}
                        onChange={(e) =>
                          setYears(Math.max(0, Number(e.target.value)))
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="block mt-1 text-xs text-gray-500 text-center">
                        Years
                      </span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={months}
                        onChange={(e) =>
                          setMonths(
                            Math.max(0, Math.min(11, Number(e.target.value)))
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="block mt-1 text-xs text-gray-500 text-center">
                        Months
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Total term: {years} year{years !== 1 ? 's' : ''}{' '}
                    {months > 0 && `${months} month${months !== 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Compounding Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
                    Compounding Frequency
                  </label>
                  <select
                    value={compoundingFrequency}
                    onChange={(e) =>
                      setCompoundingFrequency(
                        e.target.value as CompoundingFrequency
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semiannually">Semi-annually</option>
                    <option value="annually">Annually</option>
                    <option value="continuously">Continuously</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    How often interest is calculated and added
                  </p>
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
              {/* Final Balance Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Total Value at Maturity
                </div>
                <div className="text-5xl font-bold mb-6">
                  {results ? formatCurrency(results.endingBalance) : '$0.00'}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Initial Deposit</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(initialDeposit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Total Interest</div>
                    <div className="text-xl font-semibold mt-1">
                      {results
                        ? formatCurrency(results.totalInterest)
                        : '$0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* APY Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Annual Percentage Yield (APY)
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {results
                        ? formatPercent(results.effectiveAnnualRate)
                        : '0.00%'}
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Percent className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  The effective annual rate accounting for compounding
                </p>
              </div>

              {/* Breakdown Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Growth Breakdown
                </h3>

                {/* Pie Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${principalPercentage}%` }}
                    >
                      {principalPercentage > 15 &&
                        `${principalPercentage.toFixed(1)}%`}
                    </div>
                    <div
                      className="bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${interestPercentage}%` }}
                    >
                      {interestPercentage > 15 &&
                        `${interestPercentage.toFixed(1)}%`}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Principal</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(initialDeposit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-500"></div>
                        <span className="text-sm text-gray-600">
                          Interest Earned
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {results
                          ? formatCurrency(results.totalInterest)
                          : '$0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">
                      Final Balance
                    </span>
                    <span className="font-bold text-blue-600">
                      {results
                        ? formatCurrency(results.endingBalance)
                        : '$0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Balance Growth Over Time
                </h3>

                {/* SVG Chart */}
                <div className="relative h-64 mb-6 ml-16">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-16 w-14 text-right">
                    <span>
                      {results ? formatCurrency(results.endingBalance) : '$0'}
                    </span>
                    <span>
                      {results
                        ? formatCurrency(results.endingBalance * 0.75)
                        : '$0'}
                    </span>
                    <span>
                      {results
                        ? formatCurrency(results.endingBalance * 0.5)
                        : '$0'}
                    </span>
                    <span>
                      {results
                        ? formatCurrency(results.endingBalance * 0.25)
                        : '$0'}
                    </span>
                    <span>$0</span>
                  </div>

                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="0 0 800 256"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      if (!results || results.schedule.length === 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 800;
                      const index = Math.round(
                        (x / 800) * (results.schedule.length - 1)
                      );
                      const validIndex = Math.max(
                        0,
                        Math.min(index, results.schedule.length - 1)
                      );

                      const row = results.schedule[validIndex];
                      const pointX =
                        (validIndex / (results.schedule.length - 1)) * 800;

                      setHoveredPoint({
                        period: row.period,
                        balance: row.balance,
                        interest: row.interestEarned,
                        x: pointX,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Grid lines */}
                    <g className="opacity-10">
                      {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={256 * y}
                          x2="800"
                          y2={256 * y}
                          stroke="#6B7280"
                          strokeWidth="1"
                        />
                      ))}
                    </g>

                    {/* Gradients */}
                    <defs>
                      <linearGradient
                        id="balanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3B82F6"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                    </defs>

                    {results && results.schedule.length > 0 && (
                      <>
                        {/* Area fill */}
                        <path
                          d={(() => {
                            const points = results.schedule
                              .map((row, i) => {
                                const x =
                                  (i / (results.schedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  (row.balance / results.endingBalance) * 256;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#balanceGradient)"
                        />

                        {/* Line */}
                        <polyline
                          points={results.schedule
                            .map((row, i) => {
                              const x =
                                (i / (results.schedule.length - 1)) * 800;
                              const y =
                                256 -
                                (row.balance / results.endingBalance) * 256;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />
                      </>
                    )}

                    {/* Hover indicator */}
                    {hoveredPoint && (
                      <line
                        x1={hoveredPoint.x}
                        y1="0"
                        x2={hoveredPoint.x}
                        y2="256"
                        stroke="#6B7280"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />
                    )}
                  </svg>

                  {/* Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-10 shadow-xl"
                      style={{
                        left: `${(hoveredPoint.x / 800) * 100}%`,
                        top: '50%',
                        transform:
                          hoveredPoint.x > 400
                            ? 'translate(-100%, -50%)'
                            : 'translate(10px, -50%)',
                      }}
                    >
                      <div className="font-bold mb-2 text-base">
                        Month {hoveredPoint.period}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-300">Balance:</span>
                          <span className="font-semibold">
                            {formatCurrency(hoveredPoint.balance)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-300">Interest:</span>
                          <span className="font-semibold text-emerald-400">
                            +{formatCurrency(hoveredPoint.interest)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Month 0</span>
                  <span>
                    Month{' '}
                    {results ? Math.floor(results.schedule.length / 2) : 0}
                  </span>
                  <span>Month {results ? results.schedule.length : 0}</span>
                </div>
              </div>

              {/* Accumulation Schedule */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    Accumulation Schedule
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      isScheduleOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isScheduleOpen && results && (
                  <div className="px-8 pb-8 max-h-96 overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-4">
                      Monthly breakdown showing balance growth and interest
                      accumulation
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Month
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Interest Earned
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {results.schedule.map((row) => (
                            <tr
                              key={row.period}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {row.period}
                              </td>
                              <td className="px-4 py-3 text-right text-emerald-600">
                                {formatCurrency(row.interestEarned)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                {formatCurrency(row.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
              Understanding Certificates of Deposit
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a Certificate of Deposit?
                </h3>
                <p className="mb-4">
                  A Certificate of Deposit (CD) is a savings account that holds
                  a fixed amount of money for a fixed period of time. In
                  exchange for locking in your money, banks typically offer
                  higher interest rates than regular savings accounts.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Fixed Term:</strong> Typically ranges from 3 months
                    to 5 years
                  </li>
                  <li>
                    <strong>Fixed Rate:</strong> Interest rate is locked in for
                    the entire term
                  </li>
                  <li>
                    <strong>FDIC Insured:</strong> Protected up to $250,000 per
                    depositor
                  </li>
                  <li>
                    <strong>Guaranteed Returns:</strong> No market risk, unlike
                    stocks or bonds
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Compound Interest Works
                </h3>
                <p className="mb-4">
                  Compound interest means you earn interest on your initial
                  deposit plus all previously accumulated interest. The formula
                  used is:
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
                    <strong>r</strong> = Annual interest rate (as decimal)
                  </li>
                  <li>
                    <strong>n</strong> = Compounding frequency per year
                  </li>
                  <li>
                    <strong>t</strong> = Time in years
                  </li>
                </ul>
                <p className="mt-4">
                  For continuous compounding, the formula is: A = Pe^(rt)
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Compounding Frequency Explained
                </h3>
                <p className="mb-4">
                  The more frequently interest compounds, the more you earn.
                  Here&apos;s how different frequencies compare:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>Daily (365 times/year):</strong> Highest returns,
                    offered by most online banks
                  </li>
                  <li>
                    <strong>Monthly (12 times/year):</strong> Very common,
                    nearly as good as daily
                  </li>
                  <li>
                    <strong>Quarterly (4 times/year):</strong> Traditional bank
                    standard
                  </li>
                  <li>
                    <strong>Semi-annually (2 times/year):</strong> Less common,
                    lower returns
                  </li>
                  <li>
                    <strong>Annually (1 time/year):</strong> Simple interest,
                    lowest returns
                  </li>
                  <li>
                    <strong>Continuously:</strong> Theoretical maximum,
                    mathematical limit
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  APR vs APY
                </h3>
                <p className="mb-4">
                  Understanding the difference between APR and APY is crucial:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>APR (Annual Percentage Rate):</strong> The stated
                    interest rate without compounding effects
                  </li>
                  <li>
                    <strong>APY (Annual Percentage Yield):</strong> The
                    effective annual rate including compound interest. Always
                    higher than APR (except with annual compounding where
                    they&apos;re equal)
                  </li>
                  <li>
                    <strong>Example:</strong> A 5% APR compounded monthly yields
                    5.116% APY
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Maximizing CD Returns
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Shop around:</strong> Online banks often offer
                    better rates than traditional banks
                  </li>
                  <li>
                    <strong>Consider CD laddering:</strong> Split your money
                    across multiple CDs with different maturity dates for
                    liquidity and rate optimization
                  </li>
                  <li>
                    <strong>Check compounding frequency:</strong> Daily
                    compounding yields more than monthly or annual
                  </li>
                  <li>
                    <strong>Watch for penalties:</strong> Early withdrawal can
                    result in significant penalty fees
                  </li>
                  <li>
                    <strong>Time your purchase:</strong> CD rates often rise
                    when the Federal Reserve raises rates
                  </li>
                  <li>
                    <strong>Consider term length:</strong> Longer terms usually
                    offer higher rates but less flexibility
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2">
                  <li>
                    • CDs are best for money you won&apos;t need during the term
                  </li>
                  <li>• Interest is typically taxable as ordinary income</li>
                  <li>• Inflation can erode real returns on low-rate CDs</li>
                  <li>• Some CDs have minimum deposit requirements</li>
                  <li>• Callable CDs can be redeemed early by the bank</li>
                  <li>
                    • This calculator provides estimates; actual rates may vary
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
