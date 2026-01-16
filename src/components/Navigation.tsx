'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - always links to home */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
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
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/finappo-tool"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              App
            </Link>
            <Link
              href="/finappo-tool#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/finappo-tool#download"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Download
            </Link>
            <Link
              href="/finappo-tool#contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
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
              <Link
                href="/finappo-tool"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                App
              </Link>
              <Link
                href="/finappo-tool#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/finappo-tool#download"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                Download
              </Link>
              <Link
                href="/finappo-tool#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
