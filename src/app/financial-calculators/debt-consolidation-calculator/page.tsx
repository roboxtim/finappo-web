'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Scale,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Calculator,
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import {
  calculateDebtConsolidation,
  formatCurrency,
  formatPercentage,
  formatMonthsAsTime,
  type ExistingDebt,
  type ConsolidationLoan,
} from './calculations';

export default function DebtConsolidationCalculator() {
  const [existingDebts, setExistingDebts] = useState<ExistingDebt[]>([
    {
      name: 'Credit Card 1',
      balance: 5000,
      monthlyPayment: 200,
      interestRate: 18,
    },
    {
      name: 'Credit Card 2',
      balance: 3000,
      monthlyPayment: 150,
      interestRate: 20,
    },
    {
      name: 'Personal Loan',
      balance: 2000,
      monthlyPayment: 100,
      interestRate: 12,
    },
  ]);

  const [consolidationLoan, setConsolidationLoan] = useState<ConsolidationLoan>(
    {
      loanAmount: 10000,
      interestRate: 8,
      loanTermYears: 3,
      loanTermMonths: 0,
      loanFeePercent: 2,
    }
  );

  const addDebt = useCallback(() => {
    if (existingDebts.length < 20) {
      setExistingDebts([
        ...existingDebts,
        {
          name: `Debt ${existingDebts.length + 1}`,
          balance: 0,
          monthlyPayment: 0,
          interestRate: 0,
        },
      ]);
    }
  }, [existingDebts]);

  const removeDebt = useCallback((index: number) => {
    setExistingDebts((debts) => debts.filter((_, i) => i !== index));
  }, []);

  const updateDebt = useCallback(
    (index: number, field: keyof ExistingDebt, value: string | number) => {
      setExistingDebts((debts) =>
        debts.map((debt, i) =>
          i === index ? { ...debt, [field]: value } : debt
        )
      );
    },
    []
  );

  const results = useMemo(() => {
    try {
      return calculateDebtConsolidation({ existingDebts, consolidationLoan });
    } catch {
      return null;
    }
  }, [existingDebts, consolidationLoan]);

  const parseCurrencyInput = (value: string): number => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const parsePercentageInput = (value: string): number => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Debt Consolidation Calculator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Compare your existing debts with consolidation loan options
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
              {/* Existing Debts */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Existing Debts
                  </h2>
                  {existingDebts.length < 20 && (
                    <button
                      onClick={addDebt}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Debt
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {existingDebts.map((debt, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={debt.name}
                          onChange={(e) =>
                            updateDebt(index, 'name', e.target.value)
                          }
                          className="flex-1 px-3 py-2 rounded-lg text-gray-900 border border-gray-200 focus:border-orange-500 focus:outline-none font-medium"
                          placeholder="Debt name"
                        />
                        {existingDebts.length > 1 && (
                          <button
                            onClick={() => removeDebt(index)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Balance
                          </label>
                          <input
                            type="text"
                            value={debt.balance || ''}
                            onChange={(e) =>
                              updateDebt(
                                index,
                                'balance',
                                parseCurrencyInput(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg text-gray-900 border border-gray-200 focus:border-orange-500 focus:outline-none text-sm"
                            placeholder="$0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Payment
                          </label>
                          <input
                            type="text"
                            value={debt.monthlyPayment || ''}
                            onChange={(e) =>
                              updateDebt(
                                index,
                                'monthlyPayment',
                                parseCurrencyInput(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg text-gray-900 border border-gray-200 focus:border-orange-500 focus:outline-none text-sm"
                            placeholder="$0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Rate %
                          </label>
                          <input
                            type="text"
                            value={debt.interestRate || ''}
                            onChange={(e) =>
                              updateDebt(
                                index,
                                'interestRate',
                                parsePercentageInput(e.target.value)
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg text-gray-900 border border-gray-200 focus:border-orange-500 focus:outline-none text-sm"
                            placeholder="0%"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidation Loan */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Consolidation Loan
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={consolidationLoan.loanAmount.toLocaleString()}
                        onChange={(e) =>
                          setConsolidationLoan({
                            ...consolidationLoan,
                            loanAmount: parseCurrencyInput(e.target.value),
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="10,000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={consolidationLoan.interestRate}
                        onChange={(e) =>
                          setConsolidationLoan({
                            ...consolidationLoan,
                            interestRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="8.0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Term (Years)
                      </label>
                      <input
                        type="number"
                        value={consolidationLoan.loanTermYears}
                        onChange={(e) =>
                          setConsolidationLoan({
                            ...consolidationLoan,
                            loanTermYears: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="3"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Term (Months)
                      </label>
                      <input
                        type="number"
                        value={consolidationLoan.loanTermMonths}
                        onChange={(e) =>
                          setConsolidationLoan({
                            ...consolidationLoan,
                            loanTermMonths: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="0"
                        min="0"
                        max="11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Fee (%)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={consolidationLoan.loanFeePercent}
                        onChange={(e) =>
                          setConsolidationLoan({
                            ...consolidationLoan,
                            loanFeePercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-medium"
                        placeholder="2.0"
                        step="0.1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Fee:{' '}
                      {formatCurrency(
                        (consolidationLoan.loanAmount *
                          consolidationLoan.loanFeePercent) /
                          100
                      )}
                    </p>
                  </div>
                </div>
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
                  {/* Recommendation */}
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      results.isWorthwhile
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                        : 'bg-gradient-to-br from-red-600 to-orange-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      {results.isWorthwhile ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      Recommendation
                    </div>
                    <p className="text-lg leading-relaxed">
                      {results.recommendation}
                    </p>
                  </div>

                  {/* Comparison Table */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Comparison
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                              Metric
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                              Current Debts
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                              Consolidation
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="py-3 px-2 text-sm text-gray-700">
                              Total Balance
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(
                                results.existingDebts.totalBalance
                              )}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(consolidationLoan.loanAmount)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2 text-sm text-gray-700">
                              Monthly Payment
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(
                                results.existingDebts.totalMonthlyPayment
                              )}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(
                                results.consolidatedLoan.monthlyPayment
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2 text-sm text-gray-700">
                              Interest Rate
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatPercentage(
                                results.existingDebts.weightedAverageRate
                              )}{' '}
                              avg
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatPercentage(consolidationLoan.interestRate)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2 text-sm text-gray-700">
                              Real APR
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatPercentage(
                                results.existingDebts.weightedAverageRate
                              )}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatPercentage(
                                results.consolidatedLoan.realAPR
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2 text-sm text-gray-700">
                              Payoff Time
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatMonthsAsTime(
                                results.existingDebts.payoffMonths
                              )}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatMonthsAsTime(
                                results.consolidatedLoan.payoffMonths
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3 px-2 text-sm text-gray-700">
                              Total Interest
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(
                                results.existingDebts.totalInterest
                              )}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(
                                results.consolidatedLoan.totalCost
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Savings Analysis
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {results.savings.monthlyPayment > 0 ? (
                            <TrendingDown className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Monthly Payment
                          </span>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            results.savings.monthlyPayment > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {results.savings.monthlyPayment > 0 ? '-' : '+'}
                          {formatCurrency(
                            Math.abs(results.savings.monthlyPayment)
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {results.savings.totalInterest > 0 ? (
                            <TrendingDown className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Total Interest
                          </span>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            results.savings.totalInterest > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {results.savings.totalInterest > 0 ? '-' : '+'}
                          {formatCurrency(
                            Math.abs(results.savings.totalInterest)
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {results.savings.timeMonths > 0 ? (
                            <Calendar className="w-5 h-5 text-green-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Payoff Time
                          </span>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            results.savings.timeMonths > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {results.savings.timeMonths > 0 ? '-' : '+'}
                          {formatMonthsAsTime(
                            Math.abs(results.savings.timeMonths)
                          )}
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
            Understanding Debt Consolidation
          </h2>

          <div className="prose prose-lg max-w-none">
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              What is Debt Consolidation?
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Debt consolidation involves combining multiple debts into a single
              loan, typically with a lower interest rate. This can simplify your
              finances by reducing multiple payments to just one and potentially
              save money on interest charges.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Real APR vs. Advertised Rate
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              The real APR includes all costs of borrowing, including upfront
              fees, points, and other charges. This calculator shows the true
              cost of consolidation by factoring in these fees, which can
              significantly impact whether consolidation is financially
              beneficial.
            </p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              When Does Consolidation Make Sense?
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>
                The consolidation loan has a lower real APR than your current
                debts
              </li>
              <li>You can afford the new monthly payment</li>
              <li>
                The total cost (interest + fees) is less than your current debts
              </li>
              <li>You&apos;re committed to not accumulating new debt</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Important Considerations
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>
                <strong>Loan fees matter:</strong> High upfront fees can negate
                interest savings
              </li>
              <li>
                <strong>Longer terms:</strong> While monthly payments may be
                lower, longer loan terms can mean more total interest
              </li>
              <li>
                <strong>Credit score impact:</strong> Consolidation may
                temporarily affect your credit score
              </li>
              <li>
                <strong>Spending habits:</strong> Address the root cause of debt
                to avoid accumulating more
              </li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Alternatives to Consolidation
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Consider other debt repayment strategies like the debt avalanche
              (paying off highest interest debt first) or debt snowball (paying
              off smallest balances first) methods. Sometimes these approaches
              can be more effective than consolidation, especially if you can
              maintain discipline with multiple payments.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
