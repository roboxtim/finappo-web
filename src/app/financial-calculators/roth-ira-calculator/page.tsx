'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  DollarSign,
  Info,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateRothIraResults,
  validateRothIraInputs,
  formatCurrency,
  formatPercentage,
  formatYears,
  IRS_LIMITS_2025,
  type RothIraInputs,
  type RothIraResults,
} from './rothIraCalculations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js';
import {
  Line as LineChart,
  Bar as BarChart,
  Pie as PieChart,
} from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

export default function RothIraCalculator() {
  // Input states
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [currentBalance, setCurrentBalance] = useState<number>(10000);
  const [annualContribution, setAnnualContribution] = useState<number>(6500);
  const [maximizeContributions, setMaximizeContributions] =
    useState<boolean>(false);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [marginalTaxRate, setMarginalTaxRate] = useState<number>(22);

  // Results
  const [results, setResults] = useState<RothIraResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'projection' | 'comparison' | 'breakdown'
  >('projection');

  // Calculate Roth IRA Results
  const calculate = useCallback(() => {
    const inputs: RothIraInputs = {
      currentAge,
      retirementAge,
      currentBalance,
      annualContribution,
      maximizeContributions,
      expectedReturn,
      marginalTaxRate,
    };

    const validationErrors = validateRothIraInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateRothIraResults(inputs);
    setResults(calculatedResults);
  }, [
    currentAge,
    retirementAge,
    currentBalance,
    annualContribution,
    maximizeContributions,
    expectedReturn,
    marginalTaxRate,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Format input value for display
  const formatInputValue = (value: number) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Parse input value
  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  // Get current contribution limit based on age
  const getCurrentContributionLimit = () => {
    return currentAge >= 50
      ? IRS_LIMITS_2025.CONTRIBUTION_LIMIT_50_PLUS
      : IRS_LIMITS_2025.CONTRIBUTION_LIMIT_UNDER_50;
  };

  // Prepare projection chart data
  const getProjectionChartData = () => {
    if (!results || results.yearByYearProjection.length === 0) return null;

    const labels = results.yearByYearProjection.map((p) => p.age.toString());
    const rothData = results.yearByYearProjection.map((p) => p.rothBalance);
    const taxableData = results.yearByYearProjection.map(
      (p) => p.taxableBalance
    );

    return {
      labels,
      datasets: [
        {
          label: 'Roth IRA',
          data: rothData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Taxable Account',
          data: taxableData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare comparison chart data
  const getComparisonChartData = () => {
    if (!results) return null;

    return {
      labels: ['Roth IRA', 'Taxable Account'],
      datasets: [
        {
          label: 'Principal',
          data: [results.totalPrincipal, results.totalPrincipal],
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
        {
          label: 'Interest',
          data: [results.rothIraInterest, results.taxableAccountInterest],
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Tax Paid',
          data: [0, results.taxableAccountTotalTax],
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare breakdown chart data
  const getBreakdownChartData = () => {
    if (!results) return null;

    return {
      labels: ['Principal', 'Growth', 'Tax Advantage'],
      datasets: [
        {
          data: [
            results.totalPrincipal,
            results.rothIraInterest,
            results.taxableAccountTotalTax,
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 146, 60, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const projectionChartData = getProjectionChartData();
  const comparisonChartData = getComparisonChartData();
  const breakdownChartData = getBreakdownChartData();

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.label || '';
            return `${label}: ${formatCurrency(context.parsed)}`;
          },
        },
      },
    },
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Roth IRA Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Plan your tax-free retirement savings with a Roth IRA
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
              {/* Basic Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Basic Information
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Age
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={currentAge || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setCurrentAge(value ? Number(value) : 0);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Retirement Age
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={retirementAge || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setRetirementAge(value ? Number(value) : 0);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                      placeholder="65"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Roth IRA Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(currentBalance)}
                        onChange={(e) =>
                          setCurrentBalance(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="10,000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributions */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Annual Contributions
                </h2>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="maximize"
                        checked={maximizeContributions}
                        onChange={(e) =>
                          setMaximizeContributions(e.target.checked)
                        }
                        className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <label
                        htmlFor="maximize"
                        className="ml-3 text-sm font-semibold text-gray-700"
                      >
                        Maximize annual contributions
                      </label>
                    </div>
                    {maximizeContributions && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-sm text-green-800">
                          Will automatically use IRS maximum limits:
                          <br />• Under 50:{' '}
                          {formatCurrency(
                            IRS_LIMITS_2025.CONTRIBUTION_LIMIT_UNDER_50
                          )}
                          <br />• Age 50+:{' '}
                          {formatCurrency(
                            IRS_LIMITS_2025.CONTRIBUTION_LIMIT_50_PLUS
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {!maximizeContributions && (
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
                          onChange={(e) =>
                            setAnnualContribution(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                          placeholder="6,500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        2025 Limit:{' '}
                        {formatCurrency(getCurrentContributionLimit())}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Returns & Tax */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Returns & Tax
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Annual Return
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expectedReturn || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setExpectedReturn(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="7"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Average annual investment return
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marginal Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={marginalTaxRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setMarginalTaxRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="22"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your current tax bracket
                    </p>
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
              {results && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-green-600 to-emerald-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Target className="w-4 h-4" />
                      Roth IRA Balance at Retirement
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.rothIraBalance)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      At age {retirementAge} (
                      {formatYears(results.yearsToRetirement)})
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Tax-Free Growth
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.rothIraInterest)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Tax Advantage</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.difference)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Summary */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Roth IRA vs Taxable Account
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900">
                              Roth IRA
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {formatCurrency(results.rothIraBalance)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Principal</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.totalPrincipal)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Interest</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.rothIraInterest)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tax</div>
                            <div className="font-semibold text-green-600">
                              $0
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-gray-900">
                              Taxable Account
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-red-600">
                            {formatCurrency(results.taxableAccountBalance)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Principal</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.totalPrincipal)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Interest</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.taxableAccountInterest)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tax</div>
                            <div className="font-semibold text-red-600">
                              {formatCurrency(results.taxableAccountTotalTax)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            <span className="font-semibold">
                              Roth IRA Advantage
                            </span>
                          </div>
                          <div>
                            <span className="text-2xl font-bold">
                              {formatCurrency(results.difference)}
                            </span>
                            <span className="text-sm opacity-75 ml-2">
                              (+
                              {formatPercentage(
                                results.percentageAdvantage / 100,
                                1
                              )}
                              )
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Key Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Total Contributions
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalPrincipal)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Over {formatYears(results.yearsToRetirement)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Investment Growth
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.rothIraInterest)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tax-free earnings
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Shield className="w-4 h-4" />
                          Tax Savings
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.effectiveTaxSavings)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Lifetime benefit
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Zap className="w-4 h-4" />
                          Effective Return
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {formatPercentage(
                            results.percentageAdvantage / 100,
                            1
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Better than taxable
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visualizations */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Visualizations
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveChart('projection')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'projection'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <LineChartIcon className="w-4 h-4" />
                          Growth
                        </button>
                        <button
                          onClick={() => setActiveChart('comparison')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'comparison'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Compare
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Breakdown
                        </button>
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'projection' && projectionChartData && (
                        <LineChart
                          data={projectionChartData}
                          options={lineChartOptions}
                        />
                      )}
                      {activeChart === 'comparison' && comparisonChartData && (
                        <BarChart
                          data={comparisonChartData}
                          options={barChartOptions}
                        />
                      )}
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={pieChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Understanding Results */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Understanding Your Results
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
                            <Target className="w-4 h-4 text-green-600" />
                            Your Roth IRA Projection
                          </h4>
                          <p className="text-sm text-gray-600">
                            Based on your inputs, your Roth IRA will grow to{' '}
                            {formatCurrency(results.rothIraBalance)} by
                            retirement. This includes{' '}
                            {formatCurrency(results.totalPrincipal)} in
                            contributions and{' '}
                            {formatCurrency(results.rothIraInterest)} in
                            tax-free investment growth.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            Tax-Free Advantage
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your Roth IRA saves you{' '}
                            {formatCurrency(results.effectiveTaxSavings)} in
                            taxes compared to a regular taxable investment
                            account. All qualified withdrawals in retirement are
                            completely tax-free.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Withdrawal Flexibility
                          </h4>
                          <p className="text-sm text-gray-600">
                            You can withdraw your contributions at any time
                            without penalty. Earnings can be withdrawn tax-free
                            after age 59½ and if the account has been open for
                            at least 5 years.
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
              Understanding Roth IRAs
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a Roth IRA?
                </h3>
                <p className="mb-4">
                  A Roth IRA is a retirement savings account that offers
                  tax-free growth and tax-free withdrawals in retirement. Unlike
                  traditional IRAs, contributions are made with after-tax
                  dollars, but qualified distributions are completely tax-free.
                </p>
                <p className="text-sm">
                  Named after Senator William Roth Jr., these accounts were
                  created in 1997 to provide Americans with a tax-advantaged way
                  to save for retirement while maintaining flexibility for
                  withdrawals.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 Contribution Limits
                </h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Under Age 50
                    </h4>
                    <p className="text-sm">
                      Maximum:{' '}
                      {formatCurrency(
                        IRS_LIMITS_2025.CONTRIBUTION_LIMIT_UNDER_50
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Age 50 and Older
                    </h4>
                    <p className="text-sm">
                      Maximum:{' '}
                      {formatCurrency(
                        IRS_LIMITS_2025.CONTRIBUTION_LIMIT_50_PLUS
                      )}{' '}
                      (includes{' '}
                      {formatCurrency(IRS_LIMITS_2025.CATCH_UP_CONTRIBUTION)}{' '}
                      catch-up contribution)
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Income Limits (Single)
                    </h4>
                    <p className="text-sm">
                      Phase-out begins:{' '}
                      {formatCurrency(IRS_LIMITS_2025.SINGLE_INCOME_LIMIT)}
                      <br />
                      Phase-out complete:{' '}
                      {formatCurrency(IRS_LIMITS_2025.SINGLE_INCOME_LIMIT_MAX)}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Income Limits (Married Filing Jointly)
                    </h4>
                    <p className="text-sm">
                      Phase-out begins:{' '}
                      {formatCurrency(IRS_LIMITS_2025.MARRIED_INCOME_LIMIT)}
                      <br />
                      Phase-out complete:{' '}
                      {formatCurrency(IRS_LIMITS_2025.MARRIED_INCOME_LIMIT_MAX)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Benefits of Roth IRAs
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Tax-Free Growth:</strong> Your investments grow
                    without being taxed annually on gains or dividends.
                  </li>
                  <li>
                    <strong>Tax-Free Withdrawals:</strong> Qualified
                    distributions in retirement are completely tax-free.
                  </li>
                  <li>
                    <strong>No Required Minimum Distributions:</strong> Unlike
                    traditional IRAs, Roth IRAs have no RMDs during your
                    lifetime.
                  </li>
                  <li>
                    <strong>Contribution Flexibility:</strong> You can withdraw
                    your contributions at any time without penalty.
                  </li>
                  <li>
                    <strong>Estate Planning Benefits:</strong> Heirs inherit
                    Roth IRAs tax-free, making them excellent wealth transfer
                    tools.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Roth IRA vs Traditional IRA
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Roth IRA</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• After-tax contributions</li>
                      <li>• Tax-free growth</li>
                      <li>• Tax-free qualified withdrawals</li>
                      <li>• No RMDs during lifetime</li>
                      <li>• Income limits apply</li>
                      <li>• Best if tax rate higher in retirement</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Traditional IRA
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Pre-tax contributions</li>
                      <li>• Tax-deferred growth</li>
                      <li>• Taxable withdrawals</li>
                      <li>• RMDs start at age 73</li>
                      <li>• No income limits for contributions</li>
                      <li>• Best if tax rate lower in retirement</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Withdrawal Rules
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Contributions
                    </h4>
                    <p className="text-sm">
                      Can be withdrawn at any time, tax-free and penalty-free,
                      since you already paid taxes on this money.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Qualified Distributions (Earnings)
                    </h4>
                    <p className="text-sm">
                      Tax-free and penalty-free if: account is at least 5 years
                      old AND you are 59½ or older, disabled, or using up to
                      $10,000 for first-time home purchase.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Non-Qualified Distributions
                    </h4>
                    <p className="text-sm">
                      Earnings withdrawn before meeting qualified distribution
                      requirements are subject to income tax and a 10% penalty.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The 5-Year Rule
                </h3>
                <p className="mb-4">
                  The 5-year rule is crucial for Roth IRA withdrawals. Your
                  first contribution starts a 5-year clock, and this applies to
                  the entire account, not individual contributions.
                </p>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Important Points
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      • The 5-year period begins January 1 of the tax year of
                      your first contribution
                    </li>
                    <li>• Applies even if you are over 59½</li>
                    <li>• Each conversion has its own 5-year clock</li>
                    <li>
                      • Inherited Roth IRAs maintain the original owner&apos;s
                      5-year clock
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Investment Options
                </h3>
                <p className="mb-4">
                  Roth IRAs offer flexibility in investment choices:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Stocks:</strong> Individual stocks or stock mutual
                    funds for growth potential
                  </li>
                  <li>
                    • <strong>Bonds:</strong> Government or corporate bonds for
                    stability
                  </li>
                  <li>
                    • <strong>ETFs:</strong> Exchange-traded funds for
                    diversification
                  </li>
                  <li>
                    • <strong>Mutual Funds:</strong> Professionally managed
                    portfolios
                  </li>
                  <li>
                    • <strong>REITs:</strong> Real estate investment trusts for
                    property exposure
                  </li>
                  <li>
                    • <strong>CDs:</strong> Certificates of deposit for
                    guaranteed returns
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Roth IRA Strategies
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Start Early:</strong> The power of tax-free
                    compound growth increases dramatically with time
                  </li>
                  <li>
                    • <strong>Maximize Contributions:</strong> Contribute the
                    maximum allowed amount each year if possible
                  </li>
                  <li>
                    • <strong>Backdoor Roth:</strong> High earners can
                    contribute to a traditional IRA and convert to Roth
                  </li>
                  <li>
                    • <strong>Roth Conversions:</strong> Convert traditional IRA
                    assets during low-income years
                  </li>
                  <li>
                    • <strong>Tax Diversification:</strong> Balance Roth and
                    traditional retirement accounts
                  </li>
                  <li>
                    • <strong>Spousal IRA:</strong> Non-working spouses can
                    contribute based on household income
                  </li>
                  <li>
                    • <strong>Estate Planning:</strong> Name beneficiaries and
                    consider stretch IRA strategies
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
