import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Savings Calculator - Calculate Compound Interest & Growth | Finappo',
  description:
    'Free savings calculator with compound interest. Calculate your savings growth with regular monthly and annual contributions. See detailed schedules and plan your financial future.',
  keywords: [
    'savings calculator',
    'compound interest calculator',
    'savings growth calculator',
    'interest calculator',
    'savings account calculator',
    'money growth calculator',
    'investment savings',
    'monthly savings calculator',
    'annual savings calculator',
    'compound interest',
    'savings planner',
    'financial calculator',
    'retirement savings',
    'emergency fund calculator',
  ],
  openGraph: {
    title: 'Savings Calculator - Calculate Compound Interest & Growth',
    description:
      'Free savings calculator with compound interest. Calculate your savings growth with regular monthly and annual contributions.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/savings',
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/savings',
  },
};

export default function SavingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
