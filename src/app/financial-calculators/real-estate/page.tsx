'use client';

import { motion } from 'framer-motion';
import { CalculatorLayout } from '@/components/CalculatorLayout';
import { useState, useEffect, useCallback } from 'react';
import { Home, ChevronDown, TrendingUp, DollarSign } from 'lucide-react';

interface YearData {
  year: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  taxDeduction: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  maintenance: number;
  totalCost: number;
  homeValue: number;
  loanBalance: number;
  equity: number;
}

export default function RealEstateCalculator() {
  // Input states - Purchase Details
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [downPaymentDollar, setDownPaymentDollar] = useState<number>(80000);
  const [downPaymentMode, setDownPaymentMode] = useState<'percent' | 'dollar'>(
    'percent'
  );

  // Loan Details
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(7.0);

  // Annual Costs
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState<number>(4800);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1500);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);
  const [maintenanceAnnual, setMaintenanceAnnual] = useState<number>(4000);

  // Rates & Appreciation
  const [appreciationRate, setAppreciationRate] = useState<number>(3.0);
  const [propertyTaxIncreaseRate, setPropertyTaxIncreaseRate] =
    useState<number>(2.0);
  const [insuranceIncreaseRate, setInsuranceIncreaseRate] =
    useState<number>(3.0);
  const [incomeTaxRate, setIncomeTaxRate] = useState<number>(22.0);

  // Calculated results
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [monthlyMortgage, setMonthlyMortgage] = useState<number>(0);
  const [monthlyPMI, setMonthlyPMI] = useState<number>(0);
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState<number>(0);
  const [yearlyData, setYearlyData] = useState<YearData[]>([]);

  // UI states
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [analysisYears, setAnalysisYears] = useState<number>(30);

  // Sync down payment percent and dollar
  useEffect(() => {
    if (downPaymentMode === 'percent') {
      setDownPaymentDollar(homePrice * (downPaymentPercent / 100));
    } else {
      setDownPaymentPercent((downPaymentDollar / homePrice) * 100);
    }
  }, [homePrice, downPaymentPercent, downPaymentDollar, downPaymentMode]);

  const calculateMortgage = useCallback(() => {
    const principal = homePrice - downPaymentDollar;

    if (interestRate === 0) {
      return principal / (loanTermYears * 12);
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;

    const payment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return payment;
  }, [homePrice, downPaymentDollar, interestRate, loanTermYears]);

  const calculatePMI = useCallback(() => {
    const downPercent = (downPaymentDollar / homePrice) * 100;
    if (downPercent >= 20) return 0;

    const principal = homePrice - downPaymentDollar;
    const pmiRate = 0.005; // 0.5% annually
    return (principal * pmiRate) / 12;
  }, [homePrice, downPaymentDollar]);

  const calculateYearlyData = useCallback(() => {
    const principal = homePrice - downPaymentDollar;
    const monthlyRate = interestRate / 100 / 12;
    const mortgage = calculateMortgage();
    const pmi = calculatePMI();

    let remainingBalance = principal;
    const data: YearData[] = [];

    let currentPropertyTax = propertyTaxAnnual;
    let currentInsurance = homeInsuranceAnnual;
    let currentHomeValue = homePrice;

    for (let year = 1; year <= analysisYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      // Calculate 12 months
      for (let month = 1; month <= 12; month++) {
        if (remainingBalance > 0) {
          const interestPayment = remainingBalance * monthlyRate;
          const principalPayment = mortgage - interestPayment;

          yearlyPrincipal += principalPayment;
          yearlyInterest += interestPayment;
          remainingBalance = Math.max(0, remainingBalance - principalPayment);
        }
      }

      // Apply appreciation and increases
      currentHomeValue *= 1 + appreciationRate / 100;

      // Tax deduction (only on mortgage interest)
      const taxDeduction = yearlyInterest * (incomeTaxRate / 100);

      // Calculate equity
      const totalPrincipalPaid = principal - remainingBalance;
      const equity =
        downPaymentDollar + totalPrincipalPaid + (currentHomeValue - homePrice);

      // PMI stops when equity reaches 20% of current home value
      const equityPercent =
        ((downPaymentDollar + totalPrincipalPaid) / homePrice) * 100;
      const yearlyPMI = equityPercent >= 20 ? 0 : pmi * 12;

      data.push({
        year,
        monthlyPayment: mortgage,
        principalPaid: yearlyPrincipal,
        interestPaid: yearlyInterest,
        taxDeduction,
        propertyTax: currentPropertyTax,
        insurance: currentInsurance,
        pmi: yearlyPMI,
        maintenance:
          maintenanceAnnual *
          Math.pow(1 + propertyTaxIncreaseRate / 100, year - 1),
        totalCost:
          mortgage * 12 +
          currentPropertyTax +
          currentInsurance +
          yearlyPMI +
          hoaMonthly * 12 +
          maintenanceAnnual *
            Math.pow(1 + propertyTaxIncreaseRate / 100, year - 1),
        homeValue: currentHomeValue,
        loanBalance: remainingBalance,
        equity,
      });

      // Apply increases for next year
      currentPropertyTax *= 1 + propertyTaxIncreaseRate / 100;
      currentInsurance *= 1 + insuranceIncreaseRate / 100;
    }

    return data;
  }, [
    homePrice,
    downPaymentDollar,
    interestRate,
    loanTermYears,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaMonthly,
    maintenanceAnnual,
    appreciationRate,
    propertyTaxIncreaseRate,
    insuranceIncreaseRate,
    incomeTaxRate,
    analysisYears,
    calculateMortgage,
    calculatePMI,
  ]);

  useEffect(() => {
    const mortgage = calculateMortgage();
    const pmi = calculatePMI();
    const principal = homePrice - downPaymentDollar;

    const monthlyPropertyTax = propertyTaxAnnual / 12;
    const monthlyInsurance = homeInsuranceAnnual / 12;
    const monthlyMaintenance = maintenanceAnnual / 12;

    const total =
      mortgage +
      pmi +
      monthlyPropertyTax +
      monthlyInsurance +
      hoaMonthly +
      monthlyMaintenance;

    setLoanAmount(principal);
    setMonthlyMortgage(mortgage);
    setMonthlyPMI(pmi);
    setTotalMonthlyPayment(total);

    const data = calculateYearlyData();
    setYearlyData(data);
  }, [
    homePrice,
    downPaymentDollar,
    interestRate,
    loanTermYears,
    propertyTaxAnnual,
    homeInsuranceAnnual,
    hoaMonthly,
    maintenanceAnnual,
    calculateMortgage,
    calculatePMI,
    calculateYearlyData,
  ]);

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

  const totalInterest = yearlyData.reduce(
    (sum, year) => sum + year.interestPaid,
    0
  );
  const totalTaxSavings = yearlyData.reduce(
    (sum, year) => sum + year.taxDeduction,
    0
  );
  const finalHomeValue =
    yearlyData[yearlyData.length - 1]?.homeValue || homePrice;
  const finalEquity =
    yearlyData[yearlyData.length - 1]?.equity || downPaymentDollar;
  const totalCostPaid = yearlyData.reduce(
    (sum, year) => sum + year.totalCost,
    0
  );
  const netCost = totalCostPaid - finalHomeValue - totalTaxSavings;

  return (
    <CalculatorLayout
      title="Real Estate Calculator"
      description="Analyze your home purchase investment with detailed cost projections"
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
              {/* Purchase Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Purchase Details
                </h2>

                <div className="space-y-6">
                  {/* Home Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Purchase Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(homePrice)}
                        onChange={(e) =>
                          setHomePrice(parseInputValue(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Down Payment
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => setDownPaymentMode('percent')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          downPaymentMode === 'percent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Percentage
                      </button>
                      <button
                        onClick={() => setDownPaymentMode('dollar')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          downPaymentMode === 'dollar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Dollar Amount
                      </button>
                    </div>
                    {downPaymentMode === 'percent' ? (
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={downPaymentPercent || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(
                              /[^0-9.]/g,
                              ''
                            );
                            setDownPaymentPercent(value ? Number(value) : 0);
                          }}
                          className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatInputValue(downPaymentDollar)}
                          onChange={(e) =>
                            setDownPaymentDollar(
                              parseInputValue(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                        />
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-600">
                      {downPaymentMode === 'percent'
                        ? `= ${formatCurrency(downPaymentDollar)}`
                        : `= ${downPaymentPercent.toFixed(2)}%`}
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loan Term
                    </label>
                    <select
                      value={loanTermYears}
                      onChange={(e) => setLoanTermYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    >
                      <option value={10}>10 years</option>
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={25}>25 years</option>
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
                          setInterestRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annual Costs */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Annual Costs
                </h2>

                <div className="space-y-6">
                  {/* Property Tax */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Property Tax (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(propertyTaxAnnual)}
                        onChange={(e) =>
                          setPropertyTaxAnnual(parseInputValue(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatCurrency(propertyTaxAnnual / 12)}/month
                    </div>
                  </div>

                  {/* Home Insurance */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Insurance (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(homeInsuranceAnnual)}
                        onChange={(e) =>
                          setHomeInsuranceAnnual(
                            parseInputValue(e.target.value)
                          )
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatCurrency(homeInsuranceAnnual / 12)}/month
                    </div>
                  </div>

                  {/* HOA Fees */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      HOA Fees (Monthly)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(hoaMonthly)}
                        onChange={(e) =>
                          setHoaMonthly(parseInputValue(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maintenance (Annual)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatInputValue(maintenanceAnnual)}
                        onChange={(e) =>
                          setMaintenanceAnnual(parseInputValue(e.target.value))
                        }
                        className="w-full pl-8 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatCurrency(maintenanceAnnual / 12)}/month
                    </div>
                  </div>
                </div>
              </div>

              {/* Rates & Growth */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Growth & Tax Rates
                </h2>

                <div className="space-y-6">
                  {/* Home Appreciation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Home Appreciation Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={appreciationRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setAppreciationRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Property Tax Increase */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Property Tax Increase Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={propertyTaxIncreaseRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setPropertyTaxIncreaseRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Insurance Increase */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Insurance Increase Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={insuranceIncreaseRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setInsuranceIncreaseRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Income Tax Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Income Tax Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={incomeTaxRate || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setIncomeTaxRate(value ? Number(value) : 0);
                        }}
                        className="w-full pl-4 pr-8 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      For mortgage interest deduction
                    </div>
                  </div>

                  {/* Analysis Period */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Analysis Period
                    </label>
                    <select
                      value={analysisYears}
                      onChange={(e) => setAnalysisYears(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors  font-medium"
                    >
                      <option value={5}>5 years</option>
                      <option value={10}>10 years</option>
                      <option value={15}>15 years</option>
                      <option value={20}>20 years</option>
                      <option value={25}>25 years</option>
                      <option value={30}>30 years</option>
                    </select>
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
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="text-sm font-medium opacity-90 mb-2">
                  Total Monthly Payment
                </div>
                <div className="text-5xl font-bold mb-6">
                  {formatCurrency(totalMonthlyPayment)}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-75">Mortgage (P&I)</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(monthlyMortgage)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Loan Amount</div>
                    <div className="text-xl font-semibold mt-1">
                      {formatCurrency(loanAmount)}
                    </div>
                  </div>
                </div>
                {monthlyPMI > 0 && (
                  <div className="mt-4 p-3 bg-white/10 rounded-xl">
                    <div className="text-sm opacity-90">
                      PMI: {formatCurrencyDetailed(monthlyPMI)}/month
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      (Required with {downPaymentPercent.toFixed(1)}% down)
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Cost Breakdown */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Monthly Cost Breakdown
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mortgage (P&I)</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(monthlyMortgage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Property Tax</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(propertyTaxAnnual / 12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Home Insurance</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(homeInsuranceAnnual / 12)}
                    </span>
                  </div>
                  {monthlyPMI > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">PMI</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrencyDetailed(monthlyPMI)}
                      </span>
                    </div>
                  )}
                  {hoaMonthly > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">HOA Fees</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(hoaMonthly)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(maintenanceAnnual / 12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900">
                      Total Monthly
                    </span>
                    <span className="font-bold text-blue-600 text-lg">
                      {formatCurrency(totalMonthlyPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Summary */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {analysisYears}-Year Investment Summary
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-green-700 font-medium">
                          Home Value After {analysisYears} Years
                        </div>
                        <div className="text-2xl font-bold text-green-900 mt-1">
                          {formatCurrency(finalHomeValue)}
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      +{formatCurrency(finalHomeValue - homePrice)} appreciation
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-700 font-medium">
                          Total Equity Built
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">
                          {formatCurrency(finalEquity)}
                        </div>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="mt-2 text-sm text-blue-700">
                      Down payment + Principal + Appreciation
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-600">
                        Total Interest
                      </div>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        {formatCurrency(totalInterest)}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <div className="text-xs text-gray-600">Tax Savings</div>
                      <div className="text-lg font-bold text-green-600 mt-1">
                        {formatCurrency(totalTaxSavings)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="text-sm text-indigo-700 font-medium">
                      Net Cost (After Value & Tax Savings)
                    </div>
                    <div className="text-2xl font-bold text-indigo-900 mt-1">
                      {formatCurrency(Math.abs(netCost))}
                    </div>
                    <div className="text-xs text-indigo-600 mt-2">
                      {netCost < 0
                        ? 'Net gain on investment'
                        : 'Total ownership cost'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Equity Growth Chart */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Equity & Home Value Growth
                </h3>

                <div className="relative h-64 mb-6">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 256"
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      if (yearlyData.length === 0) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 800;
                      const index = Math.round(
                        (x / 800) * (yearlyData.length - 1)
                      );
                      const validIndex = Math.max(
                        0,
                        Math.min(index, yearlyData.length - 1)
                      );
                      setHoveredYear(validIndex);
                    }}
                    onMouseLeave={() => setHoveredYear(null)}
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
                        id="equityGradient"
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
                      <linearGradient
                        id="valueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#10B981"
                          stopOpacity="0.1"
                        />
                      </linearGradient>
                    </defs>

                    {yearlyData.length > 0 && (
                      <>
                        {/* Home Value Area */}
                        <path
                          d={(() => {
                            const maxValue = Math.max(
                              ...yearlyData.map((d) => d.homeValue)
                            );
                            const points = yearlyData
                              .map((data, i) => {
                                const x = (i / (yearlyData.length - 1)) * 800;
                                const y =
                                  256 - (data.homeValue / maxValue) * 200;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#valueGradient)"
                        />

                        {/* Home Value Line */}
                        <polyline
                          points={(() => {
                            const maxValue = Math.max(
                              ...yearlyData.map((d) => d.homeValue)
                            );
                            return yearlyData
                              .map((data, i) => {
                                const x = (i / (yearlyData.length - 1)) * 800;
                                const y =
                                  256 - (data.homeValue / maxValue) * 200;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                        />

                        {/* Equity Area */}
                        <path
                          d={(() => {
                            const maxValue = Math.max(
                              ...yearlyData.map((d) => d.homeValue)
                            );
                            const points = yearlyData
                              .map((data, i) => {
                                const x = (i / (yearlyData.length - 1)) * 800;
                                const y = 256 - (data.equity / maxValue) * 200;
                                return `${x},${y}`;
                              })
                              .join(' L ');
                            return `M 0,256 L ${points} L 800,256 Z`;
                          })()}
                          fill="url(#equityGradient)"
                        />

                        {/* Equity Line */}
                        <polyline
                          points={(() => {
                            const maxValue = Math.max(
                              ...yearlyData.map((d) => d.homeValue)
                            );
                            return yearlyData
                              .map((data, i) => {
                                const x = (i / (yearlyData.length - 1)) * 800;
                                const y = 256 - (data.equity / maxValue) * 200;
                                return `${x},${y}`;
                              })
                              .join(' ');
                          })()}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />

                        {/* Hover indicator */}
                        {hoveredYear !== null && (
                          <line
                            x1={(hoveredYear / (yearlyData.length - 1)) * 800}
                            y1="0"
                            x2={(hoveredYear / (yearlyData.length - 1)) * 800}
                            y2="256"
                            stroke="#6B7280"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity="0.6"
                          />
                        )}
                      </>
                    )}
                  </svg>

                  {/* Tooltip */}
                  {hoveredYear !== null && yearlyData[hoveredYear] && (
                    <div
                      className="absolute bg-gray-900 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-10 shadow-xl"
                      style={{
                        left: `${(hoveredYear / (yearlyData.length - 1)) * 100}%`,
                        top: '10%',
                        transform:
                          hoveredYear > yearlyData.length / 2
                            ? 'translateX(-100%)'
                            : 'translateX(10px)',
                      }}
                    >
                      <div className="font-bold mb-2">
                        Year {yearlyData[hoveredYear].year}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-green-500"></div>
                          <span className="text-gray-300 text-xs">
                            Home Value:
                          </span>
                          <span className="font-semibold ml-auto">
                            {formatCurrency(yearlyData[hoveredYear].homeValue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-blue-500"></div>
                          <span className="text-gray-300 text-xs">Equity:</span>
                          <span className="font-semibold ml-auto">
                            {formatCurrency(yearlyData[hoveredYear].equity)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-gray-500"></div>
                          <span className="text-gray-300 text-xs">
                            Loan Balance:
                          </span>
                          <span className="font-semibold ml-auto">
                            {formatCurrency(
                              yearlyData[hoveredYear].loanBalance
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm text-gray-600">Home Value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Equity</span>
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Year 0</span>
                  <span>Year {Math.floor(analysisYears / 2)}</span>
                  <span>Year {analysisYears}</span>
                </div>
              </div>

              {/* Year-by-Year Breakdown */}
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
                      Detailed breakdown of costs, equity, and value by year
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Year
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Home Value
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Equity
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Loan Balance
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Annual Cost
                            </th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">
                              Tax Savings
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {yearlyData.map((data) => (
                            <tr
                              key={data.year}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {data.year}
                              </td>
                              <td className="px-4 py-3 text-right text-green-600 font-medium">
                                {formatCurrency(data.homeValue)}
                              </td>
                              <td className="px-4 py-3 text-right text-blue-600 font-medium">
                                {formatCurrency(data.equity)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {formatCurrency(data.loanBalance)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-900">
                                {formatCurrency(data.totalCost)}
                              </td>
                              <td className="px-4 py-3 text-right text-green-600">
                                {formatCurrency(data.taxDeduction)}
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
              Understanding Real Estate Investment Calculations
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  How Home Ownership Costs Are Calculated
                </h3>
                <p className="mb-4">
                  The total cost of homeownership extends beyond just your
                  monthly mortgage payment. This calculator provides a
                  comprehensive view of all costs involved:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Monthly Mortgage (P&I):</strong> Principal and
                    interest calculated using the standard amortization formula
                  </li>
                  <li>
                    <strong>PMI:</strong> Private Mortgage Insurance (typically
                    0.5% annually) required when down payment is less than 20%
                  </li>
                  <li>
                    <strong>Property Tax:</strong> Annual property taxes divided
                    into monthly payments, with optional annual increase rate
                  </li>
                  <li>
                    <strong>Home Insurance:</strong> Homeowners insurance with
                    optional annual increase rate
                  </li>
                  <li>
                    <strong>HOA Fees:</strong> Monthly homeowners association
                    fees (if applicable)
                  </li>
                  <li>
                    <strong>Maintenance:</strong> Typical rule is 1% of home
                    value annually, adjusted for inflation
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Building Home Equity
                </h3>
                <p className="mb-4">Your home equity grows in three ways:</p>
                <ul className="space-y-2">
                  <li>
                    <strong>Down Payment:</strong> Your initial equity starts
                    with your down payment
                  </li>
                  <li>
                    <strong>Principal Paydown:</strong> Each mortgage payment
                    reduces your loan balance and increases equity
                  </li>
                  <li>
                    <strong>Home Appreciation:</strong> As your property value
                    increases, so does your equity
                  </li>
                </ul>
                <p className="mt-4">
                  The calculator tracks all three components to show your total
                  equity growth over time.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tax Benefits of Homeownership
                </h3>
                <p className="mb-4">
                  One of the key advantages of owning a home is the mortgage
                  interest tax deduction. The calculator estimates your annual
                  tax savings based on:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Mortgage Interest Paid:</strong> The interest
                    portion of your mortgage payment is typically tax-deductible
                  </li>
                  <li>
                    <strong>Your Tax Rate:</strong> The deduction value depends
                    on your marginal income tax rate
                  </li>
                  <li>
                    <strong>Standard Deduction:</strong> You benefit only if
                    your itemized deductions exceed the standard deduction
                  </li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  Note: Tax laws change frequently. Consult a tax professional
                  for personalized advice.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Understanding PMI
                </h3>
                <p className="mb-4">
                  Private Mortgage Insurance (PMI) protects the lender if you
                  default on your loan. Here&apos;s what you need to know:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>When Required:</strong> Typically required when your
                    down payment is less than 20% of the home price
                  </li>
                  <li>
                    <strong>Cost:</strong> Usually 0.5% to 1% of the loan amount
                    annually, paid monthly
                  </li>
                  <li>
                    <strong>Removal:</strong> Can often be removed once you
                    reach 20% equity in your home
                  </li>
                  <li>
                    <strong>FHA vs Conventional:</strong> FHA loans have
                    different PMI rules than conventional loans
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Home Appreciation Rates
                </h3>
                <p className="mb-4">
                  Historical home appreciation varies significantly by location
                  and time period:
                </p>
                <ul className="space-y-2">
                  <li>
                    <strong>Long-term Average:</strong> Historically around 3-4%
                    annually in the US
                  </li>
                  <li>
                    <strong>Location Matters:</strong> Urban areas may see
                    higher appreciation than rural areas
                  </li>
                  <li>
                    <strong>Economic Cycles:</strong> Appreciation rates vary
                    with economic conditions
                  </li>
                  <li>
                    <strong>Not Guaranteed:</strong> Past performance
                    doesn&apos;t guarantee future results
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Important Considerations
                </h3>
                <ul className="space-y-2">
                  <li>
                    • This calculator provides estimates based on the
                    information you enter
                  </li>
                  <li>
                    • Actual costs may vary based on your specific situation and
                    location
                  </li>
                  <li>
                    • Interest rates and property values fluctuate over time
                  </li>
                  <li>
                    • Consider additional costs like moving expenses, closing
                    costs, and renovations
                  </li>
                  <li>
                    • Homeownership includes both financial and non-financial
                    benefits
                  </li>
                  <li>
                    • Always consult with financial and tax professionals for
                    personalized advice
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Calculation Formulas
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Monthly Mortgage Payment:
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-xl font-mono text-sm">
                      M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                    </div>
                    <p className="mt-2 text-sm">
                      Where M = monthly payment, P = principal, r = monthly
                      interest rate, n = number of payments
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Home Value After N Years:
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-xl font-mono text-sm">
                      Value = Initial Price × (1 + appreciation rate)^years
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Total Equity:
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-xl font-mono text-sm">
                      Equity = Down Payment + Principal Paid + (Current Value -
                      Purchase Price)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CalculatorLayout>
  );
}
