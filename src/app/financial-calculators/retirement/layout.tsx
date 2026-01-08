import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retirement Calculator - Savings & Planning Tool | Finappo',
  description:
    'Calculate retirement savings needs and plan for your future. Estimate how much to save, projected retirement income, and achieve your retirement goals.',
  keywords: [
    'retirement calculator',
    'retirement savings',
    'retirement planning',
    'retirement income calculator',
    'nest egg calculator',
  ],
  openGraph: {
    title: 'Retirement Calculator - Savings & Planning Tool | Finappo',
    description:
      'Calculate retirement savings needs and plan for your future. Estimate how much to save, projected retirement income, and achieve your retirement goals.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
