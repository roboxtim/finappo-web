'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Calendar,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateCollegeCost,
  formatCurrency,
  formatPercentage,
  COLLEGE_PRESETS,
  type CollegeType,
} from './calculations';

export default function CollegeCostCalculator() {
  const [collegeType, setCollegeType] = useState<CollegeType>('private-4year');
  const [annualCost, setAnnualCost] = useState(65470);
  const [costIncreaseRate, setCostIncreaseRate] = useState(5);
  const [attendanceDuration, setAttendanceDuration] = useState(4);
  const [percentFromSavings, setPercentFromSavings] = useState(100);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [returnRate, setReturnRate] = useState(7);
  const [taxRate, setTaxRate] = useState(0);
  const [yearsUntilCollege, setYearsUntilCollege] = useState(10);

  const results = useMemo(() => {
    try {
      return calculateCollegeCost({
        annualCost,
        costIncreaseRate,
        attendanceDuration,
        percentFromSavings,
        currentSavings,
        returnRate,
        taxRate,
        yearsUntilCollege,
      });
    } catch {
      return null;
    }
  }, [
    annualCost,
    costIncreaseRate,
    attendanceDuration,
    percentFromSavings,
    currentSavings,
    returnRate,
    taxRate,
    yearsUntilCollege,
  ]);

  const handleCollegeTypeChange = (type: CollegeType) => {
    setCollegeType(type);
    if (type !== 'custom') {
      setAnnualCost(COLLEGE_PRESETS[type]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-white to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-6 lg:pt-28 lg:pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/financial-calculators"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Calculators
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  College Cost Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Plan for future education expenses with inflation and savings
                  growth
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* LEFT COLUMN - INPUTS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* College Type Selection */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  College Type
                </h2>

                <div className="space-y-3">
                  {(
                    [
                      'private-4year',
                      'public-instate-4year',
                      'public-outstate-4year',
                      'public-2year',
                      'custom',
                    ] as CollegeType[]
                  ).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleCollegeTypeChange(type)}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition-all text-left ${
                        collegeType === type
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {type === 'private-4year' && '4-Year Private'}
                          {type === 'public-instate-4year' &&
                            '4-Year Public (In-State)'}
                          {type === 'public-outstate-4year' &&
                            '4-Year Public (Out-of-State)'}
                          {type === 'public-2year' && '2-Year Public'}
                          {type === 'custom' && 'Custom Amount'}
                        </span>
                        {type !== 'custom' && (
                          <span className="text-sm opacity-75">
                            {formatCurrency(COLLEGE_PRESETS[type])}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* College Costs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  College Costs
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Cost (Today)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={annualCost}
                        onChange={(e) =>
                          setAnnualCost(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Cost Increase Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={costIncreaseRate}
                        onChange={(e) =>
                          setCostIncreaseRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attendance Duration (Years)
                    </label>
                    <input
                      type="number"
                      value={attendanceDuration}
                      onChange={(e) =>
                        setAttendanceDuration(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                      placeholder="0"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Years Until College Starts
                    </label>
                    <input
                      type="number"
                      value={yearsUntilCollege}
                      onChange={(e) =>
                        setYearsUntilCollege(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                      placeholder="0"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>
              </div>

              {/* Savings Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Savings Plan
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Percent of Costs from Savings
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={percentFromSavings}
                        onChange={(e) =>
                          setPercentFromSavings(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current College Savings
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={currentSavings}
                        onChange={(e) =>
                          setCurrentSavings(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Return Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={returnRate}
                        onChange={(e) =>
                          setReturnRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tax Rate on Returns
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={taxRate}
                        onChange={(e) =>
                          setTaxRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use 0% for 529 plan savings
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN - RESULTS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {results && (
                <>
                  {/* Main Result Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-purple-600 to-pink-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Total College Cost
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.totalCollegeCost)}
                    </div>
                    <div className="text-sm opacity-75">
                      over {attendanceDuration} years with {costIncreaseRate}%
                      annual increase
                    </div>
                  </div>

                  {/* Savings Summary */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Savings Summary
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <PiggyBank className="w-4 h-4" />
                          Future Value of Current Savings
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.futureValueOfSavings)}
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-xl">
                        <div className="text-sm text-gray-600 mb-1">
                          Additional Savings Needed
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(results.additionalSavingsNeeded)}
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Required Monthly Savings
                        </div>
                        <div className="text-3xl font-bold text-purple-600">
                          {formatCurrency(results.monthlySavingsRequired)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          to reach your savings goal
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Coverage from Savings
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPercentage(results.percentCoveredBySavings)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, results.percentCoveredBySavings)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Year-by-Year Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Year-by-Year Cost Breakdown
                    </h3>

                    <div className="space-y-3">
                      {results.yearByYearCosts.map((yearCost) => (
                        <div
                          key={yearCost.year}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="font-medium text-gray-700">
                            Year {yearCost.year}
                          </span>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatCurrency(yearCost.annualCost)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Total: {formatCurrency(yearCost.cumulativeCost)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Key Insights
                    </h3>

                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p>
                          Your current savings will grow to{' '}
                          <span className="font-bold">
                            {formatCurrency(results.futureValueOfSavings)}
                          </span>{' '}
                          by the time college starts.
                        </p>
                      </div>

                      {results.monthlySavingsRequired > 0 && (
                        <div className="flex items-start gap-2">
                          <PiggyBank className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p>
                            Save{' '}
                            <span className="font-bold">
                              {formatCurrency(results.monthlySavingsRequired)}
                            </span>{' '}
                            per month to cover {percentFromSavings}% of college
                            costs from savings.
                          </p>
                        </div>
                      )}

                      {results.monthlySavingsRequired === 0 && (
                        <div className="flex items-start gap-2">
                          <PiggyBank className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-green-700 font-medium">
                            Great news! Your current savings are on track to
                            cover your goal.
                          </p>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p>
                          Total college costs are projected at{' '}
                          <span className="font-bold">
                            {formatCurrency(results.totalCollegeCost)}
                          </span>{' '}
                          assuming {costIncreaseRate}% annual inflation.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
