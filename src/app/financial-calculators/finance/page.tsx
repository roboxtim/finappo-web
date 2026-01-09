'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Calculator, ChevronDown, Info } from 'lucide-react';
import {
  calculateTVM,
  TVMInputs,
  TVMSolveFor,
  generateAmortizationSchedule,
  AmortizationRow,
} from '@/lib/financeCalculator';

export default function FinanceCalculator() {
  // Solve mode
  const [solveFor, setSolveFor] = useState<TVMSolveFor>('FV');

  // Input states
  const [N, setN] = useState<number>(10);
  const [IY, setIY] = useState<number>(6);
  const [PV, setPV] = useState<number>(20000);
  const [PMT, setPMT] = useState<number>(-2000);
  const [FV, setFV] = useState<number>(0);
  const [PY, setPY] = useState<number>(1);
  const [CY, setCY] = useState<number>(1);
  const [PMTatBeginning, setPMTatBeginning] = useState<boolean>(false);

  // Results
  const [results, setResults] = useState<{
    N: number;
    IY: number;
    PV: number;
    PMT: number;
    FV: number;
  } | null>(null);

  // Amortization schedule
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  const calculate = useCallback(() => {
    try {
      const inputs: TVMInputs = {
        solveFor,
        N,
        IY,
        PV,
        PMT,
        FV,
        PY,
        CY,
        PMTatBeginning,
      };

      const result = calculateTVM(inputs);
      setResults(result);

      // Generate amortization schedule if we have meaningful values
      if (result.N > 0 && result.N <= 1000 && Math.abs(result.PV) > 0) {
        const amortSchedule = generateAmortizationSchedule(
          result.PV,
          result.PMT,
          result.IY,
          Math.round(result.N),
          PY,
          CY,
          PMTatBeginning
        );
        setSchedule(amortSchedule);
      } else {
        setSchedule([]);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setResults(null);
      setSchedule([]);
    }
  }, [solveFor, N, IY, PV, PMT, FV, PY, CY, PMTatBeginning]);

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

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const getSolveForLabel = (mode: TVMSolveFor): string => {
    switch (mode) {
      case 'N':
        return 'Number of Periods';
      case 'IY':
        return 'Interest Rate';
      case 'PV':
        return 'Present Value';
      case 'PMT':
        return 'Payment';
      case 'FV':
        return 'Future Value';
    }
  };

  const getSolveForValue = () => {
    if (!results) return '—';
    switch (solveFor) {
      case 'N':
        return formatNumber(results.N, 2);
      case 'IY':
        return `${formatNumber(results.IY, 4)}%`;
      case 'PV':
        return formatCurrency(results.PV);
      case 'PMT':
        return formatCurrency(results.PMT);
      case 'FV':
        return formatCurrency(results.FV);
    }
  };

  const totalPayments = results ? Math.abs(results.PMT * results.N) : 0;
  const totalInterest =
    results && Math.abs(results.PV) > 0
      ? totalPayments - Math.abs(results.PV)
      : 0;

  return (
    <CalculatorLayout
      title="Finance Calculator"
      description="Time Value of Money calculator - solve for any variable"
      icon={<Calculator className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
    >
      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[45%_55%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Solve For Selector */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Solve For
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(['N', 'IY', 'PV', 'PMT', 'FV'] as TVMSolveFor[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        onClick={() => setSolveFor(mode)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                          solveFor === mode
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* TVM Inputs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Variables
                </h2>

                <div className="space-y-5">
                  {/* Number of Periods */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      N (Number of Periods)
                    </label>
                    <input
                      type="number"
                      value={N || ''}
                      onChange={(e) => setN(Number(e.target.value))}
                      disabled={solveFor === 'N'}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      I/Y (Interest Rate % per year)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={IY || ''}
                        onChange={(e) => setIY(Number(e.target.value))}
                        disabled={solveFor === 'IY'}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Present Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PV (Present Value)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={PV || ''}
                        onChange={(e) => setPV(Number(e.target.value))}
                        disabled={solveFor === 'PV'}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PMT (Payment per period)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={PMT || ''}
                        onChange={(e) => setPMT(Number(e.target.value))}
                        disabled={solveFor === 'PMT'}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Future Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      FV (Future Value)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={FV || ''}
                        onChange={(e) => setFV(Number(e.target.value))}
                        disabled={solveFor === 'FV'}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Advanced Settings
                </h2>

                <div className="space-y-5">
                  {/* Payments per Year */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      P/Y (Payments per Year)
                    </label>
                    <select
                      value={PY}
                      onChange={(e) => setPY(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    >
                      <option value={1}>1 (Annual)</option>
                      <option value={2}>2 (Semi-annual)</option>
                      <option value={4}>4 (Quarterly)</option>
                      <option value={12}>12 (Monthly)</option>
                      <option value={52}>52 (Weekly)</option>
                      <option value={365}>365 (Daily)</option>
                    </select>
                  </div>

                  {/* Compounding per Year */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      C/Y (Compounding per Year)
                    </label>
                    <select
                      value={CY}
                      onChange={(e) => setCY(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    >
                      <option value={1}>1 (Annual)</option>
                      <option value={2}>2 (Semi-annual)</option>
                      <option value={4}>4 (Quarterly)</option>
                      <option value={12}>12 (Monthly)</option>
                      <option value={52}>52 (Weekly)</option>
                      <option value={365}>365 (Daily)</option>
                    </select>
                  </div>

                  {/* Payment Timing */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Timing
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPMTatBeginning(false)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          !PMTatBeginning
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        End
                      </button>
                      <button
                        onClick={() => setPMTatBeginning(true)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          PMTatBeginning
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Beginning
                      </button>
                    </div>
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
              {/* Result Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Calculated {getSolveForLabel(solveFor)}
                </div>
                <div className="text-5xl font-bold mb-6">
                  {getSolveForValue()}
                </div>

                {/* All Values Summary */}
                <div className="space-y-3 pt-6 border-t border-white/20">
                  {results && (
                    <>
                      {solveFor !== 'N' && (
                        <div className="flex justify-between text-sm">
                          <span className="opacity-75">Periods (N)</span>
                          <span className="font-semibold">
                            {formatNumber(results.N, 2)}
                          </span>
                        </div>
                      )}
                      {solveFor !== 'IY' && (
                        <div className="flex justify-between text-sm">
                          <span className="opacity-75">Rate (I/Y)</span>
                          <span className="font-semibold">
                            {formatNumber(results.IY, 4)}%
                          </span>
                        </div>
                      )}
                      {solveFor !== 'PV' && (
                        <div className="flex justify-between text-sm">
                          <span className="opacity-75">Present Value</span>
                          <span className="font-semibold">
                            {formatCurrency(results.PV)}
                          </span>
                        </div>
                      )}
                      {solveFor !== 'PMT' && (
                        <div className="flex justify-between text-sm">
                          <span className="opacity-75">Payment</span>
                          <span className="font-semibold">
                            {formatCurrency(results.PMT)}
                          </span>
                        </div>
                      )}
                      {solveFor !== 'FV' && (
                        <div className="flex justify-between text-sm">
                          <span className="opacity-75">Future Value</span>
                          <span className="font-semibold">
                            {formatCurrency(results.FV)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Summary Statistics */}
              {results && Math.abs(results.PMT) > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Payment Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <span className="text-gray-600">Total Payments</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {formatCurrency(totalPayments)}
                      </span>
                    </div>
                    {Math.abs(results.PV) > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Principal</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(Math.abs(results.PV))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Interest</span>
                          <span className="font-semibold text-orange-600">
                            {formatCurrency(totalInterest)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Amortization Schedule */}
              {schedule.length > 0 && schedule.length <= 360 && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                    className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-gray-900">
                      Payment Schedule ({schedule.length} periods)
                    </h3>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        isScheduleOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isScheduleOpen && (
                    <div className="px-8 pb-8 max-h-96 overflow-y-auto">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                Period
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
                            {schedule.map((row) => (
                              <tr
                                key={row.period}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-900 font-medium">
                                  {row.period}
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
              Understanding Time Value of Money
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is Time Value of Money (TVM)?
                </h3>
                <p className="mb-4">
                  The Time Value of Money is a fundamental financial concept
                  that states money available today is worth more than the same
                  amount in the future due to its potential earning capacity.
                  This calculator helps you understand the relationship between
                  these five key variables:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>N:</strong> Number of payment periods (e.g., months,
                    years)
                  </li>
                  <li>
                    <strong>I/Y:</strong> Annual interest rate (as a percentage)
                  </li>
                  <li>
                    <strong>PV:</strong> Present Value - the current value of
                    future cash flows
                  </li>
                  <li>
                    <strong>PMT:</strong> Periodic payment amount (use negative
                    for outflows)
                  </li>
                  <li>
                    <strong>FV:</strong> Future Value - the value at a future
                    date
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How to Use This Calculator
                </h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>
                    <strong>Choose what to solve for:</strong> Select which
                    variable you want to calculate (N, I/Y, PV, PMT, or FV)
                  </li>
                  <li>
                    <strong>Enter known values:</strong> Input the values you
                    know for the other four variables
                  </li>
                  <li>
                    <strong>Set payment frequency:</strong> Specify how often
                    payments occur (P/Y) and how often interest compounds (C/Y)
                  </li>
                  <li>
                    <strong>Choose payment timing:</strong> Select whether
                    payments occur at the beginning or end of each period
                  </li>
                  <li>
                    <strong>View results:</strong> The calculator instantly
                    computes the missing variable
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Use Cases
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong>Loan Payments:</strong> Calculate monthly payments
                    (PMT) for a loan given the amount (PV), interest rate (I/Y),
                    and term (N)
                  </div>
                  <div>
                    <strong>Retirement Savings:</strong> Determine how much to
                    save monthly (PMT) to reach a retirement goal (FV)
                  </div>
                  <div>
                    <strong>Investment Growth:</strong> Find out what your
                    investment will grow to (FV) given regular contributions
                    (PMT) and expected return (I/Y)
                  </div>
                  <div>
                    <strong>Payoff Time:</strong> Calculate how long (N) it will
                    take to pay off debt with fixed payments (PMT)
                  </div>
                  <div>
                    <strong>Return on Investment:</strong> Determine the
                    effective interest rate (I/Y) you&apos;re earning on an
                    investment
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Sign Conventions
                    </h3>
                    <p className="mb-3">
                      Financial calculators use a cash flow sign convention:
                    </p>
                    <ul className="space-y-2">
                      <li>
                        • <strong>Negative values</strong> represent money going
                        out (payments, investments, loan amounts received)
                      </li>
                      <li>
                        • <strong>Positive values</strong> represent money
                        coming in (receipts, loan payoffs, future values)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • Results are theoretical and based on the assumption of
                    constant interest rates
                  </li>
                  <li>
                    • Actual financial products may have additional fees or
                    varying interest rates
                  </li>
                  <li>
                    • This calculator works the same way as professional
                    financial calculators (BA II Plus, HP 12CP)
                  </li>
                  <li>
                    • For loans, set FV to 0 (the loan will be fully paid off)
                  </li>
                  <li>
                    • For savings goals, set PV to 0 (starting from zero) or to
                    your current balance
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
