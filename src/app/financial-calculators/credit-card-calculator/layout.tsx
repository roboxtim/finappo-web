import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Card Calculator - Payoff Time & Interest Calculator | Finappo',
  description:
    'Calculate credit card payoff time, total interest charges, and create a debt-free plan. Compare payment strategies, see amortization schedules, and learn tips to pay off credit card debt faster.',
  keywords:
    'credit card calculator, credit card payoff calculator, credit card interest calculator, minimum payment calculator, credit card debt calculator, apr calculator, credit card payment calculator, debt payoff calculator, credit card amortization, balance payoff calculator, interest charges calculator, credit card repayment',
  openGraph: {
    title: 'Credit Card Calculator - Calculate Payoff Time & Interest',
    description:
      'Free credit card calculator to determine payoff time, total interest, and create a debt-free plan. Compare payment strategies and save thousands in interest.',
    url: 'https://finappo.com/financial-calculators/credit-card-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-credit-card-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Credit Card Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Credit Card Calculator - Payoff Time & Interest',
    description:
      'Calculate credit card payoff time, interest charges, and compare payment strategies to become debt-free faster.',
    images: ['https://finappo.com/og-credit-card-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/credit-card-calculator',
  },
};

export default function CreditCardCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
