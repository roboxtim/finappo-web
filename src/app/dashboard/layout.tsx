import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finappo - Your Budget Dashboard',
  description: 'Access your budget dashboard and track your family expenses.',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
