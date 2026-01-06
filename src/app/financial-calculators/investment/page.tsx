'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import {
  calculateInvestment,
  formatCurrency,
  formatCurrencyWithCents,
  formatPercent,
  getFrequencyLabel,
  ContributionFrequency,
  CompoundFrequency,
  ContributionTiming,
  YearlyBreakdown,
} from './utils/calculations';

export default function InvestmentCalculator() {
  // Input states
  const [startingAmount, setStartingAmount] = useState<number>(20000);
  const [additionalContribution, setAdditionalContribution] =
    useState<number>(1000);
  const [contributionFrequency, setContributionFrequency] =
    useState<ContributionFrequency>('monthly');
  const [lengthYears, setLengthYears] = useState<number>(10);
  const [returnRate, setReturnRate] = useState<number>(8);
  const [compoundFrequency, setCompoundFrequency] =
    useState<CompoundFrequency>('monthly');
  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>('end');

  // Calculated results
  const [endBalance, setEndBalance] = useState<number>(0);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [yearByYear, setYearByYear] = useState<YearlyBreakdown[]>([]);

  // UI state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  const calculateInvestmentResults = useCallback(() => {
    const results = calculateInvestment({
      startingAmount,
      additionalContribution,
      contributionFrequency,
      lengthYears,
      returnRate,
      compoundFrequency,
      contributionTiming,
    });

    setEndBalance(results.endBalance);
    setTotalContributions(results.totalContributions);
    setTotalInterest(results.totalInterest);
    setYearByYear(results.yearByYear);
  }, [
    startingAmount,
    additionalContribution,
    contributionFrequency,
    lengthYears,
    returnRate,
    compoundFrequency,
    contributionTiming,
  ]);

  useEffect(() => {
    calculateInvestmentResults();
  }, [calculateInvestmentResults]);

  const formatInputValue = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const parseInputValue = (value: string): number => {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  };

  const contributionsPercentage =
    endBalance > 0 ? (totalContributions / endBalance) * 100 : 50;
  const interestPercentage = 100 - contributionsPercentage;

  return (
    <CalculatorLayout
      title="Investment Calculator"
      description="Calculate your investment growth over time with compound interest and regular contributions"
      icon={<TrendingUp className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
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
                Investment Details
              </h2>

              <div className="space-y-6">
                {/* Starting Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(startingAmount)}
                      onChange={(e) => {
                        setStartingAmount(parseInputValue(e.target.value));
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Additional Contribution */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Contribution
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(additionalContribution)}
                      onChange={(e) => {
                        setAdditionalContribution(
                          parseInputValue(e.target.value)
                        );
                      }}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Contribution Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contribution Frequency
                  </label>
                  <select
                    value={contributionFrequency}
                    onChange={(e) =>
                      setContributionFrequency(
                        e.target.value as ContributionFrequency
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="semimonthly">Semi-monthly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semiannually">Semi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                {/* Length of Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Length of Time (Years)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lengthYears || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setLengthYears(value ? Number(value) : 0);
                    }}
                    className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-gray-900 font-medium"
                  />
                </div>

                {/* Estimated Rate of Return */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Rate of Return
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={returnRate || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setReturnRate(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-gray-900 font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Compound Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compound Frequency
                  </label>
                  <select
                    value={compoundFrequency}
                    onChange={(e) =>
                      setCompoundFrequency(e.target.value as CompoundFrequency)
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors text-gray-900 font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="semimonthly">Semi-monthly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semiannually">Semi-annually</option>
                    <option value="annually">Annually</option>
                    <option value="continuously">Continuously</option>
                  </select>
                </div>

                {/* Contribution Timing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contribute at
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setContributionTiming('beginning')}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        contributionTiming === 'beginning'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Beginning
                    </button>
                    <button
                      onClick={() => setContributionTiming('end')}
                      className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        contributionTiming === 'end'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      End
                    </button>
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
              {/* Future Value Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Future Investment Value
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(endBalance)}
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

              {/* Investment Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Investment Breakdown
                </h3>

                {/* Chart */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    <div
                      className="bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${contributionsPercentage}%` }}
                    >
                      {contributionsPercentage > 15 &&
                        `Contributions ${contributionsPercentage.toFixed(1)}%`}
                    </div>
                    <div
                      className="bg-purple-500 flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${interestPercentage}%` }}
                    >
                      {interestPercentage > 15 &&
                        `Interest ${interestPercentage.toFixed(1)}%`}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-indigo-500"></div>
                        <span className="text-sm text-gray-600">
                          Total Contributions
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(totalContributions)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500"></div>
                        <span className="text-sm text-gray-600">
                          Total Interest Earned
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
                    <span className="text-gray-600">Investment Period</span>
                    <span className="font-semibold text-gray-900">
                      {lengthYears} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate of Return</span>
                    <span className="font-semibold text-gray-900">
                      {formatPercent(returnRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compound Frequency</span>
                    <span className="font-semibold text-gray-900">
                      {getFrequencyLabel(compoundFrequency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Year-by-Year Schedule Accordion */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    Year-by-Year Breakdown
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
                      Annual breakdown of investment growth
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Year
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Start Balance
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Contributions
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Interest
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              End Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {yearByYear.map((row) => (
                            <tr
                              key={row.year}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {row.year}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {formatCurrencyWithCents(row.startingBalance)}
                              </td>
                              <td className="px-4 py-3 text-right text-indigo-600">
                                {formatCurrencyWithCents(row.contributions)}
                              </td>
                              <td className="px-4 py-3 text-right text-purple-600">
                                {formatCurrencyWithCents(row.interestEarned)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                {formatCurrencyWithCents(row.endingBalance)}
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
              How Investment Calculations Work
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Compound Interest Formula
                </h3>
                <p className="mb-4">
                  The future value of your investment is calculated using the
                  compound interest formula with regular contributions:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl font-mono text-sm overflow-x-auto">
                  FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <strong>FV</strong> = Future Value
                  </li>
                  <li>
                    <strong>P</strong> = Principal (starting amount)
                  </li>
                  <li>
                    <strong>r</strong> = Annual interest rate (as decimal)
                  </li>
                  <li>
                    <strong>n</strong> = Number of times interest compounds per
                    year
                  </li>
                  <li>
                    <strong>t</strong> = Number of years
                  </li>
                  <li>
                    <strong>PMT</strong> = Regular contribution amount
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Understanding Compound Interest
                </h3>
                <p className="mb-4">
                  Compound interest is the interest calculated on both the
                  initial principal and the accumulated interest from previous
                  periods. This creates exponential growth over time, often
                  called &quot;interest on interest.&quot;
                </p>
                <p>
                  The power of compound interest increases with more frequent
                  compounding and longer time periods. This is why starting
                  early and being consistent with contributions can have such a
                  dramatic impact on your investment growth.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Contribution Timing
                </h3>
                <p className="mb-4">
                  The timing of your contributions affects your returns:
                </p>
                <ul className="space-y-3">
                  <li>
                    <strong>Beginning of Period:</strong> Contributions made at
                    the start of each period earn interest for the full period,
                    resulting in slightly higher returns.
                  </li>
                  <li>
                    <strong>End of Period:</strong> Contributions made at the
                    end of each period start earning interest in the next
                    period, resulting in slightly lower returns.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Investment Tips
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Start Early:</strong> Time is your most valuable
                    asset. The earlier you start investing, the more time
                    compound interest has to work its magic.
                  </li>
                  <li>
                    <strong>Be Consistent:</strong> Regular contributions, even
                    small ones, add up significantly over time.
                  </li>
                  <li>
                    <strong>Reinvest Returns:</strong> Reinvesting dividends and
                    interest accelerates compound growth.
                  </li>
                  <li>
                    <strong>Consider Inflation:</strong> Aim for returns that
                    outpace inflation to grow your purchasing power.
                  </li>
                  <li>
                    <strong>Diversify:</strong> Don&apos;t put all your eggs in
                    one basket. Spread investments across different asset
                    classes.
                  </li>
                  <li>
                    <strong>Long-Term Focus:</strong> Investments typically
                    perform better over longer time horizons.
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Disclaimer
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the
                    information you enter
                  </li>
                  <li>• Past performance does not guarantee future results</li>
                  <li>
                    • Investment returns can fluctuate and may be positive or
                    negative
                  </li>
                  <li>
                    • This calculator does not account for taxes, fees, or
                    inflation
                  </li>
                  <li>
                    • Always consult with a financial advisor before making
                    investment decisions
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
