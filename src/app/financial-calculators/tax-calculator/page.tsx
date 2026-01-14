'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  ChevronDown,
  Percent,
  Banknote,
  CreditCard,
  Home,
  Heart,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateTax,
  validateTaxInputs,
  formatCurrency,
  STANDARD_DEDUCTIONS_2025,
  type TaxInputs,
  type TaxResults,
  type FilingStatus,
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

export default function TaxCalculator() {
  // Input states
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [grossIncome, setGrossIncome] = useState<number>(75000);
  const [dependentsUnder17, setDependentsUnder17] = useState<number>(0);
  const [dependentsOver17, setDependentsOver17] = useState<number>(0);
  const [preTaxDeductions, setPreTaxDeductions] = useState<number>(0);
  const [federalWithholding, setFederalWithholding] = useState<number>(0);

  // Additional income
  const [interestIncome, setInterestIncome] = useState<number>(0);
  const [dividendIncome, setDividendIncome] = useState<number>(0);
  const [capitalGainsShort] = useState<number>(0);
  const [capitalGainsLong] = useState<number>(0);

  // Itemized deductions
  const [useItemized, setUseItemized] = useState<boolean>(false);
  const [mortgageInterest, setMortgageInterest] = useState<number>(0);
  const [stateLocalTaxes, setStateLocalTaxes] = useState<number>(0);
  const [charitableDonations, setCharitableDonations] = useState<number>(0);
  const [medicalExpenses] = useState<number>(0);

  // Credits
  const [educationCredits, setEducationCredits] = useState<number>(0);
  const [energyCredits, setEnergyCredits] = useState<number>(0);

  // Results
  const [results, setResults] = useState<TaxResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [activeChart, setActiveChart] = useState<'breakdown' | 'brackets'>(
    'breakdown'
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showItemized, setShowItemized] = useState<boolean>(false);

  // Calculate tax
  const calculate = useCallback(() => {
    const inputs: TaxInputs = {
      filingStatus,
      grossIncome,
      dependentsUnder17,
      dependentsOver17,
      preTaxDeductions,
      itemizedDeductions: useItemized
        ? mortgageInterest +
          Math.min(10000, stateLocalTaxes) +
          charitableDonations +
          Math.max(0, medicalExpenses - grossIncome * 0.075)
        : 0,
      federalWithholding,
      stateWithholding: 0,
      otherCredits: 0,
      interestIncome,
      dividendIncome,
      capitalGainsShort,
      capitalGainsLong,
      businessIncome: 0,
      mortgageInterest,
      stateLocalTaxes,
      charitableDonations,
      medicalExpenses,
      educationCredits,
      energyCredits,
      retirementSavingsCredit: 0,
    };

    const validationErrors = validateTaxInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateTax(inputs);
    setResults(calculatedResults);
  }, [
    filingStatus,
    grossIncome,
    dependentsUnder17,
    dependentsOver17,
    preTaxDeductions,
    federalWithholding,
    interestIncome,
    dividendIncome,
    capitalGainsShort,
    capitalGainsLong,
    useItemized,
    mortgageInterest,
    stateLocalTaxes,
    charitableDonations,
    medicalExpenses,
    educationCredits,
    energyCredits,
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

  // Prepare breakdown chart data
  const getBreakdownChartData = () => {
    if (!results) return null;

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColor: string[] = [];

    if (results.federalTax > 0) {
      labels.push('Federal Tax');
      data.push(results.federalTax);
      backgroundColor.push('rgba(239, 68, 68, 0.8)');
    }

    if (results.estimatedStateTax > 0) {
      labels.push('State Tax (Est.)');
      data.push(results.estimatedStateTax);
      backgroundColor.push('rgba(251, 146, 60, 0.8)');
    }

    if (preTaxDeductions > 0) {
      labels.push('Pre-tax Deductions');
      data.push(preTaxDeductions);
      backgroundColor.push('rgba(99, 102, 241, 0.8)');
    }

    labels.push('Take-Home Pay');
    data.push(results.takeHomePay);
    backgroundColor.push('rgba(34, 197, 94, 0.8)');

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map((color) =>
            color.replace('0.8', '1')
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare brackets chart data
  const getBracketsChartData = () => {
    if (!results || !results.taxByBracket) return null;

    return {
      labels: results.taxByBracket.map((b) => b.bracket),
      datasets: [
        {
          label: 'Tax Amount',
          data: results.taxByBracket.map((b) => b.tax),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const breakdownChartData = getBreakdownChartData();
  const bracketsChartData = getBracketsChartData();

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
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
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `Tax: ${formatCurrency(context.parsed.y)}`;
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Tax Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Estimate your 2025 federal income tax and refund
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
              {/* Filing Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Filing Information
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
                      Filing Status
                    </label>
                    <select
                      value={filingStatus}
                      onChange={(e) =>
                        setFilingStatus(e.target.value as FilingStatus)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                    >
                      <option value="single">Single</option>
                      <option value="marriedJointly">
                        Married Filing Jointly
                      </option>
                      <option value="marriedSeparately">
                        Married Filing Separately
                      </option>
                      <option value="headOfHousehold">Head of Household</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Gross Income (W-2 Wages)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(grossIncome)}
                        onChange={(e) =>
                          setGrossIncome(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="75,000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Children Under 17
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dependentsUnder17 || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setDependentsUnder17(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Other Dependents
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dependentsOver17 || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setDependentsOver17(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Deductions & Withholding
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pre-tax Deductions (401k, HSA, etc.)
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      2025 401(k) limit: $23,500 (under 50)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Federal Tax Withheld (YTD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(federalWithholding)}
                        onChange={(e) =>
                          setFederalWithholding(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="itemized"
                        checked={showItemized}
                        onChange={(e) => {
                          setShowItemized(e.target.checked);
                          setUseItemized(e.target.checked);
                        }}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="itemized"
                        className="ml-3 text-sm font-semibold text-gray-700"
                      >
                        Use itemized deductions
                      </label>
                    </div>
                    {!showItemized && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <p className="text-sm text-blue-800">
                          Standard Deduction:{' '}
                          {formatCurrency(
                            STANDARD_DEDUCTIONS_2025[filingStatus]
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {showItemized && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Home className="inline w-4 h-4 mr-1" />
                          Mortgage Interest
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State & Local Taxes (SALT)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(stateLocalTaxes)}
                            onChange={(e) =>
                              setStateLocalTaxes(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Capped at $10,000 for 2025
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Heart className="inline w-4 h-4 mr-1" />
                          Charitable Donations
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
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
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    Additional Income & Credits
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      showAdvanced ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <div className="px-8 pb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Interest Income
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(interestIncome)}
                            onChange={(e) =>
                              setInterestIncome(parseInputValue(e.target.value))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dividend Income
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(dividendIncome)}
                            onChange={(e) =>
                              setDividendIncome(parseInputValue(e.target.value))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <GraduationCap className="inline w-4 h-4 mr-1" />
                          Education Credits
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(educationCredits)}
                            onChange={(e) =>
                              setEducationCredits(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Energy Credits
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(energyCredits)}
                            onChange={(e) =>
                              setEnergyCredits(parseInputValue(e.target.value))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>
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
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Receipt className="w-4 h-4" />
                      {results.refundOrOwed >= 0
                        ? 'Estimated Refund'
                        : 'Estimated Tax Owed'}
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(Math.abs(results.refundOrOwed))}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Based on {formatCurrency(results.totalWithholding)}{' '}
                      withheld
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Effective Tax Rate
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {results.effectiveRate.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Marginal Rate</div>
                        <div className="text-xl font-semibold mt-1">
                          {results.marginalRate}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Summary */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Tax Calculation Summary
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Gross Income</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.grossIncome)}
                        </span>
                      </div>

                      {results.adjustedGrossIncome < results.grossIncome && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">
                            Adjusted Gross Income
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.adjustedGrossIncome)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <span className="text-gray-600">
                          {results.deductionType === 'standard'
                            ? 'Standard'
                            : 'Itemized'}{' '}
                          Deduction
                        </span>
                        <span className="font-semibold text-gray-900">
                          -{formatCurrency(results.deductionUsed)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Taxable Income</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.taxableIncome)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <span className="text-gray-600">
                          Federal Income Tax
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.federalTax)}
                        </span>
                      </div>

                      {results.childTaxCredit.total > 0 && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">
                            Child Tax Credit
                          </span>
                          <span className="font-semibold text-green-600">
                            -{formatCurrency(results.childTaxCredit.total)}
                          </span>
                        </div>
                      )}

                      {results.earnedIncomeCredit > 0 && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">
                            Earned Income Credit
                          </span>
                          <span className="font-semibold text-green-600">
                            -{formatCurrency(results.earnedIncomeCredit)}
                          </span>
                        </div>
                      )}

                      {results.otherCredits > 0 && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Other Credits</span>
                          <span className="font-semibold text-green-600">
                            -{formatCurrency(results.otherCredits)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">
                          Tax After Credits
                        </span>
                        <span className="font-bold text-xl text-gray-900">
                          {formatCurrency(Math.max(0, results.taxAfterCredits))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Take-Home Pay */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Take-Home Pay
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Annual
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.takeHomePay)}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Banknote className="w-4 h-4" />
                          Monthly
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.monthlyTakeHome)}
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <CreditCard className="w-4 h-4" />
                          Bi-weekly
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.biweeklyTakeHome)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Percent className="w-4 h-4" />
                        Take-Home Percentage
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{
                              width: `${(results.takeHomePay / results.grossIncome) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {(
                            (results.takeHomePay / results.grossIncome) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visualizations */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Tax Breakdown
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'breakdown'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <PieChartIcon className="w-4 h-4" />
                          Income Split
                        </button>
                        <button
                          onClick={() => setActiveChart('brackets')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                            activeChart === 'brackets'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Tax Brackets
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
                      {activeChart === 'brackets' && bracketsChartData && (
                        <BarChart
                          data={bracketsChartData}
                          options={barChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Tax Brackets Detail */}
                  {results.taxByBracket && results.taxByBracket.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        Tax by Bracket
                      </h3>
                      <div className="space-y-2">
                        {results.taxByBracket.map((bracket, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {bracket.bracket} Bracket
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({formatCurrency(bracket.income)} ×{' '}
                                  {bracket.bracket})
                                </span>
                              </div>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(bracket.tax)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
              Understanding Federal Income Tax
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Federal Income Tax Works
                </h3>
                <p className="mb-4">
                  The U.S. federal income tax system is progressive, meaning
                  that higher income levels are taxed at higher rates. Your
                  income is divided into chunks called tax brackets, and each
                  bracket has its own tax rate.
                </p>
                <p>
                  Only the income within each bracket is taxed at that
                  bracket&apos;s rate, not your entire income. This is why your
                  effective tax rate is always lower than your marginal tax
                  rate.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 Federal Tax Brackets
                </h3>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 pr-4">Tax Rate</th>
                          <th className="text-left py-2 px-4">Single</th>
                          <th className="text-left py-2 px-4">
                            Married Filing Jointly
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-semibold">10%</td>
                          <td className="py-2 px-4">$0 - $11,925</td>
                          <td className="py-2 px-4">$0 - $23,850</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-semibold">12%</td>
                          <td className="py-2 px-4">$11,926 - $48,475</td>
                          <td className="py-2 px-4">$23,851 - $96,950</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-semibold">22%</td>
                          <td className="py-2 px-4">$48,476 - $103,350</td>
                          <td className="py-2 px-4">$96,951 - $206,700</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-semibold">24%</td>
                          <td className="py-2 px-4">$103,351 - $197,300</td>
                          <td className="py-2 px-4">$206,701 - $394,600</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-semibold">32%</td>
                          <td className="py-2 px-4">$197,301 - $250,525</td>
                          <td className="py-2 px-4">$394,601 - $501,050</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-semibold">35%</td>
                          <td className="py-2 px-4">$250,526 - $626,350</td>
                          <td className="py-2 px-4">$501,051 - $751,600</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold">37%</td>
                          <td className="py-2 px-4">Over $626,350</td>
                          <td className="py-2 px-4">Over $751,600</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Standard Deductions for 2025
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Single</h4>
                    <p className="text-2xl font-bold text-blue-600">$15,750</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Married Filing Jointly
                    </h4>
                    <p className="text-2xl font-bold text-green-600">$31,500</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Head of Household
                    </h4>
                    <p className="text-2xl font-bold text-purple-600">
                      $23,625
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Married Filing Separately
                    </h4>
                    <p className="text-2xl font-bold text-amber-600">$15,750</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Tax Credits for 2025
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Child Tax Credit:</strong> Up to $2,200 per
                    qualifying child under 17, with up to $1,700 refundable
                  </li>
                  <li>
                    <strong>Earned Income Tax Credit:</strong> Maximum ranges
                    from $649 (no children) to $8,046 (3+ children)
                  </li>
                  <li>
                    <strong>American Opportunity Credit:</strong> Up to $2,500
                    per eligible student for qualified education expenses
                  </li>
                  <li>
                    <strong>Lifetime Learning Credit:</strong> Up to $2,000 per
                    tax return for qualified education expenses
                  </li>
                  <li>
                    <strong>Saver&apos;s Credit:</strong> Up to $2,000 ($4,000
                    for married filing jointly) for retirement contributions
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Effective vs. Marginal Tax Rate
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Marginal Tax Rate
                    </h4>
                    <p className="text-sm">
                      The tax rate applied to your last dollar of income. This
                      is the highest tax bracket you fall into.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Effective Tax Rate
                    </h4>
                    <p className="text-sm">
                      Your total tax divided by your total income. This is your
                      actual average tax rate and is always lower than your
                      marginal rate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tax Planning Strategies
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Maximize Pre-tax Contributions:</strong>{' '}
                    Contribute to 401(k), traditional IRA, HSA to reduce taxable
                    income
                  </li>
                  <li>
                    • <strong>Itemize When Beneficial:</strong> If your itemized
                    deductions exceed the standard deduction
                  </li>
                  <li>
                    • <strong>Tax-Loss Harvesting:</strong> Offset capital gains
                    with capital losses
                  </li>
                  <li>
                    • <strong>Timing Income:</strong> Defer income to next year
                    or accelerate deductions
                  </li>
                  <li>
                    • <strong>Utilize Tax Credits:</strong> Take advantage of
                    all eligible credits
                  </li>
                  <li>
                    • <strong>Adjust Withholding:</strong> Update W-4 to avoid
                    large refunds or owing taxes
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • This calculator provides estimates for federal income tax
                    only
                  </li>
                  <li>
                    • State and local taxes vary significantly by location
                  </li>
                  <li>• Consult a tax professional for personalized advice</li>
                  <li>
                    • Tax laws can change; verify current rates with the IRS
                  </li>
                  <li>
                    • Self-employment tax is not included in these calculations
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
