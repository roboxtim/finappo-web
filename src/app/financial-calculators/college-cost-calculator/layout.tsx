import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'College Cost Calculator - Estimate Future Education Expenses & Savings | Finappo',
  description:
    'Free college cost calculator. Project future college expenses with inflation, calculate required monthly savings, and see how your current savings will grow. Plan for 4-year private, public in-state, public out-of-state, or 2-year colleges.',
  keywords:
    'college cost calculator, college savings calculator, education cost calculator, 529 plan calculator, college expense calculator, future college costs, college planning calculator, higher education costs, college inflation calculator, monthly college savings, college fund calculator, education savings calculator, tuition calculator, college budget calculator',
  openGraph: {
    title: 'College Cost Calculator - Plan Future Education Expenses',
    description:
      'Calculate future college costs with inflation and determine required monthly savings. Account for investment returns and see year-by-year cost projections.',
    url: 'https://finappo.com/financial-calculators/college-cost-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-college-cost-calculator.png',
        width: 1200,
        height: 630,
        alt: 'College Cost Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Cost Calculator - Education Savings Planning',
    description:
      'Project future college costs, calculate required monthly savings, and plan for education expenses. Free comprehensive calculator.',
    images: ['https://finappo.com/og-college-cost-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/college-cost-calculator',
  },
};

export default function CollegeCostCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
