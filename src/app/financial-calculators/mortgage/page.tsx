'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Home, ChevronDown, Plus, X } from 'lucide-react';
import {
  calculateMortgage,
  type MortgageInputs,
  type ExtraPayments,
  type MortgageResults,
} from './__tests__/mortgageCalculations';

export default function MortgageCalculator() {
  // Basic inputs
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);

  // Additional costs
  const [includeOtherCosts, setIncludeOtherCosts] = useState<boolean>(true);
  const [propertyTax, setPropertyTax] = useState<number>(4800);
  const [homeInsurance, setHomeInsurance] = useState<number>(1500);
  const [pmi, setPmi] = useState<number>(0);
  const [hoaFee, setHoaFee] = useState<number>(0);
  const [otherCosts, setOtherCosts] = useState<number>(333);

  // Extra payments
  const [showExtraPayments, setShowExtraPayments] = useState<boolean>(false);
  const [monthlyExtra, setMonthlyExtra] = useState<number>(0);
  const [monthlyExtraStartMonth, setMonthlyExtraStartMonth] =
    useState<number>(1);
  const [yearlyExtra, setYearlyExtra] = useState<number>(0);
  const [yearlyExtraStartMonth, setYearlyExtraStartMonth] =
    useState<number>(12);
  const [oneTimePayments, setOneTimePayments] = useState<
    Array<{ amount: number; month: number }>
  >([]);

  // Start date
  const [startMonth, setStartMonth] = useState<number>(0); // 0 = January
  const [startYear, setStartYear] = useState<number>(2026);

  // Results
  const [results, setResults] = useState<MortgageResults | null>(null);

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

  // Calculate mortgage
  const calculate = useCallback(() => {
    const inputs: MortgageInputs = {
      homePrice,
      downPayment,
      loanTerm,
      interestRate,
      propertyTax: includeOtherCosts ? propertyTax : 0,
      homeInsurance: includeOtherCosts ? homeInsurance : 0,
      pmi: includeOtherCosts ? pmi : 0,
      hoaFee: includeOtherCosts ? hoaFee : 0,
      otherCosts: includeOtherCosts ? otherCosts : 0,
      startDate: new Date(startYear, startMonth, 1),
    };

    const extraPayments: ExtraPayments = {
      monthlyExtra,
      monthlyExtraStartMonth,
      yearlyExtra,
      yearlyExtraStartMonth,
      oneTimePayments,
    };

    const calculatedResults = calculateMortgage(inputs, extraPayments);
    setResults(calculatedResults);
  }, [
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    includeOtherCosts,
    propertyTax,
    homeInsurance,
    pmi,
    hoaFee,
    otherCosts,
    monthlyExtra,
    monthlyExtraStartMonth,
    yearlyExtra,
    yearlyExtraStartMonth,
    oneTimePayments,
    startMonth,
    startYear,
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

  // Calculate pie chart percentages
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
        label: 'PMI',
        value: results.monthlyPayment.pmi,
        percentage: (results.monthlyPayment.pmi / total) * 100,
        color: '#EF4444',
      },
      {
        label: 'HOA Fee',
        value: results.monthlyPayment.hoaFee,
        percentage: (results.monthlyPayment.hoaFee / total) * 100,
        color: '#8B5CF6',
      },
      {
        label: 'Other Costs',
        value: results.monthlyPayment.otherCosts,
        percentage: (results.monthlyPayment.otherCosts / total) * 100,
        color: '#EC4899',
      },
    ].filter((item) => item.value > 0);
  };

  const addOneTimePayment = () => {
    setOneTimePayments([...oneTimePayments, { amount: 0, month: 12 }]);
  };

  const removeOneTimePayment = (index: number) => {
    setOneTimePayments(oneTimePayments.filter((_, i) => i !== index));
  };

  const updateOneTimePayment = (
    index: number,
    field: 'amount' | 'month',
    value: number
  ) => {
    const updated = [...oneTimePayments];
    updated[index] = { ...updated[index], [field]: value };
    setOneTimePayments(updated);
  };

  // Generate annual summary
  const getAnnualSummary = () => {
    if (!results) return [];

    const annual: Array<{
      year: number;
      principal: number;
      interest: number;
      balance: number;
      totalPayments: number;
    }> = [];

    for (let year = 1; year <= Math.ceil(results.amortizationSchedule.length / 12); year++) {
      const startMonth = (year - 1) * 12;
      const endMonth = Math.min(year * 12, results.amortizationSchedule.length);
      const yearData = results.amortizationSchedule.slice(startMonth, endMonth);

      annual.push({
        year,
        principal: yearData.reduce((sum, m) => sum + m.principal + m.extraPayment, 0),
        interest: yearData.reduce((sum, m) => sum + m.interest, 0),
        balance: yearData[yearData.length - 1]?.balance || 0,
        totalPayments: yearData.reduce(
          (sum, m) => sum + m.payment + m.extraPayment,
          0
        ),
      });
    }

    return annual;
  };

  return (
    <CalculatorLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment and explore different scenarios"
      icon={<Home className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
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
              className="space-y-6"
            >
              {/* Basic Mortgage Parameters */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Mortgage Details
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
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Down Payment
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
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={downPaymentPercent.toFixed(1)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            const num = value ? Number(value) : 0;
                            if (num >= 0 && num <= 100) {
                              handleDownPaymentPercentChange(num);
                            }
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Loan Amount: {formatCurrency(loanAmount)}
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    >
                      <option value={10}>10 years</option>
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={30}>30 years</option>
                    </select>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Interest Rate
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
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {formatCurrency(homeInsurance / 12)}/month
                      </div>
                    </div>

                    {/* PMI */}
                    {downPaymentPercent < 20 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          PMI (annual)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatInputValue(pmi)}
                            onChange={(e) => {
                              setPmi(parseInputValue(e.target.value));
                            }}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatCurrency(pmi / 12)}/month • Required with
                          less than 20% down
                        </div>
                      </div>
                    )}

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
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
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
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Utilities, maintenance, etc.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Payments */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <button
                  onClick={() => setShowExtraPayments(!showExtraPayments)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Extra Payments
                  </h2>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      showExtraPayments ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showExtraPayments && (
                  <div className="mt-6 space-y-6">
                    {/* Monthly Extra Payment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Extra Monthly Payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(monthlyExtra)}
                          onChange={(e) => {
                            setMonthlyExtra(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      {monthlyExtra > 0 && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            Start from month
                          </label>
                          <input
                            type="number"
                            value={monthlyExtraStartMonth}
                            onChange={(e) =>
                              setMonthlyExtraStartMonth(
                                Number(e.target.value) || 1
                              )
                            }
                            min="1"
                            max={loanTerm * 12}
                            className="w-32 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Yearly Extra Payment */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Extra Yearly Payment
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(yearlyExtra)}
                          onChange={(e) => {
                            setYearlyExtra(parseInputValue(e.target.value));
                          }}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                      </div>
                      {yearlyExtra > 0 && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            Start from month
                          </label>
                          <input
                            type="number"
                            value={yearlyExtraStartMonth}
                            onChange={(e) =>
                              setYearlyExtraStartMonth(
                                Number(e.target.value) || 12
                              )
                            }
                            min="1"
                            max={loanTerm * 12}
                            className="w-32 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* One-Time Payments */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          One-Time Payments
                        </label>
                        <button
                          onClick={addOneTimePayment}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {oneTimePayments.length > 0 && (
                        <div className="space-y-3">
                          {oneTimePayments.map((payment, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Amount"
                                  value={formatInputValue(payment.amount)}
                                  onChange={(e) =>
                                    updateOneTimePayment(
                                      index,
                                      'amount',
                                      parseInputValue(e.target.value)
                                    )
                                  }
                                  className="w-full pl-7 pr-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="Month"
                                value={payment.month}
                                onChange={(e) =>
                                  updateOneTimePayment(
                                    index,
                                    'month',
                                    Number(e.target.value) || 1
                                  )
                                }
                                min="1"
                                max={loanTerm * 12}
                                className="w-24 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                              />
                              <button
                                onClick={() => removeOneTimePayment(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
                        <div className="text-sm opacity-75">Principal & Interest</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(
                            results.monthlyPayment.principalAndInterest
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-75">Loan Amount</div>
                        <div className="text-xl font-semibold mt-1">
                          {formatCurrency(results.loanAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown Pie Chart */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Monthly Payment Breakdown
                    </h3>

                    {/* Simple Bar Chart */}
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
                            results.totalPayments.totalMortgagePayment
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
                        <span className="text-gray-600">Payoff Date</span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(results.payoffDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amortization Chart */}
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
                          const x = ((e.clientX - rect.left) / rect.width) * 800;
                          const monthIndex = Math.round(
                            (x / 800) * (results.amortizationSchedule.length - 1)
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
                                  (row.balance / results.loanAmount) * 256;
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
                                (i / (results.amortizationSchedule.length - 1)) *
                                800;
                              const y =
                                256 - (row.balance / results.loanAmount) * 256;
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
                              <thead className="bg-gray-50 sticky top-0">
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
                                {results.amortizationSchedule.map((row) => (
                                  <tr
                                    key={row.month}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                      {row.month}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-900">
                                      {formatCurrencyDetailed(
                                        row.payment + row.extraPayment
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600">
                                      {formatCurrencyDetailed(
                                        row.principal + row.extraPayment
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-orange-600">
                                      {formatCurrencyDetailed(row.interest)}
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
                              <thead className="bg-gray-50 sticky top-0">
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
              Understanding Mortgage Calculations
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Monthly Payment Formula
                </h3>
                <p>
                  Your monthly mortgage payment is calculated using the standard
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
                    <strong>r</strong> = Monthly interest rate (annual rate / 12)
                  </li>
                  <li>
                    <strong>n</strong> = Total number of payments
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What Makes Up Your Monthly Payment?
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Principal & Interest:</strong> The base mortgage
                    payment that pays down your loan
                  </li>
                  <li>
                    <strong>Property Taxes:</strong> Annual property taxes
                    divided by 12 months
                  </li>
                  <li>
                    <strong>Home Insurance:</strong> Required insurance to
                    protect your home
                  </li>
                  <li>
                    <strong>PMI:</strong> Private Mortgage Insurance required if
                    down payment is less than 20%
                  </li>
                  <li>
                    <strong>HOA Fees:</strong> Homeowners association fees if
                    applicable
                  </li>
                  <li>
                    <strong>Other Costs:</strong> Utilities, maintenance, and
                    other ongoing expenses
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Extra Payments Can Save You Money
                </h3>
                <p className="mb-4">
                  Making extra payments toward your principal can significantly
                  reduce the total interest you pay and shorten your loan term:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>Extra Monthly Payments:</strong> Even small
                    additional payments each month can save thousands over the
                    life of the loan
                  </li>
                  <li>
                    <strong>Yearly Lump Sum:</strong> Annual bonuses or tax
                    refunds applied to your mortgage can make a big difference
                  </li>
                  <li>
                    <strong>One-Time Payments:</strong> Windfalls like
                    inheritances or investment gains can dramatically reduce your
                    interest
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting the Best Mortgage
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Improve your credit score:</strong> Higher scores
                    typically qualify for lower interest rates
                  </li>
                  <li>
                    <strong>Save for a larger down payment:</strong> 20% down
                    avoids PMI and may secure better rates
                  </li>
                  <li>
                    <strong>Shop around:</strong> Compare rates from multiple
                    lenders including banks, credit unions, and online lenders
                  </li>
                  <li>
                    <strong>Consider shorter terms:</strong> 15-year mortgages
                    have higher monthly payments but much lower total interest
                  </li>
                  <li>
                    <strong>Get pre-approved:</strong> Know your budget and show
                    sellers you&apos;re a serious buyer
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the information
                    you enter
                  </li>
                  <li>
                    • Actual rates and terms may vary based on credit score,
                    location, and lender
                  </li>
                  <li>
                    • Property taxes and insurance costs can increase over time
                  </li>
                  <li>• PMI can typically be removed once you reach 78% LTV</li>
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
    </CalculatorLayout>
  );
}
