import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RMD Calculator - Required Minimum Distribution Calculator | Finappo',
  description:
    'Calculate your Required Minimum Distribution (RMD) from retirement accounts. Uses IRS life expectancy tables to determine annual withdrawal amounts for IRAs, 401(k)s, and other qualified retirement plans.',
  keywords:
    'RMD calculator, required minimum distribution, IRA RMD, 401k RMD, retirement distribution, IRS life expectancy table, uniform lifetime table, retirement withdrawal calculator, RMD age 73, RMD age 75, SECURE Act 2.0, retirement planning, tax planning, IRA withdrawal, 401k withdrawal, pension distribution',
  openGraph: {
    title: 'RMD Calculator - Calculate Required Minimum Distributions',
    description:
      'Free RMD calculator to determine required withdrawals from retirement accounts using IRS life expectancy tables.',
    url: 'https://finappo.com/financial-calculators/rmd-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-rmd-calculator.png',
        width: 1200,
        height: 630,
        alt: 'RMD Calculator - Required Minimum Distribution Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RMD Calculator - Calculate Required Minimum Distributions',
    description:
      'Calculate your RMD from retirement accounts using IRS tables. Free tool for retirement and tax planning.',
    images: ['https://finappo.com/og-rmd-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/rmd-calculator',
  },
};

export default function RMDCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
