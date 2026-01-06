'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { useState } from 'react';
import {
  Calculator,
  Car,
  CircleDollarSign,
  Percent,
  Home,
  Wallet,
  TrendingUp,
  Search,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Shield,
  Banknote,
  Scale,
  Tag,
} from 'lucide-react';

interface CalculatorItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  keywords: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  calculators: CalculatorItem[];
  gradient: string;
}

const categories: Category[] = [
  {
    id: 'financial',
    name: 'Financial Calculators',
    description:
      'Comprehensive tools for loans, mortgages, investments, and financial planning',
    href: '/financial-calculators',
    icon: <TrendingUp className="w-6 h-6" />,
    gradient: 'from-blue-600 to-indigo-600',
    calculators: [
      {
        id: 'amortization',
        title: 'Amortization Calculator',
        description:
          'Calculate loan amortization with flexible payment frequencies',
        href: '/financial-calculators/amortization',
        icon: <Calculator className="w-5 h-5" />,
        keywords: ['amortization', 'loan', 'payment schedule', 'payoff'],
      },
      {
        id: 'finance',
        title: 'Finance Calculator (TVM)',
        description: 'Advanced Time Value of Money calculator',
        href: '/financial-calculators/finance',
        icon: <Calculator className="w-5 h-5" />,
        keywords: [
          'tvm',
          'time value',
          'present value',
          'future value',
          'payment',
        ],
      },
      {
        id: 'auto-loan',
        title: 'Auto Loan Calculator',
        description: 'Calculate monthly car payments and total interest',
        href: '/financial-calculators/auto-loan',
        icon: <Car className="w-5 h-5" />,
        keywords: ['auto', 'car', 'vehicle', 'loan', 'payment'],
      },
      {
        id: 'auto-lease',
        title: 'Auto Lease Calculator',
        description:
          'Calculate monthly car lease payments including depreciation and fees',
        href: '/financial-calculators/auto-lease',
        icon: <Car className="w-5 h-5" />,
        keywords: [
          'auto lease',
          'car lease',
          'lease payment',
          'vehicle lease',
          'lease calculator',
          'residual value',
          'money factor',
          'cap cost',
          'lease vs buy',
          'leasing',
        ],
      },
      {
        id: 'personal-loan',
        title: 'Personal Loan Calculator',
        description: 'Calculate monthly payments for personal loans',
        href: '/financial-calculators/personal-loan',
        icon: <CircleDollarSign className="w-5 h-5" />,
        keywords: ['personal', 'loan', 'debt', 'consolidation'],
      },
      {
        id: 'payment',
        title: 'Payment Calculator',
        description:
          'Advanced payment calculator with compounding frequencies and balloon payments',
        href: '/financial-calculators/payment',
        icon: <CreditCard className="w-5 h-5" />,
        keywords: [
          'payment',
          'loan',
          'balloon',
          'compounding',
          'annuity',
          'present value',
          'future value',
        ],
      },
      {
        id: 'interest',
        title: 'Interest Calculator',
        description: 'Calculate simple or compound interest on investments',
        href: '/financial-calculators/interest',
        icon: <Percent className="w-5 h-5" />,
        keywords: ['interest', 'compound', 'simple', 'savings', 'investment'],
      },
      {
        id: 'mortgage',
        title: 'Mortgage Calculator',
        description: 'Calculate monthly mortgage payments and amortization',
        href: '/financial-calculators/mortgage',
        icon: <Home className="w-5 h-5" />,
        keywords: ['mortgage', 'home', 'loan', 'house', 'pmi'],
      },
      {
        id: 'fha-loan',
        title: 'FHA Loan Calculator',
        description:
          'Calculate FHA mortgage payments with mortgage insurance premiums (MIP)',
        href: '/financial-calculators/fha-loan',
        icon: <Home className="w-5 h-5" />,
        keywords: [
          'fha',
          'fha loan',
          'mortgage insurance',
          'mip',
          'ufmip',
          'first-time homebuyer',
          'low down payment',
          'government loan',
          'fha mortgage',
        ],
      },
      {
        id: 'va-loan',
        title: 'VA Loan Calculator',
        description:
          'Calculate VA mortgage payments for veterans with no PMI required and 0% down options',
        href: '/financial-calculators/va-loan',
        icon: <Shield className="w-5 h-5" />,
        keywords: [
          'va loan',
          'va mortgage',
          'veterans loan',
          'military mortgage',
          'funding fee',
          'no pmi',
          'disabled veteran',
          'service member',
          'no down payment',
          'va benefits',
          'va home loan',
        ],
      },
      {
        id: 'real-estate',
        title: 'Real Estate Calculator',
        description:
          'Comprehensive home investment analysis with equity, appreciation, and tax savings',
        href: '/financial-calculators/real-estate',
        icon: <Home className="w-5 h-5" />,
        keywords: [
          'real estate',
          'home',
          'investment',
          'property',
          'equity',
          'appreciation',
          'tax deduction',
          'pmi',
          'homeownership',
        ],
      },
      {
        id: 'home-equity-loan',
        title: 'Home Equity Loan Calculator',
        description:
          'Calculate home equity loan payments, LTV ratios, and maximum borrowable amounts',
        href: '/financial-calculators/home-equity-loan',
        icon: <Home className="w-5 h-5" />,
        keywords: [
          'home equity loan',
          'heloc',
          'second mortgage',
          'ltv',
          'cltv',
          'equity',
          'home loan',
          'borrowing against home',
        ],
      },
      {
        id: 'heloc',
        title: 'HELOC Calculator',
        description: 'Calculate HELOC payments with draw and repayment periods',
        href: '/financial-calculators/heloc',
        icon: <Banknote className="w-5 h-5" />,
        keywords: [
          'heloc',
          'home equity line of credit',
          'draw period',
          'repayment period',
          'variable rate',
          'credit line',
          'home equity',
          'interest-only',
        ],
      },
      {
        id: 'down-payment',
        title: 'Down Payment Calculator',
        description:
          'Calculate required down payment, closing costs, and total cash needed for home purchase',
        href: '/financial-calculators/down-payment',
        icon: <Home className="w-5 h-5" />,
        keywords: [
          'down payment',
          'home down payment',
          'mortgage down payment',
          '20 percent down',
          'closing costs',
          'cash needed at closing',
          'PMI calculator',
          'first time home buyer',
          'FHA down payment',
          'home purchase',
        ],
      },
      {
        id: 'rent',
        title: 'Rent Calculator',
        description: 'Calculate total rental costs and affordability',
        href: '/financial-calculators/rent',
        icon: <Wallet className="w-5 h-5" />,
        keywords: ['rent', 'rental', 'apartment', 'housing', 'affordability'],
      },
      {
        id: 'rent-vs-buy',
        title: 'Rent vs Buy Calculator',
        description:
          'Compare the true costs of renting vs buying a home over time',
        href: '/financial-calculators/rent-vs-buy',
        icon: <Scale className="w-5 h-5" />,
        keywords: [
          'rent vs buy',
          'rent or buy',
          'renting vs buying',
          'homeownership',
          'rent vs own',
          'should I buy a house',
          'rent vs mortgage',
          'home buying decision',
          'opportunity cost',
          'tax benefits',
          'home appreciation',
          'break-even',
        ],
      },
      {
        id: 'cash-back-vs-low-interest',
        title: 'Cash Back vs Low Interest Calculator',
        description:
          'Compare cash back rebates versus low interest financing offers',
        href: '/financial-calculators/cash-back-vs-low-interest',
        icon: <Tag className="w-5 h-5" />,
        keywords: [
          'cash back vs low interest',
          'auto loan incentive',
          'dealer incentive calculator',
          'cash rebate or low apr',
          'car financing calculator',
          '0 apr vs cash back',
          'auto rebate',
          'dealer cash back',
          'financing incentive',
          'auto loan deal',
          'car incentive calculator',
        ],
      },
      {
        id: 'investment',
        title: 'Investment Calculator',
        description:
          'Calculate investment growth with compound interest and regular contributions',
        href: '/financial-calculators/investment',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'investment calculator',
          'compound interest calculator',
          'investment growth',
          'retirement calculator',
          'savings calculator',
          'investment return',
          'future value calculator',
          'wealth calculator',
          'portfolio growth',
          'investment planning',
        ],
      },
      {
        id: 'compound-interest',
        title: 'Compound Interest Calculator',
        description:
          'Calculate compound interest with flexible frequencies and contributions',
        href: '/financial-calculators/compound-interest',
        icon: <Percent className="w-5 h-5" />,
        keywords: [
          'compound interest calculator',
          'compound interest',
          'exponential growth',
          'compounding frequency',
          'effective annual rate',
          'continuous compounding',
          'interest on interest',
          'savings growth',
          'compound returns',
          'growth schedule',
        ],
      },
      {
        id: 'interest-rate',
        title: 'Interest Rate Calculator',
        description:
          'Calculate interest rate from loan amount, term, and monthly payment',
        href: '/financial-calculators/interest-rate',
        icon: <Percent className="w-5 h-5" />,
        keywords: [
          'interest rate calculator',
          'APR calculator',
          'calculate interest rate',
          'reverse loan calculator',
          'find interest rate',
          'loan rate calculator',
          'verify dealer quote',
          'what is my interest rate',
          'effective rate calculator',
          'loan APR',
        ],
      },
      {
        id: 'savings',
        title: 'Savings Calculator',
        description:
          'Calculate savings growth with compound interest and regular contributions',
        href: '/financial-calculators/savings',
        icon: <Wallet className="w-5 h-5" />,
        keywords: [
          'savings calculator',
          'compound interest calculator',
          'savings growth calculator',
          'interest calculator',
          'savings account calculator',
          'money growth calculator',
          'investment savings',
          'monthly savings calculator',
          'annual savings calculator',
          'compound interest',
          'savings planner',
          'emergency fund calculator',
          'retirement savings',
          'financial calculator',
        ],
      },
      {
        id: 'simple-interest',
        title: 'Simple Interest Calculator',
        description:
          'Calculate simple interest on loans and investments with I = P × r × t formula',
        href: '/financial-calculators/simple-interest',
        icon: <Percent className="w-5 h-5" />,
        keywords: [
          'simple interest calculator',
          'interest calculator',
          'simple interest formula',
          'calculate simple interest',
          'investment interest',
          'loan interest calculator',
          'auto loan interest',
          'simple vs compound interest',
          'bond interest',
          'straightforward interest',
          'linear interest',
          'non-compounding interest',
        ],
      },
      {
        id: 'cd-calculator',
        title: 'CD Calculator',
        description:
          'Calculate Certificate of Deposit returns with compound interest and APY',
        href: '/financial-calculators/cd-calculator',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'cd calculator',
          'certificate of deposit calculator',
          'cd interest calculator',
          'cd rates',
          'apy calculator',
          'cd maturity calculator',
          'time deposit calculator',
          'cd earnings calculator',
          'certificate deposit',
          'cd investment',
          'fixed deposit calculator',
          'cd compounding',
          'cd interest rates',
          'certificate of deposit returns',
        ],
      },
    ],
  },
];

