'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ChevronDown,
  DollarSign,
  Calendar,
  Percent,
  Info,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Clock,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateFVResults,
  validateFVInputs,
  formatCurrency,
  formatPercentage,
  formatPeriodLabel,
  getFrequencyDisplayName,
  type FVInputs,
  type FVResults,
  type PaymentTiming,
  type PaymentFrequency,
} from './__tests__/fvCalculations';
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

export default function FutureValueCalculator() {
  // Input states
  const [presentValue, setPresentValue] = useState<number>(10000);
  const [periodicPayment, setPeriodicPayment] = useState<number>(500);
  const [periods, setPeriods] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [paymentFrequency, setPaymentFrequency] =
    useState<PaymentFrequency>('annual');
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>('end');
  const [growthRate, setGrowthRate] = useState<number>(0);

  // Results
  const [results, setResults] = useState<FVResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'breakdown' | 'growth' | 'periods'
  >('breakdown');

  // Calculate Future Value
  const calculate = useCallback(() => {
    const inputs: FVInputs = {
      presentValue: presentValue || undefined,
      periodicPayment: periodicPayment || undefined,
      periods,
      interestRate,
      paymentFrequency,
      paymentTiming,
      growthRate: growthRate > 0 ? growthRate : undefined,
    };

    const validationErrors = validateFVInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateFVResults(inputs);
    setResults(calculatedResults);
  }, [
    presentValue,
    periodicPayment,
    periods,
    interestRate,
    paymentFrequency,
    paymentTiming,
    growthRate,
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

  // Prepare breakdown chart data (Pie chart)
  const getBreakdownChartData = () => {
    if (!results) return null;

    const data = [];
    const labels = [];
    const colors = [];

    if (results.presentValue > 0) {
      data.push(results.presentValue);
      labels.push('Starting Amount');
      colors.push('rgba(99, 102, 241, 0.8)');
    }

    if (results.totalPayments > 0) {
      data.push(results.totalPayments);
      labels.push('Total Contributions');
      colors.push('rgba(16, 185, 129, 0.8)');
    }

    if (results.totalInterest > 0) {
      data.push(results.totalInterest);
      labels.push('Total Interest');
      colors.push('rgba(251, 146, 60, 0.8)');
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

  // Prepare growth chart data (Line chart showing balance growth)
  const getGrowthChartData = () => {
    if (!results || results.periodBreakdown.length === 0) return null;

    const labels = [
      'Start',
      ...results.periodBreakdown.map((p) =>
        formatPeriodLabel(p.period, paymentFrequency)
      ),
    ];

    const startingValue = results.presentValue;
    const balanceData = [
      startingValue,
      ...results.periodBreakdown.map((p) => p.endingBalance),
    ];

    const contributionData = [
      startingValue,
      ...results.periodBreakdown.map((p) => p.contribution),
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Balance with Interest',
          data: balanceData,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Total Contributions',
          data: contributionData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          borderDash: [5, 5],
        },
      ],
    };
  };

  // Prepare period chart data (Bar chart showing payments and interest per period)
  const getPeriodsChartData = () => {
    if (!results || results.periodBreakdown.length === 0) return null;

    // Limit to first 20 periods for readability
    const displayPeriods = results.periodBreakdown.slice(0, 20);

    const labels = displayPeriods.map((p) =>
      formatPeriodLabel(p.period, paymentFrequency)
    );
    const payments = displayPeriods.map((p) => p.payment);
    const interest = displayPeriods.map((p) => p.interest);

    return {
      labels,
      datasets: [
        {
          label: 'Payment',
          data: payments,
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        },
        {
          label: 'Interest Earned',
          data: interest,
          backgroundColor: 'rgba(251, 146, 60, 0.6)',
          borderColor: 'rgb(251, 146, 60)',
          borderWidth: 1,
        },
      ],
    };
  };

  const breakdownChartData = getBreakdownChartData();
  const growthChartData = getGrowthChartData();
  const periodsChartData = getPeriodsChartData();

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
                Future Value Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate the future value of your investments
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
              {/* Starting Amount */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Starting Amount
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
                      Present Value (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(presentValue)}
                        onChange={(e) =>
                          setPresentValue(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="10,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Initial lump sum investment
                    </p>
                  </div>
                </div>
              </div>

              {/* Periodic Payments */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Periodic Contributions
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Periodic Payment (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(periodicPayment)}
                        onChange={(e) =>
                          setPeriodicPayment(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Regular contribution amount per period
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Timing
                    </label>
                    <select
                      value={paymentTiming}
                      onChange={(e) =>
                        setPaymentTiming(e.target.value as PaymentTiming)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium bg-white"
                      disabled={!periodicPayment || periodicPayment === 0}
                    >
                      <option value="end">
                        End of Period (Ordinary Annuity)
                      </option>
                      <option value="beginning">
                        Beginning of Period (Annuity Due)
                      </option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      When contributions occur in each period
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Growth Rate per Year (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={growthRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setGrowthRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="0"
                        disabled={!periodicPayment || periodicPayment === 0}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Annual growth rate for increasing contributions
                    </p>
                  </div>
                </div>
              </div>

              {/* Time and Rate Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Time and Rate
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Periods
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={periods || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setPeriods(value ? Number(value) : 0);
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="10"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Total number of {paymentFrequency} periods
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={paymentFrequency}
                      onChange={(e) =>
                        setPaymentFrequency(e.target.value as PaymentFrequency)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium bg-white"
                    >
                      <option value="annual">Annual</option>
                      <option value="semi-annual">Semi-Annual</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Compounding frequency
                    </p>
                  </div>

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
                          setInterestRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="6"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Expected annual return rate
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
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Target className="w-4 h-4" />
                      Total Future Value
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.totalFutureValue)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Value after {periods}{' '}
                      {getFrequencyDisplayName(paymentFrequency).toLowerCase()}{' '}
                      period{periods !== 1 ? 's' : ''}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Starting Amount
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.presentValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Contributions</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalPayments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          Interest Earned
                        </div>
                        <div className="text-xl font-semibold mt-1 text-green-300">
                          {formatCurrency(results.totalInterest)}
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
                          Total Contributions
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalContributions)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Starting + all payments
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Zap className="w-4 h-4" />
                          Compound Factor
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {results.compoundFactor.toFixed(4)}×
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Growth multiplier
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Periodic Rate
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatPercentage(results.periodicRate, 3)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Per {paymentFrequency} period
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Effective Annual Rate
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(results.effectiveAnnualRate, 2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          True annual return
                        </div>
                      </div>

                      {results.isGrowingAnnuity && (
                        <>
                          <div className="bg-pink-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <TrendingUp className="w-4 h-4" />
                              Growth Rate
                            </div>
                            <div className="text-2xl font-bold text-pink-600">
                              {formatPercentage(results.growthRate!, 2)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Payment increase rate
                            </div>
                          </div>

                          <div className="bg-orange-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Clock className="w-4 h-4" />
                              Total Future Payments
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                              {formatCurrency(results.totalFuturePayments!)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Sum of growing payments
                            </div>
                          </div>
                        </>
                      )}
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
                          onClick={() => setActiveChart('growth')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'growth'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <LineChartIcon className="w-4 h-4" />
                          Growth
                        </button>
                        {results.periodicPayment > 0 && (
                          <button
                            onClick={() => setActiveChart('periods')}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                              activeChart === 'periods'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                            Periods
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={pieChartOptions}
                        />
                      )}
                      {activeChart === 'growth' && growthChartData && (
                        <LineChart
                          data={growthChartData}
                          options={lineChartOptions}
                        />
                      )}
                      {activeChart === 'periods' && periodsChartData && (
                        <BarChart
                          data={periodsChartData}
                          options={barChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Period Breakdown Table */}
                  {results.periodBreakdown.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Period-by-Period Breakdown
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                                Period
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                Payment
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                Interest
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                Ending Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.periodBreakdown
                              .slice(0, 20)
                              .map((period, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-100"
                                >
                                  <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                    {formatPeriodLabel(
                                      period.period,
                                      paymentFrequency
                                    )}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-right text-green-600 font-medium">
                                    {formatCurrency(period.payment)}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-right text-orange-600 font-medium">
                                    {formatCurrency(period.interest)}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-right text-purple-600 font-bold">
                                    {formatCurrency(period.endingBalance)}
                                  </td>
                                </tr>
                              ))}
                            {results.periodBreakdown.length > 20 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="py-3 px-2 text-sm text-center text-gray-500 italic"
                                >
                                  Showing first 20 of{' '}
                                  {results.periodBreakdown.length} periods
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
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
                            What is Future Value?
                          </h4>
                          <p className="text-sm text-gray-600">
                            Future Value (FV) is the value of your investment at
                            a specified future date, accounting for compound
                            interest. Your total FV of{' '}
                            {formatCurrency(results.totalFutureValue)} is what
                            your investment will grow to after {periods}{' '}
                            {getFrequencyDisplayName(
                              paymentFrequency
                            ).toLowerCase()}{' '}
                            period{periods !== 1 ? 's' : ''}.
                          </p>
                        </div>

                        {results.presentValue > 0 && (
                          <div className="bg-indigo-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-indigo-600" />
                              Lump Sum Growth
                            </h4>
                            <p className="text-sm text-gray-600">
                              Your starting amount of{' '}
                              {formatCurrency(results.presentValue)} will grow
                              to {formatCurrency(results.fvOfLumpSum)}, earning{' '}
                              {formatCurrency(
                                results.fvOfLumpSum - results.presentValue
                              )}{' '}
                              in interest. That&apos;s a{' '}
                              {results.compoundFactor.toFixed(2)}× multiplier!
                            </p>
                          </div>
                        )}

                        {results.periodicPayment > 0 && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-600" />
                              {results.isGrowingAnnuity
                                ? 'Growing Annuity'
                                : results.paymentTiming === 'beginning'
                                  ? 'Annuity Due'
                                  : 'Ordinary Annuity'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {results.isGrowingAnnuity ? (
                                <>
                                  Your contributions grow at{' '}
                                  {formatPercentage(results.growthRate!, 2)} per
                                  year. The total future value of all payments
                                  is{' '}
                                  {formatCurrency(results.totalFuturePayments!)}
                                  , and they will grow to{' '}
                                  {formatCurrency(results.fvOfAnnuity)}.
                                </>
                              ) : (
                                <>
                                  Your {results.numberOfPeriods} contributions
                                  of {formatCurrency(results.periodicPayment)}{' '}
                                  each (total:{' '}
                                  {formatCurrency(results.totalPayments)}) will
                                  grow to {formatCurrency(results.fvOfAnnuity)}.
                                  Payments occur at the {results.paymentTiming}{' '}
                                  of each period.
                                </>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="bg-orange-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-600" />
                            Power of Compound Interest
                          </h4>
                          <p className="text-sm text-gray-600">
                            You&apos;ll contribute a total of{' '}
                            {formatCurrency(results.totalContributions)}, but
                            through compound interest at{' '}
                            {formatPercentage(interestRate, 2)} annually,
                            you&apos;ll earn{' '}
                            {formatCurrency(results.totalInterest)} in interest.
                            That&apos;s{' '}
                            {(
                              (results.totalInterest /
                                results.totalContributions) *
                              100
                            ).toFixed(1)}
                            % growth!
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Why This Matters
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Use FV to set retirement savings goals</li>
                            <li>
                              • Plan for major purchases or education expenses
                            </li>
                            <li>
                              • Understand the long-term impact of regular
                              saving
                            </li>
                            <li>
                              • See how compound interest accelerates wealth
                              building
                            </li>
                            <li>
                              • Compare different investment strategies and time
                              horizons
                            </li>
                          </ul>
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
              Understanding Future Value
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Future Value?
                </h3>
                <p className="mb-4">
                  Future Value (FV) is a fundamental concept in finance that
                  calculates what an investment made today will be worth at a
                  specified future date, assuming a certain rate of return. The
                  core principle is that money has time value - a dollar today
                  can be invested to earn interest, making it worth more in the
                  future.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  FV = PV × (1 + r)^n
                  <br />
                  <br />
                  Where:
                  <br />
                  • PV = Present Value (starting amount)
                  <br />
                  • r = Interest rate per period
                  <br />• n = Number of periods
                </div>
                <p className="text-sm">
                  For example, if you invest $10,000 today at 6% annual interest
                  for 10 years, the future value is $17,908.48. This means your
                  $10,000 investment will grow by $7,908.48 through compound
                  interest.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Types of Future Value Calculations
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      1. FV of a Lump Sum
                    </h4>
                    <p className="text-sm">
                      Calculates how a single investment grows over time through
                      compound interest. Perfect for windfalls, bonuses, or
                      one-time investments.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      2. FV of an Ordinary Annuity
                    </h4>
                    <p className="text-sm">
                      Calculates the future value of regular payments made at
                      the end of each period. Common for 401(k) contributions,
                      monthly savings, and investment plans.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      3. FV of an Annuity Due
                    </h4>
                    <p className="text-sm">
                      Similar to ordinary annuity but payments occur at the
                      beginning of each period. Worth more because each payment
                      earns an extra period of interest. Used for rent payments
                      or investments made at period start.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      4. FV of a Growing Annuity
                    </h4>
                    <p className="text-sm">
                      Calculates FV when regular payments increase at a constant
                      rate over time. Useful for salary-based savings where
                      contributions grow with raises, or dividend reinvestment
                      with growing dividends.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Power of Compound Interest
                </h3>
                <p className="mb-4">
                  Compound interest is often called the &quot;eighth wonder of
                  the world&quot; because it allows your money to grow
                  exponentially. Unlike simple interest (calculated only on the
                  principal), compound interest is calculated on both the
                  principal and accumulated interest.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Time is Your Greatest Asset
                    </h4>
                    <p className="text-sm">
                      The longer your money compounds, the more dramatic the
                      growth. Starting early, even with small amounts, often
                      beats larger contributions made later.
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Frequency Matters
                    </h4>
                    <p className="text-sm">
                      More frequent compounding (daily vs annually) results in
                      slightly higher returns. The effective annual rate
                      accounts for this compounding frequency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Real-World Applications
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Retirement Planning:</strong> Calculate how much
                      your 401(k) or IRA will be worth at retirement based on
                      current balance and regular contributions.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Education Savings:</strong> Determine if your 529
                      plan contributions will meet future college costs.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Emergency Fund:</strong> See how your savings
                      account will grow with regular deposits and interest.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Investment Goals:</strong> Plan for major
                      purchases like a house down payment or dream vacation.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">5.</span>
                    <div>
                      <strong>Business Growth:</strong> Project business
                      expansion funds or equipment replacement reserves.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  FV vs PV: Understanding the Relationship
                </h3>
                <p className="mb-4">
                  Future Value (FV) and Present Value (PV) are inverse concepts
                  - they&apos;re two sides of the same coin in time value of
                  money calculations:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Future Value (FV)
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• What your money will grow to</li>
                      <li>• Used for goal setting and planning</li>
                      <li>• Answers: &quot;How much will I have?&quot;</li>
                      <li>• Multiplies by (1 + r)^n</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Present Value (PV)
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• What future money is worth today</li>
                      <li>• Used for valuation and comparison</li>
                      <li>• Answers: &quot;What do I need to invest?&quot;</li>
                      <li>• Divides by (1 + r)^n</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Maximizing Your Future Value
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <div>
                      <strong>Start Early:</strong> Time is the most powerful
                      variable in compound interest. Starting 10 years earlier
                      can double or triple your final amount.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <div>
                      <strong>Increase Contributions Over Time:</strong> Use a
                      growing annuity approach by increasing contributions with
                      raises or bonuses.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <div>
                      <strong>Maximize Return Rate:</strong> Even a 1-2%
                      difference in return rate can result in thousands of
                      dollars over long periods.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <div>
                      <strong>Contribute Regularly:</strong> Dollar-cost
                      averaging through regular contributions often beats trying
                      to time the market.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <div>
                      <strong>Reinvest Dividends/Interest:</strong> Compounding
                      works best when returns are reinvested rather than
                      withdrawn.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • FV calculations assume constant interest rates, but actual
                    returns vary
                  </li>
                  <li>
                    • Inflation reduces the purchasing power of future dollars
                  </li>
                  <li>• Consider taxes on investment gains in your planning</li>
                  <li>
                    • Higher returns often mean higher risk - balance growth
                    goals with risk tolerance
                  </li>
                  <li>
                    • Account for fees and expenses that reduce actual returns
                  </li>
                  <li>
                    • Regular monitoring and rebalancing helps keep you on track
                  </li>
                  <li>
                    • FV is a projection, not a guarantee - diversify your
                    investments
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
