'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect } from 'react';
import {
  Tag,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import {
  calculateCashBackVsLowInterest,
  type CashBackVsLowInterestInputs,
  type CashBackVsLowInterestResults,
} from './utils/calculations';

export default function CashBackVsLowInterestCalculator() {
  // Input states
  const [purchasePrice, setPurchasePrice] = useState<number>(30000);
  const [cashBack, setCashBack] = useState<number>(2000);
  const [standardRate, setStandardRate] = useState<number>(6);
  const [reducedRate, setReducedRate] = useState<number>(2);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(60);
  const [downPayment, setDownPayment] = useState<number>(5000);

  // Results state
  const [results, setResults] = useState<CashBackVsLowInterestResults | null>(
    null
  );

  useEffect(() => {
    const inputs: CashBackVsLowInterestInputs = {
      purchasePrice,
      cashBack,
      standardRate,
      reducedRate,
      loanTermMonths,
      downPayment,
    };

    const calculatedResults = calculateCashBackVsLowInterest(inputs);
    setResults(calculatedResults);
  }, [
    purchasePrice,
    cashBack,
    standardRate,
    reducedRate,
    loanTermMonths,
    downPayment,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleInputChange = (
    value: string,
    setter: (value: number) => void,
    min: number = 0,
    max?: number
  ) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    const clampedValue = Math.max(
      min,
      max !== undefined ? Math.min(max, numericValue) : numericValue
    );
    setter(clampedValue);
  };

  return (
    <CalculatorLayout
      title="Cash Back vs Low Interest Calculator"
      description="Compare dealer incentives: cash back rebates versus low interest rate financing to find which option saves you the most money"
      icon={<Tag className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
    >
      {/* Calculator Section */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Input Form - Left Column (40%) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 self-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-emerald-600" />
                Purchase Details
              </h2>

              {/* Purchase Price */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={purchasePrice.toLocaleString()}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setPurchasePrice, 1000)
                    }
                    className="w-full pl-8 pr-4 py-3 text-gray-900 font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-600"
                />
              </div>

              {/* Down Payment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Down Payment
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={downPayment.toLocaleString()}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        setDownPayment,
                        0,
                        purchasePrice
                      )
                    }
                    className="w-full pl-8 pr-4 py-3 text-gray-900 font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.floor(purchasePrice * 0.5)}
                  step="500"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-600"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-emerald-600" />
                Dealer Incentives
              </h3>

              {/* Cash Back */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cash Back Rebate
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={cashBack.toLocaleString()}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        setCashBack,
                        0,
                        purchasePrice
                      )
                    }
                    className="w-full pl-8 pr-4 py-3 text-gray-900 font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={cashBack}
                  onChange={(e) => setCashBack(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-600"
                />
              </div>

              {/* Standard Interest Rate */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Standard Interest Rate (with cash back)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={standardRate}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setStandardRate, 0, 30)
                    }
                    step="0.1"
                    className="w-full pl-4 pr-8 py-3 text-gray-900 font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={standardRate}
                  onChange={(e) => setStandardRate(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-600"
                />
              </div>

              {/* Reduced Interest Rate */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reduced Interest Rate (without cash back)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={reducedRate}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setReducedRate, 0, 30)
                    }
                    step="0.1"
                    className="w-full pl-4 pr-8 py-3 text-gray-900 font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={reducedRate}
                  onChange={(e) => setReducedRate(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-600"
                />
              </div>

              {/* Loan Term */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Term (Months)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={loanTermMonths}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        setLoanTermMonths,
                        12,
                        120
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 text-gray-900 font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {[24, 36, 48, 60, 72, 84].map((months) => (
                    <button
                      key={months}
                      onClick={() => setLoanTermMonths(months)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        loanTermMonths === months
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {months}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Results - Right Column (60%) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {results && (
                <>
                  {/* Recommendation Banner */}
                  <div
                    className={`rounded-2xl p-6 shadow-lg ${
                      results.recommendation === 'cashBack'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          {results.recommendation === 'cashBack'
                            ? 'Take the Cash Back!'
                            : 'Take the Low Interest Rate!'}
                        </h3>
                        <p className="text-white/90 text-lg">
                          You&apos;ll save {formatCurrency(results.savings)}{' '}
                          over the life of the loan
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">
                          {formatCurrency(results.savings)}
                        </div>
                        <div className="text-white/90">Total Savings</div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Cash Back Option */}
                    <div
                      className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all ${
                        results.recommendation === 'cashBack'
                          ? 'border-emerald-500 ring-4 ring-emerald-100'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Tag className="w-5 h-5 mr-2 text-emerald-600" />
                          Cash Back Option
                        </h3>
                        {results.recommendation === 'cashBack' && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                            WINNER
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="bg-emerald-50 rounded-xl p-4">
                          <div className="text-sm text-emerald-700 font-medium mb-1">
                            Loan Amount
                          </div>
                          <div className="text-2xl font-bold text-emerald-900">
                            {formatCurrency(results.cashBackOption.loanAmount)}
                          </div>
                          <div className="text-xs text-emerald-600 mt-1">
                            Reduced by {formatCurrency(cashBack)} cash back
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Interest Rate</span>
                          <span className="font-semibold text-gray-900">
                            {formatPercent(standardRate)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Monthly Payment</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              results.cashBackOption.monthlyPayment
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Interest</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              results.cashBackOption.totalInterest
                            )}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mt-4">
                          <div className="text-sm text-gray-600 mb-1">
                            Total Cost
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(results.cashBackOption.totalPaid)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Including {formatCurrency(downPayment)} down payment
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Low Interest Option */}
                    <div
                      className={`bg-white rounded-2xl shadow-xl p-6 border-2 transition-all ${
                        results.recommendation === 'lowInterest'
                          ? 'border-blue-500 ring-4 ring-blue-100'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
                          Low Interest Option
                        </h3>
                        {results.recommendation === 'lowInterest' && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            WINNER
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="text-sm text-blue-700 font-medium mb-1">
                            Loan Amount
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatCurrency(
                              results.lowInterestOption.loanAmount
                            )}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            No cash back applied
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Interest Rate</span>
                          <span className="font-semibold text-gray-900">
                            {formatPercent(reducedRate)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Monthly Payment</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              results.lowInterestOption.monthlyPayment
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Interest</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(
                              results.lowInterestOption.totalInterest
                            )}
                          </span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mt-4">
                          <div className="text-sm text-gray-600 mb-1">
                            Total Cost
                          </div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(
                              results.lowInterestOption.totalPaid
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Including {formatCurrency(downPayment)} down payment
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Break-Even Analysis */}
                  {results.breakEvenMonths &&
                    results.breakEvenMonths <= loanTermMonths && (
                      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <ArrowRight className="w-5 h-5 mr-2 text-emerald-600" />
                          Break-Even Analysis
                        </h3>
                        <p className="text-gray-700">
                          The monthly savings from the lower interest rate will
                          equal the cash back amount after{' '}
                          <span className="font-bold text-emerald-600">
                            {results.breakEvenMonths} months
                          </span>
                          . Since your loan term is {loanTermMonths} months,
                          you&apos;ll have{' '}
                          <span className="font-bold">
                            {loanTermMonths - results.breakEvenMonths} months
                          </span>{' '}
                          of additional savings with the low interest option.
                        </p>
                      </div>
                    )}
                </>
              )}
            </motion.div>
          </div>

          {/* Educational Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 space-y-8"
          >
            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How This Calculator Works
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  This calculator helps you compare two common dealer incentives
                  when financing a vehicle purchase:
                </p>
                <ul>
                  <li>
                    <strong>Cash Back Option:</strong> Receive an immediate
                    rebate that reduces the loan amount, but finance at a higher
                    interest rate
                  </li>
                  <li>
                    <strong>Low Interest Option:</strong> Finance the full
                    amount (minus down payment) at a promotional lower interest
                    rate without the cash rebate
                  </li>
                </ul>
                <p>
                  The calculator uses standard loan amortization formulas to
                  compute monthly payments, total interest paid, and overall
                  cost for each option, helping you identify which deal truly
                  saves you more money over the life of the loan.
                </p>
              </div>
            </div>

            {/* Formulas */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Calculation Formulas
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Monthly Payment Formula
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm">
                    <p className="mb-2">M = L[c(1 + c)^n] / [(1 + c)^n - 1]</p>
                    <p className="text-gray-600">
                      Where:
                      <br />
                      M = Monthly payment
                      <br />
                      L = Loan amount (purchase price - down payment - cash
                      back)
                      <br />
                      c = Monthly interest rate (annual rate / 12 / 100)
                      <br />n = Number of monthly payments
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Comparison Logic
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700">
                      <strong>Cash Back Option:</strong>
                      <br />
                      Loan Amount = Purchase Price - Down Payment - Cash Back
                      <br />
                      Monthly Payment calculated at standard interest rate
                      <br />
                      <br />
                      <strong>Low Interest Option:</strong>
                      <br />
                      Loan Amount = Purchase Price - Down Payment
                      <br />
                      Monthly Payment calculated at reduced interest rate
                      <br />
                      <br />
                      <strong>Winner:</strong> The option with the lower total
                      cost (total paid including down payment)
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Break-Even Point
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-700">
                      The break-even point is calculated by dividing the cash
                      back amount by the monthly payment difference:
                    </p>
                    <div className="font-mono text-sm mt-3 p-4 bg-white rounded-lg">
                      Break-Even Months = Cash Back / (Cash Back Monthly Payment
                      - Low Interest Monthly Payment)
                    </div>
                    <p className="text-gray-700 mt-3">
                      If the break-even point is less than your loan term, the
                      low interest option will eventually save you more money.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Decision-Making Tips
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-emerald-600">
                    When Cash Back May Be Better:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>
                        Large rebate amount relative to purchase price
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>Short loan term (under 36 months)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>
                        Small difference between standard and reduced rates
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>Planning to pay off the loan early</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-600 mr-2">•</span>
                      <span>Need lower monthly payments</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-600">
                    When Low Interest May Be Better:
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Very low promotional rate (0-2%)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Longer loan term (60+ months)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Large interest rate difference (4%+)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Planning to keep the loan for full term</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Can use cash back savings elsewhere</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Considerations */}
            <div className="bg-amber-50 rounded-2xl shadow-xl p-8 border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                Important Considerations
              </h2>
              <div className="space-y-4 text-amber-900">
                <p>
                  <strong>Tax Implications:</strong> Some states don&apos;t
                  charge sales tax on manufacturer rebates, which could provide
                  additional savings with the cash back option.
                </p>
                <p>
                  <strong>Loan Terms:</strong> Make sure both offers have the
                  same loan term, or adjust your comparison accordingly.
                </p>
                <p>
                  <strong>Dealer Add-Ons:</strong> Be cautious of dealers adding
                  fees or products that might offset your savings.
                </p>
                <p>
                  <strong>Credit Score:</strong> Promotional rates often require
                  excellent credit. Make sure you qualify for the advertised
                  rate.
                </p>
                <p>
                  <strong>Total Cost Focus:</strong> Don&apos;t just compare
                  monthly payments - focus on the total amount you&apos;ll pay
                  over the life of the loan.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
