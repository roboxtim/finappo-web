'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Info, TrendingUp, Award, Shield } from 'lucide-react';
import {
  calculateVALoan,
  calculateConventionalLoan,
  calculateFHALoan,
  type VALoanInputs,
  type VALoanResults,
  type ConventionalLoanResults,
  type FHALoanResults,
  type ServiceType,
  type LoanUsage,
} from './__tests__/vaLoanCalculations';

export default function VALoanCalculator() {
  // Basic inputs
  const [homePrice, setHomePrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(0);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);

  // VA-specific inputs
  const [serviceType, setServiceType] = useState<ServiceType>('regular');
  const [loanUsage, setLoanUsage] = useState<LoanUsage>('first');
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [financeFundingFee, setFinanceFundingFee] = useState<boolean>(true);

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
  const [fhaInterestRate, setFHAInterestRate] = useState<number>(6.5);

  // Start date
  const [startMonth, setStartMonth] = useState<number>(0);
  const [startYear, setStartYear] = useState<number>(2026);

  // Results
  const [results, setResults] = useState<VALoanResults | null>(null);
  const [conventionalResults, setConventionalResults] =
    useState<ConventionalLoanResults | null>(null);
  const [fhaResults, setFHAResults] = useState<FHALoanResults | null>(null);

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

  // Calculate VA loan
  const calculate = useCallback(() => {
    const inputs: VALoanInputs = {
      homePrice,
      downPayment,
      loanTerm,
      interestRate,
      serviceType,
      loanUsage,
      isDisabled,
      financeFundingFee,
      propertyTax: includeOtherCosts ? propertyTax : 0,
      homeInsurance: includeOtherCosts ? homeInsurance : 0,
      hoaFee: includeOtherCosts ? hoaFee : 0,
      otherCosts: includeOtherCosts ? otherCosts : 0,
      startDate: new Date(startYear, startMonth, 1),
    };

    const vaResults = calculateVALoan(inputs);
    setResults(vaResults);

    // Calculate comparison loans
    if (showComparison) {
      const convResults = calculateConventionalLoan(
        homePrice,
        20,
        loanTerm,
        conventionalInterestRate
      );
      setConventionalResults(convResults);

      const fhaRes = calculateFHALoan(
        homePrice,
        3.5,
        loanTerm,
        fhaInterestRate
      );
      setFHAResults(fhaRes);
    }
  }, [
    homePrice,
    downPayment,
    loanTerm,
    interestRate,
    serviceType,
    loanUsage,
    isDisabled,
    financeFundingFee,
    includeOtherCosts,
    propertyTax,
    homeInsurance,
    hoaFee,
    otherCosts,
    startMonth,
    startYear,
    showComparison,
    conventionalInterestRate,
    fhaInterestRate,
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
        balance: yearData[yearData.length - 1]?.balance || 0,
      });
    }

    return annual;
  };

  return (
    <CalculatorLayout
      title="VA Loan Calculator"
      description="Calculate your VA mortgage payments and explore the benefits of VA home loans for veterans and active service members"
      icon={<Shield className="w-8 h-8 text-white" />}
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
              {/* VA Loan Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  VA Loan Details
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
                      Down Payment (0% allowed for VA loans)
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
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
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
                      Base Loan Amount: {formatCurrency(loanAmount)}
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
                        className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) =>
                        setServiceType(e.target.value as ServiceType)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    >
                      <option value="regular">Regular Military</option>
                      <option value="reserves">Reserves/National Guard</option>
                    </select>
                  </div>

                  {/* Loan Usage */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      VA Loan Usage
                    </label>
                    <select
                      value={loanUsage}
                      onChange={(e) =>
                        setLoanUsage(e.target.value as LoanUsage)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    >
                      <option value="first">First-Time Use</option>
                      <option value="subsequent">Subsequent Use</option>
                    </select>
                  </div>

                  {/* Disability Exemption */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDisabled}
                        onChange={(e) => setIsDisabled(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">
                            Disabled Veteran (10%+ Service-Related)
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Funding fee is waived for disabled veterans
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Finance Funding Fee */}
                  {!isDisabled && (
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={financeFundingFee}
                          onChange={(e) =>
                            setFinanceFundingFee(e.target.checked)
                          }
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Finance VA Funding Fee
                          </span>
                          {results && (
                            <p className="text-xs text-gray-500 mt-1">
                              Add $
                              {formatInputValue(
                                Math.round(results.loanDetails.fundingFeeAmount)
                              )}{' '}
                              to loan
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  )}

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

              {/* Loan Comparison */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-900">
                    Compare Loan Types
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
                          className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Assumes 20% down payment (no PMI)
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        FHA Interest Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={fhaInterestRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setFHAInterestRate(value ? Number(value) : 0);
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Assumes 3.5% down payment (with MIP)
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
                        <div className="text-sm opacity-75">NO PMI/MIP</div>
                        <div className="text-xl font-semibold mt-1 text-green-300">
                          $0
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VA Loan Benefits */}
                  <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-900 mb-2">
                          VA Loan Benefits
                        </p>
                        <ul className="space-y-1 text-green-700">
                          <li>• No down payment required (0% allowed)</li>
                          <li className="font-semibold">
                            • NO PMI or MIP ever required
                          </li>
                          <li>• Competitive interest rates for veterans</li>
                          <li>• No prepayment penalties</li>
                          <li>
                            • Funding Fee: {results.loanDetails.fundingFeeRate}%
                            {isDisabled && ' (WAIVED for disabled veterans)'}
                          </li>
                          {results.loanDetails.fundingFeeAmount > 0 && (
                            <li>
                              • Funding Fee Amount:{' '}
                              {formatCurrency(
                                results.loanDetails.fundingFeeAmount
                              )}
                              {financeFundingFee && ' (financed into loan)'}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-indigo-900 mb-2">
                          VA Loan Details
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
                          {results.loanDetails.fundingFeeAmount > 0 &&
                            financeFundingFee && (
                              <li>
                                Funding Fee:{' '}
                                {formatCurrency(
                                  results.loanDetails.fundingFeeAmount
                                )}
                              </li>
                            )}
                          <li>
                            Total Loan:{' '}
                            {formatCurrency(
                              results.loanDetails.totalLoanAmount
                            )}
                          </li>
                          <li>
                            Service Type:{' '}
                            {serviceType === 'regular'
                              ? 'Regular Military'
                              : 'Reserves/National Guard'}
                          </li>
                          <li>
                            Usage:{' '}
                            {loanUsage === 'first'
                              ? 'First-Time'
                              : 'Subsequent'}
                          </li>
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
                        <span className="text-gray-600">Payoff Date</span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(results.payoffDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comparison with Conventional and FHA */}
                  {showComparison && conventionalResults && fhaResults && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Loan Type Comparison
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {/* VA Loan */}
                          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-500">
                            <div className="text-xs text-blue-600 font-medium mb-1">
                              VA Loan ({downPaymentPercent.toFixed(1)}% down)
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                              {formatCurrency(
                                results.monthlyPayment.principalAndInterest
                              )}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              /month (NO PMI!)
                            </div>
                          </div>

                          {/* Conventional */}
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="text-xs text-gray-600 font-medium mb-1">
                              Conventional (20% down)
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(
                                conventionalResults.monthlyPayment
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              /month (no PMI)
                            </div>
                          </div>

                          {/* FHA */}
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="text-xs text-gray-600 font-medium mb-1">
                              FHA (3.5% down)
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatCurrency(
                                fhaResults.monthlyPayment +
                                  fhaResults.monthlyMIP
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              /month (with MIP)
                            </div>
                          </div>
                        </div>

                        {/* Comparison Details */}
                        <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
                          <div>
                            <div className="font-semibold text-gray-900 mb-2">
                              Down Payment Required:
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-blue-600 font-semibold">
                                VA: {formatCurrency(downPayment)} (
                                {downPaymentPercent.toFixed(1)}%)
                              </div>
                              <div className="text-gray-600">
                                Conv: {formatCurrency(homePrice * 0.2)} (20%)
                              </div>
                              <div className="text-gray-600">
                                FHA: {formatCurrency(homePrice * 0.035)} (3.5%)
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-gray-900 mb-2">
                              Monthly Mortgage Insurance:
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-green-600 font-semibold">
                                VA: $0 (None!)
                              </div>
                              <div className="text-gray-600">
                                Conv: $0 (20% down)
                              </div>
                              <div className="text-orange-600">
                                FHA: {formatCurrency(fhaResults.monthlyMIP)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-semibold text-gray-900 mb-2">
                              One-Time Fees:
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-blue-600">
                                VA:{' '}
                                {formatCurrency(
                                  results.loanDetails.fundingFeeAmount
                                )}{' '}
                                (funding fee)
                              </div>
                              <div className="text-gray-600">Conv: $0</div>
                              <div className="text-orange-600">
                                FHA: {formatCurrency(fhaResults.ufmip)} (UFMIP)
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-green-900 font-semibold mb-2">
                            VA Loan Advantage:
                          </p>
                          <p className="text-sm text-green-700">
                            No monthly PMI/MIP means you save{' '}
                            <strong>
                              {formatCurrency(fhaResults.monthlyMIP)}/month
                            </strong>{' '}
                            compared to FHA, which equals{' '}
                            <strong>
                              {formatCurrency(fhaResults.monthlyMIP * 12)}/year
                            </strong>{' '}
                            in savings!
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
              Understanding VA Loans
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  What is a VA Loan?
                </h3>
                <p className="mb-4">
                  A VA (Veterans Affairs) loan is a mortgage option available to
                  eligible veterans, active-duty service members, and certain
                  surviving spouses. Backed by the U.S. Department of Veterans
                  Affairs, VA loans offer exceptional benefits that make
                  homeownership more accessible and affordable for those who
                  have served our country.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>No Down Payment Required:</strong> Purchase a home
                    with 0% down
                  </li>
                  <li>
                    <strong>No PMI/MIP Ever:</strong> Save hundreds per month
                    compared to other loan types
                  </li>
                  <li>
                    <strong>Competitive Interest Rates:</strong> Often lower
                    than conventional loans
                  </li>
                  <li>
                    <strong>No Prepayment Penalties:</strong> Pay off your loan
                    early without fees
                  </li>
                  <li>
                    <strong>Flexible Credit Requirements:</strong> More lenient
                    than conventional loans
                  </li>
                  <li>
                    <strong>Disabled Veteran Benefits:</strong> Funding fee
                    waived for veterans with service-related disabilities
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  VA Funding Fee Explained
                </h3>
                <p className="mb-4">
                  The VA funding fee is a one-time payment that helps offset the
                  cost of the VA loan program to taxpayers. The fee varies based
                  on your service type, down payment amount, and whether
                  it&apos;s your first or subsequent use of a VA loan.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          Down Payment
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          First-Time Use
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          Subsequent Use
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">
                          0% - 5%
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          2.15%
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          3.30%
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">
                          5% - 10%
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          1.50%
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          1.50%
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">
                          10%+
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          1.25%
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          1.25%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm bg-green-50 p-3 rounded-lg border border-green-100">
                  <strong>Disabled Veteran Benefit:</strong> If you receive VA
                  compensation for a service-related disability of 10% or
                  higher, the funding fee is completely waived, saving you
                  thousands of dollars.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The Huge Advantage: No PMI/MIP
                </h3>
                <p className="mb-4">
                  The biggest financial benefit of a VA loan is the absence of
                  Private Mortgage Insurance (PMI) or Mortgage Insurance Premium
                  (MIP), regardless of your down payment amount. This can save
                  you hundreds of dollars per month compared to conventional or
                  FHA loans.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-900 mb-2">
                    Example Savings:
                  </p>
                  <p className="text-blue-700">
                    On a $400,000 loan with 3.5% down:
                  </p>
                  <ul className="mt-2 space-y-1 text-blue-700">
                    <li>• FHA with MIP: ~$220/month in mortgage insurance</li>
                    <li>• VA Loan: $0/month in mortgage insurance</li>
                    <li className="font-semibold text-green-700">
                      • Annual Savings: $2,640
                    </li>
                    <li className="font-semibold text-green-700">
                      • 30-Year Savings: $79,200
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Who Qualifies for a VA Loan?
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Veterans:</strong> Those who served on active duty
                    and were discharged under conditions other than dishonorable
                  </li>
                  <li>
                    <strong>Active-Duty Service Members:</strong> Currently
                    serving and meeting minimum service requirements
                  </li>
                  <li>
                    <strong>National Guard & Reserves:</strong> Members who have
                    completed at least 6 years of service
                  </li>
                  <li>
                    <strong>Surviving Spouses:</strong> Un-remarried spouses of
                    veterans who died in service or from a service-related
                    disability
                  </li>
                </ul>
                <p className="mt-4 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <strong>Note:</strong> You&apos;ll need a Certificate of
                  Eligibility (COE) from the VA to apply for a VA loan. Your
                  lender can often help you obtain this.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  VA Loan Limits and Property Requirements
                </h3>
                <p className="mb-4">
                  As of 2020, there is no maximum loan amount for veterans with
                  full entitlement. However, lenders may have their own limits,
                  and you&apos;ll need to meet certain property requirements:
                </p>
                <ul className="space-y-2">
                  <li>• Property must be your primary residence</li>
                  <li>• Must meet VA minimum property requirements (MPRs)</li>
                  <li>• Property must be move-in ready and safe</li>
                  <li>• VA appraisal required to ensure fair market value</li>
                  <li>
                    • Most residential property types eligible (single-family,
                    condos, townhomes)
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Getting the Best VA Loan
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Check your COE early:</strong> Obtain your
                    Certificate of Eligibility before house hunting
                  </li>
                  <li>
                    <strong>Improve your credit score:</strong> While VA loans
                    are flexible, better credit means better rates
                  </li>
                  <li>
                    <strong>Consider a down payment:</strong> Even 5-10% down
                    reduces your funding fee significantly
                  </li>
                  <li>
                    <strong>Shop multiple lenders:</strong> VA-approved lenders
                    compete for your business
                  </li>
                  <li>
                    <strong>Understand your entitlement:</strong> Know if you
                    have full or partial entitlement available
                  </li>
                  <li>
                    <strong>Factor in all costs:</strong> Remember property
                    taxes, insurance, HOA fees, and maintenance
                  </li>
                  <li>
                    <strong>Use your benefit wisely:</strong> VA loans can be
                    used multiple times, even for refinancing
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Why Choose a VA Loan?
                </h3>
                <p className="mb-4">
                  For eligible veterans and service members, VA loans represent
                  one of the best mortgage options available:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    ✓ Save thousands on closing costs with no down payment
                    required
                  </li>
                  <li>✓ Save hundreds monthly with no PMI/MIP payments</li>
                  <li>✓ Build equity faster with competitive interest rates</li>
                  <li>
                    ✓ Achieve homeownership sooner with flexible qualifying
                    standards
                  </li>
                  <li>✓ Enjoy peace of mind with no prepayment penalties</li>
                  <li>
                    ✓ Honor your service with a benefit you&apos;ve earned
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on current VA
                    guidelines (2024)
                  </li>
                  <li>
                    • Actual rates and terms vary based on credit score, debt
                    ratios, and lender
                  </li>
                  <li>• Funding fee rates are subject to change by the VA</li>
                  <li>• Property must meet VA minimum property requirements</li>
                  <li>
                    • Consult with a VA-approved lender for accurate quotes and
                    personalized advice
                  </li>
                  <li>
                    • Consider all aspects of homeownership beyond just the
                    mortgage payment
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
