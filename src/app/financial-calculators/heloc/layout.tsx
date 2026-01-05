import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HELOC Calculator - Home Equity Line of Credit Calculator | Finappo',
  description:
    'Free HELOC calculator to estimate monthly payments during draw and repayment periods. Calculate total interest costs, compare rates, and plan your home equity line of credit.',
  keywords: [
    'heloc calculator',
    'home equity line of credit calculator',
    'heloc payment calculator',
    'home equity calculator',
    'heloc interest calculator',
    'draw period calculator',
    'repayment period calculator',
    'variable rate heloc',
    'home equity borrowing',
    'heloc vs home equity loan',
    'heloc interest only payment',
    'heloc amortization',
    'home equity line',
    'heloc rates',
    'second mortgage calculator',
    'equity loan calculator',
    'home improvement loan',
    'heloc cost calculator',
    'revolving credit calculator',
    'home equity financing',
  ],
  openGraph: {
    title: 'HELOC Calculator - Home Equity Line of Credit Calculator',
    description:
      'Calculate monthly payments for your Home Equity Line of Credit. Understand draw period and repayment period costs with our free HELOC calculator.',
    type: 'website',
  },
};

export default function HELOCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
