import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auto Loan Calculator - Car Payment Calculator | Finappo',
  description: 'Calculate your monthly car payment with our free auto loan calculator. Includes sales tax, trade-in value, and financing options. Get accurate estimates instantly.',
  keywords: ['auto loan calculator', 'car payment calculator', 'car loan', 'vehicle financing', 'auto financing', 'car purchase calculator'],
  openGraph: {
    title: 'Auto Loan Calculator - Car Payment Calculator',
    description: 'Calculate your monthly car payment with our free auto loan calculator. Includes sales tax, trade-in value, and financing options.',
    type: 'website',
  },
};

export default function AutoLoanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
