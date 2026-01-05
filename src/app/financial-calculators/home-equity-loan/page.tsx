'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import {
  Home,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Info,
} from 'lucide-react';
import {
  calculateLoanDetails,
  calculateAmortizationSchedule,
  calculateEquityDetails,
  checkQualification,
  getAnnualSummary,
  formatCurrency,
  formatPercentage,
  formatNumber,
  parseFormattedNumber,
  type AmortizationRow,
  type EquityDetails as EquityDetailsType,
} from './utils/calculations';

export default function HomeEquityLoanCalculator() {
  // Loan Calculator States
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [loanTerm, setLoanTerm] = useState<number>(10); // years

  // Equity Calculator States
  const [homeValue, setHomeValue] = useState<number>(500000);
  const [mortgageBalance, setMortgageBalance] = useState<number>(200000);
  const [maxLTV, setMaxLTV] = useState<number>(80); // percentage

  // Calculated Results
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationRow[]
  >([]);
  const [equityDetails, setEquityDetails] = useState<EquityDetailsType | null>(
    null
  );
  const [qualification, setQualification] = useState<{
    qualified: boolean;
    message: string;
  } | null>(null);

  // UI States
  const [scheduleView, setScheduleView] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Calculate loan details
  const calculateLoan = useCallback(() => {
    const details = calculateLoanDetails(loanAmount, interestRate, loanTerm);
    setMonthlyPayment(details.monthlyPayment);
    setTotalPayment(details.totalPayment);
    setTotalInterest(details.totalInterest);

    const schedule = calculateAmortizationSchedule(
      loanAmount,
      interestRate,
      loanTerm
    );
    setAmortizationSchedule(schedule);

    // Calculate equity details
    const equity = calculateEquityDetails(
      homeValue,
      mortgageBalance,
      loanAmount,
      maxLTV
    );
    setEquityDetails(equity);

    // Check qualification
    const qualCheck = checkQualification(
      homeValue,
      mortgageBalance,
      loanAmount,
      maxLTV
    );
    setQualification(qualCheck);
  }, [loanAmount, interestRate, loanTerm, homeValue, mortgageBalance, maxLTV]);

  useEffect(() => {
    calculateLoan();
  }, [calculateLoan]);

  // Format input value with commas
  const formatInputValue = (value: number) => {
    if (!value) return '';
    return formatNumber(value);
  };

  // Handle numeric input changes
  const handleNumericInput = (value: string, setter: (val: number) => void) => {
    const numValue = parseFormattedNumber(value);
    if (!isNaN(numValue)) {
      setter(numValue);
    }
  };

  // Get annual summary data
  const annualSummary = getAnnualSummary(amortizationSchedule);

  // Calculate percentages for visualization
  const principalPercentage =
    totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 0;
  const interestPercentage =
    totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return (
    <CalculatorLayout
      title="Home Equity Loan Calculator"
      description="Calculate your home equity loan payments, understand LTV ratios, and determine how much you can borrow against your home's equity."
      icon={<Home className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-orange-600 to-red-600"
    >
      {/* Calculator Section */}
      <section className="py-8 lg:py-12">
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
                Loan & Equity Details
              </h2>

              <div className="space-y-6">
                {/* Home Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Home Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(homeValue)}
                      onChange={(e) =>
                        handleNumericInput(e.target.value, setHomeValue)
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="500,000"
                    />
                  </div>
                </div>

                {/* Current Mortgage Balance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Mortgage Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(mortgageBalance)}
                      onChange={(e) =>
                        handleNumericInput(e.target.value, setMortgageBalance)
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="200,000"
                    />
                  </div>
                </div>

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
                      onChange={(e) =>
                        handleNumericInput(e.target.value, setLoanAmount)
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="100,000"
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
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      placeholder="7.5"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value={5}>5 years</option>
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={25}>25 years</option>
                    <option value={30}>30 years</option>
                  </select>
                </div>

                {/* Maximum LTV Ratio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum LTV Ratio
                  </label>
                  <select
                    value={maxLTV}
                    onChange={(e) => setMaxLTV(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value={60}>60%</option>
                    <option value={70}>70%</option>
                    <option value={75}>75%</option>
                    <option value={80}>80% (Most Common)</option>
                    <option value={85}>85%</option>
                    <option value={90}>90%</option>
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
              <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-8 text-white shadow-xl">
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
                      {loanTerm} years
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Cost Breakdown
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Total Payment
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalPayment)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Total Interest
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalInterest)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown Visualization */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Principal</span>
                        <span className="font-medium">
                          {formatCurrency(loanAmount)}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${principalPercentage}%` }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPercentage(principalPercentage)} of total payment
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Interest</span>
                        <span className="font-medium">
                          {formatCurrency(totalInterest)}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${interestPercentage}%` }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPercentage(interestPercentage)} of total payment
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equity Analysis Results */}
              {equityDetails && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Equity Analysis
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Available Equity
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(equityDetails.availableEquity)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Current LTV
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPercentage(equityDetails.currentLTV)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Max Borrowable
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(equityDetails.maxBorrowable)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        CLTV After Loan
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPercentage(equityDetails.cltvAfterLoan)}
                      </div>
                    </div>
                  </div>

                  {/* Qualification Status */}
                  {qualification && (
                    <div
                      className={`rounded-2xl p-4 border ${
                        qualification.qualified
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        {qualification.qualified ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4
                            className={`font-semibold text-sm ${
                              qualification.qualified
                                ? 'text-green-900'
                                : 'text-red-900'
                            }`}
                          >
                            {qualification.qualified
                              ? 'Likely Eligible'
                              : 'May Not Qualify'}
                          </h4>
                          <p
                            className={`text-xs mt-1 ${
                              qualification.qualified
                                ? 'text-green-700'
                                : 'text-red-700'
                            }`}
                          >
                            {qualification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Equity Visualization */}
                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Current Mortgage</span>
                        <span className="text-xs text-gray-700 font-semibold">
                          {formatCurrency(mortgageBalance)} (
                          {((mortgageBalance / homeValue) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(mortgageBalance / homeValue) * 100}%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-red-400 to-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">New Loan Amount</span>
                        <span className="text-xs text-gray-700 font-semibold">
                          {formatCurrency(loanAmount)} (
                          {((loanAmount / homeValue) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(loanAmount / homeValue) * 100}%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Remaining Equity</span>
                        <span className="text-xs text-gray-700 font-semibold">
                          {formatCurrency(equityDetails.remainingEquity)} (
                          {(
                            (equityDetails.remainingEquity / homeValue) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(equityDetails.remainingEquity / homeValue) * 100}%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.9 }}
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Full Width Section - Amortization Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <button
              onClick={() => setIsScheduleOpen(!isScheduleOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-3xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                Amortization Schedule
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transform transition-transform ${
                  isScheduleOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isScheduleOpen && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setScheduleView('monthly')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                      scheduleView === 'monthly'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly View
                  </button>
                  <button
                    onClick={() => setScheduleView('annual')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                      scheduleView === 'annual'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annual View
                  </button>
                </div>

                <div className="overflow-x-auto">
                  {scheduleView === 'monthly' ? (
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                            Month
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Payment
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Principal
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Interest
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortizationSchedule.slice(0, 24).map((row, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 px-4 text-sm text-gray-900">
                              {row.month}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.payment)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.principal)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.interest)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">
                            Year
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Total Payment
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Principal
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Interest
                          </th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">
                            Ending Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {annualSummary.map((row, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-2 px-4 text-sm text-gray-900">
                              Year {row.year}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.totalPayment)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.totalPrincipal)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.totalInterest)}
                            </td>
                            <td className="py-2 px-4 text-sm text-right text-gray-900">
                              {formatCurrency(row.endingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {scheduleView === 'monthly' &&
                  amortizationSchedule.length > 24 && (
                    <div className="text-center mt-4 text-sm text-gray-500">
                      Showing first 24 months of {amortizationSchedule.length}{' '}
                      total payments
                    </div>
                  )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Educational Description Section */}
      <section className="py-8 lg:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Info className="w-6 h-6 mr-3 text-orange-600" />
                Understanding Home Equity Loans
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-gray-500 transform transition-transform ${
                  isInfoOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isInfoOpen && (
              <div className="border-t border-gray-100 p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* What is a Home Equity Loan */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      What is a Home Equity Loan?
                    </h4>
                    <p className="text-gray-700 mb-4">
                      A home equity loan, also known as a second mortgage,
                      allows you to borrow money using your home&apos;s equity
                      as collateral. You receive the loan amount as a lump sum
                      and repay it over a fixed term with fixed monthly
                      payments.
                    </p>
                    <p className="text-gray-700">
                      Unlike a HELOC (Home Equity Line of Credit), a home equity
                      loan provides a one-time payment with predictable fixed
                      payments, making it ideal for large, one-time expenses
                      like home renovations, debt consolidation, or major
                      purchases.
                    </p>
                  </div>

                  {/* Home Equity Loan vs HELOC */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Home Equity Loan vs. HELOC
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                        <h5 className="font-bold text-gray-900 mb-2">
                          Home Equity Loan
                        </h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Fixed interest rate</li>
                          <li>• Lump sum payment</li>
                          <li>• Fixed monthly payments</li>
                          <li>• Predictable costs</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                        <h5 className="font-bold text-gray-900 mb-2">HELOC</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Variable interest rate</li>
                          <li>• Line of credit</li>
                          <li>• Flexible repayment</li>
                          <li>• Pay interest on used amount</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Terms */}
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Key Terms Explained
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <h5 className="font-bold text-gray-900 mb-2">
                        LTV (Loan-to-Value)
                      </h5>
                      <p className="text-sm text-gray-700">
                        The percentage of your home&apos;s value that you owe.
                        Calculated as: (Mortgage Balance ÷ Home Value) × 100
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h5 className="font-bold text-gray-900 mb-2">
                        CLTV (Combined LTV)
                      </h5>
                      <p className="text-sm text-gray-700">
                        The total percentage of your home&apos;s value after
                        adding the new loan. Calculated as: (Current Mortgage +
                        New Loan) ÷ Home Value × 100
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <h5 className="font-bold text-gray-900 mb-2">
                        Home Equity
                      </h5>
                      <p className="text-sm text-gray-700">
                        The portion of your home that you own outright.
                        Calculated as: Home Value - Mortgage Balance
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits and Risks */}
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Benefits & Risks
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                      <h5 className="font-bold text-green-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Benefits
                      </h5>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>
                          • Lower interest rates than personal loans or credit
                          cards
                        </li>
                        <li>• Fixed payments make budgeting easier</li>
                        <li>
                          • Interest may be tax deductible for home improvements
                        </li>
                        <li>• Can borrow large amounts based on equity</li>
                        <li>• No restrictions on how you use the funds</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                      <h5 className="font-bold text-red-900 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Risks
                      </h5>
                      <ul className="text-sm text-red-800 space-y-2">
                        <li>
                          • Your home is collateral - risk of foreclosure if you
                          can&apos;t pay
                        </li>
                        <li>
                          • Closing costs can range from 2-5% of loan amount
                        </li>
                        <li>
                          • Reduces home equity and increases overall debt
                        </li>
                        <li>
                          • May affect ability to refinance primary mortgage
                        </li>
                        <li>
                          • Home value fluctuations affect available equity
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Typical Requirements */}
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Typical Lender Requirements
                  </h4>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                    <ul className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="font-bold text-gray-900 mr-2">
                          Credit Score:
                        </span>
                        <span>
                          Usually 620 or higher (better rates with 740+)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-gray-900 mr-2">
                          Home Equity:
                        </span>
                        <span>At least 15-20% equity in your home</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-gray-900 mr-2">
                          Debt-to-Income:
                        </span>
                        <span>
                          Typically below 43% (includes new loan payment)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-gray-900 mr-2">
                          CLTV Limit:
                        </span>
                        <span>Most lenders cap at 80-85% combined LTV</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-gray-900 mr-2">
                          Income:
                        </span>
                        <span>
                          Stable employment and income verification required
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-gray-900 mr-2">
                          Appraisal:
                        </span>
                        <span>Current home appraisal usually required</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Common Uses */}
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Common Uses for Home Equity Loans
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                      <h5 className="font-bold text-gray-900 mb-2">
                        Home Improvements
                      </h5>
                      <p className="text-sm text-gray-700">
                        Kitchen remodels, bathroom upgrades, additions, or major
                        repairs that increase home value
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                      <h5 className="font-bold text-gray-900 mb-2">
                        Debt Consolidation
                      </h5>
                      <p className="text-sm text-gray-700">
                        Pay off high-interest credit cards or loans with a
                        lower-rate home equity loan
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                      <h5 className="font-bold text-gray-900 mb-2">
                        Major Expenses
                      </h5>
                      <p className="text-sm text-gray-700">
                        College tuition, medical bills, business investments, or
                        other large one-time costs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
