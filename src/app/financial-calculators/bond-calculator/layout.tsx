import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bond Calculator - Calculate Bond Price, Yield & Returns | Finappo',
  description:
    'Free bond calculator to determine bond prices, yield to maturity, current yield, and total returns. Calculate coupon payments for government and corporate bonds with different payment frequencies.',
  keywords: [
    'bond calculator',
    'bond price calculator',
    'yield to maturity calculator',
    'YTM calculator',
    'bond yield calculator',
    'coupon bond calculator',
    'premium bond calculator',
    'discount bond calculator',
    'corporate bond calculator',
    'government bond calculator',
    'bond valuation',
    'fixed income calculator',
    'bond investment calculator',
    'current yield calculator',
    'bond interest calculator',
  ],
  openGraph: {
    title: 'Bond Calculator - Calculate Bond Price & Yield',
    description:
      'Calculate bond prices, yields, and returns with our comprehensive bond calculator. Supports annual, semi-annual, quarterly, and monthly coupon payments.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/bond-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bond Calculator - Calculate Bond Price & Yield',
    description:
      'Calculate bond prices, yields, and returns with our comprehensive bond calculator.',
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/bond-calculator',
  },
};

export default function BondCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
