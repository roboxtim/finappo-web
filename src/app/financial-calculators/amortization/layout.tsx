import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amortization Calculator - Loan Amortization Schedule | Finappo',
  description: 'Free amortization calculator with detailed payment schedule. Supports multiple payment frequencies, compound periods, and extra payments. View monthly or annual summaries.',
  keywords: ['amortization calculator', 'loan amortization', 'payment schedule', 'amortization schedule', 'loan payoff calculator', 'debt amortization'],
  openGraph: {
    title: 'Amortization Calculator - Loan Amortization Schedule',
    description: 'Free amortization calculator with detailed payment schedule. Supports multiple payment frequencies and extra payments.',
    type: 'website',
  },
};

export default function AmortizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
