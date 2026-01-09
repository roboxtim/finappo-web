'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  ChevronDown,
  DollarSign,
  Info,
  TrendingUp,
  Users,
  Calendar,
  Heart,
  Shield,
  LineChart as LineChartIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateLumpSumVsMonthly,
  calculateSingleLifeVsJoint,
  calculateWorkLonger,
  formatCurrency,
  formatPercentage,
  formatYears,
  formatMonths,
  type LumpSumVsMonthlyInputs,
  type LumpSumVsMonthlyResults,
  type SingleLifeVsJointInputs,
  type SingleLifeVsJointResults,
  type WorkLongerInputs,
  type WorkLongerResults,
} from './__tests__/pensionCalculations';
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

type CalculatorMode = 'lump-sum' | 'single-life' | 'work-longer';

export default function PensionCalculator() {
  // UI State
  const [calculatorMode, setCalculatorMode] =
    useState<CalculatorMode>('lump-sum');
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Lump Sum vs Monthly Pension Inputs
  const [lumpSumRetirementAge, setLumpSumRetirementAge] = useState<number>(65);
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(500000);
  const [monthlyPensionAmount, setMonthlyPensionAmount] =
    useState<number>(3000);
  const [lumpSumInvestmentReturn, setLumpSumInvestmentReturn] =
    useState<number>(7);
  const [lumpSumCola, setLumpSumCola] = useState<number>(2);
  const [lumpSumLifeExpectancy, setLumpSumLifeExpectancy] =
    useState<number>(85);

  // Single-Life vs Joint Inputs
  const [singleLifeRetirementAge, setSingleLifeRetirementAge] =
    useState<number>(65);
  const [singleLifeExpectancy, setSingleLifeExpectancy] = useState<number>(85);
  const [spouseAgeAtRetirement, setSpouseAgeAtRetirement] =
    useState<number>(63);
  const [spouseLifeExpectancy, setSpouseLifeExpectancy] = useState<number>(88);
  const [singleLifePension, setSingleLifePension] = useState<number>(4000);
  const [jointSurvivorPension, setJointSurvivorPension] =
    useState<number>(3600);
  const [survivorBenefitPercent, setSurvivorBenefitPercent] =
    useState<number>(50);
  const [singleLifeInvestmentReturn, setSingleLifeInvestmentReturn] =
    useState<number>(6);
  const [singleLifeCola, setSingleLifeCola] = useState<number>(2);

  // Work Longer Inputs
  const [currentAge, setCurrentAge] = useState<number>(55);
  const [option1RetirementAge, setOption1RetirementAge] = useState<number>(62);
  const [option1MonthlyAmount, setOption1MonthlyAmount] =
    useState<number>(2500);
  const [option2RetirementAge, setOption2RetirementAge] = useState<number>(67);
  const [option2MonthlyAmount, setOption2MonthlyAmount] =
    useState<number>(3500);
  const [workLongerLifeExpectancy, setWorkLongerLifeExpectancy] =
    useState<number>(85);
  const [workLongerInvestmentReturn, setWorkLongerInvestmentReturn] =
    useState<number>(6);
  const [workLongerCola, setWorkLongerCola] = useState<number>(2);

  // Results
  const [lumpSumResults, setLumpSumResults] =
    useState<LumpSumVsMonthlyResults | null>(null);
  const [singleLifeResults, setSingleLifeResults] =
    useState<SingleLifeVsJointResults | null>(null);
  const [workLongerResults, setWorkLongerResults] =
    useState<WorkLongerResults | null>(null);

  // Calculate results based on mode
  const calculate = useCallback(() => {
    if (calculatorMode === 'lump-sum') {
      const inputs: LumpSumVsMonthlyInputs = {
        retirementAge: lumpSumRetirementAge,
        lumpSumAmount,
        monthlyPensionAmount,
        investmentReturnPercent: lumpSumInvestmentReturn,
        colaPercent: lumpSumCola,
        lifeExpectancy: lumpSumLifeExpectancy,
      };
      setLumpSumResults(calculateLumpSumVsMonthly(inputs));
    } else if (calculatorMode === 'single-life') {
      const inputs: SingleLifeVsJointInputs = {
        retirementAge: singleLifeRetirementAge,
        lifeExpectancy: singleLifeExpectancy,
        spouseAgeAtRetirement,
        spouseLifeExpectancy,
        singleLifePensionAmount: singleLifePension,
        jointSurvivorPensionAmount: jointSurvivorPension,
        survivorBenefitPercent,
        investmentReturnPercent: singleLifeInvestmentReturn,
        colaPercent: singleLifeCola,
      };
      setSingleLifeResults(calculateSingleLifeVsJoint(inputs));
    } else {
      const inputs: WorkLongerInputs = {
        currentAge,
        option1RetirementAge,
        option1MonthlyAmount,
        option2RetirementAge,
        option2MonthlyAmount,
        lifeExpectancy: workLongerLifeExpectancy,
        investmentReturnPercent: workLongerInvestmentReturn,
        colaPercent: workLongerCola,
      };
      setWorkLongerResults(calculateWorkLonger(inputs));
    }
  }, [
    calculatorMode,
    lumpSumRetirementAge,
    lumpSumAmount,
    monthlyPensionAmount,
    lumpSumInvestmentReturn,
    lumpSumCola,
    lumpSumLifeExpectancy,
    singleLifeRetirementAge,
    singleLifeExpectancy,
    spouseAgeAtRetirement,
    spouseLifeExpectancy,
    singleLifePension,
    jointSurvivorPension,
    survivorBenefitPercent,
    singleLifeInvestmentReturn,
    singleLifeCola,
    currentAge,
    option1RetirementAge,
    option1MonthlyAmount,
    option2RetirementAge,
    option2MonthlyAmount,
    workLongerLifeExpectancy,
    workLongerInvestmentReturn,
    workLongerCola,
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

  // Prepare chart data based on mode
  const getChartData = () => {
    let data = null;

    if (calculatorMode === 'lump-sum' && lumpSumResults) {
      data = lumpSumResults.yearByYearProjection;
    } else if (calculatorMode === 'single-life' && singleLifeResults) {
      data = singleLifeResults.yearByYearProjection;
    } else if (calculatorMode === 'work-longer' && workLongerResults) {
      data = workLongerResults.yearByYearProjection;
    }

    if (!data || data.length === 0) return null;

    const labels = data.map((p) => p.age.toString());
    const option1Data = data.map((p) => p.option1CumulativeReceived);
    const option2Data = data.map((p) => p.option2CumulativeReceived);

    return {
      labels,
      datasets: [
        {
          label:
            calculatorMode === 'lump-sum'
              ? 'Lump Sum (with withdrawals)'
              : calculatorMode === 'single-life'
                ? 'Single Life'
                : `Option 1 (Retire at ${option1RetirementAge})`,
          data: option1Data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label:
            calculatorMode === 'lump-sum'
              ? 'Monthly Pension'
              : calculatorMode === 'single-life'
                ? 'Joint & Survivor'
                : `Option 2 (Retire at ${option2RetirementAge})`,
          data: option2Data,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const chartData = getChartData();

  const chartOptions = {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Landmark className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Pension Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Compare pension options and make informed retirement decisions
              </p>
            </div>
          </motion.div>

          {/* Mode Selector */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setCalculatorMode('lump-sum')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                calculatorMode === 'lump-sum'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Lump Sum vs Monthly Pension
              </div>
            </button>
            <button
              onClick={() => setCalculatorMode('single-life')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                calculatorMode === 'single-life'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Single-Life vs Joint & Survivor
              </div>
            </button>
            <button
              onClick={() => setCalculatorMode('work-longer')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                calculatorMode === 'work-longer'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Work Longer Analysis
              </div>
            </button>
          </div>
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
              {/* Lump Sum vs Monthly Pension Form */}
              {calculatorMode === 'lump-sum' && (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Retirement Details
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Retirement Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={lumpSumRetirementAge || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setLumpSumRetirementAge(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="65"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Life Expectancy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={lumpSumLifeExpectancy || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setLumpSumLifeExpectancy(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="85"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Pension Options
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lump Sum Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(lumpSumAmount)}
                            onChange={(e) =>
                              setLumpSumAmount(parseInputValue(e.target.value))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="500,000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Pension Income
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(monthlyPensionAmount)}
                            onChange={(e) =>
                              setMonthlyPensionAmount(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="3,000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Assumptions
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Return (per year)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={lumpSumInvestmentReturn || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setLumpSumInvestmentReturn(
                                value ? Number(value) : 0
                              );
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="7"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Expected return on lump sum if invested
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cost-of-Living Adjustment (COLA)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={lumpSumCola || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setLumpSumCola(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Annual increase in monthly pension (use 0 for none)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Single-Life vs Joint Form */}
              {calculatorMode === 'single-life' && (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Your Information
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Retirement Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={singleLifeRetirementAge || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setSingleLifeRetirementAge(
                              value ? Number(value) : 0
                            );
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="65"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Life Expectancy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={singleLifeExpectancy || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setSingleLifeExpectancy(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="85"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Spouse Information
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Spouse Age at Your Retirement
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={spouseAgeAtRetirement || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setSpouseAgeAtRetirement(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="63"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Spouse Life Expectancy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={spouseLifeExpectancy || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setSpouseLifeExpectancy(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="88"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Pension Options
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Single-Life Pension (Monthly)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(singleLifePension)}
                            onChange={(e) =>
                              setSingleLifePension(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="4,000"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Higher payment, stops when you die
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Joint & Survivor Pension (Monthly)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(jointSurvivorPension)}
                            onChange={(e) =>
                              setJointSurvivorPension(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="3,600"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Lower payment, continues for spouse
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Survivor Benefit Percentage
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={survivorBenefitPercent || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setSurvivorBenefitPercent(
                                value ? Number(value) : 0
                              );
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="50"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          % spouse receives after you die (typically 50%, 66%,
                          75%, or 100%)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Assumptions
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Return (per year)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={singleLifeInvestmentReturn || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setSingleLifeInvestmentReturn(
                                value ? Number(value) : 0
                              );
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="6"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cost-of-Living Adjustment (COLA)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={singleLifeCola || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setSingleLifeCola(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Work Longer Form */}
              {calculatorMode === 'work-longer' && (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Current Information
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={currentAge || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setCurrentAge(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="55"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Life Expectancy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={workLongerLifeExpectancy || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setWorkLongerLifeExpectancy(
                              value ? Number(value) : 0
                            );
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="85"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Option 1: Retire Earlier
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Retirement Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={option1RetirementAge || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setOption1RetirementAge(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="62"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Pension
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(option1MonthlyAmount)}
                            onChange={(e) =>
                              setOption1MonthlyAmount(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2,500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Option 2: Work Longer
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Retirement Age
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={option2RetirementAge || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setOption2RetirementAge(value ? Number(value) : 0);
                          }}
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                          placeholder="67"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Pension
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(option2MonthlyAmount)}
                            onChange={(e) =>
                              setOption2MonthlyAmount(
                                parseInputValue(e.target.value)
                              )
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="3,500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Assumptions
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Return (per year)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={workLongerInvestmentReturn || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setWorkLongerInvestmentReturn(
                                value ? Number(value) : 0
                              );
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="6"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cost-of-Living Adjustment (COLA)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={workLongerCola || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9.]/g,
                                ''
                              );
                              setWorkLongerCola(value ? Number(value) : 0);
                            }}
                            className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                            placeholder="2"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
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
              {/* Lump Sum vs Monthly Results */}
              {calculatorMode === 'lump-sum' && lumpSumResults && (
                <>
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      lumpSumResults.betterOption === 'lump-sum'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                        : 'bg-gradient-to-br from-green-600 to-emerald-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Recommended Option
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {lumpSumResults.betterOption === 'lump-sum'
                        ? 'Take the Lump Sum'
                        : 'Take Monthly Pension'}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Based on present value analysis
                    </div>

                    <div className="pt-6 border-t border-white/20">
                      <div className="text-sm opacity-75">Value Difference</div>
                      <div className="text-2xl font-semibold mt-1">
                        {formatCurrency(lumpSumResults.differenceDollars)}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {formatPercentage(lumpSumResults.differencePercent, 1)}{' '}
                        advantage
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Lump Sum Analysis
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Initial Value
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(lumpSumResults.lumpSumInitialValue)}
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Safe Monthly Withdrawal (4% Rule)
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(
                            lumpSumResults.lumpSumMonthlyWithdrawal
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Withdrawn Over Lifetime
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(lumpSumResults.lumpSumTotalWithdrawn)}
                        </div>
                      </div>

                      <div className="bg-violet-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Projected Value at Life Expectancy
                        </div>
                        <div className="text-2xl font-bold text-violet-600">
                          {formatCurrency(lumpSumResults.lumpSumProjectedValue)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          If invested at{' '}
                          {formatPercentage(lumpSumInvestmentReturn, 1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Monthly Pension Analysis
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Initial Monthly Amount
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            lumpSumResults.monthlyPensionInitialAmount
                          )}
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Final Monthly Amount (with COLA)
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(
                            lumpSumResults.monthlyPensionFinalAmount
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          After {formatPercentage(lumpSumCola, 1)} annual
                          increases
                        </div>
                      </div>

                      <div className="bg-teal-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Received Over Lifetime
                        </div>
                        <div className="text-2xl font-bold text-teal-600">
                          {formatCurrency(
                            lumpSumResults.monthlyPensionTotalReceived
                          )}
                        </div>
                      </div>

                      <div className="bg-cyan-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Present Value
                        </div>
                        <div className="text-2xl font-bold text-cyan-600">
                          {formatCurrency(
                            lumpSumResults.monthlyPensionPresentValue
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Discounted at{' '}
                          {formatPercentage(lumpSumInvestmentReturn, 1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Insights
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Break-Even Age: {lumpSumResults.breakEvenAge}
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Monthly pension total equals lump sum at this age
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900">
                            <strong>Lump Sum Advantage:</strong> Flexibility,
                            control, potential for higher returns, legacy for
                            heirs
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                        <Heart className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-900">
                            <strong>Monthly Pension Advantage:</strong>{' '}
                            Guaranteed income, no investment risk, COLA
                            protection, simplicity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Single-Life vs Joint Results */}
              {calculatorMode === 'single-life' && singleLifeResults && (
                <>
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      singleLifeResults.betterOption === 'single-life'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                        : 'bg-gradient-to-br from-green-600 to-emerald-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Users className="w-4 h-4" />
                      Recommended Option
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {singleLifeResults.betterOption === 'single-life'
                        ? 'Single-Life Pension'
                        : 'Joint & Survivor Pension'}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Based on present value analysis
                    </div>

                    <div className="pt-6 border-t border-white/20">
                      <div className="text-sm opacity-75">Value Difference</div>
                      <div className="text-2xl font-semibold mt-1">
                        {formatCurrency(singleLifeResults.differenceDollars)}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {formatPercentage(
                          singleLifeResults.differencePercent,
                          1
                        )}{' '}
                        advantage
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Single-Life Pension
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Monthly Payment
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(singleLifePension)}
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Received
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(
                            singleLifeResults.singleLifeTotalReceived
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Over{' '}
                          {formatMonths(
                            singleLifeResults.singleLifeMonthsOfPayment
                          )}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Present Value
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            singleLifeResults.singleLifePresentValue
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Joint & Survivor Pension
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Your Monthly Payment
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(jointSurvivorPension)}
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Spouse Monthly Payment (after you die)
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(
                            singleLifeResults.jointSurvivorSpouseMonthlyAmount
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPercentage(survivorBenefitPercent, 0)} of joint
                          benefit
                        </div>
                      </div>

                      <div className="bg-teal-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Received (You + Spouse)
                        </div>
                        <div className="text-2xl font-bold text-teal-600">
                          {formatCurrency(
                            singleLifeResults.jointSurvivorTotalReceived
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Over{' '}
                          {formatMonths(
                            singleLifeResults.jointSurvivorMonthsOfPayment
                          )}
                        </div>
                      </div>

                      <div className="bg-cyan-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Present Value
                        </div>
                        <div className="text-2xl font-bold text-cyan-600">
                          {formatCurrency(
                            singleLifeResults.jointSurvivorPresentValue
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Scenario Analysis
                    </h3>

                    <div className="space-y-3">
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <p className="text-sm font-semibold text-amber-900 mb-2">
                          If You Die First
                        </p>
                        <p className="text-xs text-amber-700 mb-2">
                          {singleLifeResults.ifYouDieFirst.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-amber-600">
                            Total Received:
                          </span>
                          <span className="text-sm font-bold text-amber-900">
                            {formatCurrency(
                              singleLifeResults.ifYouDieFirst.totalReceived
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                          If Spouse Dies First
                        </p>
                        <p className="text-xs text-blue-700 mb-2">
                          {singleLifeResults.ifSpouseDiesFirst.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600">
                            Total Received:
                          </span>
                          <span className="text-sm font-bold text-blue-900">
                            {formatCurrency(
                              singleLifeResults.ifSpouseDiesFirst.totalReceived
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-xl">
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Break-Even Analysis
                        </p>
                        <p className="text-xs text-green-700">
                          Joint option recovers its lower monthly amount after
                          approximately{' '}
                          {formatYears(
                            Math.round(singleLifeResults.breakEvenYears)
                          )}{' '}
                          of survivor benefits.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Work Longer Results */}
              {calculatorMode === 'work-longer' && workLongerResults && (
                <>
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      workLongerResults.betterOption === 'option1'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                        : 'bg-gradient-to-br from-green-600 to-emerald-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Calendar className="w-4 h-4" />
                      Recommended Option
                    </div>
                    <div className="text-4xl font-bold mb-2">
                      {workLongerResults.betterOption === 'option1'
                        ? `Retire at ${option1RetirementAge}`
                        : `Work Until ${option2RetirementAge}`}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Based on present value analysis
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Value Difference
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(workLongerResults.differenceDollars)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          Additional Work Years
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {workLongerResults.additionalYearsWorked}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Option 1: Retire at {option1RetirementAge}
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Monthly Pension
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(option1MonthlyAmount)}
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Years of Retirement
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {workLongerResults.option1YearsOfRetirement}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Received
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            workLongerResults.option1TotalReceived
                          )}
                        </div>
                      </div>

                      <div className="bg-violet-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Present Value
                        </div>
                        <div className="text-2xl font-bold text-violet-600">
                          {formatCurrency(
                            workLongerResults.option1PresentValue
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Option 2: Retire at {option2RetirementAge}
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Monthly Pension
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(option2MonthlyAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatCurrency(
                            option2MonthlyAmount - option1MonthlyAmount
                          )}{' '}
                          more per month
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Years of Retirement
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {workLongerResults.option2YearsOfRetirement}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {workLongerResults.option1YearsOfRetirement -
                            workLongerResults.option2YearsOfRetirement}{' '}
                          fewer years
                        </div>
                      </div>

                      <div className="bg-teal-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Received
                        </div>
                        <div className="text-2xl font-bold text-teal-600">
                          {formatCurrency(
                            workLongerResults.option2TotalReceived
                          )}
                        </div>
                      </div>

                      <div className="bg-cyan-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Present Value
                        </div>
                        <div className="text-2xl font-bold text-cyan-600">
                          {formatCurrency(
                            workLongerResults.option2PresentValue
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Insights
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">
                            Break-Even Age: {workLongerResults.breakEvenAge}
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Age at which Option 2 cumulative benefits catch up
                            to Option 1
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-900">
                          <strong>Retire Earlier Advantage:</strong> More years
                          of retirement, immediate income, time to enjoy
                          retirement while healthier
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-900">
                          <strong>Work Longer Advantage:</strong> Higher monthly
                          pension, more time to save, continued health
                          insurance, social engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Visualization */}
              {chartData && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Cumulative Benefits Comparison
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LineChartIcon className="w-4 h-4" />
                      Over Time
                    </div>
                  </div>

                  <div className="h-80">
                    <LineChart data={chartData} options={chartOptions} />
                  </div>
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
                    {calculatorMode === 'lump-sum' && lumpSumResults && (
                      <>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-purple-600" />
                            Lump Sum Considerations
                          </h4>
                          <p className="text-sm text-gray-600">
                            Taking a lump sum gives you immediate access to the
                            full amount, allowing you to invest it, leave it to
                            heirs, or spend it as needed. However, you bear all
                            investment risk and must manage the money to last
                            your lifetime. The 4% withdrawal rule suggests
                            taking{' '}
                            {formatCurrency(
                              lumpSumResults.lumpSumMonthlyWithdrawal
                            )}{' '}
                            per month to preserve capital.
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            Monthly Pension Considerations
                          </h4>
                          <p className="text-sm text-gray-600">
                            A monthly pension provides guaranteed income for
                            life, eliminating longevity and investment risk.
                            With {formatPercentage(lumpSumCola, 1)} COLA, your
                            payments grow from{' '}
                            {formatCurrency(
                              lumpSumResults.monthlyPensionInitialAmount
                            )}{' '}
                            to{' '}
                            {formatCurrency(
                              lumpSumResults.monthlyPensionFinalAmount
                            )}
                            , helping maintain purchasing power. However, you
                            can&apos;t access the principal, and payments
                            typically stop when you die.
                          </p>
                        </div>
                      </>
                    )}

                    {calculatorMode === 'single-life' && singleLifeResults && (
                      <>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            Single-Life vs. Joint & Survivor
                          </h4>
                          <p className="text-sm text-gray-600">
                            Single-life pensions pay{' '}
                            {formatCurrency(singleLifePension)} per month but
                            stop when you die. Joint & survivor pensions pay
                            less ({formatCurrency(jointSurvivorPension)}) but
                            continue for your spouse at{' '}
                            {formatPercentage(survivorBenefitPercent, 0)}. The
                            choice depends on your spouse&apos;s age, health,
                            and financial independence.
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-green-600" />
                            Protecting Your Spouse
                          </h4>
                          <p className="text-sm text-gray-600">
                            If you die first, the joint option ensures your
                            spouse receives{' '}
                            {formatCurrency(
                              singleLifeResults.jointSurvivorSpouseMonthlyAmount
                            )}{' '}
                            monthly, totaling{' '}
                            {formatCurrency(
                              singleLifeResults.jointSurvivorSpouseTotalReceived
                            )}{' '}
                            over their lifetime. This protection costs you{' '}
                            {formatCurrency(
                              singleLifePension - jointSurvivorPension
                            )}{' '}
                            per month during your lifetime.
                          </p>
                        </div>
                      </>
                    )}

                    {calculatorMode === 'work-longer' && workLongerResults && (
                      <>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            Early Retirement Trade-offs
                          </h4>
                          <p className="text-sm text-gray-600">
                            Retiring at {option1RetirementAge} gives you{' '}
                            {workLongerResults.option1YearsOfRetirement} years
                            of retirement with{' '}
                            {formatCurrency(option1MonthlyAmount)} monthly.
                            You&apos;ll have more years to enjoy retirement
                            while you&apos;re healthier, but receive less per
                            month. Total lifetime benefits:{' '}
                            {formatCurrency(
                              workLongerResults.option1TotalReceived
                            )}
                            .
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Working Longer Benefits
                          </h4>
                          <p className="text-sm text-gray-600">
                            Working until {option2RetirementAge} increases your
                            monthly pension to{' '}
                            {formatCurrency(option2MonthlyAmount)} - an extra{' '}
                            {formatCurrency(
                              option2MonthlyAmount - option1MonthlyAmount
                            )}{' '}
                            per month. You&apos;ll have{' '}
                            {workLongerResults.option2YearsOfRetirement} years
                            of retirement and total lifetime benefits of{' '}
                            {formatCurrency(
                              workLongerResults.option2TotalReceived
                            )}
                            . Benefits break even at age{' '}
                            {workLongerResults.breakEvenAge}.
                          </p>
                        </div>
                      </>
                    )}

                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        Important Considerations
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          • These calculations use present value analysis to
                          compare options fairly
                        </li>
                        <li>
                          • Consider your health, family history, and risk
                          tolerance
                        </li>
                        <li>
                          • Review your other retirement income sources (Social
                          Security, savings, etc.)
                        </li>
                        <li>
                          • Consult with a financial advisor before making final
                          decisions
                        </li>
                        <li>
                          • Factor in taxes - pension income and lump sums are
                          taxed differently
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
              Understanding Pension Plans
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a Pension Plan?
                </h3>
                <p className="mb-4">
                  A pension plan is a retirement plan that provides monthly
                  income after you retire. Unlike 401(k) plans where you manage
                  investments yourself, traditional pension plans (defined
                  benefit plans) provide a guaranteed monthly payment for life
                  based on factors like your salary history and years of
                  service.
                </p>
                <p className="text-sm">
                  Pensions are typically offered by government employers,
                  unions, and some large corporations. They&apos;re becoming
                  less common in the private sector, but remain an important
                  retirement income source for millions of retirees.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Defined Benefit vs. Defined Contribution
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Defined Benefit (Traditional Pension)
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Employer guarantees specific monthly payment</li>
                      <li>• Based on salary and years of service</li>
                      <li>• Employer manages investments</li>
                      <li>• Lifetime income guarantee</li>
                      <li>• Employer bears investment risk</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Defined Contribution (401k, 403b)
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Contribution amount is defined, not benefit</li>
                      <li>• Employee manages investments</li>
                      <li>• Account balance depends on returns</li>
                      <li>• No guaranteed lifetime income</li>
                      <li>• Employee bears investment risk</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Pension Benefits Are Calculated
                </h3>
                <p className="mb-4">
                  Most pension formulas use a combination of three factors:
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      1. Final Average Salary
                    </h4>
                    <p className="text-sm">
                      Typically the average of your highest 3-5 years of salary
                      (e.g., $80,000)
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      2. Years of Service
                    </h4>
                    <p className="text-sm">
                      Total years working for the employer (e.g., 30 years)
                    </p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      3. Benefit Multiplier
                    </h4>
                    <p className="text-sm">
                      Percentage per year of service (e.g., 2%)
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Example Calculation
                  </h4>
                  <p className="text-sm">
                    <strong>Formula:</strong> Final Average Salary × Years of
                    Service × Multiplier
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Example:</strong> $80,000 × 30 years × 2% = $48,000
                    per year ($4,000 per month)
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pension Vesting
                </h3>
                <p className="mb-4">
                  Vesting refers to your right to receive pension benefits.
                  Unlike 401(k) contributions (which are yours immediately),
                  pension benefits typically require a minimum period of
                  employment.
                </p>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Cliff Vesting
                    </h4>
                    <p className="text-sm">
                      You become 100% vested after a certain period (e.g., 5
                      years). Leave before that, and you receive nothing.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Graded Vesting
                    </h4>
                    <p className="text-sm">
                      You become vested gradually (e.g., 20% per year over 5
                      years). Partial benefits if you leave early.
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Immediate Vesting
                    </h4>
                    <p className="text-sm">
                      Less common, but some plans vest immediately - you earn
                      benefits from day one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Cost-of-Living Adjustments (COLA)
                </h3>
                <p className="mb-4">
                  COLA provisions increase your pension payments annually to
                  help maintain purchasing power against inflation. Not all
                  pensions include COLA, and those that do vary widely in their
                  adjustment formulas.
                </p>
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    COLA Impact Example
                  </h4>
                  <p className="text-sm mb-2">Starting pension: $3,000/month</p>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>No COLA:</strong> Still $3,000 after 20 years
                      (loses 40% purchasing power with 2.5% inflation)
                    </li>
                    <li>
                      • <strong>2% COLA:</strong> Grows to $4,458 after 20 years
                      (maintains most purchasing power)
                    </li>
                    <li>
                      • <strong>3% COLA:</strong> Grows to $5,419 after 20 years
                      (exceeds inflation protection)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Survivor Benefits
                </h3>
                <p className="mb-4">
                  Survivor benefits ensure your spouse continues to receive
                  income after you die. The choice between single-life and
                  joint-and-survivor pensions is one of the most important
                  decisions you&apos;ll make.
                </p>
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Single-Life Pension
                    </h4>
                    <p className="text-sm">
                      Highest monthly payment, but stops completely when you
                      die. Choose this if: your spouse has their own retirement
                      income, you&apos;re significantly younger than your
                      spouse, or you&apos;re single.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Joint & Survivor (50%)
                    </h4>
                    <p className="text-sm">
                      Reduced monthly payment, but spouse receives 50% after you
                      die. Moderate protection at moderate cost.
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Joint & Survivor (100%)
                    </h4>
                    <p className="text-sm">
                      Most reduced monthly payment, but spouse receives full
                      amount after you die. Maximum protection, especially if
                      spouse is younger or depends on your income.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Early Retirement Reductions
                </h3>
                <p className="mb-4">
                  Most pension plans allow you to start receiving benefits
                  before normal retirement age (typically 65), but with a
                  permanent reduction in monthly payments. The reduction
                  compensates for the longer period you&apos;ll receive
                  benefits.
                </p>
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Typical Early Retirement Example
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>Age 65 (normal):</strong> $3,500/month (100%)
                    </li>
                    <li>
                      • <strong>Age 62:</strong> $2,800/month (80%)
                    </li>
                    <li>
                      • <strong>Age 60:</strong> $2,450/month (70%)
                    </li>
                    <li>
                      • <strong>Age 55:</strong> $1,750/month (50%)
                    </li>
                  </ul>
                  <p className="text-sm mt-2">
                    Reduction is typically 3-7% per year before normal
                    retirement age, and is permanent - it doesn&apos;t increase
                    to 100% when you reach 65.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pension vs. Lump Sum: Key Factors to Consider
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Choose the Lump Sum if:
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>
                        • You have investment experience and comfortable
                        managing money
                      </li>
                      <li>• You have shorter than average life expectancy</li>
                      <li>• You want to leave money to heirs</li>
                      <li>• You need flexibility for large expenses</li>
                      <li>
                        • Pension plan is underfunded or employer financially
                        unstable
                      </li>
                      <li>• Interest rates are high (makes lump sum larger)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Choose Monthly Pension if:
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>
                        • You want guaranteed income you can&apos;t outlive
                      </li>
                      <li>• You have longer than average life expectancy</li>
                      <li>
                        • You prefer simplicity over investment management
                      </li>
                      <li>• You&apos;re worried about market volatility</li>
                      <li>• Pension includes good COLA provisions</li>
                      <li>• You lack other sources of guaranteed income</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Pension Guarantees and Protection
                </h3>
                <p className="mb-4">
                  Most private-sector pension plans are insured by the Pension
                  Benefit Guaranty Corporation (PBGC), a federal agency.
                  However, PBGC guarantees have limits.
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      PBGC Coverage
                    </h4>
                    <p className="text-sm">
                      As of 2024, PBGC insures up to $79,871 per year for a
                      65-year-old. If your employer&apos;s pension plan fails,
                      PBGC steps in - but you may receive less than promised if
                      your benefit exceeds the limit.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Government Pensions
                    </h4>
                    <p className="text-sm">
                      State and local government pensions aren&apos;t covered by
                      PBGC. They&apos;re backed by the government entity itself,
                      which can raise taxes or cut benefits if underfunded.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-1">
                      Funding Status
                    </h4>
                    <p className="text-sm">
                      Check your pension plan&apos;s funding status in the
                      annual report. Well-funded plans (90%+ funded) are more
                      secure. Underfunded plans may face benefit cuts in the
                      future.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Making Your Pension Decision
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Get All the Facts:</strong> Request a detailed
                    pension estimate showing all available options
                  </li>
                  <li>
                    • <strong>Review Plan Documents:</strong> Understand exactly
                    how your pension is calculated and what choices you have
                  </li>
                  <li>
                    • <strong>Consider Your Health:</strong> Family history and
                    current health status significantly impact the
                    lump-sum-vs-pension decision
                  </li>
                  <li>
                    • <strong>Evaluate Other Income:</strong> How much Social
                    Security, savings, and other income will you have?
                  </li>
                  <li>
                    • <strong>Consult a Professional:</strong> Pension decisions
                    are irrevocable - get advice from a fee-only financial
                    planner
                  </li>
                  <li>
                    • <strong>Don&apos;t Rush:</strong> You often have 30-90
                    days to decide after retiring - use that time wisely
                  </li>
                  <li>
                    • <strong>Consider Taxes:</strong> Pension payments and lump
                    sums are taxed differently - understand the implications
                  </li>
                  <li>
                    • <strong>Think Long-Term:</strong> This decision will
                    affect you for the rest of your life and possibly your
                    spouse&apos;s
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
