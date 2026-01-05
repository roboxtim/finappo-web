import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mortgage Calculator - Home Loan Payment Calculator | Finappo',
  description: 'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Supports extra payments and detailed amortization schedule.',
  keywords: ['mortgage calculator', 'home loan calculator', 'mortgage payment', 'house payment calculator', 'PMI calculator', 'home affordability calculator'],
  openGraph: {
    title: 'Mortgage Calculator - Home Loan Payment Calculator',
    description: 'Calculate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI. Supports extra payments.',
    type: 'website',
  },
};

export default function MortgageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
