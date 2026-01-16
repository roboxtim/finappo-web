'use client';

import { useState, useEffect } from 'react';
import {
  calculateSimple,
  calculateRepayment,
  calculateProjection,
  validateSimpleInputs,
  validateRepaymentInputs,
  validateProjectionInputs,
  formatCurrency,
  formatPercentage,
  formatMonthsAsTime,
  type CalculatorMode,
  type SimpleInputs,
  type RepaymentInputs,
  type ProjectionInputs,
  type SimpleResults,
  type RepaymentResults,
  type ProjectionResults,
} from './calculations';

export default function StudentLoanCalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>('simple');

  // Simple mode state
  const [loanBalance, setLoanBalance] = useState<string>('25000');
  const [remainingTerm, setRemainingTerm] = useState<string>('10');
  const [interestRate, setInterestRate] = useState<string>('5.5');
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');

  // Repayment mode state
  const [repaymentLoanBalance, setRepaymentLoanBalance] =
    useState<string>('30000');
  const [repaymentMonthlyPayment, setRepaymentMonthlyPayment] =
    useState<string>('350');
  const [repaymentInterestRate, setRepaymentInterestRate] =
    useState<string>('6.0');
  const [extraMonthly, setExtraMonthly] = useState<string>('');
  const [extraAnnual, setExtraAnnual] = useState<string>('');
  const [oneTimePayment, setOneTimePayment] = useState<string>('');

  // Projection mode state
  const [yearsToGraduation, setYearsToGraduation] = useState<string>('4');
  const [annualLoanAmount, setAnnualLoanAmount] = useState<string>('8000');
  const [currentBalance, setCurrentBalance] = useState<string>('0');
  const [projectionLoanTerm, setProjectionLoanTerm] = useState<string>('10');
  const [gracePeriod, setGracePeriod] = useState<string>('6');
  const [projectionInterestRate, setProjectionInterestRate] =
    useState<string>('5.5');
  const [interestDuringSchool, setInterestDuringSchool] =
    useState<boolean>(false);

  // Results state
  const [simpleResults, setSimpleResults] = useState<SimpleResults | null>(
    null
  );
  const [repaymentResults, setRepaymentResults] =
    useState<RepaymentResults | null>(null);
  const [projectionResults, setProjectionResults] =
    useState<ProjectionResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Calculate on input change
  useEffect(() => {
    handleCalculate();
  }, [
    mode,
    loanBalance,
    remainingTerm,
    interestRate,
    monthlyPayment,
    repaymentLoanBalance,
    repaymentMonthlyPayment,
    repaymentInterestRate,
    extraMonthly,
    extraAnnual,
    oneTimePayment,
    yearsToGraduation,
    annualLoanAmount,
    currentBalance,
    projectionLoanTerm,
    gracePeriod,
    projectionInterestRate,
    interestDuringSchool,
  ]);

  const handleCalculate = () => {
    setErrors([]);

    try {
      if (mode === 'simple') {
        const inputs: SimpleInputs = {
          loanBalance: loanBalance ? parseFloat(loanBalance) : undefined,
          remainingTerm: remainingTerm ? parseFloat(remainingTerm) : undefined,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          monthlyPayment: monthlyPayment
            ? parseFloat(monthlyPayment)
            : undefined,
        };

        const validationErrors = validateSimpleInputs(inputs);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setSimpleResults(null);
          return;
        }

        const results = calculateSimple(inputs);
        setSimpleResults(results);

        // Update input fields with calculated values
        if (!inputs.loanBalance || inputs.loanBalance === 0) {
          setLoanBalance(results.loanBalance.toFixed(2));
        }
        if (!inputs.remainingTerm || inputs.remainingTerm === 0) {
          setRemainingTerm(results.remainingTerm.toFixed(2));
        }
        if (!inputs.interestRate || inputs.interestRate === 0) {
          setInterestRate(results.interestRate.toFixed(2));
        }
        if (!inputs.monthlyPayment || inputs.monthlyPayment === 0) {
          setMonthlyPayment(results.monthlyPayment.toFixed(2));
        }
      } else if (mode === 'repayment') {
        const inputs: RepaymentInputs = {
          loanBalance: parseFloat(repaymentLoanBalance) || 0,
          monthlyPayment: parseFloat(repaymentMonthlyPayment) || 0,
          interestRate: parseFloat(repaymentInterestRate) || 0,
          extraMonthly: extraMonthly ? parseFloat(extraMonthly) : 0,
          extraAnnual: extraAnnual ? parseFloat(extraAnnual) : 0,
          oneTimePayment: oneTimePayment ? parseFloat(oneTimePayment) : 0,
        };

        const validationErrors = validateRepaymentInputs(inputs);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setRepaymentResults(null);
          return;
        }

        const results = calculateRepayment(inputs);
        setRepaymentResults(results);
      } else if (mode === 'projection') {
        const inputs: ProjectionInputs = {
          yearsToGraduation: parseFloat(yearsToGraduation) || 0,
          annualLoanAmount: parseFloat(annualLoanAmount) || 0,
          currentBalance: parseFloat(currentBalance) || 0,
          loanTerm: parseFloat(projectionLoanTerm) || 0,
          gracePeriod: parseFloat(gracePeriod) || 0,
          interestRate: parseFloat(projectionInterestRate) || 0,
          interestDuringSchool,
        };

        const validationErrors = validateProjectionInputs(inputs);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setProjectionResults(null);
          return;
        }

        const results = calculateProjection(inputs);
        setProjectionResults(results);
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Calculation error']);
      setSimpleResults(null);
      setRepaymentResults(null);
      setProjectionResults(null);
    }
  };

  const handleReset = () => {
    if (mode === 'simple') {
      setLoanBalance('25000');
      setRemainingTerm('10');
      setInterestRate('5.5');
      setMonthlyPayment('');
    } else if (mode === 'repayment') {
      setRepaymentLoanBalance('30000');
      setRepaymentMonthlyPayment('350');
      setRepaymentInterestRate('6.0');
      setExtraMonthly('');
      setExtraAnnual('');
      setOneTimePayment('');
    } else if (mode === 'projection') {
      setYearsToGraduation('4');
      setAnnualLoanAmount('8000');
      setCurrentBalance('0');
      setProjectionLoanTerm('10');
      setGracePeriod('6');
      setProjectionInterestRate('5.5');
      setInterestDuringSchool(false);
    }
    setErrors([]);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Student Loan Calculator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Calculate student loan payments, compare repayment strategies, or
          project future loan balances
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        <button
          onClick={() => setMode('simple')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            mode === 'simple'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Simple Calculator
        </button>
        <button
          onClick={() => setMode('repayment')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            mode === 'repayment'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Repayment Calculator
        </button>
        <button
          onClick={() => setMode('projection')}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            mode === 'projection'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Projection Calculator
        </button>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="font-semibold text-red-900 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Simple Calculator Mode */}
      {mode === 'simple' && (
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left Column - Inputs */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Loan Details
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Provide any 3 values to calculate the 4th
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={loanBalance}
                      onChange={(e) => setLoanBalance(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remaining Term (years)
                  </label>
                  <input
                    type="number"
                    value={remainingTerm}
                    onChange={(e) => setRemainingTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="md:col-span-3 space-y-6">
            {simpleResults && (
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-100">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Loan Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Monthly Payment
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(simpleResults.monthlyPayment)}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Loan Balance
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(simpleResults.loanBalance)}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Total Interest
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        {formatCurrency(simpleResults.totalInterest)}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Total Payments
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {formatCurrency(simpleResults.totalPayments)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Payment Breakdown
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Principal</span>
                        <span className="font-semibold text-gray-800">
                          {formatPercentage(simpleResults.principalPercentage)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${simpleResults.principalPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Interest</span>
                        <span className="font-semibold text-gray-800">
                          {formatPercentage(simpleResults.interestPercentage)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${simpleResults.interestPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600">Loan Term</div>
                    <div className="text-xl font-bold text-gray-800">
                      {simpleResults.remainingTerm.toFixed(1)} years (
                      {Math.round(simpleResults.remainingTerm * 12)} months)
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600">Interest Rate</div>
                    <div className="text-xl font-bold text-gray-800">
                      {simpleResults.interestRate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Repayment Calculator Mode */}
      {mode === 'repayment' && (
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left Column - Inputs */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Current Loan
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={repaymentLoanBalance}
                      onChange={(e) => setRepaymentLoanBalance(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={repaymentMonthlyPayment}
                      onChange={(e) =>
                        setRepaymentMonthlyPayment(e.target.value)
                      }
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={repaymentInterestRate}
                      onChange={(e) => setRepaymentInterestRate(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800">
                Extra Payments
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Monthly Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={extraMonthly}
                      onChange={(e) => setExtraMonthly(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Annual Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={extraAnnual}
                      onChange={(e) => setExtraAnnual(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    One-Time Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={oneTimePayment}
                      onChange={(e) => setOneTimePayment(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="md:col-span-3 space-y-6">
            {repaymentResults && (
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-100">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Savings Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Months Saved
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {repaymentResults.savings.monthsSaved}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatMonthsAsTime(
                          repaymentResults.savings.monthsSaved
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Interest Saved
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(repaymentResults.savings.interestSaved)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold mb-6 text-gray-800">
                    Comparison
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            Original
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-green-700">
                            Accelerated
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-3 px-4 text-gray-600">
                            Monthly Payment
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {formatCurrency(
                              repaymentResults.original.monthlyPayment
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-green-600">
                            {formatCurrency(
                              repaymentResults.accelerated.monthlyPayment
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-gray-600">
                            Payoff Time
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {formatMonthsAsTime(
                              repaymentResults.original.totalMonths
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-green-600">
                            {formatMonthsAsTime(
                              repaymentResults.accelerated.totalMonths
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-gray-600">
                            Total Interest
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {formatCurrency(
                              repaymentResults.original.totalInterest
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-green-600">
                            {formatCurrency(
                              repaymentResults.accelerated.totalInterest
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-gray-600">
                            Total Payments
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {formatCurrency(
                              repaymentResults.original.totalPayments
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-green-600">
                            {formatCurrency(
                              repaymentResults.accelerated.totalPayments
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Projection Calculator Mode */}
      {mode === 'projection' && (
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left Column - Inputs */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                School & Loan Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years to Graduation
                  </label>
                  <input
                    type="number"
                    value={yearsToGraduation}
                    onChange={(e) => setYearsToGraduation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                    min="0"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={annualLoanAmount}
                      onChange={(e) => setAnnualLoanAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={currentBalance}
                      onChange={(e) => setCurrentBalance(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (years)
                  </label>
                  <input
                    type="number"
                    value={projectionLoanTerm}
                    onChange={(e) => setProjectionLoanTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (months)
                  </label>
                  <input
                    type="number"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                    min="0"
                    max="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={projectionInterestRate}
                      onChange={(e) =>
                        setProjectionInterestRate(e.target.value)
                      }
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="interestDuringSchool"
                    checked={interestDuringSchool}
                    onChange={(e) => setInterestDuringSchool(e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="interestDuringSchool"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    Interest accrues during school
                  </label>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="md:col-span-3 space-y-6">
            {projectionResults && (
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-100">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">
                    Projected Repayment
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Monthly Repayment
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(projectionResults.monthlyRepayment)}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Amount Borrowed
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {formatCurrency(projectionResults.amountBorrowed)}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Balance After Graduation
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        {formatCurrency(
                          projectionResults.balanceAfterGraduation
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="text-sm text-gray-600 mb-1">
                        Balance After Grace Period
                      </div>
                      <div className="text-3xl font-bold text-red-600">
                        {formatCurrency(
                          projectionResults.balanceAfterGracePeriod
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Total Cost
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-600">
                          Total Interest
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(projectionResults.totalInterest)}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-600">
                          Total Payments
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {formatCurrency(projectionResults.totalPayments)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Principal</span>
                        <span className="font-semibold text-gray-800">
                          {formatPercentage(
                            projectionResults.principalPercentage
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${projectionResults.principalPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Interest</span>
                        <span className="font-semibold text-gray-800">
                          {formatPercentage(
                            projectionResults.interestPercentage
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${projectionResults.interestPercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
