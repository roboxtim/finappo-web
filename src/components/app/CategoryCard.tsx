'use client';

import { UserCategory } from '@/lib/types/models';
import { motion } from 'framer-motion';
import { mapIconToEmoji } from '@/lib/utils/iconMapper';

interface CategoryCardProps {
  category: UserCategory;
  amount: number;
  budgetAmount: number;
  percentage: number;
  onClick?: () => void;
}

export default function CategoryCard({
  category,
  amount,
  budgetAmount,
  percentage,
  onClick,
}: CategoryCardProps) {
  const getStatusColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getStatusTextColor = () => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <span>{mapIconToEmoji(category.icon)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            {budgetAmount > 0 && (
              <p className={`text-sm ${getStatusTextColor()}`}>
                ${amount.toFixed(2)} / ${budgetAmount.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {budgetAmount > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${getStatusColor()} transition-colors`}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">
            {percentage.toFixed(0)}% used
          </p>
        </div>
      )}

      {budgetAmount === 0 && amount > 0 && (
        <p className="text-sm text-gray-600">${amount.toFixed(2)} spent</p>
      )}
    </motion.div>
  );
}
