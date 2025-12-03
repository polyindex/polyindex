'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MarketCard } from '@/components/MarketCard';
import { PolymarketMarket } from '@/types';
import { getMarketCategories } from '@/lib/polymarket/client';

export default function MarketsPage() {
  const [allMarkets, setAllMarkets] = useState<PolymarketMarket[]>([]);
  const [categoryMarkets, setCategoryMarkets] = useState<{ [key: string]: PolymarketMarket[] }>({});
  const [categoryOffsets, setCategoryOffsets] = useState<{ [key: string]: number }>({});
  const [filteredMarkets, setFilteredMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver>();

  const loadMoreMarkets = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const currentOffset = categoryOffsets[selectedCategory] || 20;
      const res = await fetch(`/api/polymarket/markets?offset=${currentOffset}&limit=20`);

      if (res.ok) {
        const newMarkets = await res.json();

        if (newMarkets.length === 0) {
          setHasMore(false);
        } else {
          // Update category-specific markets
          const updatedCategoryMarkets = { ...categoryMarkets };
          const currentCategoryData = updatedCategoryMarkets[selectedCategory] || [];
          updatedCategoryMarkets[selectedCategory] = [...currentCategoryData, ...newMarkets];
          setCategoryMarkets(updatedCategoryMarkets);

          // Update offsets
          setCategoryOffsets(prev => ({
            ...prev,
            [selectedCategory]: currentOffset + 20
          }));

          // Update all markets if category is 'all'
          if (selectedCategory === 'all') {
            setAllMarkets(prev => [...prev, ...newMarkets]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading more markets:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const lastMarketRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !searchQuery) {
        loadMoreMarkets();
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, searchQuery, selectedCategory, categoryOffsets, categoryMarkets]);

  const categories = allMarkets.length > 0 ? ['all', ...getMarketCategories(allMarkets)] : ['all'];

  useEffect(() => {
    async function fetchInitialMarkets() {
      setLoading(true);
      try {
        const res = await fetch('/api/polymarket/markets?offset=0&limit=20');
        if (res.ok) {
          const data = await res.json();
          setAllMarkets(data);
          setCategoryMarkets({ all: data });
          setCategoryOffsets({ all: 20 });
        }
      } catch (error) {
        console.error('Error fetching markets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialMarkets();
  }, []);

  useEffect(() => {
    // When category changes, check if we need to fetch data for that category
    async function fetchCategoryMarkets() {
      if (selectedCategory !== 'all' && !categoryMarkets[selectedCategory]) {
        setLoading(true);
        try {
          const res = await fetch('/api/polymarket/markets?offset=0&limit=20');
          if (res.ok) {
            const data = await res.json();
            setCategoryMarkets(prev => ({ ...prev, [selectedCategory]: data }));
            setCategoryOffsets(prev => ({ ...prev, [selectedCategory]: 20 }));
          }
        } catch (error) {
          console.error('Error fetching category markets:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchCategoryMarkets();
    setHasMore(true);
  }, [selectedCategory]);

  useEffect(() => {
    const marketsToFilter = selectedCategory === 'all'
      ? allMarkets
      : (categoryMarkets[selectedCategory] || []);

    let filtered = marketsToFilter;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by volume (highest first)
    filtered = filtered.sort((a, b) => b.volume - a.volume);

    setFilteredMarkets(filtered);
  }, [allMarkets, categoryMarkets, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#151d28] transition-colors flex flex-col">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#2d3a47] rounded-lg bg-[#1e2936] text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {!loading && (
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredMarkets.length} of {allMarkets.length} markets
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 absolute top-0 left-0"></div>
            </div>
          </div>
        )}

        {!loading && allMarkets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">
              No markets available at the moment.
            </p>
          </div>
        )}

        {!loading && filteredMarkets.length === 0 && allMarkets.length > 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">
              No markets match your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-blue-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && filteredMarkets.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map((market, index) => (
                <div
                  key={market.id}
                  ref={index === filteredMarkets.length - 1 ? lastMarketRef : undefined}
                >
                  <MarketCard market={market} />
                </div>
              ))}
            </div>

            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 border-r-purple-500 absolute top-0 left-0"></div>
                </div>
              </div>
            )}

            {!hasMore && !searchQuery && (
              <div className="text-center py-8 text-gray-400">
                No more markets to load
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
