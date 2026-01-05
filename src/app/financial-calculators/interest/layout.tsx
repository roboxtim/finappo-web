import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interest Calculator - Simple & Compound Interest | Finappo',
  description: 'Calculate simple and compound interest with our free calculator. Supports multiple compounding frequencies, regular contributions, and inflation adjustments.',
  keywords: ['interest calculator', 'compound interest', 'simple interest', 'savings calculator', 'investment calculator', 'interest rate calculator'],
  openGraph: {
    title: 'Interest Calculator - Simple & Compound Interest',
    description: 'Calculate simple and compound interest with our free calculator. Supports multiple compounding frequencies and regular contributions.',
    type: 'website',
  },
};

export default function InterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
