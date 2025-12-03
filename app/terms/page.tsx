'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              1. Service Description
            </h2>
            <p>
              Polyindex is an informational tool that allows users to create and view collections
              (Indexes) of Polymarket prediction markets. This service does not facilitate any trading,
              buying, or selling of prediction market shares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              2. No Trading
            </h2>
            <p>
              Polyindex is strictly informational. All trading must be conducted directly on Polymarket.
              We do not handle funds, execute trades, or facilitate any financial transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              3. User Accounts
            </h2>
            <p>
              Users may create accounts to save and share their custom indexes. You are responsible
              for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              4. Content
            </h2>
            <p>
              Indexes created by users are their own content. By making an index public, you grant
              Polyindex the right to display it on the platform. You retain ownership of your content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              5. Disclaimer
            </h2>
            <p>
              Polyindex provides information only and does not constitute financial advice.
              Prediction markets involve risk. Always do your own research.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              6. Changes
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the
              service constitutes acceptance of any changes.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
