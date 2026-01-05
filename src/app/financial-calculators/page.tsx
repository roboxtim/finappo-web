'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CalculatorCard } from '@/components/landing/CalculatorCard';
import { Car, CircleDollarSign, Percent, Calculator, Home } from 'lucide-react';

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
              icon={<CircleDollarSign className="w-8 h-8 text-white" />}
              title="Personal Loan Calculator"
              description="Calculate monthly payments for personal loans. Plan debt consolidation, home improvements, or any personal financing needs with accurate estimates."
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              href="/financial-calculators/personal-loan"
              delay={0.3}
            />
            <CalculatorCard
              icon={<Percent className="w-8 h-8 text-white" />}
              title="Interest Calculator"
              description="Calculate simple or compound interest on investments. Plan your savings growth with regular contributions, various compounding frequencies, and tax considerations."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              href="/financial-calculators/interest"
              delay={0.4}
            />
            <CalculatorCard
              icon={<Home className="w-8 h-8 text-white" />}
              title="Mortgage Calculator"
              description="Calculate monthly mortgage payments, total interest, and explore amortization schedules. Compare different scenarios with extra payments to save thousands in interest."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/mortgage"
              delay={0.5}
            />
            <CalculatorCard
              icon={<Home className="w-8 h-8 text-white" />}
              title="Rent Calculator"
              description="Calculate total rental costs including utilities, insurance, parking, and more. Plan for annual rent increases and check affordability with the 30% rule."
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
              href="/financial-calculators/rent"
              delay={0.6}
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
