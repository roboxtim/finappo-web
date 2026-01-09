'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { CreditCard, ChevronDown, Info } from 'lucide-react';
import {
  calculatePaymentSchedule,
  type PaymentInputs,
  type CompoundingFrequency,
  type PaymentType,
} from './__tests__/paymentCalculations';

export default function PaymentCalculator() {
  // Input states
  const [presentValue, setPresentValue] = useState<number>(200000);
  const [futureValue, setFutureValue] = useState<number>(0);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(6);
  const [years, setYears] = useState<number>(15);
  const [compounding, setCompounding] =
    useState<CompoundingFrequency>('monthly');
  const [paymentType, setPaymentType] = useState<PaymentType>('end');

  // Calculated results
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [schedule, setSchedule] = useState<
    Array<{
      period: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
      cumulativePrincipal: number;
      cumulativeInterest: number;
    }>
  >([]);

  // UI states
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [showBalloonInfo, setShowBalloonInfo] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    period: number;
    balance: number;
    principalPaid: number;
    interestPaid: number;
    x: number;
  } | null>(null);

  const calculatePayments = useCallback(() => {
    const inputs: PaymentInputs = {
      presentValue,
      futureValue,
      annualInterestRate,
      numberOfPeriods: years * 12,
      compounding,
      paymentType,
    };

    const result = calculatePaymentSchedule(inputs);
    setMonthlyPayment(result.monthlyPayment);
    setTotalPayments(result.totalPayments);
    setTotalInterest(result.totalInterest);
    setSchedule(result.schedule);
  }, [
    presentValue,
    futureValue,
    annualInterestRate,
    years,
    compounding,
    paymentType,
  ]);

  useEffect(() => {
    calculatePayments();
  }, [calculatePayments]);

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
    totalPayments > 0 ? (presentValue / totalPayments) * 100 : 50;

  return (
    <CalculatorLayout
      title="Payment Calculator"
      description="Calculate loan payments with different compounding frequencies and payment types"
      icon={<CreditCard className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
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
                {/* Present Value (Loan Amount) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Present Value (Loan Amount)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(presentValue)}
                      onChange={(e) => {
                        setPresentValue(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Future Value (Balloon Payment) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    Future Value (Balloon Payment)
                    <button
                      onClick={() => setShowBalloonInfo(!showBalloonInfo)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </label>
                  {showBalloonInfo && (
                    <div className="mb-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                      A balloon payment is a large payment due at the end of the
                      loan. Leave at $0 for standard loans.
                    </div>
                  )}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(futureValue)}
                      onChange={(e) => {
                        setFutureValue(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={annualInterestRate || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setAnnualInterestRate(
                          formatted ? Number(formatted) : 0
                        );
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Number of Years */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Years
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Total periods: {years * 12} months
                  </div>
                </div>

                {/* Compounding Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compounding Frequency
                  </label>
                  <select
                    value={compounding}
                    onChange={(e) =>
                      setCompounding(e.target.value as CompoundingFrequency)
                    }
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-Annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Type
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) =>
                      setPaymentType(e.target.value as PaymentType)
                    }
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value="end">End of Period</option>
                    <option value="beginning">Beginning of Period</option>
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
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
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
                      {formatCurrency(presentValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Loan Term</div>
                    <div className="text-xl font-semibold mt-1">
                      {years} years
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Breakdown
                </h3>

                {/* Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
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
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Principal</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(presentValue - futureValue)}
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
                    {futureValue > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-purple-500"></div>
                          <span className="text-sm text-gray-600">
                            Balloon Payment
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(futureValue)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total of {years * 12} Payments
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPayments)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount Paid</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalPayments + futureValue)}
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
                    <span>{formatCurrency(totalPayments + futureValue)}</span>
                    <span>
                      {formatCurrency((totalPayments + futureValue) * 0.75)}
                    </span>
                    <span>
                      {formatCurrency((totalPayments + futureValue) * 0.5)}
                    </span>
                    <span>
                      {formatCurrency((totalPayments + futureValue) * 0.25)}
                    </span>
                    <span>$0</span>
                  </div>

                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="0 0 800 256"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      if (schedule.length === 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 800;
                      const index = Math.round(
                        (x / 800) * (schedule.length - 1)
                      );
                      const validIndex = Math.max(
                        0,
                        Math.min(index, schedule.length - 1)
                      );

                      const row = schedule[validIndex];
                      const pointX = (validIndex / (schedule.length - 1)) * 800;

                      setHoveredPoint({
                        period: row.period,
                        balance: row.balance,
                        principalPaid: row.cumulativePrincipal,
                        interestPaid: row.cumulativeInterest,
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
                        id="principalGradientPayment"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3B82F6"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3B82F6"
                          stopOpacity="0.3"
                        />
                      </linearGradient>
                      <linearGradient
                        id="interestGradientPayment"
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
                        id="balanceGradientRemainingPayment"
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

                    {schedule.length > 0 && (
                      <>
                        {/* Principal Paid Area (bottom layer) */}
                        <path
                          d={(() => {
                            const maxValue = totalPayments + futureValue;
                            const points = schedule
                              .map((row, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  (row.cumulativePrincipal / maxValue) * 256;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#principalGradientPayment)"
                        />

                        {/* Interest Paid Area (middle layer) */}
                        <path
                          d={(() => {
                            const maxValue = totalPayments + futureValue;
                            const points = schedule
                              .map((row, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((row.cumulativePrincipal +
                                    row.cumulativeInterest) /
                                    maxValue) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' L ');

                            const bottomPoints = schedule
                              .map((row, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  (row.cumulativePrincipal / maxValue) * 256;
                                return `${x},${y}`;
                              })
                              .reverse()
                              .join(' L ');

                            return `M 0,${256} L ${points} L ${bottomPoints} Z`;
                          })()}
                          fill="url(#interestGradientPayment)"
                        />

                        {/* Remaining Balance Area (top layer) */}
                        <path
                          d={(() => {
                            const maxValue = totalPayments + futureValue;
                            const points = schedule
                              .map((row, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((row.cumulativePrincipal +
                                    row.cumulativeInterest +
                                    row.balance) /
                                    maxValue) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' L ');

                            const bottomPoints = schedule
                              .map((row, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((row.cumulativePrincipal +
                                    row.cumulativeInterest) /
                                    maxValue) *
                                    256;
                                return `${x},${y}`;
                              })
                              .reverse()
                              .join(' L ');

                            return `M 0,${256} L ${points} L ${bottomPoints} Z`;
                          })()}
                          fill="url(#balanceGradientRemainingPayment)"
                        />

                        {/* Border lines */}
                        <polyline
                          points={schedule
                            .map((row, i) => {
                              const maxValue = totalPayments + futureValue;
                              const x = (i / (schedule.length - 1)) * 800;
                              const y =
                                256 -
                                (row.cumulativePrincipal / maxValue) * 256;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          opacity="0.8"
                        />
                        <polyline
                          points={schedule
                            .map((row, i) => {
                              const maxValue = totalPayments + futureValue;
                              const x = (i / (schedule.length - 1)) * 800;
                              const y =
                                256 -
                                ((row.cumulativePrincipal +
                                  row.cumulativeInterest) /
                                  maxValue) *
                                  256;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2"
                          opacity="0.8"
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
                        Period {hoveredPoint.period}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-blue-500"></div>
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
                  <span>Month {Math.floor((years * 12) / 2)}</span>
                  <span>Month {years * 12}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">
                      Starting Balance
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(presentValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Mid-point Balance
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(
                        schedule[Math.floor((years * 12) / 2) - 1]?.balance || 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Final Balance</div>
                    <div className="text-sm font-semibold text-blue-600">
                      {formatCurrency(futureValue)}
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
              Understanding Payment Calculations
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Payment Formula
                </h3>
                <p>
                  This calculator uses the standard annuity formula to compute
                  loan payments:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl font-mono text-sm">
                  PMT = [PV × r × (1 + r)^n] / [(1 + r)^n - 1]
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <strong>PMT</strong> = Payment amount per period
                  </li>
                  <li>
                    <strong>PV</strong> = Present Value (loan amount)
                  </li>
                  <li>
                    <strong>r</strong> = Interest rate per payment period
                  </li>
                  <li>
                    <strong>n</strong> = Total number of payment periods
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Compounding Frequency
                </h3>
                <p className="mb-4">
                  Compounding frequency affects how often interest is calculated
                  and added to the principal:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Monthly:</strong> Interest compounds 12 times per
                    year
                  </li>
                  <li>
                    <strong>Quarterly:</strong> Interest compounds 4 times per
                    year
                  </li>
                  <li>
                    <strong>Semi-Annually:</strong> Interest compounds 2 times
                    per year
                  </li>
                  <li>
                    <strong>Annually:</strong> Interest compounds once per year
                  </li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  More frequent compounding results in slightly higher effective
                  rates and payments.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Payment Type
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>End of Period:</strong> Payments are made at the end
                    of each period (most common for loans)
                  </li>
                  <li>
                    <strong>Beginning of Period:</strong> Payments are made at
                    the start of each period, resulting in slightly lower
                    payment amounts
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Balloon Payments
                </h3>
                <p className="mb-4">
                  A balloon payment is a large payment due at the end of the
                  loan term. When you include a balloon payment:
                </p>
                <ul className="space-y-2">
                  <li>• Monthly payments are lower during the loan term</li>
                  <li>
                    • The balloon amount is paid in full at the final payment
                  </li>
                  <li>• Common in commercial loans and some auto financing</li>
                  <li>
                    • Requires planning to ensure funds are available at
                    maturity
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How to Use This Calculator
                </h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>
                    Enter the <strong>Present Value</strong> (total loan amount)
                  </li>
                  <li>
                    Optionally enter a <strong>Future Value</strong> if you have
                    a balloon payment
                  </li>
                  <li>
                    Input the <strong>Annual Interest Rate</strong> as a
                    percentage
                  </li>
                  <li>
                    Specify the <strong>Number of Years</strong> for the loan
                  </li>
                  <li>
                    Select the <strong>Compounding Frequency</strong> (usually
                    monthly)
                  </li>
                  <li>
                    Choose the <strong>Payment Type</strong> (end of period is
                    standard)
                  </li>
                  <li>Review the calculated monthly payment and total costs</li>
                  <li>
                    Examine the amortization schedule to see payment breakdowns
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator assumes fixed interest rates and equal
                    payment amounts
                  </li>
                  <li>
                    • Actual loan terms may include additional fees or charges
                  </li>
                  <li>
                    • Some loans have prepayment penalties or restrictions
                  </li>
                  <li>
                    • Always verify calculations with your lender before making
                    financial decisions
                  </li>
                  <li>
                    • Consider factors like origination fees, insurance, and
                    taxes in your total cost
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
