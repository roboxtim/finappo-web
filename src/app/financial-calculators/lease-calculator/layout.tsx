import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Lease Calculator - Calculate Monthly Payments & Interest Rates | Finappo',
  description:
    'Free lease calculator for any asset. Calculate monthly lease payments, effective interest rates, depreciation fees, and total lease costs. Compare leasing vs. buying options with detailed breakdowns.',
  keywords:
    'lease calculator, lease payment calculator, equipment lease calculator, lease vs buy calculator, lease interest rate calculator, monthly lease payment, lease depreciation calculator, residual value calculator, lease finance calculator, capital lease calculator',
  openGraph: {
    title: 'Lease Calculator - Calculate Payments & Interest Rates',
    description:
      'Calculate lease payments and effective interest rates for any asset with depreciation and finance fee breakdowns.',
    type: 'website',
  },
};

export default function LeaseCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
