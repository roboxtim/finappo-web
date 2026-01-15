import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Marriage Tax Calculator - Compare Filing Jointly vs Separately | Finappo',
  description:
    'Calculate marriage penalty or bonus by comparing taxes when filing jointly vs separately. See how marriage affects your taxes with our 2025 tax bracket calculator.',
  keywords:
    'marriage calculator, marriage penalty calculator, marriage tax calculator, marriage bonus, tax marriage penalty, married filing jointly vs separately, marriage tax benefits, wedding tax calculator, tax implications of marriage, 2025 marriage tax, marriage tax comparison, dual income tax, marriage penalty tax, filing status calculator, joint tax return calculator',
  openGraph: {
    title: 'Marriage Tax Calculator - Marriage Penalty or Bonus',
    description:
      'Compare your taxes as married filing jointly vs single. Calculate marriage penalty or bonus with 2025 tax brackets.',
    url: 'https://finappo.com/financial-calculators/marriage-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-marriage-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Marriage Tax Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marriage Tax Calculator - Calculate Your Marriage Penalty or Bonus',
    description:
      'See how marriage affects your taxes. Compare filing jointly vs separately with 2025 tax brackets.',
    images: ['https://finappo.com/og-marriage-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/marriage-calculator',
  },
};

export default function MarriageCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
