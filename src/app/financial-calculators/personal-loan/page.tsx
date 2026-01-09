'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { CircleDollarSign, ChevronDown } from 'lucide-react';

export default function PersonalLoanCalculator() {
  // Input states
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(6);
  const [loanTerm, setLoanTerm] = useState<number>(36); // months

  // Calculated results
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);

  // Amortization schedule
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
    }>
  >([]);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    month: number;
    balance: number;
    principalPaid: number;
    interestPaid: number;
    x: number;
  } | null>(null);

  const calculateLoan = useCallback(() => {
    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;

    let payment = 0;
    if (monthlyRate === 0) {
      payment = loanAmount / numberOfPayments;
    } else {
      payment =
        (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const total = payment * numberOfPayments;
    const interest = total - loanAmount;

    setMonthlyPayment(payment);
    setTotalPayment(total);
    setTotalInterest(interest);

    // Calculate amortization schedule
    const schedule = [];
    let remainingBalance = loanAmount;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = payment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
      });
    }

    setAmortizationSchedule(schedule);
  }, [loanAmount, interestRate, loanTerm]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

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
    loanAmount > 0 ? (loanAmount / (loanAmount + totalInterest)) * 100 : 50;

  return (
    <CalculatorLayout
      title="Personal Loan Calculator"
      description="Calculate your monthly loan payments and total interest"
      icon={<CircleDollarSign className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-green-500 to-emerald-500"
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
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interest Rate (APR)
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
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors  font-medium"
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
                  <select
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value={6}>6 months</option>
                    <option value={12}>12 months (1 year)</option>
                    <option value={24}>24 months (2 years)</option>
                    <option value={36}>36 months (3 years)</option>
                    <option value={48}>48 months (4 years)</option>
                    <option value={60}>60 months (5 years)</option>
                    <option value={72}>72 months (6 years)</option>
                    <option value={84}>84 months (7 years)</option>
                    <option value={120}>120 months (10 years)</option>
                    <option value={432}>432 months (36 years)</option>
                  </select>
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
              {/* Monthly Payment Card */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Monthly Payment
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(monthlyPayment)}
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
                      {loanTerm} months
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Cost Breakdown
                </h3>

                {/* Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
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
                        <div className="w-4 h-4 rounded bg-green-500"></div>
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
                    <span className="text-gray-600">
                      Total of {loanTerm} Payments
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Balance Over Time Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Loan Balance Over Time
                </h3>

                {/* SVG Chart */}
                <div className="relative h-64 mb-6 ml-16">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-16 w-14 text-right">
                    <span>{formatCurrency(totalPayment)}</span>
                    <span>{formatCurrency(totalPayment * 0.75)}</span>
                    <span>{formatCurrency(totalPayment * 0.5)}</span>
                    <span>{formatCurrency(totalPayment * 0.25)}</span>
                    <span>$0</span>
                  </div>

                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="0 0 800 256"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      if (amortizationSchedule.length === 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 800;
                      const index = Math.round(
                        (x / 800) * (amortizationSchedule.length - 1)
                      );
                      const validIndex = Math.max(
                        0,
                        Math.min(index, amortizationSchedule.length - 1)
                      );

                      // Calculate cumulative values
                      let principalPaid = 0;
                      let interestPaid = 0;
                      for (let i = 0; i <= validIndex; i++) {
                        principalPaid += amortizationSchedule[i].principal;
                        interestPaid += amortizationSchedule[i].interest;
                      }

                      const row = amortizationSchedule[validIndex];
                      const pointX =
                        (validIndex / (amortizationSchedule.length - 1)) * 800;

                      setHoveredPoint({
                        month: row.month,
                        balance: row.balance,
                        principalPaid,
                        interestPaid,
                        x: pointX,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Grid lines */}
                    <g className="opacity-10">
                      {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={256 * y}
                          x2="800"
                          y2={256 * y}
                          stroke="#6B7280"
                          strokeWidth="1"
                        />
                      ))}
                    </g>

                    {/* Gradients */}
                    <defs>
                      <linearGradient
                        id="principalGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity="0.3"
                        />
                      </linearGradient>
                      <linearGradient
                        id="interestGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#F59E0B"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#F59E0B"
                          stopOpacity="0.3"
                        />
                      </linearGradient>
                      <linearGradient
                        id="balanceGradientRemaining"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6B7280"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor="#6B7280"
                          stopOpacity="0.2"
                        />
                      </linearGradient>
                    </defs>

                    {amortizationSchedule.length > 0 && (
                      <>
                        {/* Principal Paid Area (bottom layer) */}
                        <path
                          d={(() => {
                            let cumulativePrincipal = 0;
                            const points = amortizationSchedule
                              .map((row, i) => {
                                cumulativePrincipal += row.principal;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  (cumulativePrincipal / totalPayment) * 256;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#principalGradient)"
                        />

                        {/* Interest Paid Area (middle layer) */}
                        <path
                          d={(() => {
                            let cumulativePrincipal = 0;
                            let cumulativeInterest = 0;
                            const points = amortizationSchedule
                              .map((row, i) => {
                                cumulativePrincipal += row.principal;
                                cumulativeInterest += row.interest;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((cumulativePrincipal + cumulativeInterest) /
                                    totalPayment) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' L ');

                            // Bottom boundary (top of principal area)
                            let cumPrincipal = 0;
                            const bottomPoints = amortizationSchedule
                              .map((row, i) => {
                                cumPrincipal += row.principal;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 - (cumPrincipal / totalPayment) * 256;
                                return `${x},${y}`;
                              })
                              .reverse()
                              .join(' L ');

                            return `M 0,${256 - 0} L ${points} L ${bottomPoints} Z`;
                          })()}
                          fill="url(#interestGradient)"
                        />

                        {/* Remaining Balance Area (top layer) */}
                        <path
                          d={(() => {
                            let cumulativePrincipal = 0;
                            let cumulativeInterest = 0;
                            const points = amortizationSchedule
                              .map((row, i) => {
                                cumulativePrincipal += row.principal;
                                cumulativeInterest += row.interest;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((cumulativePrincipal +
                                    cumulativeInterest +
                                    row.balance) /
                                    totalPayment) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' L ');

                            // Bottom boundary (top of interest area)
                            let cumPrincipal = 0;
                            let cumInterest = 0;
                            const bottomPoints = amortizationSchedule
                              .map((row, i) => {
                                cumPrincipal += row.principal;
                                cumInterest += row.interest;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((cumPrincipal + cumInterest) /
                                    totalPayment) *
                                    256;
                                return `${x},${y}`;
                              })
                              .reverse()
                              .join(' L ');

                            return `M 0,${256 - 0} L ${points} L ${bottomPoints} Z`;
                          })()}
                          fill="url(#balanceGradientRemaining)"
                        />

                        {/* Border lines */}
                        <polyline
                          points={(() => {
                            let cumulativePrincipal = 0;
                            return amortizationSchedule
                              .map((row, i) => {
                                cumulativePrincipal += row.principal;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  (cumulativePrincipal / totalPayment) * 256;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2"
                          opacity="0.8"
                        />
                        <polyline
                          points={(() => {
                            let cumulativePrincipal = 0;
                            let cumulativeInterest = 0;
                            return amortizationSchedule
                              .map((row, i) => {
                                cumulativePrincipal += row.principal;
                                cumulativeInterest += row.interest;
                                const x =
                                  (i / (amortizationSchedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((cumulativePrincipal + cumulativeInterest) /
                                    totalPayment) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2"
                          opacity="0.8"
                        />
                      </>
                    )}

                    {/* Hover indicator */}
                    {hoveredPoint && (
                      <>
                        {/* Vertical line */}
                        <line
                          x1={hoveredPoint.x}
                          y1="0"
                          x2={hoveredPoint.x}
                          y2="256"
                          stroke="#6B7280"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          opacity="0.6"
                        />
                      </>
                    )}
                  </svg>

                  {/* Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-10 shadow-xl"
                      style={{
                        left: `${(hoveredPoint.x / 800) * 100}%`,
                        top: '50%',
                        transform:
                          hoveredPoint.x > 400
                            ? 'translate(-100%, -50%)'
                            : 'translate(10px, -50%)',
                      }}
                    >
                      <div className="font-bold mb-2 text-base">
                        Month {hoveredPoint.month}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-green-500"></div>
                          <span className="text-gray-300 text-xs">
                            Principal Paid:
                          </span>
                          <span className="font-semibold ml-auto">
                            {formatCurrency(hoveredPoint.principalPaid)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-amber-500"></div>
                          <span className="text-gray-300 text-xs">
                            Interest Paid:
                          </span>
                          <span className="font-semibold ml-auto">
                            {formatCurrency(hoveredPoint.interestPaid)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gray-500"></div>
                          <span className="text-gray-300 text-xs">
                            Remaining:
                          </span>
                          <span className="font-semibold ml-auto">
                            {formatCurrency(hoveredPoint.balance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Month 0</span>
                  <span>Month {Math.floor(loanTerm / 2)}</span>
                  <span>Month {loanTerm}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">
                      Starting Balance
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(loanAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Mid-point Balance
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(
                        amortizationSchedule[Math.floor(loanTerm / 2) - 1]
                          ?.balance || 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Final Balance</div>
                    <div className="text-sm font-semibold text-green-600">
                      $0.00
                    </div>
                  </div>
                </div>
              </div>

              {/* Amortization Schedule Accordion */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    Amortization Schedule
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
                              <td className="px-4 py-3 text-right text-green-600">
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
              How Personal Loan Calculations Work
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Monthly Payment Formula
                </h3>
                <p>
                  Your monthly payment is calculated using the standard
                  amortization formula:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl font-mono text-sm">
                  M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <strong>M</strong> = Monthly payment
                  </li>
                  <li>
                    <strong>P</strong> = Principal loan amount
                  </li>
                  <li>
                    <strong>r</strong> = Monthly interest rate (annual rate /
                    12)
                  </li>
                  <li>
                    <strong>n</strong> = Number of months
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a Personal Loan?
                </h3>
                <p className="mb-4">
                  A personal loan is an unsecured loan that can be used for
                  various purposes like debt consolidation, home improvements,
                  or unexpected expenses. Unlike auto or home loans, personal
                  loans typically don&apos;t require collateral.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Loan Amount:</strong> Usually ranges from $1,000 to
                    $100,000
                  </li>
                  <li>
                    <strong>Interest Rates:</strong> Typically 6% to 36% APR,
                    depending on credit score
                  </li>
                  <li>
                    <strong>Loan Terms:</strong> Usually 12 to 84 months
                  </li>
                  <li>
                    <strong>Fixed Payments:</strong> Same monthly payment
                    throughout the loan term
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting a Better Personal Loan
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Improve your credit score:</strong> Higher credit
                    scores typically qualify for lower interest rates
                  </li>
                  <li>
                    <strong>Compare multiple lenders:</strong> Shop around with
                    banks, credit unions, and online lenders
                  </li>
                  <li>
                    <strong>Choose shorter loan terms:</strong> While payments
                    are higher, you&apos;ll save money on interest
                  </li>
                  <li>
                    <strong>Consider origination fees:</strong> Some lenders
                    charge upfront fees, factor these into total cost
                  </li>
                  <li>
                    <strong>Make extra payments:</strong> Paying more than the
                    minimum can reduce interest and shorten the loan term
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the
                    information you enter
                  </li>
                  <li>
                    • Actual rates and terms may vary based on creditworthiness
                  </li>
                  <li>
                    • Some lenders may charge origination fees or prepayment
                    penalties
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
