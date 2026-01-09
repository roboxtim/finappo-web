'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ChevronDown,
  DollarSign,
  Percent,
  Info,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Zap,
  Users,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateRetirementResults,
  validateRetirementInputs,
  formatCurrency,
  formatPercentage,
  formatYears,
  type RetirementInputs,
  type RetirementResults,
} from './__tests__/retirementCalculations';
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

export default function RetirementCalculator() {
  // Input states
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(90);
  const [currentSavings, setCurrentSavings] = useState<number>(50000);
  const [annualContribution, setAnnualContribution] = useState<number>(12000);
  const [employerMatchPercentage, setEmployerMatchPercentage] =
    useState<number>(50);
  const [currentIncome, setCurrentIncome] = useState<number>(75000);
  const [preRetirementReturn, setPreRetirementReturn] = useState<number>(7);
  const [postRetirementReturn, setPostRetirementReturn] = useState<number>(5);
  const [inflationRate, setInflationRate] = useState<number>(3);
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState<number>(60000);
  const [socialSecurityIncome, setSocialSecurityIncome] =
    useState<number>(24000);
  const [otherIncome, setOtherIncome] = useState<number>(0);

  // Results
  const [results, setResults] = useState<RetirementResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'projection' | 'breakdown' | 'income'
  >('projection');

  // Calculate Retirement Plan
  const calculate = useCallback(() => {
    const inputs: RetirementInputs = {
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      annualContribution,
      employerMatchPercentage,
      currentIncome,
      preRetirementReturn,
      postRetirementReturn,
      inflationRate,
      desiredAnnualIncome,
      socialSecurityIncome,
      otherIncome,
    };

    const validationErrors = validateRetirementInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateRetirementResults(inputs);
    setResults(calculatedResults);
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    annualContribution,
    employerMatchPercentage,
    currentIncome,
    preRetirementReturn,
    postRetirementReturn,
    inflationRate,
    desiredAnnualIncome,
    socialSecurityIncome,
    otherIncome,
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

  // Prepare projection chart data (Line chart showing balance over time)
  const getProjectionChartData = () => {
    if (!results || results.yearByYearProjection.length === 0) return null;

    const labels = results.yearByYearProjection.map((p) => p.age.toString());
    const balanceData = results.yearByYearProjection.map((p) => p.balance);

    return {
      labels,
      datasets: [
        {
          label: 'Retirement Savings Balance',
          data: balanceData,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare breakdown chart data (Pie chart)
  const getBreakdownChartData = () => {
    if (!results) return null;

    const data = [];
    const labels = [];
    const colors = [];

    if (results.futureValueOfCurrentSavings > 0) {
      data.push(results.futureValueOfCurrentSavings);
      labels.push('Current Savings Growth');
      colors.push('rgba(99, 102, 241, 0.8)');
    }

    if (results.totalContributions > 0) {
      data.push(results.totalContributions);
      labels.push('Your Contributions');
      colors.push('rgba(16, 185, 129, 0.8)');
    }

    if (results.totalEmployerMatch > 0) {
      data.push(results.totalEmployerMatch);
      labels.push('Employer Match');
      colors.push('rgba(251, 146, 60, 0.8)');
    }

    if (results.totalInterestEarned > 0) {
      data.push(results.totalInterestEarned);
      labels.push('Investment Returns');
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

  // Prepare income chart data (Bar chart)
  const getIncomeChartData = () => {
    if (!results) return null;

    const labels = ['Retirement Income'];
    const withdrawalData = [results.withdrawalAmount];
    const socialSecurityData = [socialSecurityIncome];
    const otherIncomeData = [otherIncome];

    return {
      labels,
      datasets: [
        {
          label: 'Portfolio Withdrawals',
          data: withdrawalData,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1,
        },
        {
          label: 'Social Security',
          data: socialSecurityData,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
        {
          label: 'Other Income',
          data: otherIncomeData,
          backgroundColor: 'rgba(251, 146, 60, 0.6)',
          borderColor: 'rgb(251, 146, 60)',
          borderWidth: 1,
        },
      ],
    };
  };

  const projectionChartData = getProjectionChartData();
  const breakdownChartData = getBreakdownChartData();
  const incomeChartData = getIncomeChartData();

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Retirement Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Plan your retirement savings and income needs
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
              {/* Age Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Age Information
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
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
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
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
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
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                      placeholder="90"
                    />
                  </div>
                </div>
              </div>

              {/* Savings Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Current Savings & Contributions
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Retirement Savings
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(currentSavings)}
                        onChange={(e) =>
                          setCurrentSavings(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="50,000"
                      />
                    </div>
                  </div>

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
                          setAnnualContribution(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="12,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your annual 401(k) or IRA contribution
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employer Match
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={employerMatchPercentage || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setEmployerMatchPercentage(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Percentage of your contribution matched by employer
                    </p>
                  </div>
                </div>
              </div>

              {/* Income Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Income Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Annual Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(currentIncome)}
                        onChange={(e) =>
                          setCurrentIncome(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="75,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Desired Annual Retirement Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(desiredAnnualIncome)}
                        onChange={(e) =>
                          setDesiredAnnualIncome(
                            parseInputValue(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="60,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Income needed per year in retirement (today&apos;s
                      dollars)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Social Security Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(socialSecurityIncome)}
                        onChange={(e) =>
                          setSocialSecurityIncome(
                            parseInputValue(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="24,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Annual Social Security benefits
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Other Annual Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(otherIncome)}
                        onChange={(e) =>
                          setOtherIncome(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Pensions, rental income, part-time work, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Return Rates & Inflation
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pre-Retirement Return Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={preRetirementReturn || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setPreRetirementReturn(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="7"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Expected annual return before retirement
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Post-Retirement Return Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={postRetirementReturn || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setPostRetirementReturn(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Expected annual return during retirement
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Inflation Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={inflationRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setInflationRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="3"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Expected annual inflation rate
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
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      results.canRetireComfortably
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                        : 'bg-gradient-to-br from-orange-600 to-red-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Target className="w-4 h-4" />
                      {results.canRetireComfortably
                        ? 'On Track for Retirement'
                        : 'Retirement Shortfall'}
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.totalAtRetirement)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Projected savings at age {retirementAge} (
                      {formatYears(results.yearsToRetirement)})
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Required Savings
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.requiredSavingsAtRetirement)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          {results.canRetireComfortably
                            ? 'Surplus'
                            : 'Shortfall'}
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(Math.abs(results.surplusOrShortfall))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Retirement Income */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Retirement Income Projection
                    </h3>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6">
                      <div className="text-sm text-gray-600 mb-2">
                        Total Annual Income (First Year)
                      </div>
                      <div className="text-4xl font-bold text-purple-600 mb-4">
                        {formatCurrency(results.totalRetirementIncome)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                        <div>
                          <div className="text-xs text-gray-600">Portfolio</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(results.withdrawalAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">
                            Soc. Security
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(socialSecurityIncome)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Other</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(otherIncome)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Withdrawal Rate
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(results.withdrawalRate, 1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Of retirement savings
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Income Replacement
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(
                            results.percentageOfIncomeReplaced,
                            0
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Of current income
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Key Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Monthly Contribution Needed
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.monthlyContributionNeeded)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          To reach retirement goal
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Zap className="w-4 h-4" />
                          Total Employer Match
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.totalEmployerMatch)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Free money over{' '}
                          {formatYears(results.yearsToRetirement)}
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Investment Growth
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(results.totalInterestEarned)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          From compound returns
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Users className="w-4 h-4" />
                          Savings Multiple
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {results.savingsMultiple.toFixed(1)}×
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Of annual expenses
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
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <LineChartIcon className="w-4 h-4" />
                          Projection
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Breakdown
                        </button>
                        <button
                          onClick={() => setActiveChart('income')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'income'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Income
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
                      {activeChart === 'income' && incomeChartData && (
                        <BarChart
                          data={incomeChartData}
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
                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            Your Retirement Outlook
                          </h4>
                          <p className="text-sm text-gray-600">
                            {results.canRetireComfortably
                              ? `You&apos;re on track! With your current savings and contributions, you&apos;ll have ${formatCurrency(results.totalAtRetirement)} at retirement, which exceeds your goal of ${formatCurrency(results.requiredSavingsAtRetirement)} by ${formatCurrency(results.surplusOrShortfall)}.`
                              : `You currently have a shortfall of ${formatCurrency(results.shortfall)}. You&apos;ll need ${formatCurrency(results.monthlyContributionNeeded)} per month to reach your retirement goal.`}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            Safe Withdrawal Rate
                          </h4>
                          <p className="text-sm text-gray-600">
                            Using the{' '}
                            {formatPercentage(results.withdrawalRate, 1)}{' '}
                            withdrawal rate (based on the 4% rule), you can
                            safely withdraw{' '}
                            {formatCurrency(results.withdrawalAmount)} annually
                            from your portfolio. Combined with Social Security
                            and other income, your total retirement income will
                            be {formatCurrency(results.totalRetirementIncome)}.
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-indigo-600" />
                            Power of Employer Match
                          </h4>
                          <p className="text-sm text-gray-600">
                            Don&apos;t leave free money on the table! Your
                            employer match of{' '}
                            {formatPercentage(employerMatchPercentage, 0)} will
                            contribute{' '}
                            {formatCurrency(results.totalEmployerMatch)} over{' '}
                            {formatYears(results.yearsToRetirement)}. This is
                            essentially a guaranteed return on your investment.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Inflation Adjustment
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your desired income of{' '}
                            {formatCurrency(desiredAnnualIncome)} (in
                            today&apos;s dollars) will need to be{' '}
                            {formatCurrency(results.inflationAdjustedIncome)} at
                            retirement to maintain the same purchasing power,
                            assuming {formatPercentage(inflationRate, 1)} annual
                            inflation.
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
              Understanding Retirement Planning
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Retirement Planning?
                </h3>
                <p className="mb-4">
                  Retirement planning is the process of determining retirement
                  income goals and the actions necessary to achieve those goals.
                  It involves identifying sources of income, estimating
                  expenses, implementing a savings program, and managing assets
                  and risk.
                </p>
                <p className="text-sm">
                  The key to successful retirement is starting early and taking
                  advantage of compound interest. Even small contributions made
                  consistently over time can grow into substantial retirement
                  savings.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The 4% Rule
                </h3>
                <p className="mb-4">
                  The 4% rule is a widely-used guideline for determining a
                  sustainable withdrawal rate in retirement. It suggests that
                  you can safely withdraw 4% of your retirement savings in the
                  first year, then adjust that amount for inflation each
                  subsequent year, with a high probability that your money will
                  last 30 years.
                </p>
                <p className="text-sm">
                  For example, if you have $1,000,000 saved, you could withdraw
                  $40,000 in the first year. If inflation is 3%, you&apos;d
                  withdraw $41,200 the next year, and so on.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Employer Match: Free Money
                </h3>
                <p className="mb-4">
                  An employer match is when your company contributes additional
                  money to your retirement account based on your own
                  contributions. This is literally free money and one of the
                  best ways to accelerate your retirement savings.
                </p>
                <p className="text-sm">
                  For example, if your employer offers a 50% match on
                  contributions up to 6% of your salary, and you earn $75,000:
                  if you contribute $4,500 (6% of salary), your employer adds
                  $2,250. That&apos;s an immediate 50% return on your
                  investment!
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Why Inflation Matters
                </h3>
                <p className="mb-4">
                  Inflation erodes purchasing power over time. What costs
                  $60,000 today will cost significantly more in 30 years. This
                  is why we calculate inflation-adjusted income needs - you need
                  to save more to maintain the same lifestyle in the future.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      At 3% Inflation
                    </h4>
                    <p className="text-sm">
                      $60,000 today = $145,000 in 30 years
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      At 4% Inflation
                    </h4>
                    <p className="text-sm">
                      $60,000 today = $194,000 in 30 years
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pre vs. Post-Retirement Returns
                </h3>
                <p className="mb-4">
                  It&apos;s common to assume different return rates before and
                  after retirement. Before retirement, you typically invest more
                  aggressively for higher returns. After retirement, most people
                  shift to a more conservative allocation to preserve capital.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Pre-Retirement (7-10%):</strong> Higher allocation
                    to stocks for growth
                  </li>
                  <li>
                    • <strong>Post-Retirement (4-6%):</strong> More bonds and
                    stable investments for income
                  </li>
                  <li>
                    • The transition helps protect your savings when you
                    can&apos;t recover from market downturns
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Income Sources in Retirement
                </h3>
                <p className="mb-4">
                  A well-diversified retirement plan includes multiple income
                  sources to reduce reliance on any single source and provide
                  more stability.
                </p>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Portfolio Withdrawals
                    </h4>
                    <p className="text-sm">
                      Your 401(k), IRA, and other investment accounts
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Social Security
                    </h4>
                    <p className="text-sm">
                      Government-provided retirement benefits based on your work
                      history
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Other Income
                    </h4>
                    <p className="text-sm">
                      Pensions, rental income, part-time work, annuities
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Retirement Planning Tips
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Start Early:</strong> The power of compound
                    interest is time - start saving as soon as possible
                  </li>
                  <li>
                    • <strong>Maximize Employer Match:</strong> Always
                    contribute enough to get the full employer match
                  </li>
                  <li>
                    • <strong>Increase Contributions Over Time:</strong> Boost
                    savings rate with raises and bonuses
                  </li>
                  <li>
                    • <strong>Diversify Investments:</strong> Don&apos;t put all
                    eggs in one basket
                  </li>
                  <li>
                    • <strong>Plan for Healthcare:</strong> Medical costs are
                    often the largest expense in retirement
                  </li>
                  <li>
                    • <strong>Consider Longevity:</strong> Plan for a longer
                    life expectancy than you might expect
                  </li>
                  <li>
                    • <strong>Review Annually:</strong> Adjust your plan as life
                    circumstances change
                  </li>
                  <li>
                    • <strong>Don&apos;t Forget Taxes:</strong> Consider tax
                    implications of different retirement accounts
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
