'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calculator,
  DollarSign,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateSimple,
  calculateRepayment,
  calculateProjection,
  formatCurrency,
  formatPercentage,
  formatMonthsAsTime,
  type CalculatorMode,
  type SimpleInputs,
  type RepaymentInputs,
  type ProjectionInputs,
} from './calculations';

export default function StudentLoanCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('simple');

  // Simple mode state
  const [loanBalance, setLoanBalance] = useState(25000);
  const [remainingTerm, setRemainingTerm] = useState(10);
  const [interestRate, setInterestRate] = useState(5.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Repayment mode state
  const [repaymentLoanBalance, setRepaymentLoanBalance] = useState(30000);
  const [repaymentMonthlyPayment, setRepaymentMonthlyPayment] = useState(350);
  const [repaymentInterestRate, setRepaymentInterestRate] = useState(6.0);
  const [extraMonthly, setExtraMonthly] = useState(0);
  const [extraAnnual, setExtraAnnual] = useState(0);
  const [oneTimePayment, setOneTimePayment] = useState(0);

  // Projection mode state
  const [yearsToGraduation, setYearsToGraduation] = useState(4);
  const [annualLoanAmount, setAnnualLoanAmount] = useState(8000);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [projectionLoanTerm, setProjectionLoanTerm] = useState(10);
  const [gracePeriod, setGracePeriod] = useState(6);
  const [projectionInterestRate, setProjectionInterestRate] = useState(5.5);
  const [interestDuringSchool, setInterestDuringSchool] = useState(false);

  const simpleResults = useMemo(() => {
    if (mode !== 'simple') return null;
    try {
      const inputs: SimpleInputs = {
        loanBalance: loanBalance > 0 ? loanBalance : undefined,
        remainingTerm: remainingTerm > 0 ? remainingTerm : undefined,
        interestRate: interestRate > 0 ? interestRate : undefined,
        monthlyPayment: monthlyPayment > 0 ? monthlyPayment : undefined,
      };
      return calculateSimple(inputs);
    } catch {
      return null;
    }
  }, [mode, loanBalance, remainingTerm, interestRate, monthlyPayment]);

  const repaymentResults = useMemo(() => {
    if (mode !== 'repayment') return null;
    try {
      const inputs: RepaymentInputs = {
        loanBalance: repaymentLoanBalance,
        monthlyPayment: repaymentMonthlyPayment,
        interestRate: repaymentInterestRate,
        extraMonthly,
        extraAnnual,
        oneTimePayment,
      };
      return calculateRepayment(inputs);
    } catch {
      return null;
    }
  }, [
    mode,
    repaymentLoanBalance,
    repaymentMonthlyPayment,
    repaymentInterestRate,
    extraMonthly,
    extraAnnual,
    oneTimePayment,
  ]);

  const projectionResults = useMemo(() => {
    if (mode !== 'projection') return null;
    try {
      const inputs: ProjectionInputs = {
        yearsToGraduation,
        annualLoanAmount,
        currentBalance,
        loanTerm: projectionLoanTerm,
        gracePeriod,
        interestRate: projectionInterestRate,
        interestDuringSchool,
      };
      return calculateProjection(inputs);
    } catch {
      return null;
    }
  }, [
    mode,
    yearsToGraduation,
    annualLoanAmount,
    currentBalance,
    projectionLoanTerm,
    gracePeriod,
    projectionInterestRate,
    interestDuringSchool,
  ]);

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Student Loan Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Calculate payments, compare strategies, or project future
                  costs
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mode Selector */}
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setMode('simple')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                mode === 'simple'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Simple Calculator
            </button>
            <button
              onClick={() => setMode('repayment')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                mode === 'repayment'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Repayment Calculator
            </button>
            <button
              onClick={() => setMode('projection')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                mode === 'projection'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Projection Calculator
            </button>
          </div>
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
              {/* Simple Mode Inputs */}
              {mode === 'simple' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Loan Details
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Provide any 3 values to calculate the 4th
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loan Balance
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={loanBalance || ''}
                          onChange={(e) =>
                            setLoanBalance(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Remaining Term (years)
                      </label>
                      <input
                        type="number"
                        value={remainingTerm || ''}
                        onChange={(e) =>
                          setRemainingTerm(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        step="0.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Interest Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={interestRate || ''}
                          onChange={(e) =>
                            setInterestRate(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
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
                        Monthly Payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={monthlyPayment || ''}
                          onChange={(e) =>
                            setMonthlyPayment(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Repayment Mode Inputs */}
              {mode === 'repayment' && (
                <>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Current Loan
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Loan Balance
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={repaymentLoanBalance}
                            onChange={(e) =>
                              setRepaymentLoanBalance(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Monthly Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={repaymentMonthlyPayment}
                            onChange={(e) =>
                              setRepaymentMonthlyPayment(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Interest Rate
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={repaymentInterestRate}
                            onChange={(e) =>
                              setRepaymentInterestRate(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                            step="0.1"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Extra Payments
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Extra Monthly Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={extraMonthly || ''}
                            onChange={(e) =>
                              setExtraMonthly(parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Extra Annual Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={extraAnnual || ''}
                            onChange={(e) =>
                              setExtraAnnual(parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          One-Time Payment
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={oneTimePayment || ''}
                            onChange={(e) =>
                              setOneTimePayment(parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Projection Mode Inputs */}
              {mode === 'projection' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    School & Loan Details
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Years to Graduation
                      </label>
                      <input
                        type="number"
                        value={yearsToGraduation}
                        onChange={(e) =>
                          setYearsToGraduation(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        min="0"
                        max="10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Annual Loan Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={annualLoanAmount}
                          onChange={(e) =>
                            setAnnualLoanAmount(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Balance
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={currentBalance}
                          onChange={(e) =>
                            setCurrentBalance(parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loan Term (years)
                      </label>
                      <input
                        type="number"
                        value={projectionLoanTerm}
                        onChange={(e) =>
                          setProjectionLoanTerm(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Grace Period (months)
                      </label>
                      <input
                        type="number"
                        value={gracePeriod}
                        onChange={(e) =>
                          setGracePeriod(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        min="0"
                        max="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Interest Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={projectionInterestRate}
                          onChange={(e) =>
                            setProjectionInterestRate(
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                          placeholder="0"
                          step="0.1"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="interestDuringSchool"
                        checked={interestDuringSchool}
                        onChange={(e) =>
                          setInterestDuringSchool(e.target.checked)
                        }
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="interestDuringSchool"
                        className="ml-3 text-sm font-semibold text-gray-700"
                      >
                        Interest accrues during school
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT COLUMN - RESULTS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Simple Mode Results */}
              {mode === 'simple' && simpleResults && (
                <>
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Calculator className="w-4 h-4" />
                      Monthly Payment
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(simpleResults.monthlyPayment)}
                    </div>
                    <div className="text-sm opacity-75">
                      for {simpleResults.remainingTerm.toFixed(1)} years at{' '}
                      {simpleResults.interestRate.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Loan Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-600 mb-1">
                          Loan Balance
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(simpleResults.loanBalance)}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-600 mb-1">
                          Total Interest
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(simpleResults.totalInterest)}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6">
                      <div className="text-sm text-gray-600 mb-1">
                        Total Payments
                      </div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(simpleResults.totalPayments)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Principal
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatPercentage(
                              simpleResults.principalPercentage
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${simpleResults.principalPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Interest
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatPercentage(simpleResults.interestPercentage)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${simpleResults.interestPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Repayment Mode Results */}
              {mode === 'repayment' && repaymentResults && (
                <>
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-green-600 to-emerald-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      Interest Saved
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(repaymentResults.savings.interestSaved)}
                    </div>
                    <div className="text-sm opacity-75">
                      {repaymentResults.savings.monthsSaved} months faster
                      payoff
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Comparison
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              Original
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-green-700">
                              Accelerated
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-3 px-4 text-gray-600">
                              Monthly Payment
                            </td>
                            <td className="py-3 px-4 text-center font-semibold">
                              {formatCurrency(
                                repaymentResults.original.monthlyPayment
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-green-600">
                              {formatCurrency(
                                repaymentResults.accelerated.monthlyPayment
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-gray-600">
                              Payoff Time
                            </td>
                            <td className="py-3 px-4 text-center font-semibold">
                              {formatMonthsAsTime(
                                repaymentResults.original.totalMonths
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-green-600">
                              {formatMonthsAsTime(
                                repaymentResults.accelerated.totalMonths
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-gray-600">
                              Total Interest
                            </td>
                            <td className="py-3 px-4 text-center font-semibold">
                              {formatCurrency(
                                repaymentResults.original.totalInterest
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-green-600">
                              {formatCurrency(
                                repaymentResults.accelerated.totalInterest
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4 text-gray-600">
                              Total Payments
                            </td>
                            <td className="py-3 px-4 text-center font-semibold">
                              {formatCurrency(
                                repaymentResults.original.totalPayments
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-green-600">
                              {formatCurrency(
                                repaymentResults.accelerated.totalPayments
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Projection Mode Results */}
              {mode === 'projection' && projectionResults && (
                <>
                  <div className="rounded-3xl p-8 text-white shadow-xl bg-gradient-to-br from-purple-600 to-pink-600">
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Repayment
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(projectionResults.monthlyRepayment)}
                    </div>
                    <div className="text-sm opacity-75">
                      after graduation and grace period
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Projected Costs
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-600 mb-1">
                          Amount Borrowed
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(projectionResults.amountBorrowed)}
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-xl">
                        <div className="text-sm text-gray-600 mb-1">
                          After Graduation
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(
                            projectionResults.balanceAfterGraduation
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-xl col-span-2">
                        <div className="text-sm text-gray-600 mb-1">
                          After Grace Period
                        </div>
                        <div className="text-3xl font-bold text-red-600">
                          {formatCurrency(
                            projectionResults.balanceAfterGracePeriod
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-600">
                          Total Interest
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(projectionResults.totalInterest)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Total Payments
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(projectionResults.totalPayments)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Principal
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatPercentage(
                              projectionResults.principalPercentage
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${projectionResults.principalPercentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="font-medium text-gray-700">
                            Interest
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatPercentage(
                              projectionResults.interestPercentage
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${projectionResults.interestPercentage}%`,
                            }}
                          />
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
    </div>
  );
}
