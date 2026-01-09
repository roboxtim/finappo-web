'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import {
  Scale,
  TrendingUp,
  Home,
  DollarSign,
  Calculator,
  PiggyBank,
  ChartBar,
  Info,
} from 'lucide-react';
import {
  calculateRentVsBuy,
  RentVsBuyInputs,
  RentVsBuyResults,
} from './utils/calculations';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function RentVsBuyCalculator() {
  const [inputs, setInputs] = useState<RentVsBuyInputs>({
    // Home Purchase
    homePrice: 500000,
    downPaymentPercent: 20,
    mortgageRate: 7,
    loanTermYears: 30,
    buyingClosingCosts: 10000,
    propertyTaxRate: 1.2,
    homeInsuranceAnnual: 1800,
    hoaFeesMonthly: 300,
    maintenancePercent: 1,
    homeAppreciationRate: 3.5,
    sellingClosingCostsPercent: 6,

    // Rental
    monthlyRent: 3000,
    rentIncreaseRate: 3.5,
    rentersInsuranceMonthly: 30,
    securityDeposit: 3000,

    // Financial
    yearsToStay: 10,
    marginalTaxRate: 27,
    investmentReturnRate: 7,
  });

  const [results, setResults] = useState<RentVsBuyResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate results whenever inputs change
  useEffect(() => {
    try {
      const newResults = calculateRentVsBuy(inputs);
      setResults(newResults);
      setErrors({});
    } catch (error) {
      setErrors({
        calculation:
          error instanceof Error ? error.message : 'Calculation error',
      });
    }
  }, [inputs]);

  const handleInputChange = (field: keyof RentVsBuyInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Chart data for year-by-year comparison
  const chartData = useMemo(() => {
    if (!results || !results.yearlyBreakdown) return null;

    return {
      labels: results.yearlyBreakdown.map((y) => `Year ${y.year}`),
      datasets: [
        {
          label: 'Cumulative Buy Cost',
          data: results.yearlyBreakdown.map((y) => y.cumulativeBuyCost),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Cumulative Rent Cost',
          data: results.yearlyBreakdown.map((y) => y.cumulativeRentCost),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.1,
        },
        {
          label: 'Home Equity',
          data: results.yearlyBreakdown.map((y) => y.homeEquity),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.1,
          borderDash: [5, 5],
        },
      ],
    };
  }, [results]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Cost Comparison Over Time',
      },
      tooltip: {
        callbacks: {
          label: function (context: {
            dataset: { label?: string };
            parsed: { y: number | null };
          }) {
            return (
              (context.dataset.label || '') +
              ': ' +
              formatCurrency(context.parsed.y || 0)
            );
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
  };

  return (
    <CalculatorLayout
      title="Rent vs Buy Calculator"
      description="Compare the financial outcomes of renting versus buying a home to make an informed decision"
      icon={<Scale className="w-8 h-8 text-white" />}
      gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
    >
      <section className="pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Input Form - Left Column (40%) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Home Purchase Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-indigo-600" />
                  Home Purchase Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Home Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={inputs.homePrice}
                        onChange={(e) =>
                          handleInputChange('homePrice', e.target.value)
                        }
                        className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Down Payment
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.downPaymentPercent}
                          onChange={(e) =>
                            handleInputChange(
                              'downPaymentPercent',
                              e.target.value
                            )
                          }
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          value={Math.round(
                            (inputs.homePrice * inputs.downPaymentPercent) / 100
                          ).toLocaleString()}
                          disabled
                          className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-200 rounded-md bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mortgage Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.mortgageRate}
                          onChange={(e) =>
                            handleInputChange('mortgageRate', e.target.value)
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Term
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.loanTermYears}
                          onChange={(e) =>
                            handleInputChange('loanTermYears', e.target.value)
                          }
                          className="w-full pl-4 pr-12 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          years
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buying Closing Costs
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={inputs.buyingClosingCosts}
                        onChange={(e) =>
                          handleInputChange(
                            'buyingClosingCosts',
                            e.target.value
                          )
                        }
                        className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Tax Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.propertyTaxRate}
                          onChange={(e) =>
                            handleInputChange('propertyTaxRate', e.target.value)
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Home Insurance/yr
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={inputs.homeInsuranceAnnual}
                          onChange={(e) =>
                            handleInputChange(
                              'homeInsuranceAnnual',
                              e.target.value
                            )
                          }
                          className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HOA Fees/month
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={inputs.hoaFeesMonthly}
                          onChange={(e) =>
                            handleInputChange('hoaFeesMonthly', e.target.value)
                          }
                          className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maintenance %
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.maintenancePercent}
                          onChange={(e) =>
                            handleInputChange(
                              'maintenancePercent',
                              e.target.value
                            )
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Appreciation Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.homeAppreciationRate}
                          onChange={(e) =>
                            handleInputChange(
                              'homeAppreciationRate',
                              e.target.value
                            )
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selling Costs %
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.sellingClosingCostsPercent}
                          onChange={(e) =>
                            handleInputChange(
                              'sellingClosingCostsPercent',
                              e.target.value
                            )
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rental Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                  Rental Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={inputs.monthlyRent}
                        onChange={(e) =>
                          handleInputChange('monthlyRent', e.target.value)
                        }
                        className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rent Increase Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.rentIncreaseRate}
                          onChange={(e) =>
                            handleInputChange(
                              'rentIncreaseRate',
                              e.target.value
                            )
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Security Deposit
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={inputs.securityDeposit}
                          onChange={(e) =>
                            handleInputChange('securityDeposit', e.target.value)
                          }
                          className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renter&apos;s Insurance/month
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={inputs.rentersInsuranceMonthly}
                        onChange={(e) =>
                          handleInputChange(
                            'rentersInsuranceMonthly',
                            e.target.value
                          )
                        }
                        className="w-full pl-8 pr-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-600" />
                  Financial Parameters
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years to Stay
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.yearsToStay}
                        onChange={(e) =>
                          handleInputChange('yearsToStay', e.target.value)
                        }
                        className="w-full pl-4 pr-12 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        years
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marginal Tax Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.marginalTaxRate}
                          onChange={(e) =>
                            handleInputChange('marginalTaxRate', e.target.value)
                          }
                          step="1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Investment Return
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs.investmentReturnRate}
                          onChange={(e) =>
                            handleInputChange(
                              'investmentReturnRate',
                              e.target.value
                            )
                          }
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent  font-medium"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results - Right Column (60%) */}
            <div className="lg:col-span-3 space-y-6">
              {results && (
                <>
                  {/* Main Result Card */}
                  <div
                    className={`bg-gradient-to-br ${
                      results.betterOption === 'Buying'
                        ? 'from-green-500 to-emerald-600'
                        : 'from-blue-500 to-indigo-600'
                    } rounded-lg shadow-lg p-8 text-white`}
                  >
                    <div className="text-center">
                      <h2 className="text-3xl font-bold mb-4">
                        {results.betterOption} is Better!
                      </h2>
                      <p className="text-5xl font-bold mb-2">
                        {formatCurrency(results.netDifference)}
                      </p>
                      <p className="text-xl opacity-90">
                        savings over {inputs.yearsToStay} years
                      </p>
                      {results.breakEvenYear && (
                        <p className="text-lg mt-4 opacity-90">
                          Break-even: {results.breakEvenYear} year
                          {results.breakEvenYear !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cost Comparison */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Total Cost Comparison
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="border-r border-gray-200 pr-6">
                        <h4 className="text-lg font-medium text-indigo-600 mb-3">
                          Buying Costs
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Down Payment</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.downPaymentAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Closing Costs</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(inputs.buyingClosingCosts)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Mortgage Payments
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(
                                results.monthlyMortgagePayment *
                                  inputs.yearsToStay *
                                  12
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Property Tax</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.totalPropertyTax)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Insurance</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.totalInsurance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">HOA Fees</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.totalHOA)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.totalMaintenance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Selling Costs</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.sellingCosts)}
                            </span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Less: Home Equity</span>
                            <span className="font-medium">
                              -{formatCurrency(results.homeEquity)}
                            </span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Less: Tax Savings</span>
                            <span className="font-medium">
                              -{formatCurrency(results.totalTaxSavings)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-300">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">
                                Total Cost
                              </span>
                              <span className="font-bold text-xl text-gray-900">
                                {formatCurrency(results.totalBuyCost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pl-6">
                        <h4 className="text-lg font-medium text-purple-600 mb-3">
                          Renting Costs
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Rent</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.totalRentPaid)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Renter&apos;s Insurance
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(results.totalRentersInsurance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Security Deposit (Opp. Cost)
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(
                                inputs.securityDeposit *
                                  (Math.pow(
                                    1 + inputs.investmentReturnRate / 100,
                                    inputs.yearsToStay
                                  ) -
                                    1)
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-300 mt-auto">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">
                                Total Cost
                              </span>
                              <span className="font-bold text-xl text-gray-900">
                                {formatCurrency(results.totalRentCost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center mb-2">
                        <Home className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm text-gray-600">
                          Monthly Payment
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(results.monthlyMortgagePayment)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm text-gray-600">
                          Home Equity
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(results.homeEquity)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center mb-2">
                        <PiggyBank className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">
                          Tax Savings
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(results.totalTaxSavings)}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center mb-2">
                        <ChartBar className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-sm text-gray-600">
                          Opportunity Cost
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(results.opportunityCost)}
                      </p>
                    </div>
                  </div>

                  {/* Cost Comparison Chart */}
                  {chartData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="h-96">
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  )}

                  {/* Monthly Housing Costs */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Monthly Housing Costs (Year 1)
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-indigo-600 mb-3">
                          If Buying
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Mortgage (P&I)
                            </span>
                            <span className="font-medium">
                              {formatCurrency(results.monthlyMortgagePayment)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Property Tax</span>
                            <span className="font-medium">
                              {formatCurrency(
                                (inputs.homePrice * inputs.propertyTaxRate) /
                                  100 /
                                  12
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Insurance</span>
                            <span className="font-medium">
                              {formatCurrency(inputs.homeInsuranceAnnual / 12)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">HOA</span>
                            <span className="font-medium">
                              {formatCurrency(inputs.hoaFeesMonthly)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance</span>
                            <span className="font-medium">
                              {formatCurrency(
                                (inputs.homePrice * inputs.maintenancePercent) /
                                  100 /
                                  12
                              )}
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>
                                {formatCurrency(results.monthlyHousingCost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-purple-600 mb-3">
                          If Renting
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Rent</span>
                            <span className="font-medium">
                              {formatCurrency(inputs.monthlyRent)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Renter&apos;s Insurance
                            </span>
                            <span className="font-medium">
                              {formatCurrency(inputs.rentersInsuranceMonthly)}
                            </span>
                          </div>
                          <div className="pt-2 border-t mt-auto">
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>
                                {formatCurrency(
                                  inputs.monthlyRent +
                                    inputs.rentersInsuranceMonthly
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {errors.calculation && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{errors.calculation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Understanding Rent vs Buy Calculations
            </h2>

            <div className="prose max-w-none text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Key Factors in the Decision
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <strong>Time Horizon:</strong> The length of time you plan
                      to stay is crucial. Buying typically becomes more
                      advantageous over longer periods.
                    </li>
                    <li>
                      <strong>Market Conditions:</strong> Home appreciation
                      rates and rent increases significantly impact the
                      calculation.
                    </li>
                    <li>
                      <strong>Opportunity Cost:</strong> Money tied up in a down
                      payment could potentially earn returns if invested
                      elsewhere.
                    </li>
                    <li>
                      <strong>Tax Benefits:</strong> Mortgage interest and
                      property tax deductions can reduce the effective cost of
                      homeownership.
                    </li>
                    <li>
                      <strong>Maintenance Costs:</strong> Homeowners are
                      responsible for all repairs and maintenance, which renters
                      avoid.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Financial Formulas Used
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Monthly Mortgage Payment
                      </h4>
                      <p className="text-sm font-mono bg-white p-2 rounded">
                        M = P × [r(1+r)^n] / [(1+r)^n - 1]
                      </p>
                      <p className="text-xs mt-2">
                        Where: P = Principal, r = Monthly rate, n = Number of
                        payments
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Home Equity</h4>
                      <p className="text-sm font-mono bg-white p-2 rounded">
                        Equity = Current Value - Remaining Loan Balance
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Tax Benefit</h4>
                      <p className="text-sm font-mono bg-white p-2 rounded">
                        Savings = (Interest + Property Tax - Std Deduction) ×
                        Tax Rate
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Important Considerations
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    • This calculator provides a financial comparison only.
                    Non-financial factors like stability, freedom to modify your
                    space, and lifestyle preferences are also important.
                  </li>
                  <li>
                    • Results are based on assumptions about future
                    appreciation, rent increases, and investment returns, which
                    are inherently uncertain.
                  </li>
                  <li>
                    • Tax benefits depend on itemizing deductions, which may not
                    be advantageous for everyone given current standard
                    deduction levels.
                  </li>
                  <li>
                    • Consider consulting with a financial advisor and tax
                    professional for personalized advice.
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  When Buying Makes Sense
                </h3>
                <ul className="space-y-2">
                  <li>✓ You plan to stay in the area for 5+ years</li>
                  <li>✓ You have stable income and good credit</li>
                  <li>
                    ✓ You have savings for down payment and emergency fund
                  </li>
                  <li>
                    ✓ You want to build equity and have a hedge against
                    inflation
                  </li>
                  <li>
                    ✓ You value stability and control over your living space
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  When Renting Makes Sense
                </h3>
                <ul className="space-y-2">
                  <li>✓ You may relocate within a few years</li>
                  <li>✓ You prefer flexibility and minimal responsibilities</li>
                  <li>
                    ✓ You want to invest your savings in higher-return
                    opportunities
                  </li>
                  <li>✓ Local home prices are very high relative to rents</li>
                  <li>
                    ✓ You&apos;re still building your credit or saving for a
                    down payment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
