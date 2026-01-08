import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '401(k) Calculator - Plan Your Retirement Savings | Finappo',
  description:
    "Calculate your 401(k) retirement savings with employer matching. Plan contributions, estimate growth, and see how much you'll have at retirement. Free 401k calculator with detailed projections.",
  keywords: [
    '401k calculator',
    '401(k) calculator',
    'retirement calculator',
    '401k savings',
    'employer match calculator',
    'retirement planning',
  ],
  openGraph: {
    title: '401(k) Calculator - Plan Your Retirement Savings | Finappo',
    description:
      "Calculate your 401(k) retirement savings with employer matching. Plan contributions, estimate growth, and see how much you'll have at retirement. Free 401k calculator with detailed projections.",
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
