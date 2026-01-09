import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Security Calculator - Optimize Your Benefits | Finappo',
  description:
    'Calculate the optimal age to claim Social Security benefits and maximize your retirement income. Compare claiming at different ages from 62 to 70 to find the best strategy for your situation.',
  keywords: [
    'social security calculator',
    'social security benefits',
    'retirement age calculator',
    'social security claiming age',
    'social security optimization',
    'retirement planning',
    'social security retirement',
    'early retirement benefits',
  ],
  openGraph: {
    title: 'Social Security Calculator - Optimize Your Benefits | Finappo',
    description:
      'Calculate the optimal age to claim Social Security benefits and maximize your retirement income.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
