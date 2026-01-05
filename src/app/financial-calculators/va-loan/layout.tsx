import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VA Loan Calculator - Calculate VA Mortgage Payments | Finappo',
  description:
    'Free VA loan calculator for veterans and active military. Calculate monthly mortgage payments, funding fees, and compare VA loans with conventional and FHA options. No PMI required on VA loans. Discover your VA loan benefits including 0% down payment options and potential funding fee waivers for disabled veterans.',
  keywords: [
    'VA loan calculator',
    'VA mortgage calculator',
    'veterans loan calculator',
    'military mortgage',
    'VA funding fee',
    'VA loan benefits',
    'VA home loan',
    'no down payment mortgage',
    'disabled veteran mortgage',
    'military home loan',
    'VA loan rates',
    'VA mortgage payment',
    'veterans home loan',
    'VA loan eligibility',
    'VA loan comparison',
    'no PMI mortgage',
    'service member mortgage',
    'VA loan funding fee calculator',
    'VA entitlement calculator',
    'VA refinance calculator',
  ],
  openGraph: {
    title: 'VA Loan Calculator - Calculate VA Mortgage Payments | Finappo',
    description:
      'Calculate your VA mortgage payments and discover the benefits of VA home loans. No PMI required, 0% down payment options, and funding fee waivers for disabled veterans. Free VA loan calculator for veterans and active military.',
    type: 'website',
    url: 'https://finappo.com/financial-calculators/va-loan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VA Loan Calculator - Calculate VA Mortgage Payments',
    description:
      'Free VA loan calculator for veterans. Calculate monthly payments, funding fees, and compare VA loans. No PMI required. 0% down payment options available.',
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/va-loan',
  },
};

export default function VALoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
