'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AppStoreButton } from '@/components/landing/AppStoreButton';
import { FeatureCard } from '@/components/landing/FeatureCard';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F8FF] via-white to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Finappo"
                width={40}
                height={40}
                className="w-10 h-10"
                priority
              />
              <span className="text-xl font-semibold tracking-tight text-gray-900">
                Finappo
              </span>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <Link
                href="/app"
                className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl overflow-hidden text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] bg-left transition-all duration-700 ease-in-out group-hover:bg-right" />
                <span className="relative">Try App</span>
                <svg
                  className="relative w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <a
                href="#download"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Download
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl"
            >
              <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
                >
                  Features
                </a>
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl overflow-hidden text-white text-base font-semibold shadow-lg shadow-blue-500/25 transition-shadow"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600" />
                  <span className="relative">Try App</span>
                  <svg
                    className="relative w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <a
                  href="#download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
                >
                  Download
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-blue-700">
                  Now available on iOS
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                Track Your Family Budget.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Simply.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Beautiful, powerful expense tracking designed for families who
                want to spend smarter together.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <AppStoreButton variant="primary" />
                <a
                  href="#features"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <span className="text-base font-semibold text-gray-900">
                    Learn More
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Free to download</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Secure & private</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="font-medium">Made for families</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - iPhone Mockup Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative lg:pl-12"
            >
              {/* Gradient Orb Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 via-cyan-400/20 to-purple-400/30 rounded-full blur-3xl" />

              {/* iPhone Mockup Container */}
              <div className="relative z-10 mx-auto w-full max-w-[280px] lg:max-w-[320px]">
                {/* USER WILL ADD SCREENSHOT HERE */}
                {/* Replace the entire div below with: <Image src="/screenshots/hero.png" ... /> */}
                <div className="relative h-[70vh] min-h-[500px] max-h-[700px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl shadow-blue-500/20 border border-gray-700">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Screenshot Placeholder - Replace this with actual app screenshot */}
	                  <Image
		                  src="/app_1.jpg"
		                  alt="Finappo"
		                  width={320}
		                  height={500}
		                  priority
		                  className="w-full max-w-full h-full object-cover"
	                  />
                  </div>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-20" />
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl shadow-xl shadow-blue-500/30 opacity-80 blur-sm"
                />
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="absolute -bottom-12 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-xl shadow-purple-500/30 opacity-70 blur-sm"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 lg:py-16 bg-white relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Everything you need.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Nothing you don&apos;t.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to make family budgeting simple,
              beautiful, and actually enjoyable.
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              }
              title="Smart Categories"
              description="Create custom budget categories with icons, colors, and flexible periods. Track daily, weekly, monthly, or yearly budgets with smart reset logic."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0}
            />

            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
              title="Family Sharing"
              description="Share budgets with family members. Invite others to track spending together and see real-time updates across all devices."
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0.1}
            />

            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Visual Analytics"
              description="Get instant insights into your spending patterns with beautiful charts and breakdowns. See where your money goes at a glance."
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
              delay={0.2}
            />

            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Quick Transactions"
              description="Log expenses in seconds with our streamlined interface. Add date ranges, filters, and notes to keep everything organized."
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              delay={0.3}
            />

            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
              title="Recurring Budgets"
              description="Set up recurring transactions and budgets that automatically reset. Never miss tracking regular expenses like subscriptions or bills."
              gradient="bg-gradient-to-br from-indigo-500 to-purple-500"
              delay={0.4}
            />

            <FeatureCard
              icon={
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
              }
              title="Real-time Sync"
              description="Firebase-powered cloud sync keeps your data up-to-date across all your devices. Access your budgets anywhere, anytime."
              gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Screenshot Gallery Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Beautiful on every screen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed with care for the iOS platform you love.
            </p>
          </motion.div>

          {/* Screenshot Grid - Placeholder for user screenshots */}
          {/* USER WILL ADD SCREENSHOTS HERE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative h-[70vh] min-h-[500px] max-h-[700px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-2.5 shadow-2xl"
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-[2rem] flex items-center justify-center">
                  <div className="text-center px-6">
                    <p className="text-sm text-gray-500 font-medium">
                      Screenshot {i}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      User will provide
                    </p>
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-20" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section
        id="download"
        className="py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 relative overflow-hidden"
      >
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
              Ready to take control of your family budget?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Download Finappo today and start tracking your spending with
              clarity and confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white text-gray-900 font-semibold shadow-2xl hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="flex flex-col items-start -my-1">
                  <span className="text-xs text-gray-600">Download on the</span>
                  <span className="text-lg font-bold -mt-0.5">App Store</span>
                </div>
              </a>
            </div>

            <p className="mt-8 text-sm text-blue-200">
              Free to download. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Finappo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">Finappo</p>
                <p>© 2025 All rights reserved.</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <a
                href="#features"
                className="hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#download"
                className="hover:text-gray-900 transition-colors"
              >
                Download
              </a>
              <a href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
