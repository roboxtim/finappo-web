'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ChevronDown,
  Info,
  PiggyBank,
  Calculator,
} from 'lucide-react';
import {
  calculateCompoundInterest,
  type CompoundInterestInputs,
  type CompoundInterestResults,
  type CompoundingFrequency,
  type ContributionTiming,
} from './utils/calculations';

export default function CompoundInterestCalculator() {
  // Input states
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [years, setYears] = useState<number>(10);
  const [months, setMonths] = useState<number>(0);
  const [compoundingFrequency, setCompoundingFrequency] =
    useState<CompoundingFrequency>('monthly');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualContribution, setAnnualContribution] = useState<number>(0);
  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>('end');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [inflationRate, setInflationRate] = useState<number>(0);

  // Results state
  const [results, setResults] = useState<CompoundInterestResults | null>(null);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isMonthlyView, setIsMonthlyView] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    period: number;
    balance: number;
    contributions: number;
    interest: number;
    x: number;
  } | null>(null);

  // Calculate results
  const calculate = useCallback(() => {
    const inputs: CompoundInterestInputs = {
      initialInvestment,
      interestRate,
      years,
      months,
      compoundingFrequency,
      monthlyContribution,
      annualContribution,
      contributionTiming,
      taxRate,
      inflationRate,
    };

    const calculatedResults = calculateCompoundInterest(inputs);
    setResults(calculatedResults);
  }, [
    initialInvestment,
    interestRate,
    years,
    months,
    compoundingFrequency,
    monthlyContribution,
    annualContribution,
    contributionTiming,
    taxRate,
    inflationRate,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

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

  // Calculate percentages for visualization
  const principalPercentage =
    results && results.endingBalance > 0
      ? (results.totalPrincipal / results.endingBalance) * 100
      : 0;
  const contributionsPercentage =
    results && results.endingBalance > 0
      ? (results.totalContributions / results.endingBalance) * 100
      : 0;
  const interestPercentage =
    results && results.endingBalance > 0
      ? (results.totalInterest / results.endingBalance) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-10 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-xl mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
              Compound Interest{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Calculator
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Calculate how your investments grow over time with compound
              interest. Include regular contributions, compare compounding
              frequencies, and see the impact of taxes and inflation.
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
                <Calculator className="w-6 h-6 mr-2 text-emerald-600" />
                Investment Details
              </h2>

              <div className="space-y-5">
                {/* Initial Investment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Investment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(initialInvestment)}
                      onChange={(e) =>
                        setInitialInvestment(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
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
                      onChange={(e) =>
                        setInterestRate(parseDecimalInput(e.target.value))
                      }
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Investment Length */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Investment Length
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value) || 0)}
                        min="0"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="text-xs text-gray-500 mt-1 block text-center">
                        Years
                      </span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={months}
                        onChange={(e) =>
                          setMonths(Math.min(11, Number(e.target.value) || 0))
                        }
                        min="0"
                        max="11"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="text-xs text-gray-500 mt-1 block text-center">
                        Months
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compounding Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compound Frequency
                  </label>
                  <select
                    value={compoundingFrequency}
                    onChange={(e) =>
                      setCompoundingFrequency(
                        e.target.value as CompoundingFrequency
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value="annually">Annually</option>
                    <option value="semiannually">Semi-annually</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="semimonthly">Semi-monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                    <option value="continuously">Continuously</option>
                  </select>
                </div>

                {/* Regular Contributions */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <PiggyBank className="w-4 h-4" />
                    Regular Contributions (Optional)
                  </h3>

                  <div className="space-y-4">
                    {/* Monthly Contribution */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
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
                          onChange={(e) =>
                            setMonthlyContribution(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                        />
                      </div>
                    </div>

                    {/* Annual Contribution */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
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
                          onChange={(e) =>
                            setAnnualContribution(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                        />
                      </div>
                    </div>

                    {/* Contribution Timing */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Contribute at
                      </label>
                      <select
                        value={contributionTiming}
                        onChange={(e) =>
                          setContributionTiming(
                            e.target.value as ContributionTiming
                          )
                        }
                        className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                      >
                        <option value="beginning">Beginning of period</option>
                        <option value="end">End of period</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tax & Inflation */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Tax & Inflation (Optional)
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tax Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={taxRate || ''}
                          onChange={(e) =>
                            setTaxRate(parseDecimalInput(e.target.value))
                          }
                          className="w-full pl-3 pr-7 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Inflation Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={inflationRate || ''}
                          onChange={(e) =>
                            setInflationRate(parseDecimalInput(e.target.value))
                          }
                          className="w-full pl-3 pr-7 py-2.5 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
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
              {results && (
                <>
                  {/* Final Amount Card */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Ending Balance
                    </div>
                    <div className="text-5xl font-bold mb-6">
                      {formatCurrency(results.endingBalance)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Total Invested</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            results.totalPrincipal + results.totalContributions
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Interest</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalInterest)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investment Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Investment Breakdown
                    </h3>

                    {/* Visual Chart */}
                    <div className="mb-6">
                      <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                        {principalPercentage > 0 && (
                          <div
                            className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                            style={{ width: `${principalPercentage}%` }}
                          >
                            {principalPercentage > 10 &&
                              `${principalPercentage.toFixed(1)}%`}
                          </div>
                        )}
                        {contributionsPercentage > 0 && (
                          <div
                            className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                            style={{ width: `${contributionsPercentage}%` }}
                          >
                            {contributionsPercentage > 10 &&
                              `${contributionsPercentage.toFixed(1)}%`}
                          </div>
                        )}
                        {interestPercentage > 0 && (
                          <div
                            className="bg-emerald-500 flex items-center justify-center text-white text-sm font-semibold transition-all"
                            style={{ width: `${interestPercentage}%` }}
                          >
                            {interestPercentage > 10 &&
                              `${interestPercentage.toFixed(1)}%`}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span className="text-sm text-gray-600">
                              Initial Investment
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.totalPrincipal)}
                          </span>
                        </div>
                        {results.totalContributions > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded bg-green-500"></div>
                              <span className="text-sm text-gray-600">
                                Regular Contributions
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(results.totalContributions)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-500"></div>
                            <span className="text-sm text-gray-600">
                              Interest Earned
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.totalInterest)}
                          </span>
                        </div>
                        {results.interestFromInitial > 0 &&
                          results.interestFromContributions > 0 && (
                            <>
                              <div className="pl-6 space-y-2 text-sm border-l-2 border-gray-200 ml-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">
                                    From Initial
                                  </span>
                                  <span className="text-gray-700">
                                    {formatCurrency(
                                      results.interestFromInitial
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">
                                    From Contributions
                                  </span>
                                  <span className="text-gray-700">
                                    {formatCurrency(
                                      results.interestFromContributions
                                    )}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                      {taxRate > 0 && (
                        <div>
                          <div className="text-xs text-gray-500">After Tax</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(results.afterTaxAmount)}
                          </div>
                        </div>
                      )}
                      {inflationRate > 0 && (
                        <div>
                          <div className="text-xs text-gray-500">
                            Inflation Adjusted
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(results.inflationAdjustedAmount)}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500">
                          Effective Annual Rate
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPercent(results.effectiveAnnualRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Total Return
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          +{formatPercent(results.totalReturn)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Investment Growth Over Time
                    </h3>

                    {/* SVG Chart */}
                    <div className="relative h-64 mb-6">
                      <svg
                        className="w-full h-full cursor-crosshair"
                        viewBox="0 0 800 256"
                        preserveAspectRatio="none"
                        onMouseMove={(e) => {
                          if (!results || results.schedule.length === 0) return;

                          const rect = e.currentTarget.getBoundingClientRect();
                          const x =
                            ((e.clientX - rect.left) / rect.width) * 800;
                          const periodIndex = Math.round(
                            (x / 800) * (results.schedule.length - 1)
                          );
                          const validIndex = Math.max(
                            0,
                            Math.min(periodIndex, results.schedule.length - 1)
                          );
                          const period = results.schedule[validIndex];

                          setHoveredPoint({
                            period: period.year,
                            balance: period.balance,
                            contributions:
                              period.cumulativeDeposits -
                              results.totalPrincipal,
                            interest: period.cumulativeInterest,
                            x:
                              (validIndex / (results.schedule.length - 1)) *
                              800,
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
                              y1={256 * (1 - y)}
                              x2="800"
                              y2={256 * (1 - y)}
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
                              stopColor="#10B981"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="#10B981"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                        </defs>

                        {results && results.schedule.length > 0 && (
                          <>
                            {/* Balance Area */}
                            <path
                              d={(() => {
                                const maxBalance = Math.max(
                                  ...results.schedule.map((s) => s.balance)
                                );
                                const points = results.schedule
                                  .map((s, i) => {
                                    const x =
                                      (i / (results.schedule.length - 1)) * 800;
                                    const y =
                                      256 - (s.balance / maxBalance) * 256;
                                    return `${x},${y}`;
                                  })
                                  .join(' L ');
                                return `M 0,256 L 0,${256 - (results.totalPrincipal / maxBalance) * 256} L ${points} L 800,256 Z`;
                              })()}
                              fill="url(#balanceGradient)"
                            />

                            {/* Balance Line */}
                            <polyline
                              points={(() => {
                                const maxBalance = Math.max(
                                  ...results.schedule.map((s) => s.balance)
                                );
                                return results.schedule
                                  .map((s, i) => {
                                    const x =
                                      (i / (results.schedule.length - 1)) * 800;
                                    const y =
                                      256 - (s.balance / maxBalance) * 256;
                                    return `${x},${y}`;
                                  })
                                  .join(' ');
                              })()}
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Hover indicator */}
                            {hoveredPoint && (
                              <>
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
                                <circle
                                  cx={hoveredPoint.x}
                                  cy={
                                    256 -
                                    (hoveredPoint.balance /
                                      Math.max(
                                        ...results.schedule.map(
                                          (s) => s.balance
                                        )
                                      )) *
                                      256
                                  }
                                  r="6"
                                  fill="#10B981"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              </>
                            )}
                          </>
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
                          <div className="font-bold mb-2">
                            Year {hoveredPoint.period}
                          </div>
                          <div className="space-y-1">
                            <div>
                              Balance: {formatCurrency(hoveredPoint.balance)}
                            </div>
                            <div className="text-green-300">
                              Interest: {formatCurrency(hoveredPoint.interest)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Accordion */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Investment Schedule
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isScheduleOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isScheduleOpen && results && (
                      <div className="px-8 pb-8">
                        {/* View Toggle */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setIsMonthlyView(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              !isMonthlyView
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Annual View
                          </button>
                          {results.monthlySchedule.length > 0 && (
                            <button
                              onClick={() => setIsMonthlyView(true)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isMonthlyView
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Monthly View
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                  {isMonthlyView ? 'Month' : 'Year'}
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
                              {(isMonthlyView
                                ? results.monthlySchedule
                                : results.schedule
                              ).map((row, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-gray-900 font-medium">
                                    {isMonthlyView ? row.month : row.year}
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-900">
                                    {row.deposit > 0
                                      ? formatCurrency(row.deposit)
                                      : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-right text-emerald-600">
                                    {formatCurrency(row.interest)}
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
                </>
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
              Understanding Compound Interest
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Compound Interest?
                </h3>
                <p className="text-gray-600 mb-4">
                  Compound interest is interest calculated on the initial
                  principal plus all accumulated interest from previous periods.
                  It&apos;s often called &quot;interest on interest&quot; and is
                  the key to building wealth over time.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-mono text-gray-700 mb-2">
                    <strong>Compound Interest Formula:</strong>
                  </p>
                  <p className="font-mono text-sm">A = P(1 + r/n)^(nt)</p>
                  <ul className="mt-3 text-sm text-gray-600 space-y-1">
                    <li>• A = Final amount</li>
                    <li>• P = Principal (initial investment)</li>
                    <li>• r = Annual interest rate (decimal)</li>
                    <li>• n = Compounding periods per year</li>
                    <li>• t = Time in years</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Power of Time
                </h3>
                <p className="text-gray-600 mb-4">
                  Time is your greatest asset when it comes to compound
                  interest. The earlier you start investing, the more time your
                  money has to grow exponentially.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Starting at 25
                    </h4>
                    <p className="text-sm text-gray-600">
                      $200/month for 40 years at 7% = $525,000
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total invested: $96,000
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Starting at 35
                    </h4>
                    <p className="text-sm text-gray-600">
                      $200/month for 30 years at 7% = $246,000
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total invested: $72,000
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>
                    10 years of delay costs over $279,000 in growth!
                  </strong>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Compounding Frequency Impact
                </h3>
                <p className="text-gray-600 mb-4">
                  How often interest compounds can significantly affect your
                  returns. More frequent compounding means interest is
                  calculated and added to your principal more often.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Daily (365x per year)</span>
                    <span className="font-semibold text-gray-900">
                      Highest returns
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Monthly (12x per year)
                    </span>
                    <span className="font-semibold text-gray-900">
                      Common for savings
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Quarterly (4x per year)
                    </span>
                    <span className="font-semibold text-gray-900">
                      Typical for bonds
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">
                      Annually (1x per year)
                    </span>
                    <span className="font-semibold text-gray-900">
                      Simplest calculation
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Regular Contributions Matter
                </h3>
                <p className="text-gray-600 mb-4">
                  Adding regular contributions dramatically accelerates wealth
                  building through:
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <div>
                      <strong>Dollar-Cost Averaging:</strong> Regular
                      investments reduce the impact of market volatility by
                      spreading purchases over time.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <div>
                      <strong>Compound Growth:</strong> Each contribution starts
                      earning its own compound interest immediately.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <div>
                      <strong>Habit Building:</strong> Automatic contributions
                      make saving effortless and consistent.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tax and Inflation Considerations
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Tax Impact
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Investment gains are typically taxable. Consider
                      tax-advantaged accounts like:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      <li>
                        • 401(k) - Pre-tax contributions, taxed on withdrawal
                      </li>
                      <li>
                        • Roth IRA - After-tax contributions, tax-free
                        withdrawals
                      </li>
                      <li>• HSA - Triple tax advantage for medical expenses</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Inflation Adjustment
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Inflation erodes purchasing power over time. A 3%
                      inflation rate means prices double every 24 years. Always
                      consider real returns (returns minus inflation) when
                      planning long-term goals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Investment Tips for Success
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>
                      Start as early as possible - time is your greatest asset
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>
                      Be consistent with contributions, even small amounts
                      compound
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>
                      Reinvest dividends and interest for maximum compounding
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Use tax-advantaged accounts when available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Diversify investments across asset classes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Stay invested during market downturns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Review and adjust your strategy annually</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Finappo. All rights reserved.
            </p>
            <p className="text-xs mt-2 text-gray-500">
              This calculator provides estimates for informational purposes
              only. Consult a financial advisor for personalized advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
