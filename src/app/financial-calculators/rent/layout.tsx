import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent Calculator - Calculate Total Rental Costs | Finappo',
  description:
    'Free rent calculator to estimate total monthly rental costs including utilities, insurance, parking, and more. Plan for annual rent increases and check affordability with the 30% rule.',
  keywords: [
    'rent calculator',
    'rental cost calculator',
    'apartment cost calculator',
    'rent affordability calculator',
    'monthly rent calculator',
    'rent increase calculator',
    'housing cost calculator',
    'rental budget calculator',
    'cost of renting',
    'rent vs buy calculator',
    '30 percent rule rent',
    'utilities calculator',
    'renters insurance calculator',
  ],
  openGraph: {
    title: 'Rent Calculator - Calculate Total Rental Costs',
    description:
      'Calculate your total monthly rental costs including utilities, insurance, parking, and more. Plan for annual increases and check affordability.',
    type: 'website',
  },
};

export default function RentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
