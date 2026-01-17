'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  Wallet,
  DollarSign,
  Home,
  Car,
  CreditCard,
  ShoppingCart,
  Heart,
  GraduationCap,
  TrendingUp,
  Calculator,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  calculateBudget,
  validateInputs,
  formatCurrency,
  formatPercentage,
  type BudgetInputs,
  type BudgetResults,
  type PeriodType,
  type IncomeInputs,
  type HousingExpenses,
  type TransportationExpenses,
  type DebtExpenses,
  type LivingExpenses,
  type HealthcareExpenses,
  type ChildrenEducationExpenses,
  type SavingsInvestmentExpenses,
  type MiscellaneousExpenses,
} from './calculations';

export default function BudgetCalculator() {
  // Period selection
  const [period, setPeriod] = useState<PeriodType>('monthly');

  // Income states
  const [income, setIncome] = useState<IncomeInputs>({
    salary: 5000,
    pension: 0,
    investments: 0,
    otherIncome: 0,
    incomeTaxRate: 25,
  });

  // Expense states
  const [housing, setHousing] = useState<HousingExpenses>({
    mortgage: 1200,
    propertyTax: 200,
    rental: 0,
    insurance: 100,
    hoaFee: 0,
    homeMaintenance: 100,
    utilities: 200,
  });

  const [transportation, setTransportation] = useState<TransportationExpenses>({
    autoLoan: 300,
    autoInsurance: 150,
    gasoline: 200,
    autoMaintenance: 100,
    parkingTolls: 50,
    otherTransportation: 0,
  });

  const [debt, setDebt] = useState<DebtExpenses>({
    creditCard: 100,
    studentLoan: 200,
    otherLoans: 0,
  });

  const [living, setLiving] = useState<LivingExpenses>({
    food: 500,
    clothing: 100,
    householdSupplies: 100,
    mealsOut: 200,
    other: 100,
  });

  const [healthcare, setHealthcare] = useState<HealthcareExpenses>({
    medicalInsurance: 200,
    medicalSpending: 100,
  });

  const [childrenEducation, setChildrenEducation] =
    useState<ChildrenEducationExpenses>({
      childPersonalCare: 0,
      tuitionSupplies: 0,
      childSupport: 0,
      otherEducation: 0,
    });

  const [savingsInvestment, setSavingsInvestment] =
    useState<SavingsInvestmentExpenses>({
      retirement401k: 500,
      collegeSaving: 0,
      investments: 0,
      emergencyFund: 200,
    });

  const [miscellaneous, setMiscellaneous] = useState<MiscellaneousExpenses>({
    pet: 50,
    giftsDonations: 100,
    hobbiesSports: 100,
    entertainment: 100,
    travelVacation: 200,
    otherExpenses: 50,
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    income: true,
    housing: true,
    transportation: false,
    debt: false,
    living: false,
    healthcare: false,
    childrenEducation: false,
    savingsInvestment: false,
    miscellaneous: false,
  });

  // Results and errors
  const [results, setResults] = useState<BudgetResults | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Automatic calculation on input change
  useEffect(() => {
    const budgetInputs: BudgetInputs = {
      period,
      income,
      housing,
      transportation,
      debt,
      living,
      healthcare,
      childrenEducation,
      savingsInvestment,
      miscellaneous,
    };

    const validationErrors = validateInputs(budgetInputs);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      try {
        const calculatedResults = calculateBudget(budgetInputs);
        setResults(calculatedResults);
      } catch (error) {
        setErrors([
          error instanceof Error ? error.message : 'Calculation error',
        ]);
        setResults(null);
      }
    } else {
      setResults(null);
    }
  }, [
    period,
    income,
    housing,
    transportation,
    debt,
    living,
    healthcare,
    childrenEducation,
    savingsInvestment,
    miscellaneous,
  ]);

  // Helper component for category sections
  const CategorySection = ({
    title,
    icon: Icon,
    sectionKey,
    children,
    total,
  }: {
    title: string;
    icon: typeof Home;
    sectionKey: string;
    children: React.ReactNode;
    total?: number;
  }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {total !== undefined && (
              <p className="text-sm text-gray-600">{formatCurrency(total)}</p>
            )}
          </div>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-6">
          {children}
        </div>
      )}
    </div>
  );

  // Helper component for input fields
  const InputField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
          placeholder="0"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-white to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-6 lg:pt-28 lg:pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/financial-calculators"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Calculators
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Budget Calculator
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Plan your personal finances with detailed income and expense
                tracking
              </p>
            </div>
          </motion.div>
        </div>
      </section>

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
              {/* Period Selection */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Period
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPeriod('monthly')}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                      period === 'monthly'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setPeriod('annual')}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                      period === 'annual'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>

              {/* Income Section */}
              <CategorySection
                title="Income"
                icon={TrendingUp}
                sectionKey="income"
                total={results?.grossIncome}
              >
                <InputField
                  label="Salary & Earned Income"
                  value={income.salary}
                  onChange={(v) => setIncome({ ...income, salary: v })}
                />
                <InputField
                  label="Pension & Social Security"
                  value={income.pension}
                  onChange={(v) => setIncome({ ...income, pension: v })}
                />
                <InputField
                  label="Investments & Savings"
                  value={income.investments}
                  onChange={(v) => setIncome({ ...income, investments: v })}
                />
                <InputField
                  label="Other Income"
                  value={income.otherIncome}
                  onChange={(v) => setIncome({ ...income, otherIncome: v })}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Income Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={income.incomeTaxRate}
                    onChange={(e) =>
                      setIncome({
                        ...income,
                        incomeTaxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                    placeholder="25"
                    step="0.1"
                  />
                </div>
              </CategorySection>

              {/* Housing Section */}
              <CategorySection
                title="Housing & Utilities"
                icon={Home}
                sectionKey="housing"
                total={results?.housingTotal.total}
              >
                <InputField
                  label="Mortgage"
                  value={housing.mortgage}
                  onChange={(v) => setHousing({ ...housing, mortgage: v })}
                />
                <InputField
                  label="Property Tax"
                  value={housing.propertyTax}
                  onChange={(v) => setHousing({ ...housing, propertyTax: v })}
                />
                <InputField
                  label="Rental"
                  value={housing.rental}
                  onChange={(v) => setHousing({ ...housing, rental: v })}
                />
                <InputField
                  label="Insurance"
                  value={housing.insurance}
                  onChange={(v) => setHousing({ ...housing, insurance: v })}
                />
                <InputField
                  label="HOA/Co-Op Fee"
                  value={housing.hoaFee}
                  onChange={(v) => setHousing({ ...housing, hoaFee: v })}
                />
                <InputField
                  label="Home Maintenance"
                  value={housing.homeMaintenance}
                  onChange={(v) =>
                    setHousing({ ...housing, homeMaintenance: v })
                  }
                />
                <InputField
                  label="Utilities"
                  value={housing.utilities}
                  onChange={(v) => setHousing({ ...housing, utilities: v })}
                />
              </CategorySection>

              {/* Transportation Section */}
              <CategorySection
                title="Transportation"
                icon={Car}
                sectionKey="transportation"
                total={results?.transportationTotal.total}
              >
                <InputField
                  label="Auto Loan"
                  value={transportation.autoLoan}
                  onChange={(v) =>
                    setTransportation({ ...transportation, autoLoan: v })
                  }
                />
                <InputField
                  label="Auto Insurance"
                  value={transportation.autoInsurance}
                  onChange={(v) =>
                    setTransportation({ ...transportation, autoInsurance: v })
                  }
                />
                <InputField
                  label="Gasoline"
                  value={transportation.gasoline}
                  onChange={(v) =>
                    setTransportation({ ...transportation, gasoline: v })
                  }
                />
                <InputField
                  label="Auto Maintenance"
                  value={transportation.autoMaintenance}
                  onChange={(v) =>
                    setTransportation({ ...transportation, autoMaintenance: v })
                  }
                />
                <InputField
                  label="Parking/Tolls"
                  value={transportation.parkingTolls}
                  onChange={(v) =>
                    setTransportation({ ...transportation, parkingTolls: v })
                  }
                />
                <InputField
                  label="Other Transportation"
                  value={transportation.otherTransportation}
                  onChange={(v) =>
                    setTransportation({
                      ...transportation,
                      otherTransportation: v,
                    })
                  }
                />
              </CategorySection>

              {/* Debt Section */}
              <CategorySection
                title="Debt & Loan Payments"
                icon={CreditCard}
                sectionKey="debt"
                total={results?.debtTotal.total}
              >
                <InputField
                  label="Credit Card"
                  value={debt.creditCard}
                  onChange={(v) => setDebt({ ...debt, creditCard: v })}
                />
                <InputField
                  label="Student Loan"
                  value={debt.studentLoan}
                  onChange={(v) => setDebt({ ...debt, studentLoan: v })}
                />
                <InputField
                  label="Other Loans"
                  value={debt.otherLoans}
                  onChange={(v) => setDebt({ ...debt, otherLoans: v })}
                />
              </CategorySection>

              {/* Living Expenses Section */}
              <CategorySection
                title="Living Expenses"
                icon={ShoppingCart}
                sectionKey="living"
                total={results?.livingTotal.total}
              >
                <InputField
                  label="Food"
                  value={living.food}
                  onChange={(v) => setLiving({ ...living, food: v })}
                />
                <InputField
                  label="Clothing"
                  value={living.clothing}
                  onChange={(v) => setLiving({ ...living, clothing: v })}
                />
                <InputField
                  label="Household Supplies"
                  value={living.householdSupplies}
                  onChange={(v) =>
                    setLiving({ ...living, householdSupplies: v })
                  }
                />
                <InputField
                  label="Meals Out"
                  value={living.mealsOut}
                  onChange={(v) => setLiving({ ...living, mealsOut: v })}
                />
                <InputField
                  label="Other"
                  value={living.other}
                  onChange={(v) => setLiving({ ...living, other: v })}
                />
              </CategorySection>

              {/* Healthcare Section */}
              <CategorySection
                title="Healthcare"
                icon={Heart}
                sectionKey="healthcare"
                total={results?.healthcareTotal.total}
              >
                <InputField
                  label="Medical Insurance"
                  value={healthcare.medicalInsurance}
                  onChange={(v) =>
                    setHealthcare({ ...healthcare, medicalInsurance: v })
                  }
                />
                <InputField
                  label="Medical Spending"
                  value={healthcare.medicalSpending}
                  onChange={(v) =>
                    setHealthcare({ ...healthcare, medicalSpending: v })
                  }
                />
              </CategorySection>

              {/* Children & Education Section */}
              <CategorySection
                title="Children & Education"
                icon={GraduationCap}
                sectionKey="childrenEducation"
                total={results?.childrenEducationTotal.total}
              >
                <InputField
                  label="Child & Personal Care"
                  value={childrenEducation.childPersonalCare}
                  onChange={(v) =>
                    setChildrenEducation({
                      ...childrenEducation,
                      childPersonalCare: v,
                    })
                  }
                />
                <InputField
                  label="Tuition & Supplies"
                  value={childrenEducation.tuitionSupplies}
                  onChange={(v) =>
                    setChildrenEducation({
                      ...childrenEducation,
                      tuitionSupplies: v,
                    })
                  }
                />
                <InputField
                  label="Child Support"
                  value={childrenEducation.childSupport}
                  onChange={(v) =>
                    setChildrenEducation({
                      ...childrenEducation,
                      childSupport: v,
                    })
                  }
                />
                <InputField
                  label="Other Education"
                  value={childrenEducation.otherEducation}
                  onChange={(v) =>
                    setChildrenEducation({
                      ...childrenEducation,
                      otherEducation: v,
                    })
                  }
                />
              </CategorySection>

              {/* Savings & Investment Section */}
              <CategorySection
                title="Savings & Investments"
                icon={TrendingUp}
                sectionKey="savingsInvestment"
                total={results?.savingsInvestmentTotal.total}
              >
                <InputField
                  label="401k & IRA"
                  value={savingsInvestment.retirement401k}
                  onChange={(v) =>
                    setSavingsInvestment({
                      ...savingsInvestment,
                      retirement401k: v,
                    })
                  }
                />
                <InputField
                  label="College Saving"
                  value={savingsInvestment.collegeSaving}
                  onChange={(v) =>
                    setSavingsInvestment({
                      ...savingsInvestment,
                      collegeSaving: v,
                    })
                  }
                />
                <InputField
                  label="Investments"
                  value={savingsInvestment.investments}
                  onChange={(v) =>
                    setSavingsInvestment({
                      ...savingsInvestment,
                      investments: v,
                    })
                  }
                />
                <InputField
                  label="Emergency Fund & Other"
                  value={savingsInvestment.emergencyFund}
                  onChange={(v) =>
                    setSavingsInvestment({
                      ...savingsInvestment,
                      emergencyFund: v,
                    })
                  }
                />
              </CategorySection>

              {/* Miscellaneous Section */}
              <CategorySection
                title="Miscellaneous"
                icon={Calculator}
                sectionKey="miscellaneous"
                total={results?.miscellaneousTotal.total}
              >
                <InputField
                  label="Pet"
                  value={miscellaneous.pet}
                  onChange={(v) =>
                    setMiscellaneous({ ...miscellaneous, pet: v })
                  }
                />
                <InputField
                  label="Gifts & Donations"
                  value={miscellaneous.giftsDonations}
                  onChange={(v) =>
                    setMiscellaneous({ ...miscellaneous, giftsDonations: v })
                  }
                />
                <InputField
                  label="Hobbies & Sports"
                  value={miscellaneous.hobbiesSports}
                  onChange={(v) =>
                    setMiscellaneous({ ...miscellaneous, hobbiesSports: v })
                  }
                />
                <InputField
                  label="Entertainment & Tickets"
                  value={miscellaneous.entertainment}
                  onChange={(v) =>
                    setMiscellaneous({ ...miscellaneous, entertainment: v })
                  }
                />
                <InputField
                  label="Travel & Vacation"
                  value={miscellaneous.travelVacation}
                  onChange={(v) =>
                    setMiscellaneous({ ...miscellaneous, travelVacation: v })
                  }
                />
                <InputField
                  label="Other Expenses"
                  value={miscellaneous.otherExpenses}
                  onChange={(v) =>
                    setMiscellaneous({ ...miscellaneous, otherExpenses: v })
                  }
                />
              </CategorySection>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-900 mb-2">
                        Please fix the following errors:
                      </h3>
                      <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {results && (
                <>
                  {/* Surplus/Deficit - Hero Card */}
                  <div
                    className={`rounded-3xl p-8 text-white shadow-xl ${
                      results.surplusDeficit >= 0
                        ? 'bg-gradient-to-br from-green-600 to-emerald-600'
                        : 'bg-gradient-to-br from-red-600 to-rose-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium opacity-90 mb-2">
                      <Wallet className="w-4 h-4" />
                      {results.surplusDeficit >= 0 ? 'Surplus' : 'Deficit'}
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {formatCurrency(Math.abs(results.surplusDeficit))}
                    </div>
                    <div className="text-sm opacity-75 mb-6">
                      {formatPercentage(
                        Math.abs(results.surplusDeficitPercentage)
                      )}{' '}
                      of gross income
                    </div>
                  </div>

                  {/* Income & Expenses Summary */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Income & Expenses
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Gross Income</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.grossIncome)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Income Tax</span>
                        <span className="font-semibold text-gray-900">
                          -{formatCurrency(results.incomeTax)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Net Income</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(results.netIncome)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Expenses</span>
                        <span className="font-semibold text-gray-900">
                          -{formatCurrency(results.totalExpenses)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 pt-4 border-t-2 border-gray-200">
                        <span className="text-gray-900 font-bold">
                          {results.surplusDeficit >= 0 ? 'Surplus' : 'Deficit'}
                        </span>
                        <span
                          className={`font-bold text-xl ${
                            results.surplusDeficit >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(Math.abs(results.surplusDeficit))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expense Breakdown */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Expense Breakdown
                    </h3>
                    <div className="space-y-3 text-sm">
                      {[
                        {
                          label: 'Housing & Utilities',
                          ...results.housingTotal,
                        },
                        {
                          label: 'Transportation',
                          ...results.transportationTotal,
                        },
                        { label: 'Debt Payments', ...results.debtTotal },
                        { label: 'Living Expenses', ...results.livingTotal },
                        { label: 'Healthcare', ...results.healthcareTotal },
                        {
                          label: 'Children & Education',
                          ...results.childrenEducationTotal,
                        },
                        {
                          label: 'Savings & Investments',
                          ...results.savingsInvestmentTotal,
                        },
                        {
                          label: 'Miscellaneous',
                          ...results.miscellaneousTotal,
                        },
                      ].map((category, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-700">
                              {category.label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(category.total)} (
                              {formatPercentage(category.percentage)})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Budget Benchmarks */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Budget Benchmarks
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          label: 'Housing',
                          ...results.housingBenchmark,
                          icon:
                            results.housingBenchmark.status === 'good'
                              ? CheckCircle
                              : results.housingBenchmark.status === 'warning'
                                ? AlertTriangle
                                : XCircle,
                          color:
                            results.housingBenchmark.status === 'good'
                              ? 'text-green-600'
                              : results.housingBenchmark.status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-red-600',
                        },
                        {
                          label: 'Transportation',
                          ...results.transportationBenchmark,
                          icon:
                            results.transportationBenchmark.status === 'good'
                              ? CheckCircle
                              : results.transportationBenchmark.status ===
                                  'warning'
                                ? AlertTriangle
                                : XCircle,
                          color:
                            results.transportationBenchmark.status === 'good'
                              ? 'text-green-600'
                              : results.transportationBenchmark.status ===
                                  'warning'
                                ? 'text-yellow-600'
                                : 'text-red-600',
                        },
                        {
                          label: 'Savings',
                          ...results.savingsBenchmark,
                          icon:
                            results.savingsBenchmark.status === 'good'
                              ? CheckCircle
                              : results.savingsBenchmark.status === 'warning'
                                ? AlertTriangle
                                : XCircle,
                          color:
                            results.savingsBenchmark.status === 'good'
                              ? 'text-green-600'
                              : results.savingsBenchmark.status === 'warning'
                                ? 'text-yellow-600'
                                : 'text-red-600',
                        },
                      ].map((benchmark, idx) => {
                        const Icon = benchmark.icon;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${benchmark.color}`} />
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {benchmark.label}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Current: {formatPercentage(benchmark.current)}{' '}
                                  | Target:{' '}
                                  {formatPercentage(benchmark.recommended)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding Section - SEPARATE SECTION AT BOTTOM */}
      {results && (
        <section className="pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Understanding Personal Budgeting: A Complete Guide
              </h3>

              <div className="prose prose-green max-w-none">
                <div className="grid md:grid-cols-2 gap-8 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What is a Budget?
                    </h4>
                    <p className="text-sm mb-4">
                      A budget is a financial plan that tracks income and
                      expenses over a specific period. It helps you understand
                      where your money goes, identify spending patterns, and
                      make informed financial decisions. Good budgeting is the
                      foundation of financial health and achieving long-term
                      goals.
                    </p>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      The 50/30/20 Budgeting Rule
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        <strong>50% Needs:</strong> Essential expenses like
                        housing, utilities, food, transportation, insurance
                      </li>
                      <li>
                        <strong>30% Wants:</strong> Discretionary spending like
                        entertainment, dining out, hobbies, vacations
                      </li>
                      <li>
                        <strong>20% Savings:</strong> Emergency fund,
                        retirement, investments, debt payoff beyond minimums
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Budget Benchmarks Explained
                    </h4>
                    <div className="bg-white rounded-lg p-4 mb-4 text-sm">
                      <p className="mb-2">
                        <strong>Housing (≤30%):</strong> Mortgage/rent, property
                        tax, insurance, utilities, maintenance should not exceed
                        30% of gross income.
                      </p>
                      <p className="mb-2">
                        <strong>Transportation (≤15%):</strong> Car payments,
                        insurance, gas, maintenance, parking should stay below
                        15% of gross income.
                      </p>
                      <p>
                        <strong>Savings (≥15%):</strong> Aim to save at least
                        15% of income for retirement, emergency funds, and other
                        financial goals.
                      </p>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Understanding Your Results
                    </h4>
                    <div className="bg-white rounded-xl p-4 mb-4 text-sm border border-green-100">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Net Income:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(results.netIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Expenses:</span>
                          <span className="font-semibold">
                            {formatCurrency(results.totalExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                          <span>Surplus/Deficit:</span>
                          <span
                            className={
                              results.surplusDeficit >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {formatCurrency(Math.abs(results.surplusDeficit))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Common Budgeting Methods
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        <strong>Zero-Based Budget:</strong> Assign every dollar
                        a purpose until income minus expenses equals zero
                      </li>
                      <li>
                        <strong>Envelope System:</strong> Allocate cash to
                        physical envelopes for different spending categories
                      </li>
                      <li>
                        <strong>Pay Yourself First:</strong> Prioritize savings
                        by automatically transferring to savings before spending
                      </li>
                      <li>
                        <strong>Percentage-Based:</strong> Allocate percentages
                        of income to different categories (like 50/30/20)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Steps to Create an Effective Budget
                    </h4>
                    <ol className="text-sm space-y-2 mb-4 list-decimal list-inside">
                      <li>
                        <strong>Track All Income:</strong> Include salary, side
                        income, investments, and any other sources
                      </li>
                      <li>
                        <strong>List Fixed Expenses:</strong> Rent/mortgage,
                        insurance, loan payments, subscriptions
                      </li>
                      <li>
                        <strong>Track Variable Expenses:</strong> Food,
                        transportation, entertainment, personal care
                      </li>
                      <li>
                        <strong>Set Financial Goals:</strong> Emergency fund,
                        retirement, debt payoff, savings targets
                      </li>
                      <li>
                        <strong>Monitor and Adjust:</strong> Review monthly and
                        adjust categories as needed
                      </li>
                    </ol>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Tips for Successful Budgeting
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        • Use budgeting apps or spreadsheets to track spending
                      </li>
                      <li>• Review and adjust your budget monthly</li>
                      <li>
                        • Build in a &quot;buffer&quot; for unexpected expenses
                      </li>
                      <li>
                        • Automate savings and bill payments to stay consistent
                      </li>
                      <li>
                        • Be realistic with spending categories and amounts
                      </li>
                      <li>
                        • Include sinking funds for irregular expenses (gifts,
                        car maintenance)
                      </li>
                      <li>
                        • Track discretionary spending to identify savings
                        opportunities
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      Common Budgeting Mistakes to Avoid
                    </h4>
                    <ul className="text-sm space-y-2 mb-4">
                      <li>
                        • Forgetting irregular expenses (annual insurance,
                        gifts)
                      </li>
                      <li>
                        • Not building an emergency fund (aim for 3-6 months
                        expenses)
                      </li>
                      <li>
                        • Setting unrealistic spending limits that can&apos;t be
                        maintained
                      </li>
                      <li>• Ignoring small expenses that add up over time</li>
                      <li>
                        • Not accounting for taxes and deductions from income
                      </li>
                      <li>
                        • Failing to adjust budget when life circumstances
                        change
                      </li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mb-2">
                      When to Adjust Your Budget
                    </h4>
                    <p className="text-sm">
                      <strong>Income Changes:</strong> Raise, job loss, side
                      income starts/stops
                      <br />
                      <br />
                      <strong>Life Events:</strong> Marriage, divorce, new
                      child, relocation
                      <br />
                      <br />
                      <strong>Debt Payoff:</strong> When you finish paying a
                      loan, reallocate that money
                      <br />
                      <br />
                      <strong>Goal Achievement:</strong> Reaching savings
                      milestones or changing priorities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
