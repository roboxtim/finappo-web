import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Margin Calculator - Calculate Profit Margin, Markup & Revenue | Finappo',
  description:
    'Free profit margin calculator. Calculate profit margin, markup, revenue, cost, or profit from any two known values. Understand the difference between margin and markup with visual breakdowns and formulas.',
  keywords:
    'margin calculator, profit margin calculator, markup calculator, gross margin calculator, profit calculator, revenue calculator, margin vs markup, calculate profit margin, profit percentage, sales margin, gross profit margin, net profit margin, profit margin formula, markup formula, business calculator',
  openGraph: {
    title: 'Margin Calculator - Profit Margin & Markup Calculator',
    description:
      'Calculate profit margin and markup from any two values. Free calculator with visual breakdowns showing the difference between margin and markup.',
    url: 'https://finappo.com/financial-calculators/margin-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-margin-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Margin Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Margin Calculator - Profit Margin & Markup',
    description:
      'Calculate profit margin, markup, revenue, and cost. Free comprehensive calculator with formulas.',
    images: ['https://finappo.com/og-margin-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/margin-calculator',
  },
};

export default function MarginCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
