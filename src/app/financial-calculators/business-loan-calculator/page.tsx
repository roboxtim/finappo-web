'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  TrendingUp,
  PieChart,
  Receipt,
  Percent,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateBusinessLoan,
  formatCurrency,
  formatPercentage,
} from './calculations';

export default function BusinessLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [loanTermYears, setLoanTermYears] = useState(5);
  const [originationFee, setOriginationFee] = useState(2);
  const [originationFeeType, setOriginationFeeType] = useState<
    'percentage' | 'amount'
  >('percentage');
  const [documentationFee, setDocumentationFee] = useState(500);
  const [otherFees, setOtherFees] = useState(0);

  const results = useMemo(() => {
    try {
      return calculateBusinessLoan({
        loanAmount,
        interestRate,
        loanTermYears,
        originationFee,
        originationFeeType,
        documentationFee,
        otherFees,
      });
    } catch {
      return null;
    }
  }, [
    loanAmount,
    interestRate,
    loanTermYears,
    originationFee,
    originationFeeType,
    documentationFee,
    otherFees,
  ]);

  const clearAll = () => {
    setLoanAmount(100000);
    setInterestRate(7.5);
    setLoanTermYears(5);
    setOriginationFee(2);
    setOriginationFeeType('percentage');
    setDocumentationFee(500);
    setOtherFees(0);
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Business Loan Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate monthly payments, APR, and total costs with fees
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
              {/* Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Loan Details
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Enter your business loan information
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={loanAmount || ''}
                        onChange={(e) =>
                          setLoanAmount(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate (Annual)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={interestRate || ''}
                        onChange={(e) =>
                          setInterestRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Term (Years)
                    </label>
                    <input
                      type="number"
                      value={loanTermYears || ''}
                      onChange={(e) =>
                        setLoanTermYears(parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                      placeholder="0"
                      step="1"
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Loan Fees
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Origination Fee
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setOriginationFeeType('percentage')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          originationFeeType === 'percentage'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Percentage
                      </button>
                      <button
                        onClick={() => setOriginationFeeType('amount')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          originationFeeType === 'amount'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Dollar Amount
                      </button>
                    </div>
                    <div className="relative">
                      {originationFeeType === 'amount' && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                      )}
                      <input
                        type="number"
                        value={originationFee || ''}
                        onChange={(e) =>
                          setOriginationFee(parseFloat(e.target.value) || 0)
                        }
                        className={`w-full ${originationFeeType === 'amount' ? 'pl-8' : 'pl-4'} pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium`}
                        placeholder="0"
                        step={
                          originationFeeType === 'percentage' ? '0.1' : '100'
                        }
                      />
                      {originationFeeType === 'percentage' && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Documentation Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={documentationFee || ''}
                        onChange={(e) =>
                          setDocumentationFee(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Other Fees
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={otherFees || ''}
                        onChange={(e) =>
                          setOtherFees(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="100"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearAll}
                  className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Reset to Defaults
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
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-indigo-600 to-blue-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Payment
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                    <div className="text-sm opacity-75">
                      Total payments: {formatCurrency(results.totalPayments)}
                    </div>
                  </div>

                  {/* APR Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Percent className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        True APR (with fees)
                      </h3>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                      <div className="text-4xl font-bold text-indigo-600 mb-2">
                        {formatPercentage(results.apr)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Effective annual rate including all fees
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <PieChart className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Cost Breakdown
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Principal
                            </div>
                            <div className="text-xs text-gray-500">
                              Original loan amount
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.loanAmount)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Total Interest
                            </div>
                            <div className="text-xs text-gray-500">
                              Interest over loan term
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(results.totalInterest)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">
                              Total Fees
                            </div>
                            <div className="text-xs text-gray-500">
                              All upfront fees
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(results.totalFees)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Total Cost
                            </div>
                            <div className="text-xs text-gray-500">
                              Principal + Interest + Fees
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(results.totalCost)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Loan Summary
                    </h3>

                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Loan Term</span>
                        <span className="font-semibold text-gray-900">
                          {loanTermYears} years ({loanTermYears * 12} months)
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Interest Rate</span>
                        <span className="font-semibold text-gray-900">
                          {formatPercentage(interestRate)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span>True APR</span>
                        <span className="font-semibold text-indigo-600">
                          {formatPercentage(results.apr)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <span className="font-semibold">Monthly Payment</span>
                        <span className="font-bold text-indigo-600">
                          {formatCurrency(results.monthlyPayment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding Section */}
      {results && (
        <section className="pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Understanding Business Loans: A Complete Guide
              </h3>

              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    What is a Business Loan?
                  </h4>
                  <p>
                    A business loan is financing provided to a company for
                    various business purposes such as starting a new venture,
                    expanding operations, purchasing equipment, managing cash
                    flow, or covering operational expenses. Unlike personal
                    loans, business loans are designed specifically for
                    commercial use and often come with different terms, rates,
                    and requirements based on the business&apos;s
                    creditworthiness, revenue, and industry.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Types of Business Loans
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <span className="font-semibold">Term Loans:</span>{' '}
                      Traditional loans with fixed repayment schedules,
                      typically used for major purchases or expansion. Available
                      in short-term (less than 2 years) and long-term (up to 25
                      years) options.
                    </li>
                    <li>
                      <span className="font-semibold">SBA Loans:</span> Loans
                      backed by the Small Business Administration offering
                      favorable terms and lower down payments. Popular programs
                      include 7(a), 504, and microloans.
                    </li>
                    <li>
                      <span className="font-semibold">Lines of Credit:</span>{' '}
                      Revolving credit that businesses can draw from as needed,
                      paying interest only on the amount used. Ideal for
                      managing cash flow fluctuations.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Equipment Financing:
                      </span>{' '}
                      Loans specifically for purchasing business equipment, with
                      the equipment serving as collateral.
                    </li>
                    <li>
                      <span className="font-semibold">Invoice Financing:</span>{' '}
                      Short-term loans based on outstanding invoices, providing
                      immediate cash flow while waiting for customer payments.
                    </li>
                    <li>
                      <span className="font-semibold">
                        Commercial Real Estate:
                      </span>{' '}
                      Loans for purchasing or refinancing business property,
                      typically with terms of 5-20 years.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Understanding APR and Loan Costs
                  </h4>
                  <p className="mb-2">
                    The Annual Percentage Rate (APR) is crucial for
                    understanding the true cost of a business loan. While the
                    interest rate shows the cost of borrowing the principal, APR
                    includes all fees and costs, providing a complete picture:
                  </p>
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <p className="font-mono text-xs">
                      <span className="font-semibold">Interest Rate:</span> Base
                      cost of borrowing (e.g., 7.5%)
                      <br />
                      <span className="font-semibold">APR:</span> Interest rate
                      + all fees annualized
                      <br />
                      <span className="font-semibold">
                        Monthly Payment Formula:
                      </span>
                      <br />
                      M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                      <br />
                      where P = principal, r = monthly rate, n = payments
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Common Business Loan Fees
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <span className="font-semibold">Origination Fee:</span>{' '}
                      Typically 1-6% of the loan amount, charged for processing
                      the loan. May be deducted from loan proceeds or added to
                      the balance.
                    </li>
                    <li>
                      <span className="font-semibold">Documentation Fee:</span>{' '}
                      Flat fee ($500-$2,000) for preparing and processing loan
                      documents and legal paperwork.
                    </li>
                    <li>
                      <span className="font-semibold">Underwriting Fee:</span>{' '}
                      Cost for evaluating the loan application and assessing
                      business creditworthiness.
                    </li>
                    <li>
                      <span className="font-semibold">Prepayment Penalty:</span>{' '}
                      Some lenders charge if you pay off the loan early,
                      compensating for lost interest income.
                    </li>
                    <li>
                      <span className="font-semibold">Late Payment Fee:</span>{' '}
                      Charges applied when payments are not made on time,
                      typically 3-5% of the payment amount.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Real-World Business Loan Examples
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-semibold text-xs mb-1">
                        Example 1: Restaurant Expansion
                      </p>
                      <p className="text-xs">
                        A restaurant secures a $100,000 term loan at 7.5% for 5
                        years with a 2% origination fee and $500 documentation
                        fee. Monthly payment is approximately $2,000, total
                        interest is $20,000, and total fees are $2,500. The true
                        APR is 8.1%, making the total cost $122,500.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-semibold text-xs mb-1">
                        Example 2: Equipment Purchase
                      </p>
                      <p className="text-xs">
                        A manufacturing company finances $250,000 in equipment
                        over 7 years at 6.5% with a 1.5% origination fee. The
                        monthly payment is about $3,750, with total interest of
                        $65,000 and fees of $3,750. This results in an APR of
                        7.0% and total cost of $318,750.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Qualifying for a Business Loan
                  </h4>
                  <p className="mb-2">
                    Lenders evaluate several factors when considering business
                    loan applications:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <span className="font-semibold">Credit Score:</span> Both
                      personal (usually 680+) and business credit scores are
                      reviewed. Higher scores qualify for better rates.
                    </li>
                    <li>
                      <span className="font-semibold">Time in Business:</span>{' '}
                      Most lenders require at least 2 years of operating
                      history, though some offer startup financing.
                    </li>
                    <li>
                      <span className="font-semibold">Revenue:</span> Annual
                      revenue requirements vary, but many lenders look for
                      $100,000+ in consistent revenue.
                    </li>
                    <li>
                      <span className="font-semibold">Cash Flow:</span> Adequate
                      cash flow to cover loan payments plus operating expenses,
                      often requiring a debt service coverage ratio of 1.25 or
                      higher.
                    </li>
                    <li>
                      <span className="font-semibold">Collateral:</span> Some
                      loans require business assets or personal guarantees to
                      secure the loan and reduce lender risk.
                    </li>
                    <li>
                      <span className="font-semibold">Business Plan:</span> A
                      detailed plan showing how the loan will be used and how
                      the business will generate returns to repay it.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Tips for Getting the Best Business Loan
                  </h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Shop around and compare offers from at least 3-5 lenders,
                      including traditional banks, credit unions, and online
                      lenders
                    </li>
                    <li>
                      Improve your credit score before applying - even a
                      20-point increase can significantly reduce your interest
                      rate
                    </li>
                    <li>
                      Prepare comprehensive documentation including financial
                      statements, tax returns, and business plans to expedite
                      approval
                    </li>
                    <li>
                      Consider the total cost (APR) rather than just the
                      interest rate when comparing loan offers
                    </li>
                    <li>
                      Negotiate fees - origination and documentation fees are
                      often negotiable, especially for strong applicants
                    </li>
                    <li>
                      Understand prepayment terms - some loans penalize early
                      repayment while others allow it without penalty
                    </li>
                    <li>
                      Calculate the debt service coverage ratio to ensure you
                      can comfortably afford payments: (Net Operating Income) /
                      (Debt Service)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Business Loan Alternatives
                  </h4>
                  <p className="mb-2">
                    Depending on your needs, consider these alternatives:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <span className="font-semibold">
                        Business Credit Cards:
                      </span>{' '}
                      For smaller, short-term expenses with rewards programs and
                      easier approval
                    </li>
                    <li>
                      <span className="font-semibold">Crowdfunding:</span> For
                      startups or unique products, raising capital from many
                      small investors
                    </li>
                    <li>
                      <span className="font-semibold">Angel Investors/VC:</span>{' '}
                      For high-growth startups willing to exchange equity for
                      capital
                    </li>
                    <li>
                      <span className="font-semibold">Personal Savings:</span>{' '}
                      For complete control without debt, though it carries
                      personal financial risk
                    </li>
                    <li>
                      <span className="font-semibold">
                        Merchant Cash Advance:
                      </span>{' '}
                      Fast funding based on future credit card sales, though
                      often expensive
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
