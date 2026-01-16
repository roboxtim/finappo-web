'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  Percent,
  Calculator,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { calculateVAT, formatCurrency, formatPercentage } from './calculations';

export default function VATCalculator() {
  const [vatRate, setVatRate] = useState(20);
  const [netPrice, setNetPrice] = useState(100);
  const [grossPrice, setGrossPrice] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const results = useMemo(() => {
    try {
      return calculateVAT({
        vatRate: vatRate > 0 ? vatRate : undefined,
        netPrice: netPrice > 0 ? netPrice : undefined,
        grossPrice: grossPrice > 0 ? grossPrice : undefined,
        taxAmount: taxAmount > 0 ? taxAmount : undefined,
      });
    } catch {
      return null;
    }
  }, [vatRate, netPrice, grossPrice, taxAmount]);

  const clearAll = () => {
    setVatRate(0);
    setNetPrice(0);
    setGrossPrice(0);
    setTaxAmount(0);
  };

  const setPresetVATRate = (rate: number) => {
    setVatRate(rate);
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  VAT Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate Value Added Tax from any two known values
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
              {/* VAT Rate Presets */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Common VAT Rates
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { country: 'UK', rate: 20 },
                    { country: 'EU Standard', rate: 20 },
                    { country: 'Germany', rate: 19 },
                    { country: 'France', rate: 20 },
                    { country: 'Spain', rate: 21 },
                    { country: 'Italy', rate: 22 },
                  ].map((preset) => (
                    <button
                      key={preset.country}
                      onClick={() => setPresetVATRate(preset.rate)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        vatRate === preset.rate
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xs opacity-75">{preset.country}</div>
                      <div className="text-lg">{preset.rate}%</div>
                    </button>
                  ))}
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
                      VAT Rate
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vatRate || ''}
                        onChange={(e) =>
                          setVatRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
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
                      Net Price (Before VAT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={netPrice || ''}
                        onChange={(e) =>
                          setNetPrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gross Price (Including VAT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={grossPrice || ''}
                        onChange={(e) =>
                          setGrossPrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      VAT Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={taxAmount || ''}
                        onChange={(e) =>
                          setTaxAmount(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-orange-600 to-red-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Gross Price (Total)
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.grossPrice)}
                    </div>
                    <div className="text-sm opacity-75">
                      Including {formatPercentage(results.vatRate)} VAT
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
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Net Price
                            </div>
                            <div className="text-xs text-gray-500">
                              Before VAT
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(results.netPrice)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              VAT Amount
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPercentage(results.vatRate)} of net price
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(results.taxAmount)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Gross Price
                            </div>
                            <div className="text-xs text-gray-500">
                              Including VAT
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.grossPrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VAT Rate Info */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      VAT Rate Details
                    </h3>

                    <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">
                          Applied VAT Rate
                        </div>
                        <div className="text-4xl font-bold text-orange-600">
                          {formatPercentage(results.vatRate)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Net Price</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.netPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>+ VAT ({formatPercentage(results.vatRate)})</span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(results.taxAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="font-semibold">= Gross Price</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(results.grossPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Information Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Understanding VAT
                    </h3>

                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Net Price:</span> The
                        base price before VAT is added
                      </p>
                      <p>
                        <span className="font-semibold">VAT Amount:</span> The
                        tax calculated as a percentage of the net price
                      </p>
                      <p>
                        <span className="font-semibold">Gross Price:</span> The
                        final price including VAT (what customers pay)
                      </p>
                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Formula:</span> Gross
                          Price = Net Price × (1 + VAT Rate ÷ 100)
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
