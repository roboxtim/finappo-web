'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Home, ChevronDown } from 'lucide-react';
import {
  calculateHELOC,
  generateAmortizationSchedule,
  type HELOCInputs,
  type HELOCResults,
  type AmortizationRow,
} from './utils/calculations';

export default function HELOCCalculator() {
  // Input states
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [interestRate, setInterestRate] = useState<number>(8);
  const [drawPeriod, setDrawPeriod] = useState<number>(10);
  const [repaymentPeriod, setRepaymentPeriod] = useState<number>(20);

  // Calculated results
  const [results, setResults] = useState<HELOCResults | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationRow[]
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

  const calculate = useCallback(() => {
    const inputs: HELOCInputs = {
      loanAmount,
      interestRate,
      drawPeriod,
      repaymentPeriod,
    };

    const calculatedResults = calculateHELOC(inputs);
    setResults(calculatedResults);

    const schedule = generateAmortizationSchedule(calculatedResults);
    setAmortizationSchedule(schedule);
  }, [loanAmount, interestRate, drawPeriod, repaymentPeriod]);

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

  if (!results) return null;

  const principalPercentage =
    loanAmount > 0
      ? (loanAmount / (loanAmount + results.totalInterest)) * 100
      : 50;

  return (
    <CalculatorLayout
      title="HELOC Calculator"
      description="Calculate payments for your Home Equity Line of Credit"
      icon={<Home className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-teal-600 to-cyan-600"
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
                HELOC Details
              </h2>

              <div className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Line of Credit Amount
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
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Draw Period */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Draw Period
                  </label>
                  <select
                    value={drawPeriod}
                    onChange={(e) => setDrawPeriod(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value={5}>5 years</option>
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Period when you can borrow and make interest-only payments
                  </p>
                </div>

                {/* Repayment Period */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Repayment Period
                  </label>
                  <select
                    value={repaymentPeriod}
                    onChange={(e) => setRepaymentPeriod(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={25}>25 years</option>
                    <option value={30}>30 years</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Period to repay principal and interest after draw period
                    ends
                  </p>
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
              {/* Payment Summary Card */}
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Draw Period Payment
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(results.drawPeriodPayment)}
                    </div>
                    <div className="text-xs opacity-75">
                      Interest-only for {drawPeriod} years
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Repayment Period Payment
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(results.repaymentPeriodPayment)}
                    </div>
                    <div className="text-xs opacity-75">
                      Principal + Interest for {repaymentPeriod} years
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Total Term</div>
                    <div className="text-xl font-semibold mt-1">
                      {drawPeriod + repaymentPeriod} years
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Credit Amount</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(loanAmount)}
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
                      className="bg-teal-500 flex items-center justify-center text-white text-sm font-semibold"
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
                        <div className="w-4 h-4 rounded bg-teal-500"></div>
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
                        {formatCurrency(results.totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total of {results.totalMonths} Payments
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(results.totalPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Draw Period Total</span>
                    <span className="text-gray-700">
                      {formatCurrency(
                        results.drawPeriodPayment * results.drawMonths
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Repayment Period Total
                    </span>
                    <span className="text-gray-700">
                      {formatCurrency(
                        results.repaymentPeriodPayment * results.repaymentMonths
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Over Time Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Balance Over Time
                </h3>

                {/* SVG Chart */}
                <div className="relative h-64 mb-6 ml-16">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-16 w-14 text-right">
                    <span>{formatCurrency(results.totalPayment)}</span>
                    <span>{formatCurrency(results.totalPayment * 0.75)}</span>
                    <span>{formatCurrency(results.totalPayment * 0.5)}</span>
                    <span>{formatCurrency(results.totalPayment * 0.25)}</span>
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
                          stopColor="#14B8A6"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#14B8A6"
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
                                  (cumulativePrincipal / results.totalPayment) *
                                    256;
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
                                    results.totalPayment) *
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
                                  256 -
                                  (cumPrincipal / results.totalPayment) * 256;
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
                                    results.totalPayment) *
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
                                    results.totalPayment) *
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
                                  (cumulativePrincipal / results.totalPayment) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#14B8A6"
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
                                    results.totalPayment) *
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

                        {/* Draw period indicator line */}
                        <line
                          x1={(results.drawMonths / results.totalMonths) * 800}
                          y1="0"
                          x2={(results.drawMonths / results.totalMonths) * 800}
                          y2="256"
                          stroke="#14B8A6"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          opacity="0.5"
                        />
                      </>
                    )}

                    {/* Hover indicator */}
                    {hoveredPoint && (
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
                        {hoveredPoint.month <= results.drawMonths && (
                          <span className="ml-2 text-xs bg-teal-600 px-2 py-0.5 rounded">
                            Draw Period
                          </span>
                        )}
                        {hoveredPoint.month > results.drawMonths && (
                          <span className="ml-2 text-xs bg-cyan-600 px-2 py-0.5 rounded">
                            Repayment
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-teal-500"></div>
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
                  <span className="text-teal-600 font-semibold">
                    Draw Period Ends (Month {results.drawMonths})
                  </span>
                  <span>Month {results.totalMonths}</span>
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
                      End of Draw Period
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(loanAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Final Balance</div>
                    <div className="text-sm font-semibold text-teal-600">
                      $0.00
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Amortization Schedule - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
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
                    Monthly breakdown showing the transition from draw period
                    (interest-only) to repayment period (principal + interest)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">
                            Month
                          </th>
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
                        {amortizationSchedule.map((row) => (
                          <tr
                            key={row.month}
                            className={`hover:bg-gray-50 transition-colors ${
                              row.month === results.drawMonths + 1
                                ? 'bg-teal-50'
                                : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-900 font-medium">
                              {row.month}
                            </td>
                            <td className="px-4 py-3">
                              {row.month <= results.drawMonths ? (
                                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                                  Draw
                                </span>
                              ) : (
                                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                                  Repay
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">
                              {formatCurrency(row.payment)}
                            </td>
                            <td className="px-4 py-3 text-right text-teal-600">
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
      </section>

      {/* Educational Content Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Home Equity Lines of Credit
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a HELOC?
                </h3>
                <p className="mb-4">
                  A Home Equity Line of Credit (HELOC) is a revolving line of
                  credit secured by your home&apos;s equity. Unlike a
                  traditional home equity loan, a HELOC works more like a credit
                  card - you can borrow, repay, and borrow again during the draw
                  period.
                </p>
                <p>
                  HELOCs typically have two distinct phases: the{' '}
                  <strong>draw period</strong> where you can access funds and
                  make interest-only payments, and the{' '}
                  <strong>repayment period</strong> where you can no longer
                  withdraw funds and must repay both principal and interest.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How HELOC Periods Work
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Draw Period (Typically 5-10 years)
                    </h4>
                    <ul className="space-y-2 ml-4">
                      <li>• Borrow up to your credit limit as needed</li>
                      <li>• Repay and borrow again (revolving credit)</li>
                      <li>• Usually requires only interest-only payments</li>
                      <li>• Payment amounts remain relatively stable</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Repayment Period (Typically 10-20 years)
                    </h4>
                    <ul className="space-y-2 ml-4">
                      <li>• Cannot make additional withdrawals</li>
                      <li>• Pay both principal and interest</li>
                      <li>• Monthly payments are typically higher</li>
                      <li>• Balance decreases each month until paid off</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  HELOC vs. Home Equity Loan
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          HELOC
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Home Equity Loan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-medium">Structure</td>
                        <td className="px-4 py-3">Revolving line of credit</td>
                        <td className="px-4 py-3">Lump sum loan</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Interest Rate</td>
                        <td className="px-4 py-3">Variable (usually)</td>
                        <td className="px-4 py-3">Fixed</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Payment</td>
                        <td className="px-4 py-3">Varies by period</td>
                        <td className="px-4 py-3">Fixed monthly payment</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Flexibility</td>
                        <td className="px-4 py-3">Borrow as needed</td>
                        <td className="px-4 py-3">One-time disbursement</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Best For</td>
                        <td className="px-4 py-3">Ongoing expenses</td>
                        <td className="px-4 py-3">One-time large expense</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Uses for HELOCs
                </h3>
                <ul className="space-y-2">
                  <li>
                    <strong>Home Renovations:</strong> Finance improvements that
                    increase property value
                  </li>
                  <li>
                    <strong>Debt Consolidation:</strong> Pay off high-interest
                    credit cards or loans
                  </li>
                  <li>
                    <strong>Education Expenses:</strong> Cover college tuition
                    or educational costs
                  </li>
                  <li>
                    <strong>Emergency Fund:</strong> Access to funds for
                    unexpected expenses
                  </li>
                  <li>
                    <strong>Major Purchases:</strong> Finance large expenses
                    like vehicles or medical bills
                  </li>
                  <li>
                    <strong>Investment Opportunities:</strong> Take advantage of
                    time-sensitive investments
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Benefits and Advantages
                </h3>
                <ul className="space-y-2">
                  <li>
                    • <strong>Lower interest rates</strong> compared to credit
                    cards and personal loans
                  </li>
                  <li>
                    • <strong>Flexibility</strong> to borrow only what you need,
                    when you need it
                  </li>
                  <li>
                    • <strong>Interest-only payments</strong> during draw period
                    keep costs low
                  </li>
                  <li>
                    • <strong>Tax-deductible interest</strong> in some cases
                    (consult tax advisor)
                  </li>
                  <li>
                    • <strong>No closing costs</strong> with many lenders
                  </li>
                  <li>
                    • <strong>Reusable credit line</strong> during the draw
                    period
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Risks and Considerations
                </h3>
                <ul className="space-y-2">
                  <li>
                    • <strong>Variable interest rates</strong> can increase your
                    payment amount
                  </li>
                  <li>
                    • <strong>Your home is collateral</strong> - risk of
                    foreclosure if you default
                  </li>
                  <li>
                    • <strong>Payment shock</strong> when transitioning from
                    draw to repayment period
                  </li>
                  <li>
                    • <strong>Temptation to overborrow</strong> due to easy
                    access to funds
                  </li>
                  <li>
                    • <strong>Fees and costs</strong> including annual fees,
                    early closure fees, and appraisal costs
                  </li>
                  <li>
                    • <strong>Reduced home equity</strong> which may limit
                    future borrowing options
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Typical Requirements
                </h3>
                <ul className="space-y-2">
                  <li>
                    • <strong>Credit Score:</strong> Usually 620 or higher (best
                    rates require 700+)
                  </li>
                  <li>
                    • <strong>Home Equity:</strong> At least 15-20% equity in
                    your home
                  </li>
                  <li>
                    • <strong>Debt-to-Income Ratio:</strong> Typically below 43%
                  </li>
                  <li>
                    • <strong>Income Verification:</strong> Proof of stable,
                    sufficient income
                  </li>
                  <li>
                    • <strong>Home Appraisal:</strong> Required to determine
                    current home value
                  </li>
                  <li>
                    • <strong>Loan-to-Value Ratio:</strong> Most lenders allow
                    up to 80-90% LTV
                  </li>
                </ul>
              </div>

              <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates for planning purposes
                  </li>
                  <li>
                    • Actual rates, terms, and requirements vary by lender and
                    creditworthiness
                  </li>
                  <li>
                    • HELOC rates are typically variable and can change over
                    time
                  </li>
                  <li>
                    • Consider all costs including annual fees, closing costs,
                    and potential rate increases
                  </li>
                  <li>
                    • Consult with a financial advisor before taking out a HELOC
                  </li>
                  <li>
                    • Review the terms carefully and understand the payment
                    schedule
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
