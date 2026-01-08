import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payback Period Calculator - Investment Analysis | Finappo',
  description:
    'Calculate payback period for investments and projects. Determine how long it takes to recover your initial investment with cash flow analysis.',
  keywords: [
    'payback period calculator',
    'investment payback',
    'roi payback period',
    'project payback analysis',
  ],
  openGraph: {
    title: 'Payback Period Calculator - Investment Analysis | Finappo',
    description:
      'Calculate payback period for investments and projects. Determine how long it takes to recover your initial investment with cash flow analysis.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
