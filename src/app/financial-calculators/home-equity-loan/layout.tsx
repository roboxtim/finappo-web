import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home Equity Loan Calculator - Calculate HELOC Payments | Finappo',
  description: 'Free home equity loan calculator to determine monthly payments, LTV ratios, and maximum borrowable amounts. Compare home equity loans vs HELOCs, calculate total interest, and view detailed amortization schedules.',
  keywords: [
    'home equity loan calculator',
    'HELOC calculator',
    'second mortgage calculator',
    'home equity line of credit',
    'LTV calculator',
    'CLTV ratio',
    'equity calculator',
    'home loan calculator',
    'mortgage equity',
    'borrowing against home equity',
    'home equity loan payment',
    'home equity loan rates'
  ],
  openGraph: {
    title: 'Home Equity Loan Calculator - Calculate HELOC Payments & LTV Ratios',
    description: 'Calculate home equity loan payments, determine maximum borrowable amounts based on LTV ratios, and compare different loan terms. Free calculator with amortization schedules.',
    type: 'website',
  },
};

export default function HomeEquityLoanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}