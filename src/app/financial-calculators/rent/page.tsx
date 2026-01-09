'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Home, ChevronDown, Info } from 'lucide-react';

interface YearlyProjection {
  year: number;
  monthlyTotal: number;
  annualTotal: number;
}

export default function RentCalculator() {
  // Input states
  const [monthlyRent, setMonthlyRent] = useState<number>(2000);
  const [utilities, setUtilities] = useState<number>(150);
  const [insurance, setInsurance] = useState<number>(25);
  const [parking, setParking] = useState<number>(100);
  const [otherCosts, setOtherCosts] = useState<number>(50);
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [annualIncrease, setAnnualIncrease] = useState<number>(3);
  const [years, setYears] = useState<number>(5);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(6000);

  // Calculated results
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [annualTotal, setAnnualTotal] = useState<number>(0);
  const [costBreakdown, setCostBreakdown] = useState({
    rent: 0,
    utilities: 0,
    insurance: 0,
    parking: 0,
    other: 0,
  });
  const [yearlyProjection, setYearlyProjection] = useState<YearlyProjection[]>(
    []
  );
  const [affordabilityRatio, setAffordabilityRatio] = useState<number>(0);

  // UI state
  const [isProjectionOpen, setIsProjectionOpen] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    year: number;
    monthlyTotal: number;
    annualTotal: number;
    x: number;
  } | null>(null);

  const calculateRent = useCallback(() => {
    // Calculate base monthly total
    let total = monthlyRent + utilities + insurance + parking + otherCosts;

    // Apply discount if any
    if (discount > 0) {
      total = total * (1 - discount / 100);
    }

    // Apply tax if any
    if (taxRate > 0) {
      total = total * (1 + taxRate / 100);
    }

    // Calculate annual total
    const annual = total * 12;

    setMonthlyTotal(total);
    setAnnualTotal(annual);

    // Calculate cost breakdown (proportional to monthly total)
    const baseTotal =
      monthlyRent + utilities + insurance + parking + otherCosts;
    const factor = baseTotal > 0 ? total / baseTotal : 0;

    setCostBreakdown({
      rent: monthlyRent * factor,
      utilities: utilities * factor,
      insurance: insurance * factor,
      parking: parking * factor,
      other: otherCosts * factor,
    });

    // Calculate yearly projection
    const projection: YearlyProjection[] = [];
    for (let year = 1; year <= years; year++) {
      const yearlyMonthlyTotal =
        total * Math.pow(1 + annualIncrease / 100, year - 1);
      const yearlyAnnualTotal = yearlyMonthlyTotal * 12;
      projection.push({
        year,
        monthlyTotal: yearlyMonthlyTotal,
        annualTotal: yearlyAnnualTotal,
      });
    }
    setYearlyProjection(projection);

    // Calculate affordability ratio
    const ratio = monthlyIncome > 0 ? (total / monthlyIncome) * 100 : 0;
    setAffordabilityRatio(ratio);
  }, [
    monthlyRent,
    utilities,
    insurance,
    parking,
    otherCosts,
    discount,
    taxRate,
    annualIncrease,
    years,
    monthlyIncome,
  ]);

  useEffect(() => {
    calculateRent();
  }, [calculateRent]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const getAffordabilityColor = (ratio: number) => {
    if (ratio <= 30) return 'text-green-600';
    if (ratio <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAffordabilityMessage = (ratio: number) => {
    if (ratio <= 30) return 'Affordable - Within recommended range';
    if (ratio <= 40) return 'Caution - Above recommended range';
    return 'High Risk - Well above recommended range';
  };

  return (
    <CalculatorLayout
      title="Rent Calculator"
      description="Calculate total rental costs with utilities, insurance, and more"
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
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 self-start"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Rental Costs
              </h2>

              <div className="space-y-6">
                {/* Monthly Rent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Rent
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(monthlyRent)}
                      onChange={(e) =>
                        setMonthlyRent(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Utilities (Electric, Water, Gas)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(utilities)}
                      onChange={(e) =>
                        setUtilities(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Renter's Insurance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Renter&apos;s Insurance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(insurance)}
                      onChange={(e) =>
                        setInsurance(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Parking */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parking
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(parking)}
                      onChange={(e) =>
                        setParking(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Other Costs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Other Monthly Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(otherCosts)}
                      onChange={(e) =>
                        setOtherCosts(parseInputValue(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                  </div>
                </div>

                {/* Discount (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={discount || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setDiscount(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Tax Rate (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax Rate (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={taxRate || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setTaxRate(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Annual Rent Increase */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Rent Increase
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={annualIncrease || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = value.split('.');
                        const formatted =
                          parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : value;
                        setAnnualIncrease(formatted ? Number(formatted) : 0);
                      }}
                      className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </div>

                {/* Years to Calculate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years to Calculate
                  </label>
                  <select
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                  >
                    <option value={1}>1 year</option>
                    <option value={2}>2 years</option>
                    <option value={3}>3 years</option>
                    <option value={5}>5 years</option>
                    <option value={10}>10 years</option>
                    <option value={15}>15 years</option>
                    <option value={20}>20 years</option>
                  </select>
                </div>

                {/* Monthly Income (for affordability) */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Income (for affordability check)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatInputValue(monthlyIncome)}
                      onChange={(e) =>
                        setMonthlyIncome(parseInputValue(e.target.value))
                      }
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
              {/* Monthly Cost Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Total Monthly Cost
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(monthlyTotal)}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Annual Cost</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(annualTotal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">{years}-Year Total</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(
                        yearlyProjection.reduce(
                          (sum, year) => sum + year.annualTotal,
                          0
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Affordability Check */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Affordability Check
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className={`text-4xl font-bold ${getAffordabilityColor(affordabilityRatio)}`}
                    >
                      {affordabilityRatio.toFixed(1)}%
                    </span>
                    <span className="text-gray-500">of monthly income</span>
                  </div>
                  <p
                    className={`text-sm font-medium ${getAffordabilityColor(affordabilityRatio)}`}
                  >
                    {getAffordabilityMessage(affordabilityRatio)}
                  </p>
                </div>

                {/* Affordability Progress Bar */}
                <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-500 ${
                      affordabilityRatio <= 30
                        ? 'bg-green-500'
                        : affordabilityRatio <= 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(affordabilityRatio, 100)}%`,
                    }}
                  />
                  {/* 30% marker */}
                  <div className="absolute left-[30%] top-0 h-full w-0.5 bg-gray-400"></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span className="font-semibold">30% (Recommended)</span>
                  <span>100%</span>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    Financial experts recommend spending no more than{' '}
                    <strong>30% of your gross monthly income</strong> on housing
                    costs to maintain a healthy budget.
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Monthly Cost Breakdown
                </h3>

                {/* Pie Chart Visual */}
                <div className="mb-6">
                  <div className="flex h-12 rounded-xl overflow-hidden mb-4">
                    {costBreakdown.rent > 0 && (
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{
                          width: `${(costBreakdown.rent / monthlyTotal) * 100}%`,
                        }}
                      >
                        {(costBreakdown.rent / monthlyTotal) * 100 > 10 &&
                          'Rent'}
                      </div>
                    )}
                    {costBreakdown.utilities > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{
                          width: `${(costBreakdown.utilities / monthlyTotal) * 100}%`,
                        }}
                      >
                        {(costBreakdown.utilities / monthlyTotal) * 100 > 8 &&
                          'Util'}
                      </div>
                    )}
                    {costBreakdown.insurance > 0 && (
                      <div
                        className="bg-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{
                          width: `${(costBreakdown.insurance / monthlyTotal) * 100}%`,
                        }}
                      >
                        {(costBreakdown.insurance / monthlyTotal) * 100 > 5 &&
                          'Ins'}
                      </div>
                    )}
                    {costBreakdown.parking > 0 && (
                      <div
                        className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{
                          width: `${(costBreakdown.parking / monthlyTotal) * 100}%`,
                        }}
                      >
                        {(costBreakdown.parking / monthlyTotal) * 100 > 6 &&
                          'Park'}
                      </div>
                    )}
                    {costBreakdown.other > 0 && (
                      <div
                        className="bg-pink-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{
                          width: `${(costBreakdown.other / monthlyTotal) * 100}%`,
                        }}
                      >
                        {(costBreakdown.other / monthlyTotal) * 100 > 5 &&
                          'Other'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm text-gray-600">Rent</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(costBreakdown.rent)}
                      </span>
                    </div>
                    {costBreakdown.utilities > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-500"></div>
                          <span className="text-sm text-gray-600">
                            Utilities
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(costBreakdown.utilities)}
                        </span>
                      </div>
                    )}
                    {costBreakdown.insurance > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-purple-500"></div>
                          <span className="text-sm text-gray-600">
                            Insurance
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(costBreakdown.insurance)}
                        </span>
                      </div>
                    )}
                    {costBreakdown.parking > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-orange-500"></div>
                          <span className="text-sm text-gray-600">Parking</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(costBreakdown.parking)}
                        </span>
                      </div>
                    )}
                    {costBreakdown.other > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-pink-500"></div>
                          <span className="text-sm text-gray-600">Other</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(costBreakdown.other)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-semibold">
                      Total Monthly
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      {formatCurrency(monthlyTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Over Time Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Rental Cost Over Time
                </h3>

                {/* SVG Chart */}
                <div className="relative h-64 mb-6 ml-16">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-16 w-14 text-right">
                    {yearlyProjection.length > 0 && (
                      <>
                        <span>
                          {formatCurrency(
                            yearlyProjection[yearlyProjection.length - 1]
                              .monthlyTotal
                          )}
                        </span>
                        <span>
                          {formatCurrency(
                            (yearlyProjection[0].monthlyTotal +
                              yearlyProjection[yearlyProjection.length - 1]
                                .monthlyTotal) /
                              2
                          )}
                        </span>
                        <span>
                          {formatCurrency(yearlyProjection[0].monthlyTotal)}
                        </span>
                      </>
                    )}
                  </div>

                  <svg
                    className="w-full h-full cursor-crosshair"
                    viewBox="0 0 800 256"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      if (yearlyProjection.length === 0) return;

                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 800;
                      const index = Math.round(
                        (x / 800) * (yearlyProjection.length - 1)
                      );
                      const validIndex = Math.max(
                        0,
                        Math.min(index, yearlyProjection.length - 1)
                      );

                      const year = yearlyProjection[validIndex];
                      const pointX =
                        (validIndex / (yearlyProjection.length - 1)) * 800;

                      setHoveredPoint({
                        year: year.year,
                        monthlyTotal: year.monthlyTotal,
                        annualTotal: year.annualTotal,
                        x: pointX,
                      });
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Grid lines */}
                    <g className="opacity-10">
                      {[0, 0.5, 1].map((y) => (
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
                        id="costGradient"
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
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                    </defs>

                    {yearlyProjection.length > 0 && (
                      <>
                        {/* Area under the line */}
                        <path
                          d={(() => {
                            const minCost = yearlyProjection[0].monthlyTotal;
                            const maxCost =
                              yearlyProjection[yearlyProjection.length - 1]
                                .monthlyTotal;
                            const range = maxCost - minCost;

                            const points = yearlyProjection
                              .map((year, i) => {
                                const x =
                                  (i / (yearlyProjection.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((year.monthlyTotal - minCost) / range) *
                                    200 -
                                  28;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#costGradient)"
                        />

                        {/* Line */}
                        <polyline
                          points={(() => {
                            const minCost = yearlyProjection[0].monthlyTotal;
                            const maxCost =
                              yearlyProjection[yearlyProjection.length - 1]
                                .monthlyTotal;
                            const range = maxCost - minCost;

                            return yearlyProjection
                              .map((year, i) => {
                                const x =
                                  (i / (yearlyProjection.length - 1)) * 800;
                                const y =
                                  256 -
                                  ((year.monthlyTotal - minCost) / range) *
                                    200 -
                                  28;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />

                        {/* Points */}
                        {yearlyProjection.map((year, i) => {
                          const minCost = yearlyProjection[0].monthlyTotal;
                          const maxCost =
                            yearlyProjection[yearlyProjection.length - 1]
                              .monthlyTotal;
                          const range = maxCost - minCost;

                          const x = (i / (yearlyProjection.length - 1)) * 800;
                          const y =
                            256 -
                            ((year.monthlyTotal - minCost) / range) * 200 -
                            28;

                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#3B82F6"
                              stroke="#fff"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </>
                    )}

                    {/* Hover indicator */}
                    {hoveredPoint && (
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
                      <div className="font-bold mb-2 text-base">
                        Year {hoveredPoint.year}
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-gray-300 text-xs">
                            Monthly:
                          </span>
                          <span className="font-semibold ml-2">
                            {formatCurrency(hoveredPoint.monthlyTotal)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-300 text-xs">Annual:</span>
                          <span className="font-semibold ml-2">
                            {formatCurrency(hoveredPoint.annualTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Year 1</span>
                  {years > 2 && <span>Year {Math.floor(years / 2)}</span>}
                  <span>Year {years}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">
                      Starting Monthly
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(monthlyTotal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Year {years} Monthly
                    </div>
                    <div className="text-sm font-semibold text-blue-600">
                      {formatCurrency(
                        yearlyProjection[yearlyProjection.length - 1]
                          ?.monthlyTotal || 0
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Yearly Projection Table Accordion */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsProjectionOpen(!isProjectionOpen)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {years}-Year Cost Projection
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 transition-transform ${
                      isProjectionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProjectionOpen && (
                  <div className="px-8 pb-8 max-h-96 overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-4">
                      Yearly breakdown of rental costs with {annualIncrease}%
                      annual increase
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Year
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Monthly Cost
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Annual Cost
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Increase
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {yearlyProjection.map((year, index) => (
                            <tr
                              key={year.year}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {year.year}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {formatCurrency(year.monthlyTotal)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                {formatCurrency(year.annualTotal)}
                              </td>
                              <td className="px-4 py-3 text-right text-blue-600">
                                {index === 0
                                  ? '-'
                                  : `+${formatCurrency(year.annualTotal - yearlyProjection[index - 1].annualTotal)}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-4 py-3 text-gray-900 font-bold">
                              Total
                            </td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right text-gray-900 font-bold text-base">
                              {formatCurrency(
                                yearlyProjection.reduce(
                                  (sum, year) => sum + year.annualTotal,
                                  0
                                )
                              )}
                            </td>
                            <td className="px-4 py-3"></td>
                          </tr>
                        </tfoot>
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
              Understanding Rental Costs
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The True Cost of Renting
                </h3>
                <p className="mb-4">
                  When budgeting for an apartment or house rental, it&apos;s
                  crucial to consider all associated costs, not just the base
                  rent. This calculator helps you understand the complete
                  picture of your monthly housing expenses.
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Base Rent:</strong> The monthly payment to your
                    landlord
                  </li>
                  <li>
                    <strong>Utilities:</strong> Electricity, water, gas, trash,
                    and internet (typically $100-300/month)
                  </li>
                  <li>
                    <strong>Renter&apos;s Insurance:</strong> Protects your
                    belongings (typically $15-30/month)
                  </li>
                  <li>
                    <strong>Parking:</strong> Monthly parking fees if not
                    included in rent
                  </li>
                  <li>
                    <strong>Other Costs:</strong> Pet fees, storage, amenity
                    fees, etc.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  The 30% Rule for Housing Affordability
                </h3>
                <p className="mb-4">
                  Financial experts recommend spending no more than 30% of your
                  gross monthly income on housing costs. This guideline helps
                  ensure you have enough money for other essential expenses and
                  savings.
                </p>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm">
                    <strong>Example:</strong> If you earn $5,000 per month, your
                    total housing costs should ideally not exceed $1,500 per
                    month.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Planning for Rent Increases
                </h3>
                <p className="mb-4">
                  Most landlords increase rent annually, typically by 3-5%.
                  Understanding how these increases compound over time is
                  essential for long-term budgeting.
                </p>
                <ul className="space-y-2">
                  <li>• Check your lease for maximum allowed rent increases</li>
                  <li>
                    • Many states and cities have rent control laws limiting
                    increases
                  </li>
                  <li>
                    • Factor in annual increases when planning multi-year living
                    arrangements
                  </li>
                  <li>
                    • Consider negotiating longer leases with fixed rent terms
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tips for Reducing Rental Costs
                </h3>
                <ul className="space-y-3">
                  <li>
                    <strong>Negotiate your rent:</strong> Especially in markets
                    with high vacancy rates
                  </li>
                  <li>
                    <strong>Pay upfront:</strong> Some landlords offer discounts
                    for 6-12 months paid in advance
                  </li>
                  <li>
                    <strong>Reduce utility costs:</strong> Use energy-efficient
                    appliances and be mindful of usage
                  </li>
                  <li>
                    <strong>Bundle services:</strong> Consider bundled
                    internet/cable packages for savings
                  </li>
                  <li>
                    <strong>Get roommates:</strong> Sharing costs can
                    significantly reduce per-person expenses
                  </li>
                  <li>
                    <strong>Choose the right location:</strong> Consider
                    trade-offs between location and cost
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Renting vs. Buying Considerations
                </h3>
                <p className="mb-4">
                  While this calculator focuses on rental costs, it&apos;s worth
                  considering the long-term financial implications of renting
                  versus buying:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Benefits of Renting:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Flexibility to move</li>
                      <li>• No maintenance costs</li>
                      <li>• No property taxes</li>
                      <li>• Lower upfront costs</li>
                      <li>• Predictable monthly expenses</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Benefits of Buying:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Building equity</li>
                      <li>• Fixed mortgage payments</li>
                      <li>• Tax deductions</li>
                      <li>• Freedom to customize</li>
                      <li>• Long-term investment</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Notes
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates for planning purposes
                  </li>
                  <li>
                    • Actual costs may vary based on location and property
                  </li>
                  <li>
                    • Always read your lease agreement carefully before signing
                  </li>
                  <li>
                    • Document all costs and keep receipts for tax purposes if
                    applicable
                  </li>
                  <li>
                    • Consider setting up automatic payments to avoid late fees
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
