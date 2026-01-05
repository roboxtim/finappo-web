'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import {
  Home,
  DollarSign,
  TrendingUp,
  Calculator,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  PieChart,
  BarChart3,
  Info
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
  type EquityDetails as EquityDetailsType
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
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationRow[]>([]);
  const [equityDetails, setEquityDetails] = useState<EquityDetailsType | null>(null);
  const [qualification, setQualification] = useState<{ qualified: boolean; message: string } | null>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<'calculator' | 'equity'>('calculator');
  const [scheduleView, setScheduleView] = useState<'monthly' | 'annual'>('monthly');
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Calculate loan details
  const calculateLoan = useCallback(() => {
    const details = calculateLoanDetails(loanAmount, interestRate, loanTerm);
    setMonthlyPayment(details.monthlyPayment);
    setTotalPayment(details.totalPayment);
    setTotalInterest(details.totalInterest);

    const schedule = calculateAmortizationSchedule(loanAmount, interestRate, loanTerm);
    setAmortizationSchedule(schedule);

    // Calculate equity details
    const equity = calculateEquityDetails(homeValue, mortgageBalance, loanAmount, maxLTV);
    setEquityDetails(equity);

    // Check qualification
    const qualCheck = checkQualification(homeValue, mortgageBalance, loanAmount, maxLTV);
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
  const principalPercentage = totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 0;
  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return (
    <CalculatorLayout
      title="Home Equity Loan Calculator"
      description="Calculate your home equity loan payments, understand LTV ratios, and determine how much you can borrow against your home's equity."
      icon={<Home className="w-6 h-6" />}
      gradient="from-blue-600 to-indigo-600"
    >
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Loan Calculator
          </button>
          <button
            onClick={() => setActiveTab('equity')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'equity'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Equity Analysis
          </button>
        </div>

        {activeTab === 'calculator' ? (
          <>
            {/* Loan Calculator Inputs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formatInputValue(loanAmount)}
                    onChange={(e) => handleNumericInput(e.target.value, setLoanAmount)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="7.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term (Years)
                </label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 years</option>
                  <option value={10}>10 years</option>
                  <option value={15}>15 years</option>
                  <option value={20}>20 years</option>
                  <option value={25}>25 years</option>
                  <option value={30}>30 years</option>
                </select>
              </div>
            </motion.div>

            {/* Results Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Monthly Payment</span>
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(monthlyPayment)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  For {loanTerm * 12} months
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Payment</span>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalPayment)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Principal + Interest
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Interest</span>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalInterest)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatPercentage(interestPercentage)} of total
                </div>
              </div>
            </motion.div>

            {/* Payment Breakdown Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Breakdown
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Principal</span>
                    <span className="font-medium">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${principalPercentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
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
                    <span className="font-medium">{formatCurrency(totalInterest)}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${interestPercentage}%` }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatPercentage(interestPercentage)} of total payment
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Equity Analysis Tab */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Value
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formatInputValue(homeValue)}
                    onChange={(e) => handleNumericInput(e.target.value, setHomeValue)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Mortgage Balance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formatInputValue(mortgageBalance)}
                    onChange={(e) => handleNumericInput(e.target.value, setMortgageBalance)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="200,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum LTV Ratio (%)
                </label>
                <select
                  value={maxLTV}
                  onChange={(e) => setMaxLTV(parseInt(e.target.value))}
                  className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={60}>60%</option>
                  <option value={70}>70%</option>
                  <option value={75}>75%</option>
                  <option value={80}>80% (Most Common)</option>
                  <option value={85}>85%</option>
                  <option value={90}>90%</option>
                </select>
              </div>
            </motion.div>

            {/* Equity Analysis Results */}
            {equityDetails && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">Available Equity</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(equityDetails.availableEquity)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Home value - Mortgage
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">Current LTV</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPercentage(equityDetails.currentLTV)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Mortgage / Home value
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">Max Borrowable</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(equityDetails.maxBorrowable)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      At {maxLTV}% LTV limit
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                    <div className="text-sm font-medium text-gray-600 mb-2">CLTV After Loan</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPercentage(equityDetails.cltvAfterLoan)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Combined LTV ratio
                    </div>
                  </div>
                </motion.div>

                {/* Qualification Status */}
                {qualification && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-xl p-6 border ${
                      qualification.qualified
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start">
                      {qualification.qualified ? (
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`font-semibold ${
                          qualification.qualified ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {qualification.qualified ? 'Qualification Status: Likely Eligible' : 'Qualification Status: May Not Qualify'}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          qualification.qualified ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {qualification.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Equity Visualization */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      Equity Breakdown
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Current Mortgage</span>
                        <span className="font-medium">{formatCurrency(mortgageBalance)}</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(mortgageBalance / homeValue) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {((mortgageBalance / homeValue) * 100).toFixed(1)}%
                        </motion.div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">New Loan Amount</span>
                        <span className="font-medium">{formatCurrency(loanAmount)}</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(loanAmount / homeValue) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {((loanAmount / homeValue) * 100).toFixed(1)}%
                        </motion.div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Remaining Equity</span>
                        <span className="font-medium">{formatCurrency(equityDetails.remainingEquity)}</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(equityDetails.remainingEquity / homeValue) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {((equityDetails.remainingEquity / homeValue) * 100).toFixed(1)}%
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPercentage(equityDetails.currentLTV)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Current LTV</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPercentage(equityDetails.cltvAfterLoan)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">CLTV After Loan</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPercentage(maxLTV)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Max LTV Allowed</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}

        {/* Amortization Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <button
            onClick={() => setIsScheduleOpen(!isScheduleOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900">
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
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly View
                </button>
                <button
                  onClick={() => setScheduleView('annual')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                    scheduleView === 'annual'
                      ? 'bg-white text-blue-600 shadow-sm'
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
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Month</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Payment</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Principal</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Interest</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.slice(0, 24).map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-sm text-gray-900">{row.month}</td>
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
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Year</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Total Payment</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Principal</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Interest</th>
                        <th className="text-right py-2 px-4 text-sm font-medium text-gray-700">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annualSummary.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4 text-sm text-gray-900">Year {row.year}</td>
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

              {scheduleView === 'monthly' && amortizationSchedule.length > 24 && (
                <div className="text-center mt-4 text-sm text-gray-500">
                  Showing first 24 months of {amortizationSchedule.length} total payments
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Educational Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100"
        >
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors rounded-t-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Understanding Home Equity Loans
            </h3>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                isInfoOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isInfoOpen && (
            <div className="border-t border-blue-100 p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What is a Home Equity Loan?</h4>
                <p className="text-sm text-gray-700">
                  A home equity loan, also known as a second mortgage, allows you to borrow money using
                  your home&apos;s equity as collateral. You receive the loan amount as a lump sum and repay
                  it over a fixed term with fixed monthly payments.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Home Equity Loan vs. HELOC</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-1">Home Equity Loan</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Fixed interest rate</li>
                      <li>• Lump sum payment</li>
                      <li>• Fixed monthly payments</li>
                      <li>• Predictable costs</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-1">HELOC</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Variable interest rate</li>
                      <li>• Line of credit to draw from</li>
                      <li>• Flexible repayment</li>
                      <li>• Pay interest only on amount used</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Key Terms Explained</h4>
                <dl className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <dt className="font-medium text-gray-800 text-sm">LTV (Loan-to-Value) Ratio</dt>
                    <dd className="text-sm text-gray-600 mt-1">
                      The percentage of your home&apos;s value that you owe. Calculated as:
                      (Mortgage Balance ÷ Home Value) × 100
                    </dd>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <dt className="font-medium text-gray-800 text-sm">CLTV (Combined Loan-to-Value) Ratio</dt>
                    <dd className="text-sm text-gray-600 mt-1">
                      The total percentage of your home&apos;s value that you&apos;ll owe after taking the new loan.
                      Calculated as: (Current Mortgage + New Loan) ÷ Home Value × 100
                    </dd>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <dt className="font-medium text-gray-800 text-sm">Home Equity</dt>
                    <dd className="text-sm text-gray-600 mt-1">
                      The portion of your home that you own outright.
                      Calculated as: Home Value - Mortgage Balance
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Benefits & Risks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h5 className="font-medium text-green-900 mb-2">Benefits</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Lower interest rates than personal loans</li>
                      <li>• Fixed payments make budgeting easier</li>
                      <li>• Interest may be tax deductible</li>
                      <li>• Can borrow large amounts</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h5 className="font-medium text-red-900 mb-2">Risks</h5>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Your home is collateral</li>
                      <li>• Closing costs can be expensive</li>
                      <li>• Reduces home equity</li>
                      <li>• Risk of foreclosure if you can&apos;t pay</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Typical Requirements</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Credit Score:</strong> Usually 620 or higher (better rates with 740+)</li>
                  <li>• <strong>Home Equity:</strong> At least 15-20% equity in your home</li>
                  <li>• <strong>Debt-to-Income:</strong> Typically below 43%</li>
                  <li>• <strong>LTV Limit:</strong> Most lenders cap at 80-85% combined LTV</li>
                  <li>• <strong>Income:</strong> Stable employment and income verification</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </CalculatorLayout>
  );
}