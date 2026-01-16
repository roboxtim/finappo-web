import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Business Loan Calculator - Calculate Payments, APR & Total Costs | Finappo',
  description:
    'Free business loan calculator with APR. Calculate monthly payments, total interest, and true cost including all fees. Compare SBA loans, term loans, and equipment financing. Get accurate loan estimates for your business.',
  keywords:
    'business loan calculator, business loan payment calculator, SBA loan calculator, small business loan calculator, commercial loan calculator, APR calculator, loan payment calculator, business financing calculator, equipment loan calculator, term loan calculator, business loan with fees, origination fee calculator, real APR calculator, business loan comparison, small business financing',
  openGraph: {
    title: 'Business Loan Calculator - Calculate APR & Monthly Payments',
    description:
      'Calculate business loan payments, APR, and total costs including fees. Free comprehensive calculator for SBA loans, term loans, and commercial financing.',
    url: 'https://finappo.com/financial-calculators/business-loan-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-business-loan-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Business Loan Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Loan Calculator - APR & Payment Calculator',
    description:
      'Calculate business loan payments and true APR including fees. Free calculator for small business financing.',
    images: ['https://finappo.com/og-business-loan-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/business-loan-calculator',
  },
};

export default function BusinessLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
