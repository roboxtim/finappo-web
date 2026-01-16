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
  TrendingDown,
  Banknote,
  DollarSign,
  Scale,
  Tag,
  PiggyBank,
  Landmark,
  Receipt,
  Heart,
  Globe,
  ShoppingCart,
  GraduationCap,
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
              delay={0}
            />
            <CalculatorCard
              icon={<Car className="w-8 h-8 text-white" />}
              title="Auto Loan Calculator"
              description="Calculate your monthly car payments, total interest, and loan payoff timeline. Compare different loan terms and interest rates to find the best deal."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              href="/financial-calculators/auto-loan"
              delay={0}
            />
            <CalculatorCard
              icon={<Car className="w-8 h-8 text-white" />}
              title="Auto Lease Calculator"
              description="Calculate monthly car lease payments including depreciation, finance fees, and taxes. Compare lease options and understand total lease costs."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              href="/financial-calculators/auto-lease"
              delay={0}
            />
            <CalculatorCard
              icon={<Calculator className="w-8 h-8 text-white" />}
              title="Loan Calculator"
              description="Calculate monthly payments, total interest, and create detailed amortization schedules. See how extra payments can save you money and pay off your loan faster."
              gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
              href="/financial-calculators/loan-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Calculator className="w-8 h-8 text-white" />}
              title="Repayment Calculator"
              description="Calculate loan repayment with two flexible modes: fixed term or fixed payment. View detailed breakdown of principal vs interest and see your complete payoff timeline."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/repayment-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Calculator className="w-8 h-8 text-white" />}
              title="Student Loan Calculator"
              description="Calculate student loan payments with 3 powerful modes: simple calculator, repayment comparison with extra payments, and projection calculator for future costs. Plan your education financing."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/student-loan-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<GraduationCap className="w-8 h-8 text-white" />}
              title="College Cost Calculator"
              description="Estimate future college expenses with inflation, calculate required monthly savings, and see how your savings will grow. Plan for 4-year private, public, or 2-year colleges with 529 plan support."
              gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              href="/financial-calculators/college-cost-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Globe className="w-8 h-8 text-white" />}
              title="Currency Calculator"
              description="Convert between 20+ world currencies including USD, EUR, GBP, JPY, and more. Get instant exchange rates and compare multiple currencies at once."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/currency-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<CircleDollarSign className="w-8 h-8 text-white" />}
              title="Personal Loan Calculator"
              description="Calculate monthly payments for personal loans. Plan debt consolidation, home improvements, or any personal financing needs with accurate estimates."
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              href="/financial-calculators/personal-loan"
              delay={0}
            />
            <CalculatorCard
              icon={<CreditCard className="w-8 h-8 text-white" />}
              title="Credit Card Calculator"
              description="Calculate payoff time, total interest charges, and create a debt-free plan. Compare payment strategies and see how extra payments can save thousands in interest."
              gradient="bg-gradient-to-br from-red-600 to-pink-600"
              href="/financial-calculators/credit-card-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingDown className="w-8 h-8 text-white" />}
              title="Debt Payoff Calculator"
              description="Compare debt avalanche vs snowball strategies for multiple debts. Calculate payoff time, total interest, and see how much you can save with strategic payments."
              gradient="bg-gradient-to-br from-rose-600 to-red-600"
              href="/financial-calculators/debt-payoff-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Scale className="w-8 h-8 text-white" />}
              title="Debt Consolidation Calculator"
              description="Compare existing debts with consolidation loan options. Calculate real APR including fees, monthly payments, and total interest to see if consolidation will save you money."
              gradient="bg-gradient-to-br from-orange-600 to-red-600"
              href="/financial-calculators/debt-consolidation-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="APR Calculator"
              description="Calculate the true cost of a loan including all fees and interest. Compare nominal interest rate vs effective APR to understand what you're really paying."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/apr-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Interest Calculator"
              description="Calculate simple or compound interest on investments. Plan your savings growth with regular contributions, various compounding frequencies, and tax considerations."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              href="/financial-calculators/interest"
              delay={0}
            />
            <CalculatorCard
              icon={<Home className="w-8 h-8 text-white" />}
              title="Mortgage Calculator"
              description="Calculate monthly mortgage payments, total interest, and explore amortization schedules. Compare different scenarios with extra payments to save thousands in interest."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/mortgage"
              delay={0}
            />
            <CalculatorCard
              icon={<Home className="w-8 h-8 text-white" />}
              title="Rent Calculator"
              description="Calculate total rental costs including utilities, insurance, parking, and more. Plan for annual rent increases and check affordability with the 30% rule."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/rent"
              delay={0}
            />
            <CalculatorCard
              icon={<CreditCard className="w-8 h-8 text-white" />}
              title="Payment Calculator"
              description="Advanced payment calculator with balloon payments and multiple compounding frequencies. Calculate exact monthly payments for any loan scenario."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/payment"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Real Estate Calculator"
              description="Comprehensive home investment analysis including appreciation, equity buildup, tax benefits, and total cost of ownership over time."
              gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              href="/financial-calculators/real-estate"
              delay={0}
            />
            <CalculatorCard
              icon={<Building2 className="w-8 h-8 text-white" />}
              title="FHA Loan Calculator"
              description="Calculate FHA mortgage payments with mortgage insurance (MIP and UFMIP). Perfect for first-time homebuyers with lower down payments."
              gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
              href="/financial-calculators/fha-loan"
              delay={0}
            />
            <CalculatorCard
              icon={<Shield className="w-8 h-8 text-white" />}
              title="VA Loan Calculator"
              description="Calculate VA mortgage payments for veterans and military. No PMI/MIP required, with VA funding fee options and comparison with conventional loans."
              gradient="bg-gradient-to-br from-indigo-600 to-blue-600"
              href="/financial-calculators/va-loan"
              delay={0}
            />
            <CalculatorCard
              icon={<Wallet className="w-8 h-8 text-white" />}
              title="Home Equity Loan Calculator"
              description="Calculate home equity loan payments and analyze your borrowing capacity. Check LTV and CLTV ratios to see how much you can borrow."
              gradient="bg-gradient-to-br from-orange-600 to-red-600"
              href="/financial-calculators/home-equity-loan"
              delay={0}
            />
            <CalculatorCard
              icon={<Banknote className="w-8 h-8 text-white" />}
              title="HELOC Calculator"
              description="Calculate HELOC payments with draw and repayment periods. Understand interest-only payments during draw period and amortized payments during repayment."
              gradient="bg-gradient-to-br from-teal-600 to-cyan-600"
              href="/financial-calculators/heloc"
              delay={0}
            />
            <CalculatorCard
              icon={<DollarSign className="w-8 h-8 text-white" />}
              title="Down Payment Calculator"
              description="Calculate required down payment, closing costs, and total cash needed for home purchase. Compare different down payment scenarios and PMI requirements."
              gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              href="/financial-calculators/down-payment"
              delay={0}
            />
            <CalculatorCard
              icon={<Scale className="w-8 h-8 text-white" />}
              title="Rent vs Buy Calculator"
              description="Compare the true costs of renting versus buying a home over time. Factor in mortgage, taxes, appreciation, opportunity costs, and tax benefits to make an informed decision."
              gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
              href="/financial-calculators/rent-vs-buy"
              delay={0}
            />
            <CalculatorCard
              icon={<Tag className="w-8 h-8 text-white" />}
              title="Cash Back vs Low Interest Calculator"
              description="Compare cash back rebates versus low interest financing offers. Calculate which auto loan deal saves you more money over the life of the loan."
              gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
              href="/financial-calculators/cash-back-vs-low-interest"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Investment Calculator"
              description="Calculate investment growth over time with compound interest and regular contributions. See year-by-year breakdown and plan your financial future."
              gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
              href="/financial-calculators/investment"
              delay={0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Compound Interest Calculator"
              description="Calculate compound interest with flexible compounding frequencies and contributions. See detailed growth schedule and understand the power of exponential growth."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/compound-interest"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Inflation Calculator"
              description="Calculate purchasing power and see how inflation impacts your money over time. Understand future value adjustments and real value depreciation."
              gradient="bg-gradient-to-br from-orange-600 to-red-600"
              href="/financial-calculators/inflation-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Interest Rate Calculator"
              description="Reverse calculator to find interest rate from loan amount, term, and payment. Perfect for verifying dealer quotes and comparing loan offers."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/interest-rate"
              delay={0}
            />
            <CalculatorCard
              icon={<Wallet className="w-8 h-8 text-white" />}
              title="Savings Calculator"
              description="Calculate savings growth with compound interest and regular contributions. Plan your emergency fund, retirement savings, or any financial goal with detailed projections."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/savings"
              delay={0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Simple Interest Calculator"
              description="Calculate simple interest on loans and investments. Perfect for auto loans, bonds, and short-term investments with straightforward interest calculations."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/simple-interest"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="CD Calculator"
              description="Calculate Certificate of Deposit returns with various compounding frequencies. Compare APY rates and see your savings grow over time."
              gradient="bg-gradient-to-br from-teal-600 to-cyan-600"
              href="/financial-calculators/cd-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Bond Calculator"
              description="Calculate bond prices, yield to maturity, and returns. Analyze government and corporate bonds with various coupon frequencies."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/bond-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Average Return Calculator"
              description="Calculate arithmetic mean, geometric mean (CAGR), and annualized returns for investment portfolios. Compare different averaging methods."
              gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
              href="/financial-calculators/average-return"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="IRR Calculator"
              description="Calculate Internal Rate of Return for investments with irregular cash flows. Includes MIRR, NPV analysis, and payback period for comprehensive investment evaluation."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/irr-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="ROI Calculator"
              description="Calculate Return on Investment to evaluate profitability. Includes annualized ROI, scenario comparison, and growth projections for smart investment decisions."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/roi-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Wallet className="w-8 h-8 text-white" />}
              title="Take Home Pay Calculator"
              description="Calculate your net salary after federal tax, FICA, state tax, and deductions. See your take-home pay by pay period with accurate 2025 tax calculations."
              gradient="bg-gradient-to-br from-cyan-600 to-blue-600"
              href="/financial-calculators/take-home-pay-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Heart className="w-8 h-8 text-white" />}
              title="Marriage Tax Calculator"
              description="Compare taxes when filing jointly vs separately. Calculate marriage penalty or bonus with 2025 tax brackets and see how marriage affects your tax situation."
              gradient="bg-gradient-to-br from-pink-600 to-rose-600"
              href="/financial-calculators/marriage-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Shield className="w-8 h-8 text-white" />}
              title="IRA Calculator"
              description="Compare Traditional and Roth IRA retirement savings options. Calculate future balances, tax benefits, and determine which IRA type is best for your retirement planning."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/ira-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Payback Period Calculator"
              description="Calculate how long it takes to recover your investment. Includes simple and discounted payback period analysis with break-even visualization."
              gradient="bg-gradient-to-br from-indigo-600 to-blue-600"
              href="/financial-calculators/payback-period-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Present Value Calculator"
              description="Calculate the present value of future cash flows. Includes lump sum, annuity, and growing annuity calculations with discount rate analysis."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/present-value"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Future Value Calculator"
              description="Calculate future value with compound growth. Includes lump sum, annuity, and growing annuity projections for retirement and investment planning."
              gradient="bg-gradient-to-br from-indigo-600 to-purple-600"
              href="/financial-calculators/future-value"
              delay={0}
            />
            <CalculatorCard
              icon={<Landmark className="w-8 h-8 text-white" />}
              title="Annuity Calculator"
              description="Calculate annuity payments, future value, and retirement income projections. Compare immediate vs deferred annuities with inflation adjustments and growth projections."
              gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
              href="/financial-calculators/annuity"
              delay={0}
            />
            <CalculatorCard
              icon={<Banknote className="w-8 h-8 text-white" />}
              title="Annuity Payout Calculator"
              description="Calculate annuity payout amounts and income streams. Plan your retirement income with immediate and deferred annuity payment projections and amortization schedules."
              gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
              href="/financial-calculators/annuity-payout"
              delay={0}
            />
            <CalculatorCard
              icon={<PiggyBank className="w-8 h-8 text-white" />}
              title="401(k) Calculator"
              description="Plan your employer-sponsored 401(k) retirement savings. Calculate growth with employer matching, contribution limits, and tax-deferred compounding over time."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/401k-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Banknote className="w-8 h-8 text-white" />}
              title="Salary Calculator"
              description="Calculate your take-home pay, taxes, and deductions. Convert between hourly, weekly, monthly, and annual salary with federal & state tax withholdings for 2025."
              gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
              href="/financial-calculators/salary-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Shield className="w-8 h-8 text-white" />}
              title="Roth IRA Calculator"
              description="Plan tax-free retirement savings with a Roth IRA. Compare Roth vs taxable accounts, calculate growth with 2025 contribution limits, and see your tax advantage."
              gradient="bg-gradient-to-br from-green-600 to-emerald-600"
              href="/financial-calculators/roth-ira-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Building2 className="w-8 h-8 text-white" />}
              title="Estate Tax Calculator"
              description="Calculate federal and state estate taxes for 2025. Plan your legacy with $13.99M exemption, minimize taxes for heirs, and explore estate planning strategies."
              gradient="bg-gradient-to-br from-amber-600 to-orange-600"
              href="/financial-calculators/estate-tax-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Retirement Calculator"
              description="Plan your retirement with comprehensive projections. Calculate savings needed, monthly contributions, and income analysis with Social Security integration."
              gradient="bg-gradient-to-br from-purple-600 to-pink-600"
              href="/financial-calculators/retirement"
              delay={0}
            />
            <CalculatorCard
              icon={<Landmark className="w-8 h-8 text-white" />}
              title="Pension Calculator"
              description="Compare pension options and make informed retirement decisions. Analyze lump sum vs. monthly pension, single-life vs. joint-and-survivor, and early vs. delayed retirement."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/pension-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Shield className="w-8 h-8 text-white" />}
              title="Social Security Calculator"
              description="Calculate the optimal age to claim Social Security benefits and maximize your retirement income. Compare claiming at different ages from 62 to 70 to find the best strategy."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/social-security"
              delay={0}
            />
            <CalculatorCard
              icon={<Landmark className="w-8 h-8 text-white" />}
              title="RMD Calculator"
              description="Calculate your Required Minimum Distribution from retirement accounts using IRS life expectancy tables. Plan your withdrawals and understand tax implications."
              gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
              href="/financial-calculators/rmd-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Receipt className="w-8 h-8 text-white" />}
              title="Tax Calculator"
              description="Calculate your 2025 federal income tax, estimate refunds, and optimize deductions. Includes latest IRS tax brackets, child tax credits, and earned income credits."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/tax-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<ShoppingCart className="w-8 h-8 text-white" />}
              title="Sales Tax Calculator"
              description="Calculate sales tax, find price before tax, or determine tax rates for all US states. Features 2025 state rates, reverse calculation, and local tax options."
              gradient="bg-gradient-to-br from-violet-600 to-purple-600"
              href="/financial-calculators/sales-tax-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Receipt className="w-8 h-8 text-white" />}
              title="VAT Calculator"
              description="Calculate Value Added Tax from any two known values. Includes common VAT rates for UK (20%), Germany (19%), France (20%), Spain (21%), and Italy (22%)."
              gradient="bg-gradient-to-br from-orange-600 to-red-600"
              href="/financial-calculators/vat-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<TrendingDown className="w-8 h-8 text-white" />}
              title="Depreciation Calculator"
              description="Calculate asset depreciation using straight-line, declining balance, double declining balance, or sum of years' digits methods. Get detailed year-by-year depreciation schedules."
              gradient="bg-gradient-to-br from-amber-600 to-orange-600"
              href="/financial-calculators/depreciation-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Margin Calculator"
              description="Calculate profit margin, markup, revenue, cost, or profit from any two known values. Understand the difference between margin and markup with clear visual breakdowns and formulas."
              gradient="bg-gradient-to-br from-emerald-600 to-green-600"
              href="/financial-calculators/margin-calculator"
              delay={0}
            />
            <CalculatorCard
              icon={<Tag className="w-8 h-8 text-white" />}
              title="Discount Calculator"
              description="Calculate sale prices, discounts, and savings from any two values. Supports both percentage and fixed amount discounts with detailed breakdowns for smart shopping decisions."
              gradient="bg-gradient-to-br from-rose-600 to-pink-600"
              href="/financial-calculators/discount-calculator"
              delay={0.1}
            />
            <CalculatorCard
              icon={<Building2 className="w-8 h-8 text-white" />}
              title="Business Loan Calculator"
              description="Calculate business loan payments, true APR, and total costs including all fees. Get accurate estimates for SBA loans, term loans, and commercial financing with comprehensive breakdown of interest and fees."
              gradient="bg-gradient-to-br from-indigo-600 to-blue-600"
              href="/financial-calculators/business-loan-calculator"
              delay={0.2}
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
