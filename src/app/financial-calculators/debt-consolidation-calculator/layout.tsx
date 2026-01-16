import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Debt Consolidation Calculator - Compare Loans & Save Money | Finappo',
  description:
    'Compare your existing debts with consolidation loans. Calculate real APR including fees, monthly payments, and total interest. Find out if debt consolidation will save you money.',
  keywords:
    'debt consolidation calculator, consolidation loan calculator, debt consolidation comparison, combine debts, consolidate credit cards, debt payoff calculator, loan consolidation, real APR calculator, debt refinance calculator, consolidation savings calculator, multiple debt calculator, debt management calculator, consolidation loan comparison, debt relief calculator, loan fee calculator',
  openGraph: {
    title: 'Debt Consolidation Calculator - Compare & Save',
    description:
      'Compare existing debts with consolidation loans. Calculate real costs including fees and find out if consolidation will save you money.',
    url: 'https://finappo.com/financial-calculators/debt-consolidation-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-debt-consolidation-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Debt Consolidation Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debt Consolidation Calculator - Compare Loans',
    description:
      'Compare existing debts with consolidation options. Calculate real APR and see if you will save money.',
    images: ['https://finappo.com/og-debt-consolidation-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/debt-consolidation-calculator',
  },
};

export default function DebtConsolidationCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
