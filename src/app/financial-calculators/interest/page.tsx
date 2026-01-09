'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import {
  Percent,
  ChevronDown,
  Info,
  TrendingUp,
  PiggyBank,
} from 'lucide-react';

type InterestType = 'simple' | 'compound';
type CompoundingFrequency =
  | 'annually'
  | 'semiannually'
  | 'quarterly'
  | 'monthly'
  | 'semimonthly'
  | 'biweekly'
  | 'weekly'
  | 'daily';
type ContributionTiming = 'beginning' | 'end';

export default function InterestCalculator() {
  // Input states
  const [interestType, setInterestType] = useState<InterestType>('compound');
  const [principal, setPrincipal] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(5);
  const [months, setMonths] = useState<number>(0);
  const [compoundingFrequency, setCompoundingFrequency] =
    useState<CompoundingFrequency>('monthly');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [annualContribution, setAnnualContribution] = useState<number>(0);
  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>('end');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [inflationRate, setInflationRate] = useState<number>(0);

  // Calculated results
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [afterTaxAmount, setAfterTaxAmount] = useState<number>(0);
  const [inflationAdjustedAmount, setInflationAdjustedAmount] =
    useState<number>(0);

  // Schedule
  const [schedule, setSchedule] = useState<
    Array<{
      period: number;
      year: number;
      deposit: number;
      interest: number;
      balance: number;
    }>
  >([]);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    period: number;
    balance: number;
    contributions: number;
    interest: number;
    x: number;
  } | null>(null);

  // Helper function to get compounds per year
  const getCompoundsPerYear = (frequency: CompoundingFrequency): number => {
    const frequencyMap: { [key in CompoundingFrequency]: number } = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12,
      semimonthly: 24,
      biweekly: 26,
      weekly: 52,
      daily: 365,
    };
    return frequencyMap[frequency];
  };

  // Main calculation function
  const calculate = useCallback(() => {
    const totalYears = years + months / 12;

    if (interestType === 'simple') {
      // Simple Interest: I = P * r * t
      const interest = principal * (interestRate / 100) * totalYears;
      const total = principal + interest;

      setFinalAmount(total);
      setTotalContributions(principal);
      setTotalInterest(interest);

      // Apply tax to interest
      const afterTaxInterest = interest * (1 - taxRate / 100);
      setAfterTaxAmount(principal + afterTaxInterest);

      // Apply inflation
      const inflationFactor = Math.pow(1 + inflationRate / 100, totalYears);
      setInflationAdjustedAmount(
        (principal + afterTaxInterest) / inflationFactor
      );

      // Simple schedule
      const simpleSchedule = [];
      for (let year = 1; year <= Math.ceil(totalYears); year++) {
        const yearInterest = principal * (interestRate / 100);
        const yearBalance =
          principal + yearInterest * Math.min(year, totalYears);
        simpleSchedule.push({
          period: year,
          year: year,
          deposit: year === 1 ? principal : 0,
          interest: yearInterest * Math.min(1, totalYears - year + 1),
          balance: yearBalance,
        });
      }
      setSchedule(simpleSchedule);
    } else {
      // Compound Interest
      const compoundsPerYear = getCompoundsPerYear(compoundingFrequency);
      const totalPeriods = Math.floor(totalYears * compoundsPerYear);
      const rate = interestRate / 100;
      const periodRate = rate / compoundsPerYear;

      let balance = principal;
      let totalInt = 0;
      let totalContribs = principal;
      const detailedSchedule: typeof schedule = [];

      // Calculate total monthly contribution (monthly + annual/12)
      const effectiveMonthlyContribution =
        monthlyContribution + annualContribution / 12;

      for (let period = 1; period <= totalPeriods; period++) {
        let periodDeposit = 0;

        // Add contributions at beginning of period
        if (
          effectiveMonthlyContribution > 0 &&
          contributionTiming === 'beginning'
        ) {
          // Add monthly contribution every month
          if (compoundsPerYear >= 12) {
            // For monthly or more frequent compounding
            const monthsPassed = Math.floor(
              (period - 1) / (compoundsPerYear / 12)
            );
            const currentMonth = Math.floor(period / (compoundsPerYear / 12));
            if (currentMonth > monthsPassed) {
              balance += effectiveMonthlyContribution;
              periodDeposit = effectiveMonthlyContribution;
              totalContribs += effectiveMonthlyContribution;
            }
          } else {
            // For less than monthly compounding, add proportional amount
            const contributionPerPeriod =
              (effectiveMonthlyContribution * 12) / compoundsPerYear;
            balance += contributionPerPeriod;
            periodDeposit = contributionPerPeriod;
            totalContribs += contributionPerPeriod;
          }
        }

        // Calculate interest for this period (with tax consideration)
        const periodInterest = balance * periodRate;
        const afterTaxPeriodInterest = periodInterest * (1 - taxRate / 100);
        balance += afterTaxPeriodInterest;
        totalInt += afterTaxPeriodInterest;

        // Add contributions at end of period
        if (effectiveMonthlyContribution > 0 && contributionTiming === 'end') {
          // Add monthly contribution every month
          if (compoundsPerYear >= 12) {
            // For monthly or more frequent compounding
            const monthsPassed = Math.floor(
              (period - 1) / (compoundsPerYear / 12)
            );
            const currentMonth = Math.floor(period / (compoundsPerYear / 12));
            if (
              currentMonth > monthsPassed ||
              period % (compoundsPerYear / 12) === 0
            ) {
              balance += effectiveMonthlyContribution;
              periodDeposit = effectiveMonthlyContribution;
              totalContribs += effectiveMonthlyContribution;
            }
          } else {
            // For less than monthly compounding, add proportional amount
            const contributionPerPeriod =
              (effectiveMonthlyContribution * 12) / compoundsPerYear;
            balance += contributionPerPeriod;
            periodDeposit = contributionPerPeriod;
            totalContribs += contributionPerPeriod;
          }
        }

        detailedSchedule.push({
          period,
          year: Math.ceil(period / compoundsPerYear),
          deposit: periodDeposit,
          interest: afterTaxPeriodInterest,
          balance: balance,
        });
      }

      setFinalAmount(balance);
      setTotalContributions(totalContribs);
      setTotalInterest(totalInt);
      setAfterTaxAmount(balance); // Already includes tax in calculation

      // Apply inflation to final amount
      const inflationFactor = Math.pow(1 + inflationRate / 100, totalYears);
      setInflationAdjustedAmount(balance / inflationFactor);

      // Create annual summary for display
      const annualSchedule = [];
      for (let year = 1; year <= Math.ceil(totalYears); year++) {
        const yearPeriods = detailedSchedule.filter((s) => s.year === year);
        if (yearPeriods.length > 0) {
          const lastPeriod = yearPeriods[yearPeriods.length - 1];
          const yearDeposits = yearPeriods.reduce(
            (sum, p) => sum + p.deposit,
            0
          );
          const yearInterest = yearPeriods.reduce(
            (sum, p) => sum + p.interest,
            0
          );

          annualSchedule.push({
            period: year,
            year: year,
            deposit: yearDeposits,
            interest: yearInterest,
            balance: lastPeriod.balance,
          });
        }
      }

      setSchedule(compoundsPerYear === 1 ? detailedSchedule : annualSchedule);
    }
  }, [
    principal,
    interestRate,
    years,
    months,
    interestType,
    compoundingFrequency,
    monthlyContribution,
    annualContribution,
    contributionTiming,
    taxRate,
    inflationRate,
  ]);

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

  const principalPercentage =
    totalContributions > 0 ? (principal / totalContributions) * 100 : 100;
  const contributionsPercentage =
    totalContributions > 0
      ? ((totalContributions - principal) / totalContributions) * 100
      : 0;
  // const interestPercentage = finalAmount > 0 ? (totalInterest / finalAmount) * 100 : 0;

  return (
    <CalculatorLayout
      title="Interest Calculator"
      description="Calculate simple or compound interest with contributions"
      icon={<Percent className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-purple-500 to-pink-500"
    >
      {/* Calculator Section */}
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[45%_55%] gap-8">
            {/* Left Column - Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Investment Details
              </h2>

              {/* Interest Type Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Interest Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInterestType('simple')}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      interestType === 'simple'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Simple Interest
                  </button>
                  <button
                    onClick={() => setInterestType('compound')}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      interestType === 'compound'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Compound Interest
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                {/* Principal Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Investment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(principal)}
                      onChange={(e) =>
                        setPrincipal(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
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

                {/* Investment Length */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Investment Length
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value) || 0)}
                        min="0"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="text-xs text-gray-500 mt-1 block text-center">
                        Years
                      </span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value) || 0)}
                        min="0"
                        max="11"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                      />
                      <span className="text-xs text-gray-500 mt-1 block text-center">
                        Months
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compounding Frequency (only for compound interest) */}
                {interestType === 'compound' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Compound Frequency
                    </label>
                    <select
                      value={compoundingFrequency}
                      onChange={(e) =>
                        setCompoundingFrequency(
                          e.target.value as CompoundingFrequency
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium"
                    >
                      <option value="annually">Annually</option>
                      <option value="semiannually">Semi-annually</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                      <option value="semimonthly">Semi-monthly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                )}

                {/* Contributions Section */}
                {interestType === 'compound' && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <PiggyBank className="w-4 h-4" />
                        Regular Contributions (Optional)
                      </h3>

                      <div className="space-y-4">
                        {/* Monthly Contribution */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Monthly Contribution
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(monthlyContribution)}
                              onChange={(e) =>
                                setMonthlyContribution(
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-8 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                            />
                          </div>
                        </div>

                        {/* Annual Contribution */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Annual Contribution
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatInputValue(annualContribution)}
                              onChange={(e) =>
                                setAnnualContribution(
                                  parseInputValue(e.target.value)
                                )
                              }
                              className="w-full pl-8 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                            />
                          </div>
                        </div>

                        {/* Contribution Timing */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Contribute at
                          </label>
                          <select
                            value={contributionTiming}
                            onChange={(e) =>
                              setContributionTiming(
                                e.target.value as ContributionTiming
                              )
                            }
                            className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                          >
                            <option value="beginning">
                              Beginning of period
                            </option>
                            <option value="end">End of period</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Tax & Inflation */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Tax & Inflation (Optional)
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tax Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={taxRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setTaxRate(value ? Number(value) : 0);
                          }}
                          className="w-full pl-3 pr-7 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Inflation Rate
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={inflationRate || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setInflationRate(value ? Number(value) : 0);
                          }}
                          className="w-full pl-3 pr-7 py-2.5 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 font-medium text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                    </div>
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
              {/* Final Amount Card */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Ending Balance
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(finalAmount)}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">
                      Total Contributions
                    </div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(totalContributions)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Total Interest</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(totalInterest)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Investment Breakdown
                </h3>

                {/* Visual Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    {principalPercentage > 0 && (
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${principalPercentage}%` }}
                      >
                        {principalPercentage > 15 &&
                          `${principalPercentage.toFixed(1)}%`}
                      </div>
                    )}
                    {contributionsPercentage > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                        style={{ width: `${contributionsPercentage}%` }}
                      >
                        {contributionsPercentage > 15 &&
                          `${contributionsPercentage.toFixed(1)}%`}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-gray-600">
                          Initial Investment
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(principal)}
                      </span>
                    </div>
                    {totalContributions > principal && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-500"></div>
                          <span className="text-sm text-gray-600">
                            Additional Contributions
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(totalContributions - principal)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500"></div>
                        <span className="text-sm text-gray-600">
                          Interest Earned
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                  {taxRate > 0 && (
                    <div>
                      <div className="text-xs text-gray-500">After Tax</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(afterTaxAmount)}
                      </div>
                    </div>
                  )}
                  {inflationRate > 0 && (
                    <div>
                      <div className="text-xs text-gray-500">
                        Inflation Adjusted
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(inflationAdjustedAmount)}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500">Effective Rate</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {totalContributions > 0
                        ? `${(((totalInterest / totalContributions) * 100) / (years + months / 12)).toFixed(2)}%`
                        : '0%'}{' '}
                      per year
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Return</div>
                    <div className="text-sm font-semibold text-green-600">
                      {totalContributions > 0
                        ? `+${((totalInterest / totalContributions) * 100).toFixed(2)}%`
                        : '0%'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment Growth
                </h3>

                {/* SVG Chart */}
                <div className="relative h-64 mb-6">
                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="0 0 800 256"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      if (schedule.length === 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 800;
                      const periodIndex = Math.round(
                        (x / 800) * (schedule.length - 1)
                      );
                      const validIndex = Math.max(
                        0,
                        Math.min(periodIndex, schedule.length - 1)
                      );
                      const period = schedule[validIndex];

                      // Calculate cumulative contributions and interest up to this point
                      let cumulativeContributions = principal;
                      let cumulativeInterest = 0;
                      for (let i = 0; i <= validIndex; i++) {
                        cumulativeContributions += schedule[i].deposit;
                        cumulativeInterest += schedule[i].interest;
                      }

                      setHoveredPoint({
                        period: period.year,
                        balance: period.balance,
                        contributions: cumulativeContributions,
                        interest: cumulativeInterest,
                        x: (validIndex / (schedule.length - 1)) * 800,
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
                        id="balanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8B5CF6"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#8B5CF6"
                          stopOpacity="0.05"
                        />
                      </linearGradient>
                    </defs>

                    {schedule.length > 0 && (
                      <>
                        {/* Balance Area */}
                        <path
                          d={(() => {
                            const maxBalance = Math.max(
                              ...schedule.map((s) => s.balance)
                            );
                            const points = schedule
                              .map((s, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y = 256 - (s.balance / maxBalance) * 256;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L 0,${256 - (principal / maxBalance) * 256} L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#balanceGradient)"
                        />

                        {/* Balance Line */}
                        <polyline
                          points={(() => {
                            const maxBalance = Math.max(
                              ...schedule.map((s) => s.balance)
                            );
                            return schedule
                              .map((s, i) => {
                                const x = (i / (schedule.length - 1)) * 800;
                                const y = 256 - (s.balance / maxBalance) * 256;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Hover indicator */}
                        {hoveredPoint && (
                          <>
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
                            <circle
                              cx={hoveredPoint.x}
                              cy={
                                256 -
                                (hoveredPoint.balance /
                                  Math.max(...schedule.map((s) => s.balance))) *
                                  256
                              }
                              r="6"
                              fill="#8B5CF6"
                              stroke="white"
                              strokeWidth="2"
                            />
                          </>
                        )}
                      </>
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
                      <div className="font-bold mb-2">
                        Year {hoveredPoint.period}
                      </div>
                      <div className="space-y-1">
                        <div>
                          Balance: {formatCurrency(hoveredPoint.balance)}
                        </div>
                        <div className="text-green-300">
                          Interest: {formatCurrency(hoveredPoint.interest)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Accordion */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {interestType === 'simple' ? 'Annual' : 'Investment'}{' '}
                    Schedule
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
                      Detailed breakdown by{' '}
                      {interestType === 'simple' ? 'year' : 'period'}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              {interestType === 'simple' ? 'Year' : 'Period'}
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Deposit
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
                                {row.year}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {row.deposit > 0
                                  ? formatCurrency(row.deposit)
                                  : '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-purple-600">
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

      {/* Information Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Understanding Interest Calculations
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Simple Interest vs Compound Interest
                </h3>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Simple Interest
                    </h4>
                    <p className="mb-2">
                      Simple interest is calculated only on the principal
                      amount. The formula is:
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                      Interest = Principal × Rate × Time
                    </div>
                    <p className="mt-2 text-sm">
                      Example: $1,000 at 5% for 3 years = $1,000 × 0.05 × 3 =
                      $150 interest
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Compound Interest
                    </h4>
                    <p className="mb-2">
                      Compound interest is calculated on the principal plus
                      accumulated interest. The formula is:
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                      A = P(1 + r/n)^(nt)
                    </div>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>• A = Final amount</li>
                      <li>• P = Principal</li>
                      <li>• r = Annual rate (decimal)</li>
                      <li>• n = Compounds per year</li>
                      <li>• t = Time in years</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Compounding Frequency Impact
                </h3>
                <p className="text-gray-600 mb-4">
                  The frequency of compounding significantly affects your
                  returns. More frequent compounding leads to higher returns due
                  to interest earning interest more often.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span>Daily (365x)</span>
                    <span className="font-semibold text-gray-900">
                      Highest returns
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span>Monthly (12x)</span>
                    <span className="font-semibold text-gray-900">
                      Common for savings
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span>Quarterly (4x)</span>
                    <span className="font-semibold text-gray-900">
                      Typical for bonds
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Annually (1x)</span>
                    <span className="font-semibold text-gray-900">
                      Simplest calculation
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Regular Contributions
                </h3>
                <p className="text-gray-600 mb-4">
                  Adding regular contributions dramatically increases your
                  investment growth through:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>
                      <strong>Dollar-cost averaging:</strong> Reduce impact of
                      market volatility
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>
                      <strong>Compound growth:</strong> Each contribution starts
                      earning interest
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>
                      <strong>Timing matters:</strong> Contributing at the
                      beginning of periods yields more interest
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tax & Inflation Considerations
                </h3>
                <div className="space-y-3 text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Tax Impact
                    </h4>
                    <p className="text-sm">
                      Interest earnings are typically taxable. The calculator
                      shows your after-tax returns based on your tax rate.
                      Consider tax-advantaged accounts like IRAs or 401(k)s for
                      retirement savings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Inflation Adjustment
                    </h4>
                    <p className="text-sm">
                      Inflation reduces purchasing power over time. A 3%
                      inflation rate means prices double approximately every 24
                      years. The inflation-adjusted value shows what your
                      investment will be worth in today&apos;s dollars.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Investment Tips
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • Start early - time is your greatest asset for compound
                    growth
                  </li>
                  <li>
                    • Be consistent with contributions, even small amounts
                    matter
                  </li>
                  <li>
                    • Choose appropriate compounding frequency for your goals
                  </li>
                  <li>
                    • Consider tax-advantaged accounts for long-term savings
                  </li>
                  <li>• Factor in inflation when planning for future needs</li>
                  <li>• Diversify investments to manage risk</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
