import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annuity Payout Calculator - Calculate Income Streams | Finappo',
  description:
    'Calculate annuity payout amounts and income streams. Plan your retirement income with immediate and deferred annuity payment projections.',
  keywords: [
    'annuity payout calculator',
    'annuity payment calculator',
    'retirement income calculator',
    'annuity income calculator',
    'immediate annuity payout',
    'deferred annuity payout',
    'annuity withdrawal calculator',
    'pension payout calculator',
    'fixed annuity calculator',
    'annuity distribution calculator',
    'retirement annuity calculator',
    'lifetime annuity calculator',
    'annuity amortization schedule',
    'periodic payment calculator',
    'annuity interest calculator',
  ],
  openGraph: {
    title: 'Annuity Payout Calculator - Calculate Income Streams | Finappo',
    description:
      'Calculate annuity payout amounts and income streams for retirement planning. Get detailed amortization schedules and payment projections.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/annuity-payout',
    siteName: 'Finappo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Finappo Annuity Payout Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Annuity Payout Calculator - Calculate Income Streams',
    description:
      'Calculate annuity payout amounts and income streams for retirement planning.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/annuity-payout',
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
