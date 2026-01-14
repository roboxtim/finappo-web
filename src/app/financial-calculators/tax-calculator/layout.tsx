import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tax Calculator - Federal Income Tax Estimator 2025 | Finappo',
  description:
    'Calculate your 2025 federal income tax, estimate your refund or taxes owed. Includes latest tax brackets, standard deductions, child tax credits, and earned income credits.',
  keywords:
    'tax calculator, income tax calculator, federal tax calculator, tax estimator, tax refund calculator, 2025 tax brackets, effective tax rate, marginal tax rate, tax deductions, tax credits, child tax credit, earned income tax credit, EITC, standard deduction, itemized deductions, tax withholding, tax liability, IRS tax calculator, tax return estimator',
  openGraph: {
    title: 'Tax Calculator - 2025 Federal Income Tax Estimator',
    description:
      'Free tax calculator to estimate your 2025 federal income tax, refund, and take-home pay with latest IRS tax brackets and deductions.',
    url: 'https://finappo.com/financial-calculators/tax-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-tax-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Tax Calculator - Federal Income Tax Estimator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tax Calculator - 2025 Federal Income Tax Estimator',
    description:
      'Calculate your federal taxes, estimate refunds, and optimize deductions with our comprehensive tax calculator.',
    images: ['https://finappo.com/og-tax-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/tax-calculator',
  },
};

export default function TaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
