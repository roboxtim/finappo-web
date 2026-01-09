'use client';

import React, { useState, useEffect } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  PiggyBank,
  Clock,
  ArrowUpRight,
  Calculator,
  ChartBar,
} from 'lucide-react';

interface AnnuityInput {
  startingPrincipal: string;
  annualAddition: string;
  monthlyAddition: string;
  annualGrowthRate: string;
  years: string;
  additionTiming: 'beginning' | 'end';
}

interface AnnuityResult {
  endBalance: number;
  startingPrincipal: number;
  totalAdditions: number;
  totalInterest: number;
  monthlySchedule: MonthlyScheduleItem[];
  annualSchedule: AnnualScheduleItem[];
}

interface MonthlyScheduleItem {
  month: number;
  addition: number;
  interest: number;
  balance: number;
}

interface AnnualScheduleItem {
  year: number;
  additions: number;
  interest: number;
  balance: number;
}

function calculateAnnuity(input: {
  startingPrincipal: number;
  annualAddition: number;
  monthlyAddition: number;
  annualGrowthRate: number;
  years: number;
  additionTiming: 'beginning' | 'end';
}): AnnuityResult {
  const {
    startingPrincipal,
    annualAddition,
    monthlyAddition,
    annualGrowthRate,
    years,
    additionTiming,
  } = input;

  // Convert annual rate to monthly rate (decimal)
  const monthlyRate = annualGrowthRate / 100 / 12;
  const totalMonths = Math.round(years * 12);

  // Calculate monthly schedule
  const monthlySchedule: MonthlyScheduleItem[] = [];
  const annualSchedule: AnnualScheduleItem[] = [];

  let balance = startingPrincipal;
  let yearlyAdditions = 0;
  let yearlyInterest = 0;

  for (let month = 1; month <= totalMonths; month++) {
    let monthlyPayment = monthlyAddition;

    // Handle annual additions based on timing
    if (additionTiming === 'beginning') {
      // For annuity due: add at beginning of each year (month 1, 13, 25, etc.)
      if ((month - 1) % 12 === 0) {
        monthlyPayment += annualAddition;
      }
    } else {
      // For ordinary annuity: add at end of each year (month 12, 24, 36, etc.)
      if (month % 12 === 0) {
        monthlyPayment += annualAddition;
      }
    }

    // Calculate interest and add payment
    const monthInterest = balance * monthlyRate;
    balance += monthInterest + monthlyPayment;

    yearlyAdditions += monthlyPayment;
    yearlyInterest += monthInterest;

    monthlySchedule.push({
      month,
      addition: monthlyPayment,
      interest: monthInterest,
      balance: balance,
    });

    // Add to annual schedule at end of each year
    if (month % 12 === 0 || month === totalMonths) {
      const yearNum = Math.ceil(month / 12);
      annualSchedule.push({
        year: yearNum,
        additions: yearlyAdditions,
        interest: yearlyInterest,
        balance: balance,
      });
      yearlyAdditions = 0;
      yearlyInterest = 0;
    }
  }

  // Calculate totals
  const totalMonthlyAdditions = monthlyAddition * totalMonths;
  const totalAnnualAdditions = annualAddition * years;
  const totalAdditions = totalMonthlyAdditions + totalAnnualAdditions;
  const totalInterest = balance - startingPrincipal - totalAdditions;

  return {
    endBalance: balance,
    startingPrincipal: startingPrincipal,
    totalAdditions: totalAdditions,
    totalInterest: totalInterest,
    monthlySchedule,
    annualSchedule,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export default function AnnuityCalculatorPage() {
  const [input, setInput] = useState<AnnuityInput>({
    startingPrincipal: '20000',
    annualAddition: '10000',
    monthlyAddition: '0',
    annualGrowthRate: '11',
    years: '10',
    additionTiming: 'end',
  });

  const [result, setResult] = useState<AnnuityResult | null>(null);
  const [scheduleView, setScheduleView] = useState<'monthly' | 'annual'>(
    'annual'
  );
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  useEffect(() => {
    calculateResults();
  }, [input]);

  const calculateResults = () => {
    const startingPrincipal = parseFloat(input.startingPrincipal) || 0;
    const annualAddition = parseFloat(input.annualAddition) || 0;
    const monthlyAddition = parseFloat(input.monthlyAddition) || 0;
    const annualGrowthRate = parseFloat(input.annualGrowthRate) || 0;
    const years = parseFloat(input.years) || 0;

    if (years <= 0) {
      setResult(null);
      return;
    }

    const calcResult = calculateAnnuity({
      startingPrincipal,
      annualAddition,
      monthlyAddition,
      annualGrowthRate,
      years,
      additionTiming: input.additionTiming,
    });

    setResult(calcResult);
  };

  const handleInputChange = (field: keyof AnnuityInput, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getPercentageBreakdown = () => {
    if (!result) return { principal: 0, additions: 0, interest: 0 };
    const total = result.endBalance;
    return {
      principal: (result.startingPrincipal / total) * 100,
      additions: (result.totalAdditions / total) * 100,
      interest: (result.totalInterest / total) * 100,
    };
  };

  const percentages = getPercentageBreakdown();

  return (
    <CalculatorLayout
      title="Annuity Calculator"
      description="Calculate annuity payments, future value, and retirement income projections"
      icon={<TrendingUp className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
    >
      <div className="grid lg:grid-cols-[40%_60%] gap-8">
        {/* Left Column - Input Form */}
        <div className="space-y-6">
          {/* Principal Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PiggyBank className="mr-2 text-emerald-600" />
              Initial Investment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Principal
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={input.startingPrincipal}
                    onChange={(e) =>
                      handleInputChange('startingPrincipal', e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="20,000"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contributions Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowUpRight className="mr-2 text-emerald-600" />
              Regular Contributions
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Addition
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={input.annualAddition}
                    onChange={(e) =>
                      handleInputChange('annualAddition', e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="10,000"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Addition
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={input.monthlyAddition}
                    onChange={(e) =>
                      handleInputChange('monthlyAddition', e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="500"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Addition Timing
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleInputChange('additionTiming', 'beginning')
                    }
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      input.additionTiming === 'beginning'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Beginning
                  </button>
                  <button
                    onClick={() => handleInputChange('additionTiming', 'end')}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      input.additionTiming === 'end'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    End
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {input.additionTiming === 'beginning'
                    ? 'Annuity Due: Payments made at the beginning of each period'
                    : 'Ordinary Annuity: Payments made at the end of each period'}
                </p>
              </div>
            </div>
          </div>

          {/* Growth & Time Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="mr-2 text-emerald-600" />
              Growth & Duration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Growth Rate
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={input.annualGrowthRate}
                    onChange={(e) =>
                      handleInputChange('annualGrowthRate', e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="11"
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period (Years)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={input.years}
                    onChange={(e) => handleInputChange('years', e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="10"
                    min="1"
                    max="50"
                    step="1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Main Result Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Future Value</h3>

                <div className="text-5xl font-bold mb-8">
                  {formatCurrency(result.endBalance)}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-t border-white/20">
                    <span className="text-emerald-100">Starting Principal</span>
                    <span className="text-xl font-semibold">
                      {formatCurrency(result.startingPrincipal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-white/20">
                    <span className="text-emerald-100">Total Additions</span>
                    <span className="text-xl font-semibold">
                      {formatCurrency(result.totalAdditions)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-white/20">
                    <span className="text-emerald-100">
                      Total Interest Earned
                    </span>
                    <span className="text-xl font-semibold">
                      {formatCurrency(result.totalInterest)}
                    </span>
                  </div>
                </div>

                {/* Visual Breakdown */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Principal ({formatNumber(percentages.principal, 1)}%)
                    </span>
                    <span>{formatCurrency(result.startingPrincipal)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-white/80"
                        style={{ width: `${percentages.principal}%` }}
                      />
                      <div
                        className="bg-emerald-300/80"
                        style={{ width: `${percentages.additions}%` }}
                      />
                      <div
                        className="bg-teal-300/80"
                        style={{ width: `${percentages.interest}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Additions ({formatNumber(percentages.additions, 1)}%)
                    </span>
                    <span>{formatCurrency(result.totalAdditions)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Interest ({formatNumber(percentages.interest, 1)}%)
                    </span>
                    <span>{formatCurrency(result.totalInterest)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs text-gray-500">Monthly</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      (parseFloat(input.monthlyAddition) || 0) +
                        (parseFloat(input.annualAddition) || 0) / 12
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Contribution</div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <ChartBar className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs text-gray-500">Growth</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(
                      ((result.endBalance -
                        result.startingPrincipal -
                        result.totalAdditions) /
                        (result.startingPrincipal + result.totalAdditions)) *
                        100,
                      1
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">
                    Return on Investment
                  </div>
                </div>
              </div>

              {/* Schedule View */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Accumulation Schedule
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScheduleView('annual')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        scheduleView === 'annual'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Annual
                    </button>
                    <button
                      onClick={() => setScheduleView('monthly')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        scheduleView === 'monthly'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          {scheduleView === 'annual' ? 'Year' : 'Month'}
                        </th>
                        <th className="px-3 py-2 text-right">Addition</th>
                        <th className="px-3 py-2 text-right">Interest</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {scheduleView === 'annual' ? (
                        result.annualSchedule.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-left font-medium text-gray-900">
                              {item.year}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {formatCurrency(item.additions)}
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-600">
                              {formatCurrency(item.interest)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium text-gray-900">
                              {formatCurrency(item.balance)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          {result.monthlySchedule
                            .slice(0, showFullSchedule ? undefined : 12)
                            .map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-left font-medium text-gray-900">
                                  {item.month}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-900">
                                  {formatCurrency(item.addition)}
                                </td>
                                <td className="px-3 py-2 text-right text-emerald-600">
                                  {formatCurrency(item.interest)}
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-gray-900">
                                  {formatCurrency(item.balance)}
                                </td>
                              </tr>
                            ))}
                          {result.monthlySchedule.length > 12 && (
                            <tr>
                              <td colSpan={4} className="text-center py-3">
                                <button
                                  onClick={() =>
                                    setShowFullSchedule(!showFullSchedule)
                                  }
                                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                                >
                                  {showFullSchedule
                                    ? 'Show Less'
                                    : `Show All ${result.monthlySchedule.length} Months`}
                                </button>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
