'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { IndexCard } from '@/components/IndexCard';
import { Index } from '@/types';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [indexes, setIndexes] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'myindexes'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'volume'>('newest');

  useEffect(() => {
    async function fetchIndexes() {
      try {
        // Fetch indexes
        const res = await fetch('/api/indexes');
        if (!res.ok) {
          throw new Error('Failed to fetch indexes');
        }
        const indexesData = await res.json();

        // Fetch markets for calculating dynamic Index counts
        const marketsRes = await fetch('/api/polymarket/markets?limit=100');
        if (marketsRes.ok) {
          const marketsData = await marketsRes.json();
          const { filterMarkets } = await import('@/lib/polymarket/client');

          // Calculate market counts for dynamic indexes
          const indexesWithCounts = indexesData.map((index: Index) => {
            if (index.filters && (!index.markets || index.markets.length === 0)) {
              // Dynamic index - calculate market count
              const filteredMarkets = filterMarkets(marketsData, index.filters);
              return {
                ...index,
                marketCount: filteredMarkets.length,
                totalVolume: filteredMarkets.reduce((sum, m) => sum + m.volume, 0),
              };
            }
            return index;
          });

          setIndexes(indexesWithCounts);
        } else {
          // If markets fetch fails, just use index data as is
          setIndexes(indexesData);
        }
      } catch (error) {
        console.error('Error fetching indexes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIndexes();
  }, []);

      // Apply all filters
  let filteredIndexes = filter === 'myindexes' ? indexes.filter(e => e.createdBy === user?.id) : indexes;

  // Apply search
  if (searchQuery) {
    filteredIndexes = filteredIndexes.filter(index =>
      index.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      index.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply category filter
  if (categoryFilter !== 'all') {
    filteredIndexes = filteredIndexes.filter(index =>
      index.category?.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  // Apply sorting
  filteredIndexes = [...filteredIndexes].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.totalVolume || 0) - (a.totalVolume || 0);
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredIndexes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIndexes = filteredIndexes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy, filter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Outer container box */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header with filters and column headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            {/* Tabs and Create Button */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-8">
                <button
                  onClick={() => setFilter('all')}
                  className={`text-base font-medium transition-colors ${
                    filter === 'all'
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  All
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setFilter('myindexes')}
                    className={`text-base font-medium transition-colors ${
                      filter === 'myindexes'
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    My Indexes
                  </button>
                )}
              </div>

              {isAuthenticated && (
                <Link
                  href="/create-index"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg transition-colors"
                >
                  Create Index
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="px-6 py-4 flex items-center justify-between gap-6">
              {/* Left side - Filter buttons */}
              <div className="flex items-center gap-6">
                {/* Category Filter */}
                <div className="relative">
                  <button
                    onClick={() => {
                      const categories = ['all', 'politics', 'crypto', 'sports', 'tech', 'finance', 'geopolitics', 'economy', 'culture', 'science'];
                      const currentIndex = categories.indexOf(categoryFilter);
                      const nextIndex = (currentIndex + 1) % categories.length;
                      setCategoryFilter(categories[nextIndex]);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <span className="font-medium">Category:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium capitalize">
                      {categoryFilter === 'all' ? 'All' : categoryFilter}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Sort Filter */}
                <button
                  onClick={() => setSortBy(sortBy === 'newest' ? 'volume' : 'newest')}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <span className="font-medium">Sort:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {sortBy === 'newest' ? 'Newest' : 'Volume'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>

                {/* Results count */}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredIndexes.length} {filteredIndexes.length === 1 ? 'result' : 'results'}
                </span>
              </div>

              {/* Right side - Search */}
              <div className="w-80">
                <input
                  type="text"
                  placeholder="Search Indexes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Column Headers */}
            {!loading && filteredIndexes.length > 0 && (
              <div className="px-4 pb-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="col-span-4 pl-16">Index</div>
                  <div className="col-span-3">Creator</div>
                  <div className="col-span-2 text-center">Markets</div>
                  <div className="col-span-1 text-center">Stars</div>
                  <div className="col-span-2 text-right">Volume</div>
                </div>
              </div>
            )}
          </div>

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

            {!loading && filteredIndexes.length === 0 && (
              <div className="text-center py-24">
                <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
                  No indexes found. Be the first to create one!
                </p>
              </div>
            )}

            {!loading && paginatedIndexes.length > 0 && (
              <div className="flex flex-col gap-2">
                {paginatedIndexes.map((index) => (
                  <IndexCard
                    key={index.id}
                    index={index}
                    showControls={filter === 'myindexs' && index.createdBy === user?.id}
                    onStarChange={(indexId, newStarCount, isStarred) => {
                      // Update the index in the state with new star info
                      setIndexes(indexes.map(e =>
                        e.id === indexId
                          ? { ...e, starCount: newStarCount, isStarred }
                          : e
                      ));
                    }}
                    onIndexUpdate={(updatedIndex) => {
                      // Update the index in the state
                      setIndexes(indexes.map(e => e.id === updatedIndex.id ? updatedIndex : e));
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredIndexes.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredIndexes.length)} of {filteredIndexes.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
