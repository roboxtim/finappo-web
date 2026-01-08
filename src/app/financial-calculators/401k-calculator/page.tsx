'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank,
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
} from 'lucide-react';
import Link from 'next/link';
import {
  calculate401kResults,
  validate401kInputs,
  formatCurrency,
  formatPercentage,
  formatYears,
  IRS_LIMITS_2026,
  type K401Inputs,
  type K401Results,
} from './__tests__/k401Calculations';
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

export default function K401Calculator() {
  // Input states
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [currentAnnualSalary, setCurrentAnnualSalary] = useState<number>(75000);
  const [current401kBalance, setCurrent401kBalance] = useState<number>(50000);
  const [employeeContributionPercent, setEmployeeContributionPercent] =
    useState<number>(10);
  const [employerMatch1Percent, setEmployerMatch1Percent] =
    useState<number>(100);
  const [employerMatch1Limit, setEmployerMatch1Limit] = useState<number>(5);
  const [employerMatch2Percent, setEmployerMatch2Percent] = useState<number>(0);
  const [employerMatch2Limit, setEmployerMatch2Limit] = useState<number>(0);
  const [expectedSalaryIncrease, setExpectedSalaryIncrease] =
    useState<number>(3);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(7);
  const [expectedInflation, setExpectedInflation] = useState<number>(3);

  // Results
  const [results, setResults] = useState<K401Results | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'projection' | 'breakdown' | 'contributions'
  >('projection');

  // Calculate 401(k) Results
  const calculate = useCallback(() => {
    const inputs: K401Inputs = {
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentAnnualSalary,
      current401kBalance,
      employeeContributionPercent,
      employerMatch1Percent,
      employerMatch1Limit,
      employerMatch2Percent,
      employerMatch2Limit,
      expectedSalaryIncrease,
      expectedAnnualReturn,
      expectedInflation,
    };

    const validationErrors = validate401kInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculate401kResults(inputs);
    setResults(calculatedResults);
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentAnnualSalary,
    current401kBalance,
    employeeContributionPercent,
    employerMatch1Percent,
    employerMatch1Limit,
    employerMatch2Percent,
    employerMatch2Limit,
    expectedSalaryIncrease,
    expectedAnnualReturn,
    expectedInflation,
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

  // Prepare projection chart data
  const getProjectionChartData = () => {
    if (!results || results.yearByYearProjection.length === 0) return null;

    const labels = results.yearByYearProjection.map((p) => p.age.toString());
    const balanceData = results.yearByYearProjection.map((p) => p.balance);
    const balanceInTodaysDollars = results.yearByYearProjection.map(
      (p) => p.balanceInTodaysDollars
    );

    return {
      labels,
      datasets: [
        {
          label: 'Projected Balance',
          data: balanceData,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Today's Dollars",
          data: balanceInTodaysDollars,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare breakdown chart data
  const getBreakdownChartData = () => {
    if (!results) return null;

    const data = [];
    const labels = [];
    const colors = [];

    if (results.current401kBalance > 0) {
      data.push(results.current401kBalance);
      labels.push('Starting Balance');
      colors.push('rgba(99, 102, 241, 0.8)');
    }

    if (results.totalEmployeeContributions > 0) {
      data.push(results.totalEmployeeContributions);
      labels.push('Your Contributions');
      colors.push('rgba(16, 185, 129, 0.8)');
    }

    if (results.totalEmployerContributions > 0) {
      data.push(results.totalEmployerContributions);
      labels.push('Employer Match');
      colors.push('rgba(251, 146, 60, 0.8)');
    }

    if (results.totalInvestmentGrowth > 0) {
      data.push(results.totalInvestmentGrowth);
      labels.push('Investment Growth');
      colors.push('rgba(168, 85, 247, 0.8)');
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: colors.map((c) => c.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare contributions chart data
  const getContributionsChartData = () => {
    if (!results || results.yearByYearProjection.length === 0) return null;

    // Sample every few years to keep chart readable
    const sampleRate = Math.max(
      1,
      Math.floor(results.yearByYearProjection.length / 15)
    );
    const sampledData = results.yearByYearProjection.filter(
      (_, index) => index % sampleRate === 0
    );

    const labels = sampledData.map((p) => p.age.toString());
    const employeeData = sampledData.map((p) => p.employeeContribution);
    const employerData = sampledData.map((p) => p.employerContribution);

    return {
      labels,
      datasets: [
        {
          label: 'Your Contributions',
          data: employeeData,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
        {
          label: 'Employer Match',
          data: employerData,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
      ],
    };
  };

  const projectionChartData = getProjectionChartData();
  const breakdownChartData = getBreakdownChartData();
  const contributionsChartData = getContributionsChartData();

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
      y: {
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
        stacked: true,
      },
      x: {
        stacked: true,
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
              <PiggyBank className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                401(k) Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Plan your retirement with employer-sponsored 401(k) savings
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
              className="space-y-6"
            >
              {/* Age & Salary Inputs */}
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="35"
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="65"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Life Expectancy
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={lifeExpectancy || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setLifeExpectancy(value ? Number(value) : 0);
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="85"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Annual Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(currentAnnualSalary)}
                        onChange={(e) =>
                          setCurrentAnnualSalary(
                            parseInputValue(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="75,000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 401(k) Balance & Contributions */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  401(k) Balance & Contributions
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current 401(k) Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(current401kBalance)}
                        onChange={(e) =>
                          setCurrent401kBalance(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="50,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Contribution (% of Salary)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={employeeContributionPercent || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setEmployeeContributionPercent(
                            value ? Number(value) : 0
                          );
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {currentAge < 50
                        ? `2026 Limit: ${formatCurrency(IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50)}`
                        : `2026 Limit (with catch-up): ${formatCurrency(IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Employer Match */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Employer Match
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tier 1: Employer Match %
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={employerMatch1Percent || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setEmployerMatch1Percent(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      100% = dollar-for-dollar match
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tier 1: Up to % of Salary
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={employerMatch1Limit || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setEmployerMatch1Limit(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                      Optional: Add a second tier of employer matching
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tier 2: Employer Match %
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={employerMatch2Percent || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setEmployerMatch2Percent(
                                value ? Number(value) : 0
                              );
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tier 2: Up to % of Salary
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={employerMatch2Limit || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setEmployerMatch2Limit(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projections */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Projections
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Salary Increase
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expectedSalaryIncrease || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setExpectedSalaryIncrease(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="3"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Annual percentage increase
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Annual Return
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expectedAnnualReturn || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setExpectedAnnualReturn(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="7"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Investment return rate
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Inflation
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expectedInflation || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setExpectedInflation(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="3"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Annual inflation rate
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
                      Projected Balance at Retirement
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.projectedBalanceAtRetirement)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      At age {retirementAge} (
                      {formatYears(results.yearsToRetirement)})
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          In Today&apos;s Dollars
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.inflationAdjustedBalance)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          Monthly Withdrawal
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.monthlyWithdrawal)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* First Year Contributions */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      First Year Contributions
                    </h3>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
                      <div className="text-sm text-gray-600 mb-2">
                        Total Annual Contribution
                      </div>
                      <div className="text-4xl font-bold text-green-600 mb-4">
                        {formatCurrency(results.firstYearTotalContribution)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200">
                        <div>
                          <div className="text-xs text-gray-600">You</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(
                              results.firstYearEmployeeContribution
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Employer</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(
                              results.firstYearEmployerContribution
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {results.firstYearEmployeeContribution >=
                      IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50 && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-900">
                              Contribution Limit Reached
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Your contribution is capped at the 2026 IRS limit
                              of{' '}
                              {formatCurrency(
                                currentAge < 50
                                  ? IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50
                                  : IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS
                              )}
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lifetime Totals */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Lifetime Totals
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Your Contributions
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalEmployeeContributions)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Over {formatYears(results.yearsToRetirement)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Award className="w-4 h-4" />
                          Employer Match
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.totalEmployerContributions)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Free money!
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Investment Growth
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(results.totalInvestmentGrowth)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          From compound returns
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Target className="w-4 h-4" />
                          Total Contributions
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.totalContributions)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          You + Employer
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Retirement Outlook
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Income Replacement
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(results.replacementRatio, 0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Of final salary
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Savings Multiple
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {results.savingsMultiple.toFixed(1)}×
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Of final salary
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          Final Year Salary
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(results.finalYearSalary)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        At retirement age
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
                        <button
                          onClick={() => setActiveChart('contributions')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'contributions'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Contributions
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
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={pieChartOptions}
                        />
                      )}
                      {activeChart === 'contributions' &&
                        contributionsChartData && (
                          <BarChart
                            data={contributionsChartData}
                            options={barChartOptions}
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
                            Your 401(k) Balance
                          </h4>
                          <p className="text-sm text-gray-600">
                            Based on your current inputs, you&apos;ll have{' '}
                            {formatCurrency(
                              results.projectedBalanceAtRetirement
                            )}{' '}
                            in your 401(k) at retirement. In today&apos;s
                            dollars (adjusted for{' '}
                            {formatPercentage(expectedInflation, 1)} inflation),
                            that&apos;s{' '}
                            {formatCurrency(results.inflationAdjustedBalance)}.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            Employer Match Value
                          </h4>
                          <p className="text-sm text-gray-600">
                            Don&apos;t leave free money on the table! Your
                            employer will contribute{' '}
                            {formatCurrency(results.totalEmployerContributions)}{' '}
                            over {formatYears(results.yearsToRetirement)}. This
                            is essentially a guaranteed return that
                            significantly boosts your retirement savings.
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            Power of Compound Growth
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your investment returns will contribute{' '}
                            {formatCurrency(results.totalInvestmentGrowth)} to
                            your final balance. This demonstrates the power of
                            compound growth - your money earns returns, and
                            those returns earn more returns over time.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Retirement Income
                          </h4>
                          <p className="text-sm text-gray-600">
                            Using the 4% withdrawal rule, you can safely
                            withdraw{' '}
                            {formatCurrency(results.firstYearWithdrawal)} per
                            year ({formatCurrency(results.monthlyWithdrawal)}{' '}
                            per month) in your first year of retirement. This
                            represents{' '}
                            {formatPercentage(results.replacementRatio, 0)} of
                            your final salary.
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

      {/* Educational Section - continued in next part due to length */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding 401(k) Plans
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a 401(k) Plan?
                </h3>
                <p className="mb-4">
                  A 401(k) is an employer-sponsored retirement savings plan that
                  allows employees to contribute a portion of their salary
                  before taxes are taken out. The money grows tax-deferred until
                  withdrawal in retirement, and many employers match a
                  percentage of your contributions.
                </p>
                <p className="text-sm">
                  Named after section 401(k) of the Internal Revenue Code, these
                  plans are one of the most popular retirement savings vehicles
                  in the United States, offering significant tax advantages and
                  the potential for employer matching contributions.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2026 Contribution Limits
                </h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Employee Contributions (Under 50)
                    </h4>
                    <p className="text-sm">
                      Maximum:{' '}
                      {formatCurrency(
                        IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_UNDER_50
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Employee Contributions (Age 50+)
                    </h4>
                    <p className="text-sm">
                      Maximum:{' '}
                      {formatCurrency(
                        IRS_LIMITS_2026.EMPLOYEE_CONTRIBUTION_50_PLUS
                      )}{' '}
                      (includes $6,500 catch-up contribution)
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Total Contributions (Employee + Employer)
                    </h4>
                    <p className="text-sm">
                      Maximum:{' '}
                      {formatCurrency(IRS_LIMITS_2026.TOTAL_CONTRIBUTION_LIMIT)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Employer Matching: Free Money
                </h3>
                <p className="mb-4">
                  An employer match is when your company contributes additional
                  money to your 401(k) based on your own contributions. This is
                  literally free money and one of the best ways to accelerate
                  your retirement savings.
                </p>
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Common Matching Formulas
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • <strong>Dollar-for-dollar (100% match):</strong> If you
                      contribute 5% of your salary, employer adds another 5%
                    </li>
                    <li>
                      • <strong>50% match:</strong> If you contribute 6% of your
                      salary, employer adds 3%
                    </li>
                    <li>
                      • <strong>Two-tier match:</strong> 100% match on first 3%
                      + 50% match on next 2%
                    </li>
                  </ul>
                </div>
                <p className="text-sm mt-4">
                  Always contribute at least enough to get the full employer
                  match - it&apos;s an immediate 50-100% return on your
                  investment!
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tax Advantages of 401(k) Plans
                </h3>
                <p className="mb-4">
                  401(k) contributions are made with pre-tax dollars, which
                  means they reduce your taxable income for the year you make
                  the contribution. Your investments grow tax-deferred, and you
                  only pay taxes when you withdraw the money in retirement.
                </p>
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Tax Savings Example
                  </h4>
                  <p className="text-sm">
                    If you earn $75,000 and contribute $7,500 (10%), your
                    taxable income becomes $67,500. At a 22% tax rate, you save
                    $1,650 in taxes that year. Over 30 years, these tax savings
                    compound significantly.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Traditional vs. Roth 401(k)
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Traditional 401(k)
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Pre-tax contributions</li>
                      <li>• Reduces current taxable income</li>
                      <li>• Tax-deferred growth</li>
                      <li>• Taxed at withdrawal</li>
                      <li>• Best if tax rate lower in retirement</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Roth 401(k)
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• After-tax contributions</li>
                      <li>• No current tax deduction</li>
                      <li>• Tax-free growth</li>
                      <li>• Tax-free withdrawals</li>
                      <li>• Best if tax rate higher in retirement</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Vesting Schedules
                </h3>
                <p className="mb-4">
                  Vesting refers to ownership of employer contributions. Your
                  own contributions are always 100% vested (they&apos;re yours).
                  However, employer contributions may be subject to a vesting
                  schedule, meaning you gain ownership gradually over time.
                </p>
                <div className="space-y-3">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Cliff Vesting
                    </h4>
                    <p className="text-sm">
                      You become 100% vested after a specific period (e.g., 3
                      years). If you leave before, you forfeit all employer
                      contributions.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Graded Vesting
                    </h4>
                    <p className="text-sm">
                      You gradually become vested over time (e.g., 20% per year
                      over 5 years).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Withdrawal Rules and Penalties
                </h3>
                <p className="mb-4">
                  401(k) funds are intended for retirement, and the IRS imposes
                  rules on when you can access them without penalties.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Early Withdrawal (Before 59½)
                    </h4>
                    <p className="text-sm">
                      Generally subject to 10% penalty plus regular income tax.
                      Some exceptions exist for disability, certain medical
                      expenses, or first- time home purchase.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Normal Retirement (59½+)
                    </h4>
                    <p className="text-sm">
                      Penalty-free withdrawals, but you&apos;ll still pay
                      regular income tax on traditional 401(k) distributions.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Required Minimum Distributions (RMDs)
                    </h4>
                    <p className="text-sm">
                      Starting at age 73, you must take required minimum
                      distributions (RMDs) from your traditional 401(k). Failure
                      to do so results in a 50% penalty on the amount you should
                      have withdrawn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key 401(k) Planning Tips
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Start Early:</strong> The power of compound
                    interest means starting even 5 years earlier can add
                    hundreds of thousands to your retirement
                  </li>
                  <li>
                    • <strong>Get the Full Match:</strong> Always contribute at
                    least enough to get your full employer match
                  </li>
                  <li>
                    • <strong>Increase Contributions Over Time:</strong>{' '}
                    Increase your contribution percentage with each raise
                  </li>
                  <li>
                    • <strong>Diversify Investments:</strong> Don&apos;t put all
                    your 401(k) in company stock or any single investment
                  </li>
                  <li>
                    • <strong>Consider Roth 401(k):</strong> If available, young
                    workers may benefit from Roth contributions
                  </li>
                  <li>
                    • <strong>Use Catch-Up Contributions:</strong> If
                    you&apos;re 50+, take advantage of the extra $6,500 catch-up
                    contribution
                  </li>
                  <li>
                    • <strong>Review Annually:</strong> Rebalance your portfolio
                    and adjust contributions as your situation changes
                  </li>
                  <li>
                    • <strong>Avoid Early Withdrawals:</strong> The penalties
                    and lost growth can significantly impact your retirement
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
