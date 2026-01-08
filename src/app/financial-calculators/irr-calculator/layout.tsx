import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IRR Calculator - Internal Rate of Return | Finappo',
  description:
    'Calculate Internal Rate of Return (IRR) for investment projects. Analyze cash flows and determine investment profitability with our IRR calculator.',
  keywords: [
    'irr calculator',
    'internal rate of return',
    'irr calculation',
    'investment irr',
    'project profitability calculator',
  ],
  openGraph: {
    title: 'IRR Calculator - Internal Rate of Return | Finappo',
    description:
      'Calculate Internal Rate of Return (IRR) for investment projects. Analyze cash flows and determine investment profitability with our IRR calculator.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
