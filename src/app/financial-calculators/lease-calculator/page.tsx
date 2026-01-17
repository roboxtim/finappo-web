'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  FileText,
  DollarSign,
  Percent,
  Calendar,
  Calculator,
  AlertCircle,
  PieChart,
} from 'lucide-react';
import {
  calculateLease,
  validateInputs,
  formatCurrency,
  formatPercentage,
  type LeaseInputs,
  type LeaseResults,
} from './calculations';

type CalculationMode = 'fixedRate' | 'fixedPayment';

export default function LeaseCalculator() {
  // Mode selection
  const [mode, setMode] = useState<CalculationMode>('fixedRate');

  // Input states
  const [assetValue, setAssetValue] = useState<string>('30000');
  const [residualValue, setResidualValue] = useState<string>('15000');
  const [leaseTermYears, setLeaseTermYears] = useState<string>('3');
  const [interestRate, setInterestRate] = useState<string>('5');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('500');

  // Results and errors
  const [results, setResults] = useState<LeaseResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Automatic calculation on input change
  useEffect(() => {
    const leaseTermMonths = (parseFloat(leaseTermYears) || 0) * 12;

    const inputs: LeaseInputs = {
      assetValue: parseFloat(assetValue) || 0,
      residualValue: parseFloat(residualValue) || 0,
      leaseTerm: leaseTermMonths,
      ...(mode === 'fixedRate'
        ? { interestRate: parseFloat(interestRate) || 0 }
        : { monthlyPayment: parseFloat(monthlyPayment) || 0 }),
    };

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      try {
        const calculatedResults = calculateLease(inputs);
        setResults(calculatedResults);
      } catch (error) {
        setErrors([
          error instanceof Error ? error.message : 'Calculation error',
        ]);
        setResults(null);
      }
    } else {
      setResults(null);
    }
  }, [
    assetValue,
    residualValue,
    leaseTermYears,
    interestRate,
    monthlyPayment,
    mode,
  ]);

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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Lease Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate lease payments and effective interest rates for any
                asset
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
              {/* Calculation Mode Selection */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Calculation Mode
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      checked={mode === 'fixedRate'}
                      onChange={() => setMode('fixedRate')}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Fixed Rate
                      </div>
                      <div className="text-xs text-gray-600">
                        Calculate monthly payment from interest rate
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      checked={mode === 'fixedPayment'}
                      onChange={() => setMode('fixedPayment')}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-900">
                        Fixed Payment
                      </div>
                      <div className="text-xs text-gray-600">
                        Calculate effective rate from monthly payment
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Lease Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Lease Details
                </h2>

                <div className="space-y-6">
                  {/* Asset Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Asset Value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={assetValue}
                        onChange={(e) => setAssetValue(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="30000"
                      />
                    </div>
                  </div>

                  {/* Residual Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Residual Value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={residualValue}
                        onChange={(e) => setResidualValue(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="15000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Estimated value at end of lease
                    </p>
                  </div>

                  {/* Lease Term */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lease Term (Years)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={leaseTermYears}
                        onChange={(e) => setLeaseTermYears(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                        placeholder="3"
                        step="0.5"
                      />
                    </div>
                  </div>

                  {/* Interest Rate or Monthly Payment */}
                  {mode === 'fixedRate' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Interest Rate (Annual)
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                          placeholder="5"
                          step="0.1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Monthly Payment
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={monthlyPayment}
                          onChange={(e) => setMonthlyPayment(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors font-medium"
                          placeholder="500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-900 mb-2">
                        Please fix the following errors:
                      </h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {results && (
                <>
                  {/* Monthly Payment - Hero Card */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <FileText className="w-4 h-4" />
                      {mode === 'fixedRate'
                        ? 'Monthly Payment'
                        : 'Effective Interest Rate'}
                    </div>
                    {mode === 'fixedRate' ? (
                      <>
                        <div className="text-5xl font-bold mb-2">
                          {formatCurrency(results.monthlyPayment)}
                        </div>
                        <div className="text-sm opacity-75 mb-6">
                          For {leaseTermYears} years at {interestRate}% annual
                          rate
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-5xl font-bold mb-2">
                          {formatPercentage(results.effectiveRate || 0)}
                        </div>
                        <div className="text-sm opacity-75 mb-6">
                          Annual rate for ${monthlyPayment}/month payment
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Lease Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Monthly Payment</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.monthlyPayment)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Depreciation Fee</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.depreciationFee)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Finance Fee</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.financeFee)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Payments</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.totalPayments)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 pt-4 border-t-2 border-gray-200">
                        <span className="text-gray-900 font-bold">
                          Total Interest
                        </span>
                        <span className="font-bold text-purple-600 text-xl">
                          {formatCurrency(results.totalInterest)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Distribution */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                      Cost Distribution
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Depreciation</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.totalDepreciation)} (
                            {(
                              (results.totalDepreciation /
                                results.totalPayments) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full"
                            style={{
                              width: `${(results.totalDepreciation / results.totalPayments) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Interest</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.totalInterest)} (
                            {(
                              (results.totalInterest / results.totalPayments) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-indigo-400 to-purple-400 h-3 rounded-full"
                            style={{
                              width: `${(results.totalInterest / results.totalPayments) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-gray-600" />
                      Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Asset Value
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(parseFloat(assetValue) || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Residual Value
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(parseFloat(residualValue) || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Lease Term
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {leaseTermYears} years
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          {mode === 'fixedRate'
                            ? 'Interest Rate'
                            : 'Effective Rate'}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {mode === 'fixedRate'
                            ? formatPercentage(parseFloat(interestRate) || 0)
                            : formatPercentage(results.effectiveRate || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding Section - SEPARATE SECTION AT BOTTOM */}
      {results && (
        <section className="pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Understanding Leases: A Complete Guide
              </h3>

              <div className="prose prose-purple max-w-none">
                <div className="grid md:grid-cols-2 gap-8 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What is a Lease?
                    </h4>
                    <p className="text-sm mb-4">
                      A lease is a contractual agreement where one party
                      (lessee) pays to use an asset owned by another party
                      (lessor) for a specified period. Unlike a loan, you
                      don&apos;t own the asset at the end - you&apos;re
                      essentially renting it. Leases are common for vehicles,
                      equipment, real estate, and other high-value assets.
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Types of Leases
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        <strong>Operating Lease:</strong> Short-term lease where
                        you return the asset; common for vehicles and equipment
                      </li>
                      <li>
                        <strong>Capital/Finance Lease:</strong> Long-term lease
                        that transfers ownership benefits; treated like a
                        purchase
                      </li>
                      <li>
                        <strong>Closed-End Lease:</strong> Walk away at lease
                        end with no obligation to buy
                      </li>
                      <li>
                        <strong>Open-End Lease:</strong> Responsible for
                        difference if asset worth less than residual value
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      How Lease Payments Are Calculated
                    </h4>
                    <p className="text-sm mb-2">
                      Lease payments consist of two main components:
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <p className="font-mono text-xs mb-2">
                        <strong>Depreciation Fee</strong> = (Asset Value -
                        Residual Value) / Number of Months
                      </p>
                      <p className="font-mono text-xs mb-2">
                        <strong>Finance Fee</strong> = (Asset Value + Residual
                        Value) × Money Factor
                      </p>
                      <p className="font-mono text-xs">
                        <strong>Money Factor</strong> = Annual Interest Rate /
                        2400
                      </p>
                    </div>
                    <p className="text-sm mb-4">
                      The <strong>depreciation fee</strong> covers the
                      asset&apos;s decline in value during the lease. The{' '}
                      <strong>finance fee</strong> is the interest charged on
                      the average value of the asset over the lease term.
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Understanding Your Results
                    </h4>
                    <div className="bg-white rounded-xl p-4 mb-4 text-sm border border-purple-100">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Monthly Payment:
                          </span>
                          <span className="font-semibold text-purple-600">
                            {formatCurrency(results.monthlyPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Depreciation Fee:
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(results.depreciationFee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Finance Fee:</span>
                          <span className="font-semibold">
                            {formatCurrency(results.financeFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>Total Interest:</span>
                          <span>{formatCurrency(results.totalInterest)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Key Lease Terms Explained
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        <strong>Asset Value (Capitalized Cost):</strong> The
                        initial price of the leased item, often negotiable
                      </li>
                      <li>
                        <strong>Residual Value:</strong> Estimated worth at
                        lease end; higher residual = lower payments
                      </li>
                      <li>
                        <strong>Money Factor:</strong> Lease&apos;s interest
                        rate equivalent; multiply by 2400 to get APR
                      </li>
                      <li>
                        <strong>Depreciation:</strong> The amount the asset
                        loses in value over the lease term
                      </li>
                      <li>
                        <strong>Lease Term:</strong> Duration of the lease,
                        typically 24-60 months for vehicles
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Advantages of Leasing
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        • Lower monthly payments compared to loan payments
                      </li>
                      <li>• Drive/use newer assets more frequently</li>
                      <li>
                        • Maintenance often covered under warranty during lease
                        term
                      </li>
                      <li>• Potential tax benefits for business use</li>
                      <li>• No resale hassle at the end of the term</li>
                      <li>• Preserve capital for other investments</li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Disadvantages of Leasing
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>• You don&apos;t build equity or own the asset</li>
                      <li>• Mileage limits and usage restrictions may apply</li>
                      <li>• Early termination penalties can be expensive</li>
                      <li>• Wear-and-tear charges at lease end</li>
                      <li>
                        • Higher total cost over time vs. buying and keeping
                      </li>
                      <li>
                        • Required to maintain insurance throughout lease term
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Tips for Getting the Best Lease
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>• Negotiate the asset price (capitalized cost)</li>
                      <li>
                        • Shop around for the best money factor (interest rate)
                      </li>
                      <li>
                        • Consider higher residual values for lower payments
                      </li>
                      <li>
                        • Understand all fees: acquisition, disposition, etc.
                      </li>
                      <li>
                        • Know your expected usage to avoid overage charges
                      </li>
                      <li>
                        • Read the fine print on early termination and excess
                        wear
                      </li>
                      <li>
                        • Compare total lease cost vs. buying with financing
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      When to Choose Leasing vs. Buying
                    </h4>
                    <p className="text-sm">
                      <strong>Choose Leasing if:</strong> You want lower monthly
                      payments, like upgrading frequently, use the asset for
                      business (tax benefits), or don&apos;t want ownership
                      responsibilities.
                      <br />
                      <br />
                      <strong>Choose Buying if:</strong> You want to build
                      equity, plan to keep the asset long-term, have high usage
                      needs exceeding lease limits, or want full ownership
                      flexibility without restrictions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
