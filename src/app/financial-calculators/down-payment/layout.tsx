import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Down Payment Calculator - Home Down Payment Calculator | Finappo',
  description:
    'Free down payment calculator to estimate cash needed at closing, monthly mortgage payments, and PMI requirements. Calculate different down payment scenarios for your home purchase.',
  keywords: [
    'down payment calculator',
    'home down payment',
    'mortgage down payment',
    'down payment on house',
    '20 percent down payment',
    'closing costs calculator',
    'home purchase calculator',
    'mortgage calculator',
    'PMI calculator',
    'private mortgage insurance',
    'FHA down payment',
    'conventional loan down payment',
    'first time home buyer',
    'cash needed at closing',
    'home buying calculator',
    'down payment savings',
    'mortgage down payment requirements',
    'down payment assistance',
    'minimum down payment',
    'home affordability calculator',
  ],
  openGraph: {
    title: 'Down Payment Calculator - Calculate Cash Needed for Home Purchase',
    description:
      'Calculate your down payment, monthly mortgage payments, closing costs, and PMI requirements. Compare different down payment scenarios to find the best option.',
    type: 'website',
  },
};

export default function DownPaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
