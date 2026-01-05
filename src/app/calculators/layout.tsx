import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Financial Calculators - Loans, Mortgages, Investments | Finappo',
  description: 'Comprehensive collection of free financial calculators including mortgage, loan, interest, amortization, and rental calculators. Make informed financial decisions with accurate calculations.',
  keywords: [
    'financial calculators',
    'loan calculator',
    'mortgage calculator',
    'interest calculator',
    'investment calculator',
    'amortization calculator',
    'rent calculator',
    'auto loan calculator',
    'personal loan calculator',
    'free calculators',
    'financial planning tools',
    'money calculator',
  ],
  openGraph: {
    title: 'Free Financial Calculators - Loans, Mortgages, Investments',
    description: 'Comprehensive collection of free financial calculators. Make informed financial decisions with accurate calculations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Financial Calculators - Loans, Mortgages, Investments',
    description: 'Comprehensive collection of free financial calculators. Make informed financial decisions.',
  },
};

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
