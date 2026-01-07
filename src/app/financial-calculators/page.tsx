'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CalculatorCard } from '@/components/landing/CalculatorCard';
import {
  Car,
  CircleDollarSign,
  Percent,
  Calculator,
  Home,
  Wallet,
  CreditCard,
  Building2,
  Shield,
  TrendingUp,
  Banknote,
  DollarSign,
  Scale,
  Tag,
} from 'lucide-react';

export default function FinancialCalculators() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-white to-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-center"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-[1.1]">
              Financial{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Calculators
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Make smarter financial decisions with our free, easy-to-use
              calculators. No signup required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Calculators Grid Section */}
      <section className="py-6 lg:py-8 bg-white relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Calculators Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <CalculatorCard
              icon={<Calculator className="w-8 h-8 text-white" />}
              title="Amortization Calculator"
              description="Calculate loan amortization with flexible payment and compound frequencies. Compare monthly, bi-weekly, or other payment schedules to find the best option for you."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/amortization"
              delay={0}
            />
            <CalculatorCard
              icon={<Calculator className="w-8 h-8 text-white" />}
              title="Finance Calculator"
              description="Advanced Time Value of Money calculator. Solve for any variable: payment amounts, interest rates, number of periods, present value, or future value."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/finance"
              delay={0.1}
            />
            <CalculatorCard
              icon={<Car className="w-8 h-8 text-white" />}
              title="Auto Loan Calculator"
              description="Calculate your monthly car payments, total interest, and loan payoff timeline. Compare different loan terms and interest rates to find the best deal."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              href="/financial-calculators/auto-loan"
              delay={0.2}
            />
            <CalculatorCard
              icon={<Car className="w-8 h-8 text-white" />}
              title="Auto Lease Calculator"
              description="Calculate monthly car lease payments including depreciation, finance fees, and taxes. Compare lease options and understand total lease costs."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              href="/financial-calculators/auto-lease"
              delay={0.25}
            />
            <CalculatorCard
              icon={<CircleDollarSign className="w-8 h-8 text-white" />}
              title="Personal Loan Calculator"
              description="Calculate monthly payments for personal loans. Plan debt consolidation, home improvements, or any personal financing needs with accurate estimates."
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              href="/financial-calculators/personal-loan"
              delay={0.3}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="APR Calculator"
              description="Calculate the true cost of a loan including all fees and interest. Compare nominal interest rate vs effective APR to understand what you're really paying."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/apr-calculator"
              delay={0.4}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Interest Calculator"
              description="Calculate simple or compound interest on investments. Plan your savings growth with regular contributions, various compounding frequencies, and tax considerations."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              href="/financial-calculators/interest"
              delay={0.5}
            />
            <CalculatorCard
              icon={<Home className="w-8 h-8 text-white" />}
              title="Mortgage Calculator"
              description="Calculate monthly mortgage payments, total interest, and explore amortization schedules. Compare different scenarios with extra payments to save thousands in interest."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/mortgage"
              delay={0.6}
            />
            <CalculatorCard
              icon={<Home className="w-8 h-8 text-white" />}
              title="Rent Calculator"
              description="Calculate total rental costs including utilities, insurance, parking, and more. Plan for annual rent increases and check affordability with the 30% rule."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/rent"
              delay={0.7}
            />
            <CalculatorCard
              icon={<CreditCard className="w-8 h-8 text-white" />}
              title="Payment Calculator"
              description="Advanced payment calculator with balloon payments and multiple compounding frequencies. Calculate exact monthly payments for any loan scenario."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/payment"
              delay={0.8}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Real Estate Calculator"
              description="Comprehensive home investment analysis including appreciation, equity buildup, tax benefits, and total cost of ownership over time."
              gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              href="/financial-calculators/real-estate"
              delay={0.9}
            />
            <CalculatorCard
              icon={<Building2 className="w-8 h-8 text-white" />}
              title="FHA Loan Calculator"
              description="Calculate FHA mortgage payments with mortgage insurance (MIP and UFMIP). Perfect for first-time homebuyers with lower down payments."
              gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
              href="/financial-calculators/fha-loan"
              delay={1.0}
            />
            <CalculatorCard
              icon={<Shield className="w-8 h-8 text-white" />}
              title="VA Loan Calculator"
              description="Calculate VA mortgage payments for veterans and military. No PMI/MIP required, with VA funding fee options and comparison with conventional loans."
              gradient="bg-gradient-to-br from-indigo-600 to-blue-600"
              href="/financial-calculators/va-loan"
              delay={1.1}
            />
            <CalculatorCard
              icon={<Wallet className="w-8 h-8 text-white" />}
              title="Home Equity Loan Calculator"
              description="Calculate home equity loan payments and analyze your borrowing capacity. Check LTV and CLTV ratios to see how much you can borrow."
              gradient="bg-gradient-to-br from-orange-600 to-red-600"
              href="/financial-calculators/home-equity-loan"
              delay={1.2}
            />
            <CalculatorCard
              icon={<Banknote className="w-8 h-8 text-white" />}
              title="HELOC Calculator"
              description="Calculate HELOC payments with draw and repayment periods. Understand interest-only payments during draw period and amortized payments during repayment."
              gradient="bg-gradient-to-br from-teal-600 to-cyan-600"
              href="/financial-calculators/heloc"
              delay={1.3}
            />
            <CalculatorCard
              icon={<DollarSign className="w-8 h-8 text-white" />}
              title="Down Payment Calculator"
              description="Calculate required down payment, closing costs, and total cash needed for home purchase. Compare different down payment scenarios and PMI requirements."
              gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              href="/financial-calculators/down-payment"
              delay={1.4}
            />
            <CalculatorCard
              icon={<Scale className="w-8 h-8 text-white" />}
              title="Rent vs Buy Calculator"
              description="Compare the true costs of renting versus buying a home over time. Factor in mortgage, taxes, appreciation, opportunity costs, and tax benefits to make an informed decision."
              gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
              href="/financial-calculators/rent-vs-buy"
              delay={1.5}
            />
            <CalculatorCard
              icon={<Tag className="w-8 h-8 text-white" />}
              title="Cash Back vs Low Interest Calculator"
              description="Compare cash back rebates versus low interest financing offers. Calculate which auto loan deal saves you more money over the life of the loan."
              gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
              href="/financial-calculators/cash-back-vs-low-interest"
              delay={1.6}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Investment Calculator"
              description="Calculate investment growth over time with compound interest and regular contributions. See year-by-year breakdown and plan your financial future."
              gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
              href="/financial-calculators/investment"
              delay={1.7}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Compound Interest Calculator"
              description="Calculate compound interest with flexible compounding frequencies and contributions. See detailed growth schedule and understand the power of exponential growth."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/compound-interest"
              delay={1.8}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Interest Rate Calculator"
              description="Reverse calculator to find interest rate from loan amount, term, and payment. Perfect for verifying dealer quotes and comparing loan offers."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/interest-rate"
              delay={1.9}
            />
            <CalculatorCard
              icon={<Wallet className="w-8 h-8 text-white" />}
              title="Savings Calculator"
              description="Calculate savings growth with compound interest and regular contributions. Plan your emergency fund, retirement savings, or any financial goal with detailed projections."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/savings"
              delay={2.0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Simple Interest Calculator"
              description="Calculate simple interest on loans and investments. Perfect for auto loans, bonds, and short-term investments with straightforward interest calculations."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/simple-interest"
              delay={2.1}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="CD Calculator"
              description="Calculate Certificate of Deposit returns with various compounding frequencies. Compare APY rates and see your savings grow over time."
              gradient="bg-gradient-to-br from-teal-600 to-cyan-600"
              href="/financial-calculators/cd-calculator"
              delay={2.2}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Bond Calculator"
              description="Calculate bond prices, yield to maturity, and returns. Analyze government and corporate bonds with various coupon frequencies."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/bond-calculator"
              delay={2.3}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Average Return Calculator"
              description="Calculate arithmetic mean, geometric mean (CAGR), and annualized returns for investment portfolios. Compare different averaging methods."
              gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
              href="/financial-calculators/average-return"
              delay={2.4}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="IRR Calculator"
              description="Calculate Internal Rate of Return for investments with irregular cash flows. Includes MIRR, NPV analysis, and payback period for comprehensive investment evaluation."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/irr-calculator"
              delay={2.5}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="ROI Calculator"
              description="Calculate Return on Investment to evaluate profitability. Includes annualized ROI, scenario comparison, and growth projections for smart investment decisions."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/roi-calculator"
              delay={2.6}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Payback Period Calculator"
              description="Calculate how long it takes to recover your investment. Includes simple and discounted payback period analysis with break-even visualization."
              gradient="bg-gradient-to-br from-indigo-600 to-blue-600"
              href="/financial-calculators/payback-period-calculator"
              delay={2.7}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Track your finances with Finappo
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Beyond calculators - manage your family budget with our beautiful
              iOS app. Free to download.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://apps.apple.com/us/app/finappo/id6754455387"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white text-gray-900 font-semibold shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="flex flex-col items-start -my-1">
                  <span className="text-xs text-gray-600">Download on the</span>
                  <span className="text-lg font-bold -mt-0.5">App Store</span>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Copyright */}
            <div className="text-sm text-gray-600 text-center md:text-left">
              <p className="font-medium text-gray-900">Finappo</p>
              <p>© 2025 All rights reserved.</p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link
                href="/#features"
                className="hover:text-gray-900 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/#download"
                className="hover:text-gray-900 transition-colors"
              >
                Download
              </Link>
              <Link
                href="/privacy"
                className="hover:text-gray-900 transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
