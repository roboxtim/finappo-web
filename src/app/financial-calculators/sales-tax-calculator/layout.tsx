import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Sales Tax Calculator - Calculate Tax, Find Price Before Tax | Finappo',
  description:
    'Free sales tax calculator for all US states. Calculate sales tax, find price before tax, determine tax rates. Includes 2025 state tax rates, reverse calculation, and state comparison.',
  keywords:
    'sales tax calculator, calculate sales tax, state sales tax, tax calculator, price with tax, sales tax rate, tax inclusive calculator, reverse sales tax, US sales tax rates, state tax rates 2025, local sales tax, city tax calculator, tax before price, VAT calculator, online sales tax, state tax comparison, no sales tax states, tax holiday calculator',
  openGraph: {
    title: 'Sales Tax Calculator - All US States & Reverse Calculation',
    description:
      'Calculate sales tax for any US state, find price before tax, or determine tax rates. Features 2025 rates for all 50 states plus local taxes.',
    url: 'https://finappo.com/financial-calculators/sales-tax-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-sales-tax-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Sales Tax Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sales Tax Calculator - Calculate Tax & Find Original Price',
    description:
      'Free calculator for US sales tax. Calculate total price, find price before tax, or determine tax rate. All 50 states included.',
    images: ['https://finappo.com/og-sales-tax-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/sales-tax-calculator',
  },
};

export default function SalesTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
