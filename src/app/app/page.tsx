import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

// Metadata for this page
export const metadata: Metadata = {
  title: 'Finappo App - Your Budget Dashboard',
  description: 'Access your budget dashboard and track your family expenses.',
};

// Dynamically import the app component with SSR disabled
const AppPageContent = dynamic(() => import('@/components/app/AppPageContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading App...</p>
        <p className="text-xs text-gray-500 mt-2">DEBUG: /app page is loading</p>
      </div>
    </div>
  ),
});

export default function AppPage() {
  console.log('AppPage component rendering');
  return (
    <div>
      <div className="hidden">DEBUG: This is the /app route page</div>
      <AppPageContent />
    </div>
  );
}
