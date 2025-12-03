'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">

        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            Polyindex helps you create diversified portfolios of Polymarket prediction markets.
          </p>

          <p>
            Think of it like an index for prediction markets - instead of picking individual markets,
            build a basket of markets around a theme, category, or strategy.
          </p>

          <div className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              how it works
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Browse active Polymarket markets</li>
              <li>Filter by category, volume, and closing date</li>
              <li>Select markets to build your custom index</li>
              <li>Share your index with the community</li>
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PolyIndex is an independent analytics tool. It is not a broker, does not execute trades,
              and does not offer financial products.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
