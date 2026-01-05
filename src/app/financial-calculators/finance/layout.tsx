import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finance Calculator - Time Value of Money (TVM) | Finappo',
  description: 'Powerful TVM calculator to solve for present value, future value, payment, interest rate, or number of periods. Perfect for loans, investments, and retirement planning.',
  keywords: ['finance calculator', 'TVM calculator', 'time value of money', 'present value', 'future value', 'financial calculator', 'investment calculator'],
  openGraph: {
    title: 'Finance Calculator - Time Value of Money (TVM)',
    description: 'Powerful TVM calculator to solve for present value, future value, payment, interest rate, or number of periods.',
    type: 'website',
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
