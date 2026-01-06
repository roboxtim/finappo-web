import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CD Calculator - Certificate of Deposit Calculator | Finappo',
  description:
    'Calculate your Certificate of Deposit (CD) returns with our free CD calculator. Compare compounding frequencies, visualize growth, and maximize your savings with guaranteed returns.',
  keywords: [
    'CD calculator',
    'certificate of deposit calculator',
    'CD interest calculator',
    'CD earnings calculator',
    'compound interest calculator',
    'savings calculator',
    'CD rates',
    'APY calculator',
    'bank CD calculator',
    'fixed deposit calculator',
    'time deposit calculator',
    'CD maturity calculator',
    'CD compounding calculator',
    'high yield CD',
    'CD investment calculator',
  ],
  openGraph: {
    title: 'CD Calculator - Certificate of Deposit Calculator',
    description:
      'Calculate your CD returns with precision. Compare compounding frequencies and see how your money grows with guaranteed returns.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/cd-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CD Calculator - Certificate of Deposit Calculator',
    description:
      'Calculate your CD returns with precision. Compare compounding frequencies and maximize your savings.',
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/cd-calculator',
  },
};

export default function CDCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
