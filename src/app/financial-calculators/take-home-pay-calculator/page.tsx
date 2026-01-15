'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingDown,
  Receipt,
  Shield,
  Calculator,
  Info,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateTakeHomePay,
  validateTakeHomePayInputs,
  formatCurrency,
  formatPercentage,
  type TakeHomePayInputs,
  type TakeHomePayResults,
  type PayFrequency,
  type FilingStatus,
  STATE_TAX_RATES,
} from './calculations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Bar as BarChart, Pie as PieChart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const US_STATES = [
  { value: 'none', label: 'No State Tax' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export default function TakeHomePayCalculator() {
  // Input states
  const [grossSalary, setGrossSalary] = useState<number>(75000);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>('annually');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [state, setState] = useState<string>('none');
  const [preTaxDeductions, setPreTaxDeductions] = useState<number>(0);
  const [postTaxDeductions, setPostTaxDeductions] = useState<number>(0);

  // Results
  const [results, setResults] = useState<TakeHomePayResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate Take Home Pay
  const calculate = useCallback(() => {
    const inputs: TakeHomePayInputs = {
      grossSalary,
      payFrequency,
      filingStatus,
      state,
      federalAllowances: 0,
      preTaxDeductions,
      postTaxDeductions,
    };

    const validationErrors = validateTakeHomePayInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateTakeHomePay(inputs);
    setResults(calculatedResults);
  }, [
    grossSalary,
    payFrequency,
    filingStatus,
    state,
    preTaxDeductions,
    postTaxDeductions,
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

  // Get breakdown chart data
  const getBreakdownChartData = () => {
    if (!results) return null;

    return {
      labels: [
        'Federal Tax',
        'Social Security',
        'Medicare',
        'State Tax',
        'Deductions',
      ],
      datasets: [
        {
          data: [
            results.federalIncomeTax,
            results.socialSecurityTax,
            results.medicareTax,
            results.stateIncomeTax,
            results.preTaxDeductions + results.postTaxDeductions,
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(99, 102, 241, 1)',
            'rgba(139, 92, 246, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Get pay period comparison data
  const getPayPeriodChartData = () => {
    if (!results) return null;

    return {
      labels: ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'],
      datasets: [
        {
          label: 'Gross Pay',
          data: [
            results.grossPayByPeriod.weekly,
            results.grossPayByPeriod.biWeekly,
            results.grossPayByPeriod.semiMonthly,
            results.grossPayByPeriod.monthly,
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Net Pay',
          data: [
            results.netPayByPeriod.weekly,
            results.netPayByPeriod.biWeekly,
            results.netPayByPeriod.semiMonthly,
            results.netPayByPeriod.monthly,
          ],
          backgroundColor: 'rgba(6, 182, 212, 0.7)',
          borderColor: 'rgba(6, 182, 212, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const breakdownChartData = getBreakdownChartData();
  const payPeriodChartData = getPayPeriodChartData();

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Take Home Pay Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate your net pay after federal, FICA, and state taxes
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
              {/* Income Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Income Information
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
                      Gross Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(grossSalary)}
                        onChange={(e) =>
                          setGrossSalary(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors font-medium"
                        placeholder="75,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pay Frequency
                    </label>
                    <select
                      value={payFrequency}
                      onChange={(e) =>
                        setPayFrequency(e.target.value as PayFrequency)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="annually">Annually</option>
                      <option value="monthly">Monthly</option>
                      <option value="semi-monthly">
                        Semi-Monthly (24/year)
                      </option>
                      <option value="bi-weekly">Bi-Weekly (26/year)</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filing Status
                    </label>
                    <select
                      value={filingStatus}
                      onChange={(e) =>
                        setFilingStatus(e.target.value as FilingStatus)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                      <option value="married-separate">
                        Married Filing Separately
                      </option>
                      <option value="head-of-household">
                        Head of Household
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors font-medium"
                    >
                      {US_STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                          {s.value !== 'none' &&
                            ` (${formatPercentage(STATE_TAX_RATES[s.value] * 100, 2)})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Deductions
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pre-Tax Deductions (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(preTaxDeductions)}
                        onChange={(e) =>
                          setPreTaxDeductions(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors font-medium"
                        placeholder="5,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      401(k), HSA, health insurance, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Post-Tax Deductions (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(postTaxDeductions)}
                        onChange={(e) =>
                          setPostTaxDeductions(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Roth IRA, after-tax savings, etc.
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-cyan-600 to-blue-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Wallet className="w-4 h-4" />
                      Annual Take-Home Pay
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.netPay)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      {formatPercentage(results.takeHomePercentage, 1)} of gross
                      income
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Gross Pay</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.grossPay)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Taxes</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalTaxes)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pay Period Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Take-Home by Pay Period
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                        <span className="font-semibold text-gray-900">
                          Weekly
                        </span>
                        <span className="text-lg font-bold text-cyan-600">
                          {formatCurrency(results.netPayByPeriod.weekly)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                        <span className="font-semibold text-gray-900">
                          Bi-Weekly
                        </span>
                        <span className="text-lg font-bold text-cyan-600">
                          {formatCurrency(results.netPayByPeriod.biWeekly)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                        <span className="font-semibold text-gray-900">
                          Semi-Monthly
                        </span>
                        <span className="text-lg font-bold text-cyan-600">
                          {formatCurrency(results.netPayByPeriod.semiMonthly)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                        <span className="font-semibold text-gray-900">
                          Monthly
                        </span>
                        <span className="text-lg font-bold text-cyan-600">
                          {formatCurrency(results.netPayByPeriod.monthly)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Tax & Deduction Breakdown
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Receipt className="w-4 h-4" />
                          Federal Tax
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(results.federalIncomeTax)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPercentage(
                            (results.federalIncomeTax / results.grossPay) * 100,
                            1
                          )}{' '}
                          of gross
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Shield className="w-4 h-4" />
                          Social Security
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(results.socialSecurityTax)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          6.2% FICA
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Medicare
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {formatCurrency(results.medicareTax)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          1.45% (+ 0.9% over $200k)
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingDown className="w-4 h-4" />
                          State Tax
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(results.stateIncomeTax)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {state !== 'none'
                            ? formatPercentage(STATE_TAX_RATES[state] * 100, 2)
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          Effective Tax Rate
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPercentage(results.effectiveTaxRate, 1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Visual Breakdown
                    </h3>

                    <div className="mb-8">
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Where Your Money Goes
                      </h4>
                      <div className="h-64">
                        {breakdownChartData && (
                          <PieChart
                            data={breakdownChartData}
                            options={pieChartOptions}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4">
                        Pay by Period Comparison
                      </h4>
                      <div className="h-64">
                        {payPeriodChartData && (
                          <BarChart
                            data={payPeriodChartData}
                            options={barChartOptions}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-5 h-5 text-green-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Tips to Increase Take-Home Pay
                      </h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Calculator className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>
                          Maximize pre-tax deductions like 401(k) and HSA
                          contributions
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calculator className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>
                          Review your W-4 withholdings to optimize tax payments
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calculator className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>
                          Consider relocating to a state with lower or no income
                          tax
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Calculator className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>
                          Take advantage of employer-sponsored health insurance
                          to reduce taxable income
                        </span>
                      </li>
                    </ul>
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
              Understanding Your Paycheck
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Take-Home Pay?
                </h3>
                <p className="mb-4">
                  Take-home pay, also known as net pay, is the amount of money
                  you actually receive in your paycheck after all deductions.
                  This includes federal income tax, FICA taxes (Social Security
                  and Medicare), state and local taxes, and any other deductions
                  like health insurance or retirement contributions.
                </p>
                <p className="text-sm">
                  Understanding your take-home pay is crucial for budgeting and
                  financial planning. The difference between your gross salary
                  and net pay can be significant, often 20-30% or more depending
                  on your income level and location.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 Federal Tax Brackets
                </h3>
                <p className="mb-4">
                  The U.S. uses a progressive tax system, meaning higher income
                  is taxed at higher rates. Your income is divided into
                  brackets, and each portion is taxed at its corresponding rate.
                </p>
                <div className="space-y-3">
                  <div className="bg-cyan-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Single Filers
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• 10% on income up to $11,925</li>
                      <li>• 12% on $11,925 - $48,400</li>
                      <li>• 22% on $48,400 - $103,350</li>
                      <li>• 24% on $103,350 - $197,300</li>
                      <li>• 32% on $197,300 - $250,500</li>
                      <li>• 35% on $250,500 - $626,350</li>
                      <li>• 37% on income over $626,350</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Married Filing Jointly
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• 10% on income up to $23,850</li>
                      <li>• 12% on $23,850 - $96,800</li>
                      <li>• 22% on $96,800 - $206,700</li>
                      <li>• 24% on $206,700 - $394,600</li>
                      <li>• 32% on $394,600 - $501,000</li>
                      <li>• 35% on $501,000 - $751,600</li>
                      <li>• 37% on income over $751,600</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  FICA Taxes (Social Security & Medicare)
                </h3>
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Social Security Tax
                    </h4>
                    <p className="text-sm">
                      <strong>Rate:</strong> 6.2% of wages
                      <br />
                      <strong>2025 Wage Base:</strong> $176,100
                      <br />
                      <strong>Maximum Tax:</strong> $10,918
                    </p>
                    <p className="text-sm mt-2">
                      Social Security tax is capped at the wage base limit. Any
                      income above $176,100 is not subject to this tax.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Medicare Tax
                    </h4>
                    <p className="text-sm">
                      <strong>Rate:</strong> 1.45% of all wages (no cap)
                      <br />
                      <strong>Additional Medicare:</strong> 0.9% on income over
                      $200,000 (single) or $250,000 (married)
                    </p>
                    <p className="text-sm mt-2">
                      Unlike Social Security, Medicare tax applies to all earned
                      income. High earners pay an additional 0.9% on income
                      above the threshold.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pre-Tax vs Post-Tax Deductions
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Pre-Tax Deductions
                    </h4>
                    <p className="text-sm mb-2">
                      Reduce your taxable income, saving you money on taxes:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>• 401(k) contributions</li>
                      <li>• Traditional IRA</li>
                      <li>• Health Savings Account (HSA)</li>
                      <li>• Health insurance premiums</li>
                      <li>• Flexible Spending Account (FSA)</li>
                      <li>• Commuter benefits</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Post-Tax Deductions
                    </h4>
                    <p className="text-sm mb-2">
                      Deducted after taxes are calculated:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>• Roth IRA contributions</li>
                      <li>• Life insurance premiums</li>
                      <li>• Disability insurance</li>
                      <li>• Union dues</li>
                      <li>• Charitable contributions</li>
                      <li>• Garnishments</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  State Income Taxes
                </h3>
                <p className="mb-4">
                  State income tax varies significantly by location. Some states
                  have no income tax, while others have rates exceeding 10%.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      No Income Tax
                    </h4>
                    <p className="text-xs">
                      Alaska, Florida, Nevada, South Dakota, Tennessee, Texas,
                      Washington, Wyoming
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      Low Tax (under 5%)
                    </h4>
                    <p className="text-xs">
                      Arizona, Colorado, Illinois, Indiana, Kentucky,
                      Mississippi, North Carolina, Pennsylvania
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      High Tax (over 8%)
                    </h4>
                    <p className="text-xs">
                      California, Hawaii, Minnesota, New Jersey, New York,
                      Oregon
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pay Frequency Matters
                </h3>
                <p className="mb-4">
                  Your pay frequency affects how taxes are withheld and your
                  cash flow management:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Weekly:</strong> 52 paychecks per year - more
                    frequent but smaller amounts
                  </li>
                  <li>
                    <strong>Bi-Weekly:</strong> 26 paychecks per year - two
                    months with 3 paychecks
                  </li>
                  <li>
                    <strong>Semi-Monthly:</strong> 24 paychecks per year -
                    consistent timing (e.g., 15th and 30th)
                  </li>
                  <li>
                    <strong>Monthly:</strong> 12 paychecks per year - requires
                    careful budgeting
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Important Notes
                  </h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    • This calculator uses 2025 federal tax brackets and FICA
                    rates
                  </li>
                  <li>
                    • State tax calculations are simplified estimates using
                    approximate average rates
                  </li>
                  <li>
                    • Actual withholding may vary based on W-4 form elections
                    and employer policies
                  </li>
                  <li>
                    • Local taxes (city, county) are not included in these
                    calculations
                  </li>
                  <li>
                    • Standard deduction is automatically applied based on
                    filing status
                  </li>
                  <li>
                    • This is an estimate for planning purposes only - consult a
                    tax professional for precise calculations
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
