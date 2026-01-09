'use client';

import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  calculateBondPrice,
  type BondInputs,
  type BondResults,
} from './__tests__/bondCalculations';

export default function BondCalculator() {
  // Input states
  const [faceValue, setFaceValue] = useState<number>(1000);
  const [couponRate, setCouponRate] = useState<number>(5);
  const [yearsToMaturity, setYearsToMaturity] = useState<number>(10);
  const [yieldToMaturity, setYieldToMaturity] = useState<number>(6);
  const [couponFrequency, setCouponFrequency] = useState<number>(2); // Semi-annual

  // Results
  const [results, setResults] = useState<BondResults | null>(null);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Calculate bond
  const calculate = useCallback(() => {
    const inputs: BondInputs = {
      faceValue,
      couponRate,
      yearsToMaturity,
      yieldToMaturity,
      couponFrequency,
    };

    const calculatedResults = calculateBondPrice(inputs);
    setResults(calculatedResults);
  }, [
    faceValue,
    couponRate,
    yearsToMaturity,
    yieldToMaturity,
    couponFrequency,
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

  const formatInputValue = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const getFrequencyLabel = (freq: number): string => {
    switch (freq) {
      case 1:
        return 'Annual';
      case 2:
        return 'Semi-Annual';
      case 4:
        return 'Quarterly';
      case 12:
        return 'Monthly';
      default:
        return 'Unknown';
    }
  };

  // Calculate if bond is at premium, discount, or par
  const bondStatus =
    results && Math.abs(results.price - faceValue) < 1
      ? 'par'
      : results && results.price > faceValue
        ? 'premium'
        : 'discount';

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
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Bond Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate bond prices, yields, and returns
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
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 self-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Bond Details
              </h2>

              <div className="space-y-6">
                {/* Face Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Face Value (Par Value)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(faceValue)}
                      onChange={(e) => {
                        setFaceValue(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    The bond&apos;s maturity value
                  </p>
                </div>

                {/* Coupon Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Coupon Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={couponRate || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setCouponRate(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Annual interest rate on face value
                  </p>
                </div>

                {/* Years to Maturity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years to Maturity
                  </label>
                  <input
                    type="number"
                    value={yearsToMaturity}
                    onChange={(e) =>
                      setYearsToMaturity(Number(e.target.value) || 0)
                    }
                    min="0.5"
                    step="0.5"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Time until bond matures
                  </p>
                </div>

                {/* Yield to Maturity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Yield to Maturity (YTM)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={yieldToMaturity || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setYieldToMaturity(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Required rate of return
                  </p>
                </div>

                {/* Coupon Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Coupon Payment Frequency
                  </label>
                  <select
                    value={couponFrequency}
                    onChange={(e) => setCouponFrequency(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value={1}>Annual (1x per year)</option>
                    <option value={2}>Semi-Annual (2x per year)</option>
                    <option value={4}>Quarterly (4x per year)</option>
                    <option value={12}>Monthly (12x per year)</option>
                  </select>
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
              {results && (
                <>
                  {/* Bond Price Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Bond Price
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.price)}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      {bondStatus === 'premium' && (
                        <div className="bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm font-medium">
                          Trading at Premium
                        </div>
                      )}
                      {bondStatus === 'discount' && (
                        <div className="bg-orange-500/20 text-orange-100 px-3 py-1 rounded-full text-sm font-medium">
                          Trading at Discount
                        </div>
                      )}
                      {bondStatus === 'par' && (
                        <div className="bg-blue-500/20 text-blue-100 px-3 py-1 rounded-full text-sm font-medium">
                          Trading at Par
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">Face Value</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(faceValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">
                          {bondStatus === 'premium' ? 'Premium' : 'Discount'}
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(Math.abs(results.price - faceValue))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yield Metrics */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Yield Metrics
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Current Yield
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {results.currentYield.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Annual coupon / Current price
                        </div>
                      </div>

                      <div className="bg-indigo-50 rounded-2xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Yield to Maturity
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {yieldToMaturity.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Total return if held to maturity
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Payment Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Payment Frequency</span>
                        <span className="font-semibold text-gray-900">
                          {getFrequencyLabel(couponFrequency)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">
                          Coupon per Payment
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.couponPayment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">
                          Annual Coupon Amount
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.annualCouponAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">
                          Number of Payments
                        </span>
                        <span className="font-semibold text-gray-900">
                          {results.numberOfPayments}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">
                          Total Coupon Payments
                        </span>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(results.totalCouponPayments)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Total Return at Maturity
                        </span>
                        <span className="font-bold text-lg text-gray-900">
                          {formatCurrency(results.totalReturn)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Investment Summary
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Initial Investment
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(results.price)}
                        </div>
                      </div>

                      <div className="text-3xl text-center text-gray-400 py-2">
                        +
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Coupon Income
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalCouponPayments)}
                        </div>
                      </div>

                      <div className="text-3xl text-center text-gray-400 py-2">
                        +
                      </div>

                      <div className="bg-white rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Face Value at Maturity
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(faceValue)}
                        </div>
                      </div>

                      <div className="text-3xl text-center text-gray-400 py-2">
                        =
                      </div>

                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
                        <div className="text-sm opacity-90 mb-1">
                          Total Gain/Loss
                        </div>
                        <div className="text-3xl font-bold">
                          {formatCurrency(results.totalReturn - results.price)}
                        </div>
                        <div className="text-sm opacity-75 mt-2">
                          {results.totalYield.toFixed(2)}% total return
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bond Information Accordion */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Understanding These Results
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
                          <h4 className="font-bold text-gray-900 mb-2">
                            Bond Price
                          </h4>
                          <p className="text-sm text-gray-600">
                            The current market value of the bond. When YTM is
                            higher than the coupon rate, the bond trades at a
                            discount. When YTM is lower, it trades at a premium.
                          </p>
                        </div>

                        <div className="bg-indigo-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2">
                            Current Yield
                          </h4>
                          <p className="text-sm text-gray-600">
                            The annual coupon payment divided by the current
                            bond price. This shows the income return only, not
                            including capital gains or losses.
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2">
                            Yield to Maturity
                          </h4>
                          <p className="text-sm text-gray-600">
                            The total return you&apos;ll receive if you hold the
                            bond until maturity, including both coupon payments
                            and any capital gain or loss.
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2">
                            Premium vs. Discount
                          </h4>
                          <p className="text-sm text-gray-600">
                            A bond trades at a premium when its price exceeds
                            face value (YTM &lt; coupon rate) or at a discount
                            when below face value (YTM &gt; coupon rate).
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
              Understanding Bond Calculations
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a Bond?
                </h3>
                <p className="mb-4">
                  A bond is a fixed-income investment where an investor loans
                  money to an entity (government or corporation) for a defined
                  period at a fixed interest rate. Bonds are used by companies,
                  municipalities, states, and governments to finance projects
                  and operations.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Face Value (Par Value):</strong> The amount the bond
                    will be worth at maturity and the reference amount used to
                    calculate interest payments
                  </li>
                  <li>
                    <strong>Coupon Rate:</strong> The annual interest rate paid
                    by the bond issuer on the bond&apos;s face value
                  </li>
                  <li>
                    <strong>Maturity Date:</strong> The date when the
                    bond&apos;s principal is repaid to investors
                  </li>
                  <li>
                    <strong>Yield to Maturity:</strong> The total return
                    anticipated if the bond is held until maturity
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Bond Pricing Formula
                </h3>
                <p className="mb-4">
                  Bond prices are calculated using present value formulas that
                  discount future cash flows:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  Price = Σ [C / (1 + r)^t] + [FV / (1 + r)^n]
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>C</strong> = Coupon payment per period
                  </li>
                  <li>
                    <strong>r</strong> = Yield per period (YTM / frequency)
                  </li>
                  <li>
                    <strong>t</strong> = Period number
                  </li>
                  <li>
                    <strong>FV</strong> = Face value
                  </li>
                  <li>
                    <strong>n</strong> = Total number of periods
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Premium vs. Discount Bonds
                </h3>
                <p className="mb-4">
                  The relationship between a bond&apos;s price, coupon rate, and
                  yield determines whether it trades at a premium or discount:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>Premium Bond:</strong> When YTM &lt; Coupon Rate,
                    the bond&apos;s price exceeds its face value. Investors pay
                    more because the bond offers higher interest than current
                    market rates.
                  </li>
                  <li>
                    <strong>Discount Bond:</strong> When YTM &gt; Coupon Rate,
                    the bond&apos;s price is below face value. The bond pays
                    less interest than current market rates.
                  </li>
                  <li>
                    <strong>Par Bond:</strong> When YTM = Coupon Rate, the bond
                    trades at exactly its face value.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Types of Bonds
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Government Bonds:</strong> Issued by national
                    governments, considered very safe (e.g., U.S. Treasury
                    bonds)
                  </li>
                  <li>
                    <strong>Corporate Bonds:</strong> Issued by companies,
                    typically offer higher yields but carry more risk
                  </li>
                  <li>
                    <strong>Municipal Bonds:</strong> Issued by states and
                    cities, often tax-exempt
                  </li>
                  <li>
                    <strong>Zero-Coupon Bonds:</strong> Pay no periodic interest
                    but are sold at deep discounts
                  </li>
                  <li>
                    <strong>Convertible Bonds:</strong> Can be converted into a
                    specified number of shares of common stock
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Bond Investment Strategies
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Buy and Hold:</strong> Purchase bonds and hold them
                    until maturity to receive predictable income and principal
                    return
                  </li>
                  <li>
                    <strong>Bond Laddering:</strong> Invest in bonds with
                    different maturity dates to manage interest rate risk and
                    maintain liquidity
                  </li>
                  <li>
                    <strong>Bond Swapping:</strong> Sell one bond and buy
                    another to take advantage of market conditions or tax
                    benefits
                  </li>
                  <li>
                    <strong>Duration Matching:</strong> Match the duration of
                    bond investments with the timing of future liabilities
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Risks to Consider
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Interest Rate Risk:</strong> Bond prices fall when
                    interest rates rise, and vice versa
                  </li>
                  <li>
                    <strong>Credit Risk:</strong> The risk that the issuer may
                    default on payments
                  </li>
                  <li>
                    <strong>Inflation Risk:</strong> Rising inflation can erode
                    the purchasing power of fixed coupon payments
                  </li>
                  <li>
                    <strong>Reinvestment Risk:</strong> The risk that coupon
                    payments must be reinvested at lower rates
                  </li>
                  <li>
                    <strong>Call Risk:</strong> The issuer may redeem callable
                    bonds before maturity when rates fall
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides theoretical values based on the
                    inputs provided
                  </li>
                  <li>
                    • Actual bond prices may differ due to market conditions,
                    liquidity, and other factors
                  </li>
                  <li>
                    • Bond calculations assume payments are made on schedule
                    without default
                  </li>
                  <li>
                    • Tax implications and transaction costs are not included in
                    these calculations
                  </li>
                  <li>
                    • Consult with a financial advisor for personalized
                    investment advice
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
