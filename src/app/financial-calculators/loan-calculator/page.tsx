'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  DollarSign,
  Calendar,
  Percent,
  TrendingDown,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart3,
  Target,
  Award,
  Clock,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateLoanPayment,
  calculateAmortizationSchedule,
  calculateComparison,
  validateLoanInputs,
  formatCurrency,
  formatPercentage,
  formatMonthYear,
  formatLoanTerm,
  type LoanInputs,
  type LoanResults,
  type AmortizationPayment,
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
import {
  Line as LineChart,
  Pie as PieChart,
  Bar as BarChart,
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

export default function LoanCalculator() {
  // Input states
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const paymentFrequency = 'monthly'; // Currently only monthly is supported in UI
  const [extraPaymentAmount, setExtraPaymentAmount] = useState<number>(0);
  const [extraPaymentFrequency, setExtraPaymentFrequency] = useState<
    'none' | 'monthly' | 'yearly' | 'one-time'
  >('none');
  const [oneTimePayment, setOneTimePayment] = useState<number>(0);
  const [oneTimePaymentDate, setOneTimePaymentDate] = useState<Date | null>(
    null
  );

  // Results
  const [results, setResults] = useState<LoanResults | null>(null);
  const [schedule, setSchedule] = useState<AmortizationPayment[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [activeChart, setActiveChart] = useState<
    'balance' | 'breakdown' | 'comparison'
  >('balance');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Calculate results
  const calculate = useCallback(() => {
    const inputs: LoanInputs = {
      loanAmount,
      interestRate,
      loanTermYears,
      loanTermMonths,
      startDate,
      paymentFrequency,
      extraPaymentAmount,
      extraPaymentFrequency,
      oneTimePayment,
      oneTimePaymentDate,
    };

    const validationErrors = validateLoanInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      setSchedule([]);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateLoanPayment(inputs);
    const calculatedSchedule = calculateAmortizationSchedule(inputs);

    setResults(calculatedResults);
    setSchedule(calculatedSchedule);
  }, [
    loanAmount,
    interestRate,
    loanTermYears,
    loanTermMonths,
    startDate,
    paymentFrequency,
    extraPaymentAmount,
    extraPaymentFrequency,
    oneTimePayment,
    oneTimePaymentDate,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Format input value
  const formatInputValue = (value: number) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  // Get comparison results
  const comparison = results
    ? calculateComparison({
        loanAmount,
        interestRate,
        loanTermYears,
        loanTermMonths,
        startDate,
        paymentFrequency,
        extraPaymentAmount,
        extraPaymentFrequency,
        oneTimePayment,
        oneTimePaymentDate,
      })
    : null;

  // Prepare balance chart data
  const getBalanceChartData = () => {
    if (schedule.length === 0) return null;

    // Sample every nth payment for readability
    const sampleRate = Math.ceil(schedule.length / 60);
    const sampledSchedule = schedule.filter(
      (_, index) => index % sampleRate === 0 || index === schedule.length - 1
    );

    const labels = sampledSchedule.map((payment) =>
      formatMonthYear(payment.date)
    );
    const balanceData = sampledSchedule.map((payment) => payment.balance);

    return {
      labels,
      datasets: [
        {
          label: 'Remaining Balance',
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

  // Prepare principal vs interest pie chart
  const getBreakdownChartData = () => {
    if (!results) return null;

    return {
      labels: ['Principal', 'Interest'],
      datasets: [
        {
          data: [results.loanAmount, results.totalInterest],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: ['rgba(99, 102, 241, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare comparison chart (with vs without extra payments)
  const getComparisonChartData = () => {
    if (!comparison) return null;

    return {
      labels: ['Without Extra Payments', 'With Extra Payments'],
      datasets: [
        {
          label: 'Principal',
          data: [loanAmount, loanAmount],
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
        },
        {
          label: 'Interest',
          data: [
            comparison.withoutExtra.totalInterest,
            comparison.withExtra.totalInterest,
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        },
      ],
    };
  };

  const balanceChartData = getBalanceChartData();
  const breakdownChartData = getBreakdownChartData();
  const comparisonChartData = getComparisonChartData();

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
            return `Balance: ${formatCurrency(context.parsed.y)}`;
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Loan Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate your monthly payment, total interest, and create an
                amortization schedule
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Forms */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Loan Details
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
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(loanAmount)}
                        onChange={(e) =>
                          setLoanAmount(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        placeholder="250,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate
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
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        placeholder="6"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Term
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={loanTermYears || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setLoanTermYears(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                          placeholder="30"
                        />
                        <p className="mt-1 text-xs text-gray-500">Years</p>
                      </div>
                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={loanTermMonths || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setLoanTermMonths(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">Months</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Payments */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Extra Payments (Optional)
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Extra Payment Frequency
                    </label>
                    <select
                      value={extraPaymentFrequency}
                      onChange={(e) =>
                        setExtraPaymentFrequency(
                          e.target.value as
                            | 'none'
                            | 'monthly'
                            | 'yearly'
                            | 'one-time'
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="none">No extra payments</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>

                  {(extraPaymentFrequency === 'monthly' ||
                    extraPaymentFrequency === 'yearly') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Extra Payment Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(extraPaymentAmount)}
                          onChange={(e) =>
                            setExtraPaymentAmount(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                          placeholder="100"
                        />
                      </div>
                    </div>
                  )}

                  {extraPaymentFrequency === 'one-time' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          One-Time Payment Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(oneTimePayment)}
                            onChange={(e) =>
                              setOneTimePayment(parseInputValue(e.target.value))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                            placeholder="5,000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          value={
                            oneTimePaymentDate?.toISOString().split('T')[0] ||
                            ''
                          }
                          onChange={(e) =>
                            setOneTimePaymentDate(new Date(e.target.value))
                          }
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        />
                      </div>
                    </>
                  )}

                  {extraPaymentFrequency !== 'none' && comparison && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <p className="text-sm text-green-800 font-semibold mb-2">
                        Extra Payment Savings:
                      </p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>
                          • Interest saved:{' '}
                          {formatCurrency(comparison.savings.interestSaved)}
                        </li>
                        <li>
                          • Time saved: {comparison.savings.monthsSaved} months
                        </li>
                      </ul>
                    </div>
                  )}
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Payment
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      For {formatLoanTerm(results.numberOfPayments)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Total Payment</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            schedule.reduce(
                              (sum, p) => sum + p.payment + p.extraPayment,
                              0
                            )
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Interest</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            schedule.reduce(
                              (sum, p) => sum + p.interestPayment,
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Loan Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Loan Amount
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(loanAmount)}
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Interest Rate
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPercentage(interestRate / 100, 2)}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          Loan Term
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatLoanTerm(results.numberOfPayments)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Payoff Date
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatMonthYear(schedule[schedule.length - 1]?.date)}
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
                          onClick={() => setActiveChart('balance')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'balance'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <LineChartIcon className="w-4 h-4" />
                          Balance
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Split
                        </button>
                        {comparison && (
                          <button
                            onClick={() => setActiveChart('comparison')}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                              activeChart === 'comparison'
                                ? 'bg-indigo-600 text-white'
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
                      {activeChart === 'balance' && balanceChartData && (
                        <LineChart
                          data={balanceChartData}
                          options={lineChartOptions}
                        />
                      )}
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={pieChartOptions}
                        />
                      )}
                      {activeChart === 'comparison' &&
                        comparisonChartData &&
                        comparison && (
                          <BarChart
                            data={comparisonChartData}
                            options={barChartOptions}
                          />
                        )}
                    </div>
                  </div>

                  {/* Amortization Schedule */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Amortization Schedule ({schedule.length} payments)
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          showSchedule ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showSchedule && (
                      <div className="px-8 pb-8">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 font-semibold text-gray-700">
                                  #
                                </th>
                                <th className="text-left py-3 font-semibold text-gray-700">
                                  Date
                                </th>
                                <th className="text-right py-3 font-semibold text-gray-700">
                                  Payment
                                </th>
                                <th className="text-right py-3 font-semibold text-gray-700">
                                  Principal
                                </th>
                                <th className="text-right py-3 font-semibold text-gray-700">
                                  Interest
                                </th>
                                <th className="text-right py-3 font-semibold text-gray-700">
                                  Extra
                                </th>
                                <th className="text-right py-3 font-semibold text-gray-700">
                                  Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(showFullSchedule
                                ? schedule
                                : schedule.slice(0, 12)
                              ).map((payment) => (
                                <tr
                                  key={payment.paymentNumber}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="py-3 text-gray-600">
                                    {payment.paymentNumber}
                                  </td>
                                  <td className="py-3 text-gray-600">
                                    {formatMonthYear(payment.date)}
                                  </td>
                                  <td className="text-right py-3 text-gray-900 font-medium">
                                    {formatCurrency(payment.payment)}
                                  </td>
                                  <td className="text-right py-3 text-indigo-600 font-medium">
                                    {formatCurrency(payment.principalPayment)}
                                  </td>
                                  <td className="text-right py-3 text-red-600 font-medium">
                                    {formatCurrency(payment.interestPayment)}
                                  </td>
                                  <td className="text-right py-3 text-green-600 font-medium">
                                    {payment.extraPayment > 0
                                      ? formatCurrency(payment.extraPayment)
                                      : '-'}
                                  </td>
                                  <td className="text-right py-3 text-gray-900 font-semibold">
                                    {formatCurrency(payment.balance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {!showFullSchedule && schedule.length > 12 && (
                          <button
                            onClick={() => setShowFullSchedule(true)}
                            className="mt-4 w-full py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-medium"
                          >
                            Show All {schedule.length} Payments
                          </button>
                        )}

                        {showFullSchedule && (
                          <button
                            onClick={() => setShowFullSchedule(false)}
                            className="mt-4 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                          >
                            Show Less
                          </button>
                        )}
                      </div>
                    )}
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
                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            Monthly Payment Breakdown
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your monthly payment of{' '}
                            {formatCurrency(results.monthlyPayment)} includes
                            both principal and interest. Early payments have
                            more interest, while later payments pay more
                            principal.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-purple-600" />
                            Total Interest Cost
                          </h4>
                          <p className="text-sm text-gray-600">
                            Over the life of the loan, you will pay{' '}
                            {formatCurrency(
                              schedule.reduce(
                                (sum, p) => sum + p.interestPayment,
                                0
                              )
                            )}{' '}
                            in interest on your {formatCurrency(loanAmount)}{' '}
                            loan.
                          </p>
                        </div>

                        {comparison && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <Award className="w-4 h-4 text-green-600" />
                              Extra Payment Benefits
                            </h4>
                            <p className="text-sm text-gray-600">
                              By making extra payments, you will save{' '}
                              {formatCurrency(comparison.savings.interestSaved)}{' '}
                              in interest and pay off your loan{' '}
                              {comparison.savings.monthsSaved} months earlier.
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
              Understanding Loan Calculations
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Loan Payments Are Calculated
                </h3>
                <p className="mb-4">
                  Loan payments are calculated using the standard amortization
                  formula: M = P[r(1+r)^n]/[(1+r)^n-1], where:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• M = Monthly payment</li>
                  <li>• P = Principal loan amount</li>
                  <li>• r = Monthly interest rate (annual rate ÷ 12)</li>
                  <li>• n = Number of payments</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Understanding Amortization
                </h3>
                <p className="mb-4">
                  Amortization is the process of paying off a loan through
                  regular payments over time. Each payment is split between:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Principal</h4>
                    <p className="text-sm">
                      The portion that reduces your loan balance. This increases
                      with each payment as you owe less interest.
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Interest</h4>
                    <p className="text-sm">
                      The cost of borrowing money. This decreases with each
                      payment as your balance decreases.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Benefits of Making Extra Payments
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Save on Interest:</strong> Extra payments reduce
                    your principal faster, lowering the total interest paid over
                    the life of the loan.
                  </li>
                  <li>
                    <strong>Pay Off Faster:</strong> Additional principal
                    payments shorten your loan term, helping you become
                    debt-free sooner.
                  </li>
                  <li>
                    <strong>Build Equity Faster:</strong> For mortgages, extra
                    payments increase your home equity more quickly.
                  </li>
                  <li>
                    <strong>Financial Freedom:</strong> Paying off debt early
                    frees up money for other financial goals.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Types of Loans
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Mortgage</h4>
                    <p className="text-sm">
                      Long-term loans (15-30 years) for purchasing real estate,
                      typically with lower interest rates secured by the
                      property.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Auto Loan</h4>
                    <p className="text-sm">
                      Medium-term loans (3-7 years) for vehicle purchases,
                      secured by the vehicle with moderate interest rates.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Personal Loan
                    </h4>
                    <p className="text-sm">
                      Unsecured loans (1-7 years) for various purposes,
                      typically with higher interest rates due to no collateral.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Student Loan
                    </h4>
                    <p className="text-sm">
                      Education loans with varied terms, often with deferred
                      payment options and lower rates for federal loans.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Managing Your Loan
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Shop Around:</strong> Compare rates from multiple
                    lenders before committing to a loan
                  </li>
                  <li>
                    • <strong>Improve Credit Score:</strong> A higher credit
                    score can qualify you for better interest rates
                  </li>
                  <li>
                    • <strong>Make Bi-Weekly Payments:</strong> Pay half your
                    monthly payment every two weeks to make an extra payment per
                    year
                  </li>
                  <li>
                    • <strong>Round Up Payments:</strong> Round up to the
                    nearest $50 or $100 to pay extra principal
                  </li>
                  <li>
                    • <strong>Apply Windfalls:</strong> Use bonuses, tax
                    refunds, or other windfalls for extra payments
                  </li>
                  <li>
                    • <strong>Refinance When Beneficial:</strong> Consider
                    refinancing if rates drop significantly
                  </li>
                  <li>
                    • <strong>Avoid Prepayment Penalties:</strong> Check your
                    loan terms for prepayment restrictions
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
