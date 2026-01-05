'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Calculator, ChevronDown, Plus, X } from 'lucide-react';
import {
  calculateAmortization,
  type AmortizationInputs,
  type ExtraPayments,
  type AmortizationResults,
  type CompoundPeriod,
  type PaymentFrequency,
} from './__tests__/amortizationCalculations';

export default function AmortizationCalculator() {
  // Basic inputs
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [loanTermYears, setLoanTermYears] = useState<number>(2);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [compoundPeriod, setCompoundPeriod] = useState<CompoundPeriod>('monthly');
  const [paymentFrequency, setPaymentFrequency] =
    useState<PaymentFrequency>('monthly');

  // Start date
  const [startMonth, setStartMonth] = useState<number>(0); // 0 = January
  const [startYear, setStartYear] = useState<number>(2026);

  // Extra payments
  const [showExtraPayments, setShowExtraPayments] = useState<boolean>(false);
  const [monthlyExtra, setMonthlyExtra] = useState<number>(0);
  const [monthlyExtraStartMonth, setMonthlyExtraStartMonth] =
    useState<number>(1);
  const [yearlyExtra, setYearlyExtra] = useState<number>(0);
  const [yearlyExtraStartMonth, setYearlyExtraStartMonth] =
    useState<number>(12);
  const [oneTimePayments, setOneTimePayments] = useState<
    Array<{ amount: number; month: number }>
  >([]);

  // Results
  const [results, setResults] = useState<AmortizationResults | null>(null);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [scheduleView, setScheduleView] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [hoveredPayment, setHoveredPayment] = useState<number | null>(null);

  // Calculate amortization
  const calculate = useCallback(() => {
    const inputs: AmortizationInputs = {
      loanAmount,
      loanTermYears,
      loanTermMonths,
      interestRate,
      compoundPeriod,
      paymentFrequency,
      startDate: new Date(startYear, startMonth, 1),
    };

    const extraPaymentsData: ExtraPayments = {
      monthlyExtra,
      monthlyExtraStartMonth,
      yearlyExtra,
      yearlyExtraStartMonth,
      oneTimePayments,
    };

    const calculatedResults = calculateAmortization(inputs, extraPaymentsData);
    setResults(calculatedResults);
  }, [
    loanAmount,
    loanTermYears,
    loanTermMonths,
    interestRate,
    compoundPeriod,
    paymentFrequency,
    monthlyExtra,
    monthlyExtraStartMonth,
    yearlyExtra,
    yearlyExtraStartMonth,
    oneTimePayments,
    startMonth,
    startYear,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCurrencySimple = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatInputValue = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const addOneTimePayment = () => {
    setOneTimePayments([...oneTimePayments, { amount: 0, month: 12 }]);
  };

  const removeOneTimePayment = (index: number) => {
    setOneTimePayments(oneTimePayments.filter((_, i) => i !== index));
  };

  const updateOneTimePayment = (
    index: number,
    field: 'amount' | 'month',
    value: number
  ) => {
    const updated = [...oneTimePayments];
    updated[index] = { ...updated[index], [field]: value };
    setOneTimePayments(updated);
  };

  // Generate annual summary
  const getAnnualSummary = () => {
    if (!results) return [];

    const paymentPeriodsPerYear =
      paymentFrequency === 'monthly'
        ? 12
        : paymentFrequency === 'quarterly'
        ? 4
        : paymentFrequency === 'semi-annually'
        ? 2
        : paymentFrequency === 'annually'
        ? 1
        : paymentFrequency === 'bi-weekly'
        ? 26
        : paymentFrequency === 'weekly'
        ? 52
        : paymentFrequency === 'semi-monthly'
        ? 24
        : paymentFrequency === 'daily'
        ? 365
        : 12;

    const annual: Array<{
      year: number;
      principal: number;
      interest: number;
      balance: number;
      totalPayments: number;
    }> = [];

    const totalYears = Math.ceil(
      results.amortizationSchedule.length / paymentPeriodsPerYear
    );

    for (let year = 1; year <= totalYears; year++) {
      const startPayment = (year - 1) * paymentPeriodsPerYear;
      const endPayment = Math.min(
        year * paymentPeriodsPerYear,
        results.amortizationSchedule.length
      );
      const yearData = results.amortizationSchedule.slice(
        startPayment,
        endPayment
      );

      annual.push({
        year,
        principal: yearData.reduce(
          (sum, p) => sum + p.principal + p.extraPayment,
          0
        ),
        interest: yearData.reduce((sum, p) => sum + p.interest, 0),
        balance: yearData[yearData.length - 1]?.balance || 0,
        totalPayments: yearData.reduce(
          (sum, p) => sum + p.payment + p.extraPayment,
          0
        ),
      });
    }

    return annual;
  };

  // Calculate breakdown percentages
  const principalPercentage =
    results && results.loanAmount + results.totalInterest > 0
      ? (results.loanAmount / (results.loanAmount + results.totalInterest)) * 100
      : 50;

  return (
    <CalculatorLayout
      title="Amortization Calculator"
      description="Calculate loan amortization with customizable payment and compound frequencies"
      icon={<Calculator className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
    >
      {/* Calculator Section */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Loan Parameters */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Loan Details
                </h2>

                <div className="space-y-6">
                  {/* Loan Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(loanAmount)}
                        onChange={(e) => {
                          setLoanAmount(parseInputValue(e.target.value));
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Term
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          value={loanTermYears}
                          onChange={(e) =>
                            setLoanTermYears(Number(e.target.value) || 0)
                          }
                          min="0"
                          max="50"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                          placeholder="Years"
                        />
                        <div className="text-xs text-gray-500 mt-1">Years</div>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={loanTermMonths}
                          onChange={(e) =>
                            setLoanTermMonths(Number(e.target.value) || 0)
                          }
                          min="0"
                          max="11"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                          placeholder="Months"
                        />
                        <div className="text-xs text-gray-500 mt-1">Months</div>
                      </div>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate (Annual)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={interestRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = value.split('.');
                          const formatted =
                            parts.length > 2
                              ? parts[0] + '.' + parts.slice(1).join('')
                              : value;
                          setInterestRate(formatted ? Number(formatted) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Compound Period */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Compound Period
                    </label>
                    <select
                      value={compoundPeriod}
                      onChange={(e) =>
                        setCompoundPeriod(e.target.value as CompoundPeriod)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="semi-monthly">Semi-Monthly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annually">Semi-Annually</option>
                      <option value="annually">Annually</option>
                      <option value="continuously">Continuously</option>
                    </select>
                  </div>

                  {/* Payment Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Frequency
                    </label>
                    <select
                      value={paymentFrequency}
                      onChange={(e) =>
                        setPaymentFrequency(e.target.value as PaymentFrequency)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="semi-monthly">Semi-Monthly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annually">Semi-Annually</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={startMonth}
                        onChange={(e) => setStartMonth(Number(e.target.value))}
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      >
                        {[
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec',
                        ].map((month, i) => (
                          <option key={i} value={i}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={startYear}
                        onChange={(e) =>
                          setStartYear(Number(e.target.value) || 2026)
                        }
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Payments */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <button
                  onClick={() => setShowExtraPayments(!showExtraPayments)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Extra Payments
                  </h2>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      showExtraPayments ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showExtraPayments && (
                  <div className="mt-6 space-y-6">
                    {/* Monthly Extra Payment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Extra Monthly Payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(monthlyExtra)}
                          onChange={(e) => {
                            setMonthlyExtra(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      {monthlyExtra > 0 && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            Start from month
                          </label>
                          <input
                            type="number"
                            value={monthlyExtraStartMonth}
                            onChange={(e) =>
                              setMonthlyExtraStartMonth(
                                Number(e.target.value) || 1
                              )
                            }
                            min="1"
                            className="w-32 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Yearly Extra Payment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Extra Yearly Payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(yearlyExtra)}
                          onChange={(e) => {
                            setYearlyExtra(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      {yearlyExtra > 0 && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            Start from month
                          </label>
                          <input
                            type="number"
                            value={yearlyExtraStartMonth}
                            onChange={(e) =>
                              setYearlyExtraStartMonth(
                                Number(e.target.value) || 12
                              )
                            }
                            min="1"
                            className="w-32 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* One-Time Payments */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          One-Time Payments
                        </label>
                        <button
                          onClick={addOneTimePayment}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {oneTimePayments.length > 0 && (
                        <div className="space-y-3">
                          {oneTimePayments.map((payment, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Amount"
                                  value={formatInputValue(payment.amount)}
                                  onChange={(e) =>
                                    updateOneTimePayment(
                                      index,
                                      'amount',
                                      parseInputValue(e.target.value)
                                    )
                                  }
                                  className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="Month"
                                value={payment.month}
                                onChange={(e) =>
                                  updateOneTimePayment(
                                    index,
                                    'month',
                                    Number(e.target.value) || 1
                                  )
                                }
                                min="1"
                                className="w-24 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                              />
                              <button
                                onClick={() => removeOneTimePayment(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
              {results && (
                <>
                  {/* Payment Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Regular Payment
                    </div>
                    <div className="text-5xl font-bold mb-6">
                      {formatCurrency(results.regularPayment)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Loan Amount</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrencySimple(results.loanAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Payments</div>
                        <div className="text-xl font-semibold mt-1">
                          {results.amortizationSchedule.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Loan Breakdown
                    </h3>

                    {/* Chart */}
                    <div className="mb-6">
                      <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                        <div
                          className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                          style={{ width: `${principalPercentage}%` }}
                        >
                          {principalPercentage > 15 &&
                            `Principal ${principalPercentage.toFixed(1)}%`}
                        </div>
                        <div
                          className="bg-orange-500 flex items-center justify-center text-white text-sm font-semibold"
                          style={{ width: `${100 - principalPercentage}%` }}
                        >
                          {100 - principalPercentage > 15 &&
                            `Interest ${(100 - principalPercentage).toFixed(1)}%`}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span className="text-sm text-gray-600">
                              Principal
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.loanAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500"></div>
                            <span className="text-sm text-gray-600">
                              Total Interest
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.totalInterest)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total to Pay</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.totalPayments)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payoff Date</span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(results.payoffDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Over Time Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Balance Over Time
                    </h3>

                    {/* SVG Chart */}
                    <div className="relative h-64 mb-6">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 800 256"
                        preserveAspectRatio="none"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 800;
                          const paymentIndex = Math.round(
                            (x / 800) * (results.amortizationSchedule.length - 1)
                          );
                          setHoveredPayment(
                            Math.max(
                              0,
                              Math.min(
                                paymentIndex,
                                results.amortizationSchedule.length - 1
                              )
                            )
                          );
                        }}
                        onMouseLeave={() => setHoveredPayment(null)}
                      >
                        {/* Grid lines */}
                        <g className="opacity-10">
                          {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                            <line
                              key={y}
                              x1="0"
                              y1={256 * y}
                              x2="800"
                              y2={256 * y}
                              stroke="#6B7280"
                              strokeWidth="1"
                            />
                          ))}
                        </g>

                        {/* Balance area */}
                        <defs>
                          <linearGradient
                            id="balanceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3B82F6"
                              stopOpacity="0.6"
                            />
                            <stop
                              offset="100%"
                              stopColor="#3B82F6"
                              stopOpacity="0.2"
                            />
                          </linearGradient>
                        </defs>

                        <path
                          d={(() => {
                            const points = results.amortizationSchedule
                              .map((row, i) => {
                                const x =
                                  (i /
                                    (results.amortizationSchedule.length - 1)) *
                                  800;
                                const y =
                                  256 -
                                  (row.balance / results.loanAmount) * 256;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#balanceGradient)"
                        />

                        {/* Balance line */}
                        <polyline
                          points={results.amortizationSchedule
                            .map((row, i) => {
                              const x =
                                (i / (results.amortizationSchedule.length - 1)) *
                                800;
                              const y =
                                256 - (row.balance / results.loanAmount) * 256;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />

                        {/* Hover indicator */}
                        {hoveredPayment !== null && (
                          <line
                            x1={
                              (hoveredPayment /
                                (results.amortizationSchedule.length - 1)) *
                              800
                            }
                            y1="0"
                            x2={
                              (hoveredPayment /
                                (results.amortizationSchedule.length - 1)) *
                              800
                            }
                            y2="256"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity="0.6"
                          />
                        )}
                      </svg>

                      {/* Tooltip */}
                      {hoveredPayment !== null && (
                        <div
                          className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-10 shadow-xl"
                          style={{
                            left: `${
                              (hoveredPayment /
                                (results.amortizationSchedule.length - 1)) *
                              100
                            }%`,
                            top: '50%',
                            transform:
                              hoveredPayment >
                              results.amortizationSchedule.length / 2
                                ? 'translate(-100%, -50%)'
                                : 'translate(10px, -50%)',
                          }}
                        >
                          <div className="font-bold mb-2 text-base">
                            Payment {hoveredPayment + 1}
                          </div>
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-gray-300 text-xs">
                                Balance:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredPayment]
                                    .balance
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 text-xs">
                                Principal:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredPayment]
                                    .principal
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 text-xs">
                                Interest:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredPayment]
                                    .interest
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Start</span>
                      <span>
                        {Math.floor(results.amortizationSchedule.length / 2)}{' '}
                        payments
                      </span>
                      <span>Payoff</span>
                    </div>
                  </div>

                  {/* Amortization Schedule */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Amortization Schedule
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isScheduleOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isScheduleOpen && (
                      <div className="px-8 pb-8">
                        {/* View Toggle */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setScheduleView('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              scheduleView === 'monthly'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Payment by Payment
                          </button>
                          <button
                            onClick={() => setScheduleView('annual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              scheduleView === 'annual'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Annual Summary
                          </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {scheduleView === 'monthly' ? (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    #
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Payment
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Principal
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Interest
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {results.amortizationSchedule.map((row) => (
                                  <tr
                                    key={row.paymentNumber}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.paymentNumber}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900">
                                      {formatCurrency(
                                        row.payment + row.extraPayment
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600">
                                      {formatCurrency(
                                        row.principal + row.extraPayment
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-orange-600">
                                      {formatCurrency(row.interest)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                      {formatCurrency(row.balance)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Year
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Principal
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Interest
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {getAnnualSummary().map((row) => (
                                  <tr
                                    key={row.year}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.year}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600">
                                      {formatCurrencySimple(row.principal)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-orange-600">
                                      {formatCurrencySimple(row.interest)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                      {formatCurrencySimple(row.balance)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
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

      {/* Explanation Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Amortization
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Amortization?
                </h3>
                <p className="mb-4">
                  Amortization is the process of paying off a loan through
                  regular payments over time. Each payment covers both the
                  interest charges and a portion of the principal balance. Early
                  in the loan, most of your payment goes toward interest. Over
                  time, more of each payment goes toward reducing the principal.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Compound and Payment Frequencies Work
                </h3>
                <p className="mb-4">
                  The compound period determines how often interest is calculated
                  and added to your balance. The payment frequency determines how
                  often you make payments. These can be different:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Monthly Compounding, Monthly Payments:</strong> Most
                    common for mortgages and car loans
                  </li>
                  <li>
                    <strong>Daily Compounding, Monthly Payments:</strong> Common
                    for credit cards
                  </li>
                  <li>
                    <strong>Bi-Weekly Payments:</strong> Results in 26 payments
                    per year (effectively 13 monthly payments), helping you pay
                    off the loan faster
                  </li>
                  <li>
                    <strong>Semi-Annual Compounding:</strong> Often used for
                    Canadian mortgages
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Benefits of Making Extra Payments
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Reduce Total Interest:</strong> Extra payments go
                    directly toward principal, reducing the amount of interest
                    you pay over the life of the loan
                  </li>
                  <li>
                    <strong>Shorten Loan Term:</strong> Paying extra can help you
                    become debt-free months or even years earlier
                  </li>
                  <li>
                    <strong>Build Equity Faster:</strong> For secured loans like
                    mortgages, you build ownership in your asset more quickly
                  </li>
                  <li>
                    <strong>Flexible Options:</strong> Make extra payments
                    monthly, annually, or as one-time lump sums when you have
                    extra cash
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Loan Types and Their Terms
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Mortgages:</strong> Typically 15-30 years with
                    monthly payments and monthly or semi-annual compounding
                  </li>
                  <li>
                    <strong>Auto Loans:</strong> Usually 3-7 years with monthly
                    payments and monthly compounding
                  </li>
                  <li>
                    <strong>Personal Loans:</strong> Generally 1-7 years with
                    monthly payments and daily or monthly compounding
                  </li>
                  <li>
                    <strong>Student Loans:</strong> Often 10-25 years with
                    monthly payments and daily compounding
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates for informational
                    purposes only
                  </li>
                  <li>
                    • Actual loan terms and rates may vary based on your credit
                    profile and lender
                  </li>
                  <li>
                    • Some loans may have prepayment penalties for making extra
                    payments
                  </li>
                  <li>
                    • Always verify the compound period and any fees with your
                    lender
                  </li>
                  <li>
                    • Consider consulting a financial advisor for personalized
                    advice
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
