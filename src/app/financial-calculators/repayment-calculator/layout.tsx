import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Loan Repayment Calculator - Calculate Monthly Payments & Payoff Time | Finappo',
  description:
    'Free loan repayment calculator. Calculate monthly payments with fixed term or determine payoff time with fixed payment. View detailed amortization schedule and total interest.',
  keywords:
    'repayment calculator, loan repayment calculator, monthly payment calculator, payoff calculator, loan payment calculator, amortization calculator, debt repayment calculator, installment calculator, fixed payment calculator, loan term calculator, interest calculator, principal and interest calculator, repayment schedule calculator, loan payoff time calculator',
  openGraph: {
    title: 'Loan Repayment Calculator - Monthly Payments & Payoff Time',
    description:
      'Calculate loan repayment with two modes: fixed term or fixed payment. View amortization schedule and see total interest paid.',
    url: 'https://finappo.com/financial-calculators/repayment-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-repayment-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Loan Repayment Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loan Repayment Calculator - Calculate Payments',
    description:
      'Calculate monthly loan payments or determine payoff time. View detailed amortization schedule.',
    images: ['https://finappo.com/og-repayment-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/repayment-calculator',
  },
};

export default function RepaymentCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
