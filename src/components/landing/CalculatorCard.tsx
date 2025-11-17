'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface CalculatorCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  href: string;
  delay?: number;
}

export function CalculatorCard({
  icon,
  title,
  description,
  gradient,
  href,
  delay = 0,
}: CalculatorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative"
    >
      <Link href={href}>
        <div className="relative h-full bg-white rounded-3xl p-8 lg:p-10 shadow-sm shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-300 overflow-hidden cursor-pointer">
          {/* Gradient Accent */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}
          />

          {/* Icon */}
          <div
            className={`relative w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-4">{description}</p>

          {/* Arrow */}
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-300">
            <span>Open Calculator</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
