import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Cash Back vs Low Interest Calculator - Which Car Deal is Better? | Finappo',
  description:
    'Compare cash back rebates versus low interest financing offers. Calculate which auto loan deal saves you more money over the life of the loan. Free car financing calculator with detailed comparison and break-even analysis.',
  keywords: [
    'cash back vs low interest',
    'cash back calculator',
    'auto loan incentive calculator',
    'dealer incentive calculator',
    'cash rebate or low apr',
    'car financing calculator',
    '0 apr vs cash back',
    'auto rebate calculator',
    'car loan comparison',
    'dealer financing calculator',
    'auto financing options',
    'car purchase calculator',
    'low interest vs rebate',
    'vehicle financing calculator',
    'car buying calculator',
  ].join(', '),
  openGraph: {
    title:
      'Cash Back vs Low Interest Calculator - Compare Car Financing Offers',
    description:
      'Smart calculator to compare dealer incentives: cash back rebates vs low interest rates. Find out which option saves you the most money on your auto loan.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/cash-back-vs-low-interest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cash Back vs Low Interest Calculator | Finappo',
    description:
      'Compare cash back rebates vs low interest financing. Calculate which car deal saves you more money.',
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/cash-back-vs-low-interest',
  },
};

export default function CashBackVsLowInterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
