'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingDown,
  DollarSign,
  Calendar,
  Calculator,
  BarChart3,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateDepreciation,
  formatCurrency,
  getMethodDisplayName,
  type DepreciationMethod,
} from './calculations';

export default function DepreciationCalculator() {
  const [assetCost, setAssetCost] = useState(50000);
  const [salvageValue, setSalvageValue] = useState(5000);
  const [usefulLife, setUsefulLife] = useState(5);
  const [method, setMethod] = useState<DepreciationMethod>('straight-line');

  const results = useMemo(() => {
    try {
      return calculateDepreciation({
        assetCost,
        salvageValue,
        usefulLife,
        method,
      });
    } catch {
      return null;
    }
  }, [assetCost, salvageValue, usefulLife, method]);

  const methods: { value: DepreciationMethod; label: string }[] = [
    { value: 'straight-line', label: 'Straight-Line' },
    { value: 'declining-balance', label: 'Declining Balance' },
    {
      value: 'double-declining-balance',
      label: 'Double Declining Balance',
    },
    { value: 'sum-of-years-digits', label: "Sum of Years' Digits" },
  ];

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Depreciation Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate asset depreciation with multiple methods
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
              {/* Depreciation Method Selection */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Depreciation Method
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {methods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(m.value)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all text-left ${
                        method === m.value
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Asset Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter the asset details
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Asset Cost (Purchase Price)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={assetCost || ''}
                        onChange={(e) =>
                          setAssetCost(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="50000"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salvage Value (Residual Value)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={salvageValue || ''}
                        onChange={(e) =>
                          setSalvageValue(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="5000"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Useful Life (Years)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={usefulLife || ''}
                        onChange={(e) =>
                          setUsefulLife(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-colors font-medium"
                        placeholder="5"
                        min="1"
                        step="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        years
                      </span>
                    </div>
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-amber-600 to-orange-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <TrendingDown className="w-4 h-4" />
                      Total Depreciation
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.totalDepreciation)}
                    </div>
                    <div className="text-sm opacity-75">
                      Using {getMethodDisplayName(results.method)} method
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Depreciation Summary
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Asset Cost
                            </div>
                            <div className="text-xs text-gray-500">
                              Original purchase price
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(results.assetCost)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Salvage Value
                            </div>
                            <div className="text-xs text-gray-500">
                              Residual value at end
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.salvageValue)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Depreciable Base
                            </div>
                            <div className="text-xs text-gray-500">
                              Cost - Salvage Value
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.depreciableBase)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Useful Life
                            </div>
                            <div className="text-xs text-gray-500">
                              Depreciation period
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {results.usefulLife} years
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Depreciation Schedule */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart3 className="w-6 h-6 text-amber-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Year-by-Year Schedule
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Year
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                              Annual Depreciation
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                              Accumulated
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                              Book Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.schedule.map((row, idx) => (
                            <tr
                              key={row.year}
                              className={`border-b border-gray-100 ${
                                idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                              }`}
                            >
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                {row.year}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-amber-600 font-medium">
                                {formatCurrency(row.annualDepreciation)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-gray-700">
                                {formatCurrency(row.accumulatedDepreciation)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-gray-900 font-semibold">
                                {formatCurrency(row.bookValue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      About Depreciation Methods
                    </h3>

                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Straight-Line:</span>{' '}
                        Distributes cost evenly over the asset&apos;s useful
                        life. Simple and commonly used.
                      </p>
                      <p>
                        <span className="font-semibold">
                          Declining Balance:
                        </span>{' '}
                        Applies depreciation rate to the remaining book value
                        each year. Higher depreciation in early years.
                      </p>
                      <p>
                        <span className="font-semibold">Double Declining:</span>{' '}
                        Accelerated method using double the straight-line rate.
                        Maximizes early year deductions.
                      </p>
                      <p>
                        <span className="font-semibold">
                          Sum of Years&apos; Digits:
                        </span>{' '}
                        Accelerated method using a fraction based on remaining
                        years. Balances early depreciation.
                      </p>
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
