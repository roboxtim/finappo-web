'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ChevronDown,
  DollarSign,
  Calendar,
  Percent,
  Info,
  TrendingUp,
  PiggyBank,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateIRAResults,
  validateIRAInputs,
  formatCurrency,
  formatPercentage,
  compareIRATypes,
  calculateBreakEvenTaxRate,
  projectBeyondRetirement,
  calculateRequiredMonthlySavings,
  type IRAInputs,
  type IRAResults,
  type AnnualScheduleItem,
} from './calculations';

export default function IRACalculator() {
  // Input states
  const [currentBalance, setCurrentBalance] = useState<number>(10000);
  const [annualContribution, setAnnualContribution] = useState<number>(6000);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [currentTaxRate, setCurrentTaxRate] = useState<number>(25);
  const [retirementTaxRate, setRetirementTaxRate] = useState<number>(15);
  const [iraType, setIraType] = useState<'traditional' | 'roth' | 'both'>(
    'both'
  );

  // Results
  const [results, setResults] = useState<IRAResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'comparison' | 'schedule' | 'projection'
  >('comparison');
  const [projectionYears, setProjectionYears] = useState<number>(10);
  const [targetAmount, setTargetAmount] = useState<number>(1000000);

  // Calculate IRA results
  const calculate = useCallback(() => {
    const inputs: IRAInputs = {
      currentBalance,
      annualContribution,
      expectedReturn,
      currentAge,
      retirementAge,
      currentTaxRate,
      retirementTaxRate,
      iraType,
    };

    const validationErrors = validateIRAInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateIRAResults(inputs);
    setResults(calculatedResults);
  }, [
    currentBalance,
    annualContribution,
    expectedReturn,
    currentAge,
    retirementAge,
    currentTaxRate,
    retirementTaxRate,
    iraType,
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

  // Get comparison data
  const getComparison = () => {
    if (!results) return null;
    return compareIRATypes(results);
  };

  const comparison = getComparison();

  // Calculate additional metrics
  const monthlyContribution = annualContribution / 12;
  const requiredMonthly = results
    ? calculateRequiredMonthlySavings(
        targetAmount,
        currentBalance,
        results.yearsToRetirement,
        expectedReturn
      )
    : 0;
  const projectedValue = results
    ? projectBeyondRetirement(
        results.traditionalBalance,
        projectionYears,
        expectedReturn
      )
    : 0;

  // Get age-based contribution limit
  const getContributionLimit = () => {
    return currentAge >= 50 ? 8000 : 7000; // 2024/2025 limits
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                IRA Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Plan your retirement savings with Traditional and Roth IRA
                comparisons
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
              {/* Basic IRA Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  IRA Details
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
                      Current IRA Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(currentBalance)}
                        onChange={(e) =>
                          setCurrentBalance(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="10,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your current IRA account balance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Annual Contribution
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(annualContribution)}
                        onChange={(e) =>
                          setAnnualContribution(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="6,000"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      2025 limit: ${getContributionLimit().toLocaleString()}{' '}
                      {currentAge >= 50 && '(includes catch-up)'}
                      {monthlyContribution > 0 &&
                        ` • $${monthlyContribution.toFixed(0)}/month`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Annual Return
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expectedReturn || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.-]/g, '');
                          setExpectedReturn(value ? Number(value) : 0);
                        }}
                        className="w-full pr-10 px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="7"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Historical stock market average: 7-10% annually
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Retirement Age
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={retirementAge || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setRetirementAge(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="65"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tax Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={currentTaxRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setCurrentTaxRate(value ? Number(value) : 0);
                        }}
                        className="w-full pr-10 px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="25"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your current marginal tax rate
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Retirement Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={retirementTaxRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setRetirementTaxRate(value ? Number(value) : 0);
                        }}
                        className="w-full pr-10 px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="15"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Expected tax rate in retirement
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      IRA Type to Analyze
                    </label>
                    <select
                      value={iraType}
                      onChange={(e) =>
                        setIraType(
                          e.target.value as 'traditional' | 'roth' | 'both'
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium bg-white"
                    >
                      <option value="both">Compare Both</option>
                      <option value="traditional">Traditional IRA Only</option>
                      <option value="roth">Roth IRA Only</option>
                    </select>
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
                  {/* Main Results Card */}
                  <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <Shield className="w-4 h-4" />
                          Traditional IRA
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {formatCurrency(results.traditionalBalance)}
                        </div>
                        <div className="text-sm opacity-75">
                          Before taxes at {retirementAge}
                        </div>
                        <div className="text-xl font-semibold mt-2 text-green-200">
                          {formatCurrency(results.traditionalBalanceAfterTax)}
                        </div>
                        <div className="text-sm opacity-75">After taxes</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                          <PiggyBank className="w-4 h-4" />
                          Roth IRA
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {formatCurrency(results.rothBalance)}
                        </div>
                        <div className="text-sm opacity-75">
                          Tax-free at {retirementAge}
                        </div>
                        <div className="text-xl font-semibold mt-2 text-green-200">
                          {formatCurrency(results.rothBalance)}
                        </div>
                        <div className="text-sm opacity-75">No taxes due</div>
                      </div>
                    </div>

                    {comparison && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Recommended:{' '}
                            {comparison.better === 'traditional'
                              ? 'Traditional'
                              : 'Roth'}{' '}
                            IRA
                          </span>
                          <span className="text-lg font-bold">
                            +{formatCurrency(comparison.difference)} advantage
                          </span>
                        </div>
                        <p className="text-sm opacity-75 mt-2">
                          {comparison.reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Investment Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          Total Contributions
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(
                            results.traditionalTotalContributions
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Over {results.yearsToRetirement} years
                        </div>
                      </div>

                      <div className="bg-emerald-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          Investment Growth
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(results.traditionalTotalEarnings)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          From {formatPercentage(expectedReturn)} return
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4" />
                          Years to Retirement
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {results.yearsToRetirement}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Age {currentAge} to {retirementAge}
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Tax Impact
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.traditionalTaxSavingsNow)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Traditional IRA tax savings
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Analysis Tabs */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex border-b border-gray-200">
                      <button
                        onClick={() => setActiveTab('comparison')}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                          activeTab === 'comparison'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        IRA Comparison
                      </button>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                          activeTab === 'schedule'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Annual Schedule
                      </button>
                      <button
                        onClick={() => setActiveTab('projection')}
                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                          activeTab === 'projection'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Projections
                      </button>
                    </div>

                    <div className="p-8">
                      {/* Comparison Tab */}
                      {activeTab === 'comparison' && (
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-gray-600" />
                                Traditional IRA
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Contributions
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      results.traditionalTotalContributions
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Earnings
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      results.traditionalTotalEarnings
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Balance (before tax)
                                  </span>
                                  <span className="font-bold text-lg">
                                    {formatCurrency(results.traditionalBalance)}
                                  </span>
                                </div>
                                <div className="border-t pt-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Tax deduction benefit
                                    </span>
                                    <span className="font-medium text-green-600">
                                      +
                                      {formatCurrency(
                                        results.traditionalTaxSavingsNow
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-600">
                                      Taxes at retirement
                                    </span>
                                    <span className="font-medium text-red-600">
                                      -
                                      {formatCurrency(
                                        results.traditionalTaxesAtRetirement
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                                    <span className="text-gray-900 font-semibold">
                                      After-tax value
                                    </span>
                                    <span className="font-bold text-lg text-gray-900">
                                      {formatCurrency(
                                        results.traditionalBalanceAfterTax
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <PiggyBank className="w-5 h-5 text-gray-600" />
                                Roth IRA
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    After-tax contributions
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      results.rothTotalContributions
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Tax-free earnings
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(results.rothTotalEarnings)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Balance (tax-free)
                                  </span>
                                  <span className="font-bold text-lg">
                                    {formatCurrency(results.rothBalance)}
                                  </span>
                                </div>
                                <div className="border-t pt-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Tax paid upfront
                                    </span>
                                    <span className="font-medium text-orange-600">
                                      {formatCurrency(
                                        results.rothTotalContributions *
                                          (currentTaxRate / 100)
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-600">
                                      Taxes at retirement
                                    </span>
                                    <span className="font-medium text-green-600">
                                      $0
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                                    <span className="text-gray-900 font-semibold">
                                      Tax-free value
                                    </span>
                                    <span className="font-bold text-lg text-gray-900">
                                      {formatCurrency(results.rothBalance)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {comparison && (
                            <div
                              className={`rounded-xl p-6 ${
                                comparison.better === 'roth'
                                  ? 'bg-green-50 border-2 border-green-200'
                                  : 'bg-blue-50 border-2 border-blue-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-900">
                                  Recommendation:{' '}
                                  {comparison.better === 'traditional'
                                    ? 'Traditional'
                                    : 'Roth'}{' '}
                                  IRA
                                </h4>
                                <div
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    comparison.better === 'roth'
                                      ? 'bg-green-200 text-green-800'
                                      : 'bg-blue-200 text-blue-800'
                                  }`}
                                >
                                  +{formatCurrency(comparison.difference)}{' '}
                                  advantage
                                </div>
                              </div>
                              <p className="text-gray-600">
                                {comparison.reason}
                              </p>
                              <div className="mt-4 text-sm text-gray-500">
                                Break-even retirement tax rate:{' '}
                                {formatPercentage(
                                  calculateBreakEvenTaxRate({
                                    currentBalance,
                                    annualContribution,
                                    expectedReturn,
                                    currentAge,
                                    retirementAge,
                                    currentTaxRate,
                                    retirementTaxRate,
                                    iraType,
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Annual Schedule Tab */}
                      {activeTab === 'schedule' && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                                  Age
                                </th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                  Contribution
                                </th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                  Traditional Balance
                                </th>
                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                                  Roth Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.annualSchedule
                                .filter(
                                  (_, index) =>
                                    index % 5 === 0 ||
                                    index === results.annualSchedule.length - 1
                                )
                                .map((item: AnnualScheduleItem) => (
                                  <tr
                                    key={item.age}
                                    className="border-b border-gray-100"
                                  >
                                    <td className="py-3 px-2 text-sm font-medium">
                                      {item.age}
                                    </td>
                                    <td className="py-3 px-2 text-sm text-right">
                                      {item.contribution > 0
                                        ? formatCurrency(item.contribution)
                                        : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-sm text-right font-medium">
                                      {formatCurrency(item.traditionalBalance)}
                                    </td>
                                    <td className="py-3 px-2 text-sm text-right font-medium">
                                      {formatCurrency(item.rothBalance)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          <p className="text-xs text-gray-500 mt-4">
                            * Table shows every 5th year for clarity. Full
                            schedule includes all {results.yearsToRetirement}{' '}
                            years.
                          </p>
                        </div>
                      )}

                      {/* Projections Tab */}
                      {activeTab === 'projection' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-4">
                              Post-Retirement Growth
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Additional Years After Retirement
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={projectionYears}
                                  onChange={(e) =>
                                    setProjectionYears(Number(e.target.value))
                                  }
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:outline-none"
                                />
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">
                                  Projected value at age{' '}
                                  {retirementAge + projectionYears}
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(projectedValue)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Assuming {formatPercentage(expectedReturn)}{' '}
                                  annual growth continues
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-gray-900 mb-4">
                              Target Retirement Amount
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Target Amount at Retirement
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    $
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatInputValue(targetAmount)}
                                    onChange={(e) =>
                                      setTargetAmount(
                                        parseInputValue(e.target.value)
                                      )
                                    }
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:border-green-500 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">
                                  Required monthly savings
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(requiredMonthly)}/month
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  To reach {formatCurrency(targetAmount)} by
                                  retirement
                                </div>
                                {requiredMonthly > monthlyContribution && (
                                  <div className="mt-2 text-sm text-orange-600">
                                    ⚠️ Need{' '}
                                    {formatCurrency(
                                      requiredMonthly - monthlyContribution
                                    )}
                                    /month more
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Understanding Your Results */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Understanding Your IRA Results
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isDetailsOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isDetailsOpen && (
                      <div className="px-8 pb-8 space-y-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Traditional IRA Benefits
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • Tax-deductible contributions reduce current
                              taxable income
                            </li>
                            <li>• Tax-deferred growth until retirement</li>
                            <li>
                              • Best if you expect lower tax rate in retirement
                            </li>
                            <li>
                              • Required minimum distributions (RMDs) start at
                              age 73
                            </li>
                          </ul>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600" />
                            Roth IRA Benefits
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Tax-free withdrawals in retirement</li>
                            <li>• No required minimum distributions</li>
                            <li>• Contributions can be withdrawn anytime</li>
                            <li>
                              • Best if you expect higher tax rate in retirement
                            </li>
                          </ul>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            Key Considerations
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                              • Income limits apply for Roth IRA contributions
                            </li>
                            <li>
                              • Early withdrawals before 59½ may incur 10%
                              penalty
                            </li>
                            <li>• Consider diversifying with both IRA types</li>
                            <li>• Review and adjust contributions annually</li>
                          </ul>
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
              Understanding Individual Retirement Accounts (IRAs)
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is an IRA?
                </h3>
                <p className="mb-4">
                  An Individual Retirement Account (IRA) is a tax-advantaged
                  investment account designed to help you save for retirement.
                  IRAs offer significant tax benefits that can help your money
                  grow faster than in a regular taxable account.
                </p>
                <p>
                  There are two main types of IRAs: Traditional and Roth. Each
                  offers different tax advantages and is suited to different
                  financial situations and retirement goals.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Traditional IRA vs. Roth IRA
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Feature
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Traditional IRA
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Roth IRA
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Tax Treatment</td>
                        <td className="py-3 px-4">
                          Tax-deductible contributions
                        </td>
                        <td className="py-3 px-4">After-tax contributions</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Withdrawals</td>
                        <td className="py-3 px-4">Taxed as ordinary income</td>
                        <td className="py-3 px-4">Tax-free after age 59½</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">RMDs</td>
                        <td className="py-3 px-4">Required at age 73</td>
                        <td className="py-3 px-4">No RMDs during lifetime</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Income Limits</td>
                        <td className="py-3 px-4">
                          No income limits for contributions
                        </td>
                        <td className="py-3 px-4">Income limits apply</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">Best For</td>
                        <td className="py-3 px-4">
                          Higher earners expecting lower retirement tax rate
                        </td>
                        <td className="py-3 px-4">
                          Younger investors expecting higher retirement tax rate
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2025 IRA Contribution Limits
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Regular Contributions
                    </h4>
                    <p className="text-2xl font-bold text-green-600">$7,000</p>
                    <p className="text-sm text-gray-600">
                      For individuals under age 50
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Catch-Up Contributions
                    </h4>
                    <p className="text-2xl font-bold text-emerald-600">
                      $8,000
                    </p>
                    <p className="text-sm text-gray-600">
                      For individuals age 50 and older
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Note: These limits apply to your combined Traditional and Roth
                  IRA contributions. You cannot contribute more than the annual
                  limit across all your IRAs.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When to Choose Traditional IRA
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>High current tax bracket:</strong> If you&apos;re
                      in a high tax bracket now and expect to be in a lower
                      bracket in retirement.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Need current tax break:</strong> The immediate tax
                      deduction can reduce your current tax bill significantly.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Above Roth income limits:</strong> High earners
                      who exceed Roth IRA income limits may only be eligible for
                      Traditional IRA.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Planning to retire in low-tax state:</strong>{' '}
                      Moving from a high-tax state to a low-tax state in
                      retirement.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When to Choose Roth IRA
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Young investor:</strong> More time for tax-free
                      growth to compound, maximizing the benefit of tax-free
                      withdrawals.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Expect higher future taxes:</strong> If you
                      believe tax rates will increase or you&apos;ll be in a
                      higher bracket in retirement.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Want flexibility:</strong> Roth contributions can
                      be withdrawn anytime without penalty, providing emergency
                      access.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <strong>Estate planning:</strong> No RMDs mean you can
                      leave the entire account to heirs tax-free.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  IRA Withdrawal Rules
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Before Age 59½
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• 10% early withdrawal penalty (with exceptions)</li>
                      <li>• Exceptions: First home, education, disability</li>
                      <li>
                        • Roth contributions can be withdrawn penalty-free
                      </li>
                      <li>
                        • Roth earnings subject to penalty if withdrawn early
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      After Age 59½
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• No penalties on withdrawals</li>
                      <li>• Traditional IRA withdrawals taxed as income</li>
                      <li>• Roth withdrawals completely tax-free</li>
                      <li>• RMDs required for Traditional at age 73</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Investment Strategy Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Start early:</strong> The power of compound
                      interest means even small contributions in your 20s can
                      grow significantly by retirement.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Maximize contributions:</strong> Try to contribute
                      the maximum allowed each year to take full advantage of
                      tax benefits.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Diversify investments:</strong> Use a mix of
                      stocks, bonds, and other assets appropriate for your age
                      and risk tolerance.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Consider both types:</strong> Having both
                      Traditional and Roth IRAs provides tax diversification in
                      retirement.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-600 font-bold">5.</span>
                    <div>
                      <strong>Review annually:</strong> Reassess your
                      contribution strategy and investment allocation yearly.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on current tax
                    laws and assumptions
                  </li>
                  <li>
                    • Tax laws and contribution limits may change in the future
                  </li>
                  <li>
                    • Consult a financial advisor for personalized retirement
                    planning advice
                  </li>
                  <li>
                    • Consider your complete financial picture including 401(k)
                    and other accounts
                  </li>
                  <li>
                    • Investment returns are not guaranteed and involve risk
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
