import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Present Value Calculator - Future Money Value Today | Finappo',
  description:
    'Calculate present value of future cash flows and investments. Determine what future money is worth today with discount rate analysis.',
  keywords: [
    'present value calculator',
    'pv calculator',
    'net present value',
    'discount calculator',
    'present worth calculator',
  ],
  openGraph: {
    title: 'Present Value Calculator - Future Money Value Today | Finappo',
    description:
      'Calculate present value of future cash flows and investments. Determine what future money is worth today with discount rate analysis.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
