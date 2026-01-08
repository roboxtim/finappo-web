import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Future Value Calculator - Investment Projections | Finappo',
  description:
    'Calculate the future value of investments with compound interest. Project investment growth, retirement savings, and long-term financial goals.',
  keywords: [
    'future value calculator',
    'fv calculator',
    'investment future value',
    'compound interest future value',
    'future worth calculator',
  ],
  openGraph: {
    title: 'Future Value Calculator - Investment Projections | Finappo',
    description:
      'Calculate the future value of investments with compound interest. Project investment growth, retirement savings, and long-term financial goals.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
