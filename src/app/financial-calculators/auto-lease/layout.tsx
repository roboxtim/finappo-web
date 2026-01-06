import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auto Lease Calculator - Calculate Car Lease Payments | Finappo',
  description:
    'Calculate your monthly car lease payments. Factor in MSRP, down payment, trade-in, residual value, and fees to understand your total lease costs.',
  keywords: [
    'auto lease calculator',
    'car lease calculator',
    'lease payment calculator',
    'vehicle lease',
    'monthly lease payment',
    'residual value',
    'money factor',
    'cap cost',
    'lease vs buy',
    'car leasing',
    'auto leasing',
    'lease calculator',
    'vehicle lease calculator',
  ],
  openGraph: {
    title: 'Auto Lease Calculator - Calculate Car Lease Payments',
    description:
      'Calculate your monthly car lease payments with our free auto lease calculator. Factor in MSRP, down payment, trade-in, residual value, and fees.',
    type: 'website',
  },
};

export default function AutoLeaseCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
