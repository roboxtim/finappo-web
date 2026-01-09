'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ChevronDown,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Info,
  Target,
  Percent,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculatePaybackResults,
  validatePaybackInputs,
  formatPercentage,
  formatCurrency,
  formatPeriod,
  type CashFlow,
  type PaybackInputs,
  type PaybackResults,
  type PeriodType,
} from './__tests__/paybackCalculations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js';
import { Line as LineChart, Bar as BarChart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  ChartLegend,
  Filler
);

export default function PaybackPeriodCalculator() {
  // Input states
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [discountRate, setDiscountRate] = useState<number>(10);
  const [periodType, setPeriodType] = useState<PeriodType>('annual');
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { period: 1, amount: 30000, label: 'Year 1' },
    { period: 2, amount: 40000, label: 'Year 2' },
    { period: 3, amount: 50000, label: 'Year 3' },
    { period: 4, amount: 20000, label: 'Year 4' },
  ]);

  // Results
  const [results, setResults] = useState<PaybackResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<'cumulative' | 'breakdown'>(
    'cumulative'
  );

  // Calculate payback period
  const calculate = useCallback(() => {
    const inputs: PaybackInputs = {
      initialInvestment,
      cashFlows,
      discountRate,
      periodType,
    };

    const validationErrors = validatePaybackInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculatePaybackResults(inputs);
    setResults(calculatedResults);
  }, [initialInvestment, cashFlows, discountRate, periodType]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Add new cash flow
  const addCashFlow = () => {
    const nextPeriod =
      cashFlows.length > 0
        ? Math.max(...cashFlows.map((cf) => cf.period)) + 1
        : 1;
    setCashFlows([
      ...cashFlows,
      {
        period: nextPeriod,
        amount: 0,
        label:
          periodType === 'monthly'
            ? `Month ${nextPeriod}`
            : `Year ${nextPeriod}`,
      },
    ]);
  };

  // Remove cash flow
  const removeCashFlow = (index: number) => {
    const newCashFlows = cashFlows.filter((_, i) => i !== index);
    setCashFlows(newCashFlows);
  };

  // Update cash flow
  const updateCashFlow = (
    index: number,
    field: keyof CashFlow,
    value: number | string
  ) => {
    const newCashFlows = [...cashFlows];
    if (field === 'amount') {
      newCashFlows[index].amount = Number(value) || 0;
    } else if (field === 'period') {
      newCashFlows[index].period = Number(value) || 1;
    } else if (field === 'label') {
      newCashFlows[index].label = String(value);
    }
    setCashFlows(newCashFlows);
  };

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

  // Prepare chart data for cumulative cash flows
  const getCumulativeCashFlowChartData = () => {
    if (!results) return null;

    const labels = [
      'Start',
      ...results.cashFlowSchedule.map((cf) => `Period ${cf.period}`),
    ];
    const simpleCumulative = [
      -initialInvestment,
      ...results.cashFlowSchedule.map((cf) => cf.cumulativeCashFlow),
    ];
    const discountedCumulative = [
      -initialInvestment,
      ...results.cashFlowSchedule.map((cf) => cf.discountedCumulativeCashFlow),
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Simple Cumulative Cash Flow',
          data: simpleCumulative,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Discounted Cumulative Cash Flow',
          data: discountedCumulative,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare chart data for cash flow breakdown
  const getCashFlowBreakdownChartData = () => {
    if (!results) return null;

    const labels = results.cashFlowSchedule.map((cf) => `Period ${cf.period}`);
    const amounts = results.cashFlowSchedule.map((cf) => cf.amount);
    const discountedAmounts = results.cashFlowSchedule.map(
      (cf) => cf.discountedValue
    );

    return {
      labels,
      datasets: [
        {
          label: 'Actual Cash Flow',
          data: amounts,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        },
        {
          label: 'Discounted Cash Flow',
          data: discountedAmounts,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  const cumulativeChartData = getCumulativeCashFlowChartData();
  const breakdownChartData = getCashFlowBreakdownChartData();

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y !== null ? context.parsed.y : 0;
            label += formatCurrency(value);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            const numValue =
              typeof value === 'string' ? parseFloat(value) : value;
            return formatCurrency(numValue);
          },
        },
        grid: {
          color: (context: { tick: { value: number } }) => {
            // Highlight the zero line
            return context.tick.value === 0
              ? 'rgba(0, 0, 0, 0.3)'
              : 'rgba(0, 0, 0, 0.1)';
          },
          lineWidth: (context: { tick: { value: number } }) => {
            return context.tick.value === 0 ? 2 : 1;
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
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.parsed.y !== null ? context.parsed.y : 0;
            label += formatCurrency(value);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            const numValue =
              typeof value === 'string' ? parseFloat(value) : value;
            return formatCurrency(numValue);
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
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Payback Period Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate when your investment breaks even
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
              {/* Basic Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Investment Details
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="100,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Amount of money initially invested
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Rate (for NPV calculation)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={discountRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setDiscountRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        placeholder="10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Annual discount rate for present value calculations
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Period Type
                    </label>
                    <select
                      value={periodType}
                      onChange={(e) =>
                        setPeriodType(e.target.value as PeriodType)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium bg-white"
                    >
                      <option value="annual">Annual</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Time period for cash flows
                    </p>
                  </div>
                </div>
              </div>

              {/* Cash Flows Input */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Cash Flows
                  </h2>
                  <button
                    onClick={addCashFlow}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Period
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {cashFlows.map((cf, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Period
                          </label>
                          <input
                            type="number"
                            value={cf.period}
                            onChange={(e) =>
                              updateCashFlow(index, 'period', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(cf.amount)}
                              onChange={(e) =>
                                updateCashFlow(
                                  index,
                                  'amount',
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-7 pr-3 py-2 rounded-lg text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={cf.label || ''}
                            onChange={(e) =>
                              updateCashFlow(index, 'label', e.target.value)
                            }
                            placeholder={`Period ${cf.period}`}
                            className="w-full px-3 py-2 rounded-lg text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeCashFlow(index)}
                        disabled={cashFlows.length <= 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Enter expected cash inflows for each
                    period. These represent the money you expect to receive back
                    from your investment.
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
              {results && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <Clock className="w-4 h-4" />
                          Simple Payback Period
                        </div>
                        {results.paysBack ? (
                          <>
                            <div className="text-5xl font-bold mb-2">
                              {formatPeriod(
                                results.simplePaybackYears,
                                results.simplePaybackMonths
                              )}
                            </div>
                            <div className="text-sm opacity-75">
                              {results.simplePaybackPeriod?.toFixed(2)} periods
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold mb-2 flex items-center gap-2">
                              <AlertCircle className="w-8 h-8" />
                              Never Pays Back
                            </div>
                            <div className="text-sm opacity-75">
                              Insufficient cash flows
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <Target className="w-4 h-4" />
                          Discounted Payback
                        </div>
                        {results.discountedPaysBack ? (
                          <>
                            <div className="text-5xl font-bold mb-2">
                              {formatPeriod(
                                results.discountedPaybackYears,
                                results.discountedPaybackMonths
                              )}
                            </div>
                            <div className="text-sm opacity-75">
                              {results.discountedPaybackPeriod?.toFixed(2)}{' '}
                              periods
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold mb-2 flex items-center gap-2">
                              <AlertCircle className="w-8 h-8" />
                              Never Pays Back
                            </div>
                            <div className="text-sm opacity-75">
                              With {discountRate}% discount
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Total Cash Inflows
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalCashInflows)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">ROI</div>
                        <div
                          className={`text-xl font-semibold mt-1 ${
                            results.roi >= 0 ? 'text-green-300' : 'text-red-300'
                          }`}
                        >
                          {formatPercentage(results.roi, 2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Net Profit</div>
                        <div
                          className={`text-xl font-semibold mt-1 ${
                            results.profitAfterPayback >= 0
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}
                        >
                          {formatCurrency(results.profitAfterPayback)}
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
                          NPV at {discountRate}%
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            results.npv >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(results.npv)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Net Present Value
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Break-Even Status
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {results.paysBack ? (
                            <span className="flex items-center gap-2">
                              <TrendingUp className="w-6 h-6" />
                              Profitable
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <TrendingDown className="w-6 h-6" />
                              Loss
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Investment outcome
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Return on Investment
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            results.roi >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(results.roi, 2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Total return percentage
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Discount Rate
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPercentage(discountRate, 2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Applied to cash flows
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
                          onClick={() => setActiveChart('cumulative')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            activeChart === 'cumulative'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Break-Even Chart
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            activeChart === 'breakdown'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Cash Flows
                        </button>
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'cumulative' && cumulativeChartData && (
                        <LineChart
                          data={cumulativeChartData}
                          options={lineChartOptions}
                        />
                      )}
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <BarChart
                          data={breakdownChartData}
                          options={barChartOptions}
                        />
                      )}
                    </div>

                    {activeChart === 'cumulative' && (
                      <p className="text-sm text-gray-600 mt-4">
                        The break-even point is where the cumulative cash flow
                        line crosses zero. This shows when your investment is
                        fully recovered.
                      </p>
                    )}
                  </div>

                  {/* Cash Flow Schedule */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Cash Flow Schedule
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                              Period
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                              Label
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                              Cash Flow
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                              Discounted
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                              Cumulative
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100 bg-red-50">
                            <td className="py-3 px-2 text-sm font-medium text-gray-900">
                              0
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600">
                              Initial Investment
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-red-600">
                              {formatCurrency(-initialInvestment)}
                            </td>
                            <td className="py-3 px-2 text-sm text-right text-red-600">
                              {formatCurrency(-initialInvestment)}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-red-600">
                              {formatCurrency(-initialInvestment)}
                            </td>
                          </tr>
                          {results.cashFlowSchedule.map((cf, index) => (
                            <tr
                              key={index}
                              className={`border-b border-gray-100 ${
                                cf.cumulativeCashFlow >= 0 ? 'bg-green-50' : ''
                              }`}
                            >
                              <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                {cf.period}
                              </td>
                              <td className="py-3 px-2 text-sm text-gray-600">
                                {cf.label || `Period ${cf.period}`}
                              </td>
                              <td className="py-3 px-2 text-sm text-right font-medium text-green-600">
                                {formatCurrency(cf.amount)}
                              </td>
                              <td className="py-3 px-2 text-sm text-right text-blue-600">
                                {formatCurrency(cf.discountedValue)}
                              </td>
                              <td
                                className={`py-3 px-2 text-sm text-right font-medium ${
                                  cf.cumulativeCashFlow < 0
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {formatCurrency(cf.cumulativeCashFlow)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200">
                            <td
                              colSpan={2}
                              className="py-3 px-2 text-sm font-semibold text-gray-700"
                            >
                              Total
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-bold text-green-600">
                              {formatCurrency(results.totalCashInflows)}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-bold text-blue-600">
                              {formatCurrency(
                                results.cashFlowSchedule.reduce(
                                  (sum, cf) => sum + cf.discountedValue,
                                  0
                                )
                              )}
                            </td>
                            <td
                              className={`py-3 px-2 text-sm text-right font-bold ${
                                results.profitAfterPayback < 0
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {formatCurrency(results.profitAfterPayback)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
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
                            <Clock className="w-4 h-4 text-purple-600" />
                            Simple Payback Period
                          </h4>
                          <p className="text-sm text-gray-600">
                            {results.paysBack ? (
                              <>
                                Your investment will break even in{' '}
                                {formatPeriod(
                                  results.simplePaybackYears,
                                  results.simplePaybackMonths
                                )}
                                . This is the time it takes to recover your
                                initial investment without considering the time
                                value of money.
                              </>
                            ) : (
                              <>
                                Your investment never pays back based on the
                                current cash flow projections. The total cash
                                inflows (
                                {formatCurrency(results.totalCashInflows)}) are
                                less than your initial investment (
                                {formatCurrency(initialInvestment)}).
                              </>
                            )}
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            Discounted Payback Period
                          </h4>
                          <p className="text-sm text-gray-600">
                            {results.discountedPaysBack ? (
                              <>
                                When accounting for the time value of money at{' '}
                                {discountRate}% discount rate, your investment
                                breaks even in{' '}
                                {formatPeriod(
                                  results.discountedPaybackYears,
                                  results.discountedPaybackMonths
                                )}
                                . This is longer than the simple payback because
                                future cash flows are worth less in today&apos;s
                                dollars.
                              </>
                            ) : (
                              <>
                                With a {discountRate}% discount rate, the
                                present value of your cash flows never recovers
                                the initial investment. This suggests the
                                investment may not meet your required rate of
                                return.
                              </>
                            )}
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Decision Guidelines
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • Shorter payback periods indicate faster capital
                              recovery and lower risk
                            </li>
                            <li>
                              • Compare payback period to your investment
                              horizon and risk tolerance
                            </li>
                            <li>
                              • Discounted payback is more conservative and
                              realistic
                            </li>
                            <li>
                              • Consider payback period alongside ROI, NPV, and
                              IRR for complete analysis
                            </li>
                            <li>
                              • Industry benchmarks vary: technology (2-3
                              years), manufacturing (3-5 years), real estate
                              (7-10 years)
                            </li>
                          </ul>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            Your Investment Metrics
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your total investment of{' '}
                            {formatCurrency(initialInvestment)} will generate{' '}
                            {formatCurrency(results.totalCashInflows)} in cash
                            inflows, resulting in a{' '}
                            {results.profitAfterPayback >= 0
                              ? 'profit'
                              : 'loss'}{' '}
                            of{' '}
                            {formatCurrency(
                              Math.abs(results.profitAfterPayback)
                            )}
                            . This represents a{' '}
                            {formatPercentage(results.roi, 2)} ROI. The NPV at{' '}
                            {discountRate}% is {formatCurrency(results.npv)},
                            indicating the investment
                            {results.npv >= 0 ? ' creates' : ' destroys'} value.
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
              Understanding Payback Period
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Payback Period?
                </h3>
                <p className="mb-4">
                  The payback period is the length of time required to recover
                  the initial investment from the cash inflows generated by an
                  investment. It&apos;s one of the simplest capital budgeting
                  methods and answers the fundamental question: &quot;How long
                  will it take to get my money back?&quot;
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  Payback Period = Initial Investment / Annual Cash Flow (for
                  even flows)
                  <br />
                  <br />
                  For uneven flows: Cumulative cash flow turns positive
                </div>
                <p className="text-sm">
                  For example, if you invest $100,000 and receive $20,000 per
                  year, the payback period is 5 years ($100,000 / $20,000).
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Simple vs Discounted Payback Period
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Aspect
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Simple Payback
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Discounted Payback
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">
                          Time Value of Money
                        </td>
                        <td className="py-3 px-4">Not considered</td>
                        <td className="py-3 px-4">
                          Considered via discount rate
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Calculation</td>
                        <td className="py-3 px-4">Uses nominal cash flows</td>
                        <td className="py-3 px-4">
                          Uses present value of cash flows
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Result</td>
                        <td className="py-3 px-4">
                          Shorter period (optimistic)
                        </td>
                        <td className="py-3 px-4">Longer period (realistic)</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Best For</td>
                        <td className="py-3 px-4">Quick screening</td>
                        <td className="py-3 px-4">Detailed analysis</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Example</td>
                        <td className="py-3 px-4">
                          $100 investment, $20/yr = 5 years
                        </td>
                        <td className="py-3 px-4">
                          Same at 10% discount = 7.27 years
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When to Use Payback Period Analysis
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Quick Investment Screening:</strong> Rapidly
                      evaluate if an investment meets minimum recovery time
                      requirements.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>High Risk Environments:</strong> When faster
                      capital recovery is critical due to uncertainty or rapid
                      technological change.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Liquidity Constraints:</strong> When cash flow
                      recovery timing is more important than total
                      profitability.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Comparing Similar Projects:</strong> Choosing
                      between investments with similar returns but different
                      timing.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Capital Budgeting:</strong> Supplementing other
                      metrics like NPV and IRR for comprehensive analysis.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Payback Period vs Other Metrics
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      vs NPV (Net Present Value)
                    </h4>
                    <p className="text-sm">
                      Payback shows timing of recovery; NPV shows total value
                      created. Use payback for risk assessment and NPV for
                      profitability.
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      vs IRR (Internal Rate of Return)
                    </h4>
                    <p className="text-sm">
                      Payback measures recovery time; IRR measures rate of
                      return. IRR considers all cash flows; payback only until
                      recovery.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">vs ROI</h4>
                    <p className="text-sm">
                      Payback measures time to recover investment; ROI measures
                      percentage return. Payback ignores profits after recovery.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      vs Profitability Index
                    </h4>
                    <p className="text-sm">
                      Payback focuses on speed of recovery; PI measures value
                      per dollar invested. Both useful for different decision
                      criteria.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Decision Rules Using Payback Period
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Set Maximum Acceptable Payback:</strong> Determine
                      your organization&apos;s or personal maximum acceptable
                      payback period based on strategy and risk tolerance.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Accept if Payback &lt; Maximum:</strong> If
                      calculated payback period is less than your maximum,
                      consider accepting the investment (subject to other
                      criteria).
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Reject if Payback &gt; Maximum:</strong> If
                      payback exceeds your threshold or never occurs, reject the
                      investment.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Rank Multiple Projects:</strong> When choosing
                      among several investments, prefer those with shorter
                      payback periods (assuming similar risk).
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">5.</span>
                    <div>
                      <strong>Consider Context:</strong> Adjust decision
                      criteria based on industry norms, economic conditions, and
                      strategic importance.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Industry-Specific Payback Benchmarks
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Technology/Software</span>
                    <span className="font-bold text-purple-600">2-3 years</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Manufacturing Equipment</span>
                    <span className="font-bold text-purple-600">3-5 years</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Energy Projects</span>
                    <span className="font-bold text-purple-600">5-7 years</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Real Estate</span>
                    <span className="font-bold text-purple-600">
                      7-10 years
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">R&D Investments</span>
                    <span className="font-bold text-purple-600">
                      5-10 years
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Retail/Restaurant</span>
                    <span className="font-bold text-purple-600">2-4 years</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Note: These are typical ranges and can vary significantly
                  based on specific circumstances, market conditions, and risk
                  profiles.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Limitations of Payback Period Method
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Ignores Cash Flows After Payback:</strong> Does not
                    consider profits generated after the investment is
                    recovered, potentially rejecting highly profitable long-term
                    projects.
                  </li>
                  <li>
                    <strong>No Time Value (Simple Version):</strong> Standard
                    payback doesn&apos;t account for time value of money,
                    treating $1 today the same as $1 in 10 years.
                  </li>
                  <li>
                    <strong>Arbitrary Cutoff Period:</strong> Maximum acceptable
                    payback is subjective and may not align with value creation.
                  </li>
                  <li>
                    <strong>Favors Short-Term Projects:</strong> Bias toward
                    quick returns may cause rejection of valuable long-term
                    investments.
                  </li>
                  <li>
                    <strong>No Risk Consideration:</strong> Doesn&apos;t
                    explicitly factor in project risk or uncertainty of cash
                    flows.
                  </li>
                  <li>
                    <strong>Not Comprehensive:</strong> Should be used alongside
                    NPV, IRR, and other metrics for complete investment
                    analysis.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Best Practices for Payback Period Analysis
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Use Discounted Payback:</strong> Always calculate
                      discounted payback period to account for time value of
                      money and get more realistic results.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Combine with Other Metrics:</strong> Never rely
                      solely on payback period. Use it alongside NPV, IRR, and
                      ROI for comprehensive analysis.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Conservative Cash Flow Estimates:</strong> Use
                      realistic or conservative projections to avoid
                      overestimating returns.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Consider Strategic Value:</strong> Some
                      investments with longer payback may be strategically
                      important despite not meeting strict financial criteria.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Sensitivity Analysis:</strong> Test how changes in
                      key assumptions (cash flows, discount rate) affect payback
                      period.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Regular Monitoring:</strong> Track actual vs
                      projected cash flows and update payback calculations as
                      needed.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • Payback period is a supplementary metric, not a standalone
                    decision tool
                  </li>
                  <li>
                    • Shorter payback periods generally indicate lower risk but
                    may miss long-term value
                  </li>
                  <li>
                    • Always use discounted payback for investments longer than
                    2-3 years
                  </li>
                  <li>
                    • Consider industry benchmarks but adjust for specific
                    circumstances
                  </li>
                  <li>
                    • Cash flow timing can be as important as total returns for
                    some organizations
                  </li>
                  <li>
                    • Consult financial advisors for significant investment
                    decisions
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
