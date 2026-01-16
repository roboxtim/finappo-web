import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Depreciation Calculator - Straight-Line, Declining Balance, DDB & SYD Methods | Finappo',
  description:
    "Free depreciation calculator supporting straight-line, declining balance, double declining balance, and sum of years' digits methods. Calculate asset depreciation with year-by-year schedules showing annual depreciation, accumulated depreciation, and book value.",
  keywords:
    'depreciation calculator, asset depreciation, straight line depreciation, declining balance, double declining balance, sum of years digits, depreciation schedule, book value calculator, salvage value, useful life, annual depreciation, accumulated depreciation, tax depreciation, business asset depreciation, depreciation methods',
  openGraph: {
    title: 'Depreciation Calculator - Multiple Methods & Schedules',
    description:
      "Calculate asset depreciation using straight-line, declining balance, double declining, or sum of years' digits methods. Get detailed year-by-year depreciation schedules.",
    url: 'https://finappo.com/financial-calculators/depreciation-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-depreciation-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Depreciation Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Depreciation Calculator - Asset Depreciation Methods',
    description:
      'Calculate depreciation with straight-line, declining balance, DDB, and SYD methods. Free comprehensive calculator.',
    images: ['https://finappo.com/og-depreciation-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/depreciation-calculator',
  },
};

export default function DepreciationCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
