import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interest Rate Calculator - Find Your Loan APR | Finappo',
  description:
    'Calculate the interest rate on any loan when you know the amount, term, and monthly payment. Perfect for verifying dealer quotes and comparing loan offers. Free, accurate, and easy to use.',
  keywords: [
    'interest rate calculator',
    'loan rate calculator',
    'APR calculator',
    'reverse loan calculator',
    'find interest rate',
    'calculate APR',
    'auto loan rate',
    'personal loan rate',
    'loan comparison',
    'verify loan rate',
    'monthly payment to rate',
    'what is my interest rate',
    'loan apr calculator',
    'effective interest rate',
    'annual percentage rate calculator',
  ],
  openGraph: {
    title: 'Interest Rate Calculator - Find Your Loan APR',
    description:
      'Calculate the interest rate on any loan when you know the amount, term, and monthly payment. Perfect for verifying dealer quotes and comparing loan offers.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/interest-rate',
    siteName: 'Finappo',
    images: [
      {
        url: '/og-interest-rate-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Interest Rate Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interest Rate Calculator - Find Your Loan APR',
    description:
      'Calculate the interest rate on any loan when you know the amount, term, and monthly payment.',
    images: ['/og-interest-rate-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/interest-rate',
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

export default function InterestRateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
