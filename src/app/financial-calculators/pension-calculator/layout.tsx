import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pension Calculator - Retirement Income Planning | Finappo',
  description:
    'Calculate pension benefits and retirement income. Plan your pension contributions and estimate monthly retirement payments from your pension plan.',
  keywords: [
    'pension calculator',
    'pension planning',
    'retirement pension',
    'pension income calculator',
    'pension benefits calculator',
  ],
  openGraph: {
    title: 'Pension Calculator - Retirement Income Planning | Finappo',
    description:
      'Calculate pension benefits and retirement income. Plan your pension contributions and estimate monthly retirement payments from your pension plan.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
