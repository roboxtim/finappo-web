import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Average Return Calculator - Calculate Investment Returns | Finappo',
  description:
    'Free average return calculator to compute arithmetic mean, geometric mean (CAGR), and annualized returns for your investments. Compare multiple investment periods and understand your true portfolio performance.',
  keywords: [
    'average return calculator',
    'investment return calculator',
    'arithmetic mean calculator',
    'geometric mean calculator',
    'CAGR calculator',
    'annualized return calculator',
    'portfolio return calculator',
    'investment performance calculator',
    'compound annual growth rate',
    'average investment return',
    'return on investment calculator',
    'ROI calculator',
    'investment analysis tool',
    'financial calculator',
  ],
  openGraph: {
    title: 'Average Return Calculator - Calculate Investment Returns',
    description:
      'Calculate arithmetic mean, geometric mean (CAGR), and annualized returns for your investments. Free and easy to use.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/average-return',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Average Return Calculator - Calculate Investment Returns',
    description:
      'Calculate arithmetic mean, geometric mean (CAGR), and annualized returns for your investments.',
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/average-return',
  },
};

export default function AverageReturnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
