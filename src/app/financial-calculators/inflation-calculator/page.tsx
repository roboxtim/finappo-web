'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
  Shield,
  Calendar,
  AlertCircle,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateInflation,
  validateInflationInputs,
  formatCurrency,
  formatPercentage,
  getAverageInflationByDecade,
  DEFAULT_INFLATION_RATE,
  type InflationInputs,
  type InflationResults,
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
import { Line as LineChart, Bar as BarChart } from 'react-chartjs-2';

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

export default function InflationCalculator() {
  // Input states
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [inflationRate, setInflationRate] = useState<number>(
    DEFAULT_INFLATION_RATE
  );
  const [years, setYears] = useState<number>(10);

  // Results
  const [results, setResults] = useState<InflationResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeChart, setActiveChart] = useState<
    'power' | 'breakdown' | 'historical'
  >('power');

  // Calculate Inflation Results
  const calculate = useCallback(() => {
    const inputs: InflationInputs = {
      initialAmount,
      inflationRate,
      years,
    };

    const validationErrors = validateInflationInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculationResults = calculateInflation(inputs);
    setResults(calculationResults);
  }, [initialAmount, inflationRate, years]);

  // Calculate on mount and when inputs change
  useEffect(() => {
    calculate();
  }, [calculate]);

  // Format input value
  const formatInputValue = (value: string): number => {
    const cleaned = value.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Prepare purchasing power chart data
  const getPowerChartData = () => {
    if (!results) return null;

    const labels: number[] = [];
    const purchasingPowerData: number[] = [];
    const nominalValueData: number[] = [];

    for (let year = 0; year <= years; year++) {
      labels.push(year);
      if (year === 0) {
        purchasingPowerData.push(initialAmount);
        nominalValueData.push(initialAmount);
      } else {
        const realValue =
          initialAmount / Math.pow(1 + inflationRate / 100, year);
        purchasingPowerData.push(realValue);
        nominalValueData.push(initialAmount);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: 'Nominal Value',
          data: nominalValueData,
          borderColor: 'rgba(251, 146, 60, 1)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderWidth: 2,
          tension: 0,
        },
        {
          label: 'Real Value (Purchasing Power)',
          data: purchasingPowerData,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };
  };

  // Prepare breakdown chart data
  const getBreakdownChartData = () => {
    if (!results || results.yearByYear.length === 0) return null;

    const labels = results.yearByYear.map((y) => `Year ${y.year}`);
    const realValues = results.yearByYear.map((y) => y.realValue);
    const inflationImpact = results.yearByYear.map((y) => y.inflationImpact);

    return {
      labels,
      datasets: [
        {
          label: 'Real Value',
          data: realValues,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Inflation Impact',
          data: inflationImpact,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare historical rates chart data
  const getHistoricalChartData = () => {
    const historicalRates = getAverageInflationByDecade();
    const labels = Object.keys(historicalRates).sort();
    const data = labels.map((decade) => historicalRates[decade]);

    return {
      labels,
      datasets: [
        {
          label: 'Average Inflation Rate by Decade',
          data,
          backgroundColor: labels.map((decade) => {
            const rate = historicalRates[decade];
            if (rate < 0) return 'rgba(59, 130, 246, 0.8)'; // Blue for deflation
            if (rate < 3) return 'rgba(34, 197, 94, 0.8)'; // Green for low
            if (rate < 5) return 'rgba(251, 146, 60, 0.8)'; // Orange for moderate
            return 'rgba(239, 68, 68, 0.8)'; // Red for high
          }),
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const powerChartData = getPowerChartData();
  const breakdownChartData = getBreakdownChartData();
  const historicalChartData = getHistoricalChartData();

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
      x: {
        title: {
          display: true,
          text: 'Years',
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
            if (label === 'Average Inflation Rate by Decade') {
              return `${label}: ${context.parsed.y.toFixed(2)}%`;
            }
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
            if (activeChart === 'historical') {
              return `${Number(value).toFixed(1)}%`;
            }
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const historicalChartOptions = {
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
            return `Average Rate: ${context.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            return `${Number(value).toFixed(1)}%`;
          },
        },
        title: {
          display: true,
          text: 'Average Inflation Rate (%)',
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Inflation Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate purchasing power and see how inflation impacts your
                money over time
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
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Amount Input */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Amount & Time Period
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="initial-amount"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Initial Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        id="initial-amount"
                        type="text"
                        value={initialAmount.toLocaleString()}
                        onChange={(e) =>
                          setInitialAmount(formatInputValue(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="10,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inflation-rate"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Average Inflation Rate (%)
                    </label>
                    <input
                      id="inflation-rate"
                      type="number"
                      value={inflationRate}
                      onChange={(e) =>
                        setInflationRate(parseFloat(e.target.value) || 0)
                      }
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                      placeholder="3"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Historical average is around 3% per year
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="years"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Number of Years
                    </label>
                    <input
                      id="years"
                      type="number"
                      value={years}
                      onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Historical Reference */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Historical Inflation Rates
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">1970s</span>
                    <span className="text-sm font-semibold text-gray-900">
                      7.36%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">1980s</span>
                    <span className="text-sm font-semibold text-gray-900">
                      5.10%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">1990s</span>
                    <span className="text-sm font-semibold text-gray-900">
                      2.89%
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">2000s</span>
                    <span className="text-sm font-semibold text-gray-900">
                      2.54%
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">2010s</span>
                    <span className="text-sm font-semibold text-gray-900">
                      1.77%
                    </span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">
                        Please correct the following:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {results && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-orange-600 to-red-600">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <ArrowUpCircle className="w-4 h-4" />
                          Future Value Needed
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {formatCurrency(results.futureValue)}
                        </div>
                        <div className="text-xs opacity-75">
                          To maintain purchasing power
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <DollarSign className="w-4 h-4" />
                          Purchasing Power
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {formatCurrency(results.purchasingPower)}
                        </div>
                        <div className="text-xs opacity-75">
                          In today&apos;s dollars
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm opacity-75">
                            Total Inflation
                          </div>
                          <div className="text-xl font-semibold">
                            {formatPercentage(results.totalInflation)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm opacity-75">Value Lost</div>
                          <div className="text-xl font-semibold">
                            {formatCurrency(results.realValueLoss)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Inflation Impact Analysis
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveChart('power')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeChart === 'power'
                              ? 'bg-orange-100 text-orange-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Purchasing Power
                        </button>
                        <button
                          onClick={() => setActiveChart('breakdown')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeChart === 'breakdown'
                              ? 'bg-orange-100 text-orange-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Yearly Breakdown
                        </button>
                        <button
                          onClick={() => setActiveChart('historical')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeChart === 'historical'
                              ? 'bg-orange-100 text-orange-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Historical Rates
                        </button>
                      </div>
                    </div>

                    <div className="h-80">
                      {activeChart === 'power' && powerChartData && (
                        <LineChart
                          data={powerChartData}
                          options={lineChartOptions}
                        />
                      )}
                      {activeChart === 'breakdown' && breakdownChartData && (
                        <BarChart
                          data={breakdownChartData}
                          options={barChartOptions}
                        />
                      )}
                      {activeChart === 'historical' && historicalChartData && (
                        <BarChart
                          data={historicalChartData}
                          options={historicalChartOptions}
                        />
                      )}
                    </div>
                  </div>

                  {/* Year-by-Year Details */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <button
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Year-by-Year Breakdown
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isDetailsOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDetailsOpen && results.yearByYear.length > 0 && (
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b border-gray-200">
                              <th className="pb-3 text-sm font-semibold text-gray-700">
                                Year
                              </th>
                              <th className="pb-3 text-sm font-semibold text-gray-700">
                                Nominal Value
                              </th>
                              <th className="pb-3 text-sm font-semibold text-gray-700">
                                Real Value
                              </th>
                              <th className="pb-3 text-sm font-semibold text-gray-700">
                                Lost to Inflation
                              </th>
                              <th className="pb-3 text-sm font-semibold text-gray-700">
                                Total Inflation
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.yearByYear.slice(0, 10).map((year) => (
                              <tr
                                key={year.year}
                                className="border-b border-gray-100"
                              >
                                <td className="py-3 text-sm text-gray-900">
                                  {year.year}
                                </td>
                                <td className="py-3 text-sm text-gray-900">
                                  {formatCurrency(year.nominalValue)}
                                </td>
                                <td className="py-3 text-sm text-gray-900">
                                  {formatCurrency(year.realValue)}
                                </td>
                                <td className="py-3 text-sm text-red-600">
                                  {formatCurrency(year.inflationImpact)}
                                </td>
                                <td className="py-3 text-sm text-gray-900">
                                  {formatPercentage(year.cumulativeInflation)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {results.yearByYear.length > 10 && (
                          <p className="mt-4 text-sm text-gray-500">
                            Showing first 10 years of{' '}
                            {results.yearByYear.length} total years
                          </p>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Understanding Inflation
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                What is Inflation?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Inflation is the rate at which the general level of prices for
                goods and services rises, eroding purchasing power. As inflation
                increases, every dollar you own buys a smaller percentage of
                goods or services. Understanding inflation is crucial for
                financial planning, as it affects savings, investments, and
                retirement planning.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                How Inflation Affects Your Money
              </h3>
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Purchasing Power Decline
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Your money buys less over time. $100 today won&apos;t buy
                      the same amount of goods in 10 years if inflation averages
                      3% annually.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Savings Erosion
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Money sitting in low-interest accounts loses value if the
                      interest rate doesn&apos;t match or exceed inflation
                      rates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Fixed Income Impact
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Retirees and those on fixed incomes are particularly
                      affected as their income doesn&apos;t increase with
                      inflation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Protecting Against Inflation
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      Invest in Assets
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Stocks, real estate, and commodities often appreciate with
                    or faster than inflation.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">TIPS Bonds</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Treasury Inflation-Protected Securities adjust with
                    inflation to preserve purchasing power.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Percent className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">
                      High-Yield Savings
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Choose savings accounts with interest rates that match or
                    exceed inflation rates.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">
                      Regular Reviews
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Adjust your financial plan regularly to account for changing
                    inflation rates.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💡 Pro Tip
              </h3>
              <p className="text-gray-700">
                When planning for retirement or long-term goals, always factor
                in inflation. A comfortable retirement income today may not be
                sufficient in 20-30 years. Use conservative inflation estimates
                (3-4%) for planning purposes to ensure you don&apos;t
                underestimate your future needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
