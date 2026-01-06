import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Investment Calculator - Calculate Investment Growth with Compound Interest | Finappo',
  description:
    'Calculate your investment growth over time with compound interest and regular contributions. See year-by-year breakdown and total returns. Free investment calculator with detailed projections.',
  keywords: [
    'investment calculator',
    'compound interest calculator',
    'investment growth',
    'retirement calculator',
    'savings calculator',
    'investment return',
    'future value calculator',
    'compound interest',
    'investment projections',
    'wealth calculator',
    'portfolio growth',
    'investment planning',
    'financial calculator',
    'savings growth',
    'retirement planning',
  ],
  openGraph: {
    title: 'Investment Calculator - Calculate Investment Growth | Finappo',
    description:
      'Calculate your investment growth with compound interest. See how regular contributions and time can build wealth.',
    type: 'website',
  },
};

export default function InvestmentCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
