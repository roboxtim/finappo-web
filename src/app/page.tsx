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
  TrendingDown,
  Search,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Shield,
  Banknote,
  Scale,
  Tag,
  PiggyBank,
  Landmark,
  Receipt,
  Heart,
  Building2,
  Globe,
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
        id: 'loan-calculator',
        title: 'Loan Calculator',
        description:
          'Calculate monthly payments, total interest, and amortization schedules with extra payment options',
        href: '/financial-calculators/loan-calculator',
        icon: <Calculator className="w-5 h-5" />,
        keywords: [
          'loan',
          'monthly payment',
          'amortization',
          'interest',
          'extra payment',
          'payoff',
          'mortgage',
          'auto loan',
        ],
      },
      {
        id: 'repayment-calculator',
        title: 'Repayment Calculator',
        description:
          'Calculate loan repayment with fixed term or fixed payment modes. View amortization schedule and total interest',
        href: '/financial-calculators/repayment-calculator',
        icon: <Calculator className="w-5 h-5" />,
        keywords: [
          'repayment',
          'loan repayment',
          'monthly payment',
          'payoff time',
          'fixed payment',
          'fixed term',
          'amortization',
          'installment',
        ],
      },
      {
        id: 'student-loan-calculator',
        title: 'Student Loan Calculator',
        description:
          'Calculate student loan payments, compare repayment strategies with extra payments, or project future loan costs',
        href: '/financial-calculators/student-loan-calculator',
        icon: <Calculator className="w-5 h-5" />,
        keywords: [
          'student loan',
          'college loan',
          'education loan',
          'student debt',
          'loan projection',
          'extra payment',
          'student loan payoff',
          'graduate loan',
          'federal student loan',
          'student loan repayment',
        ],
      },
      {
        id: 'currency-calculator',
        title: 'Currency Calculator',
        description:
          'Convert between world currencies with real-time exchange rates for USD, EUR, GBP, JPY, and more',
        href: '/financial-calculators/currency-calculator',
        icon: <Globe className="w-5 h-5" />,
        keywords: [
          'currency calculator',
          'currency converter',
          'exchange rate',
          'forex',
          'usd to eur',
          'usd to gbp',
          'currency exchange',
          'money converter',
          'fx calculator',
          'foreign exchange',
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
        id: 'credit-card-calculator',
        title: 'Credit Card Calculator',
        description:
          'Calculate payoff time, interest charges, and create a debt-free plan',
        href: '/financial-calculators/credit-card-calculator',
        icon: <CreditCard className="w-5 h-5" />,
        keywords: [
          'credit card',
          'payoff',
          'interest',
          'minimum payment',
          'debt',
          'apr',
        ],
      },
      {
        id: 'debt-payoff-calculator',
        title: 'Debt Payoff Calculator',
        description:
          'Compare debt avalanche vs snowball strategies and calculate payoff time',
        href: '/financial-calculators/debt-payoff-calculator',
        icon: <TrendingDown className="w-5 h-5" />,
        keywords: [
          'debt payoff',
          'debt elimination',
          'debt snowball',
          'debt avalanche',
          'multiple debt',
          'debt free',
          'pay off debt',
        ],
      },
      {
        id: 'debt-consolidation-calculator',
        title: 'Debt Consolidation Calculator',
        description:
          'Compare existing debts with consolidation loan options and calculate real APR',
        href: '/financial-calculators/debt-consolidation-calculator',
        icon: <Scale className="w-5 h-5" />,
        keywords: [
          'debt consolidation',
          'consolidation loan',
          'combine debts',
          'consolidate credit cards',
          'real APR',
          'loan fees',
          'debt refinance',
          'consolidation savings',
        ],
      },
      {
        id: 'apr-calculator',
        title: 'APR Calculator',
        description:
          'Calculate the true cost of a loan including all fees and interest',
        href: '/financial-calculators/apr-calculator',
        icon: <Percent className="w-5 h-5" />,
        keywords: [
          'apr',
          'annual percentage rate',
          'effective rate',
          'loan cost',
          'true cost',
          'nominal rate',
          'fees',
          'apr vs interest rate',
        ],
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
        id: 'inflation-calculator',
        title: 'Inflation Calculator',
        description:
          'Calculate purchasing power and see how inflation impacts your money over time',
        href: '/financial-calculators/inflation-calculator',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'inflation calculator',
          'purchasing power calculator',
          'inflation rate calculator',
          'cpi calculator',
          'cost of living calculator',
          'inflation adjusted calculator',
          'real value calculator',
          'money value calculator',
          'inflation impact',
          'historical inflation',
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
      {
        id: 'bond-calculator',
        title: 'Bond Calculator',
        description:
          'Calculate bond prices, yield to maturity, current yield, and total returns',
        href: '/financial-calculators/bond-calculator',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'bond calculator',
          'bond price calculator',
          'yield to maturity calculator',
          'ytm calculator',
          'corporate bond calculator',
          'government bond calculator',
          'bond valuation',
          'fixed income calculator',
          'bond yield calculator',
          'coupon bond calculator',
          'bond pricing',
          'treasury bond calculator',
          'municipal bond calculator',
          'bond investment calculator',
        ],
      },
      {
        id: 'average-return',
        title: 'Average Return Calculator',
        description:
          'Calculate arithmetic mean, geometric mean (CAGR), and annualized returns for investment portfolios',
        href: '/financial-calculators/average-return',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'average return calculator',
          'cagr calculator',
          'geometric mean calculator',
          'arithmetic mean calculator',
          'annualized return calculator',
          'investment return calculator',
          'portfolio return calculator',
          'compound annual growth rate',
          'average annual return',
          'investment performance',
          'return on investment',
          'roi calculator',
          'investment analysis',
          'portfolio performance',
        ],
      },
      {
        id: 'irr-calculator',
        title: 'IRR Calculator',
        description:
          'Calculate Internal Rate of Return, MIRR, NPV, and payback period for investments with irregular cash flows',
        href: '/financial-calculators/irr-calculator',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'irr calculator',
          'internal rate of return',
          'mirr calculator',
          'modified internal rate of return',
          'npv calculator',
          'net present value',
          'payback period calculator',
          'cash flow analysis',
          'investment return calculator',
          'project evaluation',
          'capital budgeting',
          'roi calculator',
          'discount rate',
          'investment analysis',
        ],
      },
      {
        id: 'roi-calculator',
        title: 'ROI Calculator',
        description:
          'Calculate Return on Investment with annualized ROI, scenario comparison, and growth projections',
        href: '/financial-calculators/roi-calculator',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'roi calculator',
          'return on investment',
          'investment return calculator',
          'roi percentage',
          'annualized roi',
          'investment profit calculator',
          'roi formula',
          'calculate roi',
          'investment performance',
          'profitability calculator',
          'investment comparison',
          'roi analysis',
          'return calculator',
          'investment roi',
        ],
      },
      {
        id: 'take-home-pay',
        title: 'Take Home Pay Calculator',
        description:
          'Calculate net salary after federal tax, FICA, state tax, and deductions with 2025 tax brackets',
        href: '/financial-calculators/take-home-pay-calculator',
        icon: <Wallet className="w-5 h-5" />,
        keywords: [
          'take home pay',
          'net pay',
          'paycheck calculator',
          'salary after tax',
          'gross to net',
          'paycheck',
          'federal tax',
          'fica',
          'state tax',
          'net income',
          'after tax income',
          'pay stub',
          'wage calculator',
        ],
      },
      {
        id: 'marriage-calculator',
        title: 'Marriage Tax Calculator',
        description:
          'Compare taxes when filing jointly vs separately. Calculate marriage penalty or bonus with 2025 tax brackets',
        href: '/financial-calculators/marriage-calculator',
        icon: <Heart className="w-5 h-5" />,
        keywords: [
          'marriage calculator',
          'marriage penalty calculator',
          'marriage tax calculator',
          'marriage bonus',
          'tax marriage penalty',
          'married filing jointly vs separately',
          'marriage tax benefits',
          'wedding tax calculator',
          'tax implications of marriage',
          '2025 marriage tax',
        ],
      },
      {
        id: 'payback-period-calculator',
        title: 'Payback Period Calculator',
        description:
          'Calculate investment recovery time with simple and discounted payback period analysis',
        href: '/financial-calculators/payback-period-calculator',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'payback period calculator',
          'investment recovery calculator',
          'break-even calculator',
          'payback period',
          'discounted payback period',
          'investment payback',
          'recovery time calculator',
          'capital recovery',
          'investment analysis',
          'cash flow payback',
          'roi payback',
          'time to recover investment',
          'payback analysis',
          'investment recovery time',
        ],
      },
      {
        id: 'present-value',
        title: 'Present Value Calculator',
        description:
          'Calculate present value of future cash flows including lump sums, annuities, and growing annuities',
        href: '/financial-calculators/present-value',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'present value calculator',
          'pv calculator',
          'time value of money',
          'discount rate calculator',
          'annuity present value',
          'future value to present value',
          'discounted cash flow',
          'npv calculator',
          'investment valuation',
          'cash flow present value',
          'growing annuity',
          'ordinary annuity',
          'annuity due',
          'present worth',
        ],
      },
      {
        id: 'future-value',
        title: 'Future Value Calculator',
        description:
          'Calculate future value with compound growth including lump sums, annuities, and retirement projections',
        href: '/financial-calculators/future-value',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'future value calculator',
          'fv calculator',
          'compound interest calculator',
          'investment growth calculator',
          'retirement calculator',
          'savings growth calculator',
          'compound growth',
          'annuity future value',
          'growing annuity calculator',
          'wealth calculator',
          'investment projection',
          'savings projection',
          'retirement planning',
          'future worth',
        ],
      },
      {
        id: 'annuity',
        title: 'Annuity Calculator',
        description:
          'Calculate annuity payments, future value, and retirement income projections. Compare immediate vs deferred annuities with inflation adjustments',
        href: '/financial-calculators/annuity',
        icon: <Landmark className="w-5 h-5" />,
        keywords: [
          'annuity calculator',
          'annuity payment calculator',
          'future value annuity',
          'retirement annuity',
          'immediate annuity',
          'deferred annuity',
          'annuity income calculator',
          'fixed annuity calculator',
          'annuity growth calculator',
          'annuity projection',
          'retirement income annuity',
          'annuity investment calculator',
          'annuity due calculator',
          'ordinary annuity calculator',
          'annuity savings calculator',
          'annuity accumulation',
          'monthly annuity calculator',
          'annual annuity calculator',
        ],
      },
      {
        id: 'annuity-payout',
        title: 'Annuity Payout Calculator',
        description:
          'Calculate annuity payout amounts and income streams. Plan your retirement income with immediate and deferred annuity payment projections',
        href: '/financial-calculators/annuity-payout',
        icon: <Banknote className="w-5 h-5" />,
        keywords: [
          'annuity payout calculator',
          'annuity payment calculator',
          'retirement income calculator',
          'annuity income calculator',
          'immediate annuity payout',
          'deferred annuity payout',
          'annuity withdrawal calculator',
          'pension payout calculator',
          'annuity amortization calculator',
          'fixed annuity payout',
          'retirement payout calculator',
          'annuity distribution calculator',
          'periodic payment annuity',
          'annuity income stream',
        ],
      },
      {
        id: '401k-calculator',
        title: '401(k) Calculator',
        description:
          'Calculate your 401(k) retirement savings with employer matching, contribution limits, salary increases, and tax-deferred growth projections',
        href: '/financial-calculators/401k-calculator',
        icon: <PiggyBank className="w-5 h-5" />,
        keywords: [
          '401k calculator',
          '401(k) calculator',
          'employer match calculator',
          '401k contribution calculator',
          '401k growth calculator',
          '401k retirement calculator',
          'employer matching calculator',
          '401k balance calculator',
          '401k projection calculator',
          'contribution limit calculator',
          'tax deferred savings calculator',
          '401k catch up contributions',
          'roth 401k calculator',
          'employer sponsored retirement',
          '401k match calculator',
          'retirement savings account calculator',
        ],
      },
      {
        id: 'salary-calculator',
        title: 'Salary Calculator',
        description:
          'Calculate your take-home pay, taxes, and deductions. Convert between hourly, weekly, monthly, and annual salary with federal & state tax withholdings',
        href: '/financial-calculators/salary-calculator',
        icon: <Banknote className="w-5 h-5" />,
        keywords: [
          'salary calculator',
          'paycheck calculator',
          'hourly to salary',
          'salary to hourly',
          'net pay calculator',
          'gross to net',
          'take home pay',
          'salary conversion',
          'wage calculator',
          'income calculator',
          '2025 salary calculator',
          'federal tax calculator',
          'state tax calculator',
          'FICA calculator',
          'tax withholding calculator',
        ],
      },
      {
        id: 'roth-ira-calculator',
        title: 'Roth IRA Calculator',
        description:
          'Plan tax-free retirement savings with a Roth IRA. Compare Roth vs taxable accounts, calculate growth with 2025 contribution limits, and see your tax advantage',
        href: '/financial-calculators/roth-ira-calculator',
        icon: <Shield className="w-5 h-5" />,
        keywords: [
          'roth ira calculator',
          'roth ira',
          'retirement calculator',
          'tax-free retirement',
          'roth ira contribution limits',
          'roth ira vs traditional ira',
          'retirement savings calculator',
          'investment growth calculator',
          'roth ira 2025',
          'tax advantage calculator',
          'retirement planning',
          'roth ira growth',
          'ira calculator',
          'roth conversion calculator',
          'backdoor roth',
          'tax-free growth',
          'roth ira benefits',
          'retirement account calculator',
        ],
      },
      {
        id: 'estate-tax-calculator',
        title: 'Estate Tax Calculator',
        description:
          'Calculate federal and state estate taxes for 2025. Plan your legacy with $13.99M exemption, minimize taxes, and maximize inheritance for heirs',
        href: '/financial-calculators/estate-tax-calculator',
        icon: <Building2 className="w-5 h-5" />,
        keywords: [
          'estate tax calculator',
          'federal estate tax',
          'estate tax exemption',
          'inheritance tax calculator',
          'estate planning calculator',
          '2025 estate tax',
          'estate tax rates',
          'gift tax exemption',
          'estate planning',
          'wealth transfer tax',
          'death tax calculator',
          'estate tax brackets',
          'marital deduction',
          'portability',
          'state estate tax',
          'charitable bequest',
          'lifetime gifts',
          'inheritance planning',
          'wealth transfer',
        ],
      },
      {
        id: 'retirement',
        title: 'Retirement Calculator',
        description:
          'Plan your retirement with comprehensive projections, savings goals, and income analysis including Social Security',
        href: '/financial-calculators/retirement',
        icon: <TrendingUp className="w-5 h-5" />,
        keywords: [
          'retirement calculator',
          'retirement planning calculator',
          'retirement savings calculator',
          'retirement income calculator',
          'how much to retire',
          'retirement planner',
          'social security calculator',
          '4 percent rule',
          'retirement age calculator',
          'retirement fund calculator',
          'nest egg calculator',
          'retirement goal calculator',
        ],
      },
      {
        id: 'pension',
        title: 'Pension Calculator',
        description:
          'Compare pension options: lump sum vs. monthly pension, single-life vs. joint-and-survivor, and early vs. delayed retirement decisions',
        href: '/financial-calculators/pension-calculator',
        icon: <Landmark className="w-5 h-5" />,
        keywords: [
          'pension calculator',
          'pension planner',
          'pension payout calculator',
          'lump sum vs pension',
          'lump sum calculator',
          'monthly pension calculator',
          'pension income calculator',
          'defined benefit pension',
          'pension annuity calculator',
          'single life pension',
          'joint and survivor pension',
          'joint survivor pension calculator',
          'survivor benefit calculator',
          'pension survivor benefits',
          'work longer calculator',
          'early retirement pension',
          'delayed retirement calculator',
          'pension vs lump sum',
          'pension analysis',
          'pension options calculator',
          'pension decision calculator',
          'pension comparison calculator',
          'cola pension calculator',
          'cost of living adjustment pension',
          'pension present value',
          'pension break even calculator',
          'pension vesting calculator',
        ],
      },
      {
        id: 'social-security',
        title: 'Social Security Calculator',
        description:
          'Calculate the optimal age to claim Social Security benefits and maximize your retirement income. Compare claiming at different ages from 62 to 70',
        href: '/financial-calculators/social-security',
        icon: <Shield className="w-5 h-5" />,
        keywords: [
          'social security calculator',
          'social security benefits',
          'retirement age calculator',
          'social security claiming age',
          'social security optimization',
          'retirement planning',
          'social security retirement',
          'early retirement benefits',
          'delayed retirement credits',
          'social security benefits calculator',
          'when to claim social security',
          'social security break even',
          'social security strategy',
          'claiming social security',
          'social security age',
          'cola social security',
          'full retirement age',
          'early social security',
          'delayed social security',
          'social security maximization',
        ],
      },
      {
        id: 'rmd-calculator',
        title: 'RMD Calculator',
        description:
          'Calculate Required Minimum Distributions from retirement accounts using IRS tables',
        href: '/financial-calculators/rmd-calculator',
        icon: <Landmark className="w-5 h-5" />,
        keywords: [
          'rmd calculator',
          'required minimum distribution',
          'ira rmd',
          '401k rmd',
          'retirement distribution',
          'irs life expectancy table',
          'uniform lifetime table',
          'retirement withdrawal',
          'rmd age 73',
          'rmd age 75',
          'secure act 2.0',
          'retirement planning',
          'tax planning',
        ],
      },
      {
        id: 'ira-calculator',
        title: 'IRA Calculator',
        description:
          'Compare Traditional and Roth IRA retirement savings options with tax benefit analysis',
        href: '/financial-calculators/ira-calculator',
        icon: <Shield className="w-5 h-5" />,
        keywords: [
          'ira calculator',
          'roth ira',
          'traditional ira',
          'retirement savings',
          'tax benefits',
          'retirement planning',
          'ira comparison',
          'individual retirement account',
          'tax-advantaged savings',
          'retirement investment',
          'ira contribution limits',
          'roth vs traditional',
          'retirement account calculator',
          'ira growth calculator',
          'tax-deferred growth',
        ],
      },
      {
        id: 'tax-calculator',
        title: 'Tax Calculator',
        description:
          'Calculate your 2025 federal income tax, estimate refunds, and optimize deductions with latest IRS tax brackets',
        href: '/financial-calculators/tax-calculator',
        icon: <Receipt className="w-5 h-5" />,
        keywords: [
          'tax calculator',
          'income tax calculator',
          'federal tax calculator',
          'tax estimator',
          'tax refund calculator',
          '2025 tax brackets',
          'effective tax rate',
          'marginal tax rate',
          'tax deductions',
          'tax credits',
          'child tax credit',
          'earned income tax credit',
          'standard deduction',
          'itemized deductions',
          'tax withholding',
        ],
      },
      {
        id: 'sales-tax-calculator',
        title: 'Sales Tax Calculator',
        description:
          'Calculate sales tax, find price before tax, or determine tax rates for all US states. Features 2025 rates, reverse calculation, and state comparison',
        href: '/financial-calculators/sales-tax-calculator',
        icon: <Receipt className="w-5 h-5" />,
        keywords: [
          'sales tax calculator',
          'calculate sales tax',
          'state sales tax',
          'tax calculator',
          'price with tax',
          'sales tax rate',
          'tax inclusive calculator',
          'reverse sales tax',
          'US sales tax rates',
          'state tax rates 2025',
          'local sales tax',
          'city tax calculator',
          'tax before price',
          'VAT calculator',
          'online sales tax',
          'state tax comparison',
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
              transition={{ delay: 0, duration: 0.6 }}
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
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {filteredCategories.map((category, _categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0,
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
                    {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                    {category.calculators.map((calculator, _calcIndex) => (
                      <motion.div
                        key={calculator.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0,
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
              transition={{ delay: 0, duration: 0.6 }}
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
              transition={{ delay: 0, duration: 0.6 }}
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
