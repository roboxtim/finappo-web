'use client';

import { useState, useEffect } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import {
  Landmark,
  Calculator,
  TrendingUp,
  Wallet,
  Calendar,
  DollarSign,
  PieChart,
  Table,
} from 'lucide-react';
import {
  calculateAnnuityPayout,
  calculatePayoutDuration,
  formatCurrency,
  formatPercentage,
  validateAnnuityInput,
  PaymentFrequency,
  AnnuityResult,
  AmortizationEntry,
} from './annuityCalculations';

export default function AnnuityPayoutCalculator() {
  // State for calculator mode
  const [mode, setMode] = useState<'fixedLength' | 'fixedPayment'>(
    'fixedLength'
  );

  // Input states
  const [principal, setPrincipal] = useState<string>('500000');
  const [interestRate, setInterestRate] = useState<string>('5');
  const [years, setYears] = useState<string>('10');
  const [payoutAmount, setPayoutAmount] = useState<string>('5000');
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');

  // Results state
  const [results, setResults] = useState<AnnuityResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);

  // Calculate results whenever inputs change
  useEffect(() => {
    calculateResults();
  }, [principal, interestRate, years, payoutAmount, frequency, mode]);

  const calculateResults = () => {
    // Parse inputs
    const principalValue = parseFloat(principal.replace(/,/g, ''));
    const rateValue = parseFloat(interestRate);
    const yearsValue = parseFloat(years);
    const payoutValue = parseFloat(payoutAmount.replace(/,/g, ''));

    // Validate inputs
    const validationErrors = validateAnnuityInput({
      principal: principalValue,
      annualRate: rateValue,
      years: mode === 'fixedLength' ? yearsValue : undefined,
      payoutAmount: mode === 'fixedPayment' ? payoutValue : undefined,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }

    // Clear errors
    setErrors([]);

    try {
      if (mode === 'fixedLength') {
        // Calculate payout amount based on fixed duration
        const result = calculateAnnuityPayout({
          principal: principalValue,
          annualRate: rateValue,
          years: yearsValue,
          frequency,
        });
        setResults(result);
      } else {
        // Calculate duration based on fixed payment amount
        const result = calculatePayoutDuration({
          principal: principalValue,
          annualRate: rateValue,
          payoutAmount: payoutValue,
          frequency,
        });
        setResults(result);
      }
    } catch {
      setErrors(['Error calculating annuity. Please check your inputs.']);
      setResults(null);
    }
  };

  const formatNumberInput = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');

    // Parse and format with commas
    const parts = numericValue.split('.');
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return parts.join('.');
  };

  const getFrequencyLabel = (freq: PaymentFrequency): string => {
    const labels: Record<PaymentFrequency, string> = {
      annually: 'Annually',
      semiannually: 'Semi-annually',
      quarterly: 'Quarterly',
      monthly: 'Monthly',
      semimonthly: 'Semi-monthly',
      biweekly: 'Bi-weekly',
    };
    return labels[freq];
  };

  const getPaymentLabel = (freq: PaymentFrequency): string => {
    const labels: Record<PaymentFrequency, string> = {
      annually: 'Annual',
      semiannually: 'Semi-annual',
      quarterly: 'Quarterly',
      monthly: 'Monthly',
      semimonthly: 'Semi-monthly',
      biweekly: 'Bi-weekly',
    };
    return labels[freq];
  };

  const getInterestPercentage = (): number => {
    if (!results || !results.totalInterest || !results.totalPayout) return 0;
    return (results.totalInterest / results.totalPayout) * 100;
  };

  const getPrincipalPercentage = (): number => {
    if (!results || !results.totalPayout) return 0;
    const principalValue = parseFloat(principal.replace(/,/g, ''));
    return (principalValue / results.totalPayout) * 100;
  };

  return (
    <CalculatorLayout
      title="Annuity Payout Calculator"
      description="Calculate annuity payout amounts and income streams for retirement planning"
      icon={<Landmark className="w-6 h-6" />}
      gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
    >
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[40%_60%] gap-8">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              {/* Calculator Mode Tabs */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Calculator Mode
                </h3>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    onClick={() => setMode('fixedLength')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      mode === 'fixedLength'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Fixed Length
                  </button>
                  <button
                    onClick={() => setMode('fixedPayment')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      mode === 'fixedPayment'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Fixed Payment
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {mode === 'fixedLength'
                    ? 'Calculate payout amount based on a fixed duration'
                    : 'Calculate duration based on a fixed payment amount'}
                </p>
              </div>

              {/* Input Fields */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Annuity Details
                </h3>
                <div className="space-y-4">
                  {/* Starting Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Principal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        value={principal}
                        onChange={(e) =>
                          setPrincipal(formatNumberInput(e.target.value))
                        }
                        className="w-full pl-8 pr-3 py-2 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="500,000"
                      />
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest/Return Rate (Annual)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full pr-8 pl-3 py-2 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="5"
                        step="0.1"
                        min="0"
                        max="50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Conditional Input: Years or Payout Amount */}
                  {mode === 'fixedLength' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years to Payout
                      </label>
                      <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                        className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10"
                        step="1"
                        min="1"
                        max="100"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payout Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          value={payoutAmount}
                          onChange={(e) =>
                            setPayoutAmount(formatNumberInput(e.target.value))
                          }
                          className="w-full pl-8 pr-3 py-2 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="5,000"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payout Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payout Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) =>
                        setFrequency(e.target.value as PaymentFrequency)
                      }
                      className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="annually">Annually</option>
                      <option value="semiannually">Semi-annually</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                      <option value="semimonthly">Semi-monthly</option>
                      <option value="biweekly">Bi-weekly</option>
                    </select>
                  </div>
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  How It Works
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      {mode === 'fixedLength'
                        ? 'Enter your principal, interest rate, and desired payout period to calculate regular payment amounts'
                        : 'Enter your principal, interest rate, and desired payment amount to calculate how long the annuity will last'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      The calculator uses standard annuity formulas to determine
                      payments and duration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      View the detailed amortization schedule to see
                      year-by-year balance changes
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {results && (
                <>
                  {/* Main Result Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-2xl font-bold mb-6">
                      Annuity Payout Results
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Payout Amount */}
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5" />
                          <span className="text-sm opacity-90">
                            {getPaymentLabel(frequency)} Payment
                          </span>
                        </div>
                        <p className="text-3xl font-bold">
                          {formatCurrency(results.payoutAmount)}
                        </p>
                      </div>

                      {/* Total Payments or Duration */}
                      {mode === 'fixedLength' ? (
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm opacity-90">
                              Total Payments
                            </span>
                          </div>
                          <p className="text-3xl font-bold">
                            {results.totalPayments}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm opacity-90">Duration</span>
                          </div>
                          <p className="text-3xl font-bold">
                            {results.willGrow
                              ? 'Infinite'
                              : `${results.years?.toFixed(1)} years`}
                          </p>
                        </div>
                      )}

                      {/* Total Payout */}
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-5 h-5" />
                          <span className="text-sm opacity-90">
                            Total Payout
                          </span>
                        </div>
                        <p className="text-3xl font-bold">
                          {results.willGrow
                            ? 'N/A'
                            : formatCurrency(results.totalPayout)}
                        </p>
                      </div>

                      {/* Total Interest */}
                      <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-sm opacity-90">
                            Total Interest
                          </span>
                        </div>
                        <p className="text-3xl font-bold">
                          {results.willGrow
                            ? 'N/A'
                            : formatCurrency(results.totalInterest)}
                        </p>
                      </div>
                    </div>

                    {results.willGrow && (
                      <div className="mt-4 p-4 bg-yellow-400/20 backdrop-blur rounded-xl border border-yellow-400/30">
                        <p className="text-sm">
                          ⚠️ The payment amount is less than the interest
                          earned. The annuity will grow instead of depleting.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Breakdown Chart */}
                  {!results.willGrow && (
                    <div className="bg-white rounded-3xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        Payout Breakdown
                      </h3>

                      <div className="space-y-4">
                        {/* Principal Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">
                              Principal
                            </span>
                            <span className="text-gray-900">
                              {formatCurrency(
                                parseFloat(principal.replace(/,/g, ''))
                              )}{' '}
                              ({getPrincipalPercentage().toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                              style={{ width: `${getPrincipalPercentage()}%` }}
                            />
                          </div>
                        </div>

                        {/* Interest Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">
                              Interest Earned
                            </span>
                            <span className="text-gray-900">
                              {formatCurrency(results.totalInterest)} (
                              {getInterestPercentage().toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-lg transition-all duration-500"
                              style={{ width: `${getInterestPercentage()}%` }}
                            />
                          </div>
                        </div>

                        {/* Total */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">
                              Total Payout
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              {formatCurrency(results.totalPayout)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Payment Frequency
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {getFrequencyLabel(frequency)}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Interest Rate
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPercentage(parseFloat(interestRate))}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Starting Principal
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          parseFloat(principal.replace(/,/g, ''))
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Amortization Schedule */}
                  {results.schedule && mode === 'fixedLength' && (
                    <div className="bg-white rounded-3xl shadow-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Table className="w-5 h-5 text-blue-600" />
                          Amortization Schedule
                        </h3>
                        <button
                          onClick={() => setShowSchedule(!showSchedule)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {showSchedule ? 'Hide' : 'Show'} Details
                        </button>
                      </div>

                      {showSchedule && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-2 font-medium text-gray-700">
                                  Year
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-gray-700">
                                  Beginning Balance
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-gray-700">
                                  Interest
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-gray-700">
                                  Principal
                                </th>
                                <th className="text-right py-2 px-2 font-medium text-gray-700">
                                  Ending Balance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.schedule.map(
                                (entry: AmortizationEntry) => (
                                  <tr
                                    key={entry.year}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                  >
                                    <td className="py-2 px-2 text-gray-900">
                                      {entry.year}
                                    </td>
                                    <td className="text-right py-2 px-2 text-gray-900">
                                      {formatCurrency(entry.beginningBalance)}
                                    </td>
                                    <td className="text-right py-2 px-2 text-gray-900">
                                      {formatCurrency(entry.interest)}
                                    </td>
                                    <td className="text-right py-2 px-2 text-gray-900">
                                      {formatCurrency(entry.principal)}
                                    </td>
                                    <td className="text-right py-2 px-2 font-medium text-gray-900">
                                      {formatCurrency(entry.endingBalance)}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* No Results State */}
              {!results && errors.length === 0 && (
                <div className="bg-gray-50 rounded-3xl p-12 text-center">
                  <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Enter Your Annuity Details
                  </h3>
                  <p className="text-gray-600">
                    Fill in the form to calculate your annuity payout schedule
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
