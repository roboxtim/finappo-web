import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROI Calculator - Return on Investment Analysis | Finappo',
  description:
    'Calculate Return on Investment (ROI) and investment profitability. Analyze investment performance, compare options, and make data-driven decisions.',
  keywords: [
    'roi calculator',
    'return on investment',
    'roi calculation',
    'investment return calculator',
    'profit calculator',
  ],
  openGraph: {
    title: 'ROI Calculator - Return on Investment Analysis | Finappo',
    description:
      'Calculate Return on Investment (ROI) and investment profitability. Analyze investment performance, compare options, and make data-driven decisions.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
