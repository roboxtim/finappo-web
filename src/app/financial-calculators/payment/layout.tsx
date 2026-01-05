import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Calculator - Calculate Loan Payments | Finappo',
  description:
    'Free payment calculator to calculate loan payments with different compounding frequencies and payment types. Supports balloon payments, beginning/end of period payments, and detailed amortization schedules. Compare monthly, quarterly, semi-annual, and annual compounding.',
  keywords: [
    'payment calculator',
    'loan payment calculator',
    'monthly payment calculator',
    'loan calculator',
    'amortization calculator',
    'balloon payment calculator',
    'compounding frequency calculator',
    'annuity calculator',
    'payment schedule',
    'loan interest calculator',
    'present value calculator',
    'future value calculator',
    'beginning of period',
    'end of period',
    'financial calculator',
  ],
  openGraph: {
    title: 'Payment Calculator - Calculate Loan Payments',
    description:
      'Calculate loan payments with support for different compounding frequencies, balloon payments, and payment types. View detailed amortization schedules.',
    type: 'website',
  },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
