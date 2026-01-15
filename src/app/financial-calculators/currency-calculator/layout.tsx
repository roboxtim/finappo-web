import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Currency Calculator - Convert World Currencies with Exchange Rates | Finappo',
  description:
    'Free online currency converter for 20+ world currencies. Convert USD, EUR, GBP, JPY and more with real-time exchange rates. Compare multiple currencies instantly.',
  keywords:
    'currency calculator, currency converter, exchange rate calculator, forex calculator, money converter, usd to eur, usd to gbp, usd to jpy, currency exchange calculator, foreign exchange calculator, fx calculator, convert currency, exchange rates, currency conversion, forex rates, international money transfer, currency comparison, world currencies, euro converter, pound converter, yen converter',
  openGraph: {
    title: 'Currency Calculator - Convert World Currencies',
    description:
      'Convert between 20+ world currencies including USD, EUR, GBP, JPY, CNY, and more. Get instant exchange rates and compare multiple currencies.',
    url: 'https://finappo.com/financial-calculators/currency-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-currency-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Currency Calculator - Convert World Currencies',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Currency Calculator - Convert World Currencies',
    description:
      'Convert between 20+ world currencies with instant exchange rates. Compare USD, EUR, GBP, JPY, CNY and more.',
    images: ['https://finappo.com/og-currency-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/currency-calculator',
  },
};

export default function CurrencyCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
