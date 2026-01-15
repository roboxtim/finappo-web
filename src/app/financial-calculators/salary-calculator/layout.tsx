import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salary Calculator - Paycheck & Tax Calculator 2025 | Finappo',
  description:
    'Calculate your take-home pay, taxes, and deductions. Convert between hourly, weekly, monthly, and annual salary. Includes federal & state tax withholdings for 2025.',
  keywords:
    'salary calculator, paycheck calculator, hourly to salary, salary to hourly, net pay calculator, gross to net, take home pay, salary conversion, wage calculator, income calculator, 2025 salary calculator, federal tax calculator, state tax calculator, FICA calculator, 401k calculator, tax withholding calculator, bi-weekly paycheck calculator, monthly salary calculator',
  openGraph: {
    title: 'Salary Calculator - Calculate Your Take-Home Pay for 2025',
    description:
      'Free salary and paycheck calculator. Convert hourly wage to annual salary, calculate taxes and deductions, and determine your net take-home pay.',
    url: 'https://finappo.com/financial-calculators/salary-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-salary-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Salary Calculator - Paycheck & Tax Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salary Calculator - Calculate Your Take-Home Pay',
    description:
      'Free salary calculator to convert hourly to annual, calculate taxes, and determine net pay.',
    images: ['https://finappo.com/og-salary-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/salary-calculator',
  },
};

export default function SalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
