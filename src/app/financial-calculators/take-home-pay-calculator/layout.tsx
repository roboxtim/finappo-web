import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Take Home Pay Calculator - Calculate Net Salary After Taxes | Finappo',
  description:
    'Free take home pay calculator for 2025. Calculate your net salary after federal tax, FICA, state tax, and deductions. See your paycheck breakdown by pay period with accurate tax calculations.',
  keywords:
    'take home pay calculator, net pay calculator, paycheck calculator, salary after tax, gross to net calculator, 2025 paycheck calculator, take home salary, net income calculator, after tax income, pay stub calculator, federal tax calculator, FICA calculator, state tax calculator, salary calculator, wage calculator, income tax calculator, payroll calculator, biweekly pay calculator, monthly salary calculator',
  openGraph: {
    title: 'Take Home Pay Calculator - Calculate Your Net Salary',
    description:
      'Calculate your take-home pay after taxes and deductions. Free calculator with 2025 federal tax brackets, FICA rates, and state taxes for accurate paycheck estimates.',
    url: 'https://finappo.com/financial-calculators/take-home-pay-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-take-home-pay-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Take Home Pay Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Take Home Pay Calculator - Net Salary After Taxes',
    description:
      'Calculate your take-home pay with our free 2025 paycheck calculator. Includes federal tax, FICA, state tax, and deduction calculations.',
    images: ['https://finappo.com/og-take-home-pay-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/take-home-pay-calculator',
  },
};

export default function TakeHomePayCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
