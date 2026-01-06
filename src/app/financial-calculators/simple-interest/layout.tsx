import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Simple Interest Calculator - Calculate Interest on Loans & Investments',
  description:
    'Free simple interest calculator. Calculate interest earned on investments or paid on loans. Easy formula: I = P × r × t. Get instant results with yearly breakdown. Perfect for auto loans, short-term investments, and bonds.',
  keywords: [
    'simple interest calculator',
    'interest calculator',
    'simple interest formula',
    'calculate simple interest',
    'investment interest',
    'loan interest calculator',
    'auto loan interest',
    'principal interest calculator',
    'simple vs compound interest',
    'interest calculation tool',
    'yearly interest schedule',
    'simple interest vs compound interest',
    'bond interest calculator',
    'treasury bill calculator',
    'short term loan calculator',
  ],
  openGraph: {
    title:
      'Simple Interest Calculator - Calculate Interest on Loans & Investments',
    description:
      'Calculate simple interest on loans and investments with our free calculator. Get instant results with yearly breakdowns and easy-to-understand formulas.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/simple-interest',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Simple Interest Calculator - Calculate Interest on Loans & Investments',
    description:
      'Calculate simple interest on loans and investments. Free tool with instant results and yearly breakdowns.',
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/simple-interest',
  },
};

export default function SimpleInterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
