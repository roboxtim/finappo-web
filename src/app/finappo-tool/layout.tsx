import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finappo - Track Your Family Budget. Simply.',
  description:
    'Beautiful, powerful expense tracking designed for families who want to spend smarter together. Smart categories, family sharing, and real-time budget insights.',
  keywords: [
    'budget',
    'expense tracker',
    'family budget',
    'spending tracker',
    'financial app',
    'money management',
    'ios app',
    'budget app',
    'family finance',
  ],
  authors: [{ name: 'Finappo' }],
  openGraph: {
    title: 'Finappo - Track Your Family Budget. Simply.',
    description:
      'Beautiful, powerful expense tracking designed for families who want to spend smarter together.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Finappo',
    url: 'https://finappo.com/finappo-tool',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finappo - Track Your Family Budget. Simply.',
    description:
      'Beautiful, powerful expense tracking designed for families who want to spend smarter together.',
  },
  alternates: {
    canonical: 'https://finappo.com/finappo-tool',
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
