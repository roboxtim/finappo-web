'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay = 0,
}: FeatureCardProps) {
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
      <div className="relative h-full bg-white rounded-3xl p-8 lg:p-10 shadow-sm shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-200 transition-all duration-300 overflow-hidden">
        {/* Gradient Accent */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`}
        />

        {/* Icon */}
        <div
          className={`relative w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center mb-6 shadow-lg transition-transform duration-300`}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
