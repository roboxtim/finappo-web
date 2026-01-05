import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FHA Loan Calculator - Calculate FHA Mortgage Payments | Finappo',
  description:
    'Free FHA loan calculator with mortgage insurance (MIP). Calculate monthly payments, upfront and annual MIP, compare FHA vs conventional loans. Includes amortization schedule and FHA guidelines for first-time homebuyers.',
  keywords: [
    'FHA loan calculator',
    'FHA mortgage calculator',
    'FHA mortgage insurance',
    'MIP calculator',
    'UFMIP calculator',
    'first-time homebuyer calculator',
    'FHA loan payment calculator',
    'FHA vs conventional',
    'low down payment mortgage',
    'FHA loan requirements',
    '3.5 percent down mortgage',
    'annual MIP rates',
    'upfront mortgage insurance premium',
    'FHA amortization schedule',
    'FHA loan limits',
  ],
  openGraph: {
    title: 'FHA Loan Calculator - Calculate FHA Mortgage Payments | Finappo',
    description:
      'Calculate your FHA loan payments including upfront and annual mortgage insurance (MIP). Compare FHA vs conventional loans, view amortization schedules, and understand FHA requirements for first-time homebuyers.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/fha-loan',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-fha-loan-calculator.png',
        width: 1200,
        height: 630,
        alt: 'FHA Loan Calculator - Finappo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FHA Loan Calculator - Calculate FHA Mortgage Payments',
    description:
      'Calculate FHA loan payments with mortgage insurance (MIP). Includes upfront MIP, annual MIP rates, amortization schedule, and FHA vs conventional comparison.',
    images: ['https://finappo.com/og-fha-loan-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/fha-loan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function FHALoanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
