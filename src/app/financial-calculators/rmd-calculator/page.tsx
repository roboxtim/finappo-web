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
  TrendingUp,
  AlertCircle,
  Clock,
  BarChart3,
  FileText,
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

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [showFullTable, setShowFullTable] = useState<boolean>(false);

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
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                RMD Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate your Required Minimum Distribution from retirement
                accounts
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
              {/* Basic Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Basic Information
                </h2>

                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-800 mb-2">
                          Please correct the following:
                        </p>
                        <ul className="space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-600">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Year of Birth
                    </label>
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      RMD Year
                    </label>
                    <select
                      value={rmdYear}
                      onChange={(e) => setRmdYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                    >
                      {rmdYearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Account Balance (Dec 31, {parseInt(rmdYear) - 1})
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={accountBalance}
                        onChange={(e) =>
                          setAccountBalance(formatInputCurrency(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="500,000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Beneficiary Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Beneficiary Information
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasSpouse"
                      checked={hasSpouseBeneficiary}
                      onChange={(e) =>
                        setHasSpouseBeneficiary(e.target.checked)
                      }
                      className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="hasSpouse"
                      className="ml-3 text-sm font-semibold text-gray-700"
                    >
                      Spouse is sole primary beneficiary
                    </label>
                  </div>

                  {hasSpouseBeneficiary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Spouse&apos;s Year of Birth
                      </label>
                      <select
                        value={spouseBirthYear}
                        onChange={(e) => setSpouseBirthYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
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

              {/* Projection Settings */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <TrendingUp className="w-5 h-5 inline mr-2" />
                  Projection Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showProjections"
                      checked={showProjections}
                      onChange={(e) => setShowProjections(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <label
                      htmlFor="showProjections"
                      className="ml-3 text-sm font-semibold text-gray-700"
                    >
                      Show multi-year projections
                    </label>
                  </div>

                  {showProjections && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Estimated Annual Return
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={estimatedReturn}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.-]/g,
                                ''
                              );
                              setEstimatedReturn(value);
                            }}
                            className="w-full pl-4 pr-10 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                            placeholder="5"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Years to Project
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={yearsToProject}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setYearsToProject(value);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                          placeholder="20"
                        />
                      </div>
                    </motion.div>
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Landmark className="w-4 h-4" />
                      Your {rmdYear} Required Minimum Distribution
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.rmdAmount)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Must be withdrawn by{' '}
                      {getRMDDeadline(parseInt(birthYear), parseInt(rmdYear))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Distribution Period
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {results.distributionPeriod.toFixed(1)} years
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Table Used</div>
                        <div className="text-xl font-semibold mt-1">
                          {results.tableUsed} Lifetime
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/10 rounded-xl">
                      <p className="text-sm">
                        <strong>Calculation:</strong>{' '}
                        {formatCurrency(
                          parseFloat(accountBalance.replace(/,/g, ''))
                        )}{' '}
                        ÷ {results.distributionPeriod.toFixed(1)} ={' '}
                        {formatCurrency(results.rmdAmount)}
                      </p>
                    </div>
                  </div>

                  {/* RMD Timeline */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      <Clock className="w-5 h-5 inline mr-2 text-purple-600" />
                      RMD Timeline
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          RMD Start Age
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {results.rmdStartAge}
                        </div>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          First RMD Year
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {results.rmdStartYear}
                        </div>
                      </div>
                      <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          First RMD Deadline
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {results.firstRMDDeadline}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projections Chart */}
                  {results.projections && chartData && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        <BarChart3 className="w-5 h-5 inline mr-2 text-purple-600" />
                        Multi-Year Projection
                      </h3>

                      <div className="h-80 mb-6">
                        <LineChart data={chartData} options={chartOptions} />
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
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

                  {/* Year-by-Year Details */}
                  {results.projections && results.projections.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">
                        <FileText className="w-5 h-5 inline mr-2 text-purple-600" />
                        Year-by-Year Details
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Year
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Age
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                Beginning Balance
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                Dist. Period
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                RMD
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                Ending Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {results.projections
                              .slice(0, showFullTable ? undefined : 10)
                              .map((projection, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    {projection.year}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {projection.age}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                    {formatCurrency(
                                      projection.beginningBalance
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                    {projection.distributionPeriod.toFixed(1)}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-purple-600 text-right">
                                    {formatCurrency(projection.rmdAmount)}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                    {formatCurrency(projection.endingBalance)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {results.projections.length > 10 && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setShowFullTable(!showFullTable)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            {showFullTable
                              ? 'Show Less'
                              : `Show All ${results.projections.length} Years`}
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                showFullTable ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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
                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-purple-600" />
                            Your RMD Calculation
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your RMD of {formatCurrency(results.rmdAmount)} is
                            calculated by dividing your account balance of{' '}
                            {formatCurrency(
                              parseFloat(accountBalance.replace(/,/g, ''))
                            )}{' '}
                            by your distribution period of{' '}
                            {results.distributionPeriod.toFixed(1)} years. This
                            is the minimum amount you must withdraw in {rmdYear}
                            .
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            Important Deadlines
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your first RMD was due by {results.firstRMDDeadline}
                            . Subsequent RMDs must be taken by December 31 each
                            year. Missing an RMD can result in a 25% penalty on
                            the amount not withdrawn.
                          </p>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Tax Implications
                          </h4>
                          <p className="text-sm text-gray-600">
                            RMDs are taxed as ordinary income. Consider
                            consulting with a tax professional to understand how
                            your RMD will affect your tax situation. You may
                            also want to explore Qualified Charitable
                            Distributions (QCDs) if you&apos;re charitably
                            inclined.
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
              Understanding Required Minimum Distributions
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is an RMD?
                </h3>
                <p className="text-gray-600 mb-4">
                  Required Minimum Distributions (RMDs) are mandatory
                  withdrawals from tax-deferred retirement accounts that must
                  begin at a certain age. The IRS requires these distributions
                  to ensure that the tax-deferred savings are eventually taxed.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    Applies to traditional IRAs, 401(k)s, 403(b)s, and other
                    tax-deferred accounts
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    Start at age 73 for those born 1951-1959
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    Based on IRS life expectancy tables
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    Penalty of 25% for missed RMDs (reduced to 10% if corrected
                    promptly)
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  SECURE Act 2.0 Changes
                </h3>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Born Before 1951
                    </h4>
                    <p className="text-sm text-gray-600">
                      RMD starts at age 72
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Born 1951-1959
                    </h4>
                    <p className="text-sm text-gray-600">
                      RMD starts at age 73
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Born 1960 or Later
                    </h4>
                    <p className="text-sm text-gray-600">
                      RMD starts at age 75 (effective 2033)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key RMD Rules
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <strong className="mr-2">First RMD:</strong>
                    <span>
                      Can be delayed until April 1 of the year after turning RMD
                      age
                    </span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">Subsequent RMDs:</strong>
                    <span>Must be taken by December 31 each year</span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">Tax Treatment:</strong>
                    <span>RMDs are taxed as ordinary income</span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">QCDs:</strong>
                    <span>
                      Qualified Charitable Distributions can satisfy RMD
                      requirements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">Roth IRAs:</strong>
                    <span>Exempt from RMDs during owner&apos;s lifetime</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Life Expectancy Tables
                </h3>
                <p className="text-gray-600 mb-4">
                  The IRS uses three life expectancy tables to calculate RMDs:
                </p>
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Uniform Lifetime Table
                    </h4>
                    <p className="text-sm text-gray-600">
                      Used for most RMD calculations, assumes a beneficiary 10
                      years younger
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Joint Life Table
                    </h4>
                    <p className="text-sm text-gray-600">
                      Used when spouse is sole beneficiary and more than 10
                      years younger
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Single Life Table
                    </h4>
                    <p className="text-sm text-gray-600">
                      Used by beneficiaries for inherited accounts
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  RMD Strategies
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <strong className="mr-2">•</strong>
                    <span>
                      Plan withdrawals to minimize tax impact across multiple
                      accounts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">•</strong>
                    <span>
                      Consider Qualified Charitable Distributions (QCDs) to
                      reduce taxable income
                    </span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">•</strong>
                    <span>
                      Aggregate RMDs from multiple IRAs and withdraw from one
                      account
                    </span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">•</strong>
                    <span>
                      Reinvest RMDs in taxable accounts if not needed for living
                      expenses
                    </span>
                  </li>
                  <li className="flex items-start">
                    <strong className="mr-2">•</strong>
                    <span>
                      Consider Roth conversions before RMD age to reduce future
                      RMDs
                    </span>
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
