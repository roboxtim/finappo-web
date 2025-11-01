'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the app component with SSR disabled
const AppPageContent = dynamic(() => import('@/components/app/AppPageContent'), {
  ssr: false,
});

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppPageContent />
    </Suspense>
  );
}
