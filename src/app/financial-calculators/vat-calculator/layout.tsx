import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'VAT Calculator - Calculate Value Added Tax from Any Two Values | Finappo',
  description:
    'Free VAT calculator. Calculate VAT, net price, gross price, or tax amount from any two known values. Includes common VAT rates for UK, EU, and other countries. Simple and accurate tax calculations.',
  keywords:
    'vat calculator, value added tax calculator, sales tax calculator, tax calculator, vat rate calculator, gross price calculator, net price calculator, vat amount calculator, uk vat calculator, eu vat calculator, reverse vat calculator, vat calculation, add vat, remove vat, calculate vat',
  openGraph: {
    title: 'VAT Calculator - Calculate Value Added Tax',
    description:
      'Calculate VAT from any two known values. Includes common VAT rates for UK (20%), Germany (19%), France (20%), and more. Free and easy to use.',
    url: 'https://finappo.com/financial-calculators/vat-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-vat-calculator.png',
        width: 1200,
        height: 630,
        alt: 'VAT Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Calculator - Value Added Tax Calculation',
    description:
      'Calculate VAT, net price, gross price, or tax amount from any two values. Common VAT rates included.',
    images: ['https://finappo.com/og-vat-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/vat-calculator',
  },
};

export default function VATCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
