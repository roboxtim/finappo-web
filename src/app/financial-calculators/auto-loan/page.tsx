'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Car } from 'lucide-react';

export default function AutoLoanCalculator() {
  // Input states
  const [autoPrice, setAutoPrice] = useState<number>(50000);
  const [downPayment, setDownPayment] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [loanTerm, setLoanTerm] = useState<number>(60); // months
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [salesTax, setSalesTax] = useState<number>(7);
  const [otherFees, setOtherFees] = useState<number>(2500);
  const [includeTaxFeesInLoan, setIncludeTaxFeesInLoan] =
    useState<boolean>(false);

  // Calculated results
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalLoanAmount, setTotalLoanAmount] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
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

  const calculateLoan = useCallback(() => {
    // Calculate loan amount
    const carPriceAfterTrade = autoPrice - tradeInValue;
    const taxAmount = (carPriceAfterTrade * salesTax) / 100;

    let loanAmount: number;
    if (includeTaxFeesInLoan) {
      // Include tax and fees in the loan
      const totalAmountNeeded = carPriceAfterTrade + taxAmount + otherFees;
      loanAmount = totalAmountNeeded - downPayment;
    } else {
      // Tax and fees paid upfront, not included in loan
      loanAmount = carPriceAfterTrade - downPayment;
    }

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

    const totalPayments = payment * numberOfPayments;
    const interest = totalPayments - loanAmount;
    const total = totalPayments + downPayment;

    setMonthlyPayment(payment);
    setTotalLoanAmount(loanAmount);
    setTotalInterest(interest);
    setTotalCost(total);

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
        balance: Math.max(0, remainingBalance), // Prevent negative balance due to rounding
      });
    }

    setAmortizationSchedule(schedule);
  }, [
    autoPrice,
    downPayment,
    interestRate,
    loanTerm,
    tradeInValue,
    salesTax,
    otherFees,
    includeTaxFeesInLoan,
  ]);

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
    totalLoanAmount > 0
      ? (totalLoanAmount / (totalLoanAmount + totalInterest)) * 100
      : 50;

  return (
    <CalculatorLayout
      title="Auto Loan Calculator"
      description="Calculate your monthly car payments and total loan cost"
      icon={<Car className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
    >
      {/* Calculator Section */}
      <section className="py-4 lg:py-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Auto Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(autoPrice)}
                      onChange={(e) => {
                        setAutoPrice(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Down Payment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Down Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(downPayment)}
                      onChange={(e) => {
                        setDownPayment(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {autoPrice > 0
                      ? ((downPayment / autoPrice) * 100).toFixed(1)
                      : 0}
                    % of auto price
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
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
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
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value={24}>24 months (2 years)</option>
                    <option value={36}>36 months (3 years)</option>
                    <option value={48}>48 months (4 years)</option>
                    <option value={60}>60 months (5 years)</option>
                    <option value={72}>72 months (6 years)</option>
                    <option value={84}>84 months (7 years)</option>
                  </select>
                </div>

                {/* Trade-in Value */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trade-in Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(tradeInValue)}
                      onChange={(e) => {
                        setTradeInValue(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Sales Tax */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sales Tax
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salesTax || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setSalesTax(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Other Fees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title, Registration & Other Fees
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(otherFees)}
                      onChange={(e) => {
                        setOtherFees(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Include Tax & Fees Checkbox */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTaxFeesInLoan}
                      onChange={(e) =>
                        setIncludeTaxFeesInLoan(e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Include sales tax & fees in loan
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-gray-500 ml-8">
                    When unchecked, tax and fees are paid upfront along with
                    down payment
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
              {/* Monthly Payment Card */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl">
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
                      {formatCurrency(totalLoanAmount)}
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
                        {formatCurrency(totalLoanAmount)}
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
                    <span className="text-gray-600">Down Payment</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(downPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Total of {loanTerm} Payments
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(monthlyPayment * loanTerm)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total Cost</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {formatCurrency(totalCost)}
                    </span>
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
                  <svg
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      isScheduleOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
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
              How Auto Loan Calculations Work
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
                  What Goes Into Your Loan Amount
                </h3>
                <ol className="space-y-3">
                  <li>
                    <strong>1. Vehicle Price:</strong> The sticker price of the
                    car minus any trade-in value
                  </li>
                  <li>
                    <strong>2. Sales Tax:</strong> Calculated as a percentage of
                    the vehicle price (varies by state)
                  </li>
                  <li>
                    <strong>3. Fees:</strong> Title, registration,
                    documentation, and dealer fees
                  </li>
                  <li>
                    <strong>4. Down Payment:</strong> The amount you pay
                    upfront, which reduces the loan amount
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting the Best Auto Loan
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Make a larger down payment:</strong> Putting 20% or
                    more down reduces your loan amount and monthly payments
                  </li>
                  <li>
                    <strong>Shop around for rates:</strong> Compare offers from
                    banks, credit unions, and online lenders
                  </li>
                  <li>
                    <strong>Consider shorter loan terms:</strong> While monthly
                    payments are higher, you&apos;ll pay less interest overall
                  </li>
                  <li>
                    <strong>Check your credit score:</strong> A higher credit
                    score typically qualifies you for better interest rates
                  </li>
                  <li>
                    <strong>Factor in total cost:</strong> Don&apos;t just look
                    at monthly payments—consider the total amount you&apos;ll
                    pay over the life of the loan
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the
                    information you enter
                  </li>
                  <li>
                    • Actual loan terms may vary based on creditworthiness and
                    lender requirements
                  </li>
                  <li>
                    • Insurance, fuel, maintenance, and other ownership costs
                    are not included
                  </li>
                  <li>
                    • Always read the fine print and understand all terms before
                    signing a loan agreement
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
