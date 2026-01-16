import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'Discount Calculator - Calculate Sale Prices & Savings Instantly | Finappo',
  description:
    'Free discount calculator. Calculate final price, discount amount, savings, and discount percentage from any two known values. Supports both percentage and fixed amount discounts. Perfect for shopping, sales, and retail pricing.',
  keywords:
    'discount calculator, sale price calculator, percent off calculator, savings calculator, price discount calculator, percentage discount, fixed discount, how to calculate discount, discount formula, sale calculator, shopping calculator, price after discount, retail discount calculator, markdown calculator, coupon calculator, Black Friday calculator, promotional pricing',
  openGraph: {
    title: 'Discount Calculator - Calculate Sale Prices & Savings',
    description:
      'Calculate discount prices, savings, and percentages instantly. Free calculator supporting both percentage and fixed amount discounts with detailed breakdowns.',
    url: 'https://finappo.com/financial-calculators/discount-calculator',
    siteName: 'Finappo',
    images: [
      {
        url: 'https://finappo.com/og-discount-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Discount Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discount Calculator - Sale Prices & Savings',
    description:
      'Calculate discount prices and savings from any two values. Free comprehensive calculator with formulas and examples.',
    images: ['https://finappo.com/og-discount-calculator.png'],
  },
  alternates: {
    canonical: 'https://finappo.com/financial-calculators/discount-calculator',
  },
};

export default function DiscountCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
