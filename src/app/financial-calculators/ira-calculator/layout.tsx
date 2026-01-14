import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IRA Calculator - Traditional vs Roth IRA Comparison | Finappo',
  description:
    'Compare Traditional and Roth IRA retirement savings options. Calculate future balances, tax benefits, and determine which IRA type is best for your retirement planning.',
  keywords:
    'IRA calculator, Roth IRA, Traditional IRA, retirement calculator, retirement savings, tax-advantaged accounts, retirement planning, IRA comparison, contribution limits, tax benefits, compound interest, retirement investment, individual retirement account',
  openGraph: {
    title: 'IRA Calculator - Compare Traditional vs Roth IRAs',
    description:
      'Plan your retirement with our comprehensive IRA calculator. Compare Traditional and Roth IRA options to maximize your retirement savings.',
    url: 'https://finappo.com/financial-calculators/ira-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-ira-calculator.png',
        width: 1200,
        height: 630,
        alt: 'IRA Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IRA Calculator - Traditional vs Roth Comparison',
    description:
      'Calculate and compare Traditional vs Roth IRA retirement savings to make informed decisions.',
    images: ['https://finappo.com/og-ira-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/ira-calculator',
  },
};

export default function IRACalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
