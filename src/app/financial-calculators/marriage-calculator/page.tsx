'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  DollarSign,
  Info,
  Heart,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Calculator,
  Award,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateMarriageTax,
  formatCurrency,
  formatPercentage,
  validateInputs,
  type MarriageCalculatorInputs,
  type MarriageCalculatorResults,
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
  type TooltipItem,
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

export default function MarriageCalculator() {
  // Person 1 states
  const [person1Salary, setPerson1Salary] = useState<number>(75000);
  const [person1Interest] = useState<number>(0);
  const [person1ShortTermGains] = useState<number>(0);
  const [person1LongTermGains] = useState<number>(0);
  const [person1Retirement, setPerson1Retirement] = useState<number>(0);
  const [person1HealthInsurance, setPerson1HealthInsurance] =
    useState<number>(0);
  const [person1OtherDeductions] = useState<number>(0);
  const [person1FilingStatus, setPerson1FilingStatus] = useState<
    'single' | 'head_of_household'
  >('single');

  // Person 2 states
  const [person2Salary, setPerson2Salary] = useState<number>(50000);
  const [person2Interest] = useState<number>(0);
  const [person2ShortTermGains] = useState<number>(0);
  const [person2LongTermGains] = useState<number>(0);
  const [person2Retirement, setPerson2Retirement] = useState<number>(0);
  const [person2HealthInsurance, setPerson2HealthInsurance] =
    useState<number>(0);
  const [person2OtherDeductions] = useState<number>(0);
  const [person2FilingStatus, setPerson2FilingStatus] = useState<
    'single' | 'head_of_household'
  >('single');

  // Shared states
  const [dependents, setDependents] = useState<number>(0);
  const [useStandardDeduction, setUseStandardDeduction] =
    useState<boolean>(true);
  const [stateLocalTaxRate, setStateLocalTaxRate] = useState<number>(5);

  // Itemized deductions (if not using standard)
  const [mortgageInterest, setMortgageInterest] = useState<number>(0);
  const [charitableDonations, setCharitableDonations] = useState<number>(0);
  const [stateLocalTaxesPaid] = useState<number>(0);

  // Results
  const [results, setResults] = useState<MarriageCalculatorResults | null>(
    null
  );
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<'comparison' | 'breakdown'>(
    'comparison'
  );

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

  // Calculate marriage tax
  const calculate = useCallback(() => {
    const inputs: MarriageCalculatorInputs = {
      person1: {
        salary: person1Salary,
        interestDividends: person1Interest,
        capitalGainsShortTerm: person1ShortTermGains,
        capitalGainsLongTerm: person1LongTermGains,
        retirement401k: person1Retirement,
        healthInsurance: person1HealthInsurance,
        otherPreTaxDeductions: person1OtherDeductions,
        filingStatus: person1FilingStatus,
        itemizedDeductions: !useStandardDeduction
          ? {
              mortgageInterest: mortgageInterest / 2,
              charitableDonations: charitableDonations / 2,
              stateLocalTaxes: stateLocalTaxesPaid / 2,
              medicalExpenses: 0,
              otherDeductions: 0,
            }
          : undefined,
      },
      person2: {
        salary: person2Salary,
        interestDividends: person2Interest,
        capitalGainsShortTerm: person2ShortTermGains,
        capitalGainsLongTerm: person2LongTermGains,
        retirement401k: person2Retirement,
        healthInsurance: person2HealthInsurance,
        otherPreTaxDeductions: person2OtherDeductions,
        filingStatus: person2FilingStatus,
        itemizedDeductions: !useStandardDeduction
          ? {
              mortgageInterest: mortgageInterest / 2,
              charitableDonations: charitableDonations / 2,
              stateLocalTaxes: stateLocalTaxesPaid / 2,
              medicalExpenses: 0,
              otherDeductions: 0,
            }
          : undefined,
      },
      dependents,
      useStandardDeduction,
      stateLocalTaxRate,
    };

    const validationErrors = validateInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateMarriageTax(inputs);
    setResults(calculatedResults);
  }, [
    person1Salary,
    person1Interest,
    person1ShortTermGains,
    person1LongTermGains,
    person1Retirement,
    person1HealthInsurance,
    person1OtherDeductions,
    person1FilingStatus,
    person2Salary,
    person2Interest,
    person2ShortTermGains,
    person2LongTermGains,
    person2Retirement,
    person2HealthInsurance,
    person2OtherDeductions,
    person2FilingStatus,
    dependents,
    useStandardDeduction,
    stateLocalTaxRate,
    mortgageInterest,
    charitableDonations,
    stateLocalTaxesPaid,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Prepare comparison chart data
  const getComparisonChartData = () => {
    if (!results) return null;

    return {
      labels: [
        'Person 1 (Single)',
        'Person 2 (Single)',
        'Combined (Single)',
        'Married Filing Jointly',
      ],
      datasets: [
        {
          label: 'Federal Tax',
          data: [
            results.person1.finalTax,
            results.person2.finalTax,
            results.person1.finalTax + results.person2.finalTax,
            results.marriedFilingJointly.finalTax,
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(99, 102, 241, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            results.marriagePenaltyOrBonus < 0
              ? 'rgba(34, 197, 94, 0.7)'
              : 'rgba(251, 146, 60, 0.7)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(99, 102, 241, 1)',
            'rgba(239, 68, 68, 1)',
            results.marriagePenaltyOrBonus < 0
              ? 'rgba(34, 197, 94, 1)'
              : 'rgba(251, 146, 60, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare breakdown chart data
  const getBreakdownChartData = () => {
    if (!results) return null;

    const totalIncome = results.totalHouseholdIncome;
    const taxSingle = results.separateTotalTax;
    const afterTaxSingle = totalIncome - taxSingle;

    return {
      labels: ['After-Tax Income', 'Total Taxes'],
      datasets: [
        {
          label: 'Filing Separately',
          data: [afterTaxSingle, taxSingle],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderColor: ['rgba(99, 102, 241, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 2,
        },
      ],
    };
  };

  const comparisonChartData = getComparisonChartData();
  const breakdownChartData = getBreakdownChartData();

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return formatCurrency(context.parsed.y ?? 0);
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
          label: function (context: TooltipItem<'pie'>) {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Marriage Tax Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Compare taxes when filing jointly vs separately
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
              {/* Person 1 Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Person 1 Income
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
                      Annual Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(person1Salary)}
                        onChange={(e) =>
                          setPerson1Salary(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                        placeholder="75,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filing Status (if not married)
                    </label>
                    <select
                      value={person1FilingStatus}
                      onChange={(e) =>
                        setPerson1FilingStatus(
                          e.target.value as 'single' | 'head_of_household'
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="head_of_household">
                        Head of Household
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        401(k) Contribution
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(person1Retirement)}
                          onChange={(e) =>
                            setPerson1Retirement(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Health Insurance
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(person1HealthInsurance)}
                          onChange={(e) =>
                            setPerson1HealthInsurance(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Person 2 Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Person 2 Income
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(person2Salary)}
                        onChange={(e) =>
                          setPerson2Salary(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                        placeholder="50,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filing Status (if not married)
                    </label>
                    <select
                      value={person2FilingStatus}
                      onChange={(e) =>
                        setPerson2FilingStatus(
                          e.target.value as 'single' | 'head_of_household'
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="head_of_household">
                        Head of Household
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        401(k) Contribution
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(person2Retirement)}
                          onChange={(e) =>
                            setPerson2Retirement(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Health Insurance
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(person2HealthInsurance)}
                          onChange={(e) =>
                            setPerson2HealthInsurance(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions & Other */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Deductions & Other
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Dependents
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={dependents || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setDependents(value ? Number(value) : 0);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State/Local Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={stateLocalTaxRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setStateLocalTaxRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium"
                        placeholder="5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="standardDeduction"
                      checked={useStandardDeduction}
                      onChange={(e) =>
                        setUseStandardDeduction(e.target.checked)
                      }
                      className="w-5 h-5 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                    />
                    <label
                      htmlFor="standardDeduction"
                      className="ml-3 text-sm font-semibold text-gray-700"
                    >
                      Use standard deduction
                    </label>
                  </div>

                  {!useStandardDeduction && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Enter combined itemized deductions:
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Mortgage Interest
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(mortgageInterest)}
                              onChange={(e) =>
                                setMortgageInterest(
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-7 pr-3 py-2 rounded-lg text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Charitable Donations
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(charitableDonations)}
                              onChange={(e) =>
                                setCharitableDonations(
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-7 pr-3 py-2 rounded-lg text-gray-900 border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors font-medium text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
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
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br ${
                      results.marriagePenaltyOrBonus < 0
                        ? 'from-green-600 to-emerald-600'
                        : results.marriagePenaltyOrBonus > 0
                          ? 'from-orange-600 to-red-600'
                          : 'from-blue-600 to-indigo-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      {results.marriagePenaltyOrBonus < 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          Marriage Tax Bonus
                        </>
                      ) : results.marriagePenaltyOrBonus > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          Marriage Tax Penalty
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          Tax Neutral
                        </>
                      )}
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(Math.abs(results.marriagePenaltyOrBonus))}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      {results.marriagePenaltyOrBonus < 0
                        ? 'Annual tax savings from marriage'
                        : results.marriagePenaltyOrBonus > 0
                          ? 'Additional annual tax from marriage'
                          : 'No tax impact from marriage'}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Filing Separately
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.separateTotalTax)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Filing Jointly</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            results.marriedFilingJointly.totalTax
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Comparison */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Tax Comparison Breakdown
                    </h3>

                    <div className="space-y-4">
                      {/* Person 1 Single */}
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-gray-900">
                              Person 1 (Single)
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">
                            {formatCurrency(results.person1.totalTax)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Income</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.person1.grossIncome)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Federal Tax</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.person1.finalTax)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tax Rate</div>
                            <div className="font-semibold text-gray-900">
                              {formatPercentage(
                                results.person1.effectiveTaxRate
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Person 2 Single */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">
                              Person 2 (Single)
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(results.person2.totalTax)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Income</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.person2.grossIncome)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Federal Tax</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.person2.finalTax)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tax Rate</div>
                            <div className="font-semibold text-gray-900">
                              {formatPercentage(
                                results.person2.effectiveTaxRate
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Married Filing Jointly */}
                      <div
                        className={`bg-gradient-to-br ${
                          results.marriagePenaltyOrBonus < 0
                            ? 'from-green-50 to-emerald-50'
                            : 'from-red-50 to-orange-50'
                        } rounded-2xl p-6`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Heart
                              className={`w-5 h-5 ${
                                results.marriagePenaltyOrBonus < 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            />
                            <span className="font-semibold text-gray-900">
                              Married Filing Jointly
                            </span>
                          </div>
                          <span
                            className={`text-2xl font-bold ${
                              results.marriagePenaltyOrBonus < 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(
                              results.marriedFilingJointly.totalTax
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Combined Income</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(results.totalHouseholdIncome)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Federal Tax</div>
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(
                                results.marriedFilingJointly.finalTax
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Tax Rate</div>
                            <div className="font-semibold text-gray-900">
                              {formatPercentage(
                                results.marriedFilingJointly.effectiveTaxRate
                              )}
                            </div>
                          </div>
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
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Household Income
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalHouseholdIncome)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Combined gross
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calculator className="w-4 h-4" />
                          Marginal Rate
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(
                            results.marriedFilingJointly.marginalRate
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Top tax bracket
                        </div>
                      </div>

                      <div
                        className={`${
                          results.marriagePenaltyOrBonus < 0
                            ? 'bg-green-50'
                            : 'bg-amber-50'
                        } rounded-xl p-4`}
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Heart className="w-4 h-4" />
                          Tax Impact
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            results.marriagePenaltyOrBonus < 0
                              ? 'text-green-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {formatPercentage(Math.abs(results.percentageChange))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {results.marriagePenaltyOrBonus < 0
                            ? 'Tax reduction'
                            : 'Tax increase'}
                        </div>
                      </div>

                      {dependents > 0 && (
                        <div className="bg-pink-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Users className="w-4 h-4" />
                            Child Tax Credit
                          </div>
                          <div className="text-2xl font-bold text-pink-600">
                            {formatCurrency(
                              results.marriedFilingJointly.childTaxCredit
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            For {dependents}{' '}
                            {dependents === 1 ? 'child' : 'children'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visualization */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Tax Visualization
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveChart('comparison')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'comparison'
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Compare
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Breakdown
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
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <PieChart
                          data={breakdownChartData}
                          options={pieChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 bg-gradient-to-r from-pink-50 to-rose-50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Recommendation
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {results.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>

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
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            How Marriage Affects Taxes
                          </h4>
                          <p className="text-sm text-gray-600">
                            The U.S. tax system can create either a
                            &quot;marriage penalty&quot; or &quot;marriage
                            bonus&quot; depending on income distribution.
                            Couples with similar incomes often face a penalty,
                            while those with disparate incomes may receive a
                            bonus.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-purple-600" />
                            Your Tax Brackets
                          </h4>
                          <p className="text-sm text-gray-600">
                            Single: Person 1 is in the{' '}
                            {formatPercentage(results.person1.marginalRate)}{' '}
                            bracket, Person 2 is in the{' '}
                            {formatPercentage(results.person2.marginalRate)}{' '}
                            bracket. Married: You would be in the{' '}
                            {formatPercentage(
                              results.marriedFilingJointly.marginalRate
                            )}{' '}
                            bracket.
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-600" />
                            Other Considerations
                          </h4>
                          <p className="text-sm text-gray-600">
                            Beyond taxes, marriage provides benefits like
                            spousal IRA contributions, Social Security benefits,
                            health insurance coverage, and estate planning
                            advantages. Consider these holistic benefits
                            alongside tax implications.
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
              Understanding Marriage and Taxes
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is the Marriage Penalty?
                </h3>
                <p className="mb-4">
                  The marriage penalty occurs when two individuals pay more
                  income tax as a married couple than they would pay if they
                  were single. This typically affects couples where both
                  partners have similar incomes, pushing them into higher tax
                  brackets when their incomes are combined.
                </p>
                <p className="text-sm">
                  The Tax Cuts and Jobs Act of 2017 reduced but did not
                  eliminate the marriage penalty by adjusting tax brackets so
                  that the married filing jointly brackets are mostly double
                  those of single filers.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is the Marriage Bonus?
                </h3>
                <p className="mb-4">
                  A marriage bonus occurs when a couple pays less tax filing
                  jointly than they would if filing as singles. This typically
                  happens when one spouse earns significantly more than the
                  other, or when one spouse doesn&apos;t work.
                </p>
                <p className="text-sm">
                  The non-working or lower-earning spouse can benefit from the
                  higher standard deduction and wider tax brackets available to
                  married couples, resulting in overall tax savings.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 Tax Brackets Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 text-left font-semibold text-gray-900">
                          Tax Rate
                        </th>
                        <th className="py-2 px-4 text-left font-semibold text-gray-900">
                          Single
                        </th>
                        <th className="py-2 text-left font-semibold text-gray-900">
                          Married Filing Jointly
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">10%</td>
                        <td className="py-2 px-4">Up to $11,925</td>
                        <td className="py-2">Up to $24,800</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">12%</td>
                        <td className="py-2 px-4">$11,926 - $48,475</td>
                        <td className="py-2">$24,801 - $100,800</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">22%</td>
                        <td className="py-2 px-4">$48,476 - $105,700</td>
                        <td className="py-2">$100,801 - $211,400</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">24%</td>
                        <td className="py-2 px-4">$105,701 - $201,775</td>
                        <td className="py-2">$211,401 - $403,550</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">32%</td>
                        <td className="py-2 px-4">$201,776 - $256,225</td>
                        <td className="py-2">$403,551 - $512,450</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 font-medium">35%</td>
                        <td className="py-2 px-4">$256,226 - $626,350</td>
                        <td className="py-2">$512,451 - $751,600</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">37%</td>
                        <td className="py-2 px-4">Over $626,350</td>
                        <td className="py-2">Over $751,600</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Standard Deduction for 2025
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Single:</strong> $15,750
                  </li>
                  <li>
                    <strong>Married Filing Jointly:</strong> $31,500
                  </li>
                  <li>
                    <strong>Head of Household:</strong> $23,850
                  </li>
                </ul>
                <p className="mt-4 text-sm">
                  The standard deduction for married filing jointly is exactly
                  double that of single filers, which helps reduce the marriage
                  penalty for many couples.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Benefits Beyond Taxes
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Spousal IRA:</strong> A non-working spouse can
                    contribute to an IRA based on the working spouse&apos;s
                    income
                  </li>
                  <li>
                    <strong>Social Security:</strong> Spousal and survivor
                    benefits provide additional retirement security
                  </li>
                  <li>
                    <strong>Health Insurance:</strong> Access to spouse&apos;s
                    employer health insurance coverage
                  </li>
                  <li>
                    <strong>Estate Planning:</strong> Unlimited marital
                    deduction for estate and gift taxes
                  </li>
                  <li>
                    <strong>Legal Benefits:</strong> Medical decision-making
                    authority and inheritance rights
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Strategies to Minimize Marriage Penalty
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Maximize Pre-Tax Contributions:</strong> Both
                    spouses should contribute to 401(k), HSA, and FSA accounts
                  </li>
                  <li>
                    • <strong>Consider Timing:</strong> If marrying near
                    year-end, consider waiting until January to avoid penalty
                    for current year
                  </li>
                  <li>
                    • <strong>Itemize Deductions:</strong> Combined itemized
                    deductions may exceed the standard deduction
                  </li>
                  <li>
                    • <strong>Charitable Giving:</strong> Bunch charitable
                    donations in alternating years to exceed standard deduction
                  </li>
                  <li>
                    • <strong>Tax-Loss Harvesting:</strong> Offset capital gains
                    with losses to reduce taxable income
                  </li>
                  <li>
                    • <strong>Consider State Taxes:</strong> Some states have
                    larger marriage penalties than federal taxes
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
