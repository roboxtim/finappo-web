'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  ChevronDown,
  Calendar,
  Percent,
  Info,
  TrendingDown,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculatePVResults,
  validatePVInputs,
  formatCurrency,
  formatPercentage,
  formatPeriodLabel,
  getFrequencyDisplayName,
  type PVInputs,
  type PVResults,
  type PaymentTiming,
  type PaymentFrequency,
} from './__tests__/pvCalculations';
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

export default function PresentValueCalculator() {
  // Input states
  const [futureValue, setFutureValue] = useState<number>(10000);
  const [periodicPayment, setPeriodicPayment] = useState<number>(1000);
  const [periods, setPeriods] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [paymentFrequency, setPaymentFrequency] =
    useState<PaymentFrequency>('annual');
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>('end');
  const [growthRate, setGrowthRate] = useState<number>(0);

  // Results
  const [results, setResults] = useState<PVResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'breakdown' | 'timeline' | 'comparison'
  >('breakdown');

  // Calculate Present Value
  const calculate = useCallback(() => {
    const inputs: PVInputs = {
      futureValue: futureValue || undefined,
      periodicPayment: periodicPayment || undefined,
      periods,
      interestRate,
      paymentFrequency,
      paymentTiming,
      growthRate: growthRate > 0 ? growthRate : undefined,
    };

    const validationErrors = validatePVInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculatePVResults(inputs);
    setResults(calculatedResults);
  }, [
    futureValue,
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

    if (results.pvOfLumpSum > 0) {
      data.push(results.pvOfLumpSum);
      labels.push('PV of Lump Sum');
      colors.push('rgba(99, 102, 241, 0.8)');
    }

    if (results.pvOfAnnuity > 0) {
      data.push(results.pvOfAnnuity);
      labels.push('PV of Annuity');
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

  // Prepare timeline chart data (Bar chart showing period breakdown)
  const getTimelineChartData = () => {
    if (!results || results.periodBreakdown.length === 0) return null;

    const labels = results.periodBreakdown.map((p) =>
      formatPeriodLabel(p.period, paymentFrequency)
    );
    const payments = results.periodBreakdown.map((p) => p.payment);
    const pvValues = results.periodBreakdown.map((p) => p.presentValue);

    return {
      labels,
      datasets: [
        {
          label: 'Future Payment',
          data: payments,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Present Value',
          data: pvValues,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare comparison chart data (Line chart showing cumulative PV)
  const getComparisonChartData = () => {
    if (!results || results.periodBreakdown.length === 0) return null;

    const labels = [
      'Start',
      ...results.periodBreakdown.map((p) =>
        formatPeriodLabel(p.period, paymentFrequency)
      ),
    ];
    const cumulativePV = [
      0,
      ...results.periodBreakdown.map((p) => p.cumulativePV),
    ];

    // Calculate what would happen without discounting
    let cumulativeUndiscounted = 0;
    const undiscountedData = [0];
    for (const p of results.periodBreakdown) {
      cumulativeUndiscounted += p.payment;
      undiscountedData.push(cumulativeUndiscounted);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Cumulative PV (Discounted)',
          data: cumulativePV,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Cumulative Without Discount',
          data: undiscountedData,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          borderDash: [5, 5],
        },
      ],
    };
  };

  const breakdownChartData = getBreakdownChartData();
  const timelineChartData = getTimelineChartData();
  const comparisonChartData = getComparisonChartData();

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
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Present Value Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate the present value of future cash flows
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
              {/* Future Value Input */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Future Lump Sum
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
                      Future Value (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(futureValue)}
                        onChange={(e) =>
                          setFutureValue(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="10,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Amount you expect to receive in the future
                    </p>
                  </div>
                </div>
              </div>

              {/* Annuity Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Periodic Payments
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
                        placeholder="1,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Regular payment amount per period
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
                      When payments occur in each period
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
                      Annual growth rate for increasing payments
                    </p>
                  </div>
                </div>
              </div>

              {/* Common Inputs */}
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
                      How often payments occur
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Interest/Discount Rate
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
                      Annual discount/interest rate
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
                      Total Present Value
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.totalPresentValue)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Value today of all future cash flows
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      {results.pvOfLumpSum > 0 && (
                        <div>
                          <div className="text-sm opacity-75">
                            PV of Lump Sum
                          </div>
                          <div className="text-xl font-semibold mt-1">
                            {formatCurrency(results.pvOfLumpSum)}
                          </div>
                        </div>
                      )}
                      {results.pvOfAnnuity > 0 && (
                        <div>
                          <div className="text-sm opacity-75">
                            PV of Annuity
                          </div>
                          <div className="text-xl font-semibold mt-1">
                            {formatCurrency(results.pvOfAnnuity)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Key Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      {results.futureValue > 0 && (
                        <>
                          <div className="bg-purple-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <DollarSign className="w-4 h-4" />
                              Future Value
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(results.futureValue)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Amount in the future
                            </div>
                          </div>

                          <div className="bg-indigo-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Percent className="w-4 h-4" />
                              Discount
                            </div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {formatPercentage(results.discountPercentage, 2)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Time value discount
                            </div>
                          </div>
                        </>
                      )}

                      {results.periodicPayment > 0 && (
                        <>
                          <div className="bg-blue-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Calendar className="w-4 h-4" />
                              Total Payments
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(results.totalPayments)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Sum of all payments
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <TrendingDown className="w-4 h-4" />
                              Annuity Discount
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(results.annuityDiscountAmount)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Time value of money
                            </div>
                          </div>
                        </>
                      )}

                      <div className="bg-orange-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Periodic Rate
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatPercentage(results.periodicRate, 3)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getFrequencyDisplayName(paymentFrequency)} rate
                        </div>
                      </div>

                      <div className="bg-pink-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          Periods
                        </div>
                        <div className="text-2xl font-bold text-pink-600">
                          {results.numberOfPeriods}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getFrequencyDisplayName(paymentFrequency)} periods
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visualizations */}
                  {results.periodicPayment > 0 &&
                    results.periodBreakdown.length > 0 && (
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
                              onClick={() => setActiveChart('timeline')}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                                activeChart === 'timeline'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <BarChart3 className="w-4 h-4" />
                              Timeline
                            </button>
                            <button
                              onClick={() => setActiveChart('comparison')}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                                activeChart === 'comparison'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <LineChartIcon className="w-4 h-4" />
                              Cumulative
                            </button>
                          </div>
                        </div>

                        <div className="h-80">
                          {activeChart === 'breakdown' &&
                            breakdownChartData && (
                              <PieChart
                                data={breakdownChartData}
                                options={pieChartOptions}
                              />
                            )}
                          {activeChart === 'timeline' && timelineChartData && (
                            <BarChart
                              data={timelineChartData}
                              options={barChartOptions}
                            />
                          )}
                          {activeChart === 'comparison' &&
                            comparisonChartData && (
                              <LineChart
                                data={comparisonChartData}
                                options={lineChartOptions}
                              />
                            )}
                        </div>
                      </div>
                    )}

                  {/* Period Breakdown Table */}
                  {results.periodicPayment > 0 &&
                    results.periodBreakdown.length > 0 && (
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
                                  Discount Factor
                                </th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                  Present Value
                                </th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                  Cumulative PV
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.periodBreakdown.map((period, index) => (
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
                                  <td className="py-3 px-2 text-sm text-right text-gray-600">
                                    {period.discountFactor.toFixed(6)}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-right text-blue-600 font-medium">
                                    {formatCurrency(period.presentValue)}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-right text-purple-600 font-bold">
                                    {formatCurrency(period.cumulativePV)}
                                  </td>
                                </tr>
                              ))}
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
                            What is Present Value?
                          </h4>
                          <p className="text-sm text-gray-600">
                            Present Value (PV) is the current worth of a future
                            sum of money or stream of cash flows, given a
                            specified rate of return (discount rate). Your total
                            PV of {formatCurrency(results.totalPresentValue)}{' '}
                            represents what all your future cash flows are worth
                            in today&apos;s dollars.
                          </p>
                        </div>

                        {results.futureValue > 0 && (
                          <div className="bg-indigo-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-indigo-600" />
                              Lump Sum Discount
                            </h4>
                            <p className="text-sm text-gray-600">
                              Your future value of{' '}
                              {formatCurrency(results.futureValue)} is worth{' '}
                              {formatCurrency(results.pvOfLumpSum)} today, a
                              discount of{' '}
                              {formatPercentage(results.discountPercentage, 2)}.
                              This reflects the time value of money - a dollar
                              today is worth more than a dollar in the future.
                            </p>
                          </div>
                        )}

                        {results.periodicPayment > 0 && (
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              {results.isGrowingAnnuity
                                ? 'Growing Annuity'
                                : results.paymentTiming === 'beginning'
                                  ? 'Annuity Due'
                                  : 'Ordinary Annuity'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {results.isGrowingAnnuity ? (
                                <>
                                  Your payments grow at{' '}
                                  {formatPercentage(results.growthRate!, 2)} per
                                  year. The total future payments of{' '}
                                  {formatCurrency(results.totalFuturePayments!)}{' '}
                                  are worth{' '}
                                  {formatCurrency(results.pvOfAnnuity)} today.
                                </>
                              ) : (
                                <>
                                  Your {results.numberOfPeriods} payments of{' '}
                                  {formatCurrency(results.periodicPayment)} each
                                  (total:{' '}
                                  {formatCurrency(results.totalPayments)}) are
                                  worth {formatCurrency(results.pvOfAnnuity)}{' '}
                                  today. Payments occur at the{' '}
                                  {results.paymentTiming} of each period.
                                </>
                              )}
                            </p>
                          </div>
                        )}

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-green-600" />
                            Why This Matters
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • Use PV to compare investment opportunities
                              fairly
                            </li>
                            <li>
                              • Determine how much to invest today to reach
                              future goals
                            </li>
                            <li>
                              • Evaluate whether a series of payments is worth
                              more or less than a lump sum
                            </li>
                            <li>
                              • Account for the time value of money in financial
                              decisions
                            </li>
                            <li>
                              • Compare offers with different payment structures
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

      {/* Educational Section - Keeping it shorter due to length */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Present Value
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Present Value?
                </h3>
                <p className="mb-4">
                  Present Value (PV) is a fundamental concept in finance that
                  determines the current worth of a future sum of money or
                  stream of cash flows, given a specified rate of return
                  (discount rate). The core principle is that money available
                  today is worth more than the same amount in the future due to
                  its potential earning capacity.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  PV = FV / (1 + r)^n
                  <br />
                  <br />
                  Where:
                  <br />
                  • FV = Future Value
                  <br />
                  • r = Interest/Discount rate per period
                  <br />• n = Number of periods
                </div>
                <p className="text-sm">
                  For example, if you&apos;re promised $10,000 in 5 years and
                  the discount rate is 6%, the present value is $7,472.58. This
                  means you should be indifferent between receiving $7,472.58
                  today or $10,000 in 5 years.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Types of Present Value Calculations
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      1. PV of a Lump Sum
                    </h4>
                    <p className="text-sm">
                      Calculates the present value of a single future payment.
                      Used for evaluating one-time future cash flows like bond
                      maturity values or sale proceeds.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      2. PV of an Ordinary Annuity
                    </h4>
                    <p className="text-sm">
                      Calculates the present value of a series of equal payments
                      made at the end of each period. Common for loan payments,
                      lease payments, and bond coupons.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      3. PV of an Annuity Due
                    </h4>
                    <p className="text-sm">
                      Similar to ordinary annuity but payments occur at the
                      beginning of each period. Used for rent payments,
                      insurance premiums, and some leases. Worth more than an
                      ordinary annuity due to earlier payment timing.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      4. PV of a Growing Annuity
                    </h4>
                    <p className="text-sm">
                      Calculates PV when payments increase at a constant rate
                      over time. Useful for evaluating pension plans with
                      cost-of-living adjustments or dividend streams expected to
                      grow.
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
                      <strong>Retirement Planning:</strong> Determine how much
                      to save today to have a specific amount at retirement.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Investment Evaluation:</strong> Compare different
                      investment opportunities by calculating their present
                      values.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Lottery Winnings:</strong> Decide between a lump
                      sum payment or annuity option by comparing present values.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Business Valuation:</strong> Value companies based
                      on projected future cash flows discounted to present.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">5.</span>
                    <div>
                      <strong>Structured Settlements:</strong> Evaluate
                      settlement offers by calculating the present value of
                      payment streams.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • The discount rate should reflect the opportunity cost of
                    capital and risk
                  </li>
                  <li>
                    • Higher discount rates result in lower present values
                  </li>
                  <li>
                    • PV calculations assume cash flows occur as scheduled
                  </li>
                  <li>
                    • Consider tax implications when making investment decisions
                  </li>
                  <li>
                    • Inflation can significantly impact the real value of
                    future cash flows
                  </li>
                  <li>
                    • Always compare PV calculations with the same discount rate
                    and time period
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
