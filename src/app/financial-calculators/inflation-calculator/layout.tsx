import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Inflation Calculator - Calculate Purchasing Power & Future Value | Finappo',
  description:
    'Calculate how inflation impacts your money over time. See purchasing power changes, future value adjustments, and real value depreciation with our free inflation calculator.',
  keywords:
    'inflation calculator, purchasing power calculator, inflation rate calculator, cpi calculator, cost of living calculator, inflation adjusted calculator, real value calculator, money value calculator, inflation impact, historical inflation, future value inflation, inflation over time, purchasing power over time, inflation effects, inflation planning',
  openGraph: {
    title: 'Inflation Calculator - Purchasing Power & Future Value',
    description:
      'Calculate how inflation impacts your money over time. Understand purchasing power changes and plan for future financial needs.',
    url: 'https://finappo.com/financial-calculators/inflation-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-inflation-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Inflation Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inflation Calculator - Calculate Purchasing Power',
    description:
      'See how inflation affects your money over time. Calculate future values and purchasing power changes.',
    images: ['https://finappo.com/og-inflation-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/inflation-calculator',
  },
};

export default function InflationCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
