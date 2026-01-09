'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Home, ChevronDown, Info, TrendingUp } from 'lucide-react';
import {
  calculateFHALoan,
  calculateConventionalLoan,
  type FHALoanInputs,
  type FHALoanResults,
  type ConventionalLoanResults,
  FHA_CONFORMING_LIMIT,
} from './__tests__/fhaLoanCalculations';

export default function FHALoanCalculator() {
  // Basic inputs
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(17500);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(3.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [financeUFMIP, setFinanceUFMIP] = useState<boolean>(true);

  // Additional costs
  const [includeOtherCosts, setIncludeOtherCosts] = useState<boolean>(true);
  const [propertyTax, setPropertyTax] = useState<number>(6000);
  const [homeInsurance, setHomeInsurance] = useState<number>(1500);
  const [hoaFee, setHoaFee] = useState<number>(0);
  const [otherCosts, setOtherCosts] = useState<number>(0);

  // Comparison settings
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [conventionalInterestRate, setConventionalInterestRate] =
    useState<number>(6.0);

  // Start date
  const [startMonth, setStartMonth] = useState<number>(0); // 0 = January
  const [startYear, setStartYear] = useState<number>(2026);

  // Results
  const [results, setResults] = useState<FHALoanResults | null>(null);
  const [conventionalResults, setConventionalResults] =
    useState<ConventionalLoanResults | null>(null);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [scheduleView, setScheduleView] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Calculate loan amount from home price and down payment
  const loanAmount = homePrice - downPayment;

  // Update down payment when percentage changes
  const handleDownPaymentPercentChange = (percent: number) => {
    setDownPaymentPercent(percent);
    setDownPayment((homePrice * percent) / 100);
  };

  // Update down payment percentage when dollar amount changes
  const handleDownPaymentChange = (amount: number) => {
    setDownPayment(amount);
    if (homePrice > 0) {
      setDownPaymentPercent((amount / homePrice) * 100);
    }
  };

  // Calculate FHA loan
  const calculate = useCallback(() => {
    const inputs: FHALoanInputs = {
      homePrice,
      downPayment,
      loanTerm,
      interestRate,
      financeUFMIP,
      propertyTax: includeOtherCosts ? propertyTax : 0,
      homeInsurance: includeOtherCosts ? homeInsurance : 0,
      hoaFee: includeOtherCosts ? hoaFee : 0,
      otherCosts: includeOtherCosts ? otherCosts : 0,
      startDate: new Date(startYear, startMonth, 1),
    };

    const fhaResults = calculateFHALoan(inputs);
    setResults(fhaResults);

    // Calculate conventional loan for comparison (assuming 20% down)
    if (showComparison) {
      const convResults = calculateConventionalLoan(
        homePrice,
        20,
        loanTerm,
        conventionalInterestRate
      );
      setConventionalResults(convResults);
    }
  }, [
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    financeUFMIP,
    includeOtherCosts,
    propertyTax,
    homeInsurance,
    hoaFee,
    otherCosts,
    startMonth,
    startYear,
    showComparison,
    conventionalInterestRate,
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate pie chart data
  const getPieChartData = () => {
    if (!results) return [];

    const total = results.monthlyPayment.totalMonthly;
    return [
      {
        label: 'Principal & Interest',
        value: results.monthlyPayment.principalAndInterest,
        percentage: (results.monthlyPayment.principalAndInterest / total) * 100,
        color: '#3B82F6',
      },
      {
        label: 'MIP',
        value: results.monthlyPayment.monthlyMIP,
        percentage: (results.monthlyPayment.monthlyMIP / total) * 100,
        color: '#8B5CF6',
      },
      {
        label: 'Property Tax',
        value: results.monthlyPayment.propertyTax,
        percentage: (results.monthlyPayment.propertyTax / total) * 100,
        color: '#10B981',
      },
      {
        label: 'Home Insurance',
        value: results.monthlyPayment.homeInsurance,
        percentage: (results.monthlyPayment.homeInsurance / total) * 100,
        color: '#F59E0B',
      },
      {
        label: 'HOA Fee',
        value: results.monthlyPayment.hoaFee,
        percentage: (results.monthlyPayment.hoaFee / total) * 100,
        color: '#EC4899',
      },
      {
        label: 'Other Costs',
        value: results.monthlyPayment.otherCosts,
        percentage: (results.monthlyPayment.otherCosts / total) * 100,
        color: '#6B7280',
      },
    ].filter((item) => item.value > 0);
  };

  // Generate annual summary
  const getAnnualSummary = () => {
    if (!results) return [];

    const annual: Array<{
      year: number;
      principal: number;
      interest: number;
      mip: number;
      balance: number;
    }> = [];

    for (
      let year = 1;
      year <= Math.ceil(results.amortizationSchedule.length / 12);
      year++
    ) {
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, results.amortizationSchedule.length);
      const yearData = results.amortizationSchedule.slice(startMonth, endMonth);

      annual.push({
        year,
        principal: yearData.reduce((sum, m) => sum + m.principal, 0),
        interest: yearData.reduce((sum, m) => sum + m.interest, 0),
        mip: yearData.reduce((sum, m) => sum + m.mipPayment, 0),
        balance: yearData[yearData.length - 1]?.balance || 0,
      });
    }

    return annual;
  };

  return (
    <CalculatorLayout
      title="FHA Loan Calculator"
      description="Calculate your FHA loan payments with mortgage insurance premiums"
      icon={<Home className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
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
              className="space-y-6"
            >
              {/* FHA Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  FHA Loan Details
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
                          const value = parseInputValue(e.target.value);
                          setHomePrice(value);
                          if (downPaymentPercent > 0) {
                            setDownPayment((value * downPaymentPercent) / 100);
                          }
                        }}
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Down Payment (minimum 3.5%)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(downPayment)}
                          onChange={(e) => {
                            handleDownPaymentChange(
                              parseInputValue(e.target.value)
                            );
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={downPaymentPercent.toFixed(1)}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            const num = value ? Number(value) : 0;
                            if (num >= 0 && num <= 100) {
                              handleDownPaymentPercentChange(num);
                            }
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Base Loan Amount: {formatCurrency(loanAmount)}
                    </div>
                    {downPaymentPercent < 3.5 && (
                      <div className="mt-2 text-sm text-amber-600">
                        FHA requires minimum 3.5% down payment
                      </div>
                    )}
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
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={30}>30 years</option>
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

                  {/* Finance UFMIP */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={financeUFMIP}
                        onChange={(e) => setFinanceUFMIP(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700">
                          Finance Upfront MIP (1.75%)
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Add $
                          {formatInputValue(Math.round(loanAmount * 0.0175))} to
                          loan
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={startMonth}
                        onChange={(e) => setStartMonth(Number(e.target.value))}
                        className="px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      >
                        {[
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec',
                        ].map((month, i) => (
                          <option key={i} value={i}>
                            {month}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={startYear}
                        onChange={(e) =>
                          setStartYear(Number(e.target.value) || 2026)
                        }
                        className="px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Costs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Additional Costs
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOtherCosts}
                      onChange={(e) => setIncludeOtherCosts(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Include</span>
                  </label>
                </div>

                {includeOtherCosts && (
                  <div className="space-y-6">
                    {/* Property Tax */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Property Tax (annual)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(propertyTax)}
                          onChange={(e) => {
                            setPropertyTax(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatCurrency(propertyTax / 12)}/month
                      </div>
                    </div>

                    {/* Home Insurance */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Home Insurance (annual)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(homeInsurance)}
                          onChange={(e) => {
                            setHomeInsurance(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatCurrency(homeInsurance / 12)}/month
                      </div>
                    </div>

                    {/* HOA Fee */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        HOA Fee (monthly)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(hoaFee)}
                          onChange={(e) => {
                            setHoaFee(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                      </div>
                    </div>

                    {/* Other Costs */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Other Costs (monthly)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(otherCosts)}
                          onChange={(e) => {
                            setOtherCosts(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Utilities, maintenance, etc.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Conventional Loan Comparison */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Compare with Conventional
                  </h2>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      showComparison ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showComparison && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Conventional Interest Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={conventionalInterestRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setConventionalInterestRate(
                              value ? Number(value) : 0
                            );
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Assumes 20% down payment (no PMI)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {results && (
                <>
                  {/* Monthly Payment Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                    <div className="text-sm font-medium opacity-90 mb-2">
                      Monthly Payment
                    </div>
                    <div className="text-5xl font-bold mb-6">
                      {formatCurrency(results.monthlyPayment.totalMonthly)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                      <div>
                        <div className="text-sm opacity-75">
                          Principal & Interest
                        </div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            results.monthlyPayment.principalAndInterest
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Monthly MIP</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.monthlyPayment.monthlyMIP)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FHA Loan Information */}
                  <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-indigo-900 mb-2">
                          FHA Loan Details
                        </p>
                        <ul className="space-y-1 text-indigo-700">
                          <li>
                            Loan-to-Value (LTV):{' '}
                            {results.loanDetails.ltv.toFixed(1)}%
                          </li>
                          <li>
                            Base Loan:{' '}
                            {formatCurrency(results.loanDetails.baseLoanAmount)}
                          </li>
                          {financeUFMIP && (
                            <li>
                              UFMIP Financed:{' '}
                              {formatCurrency(results.loanDetails.ufmipAmount)}
                            </li>
                          )}
                          <li>
                            Total Loan:{' '}
                            {formatCurrency(
                              results.loanDetails.totalLoanAmount
                            )}
                          </li>
                          <li>
                            Annual MIP Rate: {results.loanDetails.annualMIPRate}
                            %
                          </li>
                          {results.loanDetails.baseLoanAmount >
                            FHA_CONFORMING_LIMIT && (
                            <li className="text-amber-700 font-medium">
                              High-balance loan (&gt;$
                              {formatInputValue(FHA_CONFORMING_LIMIT)})
                            </li>
                          )}
                          {results.loanDetails.mipDuration === null ? (
                            <li className="font-medium">
                              MIP for life of loan (LTV &gt; 90%)
                            </li>
                          ) : (
                            <li className="font-medium">
                              MIP removable after 11 years (LTV ≤ 90%)
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Monthly Payment Breakdown
                    </h3>

                    {/* Bar Chart */}
                    <div className="space-y-3 mb-6">
                      {getPieChartData().map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(item.value)}
                            </span>
                          </div>
                          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full flex items-center justify-end px-3 text-white text-xs font-semibold transition-all duration-500"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: item.color,
                              }}
                            >
                              {item.percentage > 10 &&
                                `${item.percentage.toFixed(1)}%`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Monthly</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.monthlyPayment.totalMonthly)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Total of {results.amortizationSchedule.length}{' '}
                          Payments
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(
                            results.totalPayments.totalOfAllPayments
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Interest</span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(results.totalPayments.totalInterest)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total MIP</span>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(results.totalPayments.totalMIP)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payoff Date</span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(results.payoffDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comparison with Conventional */}
                  {showComparison && conventionalResults && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          FHA vs Conventional
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-xl">
                            <div className="text-xs text-blue-600 font-medium mb-1">
                              FHA (3.5% down)
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                              {formatCurrency(
                                results.monthlyPayment.principalAndInterest +
                                  results.monthlyPayment.monthlyMIP
                              )}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              /month (P&I + MIP)
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-xl">
                            <div className="text-xs text-green-600 font-medium mb-1">
                              Conventional (20% down)
                            </div>
                            <div className="text-2xl font-bold text-green-900">
                              {formatCurrency(
                                conventionalResults.monthlyPayment
                              )}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              /month (P&I only)
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Down Payment Difference
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(homePrice * 0.2 - downPayment)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Monthly Difference
                            </span>
                            <span
                              className={`font-semibold ${
                                results.monthlyPayment.principalAndInterest +
                                  results.monthlyPayment.monthlyMIP >
                                conventionalResults.monthlyPayment
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {formatCurrency(
                                Math.abs(
                                  results.monthlyPayment.principalAndInterest +
                                    results.monthlyPayment.monthlyMIP -
                                    conventionalResults.monthlyPayment
                                )
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Total Interest Difference
                            </span>
                            <span
                              className={`font-semibold ${
                                results.totalPayments.totalInterest +
                                  results.totalPayments.totalMIP >
                                conventionalResults.totalInterest
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {formatCurrency(
                                Math.abs(
                                  results.totalPayments.totalInterest +
                                    results.totalPayments.totalMIP -
                                    conventionalResults.totalInterest
                                )
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <strong>FHA Advantages:</strong> Lower down payment
                            (3.5% vs 20%), easier credit requirements, ideal for
                            first-time homebuyers
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Conventional Advantages:</strong> No
                            mortgage insurance with 20% down, potentially lower
                            total cost over time
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loan Balance Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Loan Balance Over Time
                    </h3>

                    {/* SVG Chart */}
                    <div className="relative h-64 mb-6">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 800 256"
                        preserveAspectRatio="none"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x =
                            ((e.clientX - rect.left) / rect.width) * 800;
                          const monthIndex = Math.round(
                            (x / 800) *
                              (results.amortizationSchedule.length - 1)
                          );
                          setHoveredMonth(
                            Math.max(
                              0,
                              Math.min(
                                monthIndex,
                                results.amortizationSchedule.length - 1
                              )
                            )
                          );
                        }}
                        onMouseLeave={() => setHoveredMonth(null)}
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

                        {/* Balance area */}
                        <defs>
                          <linearGradient
                            id="balanceGradient"
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
                              stopOpacity="0.2"
                            />
                          </linearGradient>
                        </defs>

                        <path
                          d={(() => {
                            const points = results.amortizationSchedule
                              .map((row, i) => {
                                const x =
                                  (i /
                                    (results.amortizationSchedule.length - 1)) *
                                  800;
                                const y =
                                  256 -
                                  (row.balance /
                                    results.loanDetails.totalLoanAmount) *
                                    256;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#balanceGradient)"
                        />

                        {/* Balance line */}
                        <polyline
                          points={results.amortizationSchedule
                            .map((row, i) => {
                              const x =
                                (i /
                                  (results.amortizationSchedule.length - 1)) *
                                800;
                              const y =
                                256 -
                                (row.balance /
                                  results.loanDetails.totalLoanAmount) *
                                  256;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />

                        {/* Hover indicator */}
                        {hoveredMonth !== null && (
                          <line
                            x1={
                              (hoveredMonth /
                                (results.amortizationSchedule.length - 1)) *
                              800
                            }
                            y1="0"
                            x2={
                              (hoveredMonth /
                                (results.amortizationSchedule.length - 1)) *
                              800
                            }
                            y2="256"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity="0.6"
                          />
                        )}
                      </svg>

                      {/* Tooltip */}
                      {hoveredMonth !== null && (
                        <div
                          className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-10 shadow-xl"
                          style={{
                            left: `${
                              (hoveredMonth /
                                (results.amortizationSchedule.length - 1)) *
                              100
                            }%`,
                            top: '50%',
                            transform:
                              hoveredMonth >
                              results.amortizationSchedule.length / 2
                                ? 'translate(-100%, -50%)'
                                : 'translate(10px, -50%)',
                          }}
                        >
                          <div className="font-bold mb-2 text-base">
                            Month {hoveredMonth + 1}
                          </div>
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-gray-300 text-xs">
                                Balance:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredMonth]
                                    .balance
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 text-xs">
                                Principal:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredMonth]
                                    .principal
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 text-xs">
                                Interest:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredMonth]
                                    .interest
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-300 text-xs">
                                MIP:
                              </span>
                              <span className="font-semibold ml-2">
                                {formatCurrency(
                                  results.amortizationSchedule[hoveredMonth]
                                    .mipPayment
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Start</span>
                      <span>
                        {Math.floor(results.amortizationSchedule.length / 2)}{' '}
                        months
                      </span>
                      <span>Payoff</span>
                    </div>
                  </div>

                  {/* Amortization Schedule */}
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
                      <div className="px-8 pb-8">
                        {/* View Toggle */}
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setScheduleView('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              scheduleView === 'monthly'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setScheduleView('annual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              scheduleView === 'annual'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Annual
                          </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {scheduleView === 'monthly' ? (
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
                                    MIP
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {results.amortizationSchedule.map((row) => (
                                  <tr
                                    key={row.month}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.month}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900">
                                      {formatCurrencyDetailed(row.payment)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600">
                                      {formatCurrencyDetailed(row.principal)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-orange-600">
                                      {formatCurrencyDetailed(row.interest)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-purple-600">
                                      {formatCurrencyDetailed(row.mipPayment)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                      {formatCurrencyDetailed(row.balance)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                                    Year
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Principal
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Interest
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    MIP
                                  </th>
                                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {getAnnualSummary().map((row) => (
                                  <tr
                                    key={row.year}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.year}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600">
                                      {formatCurrency(row.principal)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-orange-600">
                                      {formatCurrency(row.interest)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-purple-600">
                                      {formatCurrency(row.mip)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                      {formatCurrency(row.balance)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
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
              Understanding FHA Loans
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is an FHA Loan?
                </h3>
                <p className="mb-4">
                  An FHA (Federal Housing Administration) loan is a
                  government-backed mortgage designed to help first-time
                  homebuyers and those with less-than-perfect credit qualify for
                  home financing. FHA loans offer several advantages over
                  conventional mortgages:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Lower Down Payment:</strong> As low as 3.5% with a
                    credit score of 580 or higher
                  </li>
                  <li>
                    <strong>Flexible Credit Requirements:</strong> Available to
                    borrowers with credit scores as low as 500 (with 10% down)
                  </li>
                  <li>
                    <strong>Higher Debt-to-Income Ratios:</strong> More lenient
                    than conventional loans
                  </li>
                  <li>
                    <strong>Gift Funds Allowed:</strong> Down payment can come
                    from family gifts
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  FHA Mortgage Insurance (MIP)
                </h3>
                <p className="mb-4">
                  Unlike conventional loans that require PMI only with less than
                  20% down, FHA loans require two types of mortgage insurance:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>Upfront MIP (UFMIP):</strong> 1.75% of the base loan
                    amount, typically financed into the loan
                  </li>
                  <li>
                    <strong>Annual MIP:</strong> 0.15% to 0.75% depending on
                    loan amount, LTV, and term
                    <ul className="mt-2 ml-6 space-y-1 text-sm">
                      <li>
                        • For 30-year loans with LTV &gt; 95%: 0.55% (standard)
                        or 0.75% (high-balance)
                      </li>
                      <li>
                        • For 15-year loans with LTV &gt; 90%: 0.40% (standard)
                        or 0.65% (high-balance)
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  When Can MIP Be Removed?
                </h3>
                <p className="mb-4">
                  MIP removal rules depend on your loan-to-value ratio at
                  origination:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>LTV &gt; 90%:</strong> MIP is required for the life
                    of the loan
                  </li>
                  <li>
                    <strong>LTV ≤ 90%:</strong> MIP can be canceled after 11
                    years
                  </li>
                  <li>
                    <strong>15-year loans:</strong> More favorable MIP rates and
                    earlier removal
                  </li>
                </ul>
                <p className="mt-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <strong>Tip:</strong> If you put down at least 10%, your MIP
                  can be removed after 11 years, potentially saving thousands in
                  insurance premiums over the life of your loan.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  FHA Loan Limits
                </h3>
                <p className="mb-4">
                  FHA loan limits vary by county but are generally:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Standard Limit:</strong> $726,200 in most areas
                    (2024)
                  </li>
                  <li>
                    <strong>High-Cost Areas:</strong> Up to $1,089,300 in
                    expensive markets
                  </li>
                  <li>
                    <strong>MIP Rates:</strong> Higher for loans above the
                    conforming limit
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Who Should Consider an FHA Loan?
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>First-time homebuyers</strong> who don&apos;t have
                    20% saved for a down payment
                  </li>
                  <li>
                    <strong>Buyers with lower credit scores</strong> (580-680
                    range)
                  </li>
                  <li>
                    <strong>Those with higher debt-to-income ratios</strong>{' '}
                    that might not qualify for conventional loans
                  </li>
                  <li>
                    <strong>Buyers in expensive markets</strong> who need higher
                    loan amounts with flexible terms
                  </li>
                  <li>
                    <strong>Those who can put 10% down</strong> to get MIP
                    removal after 11 years
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting an FHA Loan
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Improve your credit score:</strong> While 580 is the
                    minimum for 3.5% down, higher scores get better rates
                  </li>
                  <li>
                    <strong>Save for a larger down payment:</strong> 10% down
                    allows MIP removal after 11 years
                  </li>
                  <li>
                    <strong>Consider shorter loan terms:</strong> 15-year loans
                    have lower MIP rates
                  </li>
                  <li>
                    <strong>Shop around for lenders:</strong> FHA loans are
                    offered by many banks, credit unions, and online lenders
                  </li>
                  <li>
                    <strong>Factor in all costs:</strong> Include UFMIP, annual
                    MIP, property taxes, and insurance in your budget
                  </li>
                  <li>
                    <strong>Compare with conventional loans:</strong> If you
                    have good credit and 10-20% down, a conventional loan might
                    cost less long-term
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on current FHA
                    guidelines (2024)
                  </li>
                  <li>
                    • Actual rates and terms vary based on credit score, debt
                    ratios, and lender
                  </li>
                  <li>
                    • MIP rates and loan limits are subject to change by FHA
                  </li>
                  <li>
                    • Property must meet FHA appraisal standards and be your
                    primary residence
                  </li>
                  <li>
                    • Consult with an FHA-approved lender for accurate quotes
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
