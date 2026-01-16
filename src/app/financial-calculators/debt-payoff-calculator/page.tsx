'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  Plus,
  Trash2,
  DollarSign,
  Info,
  Target,
  TrendingDown,
  Clock,
  Shield,
  Award,
  AlertCircle,
  Edit2,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateDebtPayoff,
  calculateMinimumPaymentsOnly,
  validateDebtInputs,
  formatCurrency,
  formatMonths,
  formatPercentage,
  type Debt,
  type DebtPayoffInputs,
  type DebtPayoffResults,
  PayoffStrategy,
} from './calculations';
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
import { Bar as BarChart, Pie as PieChart } from 'react-chartjs-2';

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

export default function DebtPayoffCalculator() {
  // Input states
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: '1',
      name: 'Credit Card',
      balance: 5000,
      apr: 18.99,
      minimumPayment: 150,
    },
    {
      id: '2',
      name: 'Personal Loan',
      balance: 10000,
      apr: 12,
      minimumPayment: 300,
    },
  ]);
  const [extraPayment, setExtraPayment] = useState<number>(200);
  const [strategy, setStrategy] = useState<PayoffStrategy>(
    PayoffStrategy.AVALANCHE
  );
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  // Results
  const [avalancheResults, setAvalancheResults] =
    useState<DebtPayoffResults | null>(null);
  const [snowballResults, setSnowballResults] =
    useState<DebtPayoffResults | null>(null);
  const [minimumOnlyResults, setMinimumOnlyResults] = useState<{
    totalMonths: number;
    totalAmountPaid: number;
    totalInterestPaid: number;
    monthlyPayment: number;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<'comparison' | 'breakdown'>(
    'comparison'
  );

  // Add new debt
  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      apr: 0,
      minimumPayment: 0,
    };
    setDebts([...debts, newDebt]);
    setEditingDebtId(newDebt.id);
  };

  // Remove debt
  const removeDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  // Update debt
  const updateDebt = (
    id: string,
    field: keyof Debt,
    value: string | number
  ) => {
    setDebts(
      debts.map((debt) => {
        if (debt.id === id) {
          return { ...debt, [field]: value };
        }
        return debt;
      })
    );
  };

  // Calculate results
  const calculate = useCallback(() => {
    // Filter out empty debts
    const validDebts = debts.filter(
      (d) => d.balance > 0 && d.minimumPayment > 0
    );

    if (validDebts.length === 0) {
      setErrors(['Please add at least one debt with valid values']);
      setAvalancheResults(null);
      setSnowballResults(null);
      setMinimumOnlyResults(null);
      return;
    }

    const avalancheInputs: DebtPayoffInputs = {
      debts: validDebts,
      extraPayment,
      strategy: PayoffStrategy.AVALANCHE,
    };

    const snowballInputs: DebtPayoffInputs = {
      debts: validDebts,
      extraPayment,
      strategy: PayoffStrategy.SNOWBALL,
    };

    const validationErrors = validateDebtInputs(avalancheInputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setAvalancheResults(null);
      setSnowballResults(null);
      setMinimumOnlyResults(null);
      return;
    }

    setErrors([]);

    // Calculate all three scenarios
    const avalanche = calculateDebtPayoff(avalancheInputs);
    const snowball = calculateDebtPayoff(snowballInputs);
    const minimumOnly = calculateMinimumPaymentsOnly(validDebts);

    setAvalancheResults(avalanche);
    setSnowballResults(snowball);
    setMinimumOnlyResults(minimumOnly);
  }, [debts, extraPayment]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Get active results based on selected strategy
  const activeResults =
    strategy === PayoffStrategy.AVALANCHE ? avalancheResults : snowballResults;

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

  // Prepare comparison chart data
  const getComparisonChartData = () => {
    if (!avalancheResults || !snowballResults || !minimumOnlyResults)
      return null;

    return {
      labels: ['Debt Avalanche', 'Debt Snowball', 'Minimum Only'],
      datasets: [
        {
          label: 'Total Months',
          data: [
            avalancheResults.totalMonths,
            snowballResults.totalMonths,
            minimumOnlyResults.totalMonths,
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare interest comparison chart
  const getInterestChartData = () => {
    if (!avalancheResults || !snowballResults || !minimumOnlyResults)
      return null;

    return {
      labels: ['Debt Avalanche', 'Debt Snowball', 'Minimum Only'],
      datasets: [
        {
          data: [
            avalancheResults.totalInterestPaid,
            snowballResults.totalInterestPaid,
            minimumOnlyResults.totalInterestPaid,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const comparisonChartData = getComparisonChartData();
  const interestChartData = getInterestChartData();

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `${context.parsed.y} months`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            return `${value} mo`;
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center shadow-lg">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Debt Payoff Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Create your debt-free plan with avalanche or snowball strategy
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
              {/* Debts Management */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Debts
                  </h2>
                  <button
                    onClick={addDebt}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Debt
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

                <div className="space-y-4">
                  {debts.map((debt) => (
                    <div
                      key={debt.id}
                      className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        {editingDebtId === debt.id ? (
                          <input
                            type="text"
                            value={debt.name}
                            onChange={(e) =>
                              updateDebt(debt.id, 'name', e.target.value)
                            }
                            onBlur={() => setEditingDebtId(null)}
                            className="px-3 py-1 rounded-lg text-gray-900 border border-gray-300 focus:border-rose-500 focus:outline-none font-semibold"
                            placeholder="Debt Name"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {debt.name}
                            </span>
                            <button
                              onClick={() => setEditingDebtId(debt.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Balance
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(debt.balance)}
                              onChange={(e) =>
                                updateDebt(
                                  debt.id,
                                  'balance',
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-8 pr-3 py-2 rounded-lg text-gray-900 border border-gray-300 focus:border-rose-500 focus:outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            APR
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={debt.apr || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9.]/g,
                                  ''
                                );
                                updateDebt(
                                  debt.id,
                                  'apr',
                                  value ? Number(value) : 0
                                );
                              }}
                              className="w-full px-3 pr-8 py-2 rounded-lg text-gray-900 border border-gray-300 focus:border-rose-500 focus:outline-none text-sm"
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Min Payment
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(debt.minimumPayment)}
                              onChange={(e) =>
                                updateDebt(
                                  debt.id,
                                  'minimumPayment',
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-8 pr-3 py-2 rounded-lg text-gray-900 border border-gray-300 focus:border-rose-500 focus:outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {debts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No debts added yet</p>
                      <p className="text-sm mt-1">
                        Click &ldquo;Add Debt&rdquo; to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payoff Strategy */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payoff Strategy
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Extra Monthly Payment
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(extraPayment)}
                        onChange={(e) =>
                          setExtraPayment(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Additional amount to pay above minimums
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setStrategy(PayoffStrategy.AVALANCHE)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          strategy === PayoffStrategy.AVALANCHE
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <TrendingDown className="w-6 h-6 mb-2 mx-auto text-rose-600" />
                        <div className="font-semibold text-gray-900">
                          Avalanche
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Highest interest first
                        </div>
                      </button>

                      <button
                        onClick={() => setStrategy(PayoffStrategy.SNOWBALL)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          strategy === PayoffStrategy.SNOWBALL
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Target className="w-6 h-6 mb-2 mx-auto text-rose-600" />
                        <div className="font-semibold text-gray-900">
                          Snowball
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Smallest balance first
                        </div>
                      </button>
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
              {activeResults && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-rose-600 to-red-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Clock className="w-4 h-4" />
                      Time to Debt Freedom
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatMonths(activeResults.totalMonths)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Using{' '}
                      {strategy === PayoffStrategy.AVALANCHE
                        ? 'Avalanche'
                        : 'Snowball'}{' '}
                      strategy
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Total Interest</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(activeResults.totalInterestPaid)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Paid</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(activeResults.totalAmountPaid)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategy Comparison */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Strategy Comparison
                    </h3>

                    <div className="space-y-4">
                      {/* Avalanche */}
                      <div
                        className={`rounded-2xl p-6 ${
                          strategy === PayoffStrategy.AVALANCHE
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900">
                              Debt Avalanche
                            </span>
                          </div>
                          {avalancheResults && (
                            <span className="text-2xl font-bold text-green-600">
                              {formatMonths(avalancheResults.totalMonths)}
                            </span>
                          )}
                        </div>
                        {avalancheResults && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">
                                Total Interest
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  avalancheResults.totalInterestPaid
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Paid</div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  avalancheResults.totalAmountPaid
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Snowball */}
                      <div
                        className={`rounded-2xl p-6 ${
                          strategy === PayoffStrategy.SNOWBALL
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              Debt Snowball
                            </span>
                          </div>
                          {snowballResults && (
                            <span className="text-2xl font-bold text-blue-600">
                              {formatMonths(snowballResults.totalMonths)}
                            </span>
                          )}
                        </div>
                        {snowballResults && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">
                                Total Interest
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  snowballResults.totalInterestPaid
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Paid</div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  snowballResults.totalAmountPaid
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Minimum Only */}
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-gray-900">
                              Minimum Only
                            </span>
                          </div>
                          {minimumOnlyResults && (
                            <span className="text-2xl font-bold text-red-600">
                              {formatMonths(minimumOnlyResults.totalMonths)}
                            </span>
                          )}
                        </div>
                        {minimumOnlyResults && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">
                                Total Interest
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  minimumOnlyResults.totalInterestPaid
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Paid</div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  minimumOnlyResults.totalAmountPaid
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Savings Summary */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Your Savings
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          Time Saved
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatMonths(
                            activeResults.savingsVsMinimum.monthsSaved
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          vs minimum payments
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Interest Saved
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            activeResults.savingsVsMinimum.interestSaved
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          vs minimum payments
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Award className="w-4 h-4" />
                          Monthly Payment
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(activeResults.monthlyPayment)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          total monthly
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Shield className="w-4 h-4" />
                          Total Saved
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {formatCurrency(
                            activeResults.savingsVsMinimum.totalSaved
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          vs minimum payments
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payoff Order */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Payoff Order
                    </h3>

                    <div className="space-y-3">
                      {activeResults.debtPayoffOrder.map((debtName, index) => {
                        const debt = debts.find((d) => d.name === debtName);
                        const scheduleItem = activeResults.paymentSchedule.find(
                          (item) => item.debtsPaidOff.includes(debtName)
                        );

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {debtName}
                                </div>
                                {debt && (
                                  <div className="text-sm text-gray-600">
                                    {formatCurrency(debt.balance)} at{' '}
                                    {formatPercentage(debt.apr)}
                                  </div>
                                )}
                              </div>
                            </div>
                            {scheduleItem && (
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  Month {scheduleItem.month}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Paid off
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                          onClick={() => setActiveChart('comparison')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'comparison'
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Timeline
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Interest
                        </button>
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'comparison' && comparisonChartData && (
                        <BarChart
                          data={comparisonChartData}
                          options={barChartOptions}
                        />
                      )}
                      {activeChart === 'breakdown' && interestChartData && (
                        <PieChart
                          data={interestChartData}
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
                            <TrendingDown className="w-4 h-4 text-green-600" />
                            Debt Avalanche Method
                          </h4>
                          <p className="text-sm text-gray-600">
                            Pays off debts with the highest interest rates
                            first. This method mathematically saves you the most
                            money in interest charges over time, making it the
                            most cost-effective approach.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            Debt Snowball Method
                          </h4>
                          <p className="text-sm text-gray-600">
                            Pays off the smallest balances first, regardless of
                            interest rate. While it may cost more in interest,
                            it provides psychological wins that can help
                            maintain motivation throughout your debt-free
                            journey.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-purple-600" />
                            Extra Payments Matter
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your extra payment of {formatCurrency(extraPayment)}{' '}
                            per month saves you{' '}
                            {formatMonths(
                              activeResults.savingsVsMinimum.monthsSaved
                            )}{' '}
                            and{' '}
                            {formatCurrency(
                              activeResults.savingsVsMinimum.interestSaved
                            )}{' '}
                            in interest compared to making minimum payments
                            only.
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
              Debt Elimination Strategies
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Choosing the Right Strategy
                </h3>
                <p className="mb-4">
                  Both the debt avalanche and debt snowball methods are
                  effective strategies for becoming debt-free. The best choice
                  depends on your personal preferences and what motivates you
                  most.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Choose Avalanche If:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• You are motivated by math and logic</li>
                      <li>• Saving money is your top priority</li>
                      <li>• You can stay disciplined without quick wins</li>
                      <li>• You have high-interest debt</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Choose Snowball If:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• You need psychological motivation</li>
                      <li>• Quick wins keep you on track</li>
                      <li>• You have many small debts</li>
                      <li>• Momentum is more important than savings</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Accelerating Debt Payoff
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Increase Income:</strong> Take on extra shifts,
                    freelance work, or sell items you no longer need.
                  </li>
                  <li>
                    <strong>Reduce Expenses:</strong> Review your budget and cut
                    unnecessary spending temporarily.
                  </li>
                  <li>
                    <strong>Use Windfalls:</strong> Apply tax refunds, bonuses,
                    or gifts directly to debt principal.
                  </li>
                  <li>
                    <strong>Biweekly Payments:</strong> Make half payments every
                    two weeks instead of monthly for an extra payment per year.
                  </li>
                  <li>
                    <strong>Balance Transfers:</strong> Consider transferring
                    high-interest credit card debt to lower-rate options.
                  </li>
                  <li>
                    <strong>Avoid New Debt:</strong> Stop using credit cards and
                    avoid taking on new loans while paying off existing debt.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Debt Traps to Avoid
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Minimum Payment Trap
                    </h4>
                    <p className="text-sm">
                      Paying only minimums can extend your debt by decades and
                      cost thousands in extra interest. Always pay more than the
                      minimum when possible.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Debt Consolidation Pitfalls
                    </h4>
                    <p className="text-sm">
                      Consolidation only helps if you stop accumulating new debt
                      and the new interest rate is genuinely lower than your
                      current average rate.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Lifestyle Inflation
                    </h4>
                    <p className="text-sm">
                      As income increases, avoid increasing spending
                      proportionally. Use raises and bonuses to accelerate debt
                      payoff instead.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Building Better Financial Habits
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      During Debt Payoff:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Track every expense</li>
                      <li>• Create and stick to a budget</li>
                      <li>• Build a small emergency fund ($1,000)</li>
                      <li>• Celebrate milestones responsibly</li>
                      <li>• Find accountability partners</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      After Becoming Debt-Free:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Build 3-6 months emergency fund</li>
                      <li>• Increase retirement contributions</li>
                      <li>• Save for major purchases in cash</li>
                      <li>• Invest in index funds or ETFs</li>
                      <li>• Consider income-producing assets</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Your Debt-Free Future
                </h3>
                <p>
                  Becoming debt-free is one of the most liberating financial
                  achievements. It provides:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>• Financial flexibility and reduced stress</li>
                  <li>• More money for savings and investments</li>
                  <li>• Improved credit score and borrowing power</li>
                  <li>• Freedom to pursue opportunities without debt burden</li>
                  <li>• Peace of mind and better sleep</li>
                  <li>• Ability to be more generous and help others</li>
                </ul>
                <p className="mt-4 font-semibold text-gray-900">
                  Every extra dollar you pay toward debt today brings you one
                  step closer to financial freedom. Stay committed, track your
                  progress, and celebrate your wins along the way!
                </p>
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
