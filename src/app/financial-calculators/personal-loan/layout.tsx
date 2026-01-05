import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Loan Calculator - Calculate Monthly Payments | Finappo',
  description: 'Free personal loan calculator to estimate monthly payments, total interest, and repayment schedule. Compare different loan amounts, interest rates, and terms.',
  keywords: ['personal loan calculator', 'loan payment calculator', 'monthly payment', 'loan interest', 'personal finance', 'debt calculator'],
  openGraph: {
    title: 'Personal Loan Calculator - Calculate Monthly Payments',
    description: 'Free personal loan calculator to estimate monthly payments, total interest, and repayment schedule.',
    type: 'website',
  },
};

export default function PersonalLoanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
