'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  DollarSign,
  Info,
  TrendingDown,
  Calculator,
  Receipt,
  PieChart as PieChartIcon,
  BarChart3,
  Banknote,
  Building2,
  Briefcase,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateSalaryResults,
  validateSalaryInputs,
  formatCurrency,
  formatPercentage,
  getStateName,
  FICA_LIMITS_2025,
  STATE_TAX_RATES,
  type SalaryInputs,
  type SalaryResults,
  type StateCode,
  type SalaryPeriod,
  type FilingStatus,
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
import { Bar as BarChart, Pie as PieChart, Doughnut } from 'react-chartjs-2';

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

const SALARY_PERIODS: { value: SalaryPeriod; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biWeekly', label: 'Bi-Weekly' },
  { value: 'semiMonthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

const FILING_STATUSES: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married Filing Jointly' },
  { value: 'head', label: 'Head of Household' },
];

const STATE_OPTIONS: { value: StateCode; label: string }[] = [
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
  { value: 'DC', label: 'District of Columbia' },
];

export default function SalaryCalculator() {
  // Input states
  const [salary, setSalary] = useState<number>(75000);
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('annual');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [holidaysPerYear, setHolidaysPerYear] = useState<number>(10);
  const [vacationDays, setVacationDays] = useState<number>(15);
  const [federalFilingStatus, setFederalFilingStatus] =
    useState<FilingStatus>('single');
  const [state, setState] = useState<StateCode>('CA');
  const [stateFilingStatus, setStateFilingStatus] =
    useState<FilingStatus>('single');
  const [retirement401k, setRetirement401k] = useState<number>(5000);
  const [healthInsurance, setHealthInsurance] = useState<number>(2400);
  const [hsa, setHsa] = useState<number>(0);
  const [otherPreTax, setOtherPreTax] = useState<number>(0);
  const [postTaxDeductions, setPostTaxDeductions] = useState<number>(0);

  // Results
  const [results, setResults] = useState<SalaryResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'breakdown' | 'comparison' | 'periods'
  >('breakdown');
  const [selectedPeriod, setSelectedPeriod] = useState<
    'annual' | 'monthly' | 'biWeekly'
  >('annual');

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

  // Calculate Salary Results
  const calculate = useCallback(() => {
    const inputs: SalaryInputs = {
      salary,
      salaryPeriod,
      hoursPerWeek,
      daysPerWeek,
      holidaysPerYear,
      vacationDays,
      federalFilingStatus,
      state,
      stateFilingStatus,
      preTaxDeductions: {
        retirement401k,
        healthInsurance,
        hsa,
        other: otherPreTax,
      },
      postTaxDeductions,
    };

    const validationErrors = validateSalaryInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateSalaryResults(inputs);
    setResults(calculatedResults);
  }, [
    salary,
    salaryPeriod,
    hoursPerWeek,
    daysPerWeek,
    holidaysPerYear,
    vacationDays,
    federalFilingStatus,
    state,
    stateFilingStatus,
    retirement401k,
    healthInsurance,
    hsa,
    otherPreTax,
    postTaxDeductions,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Get breakdown chart data
  const getBreakdownChartData = () => {
    if (!results) return null;

    const data =
      selectedPeriod === 'annual'
        ? results.yearlyBreakdown
        : {
            gross: results.gross[selectedPeriod],
            federalTax: results.federalTax[selectedPeriod],
            stateTax: results.stateTax[selectedPeriod],
            ficaTax: results.fica.total[selectedPeriod],
            preTaxDeductions: results.preTaxDeductions[selectedPeriod],
            postTaxDeductions: results.postTaxDeductions[selectedPeriod],
            netIncome: results.net[selectedPeriod],
          };

    return {
      labels: [
        'Federal Tax',
        'State Tax',
        'FICA',
        'Pre-Tax Deductions',
        'Post-Tax Deductions',
        'Net Pay',
      ],
      datasets: [
        {
          data: [
            data.federalTax,
            data.stateTax,
            data.ficaTax,
            data.preTaxDeductions,
            data.postTaxDeductions,
            data.netIncome,
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)', // Federal - Red
            'rgba(249, 115, 22, 0.8)', // State - Orange
            'rgba(245, 158, 11, 0.8)', // FICA - Amber
            'rgba(139, 92, 246, 0.8)', // Pre-tax - Purple
            'rgba(236, 72, 153, 0.8)', // Post-tax - Pink
            'rgba(16, 185, 129, 0.8)', // Net - Emerald
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(16, 185, 129, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Get comparison chart data
  const getComparisonChartData = () => {
    if (!results) return null;

    return {
      labels: ['Gross Pay', 'Net Pay'],
      datasets: [
        {
          label: 'Amount',
          data: [results.gross.annual, results.net.annual],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(16, 185, 129, 0.7)',
          ],
          borderColor: ['rgba(99, 102, 241, 1)', 'rgba(16, 185, 129, 1)'],
          borderWidth: 2,
        },
      ],
    };
  };

  // Get periods chart data
  const getPeriodsChartData = () => {
    if (!results) return null;

    return {
      labels: ['Annual', 'Monthly', 'Bi-Weekly', 'Weekly', 'Daily', 'Hourly'],
      datasets: [
        {
          label: 'Gross Pay',
          data: [
            results.gross.annual,
            results.gross.monthly,
            results.gross.biWeekly,
            results.gross.weekly,
            results.gross.daily,
            results.gross.hourly,
          ],
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
        },
        {
          label: 'Net Pay',
          data: [
            results.net.annual,
            results.net.monthly,
            results.net.biWeekly,
            results.net.weekly,
            results.net.daily,
            results.net.hourly,
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const breakdownChartData = getBreakdownChartData();
  const comparisonChartData = getComparisonChartData();
  const periodsChartData = getPeriodsChartData();

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
            const value = formatCurrency(context.parsed);
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
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
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            if (Number(value) >= 1000) {
              return '$' + (Number(value) / 1000).toFixed(0) + 'K';
            }
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.label || '';
            return `${label}: ${formatCurrency(context.parsed.y)}`;
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
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                <Banknote className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Salary Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate your take-home pay, taxes, and deductions
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section - Two Columns (40% / 60%) */}
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
              {/* Salary Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Salary Information
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
                      Salary Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {salaryPeriod === 'hourly' ? '$' : '$'}
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(salary)}
                        onChange={(e) =>
                          setSalary(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder={
                          salaryPeriod === 'hourly' ? '25.00' : '75,000'
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pay Period
                    </label>
                    <select
                      value={salaryPeriod}
                      onChange={(e) =>
                        setSalaryPeriod(e.target.value as SalaryPeriod)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                    >
                      {SALARY_PERIODS.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hours/Week
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={hoursPerWeek || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setHoursPerWeek(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Days/Week
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={daysPerWeek || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setDaysPerWeek(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Holidays/Year
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={holidaysPerYear || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setHolidaysPerYear(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vacation Days
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={vacationDays || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setVacationDays(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="15"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tax Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Federal Filing Status
                    </label>
                    <select
                      value={federalFilingStatus}
                      onChange={(e) =>
                        setFederalFilingStatus(e.target.value as FilingStatus)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                    >
                      {FILING_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value as StateCode)}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                    >
                      {STATE_OPTIONS.map((stateOption) => (
                        <option
                          key={stateOption.value}
                          value={stateOption.value}
                        >
                          {stateOption.label}
                          {STATE_TAX_RATES[stateOption.value].type === 'none' &&
                            ' (No Tax)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {STATE_TAX_RATES[state].type !== 'none' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State Filing Status
                      </label>
                      <select
                        value={stateFilingStatus}
                        onChange={(e) =>
                          setStateFilingStatus(e.target.value as FilingStatus)
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                      >
                        {FILING_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                      401(k) Contribution (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(retirement401k)}
                        onChange={(e) =>
                          setRetirement401k(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="5,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      2025 Limit:{' '}
                      {formatCurrency(FICA_LIMITS_2025.MAX_401K_CONTRIBUTION)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Health Insurance (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(healthInsurance)}
                        onChange={(e) =>
                          setHealthInsurance(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="2,400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      HSA Contribution (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(hsa)}
                        onChange={(e) =>
                          setHsa(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      2025 Limit:{' '}
                      {formatCurrency(FICA_LIMITS_2025.MAX_HSA_INDIVIDUAL)}{' '}
                      (Individual) /{' '}
                      {formatCurrency(FICA_LIMITS_2025.MAX_HSA_FAMILY)} (Family)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Other Pre-Tax Deductions (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(otherPreTax)}
                        onChange={(e) =>
                          setOtherPreTax(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
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
              {results && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-emerald-600 to-teal-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Wallet className="w-4 h-4" />
                      Net Take-Home Pay
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.net.annual)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Annual after taxes and deductions
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Monthly</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.net.monthly)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Bi-Weekly</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.net.biWeekly)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Salary Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Salary Breakdown
                    </h3>

                    <div className="space-y-4">
                      {/* Period Selector */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setSelectedPeriod('annual')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedPeriod === 'annual'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Annual
                        </button>
                        <button
                          onClick={() => setSelectedPeriod('monthly')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedPeriod === 'monthly'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setSelectedPeriod('biWeekly')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedPeriod === 'biWeekly'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Bi-Weekly
                        </button>
                      </div>

                      {/* Breakdown Items */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                          <span className="font-semibold text-gray-900">
                            Gross Pay
                          </span>
                          <span className="font-bold text-xl text-gray-900">
                            {formatCurrency(results.gross[selectedPeriod])}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Pre-Tax Deductions
                          </span>
                          <span className="font-medium text-gray-900">
                            -
                            {formatCurrency(
                              results.preTaxDeductions[selectedPeriod]
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Federal Tax</span>
                          <span className="font-medium text-red-600">
                            -
                            {formatCurrency(results.federalTax[selectedPeriod])}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            {getStateName(state)} Tax
                          </span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(results.stateTax[selectedPeriod])}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Social Security</span>
                          <span className="font-medium text-orange-600">
                            -
                            {formatCurrency(
                              results.fica.socialSecurity[selectedPeriod]
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Medicare</span>
                          <span className="font-medium text-orange-600">
                            -
                            {formatCurrency(
                              results.fica.medicare[selectedPeriod]
                            )}
                          </span>
                        </div>

                        {results.fica.additionalMedicare[selectedPeriod] >
                          0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Additional Medicare
                            </span>
                            <span className="font-medium text-orange-600">
                              -
                              {formatCurrency(
                                results.fica.additionalMedicare[selectedPeriod]
                              )}
                            </span>
                          </div>
                        )}

                        {results.postTaxDeductions[selectedPeriod] > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Post-Tax Deductions
                            </span>
                            <span className="font-medium text-gray-900">
                              -
                              {formatCurrency(
                                results.postTaxDeductions[selectedPeriod]
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="font-semibold text-gray-900">
                            Net Pay
                          </span>
                          <span className="font-bold text-2xl text-emerald-600">
                            {formatCurrency(results.net[selectedPeriod])}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Key Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Take-Home
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatPercentage(results.takeHomePercentage)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          of gross pay
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingDown className="w-4 h-4" />
                          Effective Tax
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatPercentage(results.effectiveTaxRate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          overall tax rate
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Receipt className="w-4 h-4" />
                          Marginal Tax
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPercentage(results.marginalTaxRate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          on next dollar
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Building2 className="w-4 h-4" />
                          Total Taxes
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            results.federalTax.annual +
                              results.stateTax.annual +
                              results.fica.total.annual
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          annual taxes
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* All Pay Periods */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Pay Period Conversions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">Hourly</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.hourly)} →{' '}
                            {formatCurrency(results.net.hourly)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Daily</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.daily)} →{' '}
                            {formatCurrency(results.net.daily)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Weekly</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.weekly)} →{' '}
                            {formatCurrency(results.net.weekly)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Bi-Weekly</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.biWeekly)} →{' '}
                            {formatCurrency(results.net.biWeekly)}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600">
                            Semi-Monthly
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.semiMonthly)} →{' '}
                            {formatCurrency(results.net.semiMonthly)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Monthly</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.monthly)} →{' '}
                            {formatCurrency(results.net.monthly)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quarterly</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.quarterly)} →{' '}
                            {formatCurrency(results.net.quarterly)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Annual</div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(results.gross.annual)} →{' '}
                            {formatCurrency(results.net.annual)}
                          </div>
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
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Breakdown
                        </button>
                        <button
                          onClick={() => setActiveChart('comparison')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'comparison'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Compare
                        </button>
                        <button
                          onClick={() => setActiveChart('periods')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'periods'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Calculator className="w-4 h-4" />
                          Periods
                        </button>
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={pieChartOptions}
                        />
                      )}
                      {activeChart === 'comparison' && comparisonChartData && (
                        <Doughnut
                          data={comparisonChartData}
                          options={doughnutChartOptions}
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
                        <div className="bg-emerald-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            Your Take-Home Pay
                          </h4>
                          <p className="text-sm text-gray-600">
                            Based on your inputs, your annual take-home pay is{' '}
                            {formatCurrency(results.net.annual)} after all taxes
                            and deductions. This represents{' '}
                            {formatPercentage(results.takeHomePercentage)} of
                            your gross salary.
                          </p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-red-600" />
                            Tax Breakdown
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your effective tax rate is{' '}
                            {formatPercentage(results.effectiveTaxRate)},
                            including federal tax (
                            {formatCurrency(results.federalTax.annual)}), state
                            tax ({formatCurrency(results.stateTax.annual)}), and
                            FICA taxes (
                            {formatCurrency(results.fica.total.annual)}).
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                            Pre-Tax Benefits
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your pre-tax deductions of{' '}
                            {formatCurrency(results.preTaxDeductions.annual)}{' '}
                            reduce your taxable income, saving you money on
                            taxes. These include 401(k), health insurance, and
                            HSA contributions.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            FICA Taxes
                          </h4>
                          <p className="text-sm text-gray-600">
                            FICA includes Social Security (6.2% up to $
                            {FICA_LIMITS_2025.SOCIAL_SECURITY_WAGE_BASE.toLocaleString()}
                            ) and Medicare (1.45% with an additional 0.9% on
                            income over $200,000).
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
              Understanding Salary and Taxes
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Salary Calculations Work
                </h3>
                <p className="mb-4">
                  This calculator helps you understand your take-home pay by
                  accounting for all taxes and deductions. It converts between
                  different pay periods and shows you exactly where your money
                  goes.
                </p>
                <p className="text-sm">
                  The calculator assumes 52 working weeks or 260 working days
                  per year, and adjusts for holidays and vacation days to
                  provide both unadjusted and adjusted calculations.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 Federal Tax Brackets
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Single Filers
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• 10% on income up to $11,925</li>
                      <li>• 12% on income $11,925 to $48,475</li>
                      <li>• 22% on income $48,475 to $103,350</li>
                      <li>• 24% on income $103,350 to $197,300</li>
                      <li>• 32% on income $197,300 to $250,525</li>
                      <li>• 35% on income $250,525 to $626,350</li>
                      <li>• 37% on income over $626,350</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Standard Deductions
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Single: $15,750</li>
                      <li>• Married Filing Jointly: $31,500</li>
                      <li>• Head of Household: $23,625</li>
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
                    <h4 className="font-bold text-gray-900 mb-1">
                      Social Security
                    </h4>
                    <p className="text-sm">
                      6.2% of wages up to $176,100 (2025 wage base limit)
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">Medicare</h4>
                    <p className="text-sm">
                      1.45% on all wages, plus 0.9% additional tax on income
                      over $200,000 (single) or $250,000 (married filing
                      jointly)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pre-Tax vs Post-Tax Deductions
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Pre-Tax Deductions
                    </h4>
                    <p className="text-sm mb-2">
                      Reduce your taxable income, saving you money on taxes:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>• 401(k) contributions</li>
                      <li>• Health insurance premiums</li>
                      <li>• HSA contributions</li>
                      <li>• FSA contributions</li>
                      <li>• Commuter benefits</li>
                    </ul>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Post-Tax Deductions
                    </h4>
                    <p className="text-sm mb-2">
                      Taken from your net pay after taxes are calculated:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li>• Roth 401(k) contributions</li>
                      <li>• Union dues</li>
                      <li>• Charitable donations</li>
                      <li>• Garnishments</li>
                      <li>• Life insurance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  State Income Taxes
                </h3>
                <p className="mb-4">
                  State income tax varies significantly across the United
                  States. Nine states have no income tax, while others have
                  rates ranging from under 3% to over 13%.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      No Income Tax States
                    </h4>
                    <p className="text-sm">
                      Alaska, Florida, Nevada, New Hampshire*, South Dakota,
                      Tennessee, Texas, Washington, Wyoming
                    </p>
                    <p className="text-xs mt-2">
                      *NH taxes interest and dividends only
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Highest Tax States
                    </h4>
                    <p className="text-sm">
                      California (up to 13.3%), Hawaii (11%), New York (10.9%),
                      New Jersey (10.75%), Oregon (9.9%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pay Period Types
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Weekly:</strong> 52 paychecks per year (every week)
                  </li>
                  <li>
                    <strong>Bi-Weekly:</strong> 26 paychecks per year (every 2
                    weeks)
                  </li>
                  <li>
                    <strong>Semi-Monthly:</strong> 24 paychecks per year (twice
                    a month)
                  </li>
                  <li>
                    <strong>Monthly:</strong> 12 paychecks per year (once a
                    month)
                  </li>
                </ul>
                <p className="mt-3 text-sm">
                  Note: Bi-weekly and semi-monthly are different. Bi-weekly
                  results in two extra paychecks per year compared to
                  semi-monthly.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Maximizing Your Take-Home Pay
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Contribute to 401(k):</strong> Reduces taxable
                    income and saves for retirement
                  </li>
                  <li>
                    • <strong>Use HSA/FSA:</strong> Pay for medical expenses
                    with pre-tax dollars
                  </li>
                  <li>
                    • <strong>Review withholdings:</strong> Ensure you&apos;re
                    not overpaying taxes
                  </li>
                  <li>
                    • <strong>Consider state taxes:</strong> Some states have no
                    income tax
                  </li>
                  <li>
                    • <strong>Maximize pre-tax benefits:</strong> Use all
                    available pre-tax deductions
                  </li>
                  <li>
                    • <strong>Track deductions:</strong> Keep records for
                    itemized deductions
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • This calculator provides estimates based on 2025 tax rates
                    and standard deductions
                  </li>
                  <li>
                    • Actual taxes may vary based on additional factors like
                    credits and itemized deductions
                  </li>
                  <li>
                    • State tax calculations are simplified and may not reflect
                    all local taxes
                  </li>
                  <li>• Consult a tax professional for personalized advice</li>
                  <li>
                    • Remember to update your W-4 if your circumstances change
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
