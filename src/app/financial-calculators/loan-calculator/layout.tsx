import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Loan Calculator - Monthly Payment, Interest & Amortization Schedule | Finappo',
  description:
    'Free loan calculator to calculate monthly payments, total interest, and amortization schedules. Compare loans with extra payments for mortgages, auto loans, personal loans, and student loans.',
  keywords:
    'loan calculator, monthly payment calculator, loan payment calculator, mortgage calculator, auto loan calculator, personal loan calculator, student loan calculator, amortization calculator, loan amortization schedule, extra payment calculator, loan interest calculator, loan payoff calculator, bi-weekly payment calculator, debt calculator, loan comparison calculator, early payoff calculator',
  openGraph: {
    title: 'Loan Calculator - Calculate Monthly Payments & Interest',
    description:
      'Calculate your loan payments, total interest, and create detailed amortization schedules. See how extra payments can save you money and time.',
    url: 'https://finappo.com/financial-calculators/loan-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-loan-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Loan Calculator - Monthly Payment & Amortization Schedule',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loan Calculator - Monthly Payments & Interest Calculator',
    description:
      'Calculate loan payments, total interest, and amortization schedules. Compare options with extra payments.',
    images: ['https://finappo.com/og-loan-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/loan-calculator',
  },
};

export default function LoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
