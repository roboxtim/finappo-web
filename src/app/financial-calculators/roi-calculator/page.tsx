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
  PlusCircle,
  MinusCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateROIResults,
  validateROIInputs,
  formatPercentage,
  formatCurrency,
  formatPeriod,
  projectGrowth,
  compareScenarios,
  prepareBreakdownChartData,
  prepareGrowthChartData,
  prepareComparisonChartData,
  type ROIInputs,
  type ROIResults,
  type PeriodType,
  type InvestmentScenario,
  type ComparisonResult,
} from './roiCalculations';
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

export default function ROICalculator() {
  // Input states
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [finalValue, setFinalValue] = useState<number>(15000);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(1);
  const [periodType, setPeriodType] = useState<PeriodType>('years');
  const [additionalCosts, setAdditionalCosts] = useState<number>(0);
  const [additionalGains, setAdditionalGains] = useState<number>(0);

  // Scenarios for comparison
  const [scenarios, setScenarios] = useState<InvestmentScenario[]>([
    {
      name: 'Current Investment',
      initialInvestment: 10000,
      finalValue: 15000,
      period: 1,
      periodType: 'years',
      additionalCosts: 0,
      additionalGains: 0,
    },
  ]);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);

  // Results
  const [results, setResults] = useState<ROIResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'breakdown' | 'growth' | 'comparison'
  >('breakdown');
  const [projectionYears, setProjectionYears] = useState<number>(5);

  // Calculate ROI
  const calculate = useCallback(() => {
    const inputs: ROIInputs = {
      initialInvestment,
      finalValue,
      investmentPeriod,
      periodType,
      additionalCosts,
      additionalGains,
    };

    const validationErrors = validateROIInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateROIResults(inputs);
    setResults(calculatedResults);

    // Update current scenario
    const updatedScenarios = [...scenarios];
    updatedScenarios[0] = {
      name: 'Current Investment',
      initialInvestment,
      finalValue,
      period: investmentPeriod,
      periodType,
      additionalCosts,
      additionalGains,
    };
    setScenarios(updatedScenarios);

    // Update comparisons if showing
    if (showComparison && scenarios.length > 1) {
      const comparisonResults = compareScenarios(scenarios);
      setComparisons(comparisonResults);
    }
  }, [
    initialInvestment,
    finalValue,
    investmentPeriod,
    periodType,
    additionalCosts,
    additionalGains,
    scenarios,
    showComparison,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Add comparison scenario
  const addScenario = () => {
    const newScenario: InvestmentScenario = {
      name: `Scenario ${scenarios.length}`,
      initialInvestment: 10000,
      finalValue: 12000,
      period: 1,
      periodType: 'years',
      additionalCosts: 0,
      additionalGains: 0,
    };
    setScenarios([...scenarios, newScenario]);
    setShowComparison(true);
  };

  // Remove scenario
  const removeScenario = (index: number) => {
    if (index === 0) return; // Don't remove the current investment
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
    if (newScenarios.length <= 1) {
      setShowComparison(false);
    }
  };

  // Update scenario
  const updateScenario = (
    index: number,
    field: keyof InvestmentScenario,
    value: string | number | PeriodType
  ) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setScenarios(newScenarios);

    if (showComparison) {
      const comparisonResults = compareScenarios(newScenarios);
      setComparisons(comparisonResults);
    }
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

  // Prepare chart data
  const breakdownChartData = results
    ? prepareBreakdownChartData(results)
    : null;
  const growthProjections = results
    ? projectGrowth(results.totalReturn, results.annualizedROI, projectionYears)
    : [];
  const growthChartData = results
    ? prepareGrowthChartData(results.totalReturn, growthProjections)
    : null;
  const comparisonChartData =
    comparisons.length > 0 ? prepareComparisonChartData(comparisons) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              const value =
                typeof context.parsed === 'number'
                  ? context.parsed
                  : context.parsed.y || 0;
              if (activeChart === 'breakdown') {
                label += formatCurrency(value);
              } else if (activeChart === 'growth') {
                label += formatCurrency(value);
              } else {
                label += formatPercentage(value, 2);
              }
            }
            return label;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        ticks: {
          callback: function (value: string | number) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        ticks: {
          callback: function (value: string | number) {
            return formatPercentage(Number(value), 0);
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
                ROI Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate Return on Investment for your financial decisions
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
              {/* Basic Investment Inputs */}
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="10,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Amount of money initially invested
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Final Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(finalValue)}
                        onChange={(e) =>
                          setFinalValue(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="15,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Current or expected value of investment
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Investment Period
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={investmentPeriod || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setInvestmentPeriod(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="1"
                      />
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium bg-white"
                      >
                        <option value="years">Years</option>
                        <option value="months">Months</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Costs and Gains */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Additional Factors (Optional)
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Costs
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(additionalCosts)}
                        onChange={(e) =>
                          setAdditionalCosts(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Fees, maintenance, taxes, or other costs
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Gains
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(additionalGains)}
                        onChange={(e) =>
                          setAdditionalGains(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Dividends, rental income, or other gains
                    </p>
                  </div>
                </div>
              </div>

              {/* Compare Scenarios */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Compare Scenarios
                  </h2>
                  <button
                    onClick={addScenario}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Scenario
                  </button>
                </div>

                {showComparison && scenarios.length > 1 && (
                  <div className="space-y-4">
                    {scenarios.slice(1).map((scenario, idx) => {
                      const index = idx + 1;
                      return (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <input
                              type="text"
                              value={scenario.name}
                              onChange={(e) =>
                                updateScenario(index, 'name', e.target.value)
                              }
                              className="text-sm font-semibold bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none"
                            />
                            <button
                              onClick={() => removeScenario(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">
                                Initial
                              </label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                                  $
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={formatInputValue(
                                    scenario.initialInvestment
                                  )}
                                  onChange={(e) =>
                                    updateScenario(
                                      index,
                                      'initialInvestment',
                                      parseInputValue(e.target.value)
                                    )
                                  }
                                  className="w-full pl-6 pr-2 py-1 rounded border border-gray-300 text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">
                                Final
                              </label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                                  $
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={formatInputValue(scenario.finalValue)}
                                  onChange={(e) =>
                                    updateScenario(
                                      index,
                                      'finalValue',
                                      parseInputValue(e.target.value)
                                    )
                                  }
                                  className="w-full pl-6 pr-2 py-1 rounded border border-gray-300 text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">
                                Period
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={scenario.period}
                                onChange={(e) =>
                                  updateScenario(
                                    index,
                                    'period',
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">
                                Type
                              </label>
                              <select
                                value={scenario.periodType}
                                onChange={(e) =>
                                  updateScenario(
                                    index,
                                    'periodType',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 rounded border border-gray-300 text-sm bg-white"
                              >
                                <option value="years">Years</option>
                                <option value="months">Months</option>
                                <option value="days">Days</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                  {/* Main ROI Result Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <Percent className="w-4 h-4" />
                          Total ROI
                        </div>
                        <div className="text-5xl font-bold mb-2">
                          {formatPercentage(results.roi, 2)}
                        </div>
                        <div className="text-sm opacity-75">
                          Over {formatPeriod(investmentPeriod, periodType)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <Target className="w-4 h-4" />
                          Annualized ROI
                        </div>
                        <div className="text-5xl font-bold mb-2">
                          {formatPercentage(results.annualizedROI, 2)}
                        </div>
                        <div className="text-sm opacity-75">
                          Per year equivalent
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Total Invested</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalInvested)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Return</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalReturn)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Net Profit</div>
                        <div
                          className={`text-xl font-semibold mt-1 ${
                            results.netProfit >= 0
                              ? 'text-green-300'
                              : 'text-red-300'
                          }`}
                        >
                          {formatCurrency(results.netProfit)}
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
                          Total Gain
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalGain)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Absolute profit amount
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Investment Duration
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {results.effectivePeriodInYears.toFixed(2)} years
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Actual time period
                        </div>
                      </div>

                      {results.monthlyGrowthRate !== undefined && (
                        <div className="bg-blue-50 rounded-2xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            Monthly Growth
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPercentage(results.monthlyGrowthRate, 3)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Average per month
                          </div>
                        </div>
                      )}

                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calculator className="w-4 h-4" />
                          Multiple
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {(
                            (results.totalReturn / results.totalInvested) *
                            1
                          ).toFixed(2)}
                          x
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Return multiple
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
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
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
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            activeChart === 'growth'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <LineChartIcon className="w-4 h-4" />
                          Growth
                        </button>
                        {comparisons.length > 0 && (
                          <button
                            onClick={() => setActiveChart('comparison')}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                              activeChart === 'comparison'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                            Compare
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={chartOptions}
                        />
                      )}
                      {activeChart === 'growth' && growthChartData && (
                        <>
                          <div className="mb-4">
                            <label className="text-sm text-gray-600 mr-2">
                              Project for:
                            </label>
                            <select
                              value={projectionYears}
                              onChange={(e) =>
                                setProjectionYears(Number(e.target.value))
                              }
                              className="px-3 py-1 rounded border border-gray-300 text-sm"
                            >
                              <option value="3">3 years</option>
                              <option value="5">5 years</option>
                              <option value="10">10 years</option>
                              <option value="15">15 years</option>
                              <option value="20">20 years</option>
                            </select>
                          </div>
                          <LineChart
                            data={growthChartData}
                            options={lineChartOptions}
                          />
                        </>
                      )}
                      {activeChart === 'comparison' && comparisonChartData && (
                        <BarChart
                          data={comparisonChartData}
                          options={barChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Scenario Comparison Table */}
                  {comparisons.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Scenario Comparison
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                                Rank
                              </th>
                              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                                Scenario
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                ROI
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                Annualized
                              </th>
                              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                Net Profit
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisons.map((comp, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100"
                              >
                                <td className="py-3 px-2 text-sm">
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                      comp.rank === 1
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : comp.rank === 2
                                          ? 'bg-gray-100 text-gray-800'
                                          : comp.rank === 3
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-50 text-gray-600'
                                    }`}
                                  >
                                    {comp.rank}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                                  {comp.scenario}
                                </td>
                                <td className="py-3 px-2 text-sm text-right font-medium">
                                  {formatPercentage(comp.roi, 2)}
                                </td>
                                <td className="py-3 px-2 text-sm text-right font-medium text-purple-600">
                                  {formatPercentage(comp.annualizedROI, 2)}
                                </td>
                                <td
                                  className={`py-3 px-2 text-sm text-right font-medium ${
                                    comp.netProfit >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {formatCurrency(comp.netProfit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Understanding ROI */}
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
                            Your ROI of {formatPercentage(results.roi, 2)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            This means your investment has{' '}
                            {results.roi >= 0 ? 'grown' : 'decreased'} by{' '}
                            {Math.abs(results.roi).toFixed(2)}% over the entire
                            investment period. For every dollar invested, you{' '}
                            {results.roi >= 0 ? 'gained' : 'lost'} $
                            {Math.abs(results.roi / 100).toFixed(2)}.
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            Annualized ROI of{' '}
                            {formatPercentage(results.annualizedROI, 2)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            This is your average yearly return rate. It accounts
                            for the time value of money and allows you to
                            compare investments of different durations fairly.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Interpreting ROI
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • ROI {'>'} 0%: Your investment is profitable
                            </li>
                            <li>• ROI = 0%: You broke even</li>
                            <li>
                              • ROI {'<'} 0%: Your investment resulted in a loss
                            </li>
                            <li>
                              • Higher ROI generally means better investment
                              performance
                            </li>
                            <li>• Always consider risk alongside ROI</li>
                          </ul>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            Your Profit: {formatCurrency(results.netProfit)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            This is your absolute gain or loss in dollar terms.
                            It represents the difference between what you put in
                            (including additional costs) and what you got back
                            (including additional gains).
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
              Understanding Return on Investment (ROI)
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is ROI?
                </h3>
                <p className="mb-4">
                  Return on Investment (ROI) is a performance measure used to
                  evaluate the efficiency or profitability of an investment. It
                  directly measures the amount of return on an investment
                  relative to its cost. ROI is expressed as a percentage and is
                  calculated by dividing the net profit from an investment by
                  its initial cost.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  ROI = ((Final Value - Initial Cost) / Initial Cost) × 100
                </div>
                <p className="text-sm">
                  For example, if you invest $1,000 and it grows to $1,500, your
                  ROI is 50%, meaning you earned 50 cents for every dollar
                  invested.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How to Calculate and Interpret ROI
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Basic ROI:</strong> Calculate the simple
                      percentage return without considering time. Best for
                      comparing investments of similar duration.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Annualized ROI:</strong> Adjusts returns for time
                      period, showing the equivalent yearly return rate.
                      Essential for comparing investments of different
                      durations.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Include All Factors:</strong> Don&apos;t forget to
                      include additional costs (fees, maintenance) and gains
                      (dividends, rental income) for accurate calculations.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Context Matters:</strong> A 10% ROI might be
                      excellent for a low-risk bond but poor for a high-risk
                      startup investment.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Annualized ROI vs Simple ROI
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Aspect
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Simple ROI
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Annualized ROI
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">
                          Time Consideration
                        </td>
                        <td className="py-3 px-4">
                          Ignores investment duration
                        </td>
                        <td className="py-3 px-4">Accounts for time period</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Best Use</td>
                        <td className="py-3 px-4">
                          Quick profitability assessment
                        </td>
                        <td className="py-3 px-4">
                          Comparing different investments
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">
                          Formula Complexity
                        </td>
                        <td className="py-3 px-4">Simple division</td>
                        <td className="py-3 px-4">
                          Compound growth calculation
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Example</td>
                        <td className="py-3 px-4">
                          50% return over 3 years = 50%
                        </td>
                        <td className="py-3 px-4">
                          50% over 3 years = 14.47% per year
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  ROI vs Other Investment Metrics
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">ROI vs IRR</h4>
                    <p className="text-sm">
                      ROI is simpler and shows total return. IRR considers cash
                      flow timing and reinvestment, making it better for complex
                      investments with multiple cash flows.
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">ROI vs NPV</h4>
                    <p className="text-sm">
                      ROI shows percentage return while NPV shows dollar value
                      created. NPV considers the time value of money more
                      explicitly.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      ROI vs Payback Period
                    </h4>
                    <p className="text-sm">
                      ROI measures profitability while payback period shows how
                      quickly you recover your investment. Use both for complete
                      analysis.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      ROI vs P/E Ratio
                    </h4>
                    <p className="text-sm">
                      ROI measures actual returns while P/E ratio indicates
                      market valuation relative to earnings. ROI is historical;
                      P/E is forward-looking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When to Use ROI for Investment Decisions
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Comparing Similar Investments:</strong> Use ROI to
                      compare stocks, bonds, or real estate investments with
                      similar risk profiles.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Evaluating Past Performance:</strong> Assess how
                      well your investments have performed historically.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Setting Investment Goals:</strong> Determine
                      target ROI based on your financial objectives and risk
                      tolerance.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Business Decisions:</strong> Evaluate marketing
                      campaigns, equipment purchases, or expansion projects.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Personal Finance:</strong> Compare education costs
                      to potential earnings, or evaluate home improvements.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Limitations of ROI Metric
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Ignores Risk:</strong> ROI doesn&apos;t account for
                    investment risk. A 20% return on a risky venture isn&apos;t
                    necessarily better than 10% on a safe investment.
                  </li>
                  <li>
                    <strong>Time Value Simplification:</strong> Simple ROI
                    doesn&apos;t fully account for when returns occur. Early
                    returns are more valuable than later ones.
                  </li>
                  <li>
                    <strong>Doesn&apos;t Consider Opportunity Cost:</strong> ROI
                    doesn&apos;t show what you could have earned with
                    alternative investments.
                  </li>
                  <li>
                    <strong>Can Be Manipulated:</strong> Different calculation
                    methods (including or excluding certain costs) can produce
                    different ROI figures.
                  </li>
                  <li>
                    <strong>Inflation Not Included:</strong> Standard ROI
                    calculations don&apos;t adjust for inflation, which can
                    overstate real returns.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  ROI Best Practices
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Be Comprehensive:</strong> Include all costs
                      (purchase, maintenance, fees, taxes) and all gains (sale
                      price, dividends, tax benefits).
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Use Consistent Methods:</strong> Apply the same
                      calculation method when comparing different investments.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Consider Time Frames:</strong> Always use
                      annualized ROI when comparing investments of different
                      durations.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Account for Risk:</strong> Higher ROI often means
                      higher risk. Balance return expectations with risk
                      tolerance.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">5.</span>
                    <div>
                      <strong>Look Beyond ROI:</strong> Use ROI alongside other
                      metrics like volatility, liquidity, and correlation with
                      your portfolio.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">6.</span>
                    <div>
                      <strong>Document Assumptions:</strong> Clearly note
                      what&apos;s included and excluded in your ROI
                      calculations.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common ROI Benchmarks
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">
                      S&P 500 Average (Historical)
                    </span>
                    <span className="font-bold text-purple-600">
                      ~10% annually
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Real Estate</span>
                    <span className="font-bold text-purple-600">
                      8-12% annually
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Corporate Bonds</span>
                    <span className="font-bold text-purple-600">
                      4-6% annually
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Treasury Bonds</span>
                    <span className="font-bold text-purple-600">
                      2-4% annually
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Savings Account</span>
                    <span className="font-bold text-purple-600">
                      0.5-2% annually
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Note: These are historical averages and future returns may
                  vary significantly. Always consider your specific situation
                  and risk tolerance.
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • ROI calculations are simplified representations and may
                    not capture all investment complexities
                  </li>
                  <li>• Past ROI doesn&apos;t guarantee future performance</li>
                  <li>
                    • Consider consulting financial advisors for significant
                    investment decisions
                  </li>
                  <li>
                    • Tax implications can significantly affect actual returns
                  </li>
                  <li>
                    • Inflation reduces the purchasing power of returns over
                    time
                  </li>
                  <li>
                    • Different asset classes have different risk-return
                    profiles
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
