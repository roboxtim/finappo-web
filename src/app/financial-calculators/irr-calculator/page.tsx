'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  ChevronDown,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Info,
  Target,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateIRRResults,
  validateIRRInputs,
  formatPercentage,
  formatCurrency,
  type CashFlow,
  type IRRInputs,
  type IRRResults,
} from './__tests__/irrCalculations';
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

export default function IRRCalculator() {
  // Cash flow management
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { period: 0, amount: -100000, label: 'Initial Investment' },
    { period: 1, amount: 30000, label: 'Year 1' },
    { period: 2, amount: 40000, label: 'Year 2' },
    { period: 3, amount: 50000, label: 'Year 3' },
    { period: 4, amount: 20000, label: 'Year 4' },
  ]);

  // MIRR rates
  const [financeRate, setFinanceRate] = useState<number>(10);
  const [reinvestmentRate, setReinvestmentRate] = useState<number>(12);
  const [calculateMIRR, setCalculateMIRR] = useState<boolean>(false);

  // Results
  const [results, setResults] = useState<IRRResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [showCashFlowChart, setShowCashFlowChart] = useState<boolean>(true);

  // Calculate IRR
  const calculate = useCallback(() => {
    const inputs: IRRInputs = {
      cashFlows,
      ...(calculateMIRR && {
        financeRate,
        reinvestmentRate,
      }),
    };

    const validationErrors = validateIRRInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateIRRResults(inputs);
    setResults(calculatedResults);
  }, [cashFlows, financeRate, reinvestmentRate, calculateMIRR]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Add new cash flow
  const addCashFlow = () => {
    const nextPeriod = Math.max(...cashFlows.map((cf) => cf.period)) + 1;
    setCashFlows([
      ...cashFlows,
      { period: nextPeriod, amount: 0, label: `Year ${nextPeriod}` },
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
      newCashFlows[index].period = Number(value) || 0;
    } else if (field === 'label') {
      newCashFlows[index].label = String(value);
    }
    setCashFlows(newCashFlows);
  };

  // Format input value for display
  const formatInputValue = (value: number) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US').format(Math.abs(value));
  };

  // Parse input value
  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  // Prepare chart data for cash flows
  const getCashFlowChartData = () => {
    if (!results) return null;

    const labels = results.cashFlowSchedule.map((cf) => `Period ${cf.period}`);
    const amounts = results.cashFlowSchedule.map((cf) => cf.amount);

    return {
      labels,
      datasets: [
        {
          label: 'Cash Flow',
          data: amounts,
          backgroundColor: amounts.map((amt) =>
            amt >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: amounts.map((amt) =>
            amt >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare NPV sensitivity data
  const getNPVSensitivityChartData = () => {
    const rates = [];
    const npvs = [];

    for (let rate = -10; rate <= 40; rate += 2) {
      const npv = cashFlows.reduce((sum, cf) => {
        const discountFactor = Math.pow(1 + rate / 100, -cf.period);
        return sum + cf.amount * discountFactor;
      }, 0);

      rates.push(`${rate}%`);
      npvs.push(npv);
    }

    return {
      labels: rates,
      datasets: [
        {
          label: 'NPV',
          data: npvs,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const cashFlowChartData = getCashFlowChartData();
  const npvSensitivityChartData = getNPVSensitivityChartData();

  const chartOptions = {
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
            return '$' + (numValue / 1000).toFixed(0) + 'k';
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
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                IRR Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate Internal Rate of Return for your investments
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
                    Add Cash Flow
                  </button>
                </div>

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
                              onChange={(e) => {
                                const value = parseInputValue(e.target.value);
                                const isNegative =
                                  cf.period === 0 || cf.amount < 0;
                                updateCashFlow(
                                  index,
                                  'amount',
                                  isNegative
                                    ? -Math.abs(value)
                                    : Math.abs(value)
                                );
                              }}
                              className={`w-full pl-7 pr-3 py-2 rounded-lg border-2 ${
                                cf.amount < 0
                                  ? 'border-red-200 text-red-600'
                                  : 'border-green-200 text-green-600'
                              } focus:border-purple-500 focus:outline-none transition-colors font-medium text-sm`}
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
                        disabled={cashFlows.length <= 2}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Tip:</strong> Use negative values for
                    investments/outflows and positive values for
                    returns/inflows. Period 0 typically represents the initial
                    investment.
                  </p>
                </div>
              </div>

              {/* MIRR Settings */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="calculate-mirr"
                    checked={calculateMIRR}
                    onChange={(e) => setCalculateMIRR(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="calculate-mirr"
                    className="text-lg font-bold text-gray-900"
                  >
                    Calculate Modified IRR (MIRR)
                  </label>
                </div>

                {calculateMIRR && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Finance Rate (Cost of Capital)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={financeRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setFinanceRate(value ? Number(value) : 0);
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Rate for financing negative cash flows
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reinvestment Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={reinvestmentRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setReinvestmentRate(value ? Number(value) : 0);
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Rate for reinvesting positive cash flows
                      </p>
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
              {results && !errors.length && (
                <>
                  {/* IRR Result Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <Percent className="w-4 h-4" />
                          Internal Rate of Return
                        </div>
                        <div className="text-5xl font-bold mb-2">
                          {formatPercentage(results.irr, 2)}
                        </div>
                        <div className="text-sm opacity-75">
                          NPV at IRR: {formatCurrency(results.npv)}
                        </div>
                      </div>

                      {results.mirr !== undefined && (
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                            <Target className="w-4 h-4" />
                            Modified IRR
                          </div>
                          <div className="text-5xl font-bold mb-2">
                            {formatPercentage(results.mirr, 2)}
                          </div>
                          <div className="text-sm opacity-75">
                            More conservative estimate
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Total Investment
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalInvestment)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Returns</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalReturns)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Profit/Loss</div>
                        <div
                          className={`text-xl font-semibold mt-1 ${
                            results.profitLoss >= 0
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}
                        >
                          {formatCurrency(results.profitLoss)}
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
                          NPV at 0%
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.npvAtZero)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Sum of all cash flows
                        </div>
                      </div>

                      {results.paybackPeriod !== undefined && (
                        <div className="bg-indigo-50 rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4" />
                            Payback Period
                          </div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {results.paybackPeriod.toFixed(2)} periods
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            When investment breaks even
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cash Flow Schedule */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Cash Flow Analysis
                      </h3>
                      <button
                        onClick={() => setShowCashFlowChart(!showCashFlowChart)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {showCashFlowChart ? 'Show Table' : 'Show Chart'}
                      </button>
                    </div>

                    {showCashFlowChart ? (
                      <div className="h-80">
                        {cashFlowChartData && (
                          <BarChart
                            data={cashFlowChartData}
                            options={chartOptions}
                          />
                        )}
                      </div>
                    ) : (
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
                                Discounted Value
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                Cumulative
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.cashFlowSchedule.map((cf, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100"
                              >
                                <td className="py-3 px-2 text-sm text-gray-900">
                                  {cf.period}
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-600">
                                  {cf.label || `Period ${cf.period}`}
                                </td>
                                <td
                                  className={`py-3 px-2 text-sm text-right font-medium ${
                                    cf.amount < 0
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  }`}
                                >
                                  {formatCurrency(cf.amount)}
                                </td>
                                <td className="py-3 px-2 text-sm text-right text-gray-600">
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
                              <td
                                className={`py-3 px-2 text-sm text-right font-bold ${
                                  results.npvAtZero < 0
                                    ? 'text-red-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {formatCurrency(results.npvAtZero)}
                              </td>
                              <td className="py-3 px-2 text-sm text-right font-bold text-purple-600">
                                {formatCurrency(results.npv)}
                              </td>
                              <td className="py-3 px-2"></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* NPV Sensitivity Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      NPV Sensitivity Analysis
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Shows how NPV changes with different discount rates. IRR
                      is where the line crosses zero.
                    </p>

                    <div className="h-80">
                      <LineChart
                        data={npvSensitivityChartData}
                        options={chartOptions}
                      />
                    </div>
                  </div>

                  {/* Understanding IRR */}
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
                            <Percent className="w-4 h-4 text-purple-600" />
                            Your IRR of {formatPercentage(results.irr, 2)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            This is the annualized rate of return for your
                            investment. It means your investment is expected to
                            grow at this rate annually, considering all cash
                            flows. Compare this to your required rate of return
                            or alternative investments.
                          </p>
                        </div>

                        {results.mirr !== undefined && (
                          <div className="bg-indigo-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4 text-indigo-600" />
                              Your MIRR of {formatPercentage(results.mirr, 2)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Modified IRR addresses some limitations of regular
                              IRR by using different rates for borrowing and
                              reinvestment. It&apos;s often considered more
                              realistic as it assumes cash flows are reinvested
                              at the reinvestment rate, not the IRR.
                            </p>
                          </div>
                        )}

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Decision Guidelines
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • If IRR &gt; Required Rate of Return → Accept the
                              investment
                            </li>
                            <li>
                              • If IRR &lt; Required Rate of Return → Reject the
                              investment
                            </li>
                            <li>
                              • Compare IRR to alternative investments or market
                              returns
                            </li>
                            <li>
                              • Consider using MIRR for more conservative
                              estimates
                            </li>
                          </ul>
                        </div>

                        {results.paybackPeriod !== undefined && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-green-600" />
                              Payback Period: {results.paybackPeriod.toFixed(
                                2
                              )}{' '}
                              periods
                            </h4>
                            <p className="text-sm text-gray-600">
                              Your investment will break even after{' '}
                              {results.paybackPeriod.toFixed(2)} periods. This
                              is when cumulative cash flows turn positive.
                              Shorter payback periods generally indicate less
                              risky investments.
                            </p>
                          </div>
                        )}
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
              Understanding Internal Rate of Return (IRR)
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is IRR?
                </h3>
                <p className="mb-4">
                  The Internal Rate of Return (IRR) is the discount rate that
                  makes the net present value (NPV) of all cash flows equal to
                  zero. It represents the annualized effective compounded return
                  rate of an investment, making it easy to compare different
                  investment opportunities.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  0 = Σ[CFt / (1 + IRR)^t]
                </div>
                <p className="text-sm">
                  Where CFt is the cash flow at time t, and IRR is the internal
                  rate of return being solved for.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How to Use IRR for Investment Decisions
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Set Your Hurdle Rate:</strong> Determine your
                      minimum acceptable rate of return based on your cost of
                      capital, risk tolerance, and alternative investments.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Calculate IRR:</strong> Input all cash flows,
                      including initial investment (negative) and expected
                      returns (positive).
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Compare and Decide:</strong> If IRR exceeds your
                      hurdle rate, the investment may be worthwhile. Higher IRR
                      generally means better returns.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Consider Other Factors:</strong> Look at payback
                      period, risk level, and compare with NPV analysis for a
                      complete picture.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  IRR vs NPV: When to Use Each
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Aspect
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          IRR
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          NPV
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Result Type</td>
                        <td className="py-3 px-4">Percentage return</td>
                        <td className="py-3 px-4">Dollar amount</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Best For</td>
                        <td className="py-3 px-4">
                          Comparing projects of different sizes
                        </td>
                        <td className="py-3 px-4">Measuring value creation</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">
                          Reinvestment Assumption
                        </td>
                        <td className="py-3 px-4">At the IRR rate</td>
                        <td className="py-3 px-4">At the discount rate</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">
                          Multiple Solutions
                        </td>
                        <td className="py-3 px-4">
                          Possible with unconventional cash flows
                        </td>
                        <td className="py-3 px-4">Always unique</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Limitations of IRR
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Multiple IRRs:</strong> Projects with alternating
                    positive and negative cash flows may have multiple IRRs,
                    making interpretation difficult.
                  </li>
                  <li>
                    <strong>Reinvestment Rate Assumption:</strong> IRR assumes
                    interim cash flows are reinvested at the IRR rate, which may
                    be unrealistic.
                  </li>
                  <li>
                    <strong>Scale Blind:</strong> IRR doesn&apos;t consider the
                    size of the investment. A 50% return on $100 creates less
                    value than 20% on $1 million.
                  </li>
                  <li>
                    <strong>Timing Issues:</strong> IRR doesn&apos;t distinguish
                    between receiving cash flows early or late within a period.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Modified IRR (MIRR) Advantages
                </h3>
                <p className="mb-4">
                  MIRR addresses several limitations of traditional IRR:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Realistic Reinvestment:</strong> Assumes positive
                    cash flows are reinvested at the reinvestment rate
                    (typically the company&apos;s cost of capital), not the IRR.
                  </li>
                  <li>
                    <strong>Single Solution:</strong> Always produces a unique
                    answer, eliminating the multiple IRR problem.
                  </li>
                  <li>
                    <strong>Conservative Estimate:</strong> Generally provides a
                    more conservative and realistic return estimate than
                    traditional IRR.
                  </li>
                  <li>
                    <strong>Better for Capital Budgeting:</strong> More suitable
                    for ranking mutually exclusive projects.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Use Cases for IRR
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Private Equity & Venture Capital
                    </h4>
                    <p className="text-sm">
                      Evaluate portfolio company investments and fund
                      performance over multiple years.
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Real Estate
                    </h4>
                    <p className="text-sm">
                      Analyze property investments considering purchase, rental
                      income, and eventual sale.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Corporate Projects
                    </h4>
                    <p className="text-sm">
                      Compare capital projects like new equipment, expansion, or
                      R&D investments.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Bond Investments
                    </h4>
                    <p className="text-sm">
                      Calculate yield to maturity for bonds with regular coupon
                      payments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Accurate IRR Analysis
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Be Conservative:</strong> Use realistic cash flow
                      projections. Overly optimistic estimates lead to
                      misleading IRRs.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Consider Risk:</strong> Higher IRR often means
                      higher risk. Adjust your hurdle rate based on project
                      risk.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Use Multiple Metrics:</strong> Combine IRR with
                      NPV, payback period, and profitability index for
                      comprehensive analysis.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Account for All Costs:</strong> Include
                      maintenance, taxes, and terminal values in your cash
                      flows.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Sensitivity Analysis:</strong> Test how changes in
                      key assumptions affect the IRR.
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
                    • This calculator uses the Newton-Raphson method with
                    bisection fallback for accurate IRR calculations
                  </li>
                  <li>
                    • Results assume cash flows occur at the end of each period
                    unless otherwise specified
                  </li>
                  <li>
                    • For investments with unconventional cash flows, verify
                    results with alternative methods
                  </li>
                  <li>
                    • Consider tax implications, which are not included in these
                    calculations
                  </li>
                  <li>
                    • Always consult with financial advisors for major
                    investment decisions
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
