import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Calculators - Free Loan & Investment Tools | Finappo',
  description: 'Professional financial calculators for loans, mortgages, investments, and more. Calculate payments, interest, and amortization schedules with instant, accurate results.',
  keywords: [
    'financial calculators',
    'loan calculator',
    'mortgage calculator',
    'interest calculator',
    'investment calculator',
    'amortization calculator',
    'auto loan calculator',
    'personal loan calculator',
    'finance calculator',
    'TVM calculator',
  ],
  openGraph: {
    title: 'Financial Calculators - Free Loan & Investment Tools',
    description: 'Professional financial calculators for loans, mortgages, investments, and more. Instant, accurate results.',
    type: 'website',
  },
};

export default function FinancialCalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
