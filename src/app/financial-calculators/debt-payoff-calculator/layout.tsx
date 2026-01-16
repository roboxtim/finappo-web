import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Debt Payoff Calculator - Avalanche vs Snowball Strategy | Finappo',
  description:
    'Calculate debt payoff time and interest savings. Compare debt avalanche vs snowball strategies. Create your personalized debt-free plan with extra payments.',
  keywords:
    'debt payoff calculator, debt elimination calculator, debt snowball calculator, debt avalanche calculator, multiple debt calculator, debt consolidation calculator, debt free calculator, pay off debt calculator, credit card payoff calculator, loan payoff strategy, debt reduction planner, debt management calculator',
  openGraph: {
    title: 'Debt Payoff Calculator - Become Debt-Free Faster',
    description:
      'Compare debt avalanche and snowball strategies. Calculate payoff time, interest savings, and create your debt elimination plan.',
    url: 'https://finappo.com/financial-calculators/debt-payoff-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-debt-payoff-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Debt Payoff Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debt Payoff Calculator - Avalanche vs Snowball',
    description:
      'Calculate your fastest path to becoming debt-free. Compare strategies and save thousands in interest.',
    images: ['https://finappo.com/og-debt-payoff-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/debt-payoff-calculator',
  },
};

export default function DebtPayoffCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
