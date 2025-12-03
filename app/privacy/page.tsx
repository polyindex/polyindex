'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Information We Collect
            </h2>
            <p>
              When you create an account, we collect your email address, username, and password
              (stored securely as a hash).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              How We Use Your Information
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To provide and maintain the Polyindex service</li>
              <li>To manage your account and subscription</li>
              <li>To display your username on public indexes you create</li>
              <li>To communicate important service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Data Storage
            </h2>
            <p>
              Your data is stored securely in Supabase (PostgreSQL database). Passwords are hashed
              using bcrypt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Third-Party Services
            </h2>
            <p>
              We use the following third-party services:
            </p>
            <ul className="space-y-2 list-disc list-inside mt-2">
              <li>Supabase - Database hosting</li>
              <li>Polymarket API - Market data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Cookies
            </h2>
            <p className="mb-3">
              We use cookies and local storage to improve your experience on our site. Here's what we use:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Essential Cookies:</strong> Authentication cookies from Supabase to keep you logged in</li>
              <li><strong>Preference Storage:</strong> Local storage to remember your cookie consent choice</li>
              <li><strong>No Tracking:</strong> We do not use analytics, advertising, or tracking cookies</li>
            </ul>
            <p className="mt-3">
              You can manage your cookie preferences at any time by clearing your browser cookies and refreshing the page to see the consent banner again.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Data Deletion
            </h2>
            <p>
              You can delete your account at any time from your profile page. This will permanently
              remove all your data, including your indexes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of any
              material changes by email or through the service.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
