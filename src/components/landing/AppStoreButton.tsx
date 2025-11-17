'use client';

interface AppStoreButtonProps {
  variant?: 'primary' | 'secondary';
}

export function AppStoreButton({ variant = 'primary' }: AppStoreButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <a
      href="https://apps.apple.com/us/app/finappo/id6754455387"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        isPrimary
          ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:bg-[#0051D5]'
          : 'bg-white border-2 border-gray-200 text-gray-900 shadow-sm hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <div className="flex flex-col items-start -my-1">
        <span className="text-xs opacity-90 font-normal">Download on the</span>
        <span className="text-base font-semibold -mt-0.5">App Store</span>
      </div>
    </a>
  );
}
