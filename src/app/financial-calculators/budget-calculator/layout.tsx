import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Budget Calculator - Personal Finance Planning & Expense Tracker | Finappo',
  description:
    'Free budget calculator for personal finance planning. Track income and expenses across 9 categories, get budget benchmarks, and see surplus/deficit analysis. Monthly and annual budgeting with detailed expense breakdowns.',
  keywords:
    'budget calculator, personal budget calculator, monthly budget calculator, expense tracker, budget planner, income expense calculator, budget breakdown, 50/30/20 budget rule, budget benchmarks, personal finance calculator, household budget calculator',
  openGraph: {
    title: 'Budget Calculator - Track Income & Expenses',
    description:
      'Plan your personal finances with detailed income and expense tracking across all major categories.',
    type: 'website',
  },
};

export default function BudgetCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