export default function CalculatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter calculators based on search query
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      calculators: category.calculators.filter(
        (calc) =>
          calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          calc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          calc.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          )
      ),
    }))
    .filter((category) => category.calculators.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-white to-white">
      {/* Navigation */}
      <Navigation />

      {/* Search Section */}
      <section className="relative pt-24 pb-8 lg:pt-32 lg:pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calculators... (e.g., mortgage, loan, interest)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 lg:py-12 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No calculators found
              </h3>
              <p className="text-gray-600">Try a different search term</p>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: categoryIndex * 0.1,
                    duration: 0.6,
                  }}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shadow-lg`}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                          {category.name}
                        </h2>
                        <p className="text-gray-600 text-sm lg:text-base">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={category.href}
                      className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Calculators Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.calculators.map((calculator, calcIndex) => (
                      <motion.div
                        key={calculator.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: categoryIndex * 0.1 + calcIndex * 0.05,
                          duration: 0.5,
                        }}
                      >
                        <Link href={calculator.href}>
                          <div className="group h-full bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                              >
                                {calculator.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                  {calculator.title}
                                </h3>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {calculator.description}
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                              Calculate now
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile View All Link */}
                  <Link
                    href={category.href}
                    className="lg:hidden flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                  >
                    View All {category.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Use Our Calculators?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional-grade financial tools designed for accuracy and ease
              of use
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white mx-auto mb-4">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                100% Free
              </h3>
              <p className="text-gray-600">
                No hidden fees, no signup required. All calculators are
                completely free to use.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Accurate Results
              </h3>
              <p className="text-gray-600">
                Calculations validated against industry standards with
                comprehensive test coverage.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy to Use
              </h3>
              <p className="text-gray-600">
                Intuitive interfaces with helpful tips and instant results as
                you type.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
