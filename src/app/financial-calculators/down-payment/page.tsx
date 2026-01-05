'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Home, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  calculateLoanDetails,
  calculateDownPaymentScenarios,
  DownPaymentCalculation,
} from './utils/calculations';

export default function DownPaymentCalculator() {
  // Input states
  const [homePrice, setHomePrice] = useState<number>(300000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [closingCostPercent, setClosingCostPercent] = useState<number>(3);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  // Calculated results
  const [calculation, setCalculation] = useState<DownPaymentCalculation>({
    homePrice: 0,
    downPayment: 0,
    downPaymentPercent: 0,
    loanAmount: 0,
    closingCosts: 0,
    totalCashNeeded: 0,
    monthlyPayment: 0,
    requiresPMI: false,
  });

  // Comparison scenarios
  const [scenarios, setScenarios] = useState<DownPaymentCalculation[]>([]);

  // UI state
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  const calculate = useCallback(() => {
    const result = calculateLoanDetails(
      homePrice,
      downPaymentPercent,
      closingCostPercent,
      interestRate,
      loanTermYears
    );

    setCalculation(result);

    // Calculate comparison scenarios
    const comparisonScenarios = calculateDownPaymentScenarios(
      homePrice,
      closingCostPercent,
      interestRate,
      loanTermYears
    );

    setScenarios(comparisonScenarios);
  }, [
    homePrice,
    downPaymentPercent,
    closingCostPercent,
    interestRate,
    loanTermYears,
  ]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyDetailed = (value: number) => {
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

  return (
    <CalculatorLayout
      title="Down Payment Calculator"
      description="Calculate down payment, monthly mortgage payments, and total cash needed"
      icon={<Home className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-purple-600 to-pink-600"
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
                Home Purchase Details
              </h2>

              <div className="space-y-6">
                {/* Home Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Home Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(homePrice)}
                      onChange={(e) => {
                        setHomePrice(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Down Payment Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Down Payment
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={downPaymentPercent || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        const num = formatted ? Number(formatted) : 0;
                        setDownPaymentPercent(Math.min(100, num));
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {formatCurrency(calculation.downPayment)}
                  </div>
                </div>

                {/* Quick Down Payment Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[3.5, 5, 10, 20].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setDownPaymentPercent(percent)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        downPaymentPercent === percent
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>

                {/* Closing Costs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Closing Costs
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={closingCostPercent || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setClosingCostPercent(
                          formatted ? Number(formatted) : 0
                        );
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Estimated: {formatCurrency(calculation.closingCosts)}
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
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                    <option value={30}>30 years</option>
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
              {/* Total Cash Needed Card */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Total Cash Needed at Closing
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(calculation.totalCashNeeded)}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Down Payment</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(calculation.downPayment)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Closing Costs</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(calculation.closingCosts)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Payment & Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Monthly Mortgage Payment
                </h3>

                <div className="text-4xl font-bold text-purple-600 mb-6">
                  {formatCurrencyDetailed(calculation.monthlyPayment)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Home Price</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(calculation.homePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Loan Amount</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(calculation.loanAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Down Payment</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(calculation.downPayment)} (
                      {calculation.downPaymentPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-gray-900">
                      {interestRate}% APR
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-600">Loan Term</span>
                    <span className="font-semibold text-gray-900">
                      {loanTermYears} years
                    </span>
                  </div>
                </div>
              </div>

              {/* PMI Warning/Success */}
              <div
                className={`rounded-3xl p-6 shadow-sm border ${
                  calculation.requiresPMI
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {calculation.requiresPMI ? (
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4
                      className={`font-bold mb-2 ${
                        calculation.requiresPMI
                          ? 'text-amber-900'
                          : 'text-green-900'
                      }`}
                    >
                      {calculation.requiresPMI
                        ? 'PMI Required'
                        : 'No PMI Required'}
                    </h4>
                    <p
                      className={`text-sm ${
                        calculation.requiresPMI
                          ? 'text-amber-800'
                          : 'text-green-800'
                      }`}
                    >
                      {calculation.requiresPMI
                        ? `With ${calculation.downPaymentPercent}% down, you'll likely need Private Mortgage Insurance (PMI), which typically costs 0.5% to 1% of the loan amount annually. Consider 20% down to avoid PMI.`
                        : `Great! With ${calculation.downPaymentPercent}% down, you avoid PMI, saving hundreds per month.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Down Payment Comparison Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsComparisonOpen(!isComparisonOpen)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    Compare Down Payment Scenarios
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      isComparisonOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isComparisonOpen && (
                  <div className="px-8 pb-8">
                    <div className="text-sm text-gray-600 mb-4">
                      See how different down payment amounts affect your monthly
                      payment and PMI requirement
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Down Payment
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Monthly Payment
                            </th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">
                              PMI
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {scenarios.map((scenario) => (
                            <tr
                              key={scenario.downPaymentPercent}
                              className={`hover:bg-gray-50 transition-colors ${
                                scenario.downPaymentPercent ===
                                downPaymentPercent
                                  ? 'bg-purple-50'
                                  : ''
                              }`}
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {scenario.downPaymentPercent}%
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {formatCurrency(scenario.downPayment)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                                {formatCurrencyDetailed(
                                  scenario.monthlyPayment
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {scenario.requiresPMI ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    No
                                  </span>
                                )}
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
              Understanding Down Payments
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a Down Payment?
                </h3>
                <p className="mb-4">
                  A down payment is the upfront cash payment you make when
                  purchasing a home. It represents your initial equity in the
                  property and reduces the amount you need to borrow. The down
                  payment is typically expressed as a percentage of the
                  home&apos;s purchase price.
                </p>
                <p>
                  For example, on a $300,000 home with a 20% down payment, you
                  would pay $60,000 upfront and finance the remaining $240,000
                  with a mortgage loan.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Why Your Down Payment Matters
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">•</span>
                    <div>
                      <strong>Lower Monthly Payments:</strong> A larger down
                      payment means a smaller loan amount, resulting in lower
                      monthly mortgage payments.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">•</span>
                    <div>
                      <strong>Avoid PMI:</strong> With 20% or more down, you
                      typically avoid Private Mortgage Insurance (PMI), saving
                      $100-$300+ per month.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">•</span>
                    <div>
                      <strong>Better Interest Rates:</strong> Larger down
                      payments often qualify for lower interest rates, saving
                      thousands over the loan term.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">•</span>
                    <div>
                      <strong>Instant Equity:</strong> You immediately own a
                      portion of your home, providing a financial cushion.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">•</span>
                    <div>
                      <strong>Competitive Advantage:</strong> In hot markets,
                      sellers prefer buyers with larger down payments as
                      they&apos;re more likely to secure financing.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Common Down Payment Percentages
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      3% - 3.5% Down (FHA/Conventional)
                    </h4>
                    <p className="text-sm">
                      <strong>FHA Loans:</strong> Require minimum 3.5% down with
                      credit score of 580+. Include mortgage insurance premiums
                      (MIP) for life of loan if less than 10% down.
                      <br />
                      <strong>Conventional:</strong> Some programs allow 3% down
                      for first-time buyers, but require PMI.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      5% - 10% Down
                    </h4>
                    <p className="text-sm">
                      Common for conventional loans. Still requires PMI but
                      shows stronger financial position. May qualify for better
                      interest rates than 3% down.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      20% Down (Sweet Spot)
                    </h4>
                    <p className="text-sm">
                      The traditional standard that avoids PMI. Offers best
                      interest rates and lowest monthly payments. Shows
                      financial stability to lenders and sellers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      25%+ Down
                    </h4>
                    <p className="text-sm">
                      Provides maximum savings and lowest rates. Particularly
                      important for jumbo loans ($766,550+ in most areas). May
                      help win bidding wars.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Understanding Closing Costs
                </h3>
                <p className="mb-4">
                  In addition to your down payment, you&apos;ll need cash for
                  closing costs, typically 2% to 5% of the home price. These
                  costs cover:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Loan origination fees and points</li>
                  <li>• Appraisal and home inspection fees</li>
                  <li>• Title insurance and search fees</li>
                  <li>• Escrow and attorney fees</li>
                  <li>• Property taxes and homeowners insurance (prepaid)</li>
                  <li>• HOA fees (if applicable)</li>
                  <li>• Recording and transfer fees</li>
                </ul>
                <p className="mt-4 text-sm">
                  Our calculator uses 3% as a standard estimate, but actual
                  costs vary by location and lender. Always get a Loan Estimate
                  from your lender for accurate figures.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Saving for a Down Payment
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">1.</span>
                    <div>
                      <strong>Set a specific goal:</strong> Use this calculator
                      to determine your target amount and timeline.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">2.</span>
                    <div>
                      <strong>Automate savings:</strong> Set up automatic
                      transfers to a dedicated high-yield savings account.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">3.</span>
                    <div>
                      <strong>Reduce expenses:</strong> Cut unnecessary spending
                      and redirect funds to your down payment fund.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">4.</span>
                    <div>
                      <strong>Increase income:</strong> Consider side hustles or
                      asking for a raise to accelerate savings.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">5.</span>
                    <div>
                      <strong>Windfall money:</strong> Direct tax refunds,
                      bonuses, and gifts toward your down payment.
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-purple-600 font-bold">6.</span>
                    <div>
                      <strong>Explore assistance programs:</strong> Research
                      first-time homebuyer programs in your area.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Down Payment Assistance Programs
                </h3>
                <p className="mb-4">
                  Many buyers qualify for assistance programs that can help with
                  down payments and closing costs:
                </p>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>First-Time Homebuyer Programs:</strong> Many states
                    and cities offer grants or low-interest loans to first-time
                    buyers.
                  </li>
                  <li>
                    <strong>VA Loans:</strong> Veterans and active military can
                    purchase with $0 down payment and no PMI.
                  </li>
                  <li>
                    <strong>USDA Loans:</strong> For rural and suburban
                    properties, offering $0 down payment for eligible buyers.
                  </li>
                  <li>
                    <strong>State Housing Finance Agencies:</strong> Provide
                    grants, forgivable loans, or deferred-payment loans for down
                    payments.
                  </li>
                  <li>
                    <strong>Employer Assistance:</strong> Some companies offer
                    homebuying assistance as an employee benefit.
                  </li>
                  <li>
                    <strong>IRA Withdrawal:</strong> First-time buyers can
                    withdraw up to $10,000 from traditional IRA penalty-free for
                    a home purchase.
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • This calculator provides estimates for planning purposes
                    only
                  </li>
                  <li>
                    • Actual monthly payments may include property taxes,
                    homeowners insurance, and HOA fees
                  </li>
                  <li>
                    • PMI costs typically range from 0.5% to 1% of loan amount
                    annually
                  </li>
                  <li>
                    • Interest rates and terms depend on credit score,
                    debt-to-income ratio, and market conditions
                  </li>
                  <li>
                    • Always get pre-approved before house hunting to know your
                    true budget
                  </li>
                  <li>
                    • Consult with a mortgage professional for personalized
                    advice
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Additional Information Accordion */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">
                How Down Payment Calculations Work
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-gray-600 transition-transform ${
                  isInfoOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isInfoOpen && (
              <div className="px-8 pb-8">
                <div className="space-y-4 text-gray-600">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Monthly Payment Formula
                    </h4>
                    <p className="mb-3">
                      The monthly mortgage payment is calculated using the
                      standard amortization formula:
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm mb-3">
                      M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <strong>M</strong> = Monthly payment (principal and
                        interest)
                      </li>
                      <li>
                        <strong>P</strong> = Principal loan amount (home price -
                        down payment)
                      </li>
                      <li>
                        <strong>r</strong> = Monthly interest rate (annual rate
                        / 12)
                      </li>
                      <li>
                        <strong>n</strong> = Total number of payments (years ×
                        12)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Down Payment Calculation
                    </h4>
                    <p className="text-sm">
                      Down Payment = Home Price × Down Payment Percentage
                      <br />
                      Loan Amount = Home Price - Down Payment
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Total Cash Needed
                    </h4>
                    <p className="text-sm">
                      Total Cash Needed = Down Payment + Closing Costs
                      <br />
                      Closing Costs = Home Price × Closing Cost Percentage
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      PMI Requirement
                    </h4>
                    <p className="text-sm">
                      Private Mortgage Insurance (PMI) is typically required
                      when down payment is less than 20% of the home price. This
                      protects the lender if you default on the loan. Once you
                      reach 20% equity, you can usually request PMI removal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
