'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Percent } from 'lucide-react';
import {
  calculateInterestRate,
  type InterestRateInputs,
} from './__tests__/interestRateCalculations';

export default function InterestRateCalculator() {
  // Input states
  const [loanAmount, setLoanAmount] = useState<number>(32000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(960);

  // Calculated results
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [calculationError, setCalculationError] = useState<string>('');

  // Calculate interest rate
  const calculate = useCallback(() => {
    try {
      setCalculationError('');

      const inputs: InterestRateInputs = {
        loanAmount,
        loanTermMonths,
        monthlyPayment,
      };

      const results = calculateInterestRate(inputs);

      setAnnualInterestRate(results.annualInterestRate);
      setTotalPayment(results.totalPayment);
      setTotalInterest(results.totalInterest);
    } catch (error) {
      setCalculationError(
        error instanceof Error ? error.message : 'Calculation error'
      );
      setAnnualInterestRate(0);
      setTotalPayment(0);
      setTotalInterest(0);
    }
  }, [loanAmount, loanTermMonths, monthlyPayment]);

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

  const principalPercentage =
    totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 50;

  return (
    <CalculatorLayout
      title="Interest Rate Calculator"
      description="Find the interest rate on your loan when you know the loan amount, term, and monthly payment. Perfect for verifying dealer quotes or understanding your existing loans."
      icon={<Percent className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-purple-600 to-violet-600"
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
                Loan Information
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
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    The total amount borrowed
                  </p>
                </div>

                {/* Loan Term */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loan Term
                  </label>
                  <select
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value={6}>6 months</option>
                    <option value={12}>12 months (1 year)</option>
                    <option value={18}>18 months</option>
                    <option value={24}>24 months (2 years)</option>
                    <option value={30}>30 months</option>
                    <option value={36}>36 months (3 years)</option>
                    <option value={42}>42 months</option>
                    <option value={48}>48 months (4 years)</option>
                    <option value={60}>60 months (5 years)</option>
                    <option value={72}>72 months (6 years)</option>
                    <option value={84}>84 months (7 years)</option>
                    <option value={120}>120 months (10 years)</option>
                    <option value={180}>180 months (15 years)</option>
                    <option value={240}>240 months (20 years)</option>
                    <option value={360}>360 months (30 years)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Length of the loan
                  </p>
                </div>

                {/* Monthly Payment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(monthlyPayment)}
                      onChange={(e) => {
                        setMonthlyPayment(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Your fixed monthly payment amount
                  </p>
                </div>

                {/* Error Message */}
                {calculationError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-800">{calculationError}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Interest Rate Card */}
              <div className="bg-gradient-to-br from-purple-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Annual Interest Rate (APR)
                </div>
                <div className="text-6xl font-bold mb-6">
                  {calculationError ? '--' : annualInterestRate.toFixed(3)}%
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Loan Amount</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(loanAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Loan Term</div>
                    <div className="text-xl font-semibold mt-1">
                      {loanTermMonths} months
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Breakdown
                </h3>

                {/* Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div
                      className="bg-purple-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${principalPercentage}%` }}
                    >
                      {principalPercentage > 15 &&
                        `Principal ${principalPercentage.toFixed(1)}%`}
                    </div>
                    <div
                      className="bg-orange-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${100 - principalPercentage}%` }}
                    >
                      {100 - principalPercentage > 15 &&
                        `Interest ${(100 - principalPercentage).toFixed(1)}%`}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500"></div>
                        <span className="text-sm text-gray-600">Principal</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(loanAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <span className="text-sm text-gray-600">
                          Total Interest
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(monthlyPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total of {loanTermMonths} Payments
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-gray-700 font-medium">
                      Total Interest Paid
                    </span>
                    <span className="font-bold text-purple-600 text-lg">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-purple-50 rounded-3xl p-8 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  How to Use This Calculator
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">1.</span>
                    <span>
                      Enter the total loan amount (principal) you borrowed or
                      plan to borrow
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">2.</span>
                    <span>
                      Select the loan term from the dropdown (in months or
                      years)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">3.</span>
                    <span>
                      Enter your monthly payment amount that you pay or were
                      quoted
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">4.</span>
                    <span>
                      The calculator will instantly show you the annual interest
                      rate (APR)
                    </span>
                  </li>
                </ul>
              </div>
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
              Understanding Interest Rate Calculations
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What This Calculator Does
                </h3>
                <p className="mb-4">
                  This is a <strong>reverse calculator</strong> that solves for
                  the interest rate when you already know the loan amount, term,
                  and monthly payment. It&apos;s particularly useful when:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>
                    • Car dealers or lenders only provide monthly payment
                    information
                  </li>
                  <li>
                    • You want to verify the actual interest rate on a loan
                    offer
                  </li>
                  <li>• You need to understand the true cost of financing</li>
                  <li>
                    • You&apos;re comparing different loan offers side-by-side
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How It Works
                </h3>
                <p className="mb-4">
                  The calculator uses the Newton-Raphson numerical method to
                  find the interest rate that satisfies the standard loan
                  payment formula:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl font-mono text-sm">
                  M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <strong>M</strong> = Monthly payment (known)
                  </li>
                  <li>
                    <strong>P</strong> = Principal loan amount (known)
                  </li>
                  <li>
                    <strong>r</strong> = Monthly interest rate (solving for
                    this)
                  </li>
                  <li>
                    <strong>n</strong> = Number of months (known)
                  </li>
                </ul>
                <p className="mt-4">
                  The algorithm iteratively adjusts the rate until it finds the
                  value that produces your exact monthly payment amount.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Use Cases
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Auto Loans:</strong> Dealers often advertise monthly
                    payments without clearly stating the interest rate. Use this
                    calculator to find out what rate they&apos;re actually
                    charging.
                  </li>
                  <li>
                    <strong>Personal Loans:</strong> When you know your monthly
                    payment but want to verify the APR matches what was
                    promised.
                  </li>
                  <li>
                    <strong>Existing Loans:</strong> If you have a loan but
                    aren&apos;t sure of the interest rate, enter your loan
                    details to find it.
                  </li>
                  <li>
                    <strong>Loan Comparison:</strong> Compare different loan
                    offers by entering their terms and payments to see which has
                    the best rate.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Example Calculation
                </h3>
                <p className="mb-4">
                  Let&apos;s say you&apos;re looking at a car loan:
                </p>
                <ul className="space-y-2 ml-4 mb-4">
                  <li>• Loan Amount: $32,000</li>
                  <li>• Loan Term: 36 months (3 years)</li>
                  <li>• Monthly Payment: $960</li>
                </ul>
                <p>
                  The calculator reveals that this loan has an{' '}
                  <strong>interest rate of 5.065% APR</strong>. Over the life of
                  the loan, you&apos;ll pay $34,560 total, which includes $2,560
                  in interest.
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator assumes a standard amortizing loan with
                    fixed monthly payments
                  </li>
                  <li>
                    • The rate shown is the nominal annual percentage rate (APR)
                  </li>
                  <li>
                    • It does not include fees, points, or other loan costs
                  </li>
                  <li>
                    • For mortgages with PMI, taxes, and insurance, use a
                    specialized mortgage calculator
                  </li>
                  <li>
                    • Always verify rates with your lender before making
                    financial decisions
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
