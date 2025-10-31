import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy - Finappo",
  description: "Learn how Finappo protects your personal and financial data. We respect your privacy and are committed to keeping your family budget information secure.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <Image
              src="/logo.png"
              alt="Finappo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-semibold text-gray-900">Finappo</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-12">
          Last updated: October 31, 2025
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Finappo. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we handle your personal data when you use our
              mobile application and tell you about your privacy rights.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Finappo collects and processes the following types of data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Account Information:</strong> Email address and authentication credentials
                (via Firebase Authentication)
              </li>
              <li>
                <strong>Financial Data:</strong> Transaction records, category names, budget amounts,
                and spending information you manually enter
              </li>
              <li>
                <strong>Family Data:</strong> Family member names, email addresses for invitations,
                and shared budget information
              </li>
              <li>
                <strong>Device Information:</strong> Device type, operating system version, and app version
                for diagnostic purposes
              </li>
              <li>
                <strong>Usage Data:</strong> App interactions and feature usage to improve our services
              </li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How We Use Your Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To provide and maintain our budget tracking service</li>
              <li>To enable family budget sharing features</li>
              <li>To sync your data across your devices in real-time</li>
              <li>To send you important service notifications</li>
              <li>To improve and optimize our application</li>
              <li>To provide customer support when requested</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Storage and Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored securely using Google Firebase services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>Data is encrypted at rest on Firebase servers</li>
              <li>We implement strict access controls to your personal data</li>
              <li>Each user&apos;s data is isolated and accessible only to authorized family members</li>
              <li>We regularly review and update our security measures</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Sharing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal data to third parties.
              Your financial information is shared only:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>With family members you explicitly invite to your budget</li>
              <li>With Firebase (Google) as our cloud infrastructure provider</li>
              <li>When required by law or legal process</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Access:</strong> You can view all your data within the app at any time
              </li>
              <li>
                <strong>Correction:</strong> You can edit or update your information directly in the app
              </li>
              <li>
                <strong>Deletion:</strong> You can delete your account and all associated data from
                the Account settings
              </li>
              <li>
                <strong>Export:</strong> You can export your transaction data in CSV format
              </li>
              <li>
                <strong>Withdrawal:</strong> You can revoke family member access at any time
              </li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Finappo is not intended for use by children under the age of 13. We do not knowingly
              collect personal data from children under 13. If you are a parent or guardian and believe
              your child has provided us with personal data, please contact us.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or how we handle your data,
              please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@finappo.com" className="text-blue-600 hover:text-blue-700">
                  privacy@finappo.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>App:</strong> Use the &quot;Contact Support&quot; option in Account settings
              </p>
            </div>
          </section>

          {/* Firebase Notice */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Finappo uses Firebase (Google Cloud Platform) for authentication and data storage.
              Firebase&apos;s data processing is governed by Google&apos;s privacy policy:
            </p>
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Firebase Privacy and Security
            </a>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
            <Image
              src="/logo.png"
              alt="Finappo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <p>© 2025 Finappo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
