'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { motion } from 'framer-motion';
import {
  Shield,
  Calendar,
  TrendingUp,
  DollarSign,
  Info,
  ChevronDown,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  Users,
  Clock,
  Award,
} from 'lucide-react';
import {
  calculateIdealClaimAge,
  compareTwoClaimAges,
  validateSocialSecurityInputs,
  formatCurrency,
  formatPercentage,
  type IdealAgeInputs,
  type CompareAgesInputs,
  type IdealAgeResults,
  type CompareAgesResults,
} from './socialSecurityCalculations';
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
import { Line as LineChart, Chart } from 'react-chartjs-2';

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

export default function SocialSecurityCalculator() {
  // Calculator mode
  const [mode, setMode] = useState<'ideal' | 'compare'>('ideal');

  // Ideal Age Inputs
  const [birthYear, setBirthYear] = useState<number>(1960);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [investmentReturn, setInvestmentReturn] = useState<number>(5);
  const [cola, setCola] = useState<number>(2);

  // Compare Ages Inputs
  const [claimAge1, setClaimAge1] = useState<number>(62);
  const [monthlyPayment1, setMonthlyPayment1] = useState<number>(2000);
  const [claimAge2, setClaimAge2] = useState<number>(67);
  const [monthlyPayment2, setMonthlyPayment2] = useState<number>(3000);
  const [compareInvestmentReturn, setCompareInvestmentReturn] =
    useState<number>(6);
  const [compareCola, setCompareCola] = useState<number>(2.5);

  // Results
  const [idealResults, setIdealResults] = useState<IdealAgeResults | null>(
    null
  );
  const [compareResults, setCompareResults] =
    useState<CompareAgesResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

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

  // Calculate Ideal Age
  const calculateIdeal = useCallback(() => {
    const inputs: IdealAgeInputs = {
      birthYear,
      lifeExpectancy,
      investmentReturn,
      cola,
    };

    const validationErrors = validateSocialSecurityInputs(inputs, 'ideal');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIdealResults(null);
      return;
    }

    setErrors([]);
    const results = calculateIdealClaimAge(inputs);
    setIdealResults(results);
  }, [birthYear, lifeExpectancy, investmentReturn, cola]);

  // Calculate Comparison
  const calculateCompare = useCallback(() => {
    const inputs: CompareAgesInputs = {
      claimAge1,
      monthlyPayment1,
      claimAge2,
      monthlyPayment2,
      investmentReturn: compareInvestmentReturn,
      cola: compareCola,
    };

    const validationErrors = validateSocialSecurityInputs(inputs, 'compare');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setCompareResults(null);
      return;
    }

    setErrors([]);
    const results = compareTwoClaimAges(inputs);
    setCompareResults(results);
  }, [
    claimAge1,
    monthlyPayment1,
    claimAge2,
    monthlyPayment2,
    compareInvestmentReturn,
    compareCola,
  ]);

  useEffect(() => {
    if (mode === 'ideal') {
      calculateIdeal();
    } else {
      calculateCompare();
    }
  }, [mode, calculateIdeal, calculateCompare]);

  // Prepare benefits chart data for ideal age analysis
  const getBenefitsChartData = () => {
    if (!idealResults) return null;

    const labels = idealResults.ageAnalysis.map((a) => a.age.toString());
    const monthlyBenefits = idealResults.ageAnalysis.map(
      (a) => a.monthlyBenefit
    );
    const presentValues = idealResults.ageAnalysis.map((a) => a.presentValue);

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Monthly Benefit',
          data: monthlyBenefits,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'Present Value',
          data: presentValues,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: false,
          yAxisID: 'y1',
          tension: 0.3,
        },
      ],
    };
  };

  // Prepare cumulative chart data for comparison
  const getCumulativeChartData = () => {
    if (!compareResults) return null;

    const data = compareResults.cumulativeComparison.filter(
      (c) => c.age >= Math.min(claimAge1, claimAge2) && c.age <= 95
    );

    const labels = data.map((c) => c.age.toString());
    const option1Data = data.map((c) => c.option1Cumulative);
    const option2Data = data.map((c) => c.option2Cumulative);

    return {
      labels,
      datasets: [
        {
          label: `Option 1 (Age ${claimAge1})`,
          data: option1Data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: `Option 2 (Age ${claimAge2})`,
          data: option2Data,
          borderColor: 'rgb(251, 146, 60)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const benefitsChartData = getBenefitsChartData();
  const cumulativeChartData = getCumulativeChartData();

  const benefitsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.dataset.label || '';
            if (label === 'Monthly Benefit') {
              return `${label}: ${formatCurrency(context.parsed.y)}`;
            } else {
              return `${label}: ${formatCurrency(context.parsed.y)}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Claim Age',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Monthly Benefit',
        },
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Present Value',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  const cumulativeChartOptions = {
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
        title: {
          display: true,
          text: 'Age',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cumulative Benefits',
        },
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  return (
    <CalculatorLayout
      title="Social Security Calculator"
      description="Calculate the optimal age to claim Social Security benefits"
      icon={<Shield className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
    >
      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Mode Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setMode('ideal')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  mode === 'ideal'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Find Ideal Claim Age
              </button>
              <button
                onClick={() => setMode('compare')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  mode === 'compare'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Compare Two Ages
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
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

              {mode === 'ideal' ? (
                <>
                  {/* Ideal Age Inputs */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Personal Information
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Birth Year
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={birthYear || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setBirthYear(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                          placeholder="1960"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Enter your year of birth (1940-2010)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Life Expectancy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={lifeExpectancy || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setLifeExpectancy(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                          placeholder="85"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Expected age at end of life (65-110)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Economic Assumptions
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Return
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={investmentReturn || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setInvestmentReturn(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                            placeholder="5"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Annual investment return rate (0-15%)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cost of Living Adjustment (COLA)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={cola || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setCola(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Annual COLA increase (0-10%)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Compare Ages Inputs */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Option 1: Early Claiming
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Claim Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={claimAge1 || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setClaimAge1(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                          placeholder="62"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Age to start claiming (62-70)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(monthlyPayment1)}
                            onChange={(e) =>
                              setMonthlyPayment1(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2,000"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Monthly benefit amount at this age
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Option 2: Delayed Claiming
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Claim Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={claimAge2 || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setClaimAge2(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                          placeholder="67"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Age to start claiming (62-70)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(monthlyPayment2)}
                            onChange={(e) =>
                              setMonthlyPayment2(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                            placeholder="3,000"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Monthly benefit amount at this age
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Economic Assumptions
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Return
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={compareInvestmentReturn || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setCompareInvestmentReturn(
                                value ? Number(value) : 0
                              );
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                            placeholder="6"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Annual investment return rate (0-15%)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cost of Living Adjustment (COLA)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={compareCola || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setCompareCola(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2.5"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Annual COLA increase (0-10%)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {mode === 'ideal' && idealResults && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Target className="w-4 h-4" />
                      Optimal Claiming Strategy
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      Age {idealResults.idealClaimAge}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Ideal age to start claiming benefits
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Monthly Benefit
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            idealResults.monthlyBenefitAtIdealAge
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Lifetime Value</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(idealResults.lifetimeValueAtIdealAge)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Analysis Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Full Retirement Age
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {idealResults.fullRetirementAge}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Based on birth year {birthYear}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Present Value
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(idealResults.presentValueAtIdealAge)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Adjusted for time value
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          Break-Even vs Early
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          Age {idealResults.breakEvenVsEarly}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          When ideal beats age 62
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Award className="w-4 h-4" />
                          Break-Even vs Late
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {idealResults.breakEvenVsLate === Infinity
                            ? 'Never'
                            : `Age ${idealResults.breakEvenVsLate}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          When age 70 beats ideal
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {idealResults.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Age Comparison Table */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Claiming Age Comparison
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                              Age
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                              Monthly
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                              % of FRA
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                              Lifetime
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {idealResults.ageAnalysis.map((analysis) => (
                            <tr
                              key={analysis.age}
                              className={`border-b border-gray-100 ${
                                analysis.age === idealResults.idealClaimAge
                                  ? 'bg-blue-50'
                                  : ''
                              }`}
                            >
                              <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                {analysis.age}
                                {analysis.age ===
                                  idealResults.idealClaimAge && (
                                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                                    Optimal
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-sm text-right text-gray-700">
                                {formatCurrency(analysis.monthlyBenefit)}
                              </td>
                              <td className="py-3 px-2 text-sm text-right text-gray-700">
                                {formatPercentage(analysis.percentOfFRA, 0)}
                              </td>
                              <td className="py-3 px-2 text-sm text-right text-gray-700">
                                {formatCurrency(analysis.lifetimeValue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Visualization */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Benefits Analysis
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <LineChartIcon className="w-4 h-4" />
                        Monthly Benefits vs Present Value
                      </div>
                    </div>

                    <div className="h-80">
                      {benefitsChartData && (
                        <Chart
                          type="bar"
                          data={benefitsChartData}
                          options={benefitsChartOptions}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              {mode === 'compare' && compareResults && !errors.length && (
                <>
                  {/* Main Result Card */}
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      compareResults.betterOption === 1
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                        : 'bg-gradient-to-br from-orange-600 to-red-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Target className="w-4 h-4" />
                      Recommended Option
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      Option {compareResults.betterOption}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Claim at age{' '}
                      {compareResults.betterOption === 1
                        ? claimAge1
                        : claimAge2}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Break-Even Age</div>
                        <div className="text-xl font-semibold mt-1">
                          {compareResults.breakEvenAge === Infinity
                            ? 'Never'
                            : `Age ${compareResults.breakEvenAge}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          Advantage at 85
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            Math.abs(compareResults.differenceAt85)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options Comparison */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Options Comparison
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div
                        className={`rounded-2xl p-6 border-2 ${
                          compareResults.betterOption === 1
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">Option 1</h4>
                          {compareResults.betterOption === 1 && (
                            <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-gray-600">
                              Claim Age
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {compareResults.option1.claimAge}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Monthly</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(
                                compareResults.option1.monthlyBenefit
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">
                              Value at 85
                            </div>
                            <div className="text-lg font-bold text-indigo-600">
                              {formatCurrency(
                                compareResults.option1.presentValue85
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-2xl p-6 border-2 ${
                          compareResults.betterOption === 2
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-900">Option 2</h4>
                          {compareResults.betterOption === 2 && (
                            <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-gray-600">
                              Claim Age
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {compareResults.option2.claimAge}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Monthly</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(
                                compareResults.option2.monthlyBenefit
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">
                              Value at 85
                            </div>
                            <div className="text-lg font-bold text-orange-600">
                              {formatCurrency(
                                compareResults.option2.presentValue85
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {compareResults.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Lifetime Values at Different Ages */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Lifetime Value Comparison
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200">
                        <div>Life Expectancy</div>
                        <div className="text-right">Option 1</div>
                        <div className="text-right">Option 2</div>
                        <div className="text-right">Difference</div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="font-medium text-gray-900">Age 85</div>
                        <div className="text-right text-gray-700">
                          {formatCurrency(
                            compareResults.option1.presentValue85
                          )}
                        </div>
                        <div className="text-right text-gray-700">
                          {formatCurrency(
                            compareResults.option2.presentValue85
                          )}
                        </div>
                        <div
                          className={`text-right font-semibold ${
                            compareResults.differenceAt85 > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {compareResults.differenceAt85 > 0 ? '+' : ''}
                          {formatCurrency(compareResults.differenceAt85)}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="font-medium text-gray-900">Age 90</div>
                        <div className="text-right text-gray-700">
                          {formatCurrency(
                            compareResults.option1.presentValue90
                          )}
                        </div>
                        <div className="text-right text-gray-700">
                          {formatCurrency(
                            compareResults.option2.presentValue90
                          )}
                        </div>
                        <div
                          className={`text-right font-semibold ${
                            compareResults.differenceAt90 > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {compareResults.differenceAt90 > 0 ? '+' : ''}
                          {formatCurrency(compareResults.differenceAt90)}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="font-medium text-gray-900">Age 95</div>
                        <div className="text-right text-gray-700">
                          {formatCurrency(
                            compareResults.option1.presentValue95
                          )}
                        </div>
                        <div className="text-right text-gray-700">
                          {formatCurrency(
                            compareResults.option2.presentValue95
                          )}
                        </div>
                        <div
                          className={`text-right font-semibold ${
                            compareResults.differenceAt95 > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {compareResults.differenceAt95 > 0 ? '+' : ''}
                          {formatCurrency(compareResults.differenceAt95)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cumulative Benefits Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Cumulative Benefits
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart3 className="w-4 h-4" />
                        Total received over time
                      </div>
                    </div>

                    <div className="h-80">
                      {cumulativeChartData && (
                        <LineChart
                          data={cumulativeChartData}
                          options={cumulativeChartOptions}
                        />
                      )}
                    </div>
                  </div>
                </>
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
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        How We Calculate
                      </h4>
                      <p className="text-sm text-gray-600">
                        Our calculator uses actuarial formulas to determine the
                        present value of your Social Security benefits. We
                        factor in your life expectancy, investment returns, and
                        cost of living adjustments to find the claiming age that
                        maximizes your lifetime value.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Investment Return Impact
                      </h4>
                      <p className="text-sm text-gray-600">
                        Higher investment returns favor earlier claiming because
                        you can invest the benefits and earn returns. Lower
                        returns favor delayed claiming to get the higher
                        guaranteed monthly payment.
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        Life Expectancy Matters
                      </h4>
                      <p className="text-sm text-gray-600">
                        Longer life expectancy typically favors delayed claiming
                        for the higher monthly benefits. Shorter life expectancy
                        favors early claiming to receive benefits for more
                        years.
                      </p>
                    </div>

                    <div className="bg-indigo-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        Important Considerations
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          • This calculator provides general guidance only
                        </li>
                        <li>
                          • Consider your health, family history, and financial
                          needs
                        </li>
                        <li>
                          • Spousal benefits may affect your optimal claiming
                          strategy
                        </li>
                        <li>
                          • Tax implications are not included in these
                          calculations
                        </li>
                        <li>
                          • Consult a financial advisor for personalized advice
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
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
              Understanding Social Security Benefits
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When Can You Claim?
                </h3>
                <p className="mb-4">
                  You can start claiming Social Security retirement benefits as
                  early as age 62, but your monthly benefit will be permanently
                  reduced. Full retirement age (FRA) ranges from 66 to 67
                  depending on your birth year. You can delay claiming until age
                  70 to receive delayed retirement credits.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Age 62:</strong> Earliest claiming age with
                    maximum reduction (up to 30%)
                  </li>
                  <li>
                    • <strong>FRA (66-67):</strong> Full benefit amount with no
                    reduction
                  </li>
                  <li>
                    • <strong>Age 70:</strong> Maximum benefit with 24-32%
                    increase from FRA
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Early vs. Delayed Claiming
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Early Claiming
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>✓ Receive benefits sooner</li>
                      <li>✓ More years of payments</li>
                      <li>✓ Can invest the money</li>
                      <li>✗ Permanently reduced benefits</li>
                      <li>✗ Lower lifetime value if you live long</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Delayed Claiming
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>✓ Higher monthly payments</li>
                      <li>✓ Better inflation protection</li>
                      <li>✓ Higher survivor benefits</li>
                      <li>✗ Fewer years of payments</li>
                      <li>✗ Risk of not living to break-even</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Cost of Living Adjustments (COLA)
                </h3>
                <p className="mb-4">
                  Social Security benefits are adjusted annually for inflation
                  through COLA. This helps maintain your purchasing power
                  throughout retirement. The COLA is based on the Consumer Price
                  Index and typically ranges from 0% to 3% annually, though it
                  can be higher during periods of high inflation.
                </p>
                <p className="text-sm">
                  COLA applies to all benefits regardless of when you claim,
                  making delayed claiming more valuable as the higher base
                  benefit compounds with COLA over time.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Factors to Consider
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Health & Longevity:</strong> Family history and
                    current health status affect optimal claiming age
                  </li>
                  <li>
                    <strong>Other Income:</strong> Pensions, savings, and work
                    income influence when you need Social Security
                  </li>
                  <li>
                    <strong>Spousal Benefits:</strong> Married couples should
                    coordinate claiming strategies
                  </li>
                  <li>
                    <strong>Tax Implications:</strong> Up to 85% of benefits may
                    be taxable depending on income
                  </li>
                  <li>
                    <strong>Working While Claiming:</strong> Earnings test may
                    reduce benefits if claiming before FRA
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Takeaways
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • There&apos;s no one-size-fits-all answer - your optimal
                    claiming age depends on personal factors
                  </li>
                  <li>
                    • Higher investment returns generally favor earlier claiming
                  </li>
                  <li>
                    • Longer life expectancy typically favors delayed claiming
                  </li>
                  <li>
                    • Break-even age is usually between 78-82 for most scenarios
                  </li>
                  <li>
                    • Consider non-financial factors like quality of life and
                    peace of mind
                  </li>
                  <li>
                    • Review your strategy regularly as circumstances change
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
