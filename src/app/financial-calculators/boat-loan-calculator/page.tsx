'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  Anchor,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  Calculator,
  AlertCircle,
  Ship,
} from 'lucide-react';
import {
  calculateBoatLoan,
  validateInputs,
  formatCurrency,
  formatPercentage,
  type BoatLoanInputs,
  type BoatLoanResults,
} from './calculations';

export default function BoatLoanCalculator() {
  // Input states
  const [boatPrice, setBoatPrice] = useState<string>('50000');
  const [interestRate, setInterestRate] = useState<string>('7.5');
  const [loanTermYears, setLoanTermYears] = useState<string>('15');
  const [downPayment, setDownPayment] = useState<string>('10000');
  const [downPaymentType, setDownPaymentType] = useState<
    'percentage' | 'amount'
  >('amount');
  const [tradeInValue, setTradeInValue] = useState<string>('0');
  const [salesTax, setSalesTax] = useState<string>('7');
  const [salesTaxType, setSalesTaxType] = useState<'percentage' | 'amount'>(
    'percentage'
  );
  const [fees, setFees] = useState<string>('500');
  const [includeFeesInLoan, setIncludeFeesInLoan] = useState<boolean>(true);

  // Results and errors
  const [results, setResults] = useState<BoatLoanResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Automatic calculation on input change
  useEffect(() => {
    const inputs: BoatLoanInputs = {
      boatPrice: parseFloat(boatPrice) || 0,
      interestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseFloat(loanTermYears) || 0,
      downPayment: parseFloat(downPayment) || 0,
      downPaymentType,
      tradeInValue: parseFloat(tradeInValue) || 0,
      salesTax: parseFloat(salesTax) || 0,
      salesTaxType,
      fees: parseFloat(fees) || 0,
      includeFeesInLoan,
    };

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      try {
        const calculatedResults = calculateBoatLoan(inputs);
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
    boatPrice,
    interestRate,
    loanTermYears,
    downPayment,
    downPaymentType,
    tradeInValue,
    salesTax,
    salesTaxType,
    fees,
    includeFeesInLoan,
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <Anchor className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Boat Loan Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Calculate boat loan payments with down payment, trade-in, sales
                tax, and fees
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
              {/* Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Loan Details
                </h2>

                <div className="space-y-6">
                  {/* Boat Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Boat Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={boatPrice}
                        onChange={(e) => setBoatPrice(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
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
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="7.5"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Term (Years)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={loanTermYears}
                        onChange={(e) => setLoanTermYears(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="15"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Down Payment & Trade-In */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Down Payment & Trade-In
                </h2>

                <div className="space-y-6">
                  {/* Down Payment with Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Down Payment
                      </label>
                      <button
                        onClick={() =>
                          setDownPaymentType(
                            downPaymentType === 'percentage'
                              ? 'amount'
                              : 'percentage'
                          )
                        }
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100"
                      >
                        {downPaymentType === 'percentage' ? '% Mode' : '$ Mode'}
                      </button>
                    </div>
                    <div className="relative">
                      {downPaymentType === 'percentage' ? (
                        <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      ) : (
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder={
                          downPaymentType === 'percentage' ? '20' : '10000'
                        }
                        step={downPaymentType === 'percentage' ? '0.1' : '100'}
                      />
                    </div>
                  </div>

                  {/* Trade-in Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trade-in Value (Optional)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={tradeInValue}
                        onChange={(e) => setTradeInValue(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Tax & Fees */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Sales Tax & Fees
                </h2>

                <div className="space-y-6">
                  {/* Sales Tax with Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Sales Tax
                      </label>
                      <button
                        onClick={() =>
                          setSalesTaxType(
                            salesTaxType === 'percentage'
                              ? 'amount'
                              : 'percentage'
                          )
                        }
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100"
                      >
                        {salesTaxType === 'percentage' ? '% Mode' : '$ Mode'}
                      </button>
                    </div>
                    <div className="relative">
                      {salesTaxType === 'percentage' ? (
                        <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      ) : (
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type="number"
                        value={salesTax}
                        onChange={(e) => setSalesTax(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder={
                          salesTaxType === 'percentage' ? '7' : '3500'
                        }
                        step={salesTaxType === 'percentage' ? '0.1' : '100'}
                      />
                    </div>
                  </div>

                  {/* Fees */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fees (Registration, Documentation, etc.)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="500"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeFeesInLoan}
                          onChange={(e) =>
                            setIncludeFeesInLoan(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Include fees in loan amount
                        </span>
                      </label>
                    </div>
                  </div>
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-blue-600 to-cyan-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Ship className="w-4 h-4" />
                      Monthly Payment
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      For {loanTermYears} years at {interestRate}% APR
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Payment Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Upfront Payment</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.upfrontPayment)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Loan Amount</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.loanAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Interest</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.totalInterest)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 pt-4 border-t-2 border-gray-200">
                        <span className="text-gray-900 font-bold">
                          Total Cost
                        </span>
                        <span className="font-bold text-blue-600 text-xl">
                          {formatCurrency(results.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cost Details */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                      Loan Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boat Price:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(parseFloat(boatPrice) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Down Payment:</span>
                        <span className="font-semibold text-gray-900">
                          -{formatCurrency(results.downPaymentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trade-in Value:</span>
                        <span className="font-semibold text-gray-900">
                          -{formatCurrency(parseFloat(tradeInValue) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sales Tax:</span>
                        <span className="font-semibold text-gray-900">
                          +{formatCurrency(results.salesTaxAmount)}
                        </span>
                      </div>
                      {includeFeesInLoan && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fees:</span>
                          <span className="font-semibold text-gray-900">
                            +{formatCurrency(parseFloat(fees) || 0)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-blue-200 pt-3 flex justify-between">
                        <span className="text-gray-900 font-semibold">
                          Amount Financed:
                        </span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(results.loanAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Total Payments
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(results.totalPayments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          Effective Rate
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPercentage(results.effectiveInterestRate)}
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Understanding Boat Loans: A Complete Guide
              </h3>

              <div className="prose prose-blue max-w-none">
                <div className="grid md:grid-cols-2 gap-8 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What is a Boat Loan?
                    </h4>
                    <p className="text-sm mb-4">
                      A boat loan is a secured loan used to finance the purchase
                      of a recreational vessel, yacht, or other watercraft. Like
                      auto loans, boat loans use the vessel as collateral,
                      typically offering lower interest rates than unsecured
                      personal loans. Loan terms can range from 1-20 years
                      depending on the boat&apos;s value and age.
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Types of Boat Loans
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        <strong>Marine Financing:</strong> Specialized boat
                        loans from marine lenders or credit unions
                      </li>
                      <li>
                        <strong>Personal Loans:</strong> Unsecured loans for
                        smaller boats or older vessels
                      </li>
                      <li>
                        <strong>Home Equity Loans:</strong> Using home equity
                        for larger boat purchases
                      </li>
                      <li>
                        <strong>Dealer Financing:</strong> Loans arranged
                        directly through boat dealerships
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Understanding Your Costs
                    </h4>
                    <p className="text-sm mb-4">
                      <strong>Upfront Payment:</strong> This includes your down
                      payment and any fees not rolled into the loan. A larger
                      down payment reduces your loan amount and monthly
                      payments.
                      <br />
                      <br />
                      <strong>Loan Amount:</strong> The total amount you&apos;re
                      financing, calculated as: Boat Price - Down Payment -
                      Trade-in + Sales Tax + Fees (if included).
                      <br />
                      <br />
                      <strong>Monthly Payment:</strong> Your regular payment
                      amount calculated using the amortization formula, covering
                      both principal and interest.
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Common Boat Loan Fees
                    </h4>
                    <ul className="text-sm space-y-2">
                      <li>
                        <strong>Documentation Fee:</strong> Covers loan
                        processing and paperwork ($200-$500)
                      </li>
                      <li>
                        <strong>Registration Fees:</strong> State boat
                        registration and titling ($50-$300)
                      </li>
                      <li>
                        <strong>Survey Fee:</strong> Marine survey for larger
                        vessels ($300-$1,000)
                      </li>
                      <li>
                        <strong>Prepayment Penalty:</strong> Some loans charge
                        fees for early payoff
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Your Boat Loan Results Explained
                    </h4>
                    <div className="bg-white rounded-xl p-4 mb-4 text-sm border border-blue-100">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Monthly Payment:
                          </span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(results.monthlyPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Interest:</span>
                          <span className="font-semibold">
                            {formatCurrency(results.totalInterest)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="font-semibold">
                            {formatCurrency(results.totalCost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>Effective Interest Rate:</span>
                          <span>
                            {formatPercentage(results.effectiveInterestRate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Factors Affecting Your Rate
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        <strong>Credit Score:</strong> Higher scores get better
                        rates (typically 660+ for prime rates)
                      </li>
                      <li>
                        <strong>Boat Age & Value:</strong> Newer, more expensive
                        boats often qualify for lower rates
                      </li>
                      <li>
                        <strong>Down Payment:</strong> 10-20% down is standard;
                        more improves terms
                      </li>
                      <li>
                        <strong>Loan Term:</strong> Shorter terms have lower
                        rates but higher payments
                      </li>
                      <li>
                        <strong>Debt-to-Income:</strong> Lenders prefer DTI
                        below 40-45%
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Tips for Getting the Best Boat Loan
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        • Compare rates from multiple marine lenders and credit
                        unions
                      </li>
                      <li>
                        • Improve your credit score before applying (aim for
                        700+)
                      </li>
                      <li>
                        • Make a larger down payment to reduce your loan amount
                      </li>
                      <li>
                        • Consider shorter loan terms to save on total interest
                      </li>
                      <li>
                        • Get pre-approved to strengthen your negotiating
                        position
                      </li>
                      <li>
                        • Factor in insurance, docking, and maintenance costs
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Additional Boat Ownership Costs
                    </h4>
                    <p className="text-sm">
                      Beyond your loan payment, budget for:
                      <br />• <strong>Insurance:</strong> $300-$500/year for
                      typical boats
                      <br />• <strong>Docking/Storage:</strong>{' '}
                      $1,500-$5,000+/year
                      <br />• <strong>Maintenance:</strong> 10-15% of boat value
                      annually
                      <br />• <strong>Fuel:</strong> Varies by usage
                      <br />• <strong>Winterization:</strong> $300-$600/year in
                      colder climates
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
