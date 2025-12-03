'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { IndexCard } from '@/components/IndexCard';
import { Index } from '@/types';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [indexes, setIndexes] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    async function fetchUserIndexes() {
      try {
        const res = await fetch(`/api/user/${username}/indexes`);
        if (res.ok) {
          const data = await res.json();
          setIndexes(data);
          // Calculate total stars
          const stars = data.reduce((sum: number, index: Index) => sum + (index.starCount || 0), 0);
          setTotalStars(stars);
        }
      } catch (error) {
        console.error('Error fetching user indexes:', error);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchUserIndexes();
    }
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* User Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {username}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{indexes.length} Public Indexes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>{totalStars} Total Stars</span>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Indexes List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Public Indexes
            </h2>
          </div>

          {/* Column Headers */}
          {!loading && indexes.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 pb-3 pt-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <div className="col-span-4 pl-16">Index</div>
                <div className="col-span-3">Creator</div>
                <div className="col-span-2 text-center">Markets</div>
                <div className="col-span-1 text-center">Stars</div>
                <div className="col-span-2 text-right">Volume</div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {loading && (
              <div className="flex justify-center items-center py-24">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 dark:border-gray-700"></div>
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 absolute top-0 left-0"></div>
                </div>
              </div>
            )}

            {!loading && indexes.length === 0 && (
              <div className="text-center py-24">
                <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
                  This user hasn't created any public indexes yet.
                </p>
              </div>
            )}

            {!loading && indexes.length > 0 && (
              <div className="flex flex-col gap-2">
                {indexes.map((index) => (
                  <IndexCard
                    key={index.id}
                    index={index}
                    onStarChange={(indexId, newStarCount, isStarred) => {
                      // Update the index in the state with new star info
                      setIndexes(indexes.map(e =>
                        e.id === indexId
                          ? { ...e, starCount: newStarCount, isStarred }
                          : e
                      ));
                      // Recalculate total stars
                      const newTotalStars = indexes.reduce((sum, e) =>
                        sum + (e.id === indexId ? newStarCount : (e.starCount || 0)), 0
                      );
                      setTotalStars(newTotalStars);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
