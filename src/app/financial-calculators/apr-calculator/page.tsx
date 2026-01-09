'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Percent, ChevronDown, TrendingUp, DollarSign } from 'lucide-react';
import {
  calculateAPR,
  calculateAmortizationSchedule,
  type LoanInputs,
  type APRResults,
  type AmortizationRow,
} from './__tests__/aprCalculations';

export default function APRCalculator() {
  // Input states
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [loanTermYears, setLoanTermYears] = useState<number>(3);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(0);
  const [loanedFees, setLoanedFees] = useState<number>(500);
  const [upfrontFees, setUpfrontFees] = useState<number>(0);

  // Calculated results
  const [results, setResults] = useState<APRResults | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationRow[]
  >([]);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  const calculateResults = useCallback(() => {
    const totalMonths = loanTermYears * 12 + loanTermMonths;

    if (totalMonths === 0 || loanAmount === 0) {
      setResults(null);
      setAmortizationSchedule([]);
      return;
    }

    const inputs: LoanInputs = {
      loanAmount,
      interestRate,
      loanTermMonths: totalMonths,
      loanedFees,
      upfrontFees,
    };

    const aprResults = calculateAPR(inputs);
    setResults(aprResults);

    // Generate amortization schedule
    const schedule = calculateAmortizationSchedule(
      aprResults.amountFinanced,
      interestRate,
      totalMonths
    );
    setAmortizationSchedule(schedule);
  }, [
    loanAmount,
    interestRate,
    loanTermYears,
    loanTermMonths,
    loanedFees,
    upfrontFees,
  ]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number, decimals: number = 3) => {
    return `${value.toFixed(decimals)}%`;
  };

  const formatInputValue = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const totalMonths = loanTermYears * 12 + loanTermMonths;
  const aprDifference = results
    ? results.effectiveAPR - results.nominalRate
    : 0;
  const aprDifferencePercent =
    results && results.nominalRate > 0
      ? (aprDifference / results.nominalRate) * 100
      : 0;

  return (
    <CalculatorLayout
      title="APR Calculator"
      description="Calculate the true cost of a loan including fees and interest"
      icon={<Percent className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
    >
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
                Loan Details
              </h2>

              <div className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(loanAmount)}
                      onChange={(e) => {
                        setLoanAmount(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interest Rate (Annual)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={interestRate || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setInterestRate(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Loan Term */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Term
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Years
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={loanTermYears}
                        onChange={(e) =>
                          setLoanTermYears(Number(e.target.value))
                        }
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Months
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={loanTermMonths}
                        onChange={(e) =>
                          setLoanTermMonths(Number(e.target.value))
                        }
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total: {totalMonths} months
                  </div>
                </div>

                {/* Loaned Fees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loaned Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(loanedFees)}
                      onChange={(e) => {
                        setLoanedFees(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Fees added to loan principal
                  </div>
                </div>

                {/* Upfront Fees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upfront Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(upfrontFees)}
                      onChange={(e) => {
                        setUpfrontFees(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Fees paid out-of-pocket
                  </div>
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
                  {/* APR Comparison Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-6 h-6" />
                      <div className="text-sm font-medium opacity-90">
                        Effective APR (True Cost)
                      </div>
                    </div>
                    <div className="text-6xl font-bold mb-2">
                      {formatPercent(results.effectiveAPR)}
                    </div>
                    <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                      <div className="flex-1">
                        <div className="text-sm opacity-75">Nominal Rate</div>
                        <div className="text-2xl font-semibold mt-1">
                          {formatPercent(results.nominalRate, 2)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm opacity-75">Difference</div>
                        <div className="text-2xl font-semibold mt-1">
                          +{formatPercent(aprDifference)}
                        </div>
                      </div>
                    </div>
                    {aprDifference > 0 && (
                      <div className="mt-4 text-sm bg-white/10 rounded-xl px-4 py-3">
                        Your effective APR is {aprDifferencePercent.toFixed(1)}%
                        higher than the nominal rate due to fees
                      </div>
                    )}
                  </div>

                  {/* Monthly Payment Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Monthly Payment
                      </h3>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-6">
                      {formatCurrency(results.monthlyPayment)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">
                          Number of Payments
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          {totalMonths}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Total Payments
                        </div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          {formatCurrency(results.totalPayments)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Loan Cost Breakdown
                    </h3>

                    {/* Visual Breakdown */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Amount Financed</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(results.amountFinanced)}
                          </span>
                        </div>
                        <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${
                                (results.amountFinanced / results.totalCost) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Total Interest</span>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(results.totalInterest)}
                          </span>
                        </div>
                        <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500"
                            style={{
                              width: `${
                                (results.totalInterest / results.totalCost) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {results.totalFees > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Total Fees</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(results.totalFees)}
                            </span>
                          </div>
                          <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{
                                width: `${
                                  (results.totalFees / results.totalCost) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Net Amount Received
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.netAmountReceived)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-gray-900">
                          Total Cost of Loan
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(results.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* APR vs Interest Rate Comparison */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Understanding Your APR
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">
                              Interest Rate:{' '}
                              {formatPercent(results.nominalRate, 2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              The base annual rate charged on the principal
                              amount
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                          <div>
                            <div className="font-semibold text-gray-900 mb-1">
                              Effective APR:{' '}
                              {formatPercent(results.effectiveAPR)}
                            </div>
                            <div className="text-sm text-gray-600">
                              The true cost including all fees and charges
                            </div>
                          </div>
                        </div>
                      </div>
                      {results.totalFees > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="text-sm text-amber-900">
                            <strong>Important:</strong> Fees add{' '}
                            {formatCurrency(results.totalFees)} to your total
                            cost, increasing your effective rate by{' '}
                            {formatPercent(aprDifference)}.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amortization Schedule Accordion */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                      className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-xl font-bold text-gray-900">
                        Payment Schedule
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-600 transition-transform ${
                          isScheduleOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isScheduleOpen && (
                      <div className="px-8 pb-8 max-h-96 overflow-y-auto">
                        <div className="text-sm text-gray-600 mb-4">
                          Monthly breakdown of principal and interest payments
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                  Month
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                  Payment
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                  Principal
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                  Interest
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                  Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {amortizationSchedule.map((row) => (
                                <tr
                                  key={row.month}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-gray-900 font-medium">
                                    {row.month}
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-900">
                                    {formatCurrency(row.payment)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-blue-600">
                                    {formatCurrency(row.principal)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-orange-600">
                                    {formatCurrency(row.interest)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                    {formatCurrency(row.balance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
              Understanding APR and How It Affects Your Loan
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is APR?
                </h3>
                <p className="mb-4">
                  Annual Percentage Rate (APR) represents the true yearly cost
                  of borrowing money. Unlike the nominal interest rate, APR
                  includes all fees and costs associated with the loan,
                  providing a complete picture of what you&apos;ll actually pay.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Interest Rate:</strong> Only the cost of borrowing
                    the principal
                  </li>
                  <li>
                    <strong>APR:</strong> Interest rate + all fees and charges
                  </li>
                  <li>
                    <strong>Why it matters:</strong> APR helps you compare loan
                    offers accurately
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Types of Loan Fees
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Loaned Fees (Added to Principal)
                    </h4>
                    <p className="text-sm">
                      These fees are added to your loan amount, increasing the
                      principal you need to repay. Examples include origination
                      fees, processing fees, and some closing costs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Upfront Fees (Paid Out-of-Pocket)
                    </h4>
                    <p className="text-sm">
                      These fees are paid upfront and reduce the net amount you
                      receive. Examples include application fees, appraisal
                      fees, and some administrative charges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How APR is Calculated
                </h3>
                <p className="mb-4">
                  APR is calculated using an iterative method that finds the
                  effective rate where the present value of all your payments
                  equals the net amount you received:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-4">
                  Net Amount Received = PV of all monthly payments
                </div>
                <p className="text-sm">
                  This calculation accounts for the time value of money and
                  ensures that all costs are properly annualized, giving you a
                  true comparison metric.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Why APR Matters
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Compare apples to apples:</strong> Two loans with
                    the same interest rate can have very different APRs due to
                    fees
                  </li>
                  <li>
                    <strong>See the full picture:</strong> A low interest rate
                    might be offset by high fees
                  </li>
                  <li>
                    <strong>Make informed decisions:</strong> Always compare
                    APRs, not just interest rates, when shopping for loans
                  </li>
                  <li>
                    <strong>Understand true costs:</strong> APR shows exactly
                    how much you&apos;re paying to borrow money
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting a Better APR
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Improve your credit score:</strong> Better credit
                    typically means lower rates and fewer fees
                  </li>
                  <li>
                    <strong>Shop around:</strong> Compare offers from multiple
                    lenders using APR as your main metric
                  </li>
                  <li>
                    <strong>Negotiate fees:</strong> Some lenders may waive or
                    reduce certain fees
                  </li>
                  <li>
                    <strong>Consider shorter terms:</strong> Shorter loans often
                    have lower rates and fees
                  </li>
                  <li>
                    <strong>Read the fine print:</strong> Understand all fees
                    before committing to a loan
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Example: The Impact of Fees
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      Loan A: 6% interest rate, $500 in fees
                    </p>
                    <p>Effective APR: ~6.5% on a $10,000 3-year loan</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      Loan B: 6.5% interest rate, $0 in fees
                    </p>
                    <p>Effective APR: 6.5%</p>
                  </div>
                  <p className="pt-2">
                    Both loans have the same effective cost, but Loan A appears
                    cheaper at first glance. This is why APR is so important!
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the
                    information you enter
                  </li>
                  <li>
                    • APR assumes you keep the loan for its full term - paying
                    off early changes the effective cost
                  </li>
                  <li>
                    • Some fees may be optional or negotiable - always ask your
                    lender
                  </li>
                  <li>
                    • Federal law requires lenders to disclose APR on most loans
                  </li>
                  <li>
                    • Always read the loan agreement carefully before signing
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
