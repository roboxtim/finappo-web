import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finappo - Track Your Family Budget. Simply.",
  description: "Beautiful, powerful expense tracking designed for families who want to spend smarter together. Smart categories, family sharing, and real-time budget insights.",
  keywords: ["budget", "expense tracker", "family budget", "spending tracker", "financial app", "money management"],
  authors: [{ name: "Finappo" }],
  openGraph: {
    title: "Finappo - Track Your Family Budget. Simply.",
    description: "Beautiful, powerful expense tracking designed for families who want to spend smarter together.",
    type: "website",
    locale: "en_US",
    siteName: "Finappo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finappo - Track Your Family Budget. Simply.",
    description: "Beautiful, powerful expense tracking designed for families who want to spend smarter together.",
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
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1053605285835650"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
