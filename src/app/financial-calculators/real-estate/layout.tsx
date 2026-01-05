import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate Calculator - Home Investment Analysis | Finappo',
  description: 'Comprehensive real estate calculator to analyze home purchase costs, mortgage payments, equity buildup, property appreciation, tax deductions, and total investment returns over time.',
  keywords: [
    'real estate calculator',
    'home investment calculator',
    'property calculator',
    'mortgage calculator',
    'home equity calculator',
    'property appreciation',
    'home buying calculator',
    'real estate investment',
    'home affordability',
    'PMI calculator',
    'property tax calculator',
    'home ownership costs',
    'mortgage interest deduction',
    'home value calculator'
  ],
  openGraph: {
    title: 'Real Estate Calculator - Home Investment Analysis',
    description: 'Analyze your home purchase investment with detailed calculations for mortgage, equity buildup, appreciation, and tax savings.',
    type: 'website',
  },
};

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
