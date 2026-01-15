'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  DollarSign,
  CreditCard,
  TrendingDown,
  Calendar,
  Percent,
  AlertTriangle,
  Target,
  PiggyBank,
  Zap,
  Calculator,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  calculateCreditCardPayoff,
  validateCreditCardInputs,
  formatCurrency,
  formatMonths,
  type CreditCardInputs,
  type CreditCardResults,
} from './calculations';

export default function CreditCardCalculator() {
  // Input states
  const [balance, setBalance] = useState<number>(5000);
  const [apr, setApr] = useState<number>(18);
  const [paymentType, setPaymentType] = useState<
    'minimum' | 'fixed' | 'timeframe'
  >('fixed');
  const [fixedPayment, setFixedPayment] = useState<number>(200);
  const [payoffMonths, setPayoffMonths] = useState<number>(24);

  // Results and UI state
  const [results, setResults] = useState<CreditCardResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);

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

  // Calculate results
  const calculate = useCallback(() => {
    const inputs: CreditCardInputs = {
      balance,
      apr,
      paymentType,
      fixedPayment: paymentType === 'fixed' ? fixedPayment : 0,
      payoffMonths: paymentType === 'timeframe' ? payoffMonths : 0,
    };

    const validationErrors = validateCreditCardInputs(inputs);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    setErrors([]);
    const calculatedResults = calculateCreditCardPayoff(inputs);
    setResults(calculatedResults);
  }, [balance, apr, paymentType, fixedPayment, payoffMonths]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Quick payment options
  const setQuickPayment = (
    type: 'minimum' | 'double' | 'fixed100' | 'fixed500'
  ) => {
    switch (type) {
      case 'minimum':
        setPaymentType('minimum');
        break;
      case 'double':
        if (results) {
          setPaymentType('fixed');
          setFixedPayment(results.minimumPayment * 2);
        }
        break;
      case 'fixed100':
        setPaymentType('fixed');
        setFixedPayment(100);
        break;
      case 'fixed500':
        setPaymentType('fixed');
        setFixedPayment(500);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-white to-white">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Credit Card Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate payoff time, interest charges, and create a debt-free
                plan
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
              {/* Balance Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Credit Card Balance
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
                      Current Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(balance)}
                        onChange={(e) =>
                          setBalance(parseInputValue(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors font-medium"
                        placeholder="5,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate (APR)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={apr || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setApr(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors font-medium"
                        placeholder="18.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Annual Percentage Rate (APR) of your credit card
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Strategy */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Strategy
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Choose Payment Option
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-300 transition-colors">
                        <input
                          type="radio"
                          name="paymentType"
                          value="minimum"
                          checked={paymentType === 'minimum'}
                          onChange={() => setPaymentType('minimum')}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Minimum Payment Only
                        </span>
                      </label>

                      <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-300 transition-colors">
                        <input
                          type="radio"
                          name="paymentType"
                          value="fixed"
                          checked={paymentType === 'fixed'}
                          onChange={() => setPaymentType('fixed')}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Fixed Monthly Payment
                        </span>
                      </label>

                      <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-red-300 transition-colors">
                        <input
                          type="radio"
                          name="paymentType"
                          value="timeframe"
                          checked={paymentType === 'timeframe'}
                          onChange={() => setPaymentType('timeframe')}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Desired Payoff Timeframe
                        </span>
                      </label>
                    </div>
                  </div>

                  {paymentType === 'fixed' && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Monthly Payment Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(fixedPayment)}
                          onChange={(e) =>
                            setFixedPayment(parseInputValue(e.target.value))
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors font-medium"
                          placeholder="200"
                        />
                      </div>
                      {results && (
                        <p className="mt-1 text-xs text-gray-500">
                          Minimum payment:{' '}
                          {formatCurrency(results.minimumPayment)}
                        </p>
                      )}
                    </div>
                  )}

                  {paymentType === 'timeframe' && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Desired Payoff Time (Months)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={payoffMonths || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setPayoffMonths(value ? Number(value) : 0);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors font-medium"
                        placeholder="24"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {payoffMonths > 0 && formatMonths(payoffMonths)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Payment Options */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Quick Payment Options
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setQuickPayment('minimum')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Minimum Only
                  </button>
                  <button
                    onClick={() => setQuickPayment('double')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    2× Minimum
                  </button>
                  <button
                    onClick={() => setQuickPayment('fixed100')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    $100/month
                  </button>
                  <button
                    onClick={() => setQuickPayment('fixed500')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    $500/month
                  </button>
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-red-600 to-pink-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Calendar className="w-4 h-4" />
                      Time to Pay Off
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatMonths(results.monthsToPayoff)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      Making{' '}
                      {paymentType === 'minimum'
                        ? 'minimum'
                        : formatCurrency(results.monthlyPayment)}{' '}
                      monthly payments
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Total Interest</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalInterest)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Total Amount</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.totalPaid)}
                        </div>
                      </div>
                    </div>

                    {results.monthsToPayoff > 120 && (
                      <div className="mt-4 p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <p className="text-sm">
                            Warning: This will take over{' '}
                            {Math.floor(results.monthsToPayoff / 12)} years to
                            pay off!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Comparison */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Payment Comparison
                    </h3>

                    <div className="space-y-4">
                      {results.paymentComparisons.map((comparison, index) => {
                        const isCurrentPayment = comparison.type === 'current';
                        const bgColor = isCurrentPayment
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
                          : 'bg-gray-50';
                        const borderColor = isCurrentPayment
                          ? 'border-blue-200'
                          : 'border-gray-200';

                        return (
                          <div
                            key={index}
                            className={`${bgColor} rounded-2xl p-4 border ${borderColor}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {comparison.type === 'minimum' && (
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                )}
                                {comparison.type === 'current' && (
                                  <Target className="w-4 h-4 text-blue-600" />
                                )}
                                {comparison.type === 'double' && (
                                  <Zap className="w-4 h-4 text-green-600" />
                                )}
                                {comparison.type === 'extra' && (
                                  <PiggyBank className="w-4 h-4 text-purple-600" />
                                )}
                                <span className="font-semibold text-gray-900">
                                  {comparison.type === 'minimum' &&
                                    'Minimum Payment'}
                                  {comparison.type === 'current' &&
                                    'Your Payment'}
                                  {comparison.type === 'double' &&
                                    'Double Payment'}
                                  {comparison.type === 'extra' &&
                                    'Extra $50/month'}
                                </span>
                              </div>
                              <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(comparison.payment)}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-gray-600">Time</div>
                                <div className="font-semibold text-gray-900">
                                  {formatMonths(comparison.monthsToPayoff)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Interest</div>
                                <div className="font-semibold text-gray-900">
                                  {formatCurrency(comparison.totalInterest)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Total</div>
                                <div className="font-semibold text-gray-900">
                                  {formatCurrency(comparison.totalPaid)}
                                </div>
                              </div>
                            </div>

                            {comparison.interestSaved &&
                              comparison.interestSaved > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-300/50">
                                  <p className="text-xs text-green-700">
                                    Save{' '}
                                    {formatCurrency(comparison.interestSaved)}{' '}
                                    in interest and pay off{' '}
                                    {comparison.timeSaved} months sooner
                                  </p>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Key Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Percent className="w-4 h-4" />
                          Daily Rate
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {(results.dailyInterestRate * 100).toFixed(4)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          APR ÷ 365
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          First Month Interest
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.firstMonthInterest)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Balance × Monthly Rate
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calculator className="w-4 h-4" />
                          Minimum Payment
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.minimumPayment)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          1% + Interest
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingDown className="w-4 h-4" />
                          Effective APR
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {results.effectiveAPR.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          With compounding
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amortization Schedule */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setShowAmortization(!showAmortization)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Payment Schedule
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          showAmortization ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showAmortization && (
                      <div className="px-8 pb-8">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                  Month
                                </th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                  Payment
                                </th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                  Principal
                                </th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                  Interest
                                </th>
                                <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                  Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.amortizationSchedule
                                .slice(0, 12)
                                .map((month) => (
                                  <tr
                                    key={month.month}
                                    className="border-b border-gray-100"
                                  >
                                    <td className="py-2 px-2">{month.month}</td>
                                    <td className="text-right py-2 px-2">
                                      {formatCurrency(month.payment)}
                                    </td>
                                    <td className="text-right py-2 px-2">
                                      {formatCurrency(month.principalPaid)}
                                    </td>
                                    <td className="text-right py-2 px-2">
                                      {formatCurrency(month.interestPaid)}
                                    </td>
                                    <td className="text-right py-2 px-2 font-medium">
                                      {formatCurrency(month.remainingBalance)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {results.amortizationSchedule.length > 12 && (
                            <p className="text-sm text-gray-500 mt-4 text-center">
                              Showing first 12 months of{' '}
                              {results.amortizationSchedule.length} total
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tips Section */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setShowTips(!showTips)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Tips to Pay Off Debt Faster
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          showTips ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showTips && (
                      <div className="px-8 pb-8 space-y-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-green-600" />
                            Pay More Than Minimum
                          </h4>
                          <p className="text-sm text-gray-600">
                            Always pay more than the minimum payment. Even an
                            extra $50/month can save thousands in interest and
                            years of payments.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-blue-600" />
                            Use the Avalanche Method
                          </h4>
                          <p className="text-sm text-gray-600">
                            Pay minimums on all cards, then put extra money
                            toward the card with the highest interest rate
                            first.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-purple-600" />
                            Consider Balance Transfer
                          </h4>
                          <p className="text-sm text-gray-600">
                            Look for 0% APR balance transfer offers to save on
                            interest while paying down your debt.
                          </p>
                        </div>

                        <div className="bg-amber-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-amber-600" />
                            Make Bi-Weekly Payments
                          </h4>
                          <p className="text-sm text-gray-600">
                            Pay half your payment every two weeks instead of
                            once monthly. This results in 13 full payments per
                            year instead of 12.
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
              Understanding Credit Card Debt
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Credit Card Interest Works
                </h3>
                <p className="mb-4">
                  Credit card interest is calculated using your Annual
                  Percentage Rate (APR) and your average daily balance. Most
                  cards use the &quot;average daily balance&quot; method, which
                  calculates interest on your balance each day of the billing
                  cycle.
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2">
                    Daily Interest Calculation
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Daily Rate = APR ÷ 365</li>
                    <li>• Daily Interest = Balance × Daily Rate</li>
                    <li>• Monthly Interest = Sum of daily interest charges</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Minimum Payment Trap
                </h3>
                <p className="mb-4">
                  Minimum payments are typically calculated as 1% of your
                  balance plus the monthly interest charge, with a minimum of
                  $15-$25. While paying only the minimum keeps your account in
                  good standing, it can lead to:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>
                      <strong>Extended payoff time:</strong> A $5,000 balance at
                      18% APR can take over 20 years to pay off with minimum
                      payments.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>
                      <strong>Excessive interest charges:</strong> You could pay
                      more in interest than your original balance.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>
                      <strong>Slow principal reduction:</strong> Most of your
                      payment goes to interest, not reducing your balance.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Strategies to Pay Off Credit Card Debt
                </h3>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      1. The Avalanche Method
                    </h4>
                    <p className="text-sm">
                      Pay minimum on all cards, then focus extra payments on the
                      highest interest rate card first. This minimizes total
                      interest paid.
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      2. The Snowball Method
                    </h4>
                    <p className="text-sm">
                      Pay minimum on all cards, then focus extra payments on the
                      smallest balance first. This provides psychological wins
                      and momentum.
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      3. Balance Transfer
                    </h4>
                    <p className="text-sm">
                      Transfer high-interest balances to a card with a 0%
                      introductory APR. This gives you time to pay down
                      principal without accruing interest.
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      4. Debt Consolidation
                    </h4>
                    <p className="text-sm">
                      Take out a personal loan at a lower interest rate to pay
                      off multiple credit cards, simplifying payments and
                      potentially saving on interest.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Faster Payoff
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Round up payments:</strong> Round your payment to
                    the nearest $50 or $100
                  </li>
                  <li>
                    • <strong>Apply windfalls:</strong> Use tax refunds,
                    bonuses, or gifts toward your balance
                  </li>
                  <li>
                    • <strong>Cut expenses:</strong> Temporarily reduce
                    discretionary spending to increase payments
                  </li>
                  <li>
                    • <strong>Increase income:</strong> Consider a side hustle
                    to generate extra payment money
                  </li>
                  <li>
                    • <strong>Automate payments:</strong> Set up automatic
                    payments above the minimum
                  </li>
                  <li>
                    • <strong>Pay twice monthly:</strong> Make payments every
                    two weeks instead of monthly
                  </li>
                  <li>
                    • <strong>Negotiate APR:</strong> Call your issuer to
                    request a lower interest rate
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Understanding Your Credit Score Impact
                </h3>
                <p className="mb-4">
                  How you manage credit card debt significantly affects your
                  credit score:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Positive Impacts
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• On-time payments (35% of score)</li>
                      <li>• Low credit utilization (&lt;30%)</li>
                      <li>• Long credit history</li>
                      <li>• Mix of credit types</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-2">
                      Negative Impacts
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Late or missed payments</li>
                      <li>• High credit utilization (&gt;30%)</li>
                      <li>• Maxed out cards</li>
                      <li>• Too many new accounts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Warning Signs of Credit Card Trouble
                </h3>
                <p className="mb-4">
                  Seek help if you experience these warning signs:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    <span>Only making minimum payments regularly</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    <span>Using cards for necessities due to lack of cash</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    <span>Maxing out credit limits</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    <span>Taking cash advances to pay bills</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    <span>Missing payments or paying late</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                    <span>Not knowing your total debt amount</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm font-medium">
                  Consider credit counseling or debt management programs if
                  you&apos;re struggling with credit card debt.
                </p>
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
