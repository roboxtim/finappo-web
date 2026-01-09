'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Car } from 'lucide-react';
import { calculateAutoLease, formatCurrency } from './utils/calculations';

export default function AutoLeaseCalculator() {
  // Input states
  const [msrp, setMsrp] = useState<number>(50000);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(50000);
  const [downPayment, setDownPayment] = useState<number>(8000);
  const [tradeInValue, setTradeInValue] = useState<number>(5000);
  const [amountOwedOnTradeIn, setAmountOwedOnTradeIn] = useState<number>(0);
  const [leaseTerm, setLeaseTerm] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(6.0);
  const [residualPercent, setResidualPercent] = useState<number>(50);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(6.0);
  const [fees, setFees] = useState<number>(0);

  // Calculated results
  const [results, setResults] = useState({
    monthlyPayment: 0,
    monthlyDepreciationFee: 0,
    monthlyFinanceFee: 0,
    monthlySalesTax: 0,
    adjustedCapCost: 0,
    residualValue: 0,
    totalOfPayments: 0,
    amountAtSigning: 0,
    totalLeaseCost: 0,
    moneyFactor: 0,
    tradeInEquity: 0,
    salesTaxRate: 0,
    fees: 0,
  });

  const performCalculation = useCallback(() => {
    const calculatedResults = calculateAutoLease({
      msrp,
      negotiatedPrice,
      downPayment,
      tradeInValue,
      amountOwedOnTradeIn,
      leaseTerm,
      interestRate,
      residualPercent,
      salesTaxRate,
      fees,
    });
    setResults(calculatedResults);
  }, [
    msrp,
    negotiatedPrice,
    downPayment,
    tradeInValue,
    amountOwedOnTradeIn,
    leaseTerm,
    interestRate,
    residualPercent,
    salesTaxRate,
    fees,
  ]);

  useEffect(() => {
    performCalculation();
  }, [performCalculation]);

  const formatInputValue = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const parseDecimalValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const formatted =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    return formatted ? Number(formatted) : 0;
  };

  return (
    <CalculatorLayout
      title="Auto Lease Calculator"
      description="Calculate your monthly car lease payments and total lease costs"
      icon={<Car className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
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
                Vehicle & Lease Details
              </h2>

              <div className="space-y-6">
                {/* MSRP */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MSRP (Sticker Price)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(msrp)}
                      onChange={(e) => {
                        setMsrp(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Negotiated Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Negotiated Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(negotiatedPrice)}
                      onChange={(e) => {
                        setNegotiatedPrice(parseInputValue(e.target.value));
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

                {/* Amount Owed on Trade-in */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount Owed on Trade-in
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(amountOwedOnTradeIn)}
                      onChange={(e) => {
                        setAmountOwedOnTradeIn(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Lease Term */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lease Term
                  </label>
                  <select
                    value={leaseTerm}
                    onChange={(e) => setLeaseTerm(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value={24}>24 months (2 years)</option>
                    <option value={36}>36 months (3 years)</option>
                    <option value={48}>48 months (4 years)</option>
                    <option value={60}>60 months (5 years)</option>
                  </select>
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
                        setInterestRate(parseDecimalValue(e.target.value));
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Residual Value Percent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Residual Value (% of MSRP)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={residualPercent || ''}
                      onChange={(e) => {
                        setResidualPercent(parseDecimalValue(e.target.value));
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Sales Tax Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sales Tax Rate
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={salesTaxRate || ''}
                      onChange={(e) => {
                        setSalesTaxRate(parseDecimalValue(e.target.value));
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Fees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fees (Acquisition, Doc, etc.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(fees)}
                      onChange={(e) => {
                        setFees(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
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
              {/* Monthly Payment Card */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Monthly Lease Payment
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(results.monthlyPayment)}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Lease Term</div>
                    <div className="text-xl font-semibold mt-1">
                      {leaseTerm} months
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Total of Payments</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(results.totalOfPayments)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Monthly Payment Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Depreciation Fee</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(results.monthlyDepreciationFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">
                      Finance Fee (Interest)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(results.monthlyFinanceFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Sales Tax</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(results.monthlySalesTax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-gray-900">
                      Total Monthly Payment
                    </span>
                    <span className="font-bold text-blue-600 text-xl">
                      {formatCurrency(results.monthlyPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lease Summary */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Lease Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Adjusted Capitalized Cost
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(results.adjustedCapCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Residual Value ({residualPercent}%)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(results.residualValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trade-in Equity</span>
                    <span
                      className={`font-semibold ${
                        results.tradeInEquity >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(results.tradeInEquity)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Money Factor</span>
                    <span className="font-semibold text-gray-900">
                      {results.moneyFactor.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-900">
                      Amount at Signing
                    </span>
                    <span className="font-bold text-blue-600 text-xl">
                      {formatCurrency(results.amountAtSigning)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Includes down payment, fees, minus trade-in equity
                  </div>
                </div>
              </div>

              {/* Total Lease Cost */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Total Lease Cost
                </h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  {formatCurrency(results.totalLeaseCost)}
                </div>
                <div className="text-sm text-gray-600">
                  Total out-of-pocket cost for the entire lease, including
                  amount at signing and all monthly payments
                </div>
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
              How Auto Lease Calculations Work
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Lease Payment Formula
                </h3>
                <p>
                  Your monthly lease payment consists of three main components:
                </p>
                <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-xl text-sm">
                  <div>
                    <strong>Depreciation Fee =</strong> (Net Cap Cost - Residual
                    Value) / Lease Term
                  </div>
                  <div>
                    <strong>Finance Fee =</strong> (Net Cap Cost + Residual
                    Value) × Money Factor
                  </div>
                  <div>
                    <strong>Sales Tax =</strong> (Depreciation Fee + Finance
                    Fee) × Sales Tax Rate
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <strong>Monthly Payment =</strong> Depreciation Fee +
                    Finance Fee + Sales Tax
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <strong>Net Cap Cost:</strong> Negotiated Price - Down
                    Payment - Trade-in Equity + Fees
                  </li>
                  <li>
                    <strong>Money Factor:</strong> (APR / 100) / 24 (converts
                    APR to lease rate)
                  </li>
                  <li>
                    <strong>Residual Value:</strong> MSRP × Residual Percentage
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is an Auto Lease?
                </h3>
                <p className="mb-4">
                  An auto lease is a long-term rental agreement where you pay to
                  drive a vehicle for a set period (typically 24-48 months).
                  Unlike buying, you don&apos;t own the car at the end of the
                  lease term.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Lower Monthly Payments:</strong> Generally 30-60%
                    lower than loan payments
                  </li>
                  <li>
                    <strong>Depreciation:</strong> You only pay for the portion
                    of the car&apos;s value you use
                  </li>
                  <li>
                    <strong>Mileage Limits:</strong> Typical limits are
                    10,000-15,000 miles per year
                  </li>
                  <li>
                    <strong>End-of-Lease Options:</strong> Return the car, buy
                    it, or lease a new vehicle
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Key Lease Terms Explained
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>
                      MSRP (Manufacturer&apos;s Suggested Retail Price):
                    </strong>{' '}
                    The sticker price of the vehicle
                  </li>
                  <li>
                    <strong>Capitalized Cost (Cap Cost):</strong> The price
                    you&apos;re financing - negotiate this like a purchase price
                  </li>
                  <li>
                    <strong>Residual Value:</strong> The car&apos;s estimated
                    value at lease end (higher is better for lower payments)
                  </li>
                  <li>
                    <strong>Money Factor:</strong> The lease interest rate
                    (multiply by 2,400 to convert to APR)
                  </li>
                  <li>
                    <strong>Acquisition Fee:</strong> Administrative fee charged
                    by the leasing company ($300-$1,000)
                  </li>
                  <li>
                    <strong>Disposition Fee:</strong> Fee to return the vehicle
                    at lease end (if not purchasing)
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting a Better Lease Deal
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Negotiate the cap cost:</strong> Treat it like
                    buying - the lower the cap cost, the lower your payment
                  </li>
                  <li>
                    <strong>Look for high residual values:</strong> Vehicles
                    that hold value better have lower depreciation costs
                  </li>
                  <li>
                    <strong>Consider manufacturer incentives:</strong> Special
                    lease deals can significantly reduce your payment
                  </li>
                  <li>
                    <strong>Watch the money factor:</strong> Shop around for the
                    best interest rate
                  </li>
                  <li>
                    <strong>Understand mileage needs:</strong> Extra miles cost
                    $0.15-$0.30 per mile at lease end
                  </li>
                  <li>
                    <strong>Avoid excessive upfront costs:</strong> Keep down
                    payment reasonable (money lost if car is totaled)
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
                    • Actual terms may vary by dealer, manufacturer, and your
                    creditworthiness
                  </li>
                  <li>
                    • Additional costs may include registration, insurance, and
                    excess wear charges
                  </li>
                  <li>
                    • Always read the lease agreement carefully before signing
                  </li>
                  <li>
                    • Gap insurance is highly recommended for leased vehicles
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
