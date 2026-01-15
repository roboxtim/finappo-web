import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Estate Tax Calculator - Calculate Federal & State Estate Taxes 2025 | Finappo',
  description:
    'Free estate tax calculator for 2025. Calculate federal and state estate taxes with $13.99M exemption. Plan your legacy, minimize estate taxes, and maximize inheritance for heirs with accurate tax estimates.',
  keywords:
    'estate tax calculator, federal estate tax, estate tax exemption, inheritance tax calculator, estate planning calculator, 2025 estate tax, estate tax rates, gift tax exemption, estate planning, wealth transfer tax, death tax calculator, estate tax brackets, marital deduction, portability, state estate tax, charitable bequest, lifetime gifts, estate planning strategies, inheritance planning, wealth transfer',
  openGraph: {
    title: 'Estate Tax Calculator - Plan Your Legacy 2025',
    description:
      'Calculate federal and state estate taxes for 2025. Estimate taxes on estates over $13.99M and plan strategies to minimize estate tax burden on your heirs.',
    url: 'https://finappo.com/financial-calculators/estate-tax-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-estate-tax-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Estate Tax Calculator - Federal & State Estate Tax Planning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estate Tax Calculator 2025 - Federal & State Taxes',
    description:
      'Calculate estate taxes with $13.99M exemption. Plan your legacy and minimize taxes for your heirs.',
    images: ['https://finappo.com/og-estate-tax-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/estate-tax-calculator',
  },
};

export default function EstateTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
