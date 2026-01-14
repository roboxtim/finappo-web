'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  ChevronDown,
  DollarSign,
  Info,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Calculator,
  Shield,
  BarChart3,
  FileText,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateRMDResults,
  validateRMDInputs,
  formatCurrency,
  getRMDDeadline,
  type RMDInputs,
  type RMDResults,
} from './calculations';
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
import { Line as LineChart } from 'react-chartjs-2';

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

export default function RMDCalculator() {
  const currentYear = new Date().getFullYear();

  // Form inputs
  const [birthYear, setBirthYear] = useState<string>('1951');
  const [rmdYear, setRmdYear] = useState<string>(currentYear.toString());
  const [accountBalance, setAccountBalance] = useState<string>('500000');
  const [hasSpouseBeneficiary, setHasSpouseBeneficiary] = useState(false);
  const [spouseBirthYear, setSpouseBirthYear] = useState<string>('1956');
  const [estimatedReturn, setEstimatedReturn] = useState<string>('5');
  const [showProjections, setShowProjections] = useState(true);
  const [yearsToProject, setYearsToProject] = useState<string>('20');

  // Results
  const [results, setResults] = useState<RMDResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Active sections
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate results
  const calculateResults = useCallback(() => {
    const inputs: RMDInputs = {
      birthYear: parseInt(birthYear) || 1951,
      rmdYear: parseInt(rmdYear) || currentYear,
      accountBalance: parseFloat(accountBalance.replace(/,/g, '')) || 0,
      hasSpouseBeneficiary,
      ...(hasSpouseBeneficiary && {
        spouseBirthYear: parseInt(spouseBirthYear) || 1956,
      }),
      ...(showProjections && {
        estimatedReturnRate: parseFloat(estimatedReturn) || 0,
        yearsToProject: parseInt(yearsToProject) || 20,
      }),
    };

    // Validate inputs
    const validationErrors = validateRMDInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateRMDResults(inputs);
    setResults(calculatedResults);
  }, [
    birthYear,
    rmdYear,
    accountBalance,
    hasSpouseBeneficiary,
    spouseBirthYear,
    estimatedReturn,
    showProjections,
    yearsToProject,
    currentYear,
  ]);

  // Auto-calculate on input change
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  // Format input value
  const formatInputCurrency = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue === '') return '';
    const num = parseInt(numericValue, 10);
    return num.toLocaleString();
  };

  // Generate birth year options
  const birthYearOptions = [];
  for (let year = currentYear - 50; year >= currentYear - 100; year--) {
    birthYearOptions.push(year);
  }

  // Generate RMD year options
  const rmdYearOptions = [];
  for (let year = currentYear; year <= currentYear + 10; year++) {
    rmdYearOptions.push(year);
  }

  // Chart data for projections
  const chartData = results?.projections
    ? {
        labels: results.projections.map((p) => p.year.toString()),
        datasets: [
          {
            label: 'Account Balance',
            data: results.projections.map((p) => p.endingBalance),
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            fill: true,
            tension: 0.3,
          },
          {
            label: 'Annual RMD',
            data: results.projections.map((p) => p.rmdAmount),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true,
            tension: 0.3,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.dataset.label || '';
            const value = formatCurrency(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            const numValue =
              typeof value === 'string' ? parseFloat(value) : value;
            return '$' + (numValue / 1000).toFixed(0) + 'k';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                <Landmark className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              RMD Calculator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Calculate your Required Minimum Distribution from retirement
              accounts using IRS life expectancy tables. Plan your withdrawals
              and understand tax implications.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-8 lg:p-12">
              {/* Input Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Age Information
                  </h3>

                  {/* Birth Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Birth
                    </label>
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-gray-900"
                    >
                      {birthYearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year} (Age {parseInt(rmdYear) - year} in {rmdYear})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      RMD begins at age {results?.rmdStartAge || 73}
                    </p>
                  </div>

                  {/* RMD Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RMD Year
                    </label>
                    <select
                      value={rmdYear}
                      onChange={(e) => setRmdYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-gray-900"
                    >
                      {rmdYearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                    Account Information
                  </h3>

                  {/* Account Balance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Balance (as of Dec 31 prior year)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={accountBalance}
                        onChange={(e) =>
                          setAccountBalance(formatInputCurrency(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-gray-900"
                        placeholder="500,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Balance on December 31, {parseInt(rmdYear) - 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficiary Section */}
              <div className="border-t pt-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Beneficiary Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasSpouse"
                      checked={hasSpouseBeneficiary}
                      onChange={(e) =>
                        setHasSpouseBeneficiary(e.target.checked)
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor="hasSpouse"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Spouse is sole primary beneficiary
                    </label>
                  </div>

                  {hasSpouseBeneficiary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spouse&apos;s Year of Birth
                      </label>
                      <select
                        value={spouseBirthYear}
                        onChange={(e) => setSpouseBirthYear(e.target.value)}
                        className="w-full md:w-64 px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-gray-900"
                      >
                        {birthYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year} (Age {parseInt(rmdYear) - year} in {rmdYear})
                          </option>
                        ))}
                      </select>
                      {results && hasSpouseBeneficiary && (
                        <p className="mt-2 text-sm text-purple-600">
                          Using {results.tableUsed} Life Table
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="border-t pt-6 mb-8">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="font-medium">Projection Settings</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${
                      showAdvanced ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showProjections"
                        checked={showProjections}
                        onChange={(e) => setShowProjections(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label
                        htmlFor="showProjections"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Show multi-year projections
                      </label>
                    </div>

                    {showProjections && (
                      <div className="grid md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Annual Return
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={estimatedReturn}
                              onChange={(e) =>
                                setEstimatedReturn(e.target.value)
                              }
                              className="w-full pr-8 px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-gray-900"
                              min="-50"
                              max="50"
                              step="0.1"
                            />
                            <span className="absolute right-4 top-3.5 text-gray-500">
                              %
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Years to Project
                          </label>
                          <input
                            type="number"
                            value={yearsToProject}
                            onChange={(e) => setYearsToProject(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors text-gray-900"
                            min="1"
                            max="50"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Please correct the following:
                      </p>
                      <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Section */}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Primary RMD Result */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Calculator className="w-6 h-6 mr-2" />
                      Your {rmdYear} RMD
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-purple-100 text-sm mb-1">
                          Required Distribution
                        </p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(results.rmdAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-100 text-sm mb-1">
                          Distribution Period
                        </p>
                        <p className="text-3xl font-bold">
                          {results.distributionPeriod.toFixed(1)} years
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-100 text-sm mb-1">
                          Table Used
                        </p>
                        <p className="text-xl font-semibold">
                          {results.tableUsed} Lifetime
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Calculation:</strong> ${accountBalance} ÷{' '}
                        {results.distributionPeriod.toFixed(1)} ={' '}
                        {formatCurrency(results.rmdAmount)}
                      </p>
                    </div>
                  </div>

                  {/* RMD Timeline */}
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-600" />
                      RMD Timeline
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">RMD Start Age:</span>
                        <span className="font-semibold text-gray-900">
                          {results.rmdStartAge}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">First RMD Year:</span>
                        <span className="font-semibold text-gray-900">
                          {results.rmdStartYear}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          First RMD Deadline:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {results.firstRMDDeadline}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          This Year&apos;s Deadline:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {getRMDDeadline(
                            parseInt(birthYear),
                            parseInt(rmdYear)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Projections Chart */}
                  {results.projections && chartData && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                        Multi-Year Projection
                      </h3>

                      <div className="h-80 mb-6">
                        <LineChart data={chartData} options={chartOptions} />
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            Total RMDs
                          </p>
                          <p className="text-xl font-bold text-purple-600">
                            {formatCurrency(results.totalRMDs || 0)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            Final Balance
                          </p>
                          <p className="text-xl font-bold text-indigo-600">
                            {formatCurrency(results.finalBalance || 0)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">
                            Average RMD
                          </p>
                          <p className="text-xl font-bold text-purple-600">
                            {formatCurrency(results.averageRMD || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Projection Table */}
                  {results.projections && results.projections.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        Year-by-Year Details
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Year
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Age
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Beginning Balance
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Dist. Period
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                RMD
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Earnings
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Ending Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {results.projections
                              .slice(0, 10)
                              .map((projection, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {projection.year}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900">
                                    {projection.age}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    {formatCurrency(
                                      projection.beginningBalance
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    {projection.distributionPeriod.toFixed(1)}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium text-purple-600 text-right">
                                    {formatCurrency(projection.rmdAmount)}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    {formatCurrency(projection.earnings)}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                    {formatCurrency(projection.endingBalance)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        {results.projections.length > 10 && (
                          <p className="mt-4 text-sm text-gray-500 text-center">
                            Showing first 10 years of{' '}
                            {results.projections.length} total years projected
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Information Sections */}
          <div className="mt-12 grid lg:grid-cols-3 gap-8">
            {/* What is RMD? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Info className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                  What is RMD?
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Required Minimum Distributions (RMDs) are mandatory
                  withdrawals from tax-deferred retirement accounts that must
                  begin at a certain age.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Applies to traditional IRAs, 401(k)s, 403(b)s</li>
                  <li>Start at age 73 (75 after 2032)</li>
                  <li>Based on IRS life expectancy tables</li>
                  <li>Penalty of 25% for missed RMDs</li>
                </ul>
              </div>
            </motion.div>

            {/* RMD Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                  Key RMD Rules
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="font-medium">SECURE Act 2.0 Changes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Born before 1951: RMD at age 72</li>
                  <li>Born 1951-1959: RMD at age 73</li>
                  <li>Born 1960+: RMD at age 75 (after 2032)</li>
                </ul>
                <p className="mt-3">
                  <strong>First RMD:</strong> Can delay until April 1 of the
                  year after turning RMD age
                </p>
              </div>
            </motion.div>

            {/* Tax Implications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">
                  Tax Considerations
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>RMDs are taxed as ordinary income</li>
                  <li>Cannot be rolled over to another IRA</li>
                  <li>Roth IRAs exempt during owner&apos;s lifetime</li>
                  <li>Inherited accounts have different rules</li>
                  <li>Consider QCDs for charitable giving</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Related Calculators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Related Calculators
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Link
                href="/financial-calculators/401k-calculator"
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  401(k) Calculator
                </span>
              </Link>
              <Link
                href="/financial-calculators/roth-ira-calculator"
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Roth IRA Calculator
                </span>
              </Link>
              <Link
                href="/financial-calculators/retirement-calculator"
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Landmark className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Retirement Calculator
                </span>
              </Link>
              <Link
                href="/financial-calculators/social-security"
                className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Social Security
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
