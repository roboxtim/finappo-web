'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Percent,
  DollarSign,
  Tag,
  TrendingDown,
  ShoppingCart,
  Info,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateDiscount,
  formatCurrency,
  formatPercentage,
  DiscountMode,
} from './calculations';

export default function DiscountCalculator() {
  const [mode, setMode] = useState<DiscountMode>('percent');
  const [originalPrice, setOriginalPrice] = useState(100);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const results = useMemo(() => {
    try {
      return calculateDiscount({
        originalPrice: originalPrice > 0 ? originalPrice : undefined,
        discountPercent:
          mode === 'percent' && discountPercent > 0
            ? discountPercent
            : undefined,
        discountAmount:
          mode === 'fixed' && discountAmount > 0 ? discountAmount : undefined,
        finalPrice: finalPrice > 0 ? finalPrice : undefined,
        mode,
      });
    } catch {
      return null;
    }
  }, [originalPrice, discountPercent, discountAmount, finalPrice, mode]);

  const clearAll = () => {
    setOriginalPrice(0);
    setDiscountPercent(0);
    setDiscountAmount(0);
    setFinalPrice(0);
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Discount Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate sale prices, discounts, and savings instantly
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
              {/* Discount Mode Toggle */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Discount Type
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('percent')}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      mode === 'percent'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Percent className="w-4 h-4" />
                      Percent Off
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('fixed')}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      mode === 'fixed'
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Fixed Amount
                    </div>
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Enter Values
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Provide any 2 values to calculate the rest
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Original Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={originalPrice || ''}
                        onChange={(e) =>
                          setOriginalPrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {mode === 'percent' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount Percent
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={discountPercent || ''}
                          onChange={(e) =>
                            setDiscountPercent(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                          step="0.01"
                          max="100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={discountAmount || ''}
                          onChange={(e) =>
                            setDiscountAmount(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Final Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={finalPrice || ''}
                        onChange={(e) =>
                          setFinalPrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearAll}
                  className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-rose-600 to-pink-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Tag className="w-4 h-4" />
                      Final Sale Price
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.finalPrice)}
                    </div>
                    <div className="text-sm opacity-75">
                      You save: {formatCurrency(results.savings)} (
                      {formatPercentage(results.discountPercent)})
                    </div>
                  </div>

                  {/* Results Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Discount Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Original Price
                            </div>
                            <div className="text-xs text-gray-500">
                              Before discount
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(results.originalPrice)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Discount
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPercentage(results.discountPercent)} off
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          -{formatCurrency(results.discountAmount)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border-2 border-rose-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            <Tag className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Final Price
                            </div>
                            <div className="text-xs text-gray-500">
                              After discount
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-rose-600">
                          {formatCurrency(results.finalPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          Total Savings
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.savings)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Formula */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Info className="w-6 h-6 text-rose-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Calculation
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="p-4 bg-gray-50 rounded-lg font-mono text-xs">
                        <div className="text-gray-900 font-semibold mb-2">
                          Original Price
                        </div>
                        <div>{formatCurrency(results.originalPrice)}</div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg font-mono text-xs">
                        <div className="text-gray-900 font-semibold mb-2">
                          Discount ({formatPercentage(results.discountPercent)})
                        </div>
                        <div>
                          {formatCurrency(results.originalPrice)} ×{' '}
                          {(results.discountPercent / 100).toFixed(2)} ={' '}
                          {formatCurrency(results.discountAmount)}
                        </div>
                      </div>

                      <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 font-mono text-xs">
                        <div className="text-gray-900 font-semibold mb-2">
                          Final Price
                        </div>
                        <div>
                          {formatCurrency(results.originalPrice)} -{' '}
                          {formatCurrency(results.discountAmount)} ={' '}
                          <span className="text-rose-600 font-bold">
                            {formatCurrency(results.finalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Information Card - Enhanced for SEO */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Understanding Discounts: A Complete Guide
                    </h3>

                    <div className="space-y-4 text-sm text-gray-700">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          What is a Discount?
                        </h4>
                        <p>
                          A discount is a reduction in the original price of a
                          product or service. Discounts are commonly offered by
                          retailers during sales events, promotions, or to
                          incentivize purchases. Understanding how discounts
                          work helps you calculate the true value of sales and
                          make informed purchasing decisions.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Types of Discounts
                        </h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>
                            <span className="font-semibold">
                              Percentage Discount:
                            </span>{' '}
                            A discount expressed as a percentage of the original
                            price (e.g., 20% off, 50% off). This is the most
                            common type of discount in retail.
                          </li>
                          <li>
                            <span className="font-semibold">
                              Fixed Amount Discount:
                            </span>{' '}
                            A specific dollar amount deducted from the original
                            price (e.g., $10 off, $25 off). Often used in
                            promotions and coupons.
                          </li>
                          <li>
                            <span className="font-semibold">
                              Buy One Get One (BOGO):
                            </span>{' '}
                            A promotional offer where purchasing one item
                            results in a second item at a reduced price or free.
                          </li>
                          <li>
                            <span className="font-semibold">
                              Volume Discounts:
                            </span>{' '}
                            Reduced prices when buying larger quantities, common
                            in wholesale and bulk purchases.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          How to Calculate Discounts
                        </h4>
                        <p className="mb-2">
                          The basic discount formula depends on the type of
                          discount being applied:
                        </p>
                        <div className="bg-white rounded-lg p-4 space-y-2">
                          <p className="font-mono text-xs">
                            <span className="font-semibold">
                              Percentage Discount:
                            </span>
                            <br />
                            Discount Amount = Original Price × (Discount % ÷
                            100)
                            <br />
                            Final Price = Original Price - Discount Amount
                          </p>
                          <p className="font-mono text-xs">
                            <span className="font-semibold">
                              Fixed Discount:
                            </span>
                            <br />
                            Final Price = Original Price - Discount Amount
                            <br />
                            Discount % = (Discount Amount ÷ Original Price) ×
                            100
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Real-World Examples
                        </h4>
                        <div className="space-y-2">
                          <div className="bg-white rounded-lg p-3">
                            <p className="font-semibold text-xs mb-1">
                              Example 1: Black Friday Sale
                            </p>
                            <p className="text-xs">
                              A $200 jacket is on sale for 30% off. The discount
                              amount is $200 × 0.30 = $60. Your final price is
                              $200 - $60 = $140. You save $60.
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="font-semibold text-xs mb-1">
                              Example 2: Coupon Code
                            </p>
                            <p className="text-xs">
                              You have a $25 off coupon for a $150 purchase. The
                              discount percentage is ($25 ÷ $150) × 100 =
                              16.67%. Your final price is $150 - $25 = $125.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Stacking Discounts
                        </h4>
                        <p>
                          Some retailers allow multiple discounts to be applied
                          to a single purchase. When stacking discounts, they
                          are typically applied sequentially, not added
                          together. For example, a 20% discount followed by a
                          10% discount on a $100 item results in: $100 - $20 =
                          $80, then $80 - $8 = $72 (not $100 - $30 = $70).
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Tips for Smart Shopping
                        </h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>
                            Compare percentage discounts on different priced
                            items - a 50% discount on a $20 item saves less than
                            20% off a $100 item
                          </li>
                          <li>
                            Watch for &quot;original price&quot; inflation where
                            retailers artificially raise prices before applying
                            discounts
                          </li>
                          <li>
                            Calculate the actual price per unit when comparing
                            discounted bulk purchases
                          </li>
                          <li>
                            Consider if you actually need the item - even with a
                            great discount, unnecessary purchases waste money
                          </li>
                          <li>
                            Use cashback apps and credit card rewards in
                            addition to store discounts for maximum savings
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Business Perspective
                        </h4>
                        <p>
                          For businesses, discounts are a strategic tool to
                          increase sales volume, clear inventory, attract new
                          customers, and compete in the market. The key is
                          finding the right discount level that drives sales
                          while maintaining profitability. A well-planned
                          discount strategy considers profit margins, customer
                          acquisition costs, and long-term customer value.
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
