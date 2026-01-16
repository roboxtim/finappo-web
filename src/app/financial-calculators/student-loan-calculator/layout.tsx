import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Student Loan Calculator - Calculate Payments, Compare Strategies & Project Costs | Finappo',
  description:
    'Free student loan calculator with 3 modes: Simple calculator to find missing values, repayment calculator to compare payment strategies with extra payments, and projection calculator for students planning future loan costs.',
  keywords:
    'student loan calculator, student loan payment calculator, student loan repayment calculator, college loan calculator, education loan calculator, student debt calculator, loan projection calculator, extra payment calculator, student loan payoff calculator, graduate loan calculator, undergraduate loan calculator, federal student loan calculator, private student loan calculator, student loan interest calculator, loan comparison calculator',
  openGraph: {
    title: 'Student Loan Calculator - Payments, Strategies & Projections',
    description:
      'Calculate student loan payments, compare repayment strategies with extra payments, or project future loan costs. Three powerful calculators in one.',
    url: 'https://finappo.com/financial-calculators/student-loan-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-student-loan-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Student Loan Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Loan Calculator - Calculate & Compare',
    description:
      'Calculate student loan payments, compare repayment strategies, or project future costs. Free comprehensive calculator.',
    images: ['https://finappo.com/og-student-loan-calculator.png'],
  },
  alternates: {
    canonical:
      'https://finappo.com/financial-calculators/student-loan-calculator',
  },
};

export default function StudentLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
