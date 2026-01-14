import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roth IRA Calculator - Plan Tax-Free Retirement Savings | Finappo',
  description:
    'Calculate your Roth IRA growth potential with our free calculator. Compare Roth IRA vs taxable accounts, estimate tax-free retirement savings, and plan contributions with 2025 IRS limits.',
  keywords:
    'roth ira calculator, retirement calculator, tax-free retirement, roth ira contribution limits, roth ira vs traditional ira, retirement savings calculator, investment growth calculator, roth ira 2025, tax advantage calculator, retirement planning',
  openGraph: {
    title: 'Roth IRA Calculator - Tax-Free Retirement Planning',
    description:
      'Plan your tax-free retirement with our Roth IRA calculator. Compare Roth vs taxable accounts and see your potential savings.',
    url: 'https://finappo.com/financial-calculators/roth-ira-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-roth-ira-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Roth IRA Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roth IRA Calculator - Plan Tax-Free Retirement',
    description:
      'Calculate your Roth IRA growth and compare with taxable accounts. Free calculator with 2025 contribution limits.',
    images: ['https://finappo.com/og-roth-ira-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/roth-ira-calculator',
  },
};

export default function RothIraCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
