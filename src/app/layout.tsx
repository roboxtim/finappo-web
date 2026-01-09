import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
  ],
  authors: [{ name: 'Finappo' }],
  openGraph: {
    title: 'Finappo - Track Your Family Budget. Simply.',
    description:
      'Beautiful, powerful expense tracking designed for families who want to spend smarter together.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Finappo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finappo - Track Your Family Budget. Simply.',
    description:
      'Beautiful, powerful expense tracking designed for families who want to spend smarter together.',
  },
  metadataBase: new URL('https://finappo.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PBF9R7KS');`,
          }}
        />
        {/* End Google Tag Manager */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1053605285835650"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PBF9R7KS"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
