'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Info,
  Shield,
  TrendingDown,
  Users,
  Heart,
  Gift,
  Building2,
  AlertCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateEstateTax,
  validateEstateTaxInputs,
  formatCurrency,
  formatPercentage,
  formatCompact,
  ESTATE_TAX_2025,
  STATE_ESTATE_TAXES,
  type EstateTaxInputs,
  type EstateTaxResults,
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

export default function EstateTaxCalculator() {
  // Input states
  const [totalAssets, setTotalAssets] = useState<number>(20000000);
  const [totalDebts, setTotalDebts] = useState<number>(0);
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married'>(
    'single'
  );
  const [state, setState] = useState<string>('none');
  const [giftsGivenLifetime, setGiftsGivenLifetime] = useState<number>(0);
  const [charitableDeductions, setCharitableDeductions] = useState<number>(0);

  // Results
  const [results, setResults] = useState<EstateTaxResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [activeChart, setActiveChart] = useState<'breakdown' | 'comparison'>(
    'breakdown'
  );

  // Calculate Estate Tax
  const calculate = useCallback(() => {
    const inputs: EstateTaxInputs = {
      totalAssets,
      totalDebts,
      maritalStatus,
      state,
      giftsGivenLifetime,
      charitableDeductions,
    };

    const validationErrors = validateEstateTaxInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateEstateTax(inputs);
    setResults(calculatedResults);
  }, [
    totalAssets,
    totalDebts,
    maritalStatus,
    state,
    giftsGivenLifetime,
    charitableDeductions,
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

    return {
      labels: ['Net to Heirs', 'Federal Tax', 'State Tax', 'Deductions'],
      datasets: [
        {
          data: [
            results.netToHeirs,
            results.federalEstateTax,
            results.stateEstateTax,
            results.totalDeductions,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(99, 102, 241, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(99, 102, 241, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare comparison chart data
  const getComparisonChartData = () => {
    if (!results) return null;

    return {
      labels: ['Gross Estate', 'Taxable Estate', 'Net to Heirs'],
      datasets: [
        {
          label: 'Amount',
          data: [
            results.grossEstate,
            results.taxableEstate,
            results.netToHeirs,
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(251, 146, 60, 0.7)',
            'rgba(34, 197, 94, 0.7)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(34, 197, 94, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const breakdownChartData = getBreakdownChartData();
  const comparisonChartData = getComparisonChartData();

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
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            return formatCompact(Number(value));
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Estate Tax Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate federal and state estate taxes on your legacy
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
              {/* Estate Value */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Estate Value
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
                      Total Assets
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(totalAssets)}
                        onChange={(e) =>
                          setTotalAssets(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="20,000,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Real estate, investments, retirement accounts, life
                      insurance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Debts & Liabilities
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(totalDebts)}
                        onChange={(e) =>
                          setTotalDebts(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Mortgages, loans, credit card debt
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Personal Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marital Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMaritalStatus('single')}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          maritalStatus === 'single'
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Single
                      </button>
                      <button
                        onClick={() => setMaritalStatus('married')}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          maritalStatus === 'married'
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Married
                      </button>
                    </div>
                    {maritalStatus === 'married' && (
                      <p className="mt-2 text-xs text-green-600">
                        Married couples can use portability for up to{' '}
                        {formatCurrency(
                          ESTATE_TAX_2025.FEDERAL_EXEMPTION_MARRIED
                        )}{' '}
                        exemption
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State of Residence
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                    >
                      {Object.entries(STATE_ESTATE_TAXES).map(
                        ([code, info]) => (
                          <option key={code} value={code}>
                            {info.name}
                            {info.exemption > 0 &&
                              ` (${formatCompact(info.exemption)} exemption)`}
                          </option>
                        )
                      )}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Some states have additional estate taxes
                    </p>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Deductions & Gifts
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Charitable Bequests
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(charitableDeductions)}
                        onChange={(e) =>
                          setCharitableDeductions(
                            parseInputValue(e.target.value)
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Fully deductible from estate
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lifetime Taxable Gifts
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(giftsGivenLifetime)}
                        onChange={(e) =>
                          setGiftsGivenLifetime(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Gifts above annual exclusion ($
                      {formatInputValue(
                        ESTATE_TAX_2025.MAX_ANNUAL_GIFT_EXCLUSION
                      )}
                      /year)
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-amber-600 to-orange-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Heart className="w-4 h-4" />
                      Net to Heirs/Beneficiaries
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.netToHeirs)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      After all taxes and deductions
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Total Estate Tax
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalEstateTax)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Effective Rate</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatPercentage(results.effectiveTaxRate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Estate Tax Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            Gross Estate
                          </span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(results.grossEstate)}
                        </span>
                      </div>

                      {results.totalDeductions > 0 && (
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-gray-900">
                              Deductions
                            </span>
                          </div>
                          <span className="text-lg font-bold text-purple-600">
                            -{formatCurrency(results.totalDeductions)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-amber-600" />
                          <span className="font-semibold text-gray-900">
                            Taxable Estate
                          </span>
                        </div>
                        <span className="text-lg font-bold text-amber-600">
                          {formatCurrency(results.taxableEstate)}
                        </span>
                      </div>

                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">
                            Federal Exemption ({maritalStatus})
                          </span>
                          <span className="text-sm font-bold text-green-600">
                            -{formatCurrency(results.federalExemption)}
                          </span>
                        </div>

                        {results.federalTaxableAmount > 0 ? (
                          <>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl mb-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span className="font-semibold text-gray-900">
                                  Federal Estate Tax
                                </span>
                              </div>
                              <span className="text-lg font-bold text-red-600">
                                {formatCurrency(results.federalEstateTax)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              Marginal rate:{' '}
                              {formatPercentage(results.marginalTaxRate)}
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">
                              No federal estate tax owed
                            </span>
                          </div>
                        )}

                        {results.stateEstateTax > 0 && (
                          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              <span className="font-semibold text-gray-900">
                                {results.stateName} Tax
                              </span>
                            </div>
                            <span className="text-lg font-bold text-orange-600">
                              {formatCurrency(results.stateEstateTax)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Key Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Adjusted Estate
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCompact(results.adjustedGrossEstate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          After deductions
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Shield className="w-4 h-4" />
                          Taxable Amount
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {formatCompact(results.federalTaxableAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Above exemption
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingDown className="w-4 h-4" />
                          Tax Burden
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatPercentage(results.taxAsPercentOfEstate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Of gross estate
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Users className="w-4 h-4" />
                          Inheritance
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCompact(results.netToHeirs)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          To beneficiaries
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
                              ? 'bg-amber-600 text-white'
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
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Comparison
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
                        <BarChart
                          data={comparisonChartData}
                          options={barChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Tax Planning Tips */}
                  {results.totalEstateTax > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Potential Tax Reduction Strategies
                        </h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <Gift className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Use annual gift exclusions (
                            {formatCurrency(
                              ESTATE_TAX_2025.MAX_ANNUAL_GIFT_EXCLUSION
                            )}
                            /recipient/year)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Increase charitable bequests for deductions
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Consider irrevocable life insurance trusts (ILITs)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>
                            Establish family limited partnerships or LLCs
                          </span>
                        </li>
                      </ul>
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
              Understanding Estate Taxes
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is the Estate Tax?
                </h3>
                <p className="mb-4">
                  The estate tax is a federal tax on the transfer of assets from
                  deceased individuals to their heirs. It&apos;s sometimes
                  called the &quot;death tax&quot; and applies to estates
                  exceeding the federal exemption amount.
                </p>
                <p className="text-sm">
                  The tax is calculated on the fair market value of all assets
                  owned at death, minus allowable deductions such as debts,
                  charitable bequests, and transfers to a surviving spouse.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 Federal Estate Tax Exemption
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Single/Individual
                    </h4>
                    <p className="text-sm">
                      Exemption:{' '}
                      {formatCurrency(ESTATE_TAX_2025.FEDERAL_EXEMPTION_SINGLE)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Married Couples (with portability)
                    </h4>
                    <p className="text-sm">
                      Combined Exemption:{' '}
                      {formatCurrency(
                        ESTATE_TAX_2025.FEDERAL_EXEMPTION_MARRIED
                      )}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Federal Tax Rates
                    </h4>
                    <p className="text-sm">
                      Graduated rates from 18% to 40% on taxable amounts above
                      the exemption. The maximum 40% rate applies to amounts
                      over $1 million above the exemption.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Estate Tax is Calculated
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Gross Estate:</strong> Total value of all assets
                    (property, investments, life insurance, retirement accounts)
                  </li>
                  <li>
                    <strong>Deductions:</strong> Subtract debts, funeral
                    expenses, charitable bequests, and spousal transfers
                  </li>
                  <li>
                    <strong>Taxable Estate:</strong> Add back lifetime taxable
                    gifts
                  </li>
                  <li>
                    <strong>Apply Exemption:</strong> Subtract the federal
                    exemption amount
                  </li>
                  <li>
                    <strong>Calculate Tax:</strong> Apply graduated tax rates to
                    the remaining amount
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  State Estate Taxes
                </h3>
                <p className="mb-4">
                  In addition to federal estate tax, some states impose their
                  own estate or inheritance taxes. These states typically have
                  lower exemption thresholds than the federal government.
                </p>
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    States with Estate Tax (2025)
                  </h4>
                  <p className="text-sm">
                    Connecticut, Hawaii, Illinois, Maine, Maryland,
                    Massachusetts, Minnesota, New York, Oregon, Rhode Island,
                    Vermont, Washington, and Washington D.C.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Unlimited Marital Deduction
                </h3>
                <p className="mb-4">
                  Transfers to a surviving spouse are completely exempt from
                  estate tax. Additionally, the unused portion of the deceased
                  spouse&apos;s exemption can be transferred to the surviving
                  spouse (called &quot;portability&quot;).
                </p>
                <p className="text-sm">
                  This allows married couples to effectively use up to{' '}
                  {formatCurrency(ESTATE_TAX_2025.FEDERAL_EXEMPTION_MARRIED)} in
                  combined exemptions.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Gift Tax and Lifetime Gifts
                </h3>
                <p className="mb-4">
                  The estate and gift tax systems are unified. Large gifts made
                  during your lifetime count against your estate tax exemption.
                </p>
                <div className="space-y-2">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Annual Gift Exclusion (2025)
                    </h4>
                    <p className="text-sm">
                      You can give up to{' '}
                      {formatCurrency(
                        ESTATE_TAX_2025.MAX_ANNUAL_GIFT_EXCLUSION
                      )}{' '}
                      per recipient per year without using your lifetime
                      exemption or filing a gift tax return.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Lifetime Exemption
                    </h4>
                    <p className="text-sm">
                      Gifts above the annual exclusion reduce your available
                      estate tax exemption at death.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Estate Tax Planning Strategies
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Gifting:</strong> Use annual exclusions to transfer
                    wealth tax-free during your lifetime
                  </li>
                  <li>
                    <strong>Trusts:</strong> Irrevocable trusts can remove
                    assets from your taxable estate
                  </li>
                  <li>
                    <strong>Charitable Giving:</strong> Charitable bequests are
                    fully deductible
                  </li>
                  <li>
                    <strong>Life Insurance:</strong> Properly structured life
                    insurance trusts can provide tax-free liquidity
                  </li>
                  <li>
                    <strong>Business Succession:</strong> Family limited
                    partnerships and buy-sell agreements for business owners
                  </li>
                  <li>
                    <strong>Valuation Discounts:</strong> Certain assets may
                    qualify for valuation reductions
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • Estate tax laws may change - current high exemptions are
                    scheduled to sunset in 2026
                  </li>
                  <li>
                    • State estate tax laws vary significantly and may have
                    lower exemptions
                  </li>
                  <li>
                    • Estate planning should consider income tax basis step-up
                    benefits
                  </li>
                  <li>
                    • Professional guidance from estate planning attorneys and
                    CPAs is recommended
                  </li>
                  <li>
                    • Regular review of your estate plan is essential as laws
                    and family situations change
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
