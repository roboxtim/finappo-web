import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent vs Buy Calculator - Should You Rent or Buy a Home? | Finappo',
  description:
    'Compare the true costs of renting vs buying a home over time. Factor in mortgage, taxes, appreciation, opportunity costs, and more to make an informed decision.',
  keywords:
    'rent vs buy, rent or buy calculator, renting vs buying, homeownership calculator, rent vs own, should I buy a house, rent vs mortgage, home buying decision, housing affordability, real estate calculator',
  openGraph: {
    title: 'Rent vs Buy Calculator - Make an Informed Housing Decision',
    description:
      'Calculate whether renting or buying a home is better for your financial situation. Compare total costs, equity building, tax benefits, and opportunity costs.',
    url: 'https://finappo.com/financial-calculators/rent-vs-buy',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-rent-vs-buy.jpg',
        width: 1200,
        height: 630,
        alt: 'Rent vs Buy Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rent vs Buy Calculator - Should You Rent or Buy?',
    description:
      'Make an informed decision between renting and buying with our comprehensive calculator.',
    images: ['https://finappo.com/og-rent-vs-buy.jpg'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/rent-vs-buy',
  },
};

export default function RentVsBuyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
