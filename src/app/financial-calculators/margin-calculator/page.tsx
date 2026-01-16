'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Percent,
  DollarSign,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateMargin,
  formatCurrency,
  formatPercentage,
} from './calculations';

export default function MarginCalculator() {
  const [cost, setCost] = useState(50);
  const [revenue, setRevenue] = useState(100);
  const [margin, setMargin] = useState(0);
  const [profit, setProfit] = useState(0);

  const results = useMemo(() => {
    try {
      return calculateMargin({
        cost: cost > 0 ? cost : undefined,
        revenue: revenue > 0 ? revenue : undefined,
        margin: margin > 0 ? margin : undefined,
        profit: profit > 0 ? profit : undefined,
      });
    } catch {
      return null;
    }
  }, [cost, revenue, margin, profit]);

  const clearAll = () => {
    setCost(0);
    setRevenue(0);
    setMargin(0);
    setProfit(0);
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center shadow-lg">
                <Percent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Margin Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate profit margin, markup, and profitability metrics
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
                      Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={cost || ''}
                        onChange={(e) =>
                          setCost(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Revenue (Sales)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={revenue || ''}
                        onChange={(e) =>
                          setRevenue(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Margin (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={margin || ''}
                        onChange={(e) =>
                          setMargin(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profit
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={profit || ''}
                        onChange={(e) =>
                          setProfit(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors font-medium"
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-emerald-600 to-green-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Percent className="w-4 h-4" />
                      Profit Margin
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatPercentage(results.margin)}
                    </div>
                    <div className="text-sm opacity-75">
                      Profit: {formatCurrency(results.profit)}
                    </div>
                  </div>

                  {/* Results Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Calculation Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Cost</div>
                            <div className="text-xs text-gray-500">
                              Production/Purchase
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(results.cost)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Revenue</div>
                            <div className="text-xs text-gray-500">
                              Sales income
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.revenue)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Profit</div>
                            <div className="text-xs text-gray-500">
                              Revenue - Cost
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(results.profit)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Margin vs Markup */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <PieChart className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Margin vs Markup
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">
                            Profit Margin
                          </div>
                          <div className="text-3xl font-bold text-emerald-600">
                            {formatPercentage(results.margin)}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Profit / Revenue
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">
                            Markup
                          </div>
                          <div className="text-3xl font-bold text-purple-600">
                            {formatPercentage(results.markup)}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Profit / Cost
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Revenue</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>- Cost</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(results.cost)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="font-semibold">= Profit</span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(results.profit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Understanding Margin & Markup
                    </h3>

                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Profit Margin:</span>{' '}
                        The percentage of revenue that becomes profit. Shows how
                        much profit you make from each dollar of sales.
                      </p>
                      <p>
                        <span className="font-semibold">Markup:</span> The
                        percentage added to cost to determine selling price.
                        Shows how much you&apos;re marking up your costs.
                      </p>
                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-xs text-gray-600 font-mono">
                          Margin = (Profit / Revenue) × 100%
                        </p>
                        <p className="text-xs text-gray-600 font-mono mt-1">
                          Markup = (Profit / Cost) × 100%
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
