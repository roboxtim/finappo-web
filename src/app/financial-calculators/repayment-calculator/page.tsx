'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateRepayment,
  formatCurrency,
  formatPercentage,
  formatMonthsAsTime,
  type CalculationMode,
  type LoanInputs,
} from './calculations';

export default function RepaymentCalculator() {
  const [loanBalance, setLoanBalance] = useState(10000);
  const [interestRate, setInterestRate] = useState(5);
  const [mode, setMode] = useState<CalculationMode>('fixed-term');
  const [years, setYears] = useState(1);
  const [months, setMonths] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(900);

  const results = useMemo(() => {
    try {
      const inputs: LoanInputs = {
        loanBalance,
        interestRate,
        mode,
        paymentFrequency: 'monthly',
      };

      if (mode === 'fixed-term') {
        inputs.years = years;
        inputs.months = months;
      } else {
        inputs.monthlyPayment = monthlyPayment;
      }

      return calculateRepayment(inputs);
    } catch {
      return null;
    }
  }, [loanBalance, interestRate, mode, years, months, monthlyPayment]);

  const parseCurrencyInput = (value: string): number => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Loan Repayment Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate monthly payments or determine payoff time
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
            {/* Left Column - Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Loan Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Balance
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={loanBalance.toLocaleString()}
                        onChange={(e) =>
                          setLoanBalance(parseCurrencyInput(e.target.value))
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="10,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate (Annual)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={interestRate}
                        onChange={(e) =>
                          setInterestRate(parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                        placeholder="5.0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculation Mode */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Calculation Mode
                </h2>

                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setMode('fixed-term')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      mode === 'fixed-term'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Fixed Term
                  </button>
                  <button
                    onClick={() => setMode('fixed-payment')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      mode === 'fixed-payment'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Fixed Payment
                  </button>
                </div>

                {mode === 'fixed-term' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Years
                        </label>
                        <input
                          type="number"
                          value={years}
                          onChange={(e) =>
                            setYears(parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                          placeholder="1"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Months
                        </label>
                        <input
                          type="number"
                          value={months}
                          onChange={(e) =>
                            setMonths(parseInt(e.target.value) || 0)
                          }
                          className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                          min="0"
                          max="11"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Calculator will determine the monthly payment needed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Monthly Payment
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={monthlyPayment.toLocaleString()}
                          onChange={(e) =>
                            setMonthlyPayment(
                              parseCurrencyInput(e.target.value)
                            )
                          }
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors font-medium"
                          placeholder="900"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Calculator will determine how long it takes to pay off
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {results && (
                <>
                  {/* Main Result */}
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-green-600 to-emerald-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <DollarSign className="w-4 h-4" />
                      {mode === 'fixed-term'
                        ? 'Monthly Payment'
                        : 'Payoff Time'}
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {mode === 'fixed-term'
                        ? formatCurrency(results.monthlyPayment)
                        : formatMonthsAsTime(results.payoffMonths)}
                    </div>
                    <div className="text-sm opacity-75">
                      {mode === 'fixed-term'
                        ? `for ${formatMonthsAsTime(results.payoffMonths)}`
                        : `at ${formatCurrency(results.monthlyPayment)}/month`}
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Payment Breakdown
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Principal
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(results.totalPrincipal)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatPercentage(results.principalPercentage)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Interest
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(results.totalInterest)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatPercentage(results.interestPercentage)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Total Payments
                          </span>
                          <span className="text-xl font-bold text-gray-900">
                            {formatCurrency(results.totalPayments)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Summary
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Loan Amount
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(loanBalance)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Interest Rate
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {interestRate}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Repayment Period
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatMonthsAsTime(results.payoffMonths)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Monthly Payment
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(results.monthlyPayment)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-sm font-semibold text-gray-700">
                          Total Interest
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency(results.totalInterest)}
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

      {/* Educational Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Understanding Loan Repayment
          </h2>

          <div className="prose prose-lg max-w-none">
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              What is Loan Repayment?
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Loan repayment is the process of paying back borrowed money to a
              lender over time. Each payment typically includes both principal
              (the original amount borrowed) and interest (the cost of
              borrowing).
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Fixed Term vs. Fixed Payment
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong>Fixed Term:</strong> When you know how long you want to
              take to repay the loan, the calculator determines what your
              monthly payment needs to be. This is common for mortgages and auto
              loans.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              <strong>Fixed Payment:</strong> When you know how much you can
              afford to pay each month, the calculator determines how long it
              will take to pay off the loan. This is useful for budgeting and
              debt payoff planning.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              How Interest Affects Your Payment
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              In the early months of a loan, more of your payment goes toward
              interest. As the principal balance decreases, more of each payment
              goes toward principal. This is called amortization.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Strategies to Reduce Interest
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Make extra payments toward principal when possible</li>
              <li>Consider bi-weekly payments instead of monthly</li>
              <li>Refinance to a lower interest rate if available</li>
              <li>Pay more than the minimum monthly payment</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Important Considerations
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>
                <strong>Prepayment penalties:</strong> Some loans charge fees
                for paying off early
              </li>
              <li>
                <strong>Opportunity cost:</strong> Consider whether paying off
                debt faster is better than investing
              </li>
              <li>
                <strong>Emergency fund:</strong> Maintain savings before
                aggressively paying down debt
              </li>
              <li>
                <strong>Interest deductions:</strong> Some loan interest (like
                mortgage) may be tax-deductible
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
