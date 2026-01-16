import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Boat Loan Calculator - Calculate Payments, Interest & Total Cost | Finappo',
  description:
    'Free boat loan calculator. Calculate monthly payments, total interest, and costs including down payment, trade-in value, sales tax, and fees. Plan your boat financing with accurate loan estimates.',
  keywords:
    'boat loan calculator, boat financing calculator, marine loan calculator, boat payment calculator, yacht loan calculator, boat loan payment, boat financing, marine financing, boat purchase calculator',
  openGraph: {
    title: 'Boat Loan Calculator - Calculate Payments & Total Cost',
    description:
      'Calculate boat loan payments with down payment, trade-in value, sales tax, and fees.',
    type: 'website',
  },
};

export default function BoatLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
