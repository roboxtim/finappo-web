import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annuity Calculator - Calculate Payments & Future Value | Finappo',
  description:
    'Calculate annuity payments, future value, and retirement income. Compare immediate vs deferred annuities with inflation adjustments and growth projections.',
  keywords: [
    'annuity calculator',
    'annuity payment calculator',
    'future value annuity',
    'retirement annuity',
    'immediate annuity',
    'deferred annuity',
    'annuity income calculator',
    'fixed annuity calculator',
    'annuity accumulation',
    'retirement planning calculator',
    'investment growth calculator',
    'compound interest calculator',
    'retirement savings calculator',
    'ordinary annuity calculator',
    'annuity due calculator',
    'monthly annuity calculator',
    'annual annuity calculator',
  ],
  openGraph: {
    title: 'Annuity Calculator - Calculate Payments & Future Value | Finappo',
    description:
      'Calculate annuity payments, future value, and retirement income projections.',
    type: 'website',
  },
};

export default function AnnuityCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
