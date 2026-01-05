import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APR Calculator - Calculate Annual Percentage Rate | Finappo',
  description: 'Free APR calculator to calculate the true cost of a loan including fees and interest. Compare nominal interest rate vs effective APR. Understand the real cost of borrowing.',
  keywords: [
    'apr calculator',
    'annual percentage rate calculator',
    'effective apr',
    'loan apr calculator',
    'real apr',
    'apr vs interest rate',
    'loan cost calculator',
    'effective interest rate',
    'loan fees calculator',
    'true cost of loan',
    'nominal rate vs apr',
    'personal finance calculator'
  ],
  openGraph: {
    title: 'APR Calculator - Calculate Annual Percentage Rate',
    description: 'Free APR calculator to calculate the true cost of a loan including fees and interest. Compare nominal interest rate vs effective APR.',
    type: 'website',
  },
};

export default function AprCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
