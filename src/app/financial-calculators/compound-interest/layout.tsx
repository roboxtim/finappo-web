import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compound Interest Calculator - Calculate Investment Growth | Finappo',
  description:
    'Calculate compound interest on your investments with our free calculator. Analyze growth with regular contributions, multiple compounding frequencies, and see the impact of taxes and inflation on your returns.',
  keywords:
    'compound interest calculator, investment calculator, savings growth, interest rate calculator, compound returns, investment growth, financial planning, retirement calculator, compound interest formula, monthly contributions',
  openGraph: {
    title: 'Compound Interest Calculator - Calculate Investment Growth',
    description:
      'Free compound interest calculator to determine investment growth over time. Include regular contributions, compare compounding frequencies, and adjust for taxes and inflation.',
    url: 'https://finappo.com/financial-calculators/compound-interest',
    siteName: 'Finappo',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-compound-interest-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Compound Interest Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compound Interest Calculator - Investment Growth Analysis',
    description:
      'Calculate compound interest and watch your investments grow. Free tool with support for regular contributions, multiple compounding frequencies, and tax adjustments.',
    images: ['/og-compound-interest-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/compound-interest',
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

export default function CompoundInterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
