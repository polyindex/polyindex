'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PolymarketMarket } from '@/types';
import { filterMarkets, getMarketCategories } from '@/lib/polymarket/client';

export default function CreateIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const { profile, loading: authLoading, isAuthenticated } = useAuth();

  const [filteredMarkets, setFilteredMarkets] = useState<PolymarketMarket[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Index Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minVolume, setMinVolume] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [minLiquidity, setMinLiquidity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [minEndDate, setMinEndDate] = useState('');
  const [maxEndDate, setMaxEndDate] = useState('');

  // Predefined categories from Polymarket
  const categories = ['Politics', 'Crypto', 'Sports', 'Tech', 'Finance', 'Geopolitics', 'Economy', 'Culture', 'Science', 'Other'];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch index data if in edit mode
  useEffect(() => {
    if (isEditMode && editId && isAuthenticated) {
      fetchIndexData(editId);
    }
  }, [isEditMode, editId, isAuthenticated]);

  const fetchIndexData = async (id: string) => {
    try {
      const res = await fetch(`/api/indexes/${id}`);
      if (res.ok) {
        const index = await res.json();
        // Pre-fill form with existing data
        setName(index.name);
        setDescription(index.description || '');
        setIsPublic(index.isPublic);

        if (index.filters) {
          setSelectedCategories(index.filters.categories || []);
          setMinVolume(index.filters.minVolume?.toString() || '');
          setMaxVolume(index.filters.maxVolume?.toString() || '');
          setMinLiquidity(index.filters.minLiquidity?.toString() || '');
          setKeyword(index.filters.keywords?.[0] || '');
          setMinEndDate(index.filters.minEndDate || '');
          setMaxEndDate(index.filters.maxEndDate || '');
        }
      } else {
        alert('Failed to load index data');
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error fetching index:', error);
      alert('Failed to load index data');
      router.push('/profile');
    }
  };

  const handlePreview = async () => {
    setLoadingPreview(true);
    setShowPreview(true);
    setPreviewError(null);

    try {
      // Build API URL with date parameters for better filtering
      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
      });

      // Add date filters to API call
      if (maxEndDate) {
        params.append('endDateBefore', maxEndDate);
      }
      if (minEndDate) {
        params.append('endDateAfter', minEndDate);
      }

      // Fetch markets from Polymarket with date filters applied at API level
      const res = await fetch(`/api/polymarket/markets?${params.toString()}`);
      if (res.ok) {
        const allMarkets = await res.json();
        console.log('Fetched markets:', allMarkets.length);
        console.log('Date filters:', { minEndDate, maxEndDate });

        if (!Array.isArray(allMarkets)) {
          console.error('Response is not an array:', allMarkets);
          setPreviewError('Invalid response from API');
          setFilteredMarkets([]);
          return;
        }

        // Check if any client-side filters are applied (excluding date since API handles it)
        const hasClientFilters =
          selectedCategories.length > 0 ||
          minVolume ||
          maxVolume ||
          minLiquidity ||
          keyword;

        // If no client-side filters, show all markets (date already filtered by API)
        if (!hasClientFilters) {
          console.log('No client-side filters applied, showing all markets');
          setFilteredMarkets(allMarkets);
        } else {
          // Apply remaining filters client-side
          const filtered = filterMarkets(allMarkets, {
            categories: selectedCategories.length > 0 ? selectedCategories : undefined,
            minVolume: minVolume ? parseFloat(minVolume) : undefined,
            maxVolume: maxVolume ? parseFloat(maxVolume) : undefined,
            minLiquidity: minLiquidity ? parseFloat(minLiquidity) : undefined,
            keywords: keyword ? [keyword] : undefined,
            // Don't pass date filters here since API handled them
          });

          console.log('Filtered markets (client-side):', filtered.length);
          setFilteredMarkets(filtered);
        }
      } else {
        console.error('Failed to fetch markets:', res.status);
        setPreviewError(`Failed to fetch markets (${res.status})`);
        setFilteredMarkets([]);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to fetch markets');
      setFilteredMarkets([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePublish = async () => {
    if (!name.trim()) {
      alert('Please enter an index name');
      return;
    }

    setCreating(true);

    try {
      const indexData = {
        name,
        description,
        category: selectedCategories.join(', '),
        markets: [], // Dynamic index - no specific markets stored
        filters: {
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          minVolume: minVolume ? parseFloat(minVolume) : undefined,
          maxVolume: maxVolume ? parseFloat(maxVolume) : undefined,
          minLiquidity: minLiquidity ? parseFloat(minLiquidity) : undefined,
          keywords: keyword ? [keyword] : undefined,
          minEndDate: minEndDate || undefined,
          maxEndDate: maxEndDate || undefined,
        },
        isPublic,
      };

      console.log(isEditMode ? 'Updating Index' : 'Creating Index', 'with data:', indexData);

      const res = await fetch(isEditMode ? `/api/indexes/${editId}` : '/api/indexes', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(indexData),
      });

      console.log('Index operation response:', { status: res.status, ok: res.ok });

      if (!res.ok) {
        const data = await res.json();
        console.error('Index operation failed:', data);
        throw new Error(data.details || data.error || `Failed to ${isEditMode ? 'update' : 'create'} index`);
      }

      router.push('/profile');
    } catch (error) {
      alert(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} index`);
    } finally {
      setCreating(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinVolume('');
    setMaxVolume('');
    setMinLiquidity('');
    setKeyword('');
    setMinEndDate('');
    setMaxEndDate('');
  };

  if (authLoading || !isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Panel - Filters */}
        <div className="flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Index Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Index Details
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={loadingPreview}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPreview ? 'Loading...' : 'Preview'}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Top Politics Markets"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your index strategy..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make public
                  </label>
                  {/* Apple-style toggle switch */}
                  <button
                    type="button"
                    id="isPublic"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer ${
                      isPublic
                        ? 'bg-red-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters & Rules */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Filters & Rules
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keyword
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search in market titles..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Volume Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Volume Range ($)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={minVolume}
                      onChange={(e) => setMinVolume(e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={maxVolume}
                      onChange={(e) => setMaxVolume(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Liquidity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Liquidity ($)
                  </label>
                  <input
                    type="number"
                    value={minLiquidity}
                    onChange={(e) => setMinLiquidity(e.target.value)}
                    placeholder="e.g., 1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Market End Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="date"
                        value={minEndDate}
                        onChange={(e) => setMinEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">From</span>
                    </div>
                    <div>
                      <input
                        type="date"
                        value={maxEndDate}
                        onChange={(e) => setMaxEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">To</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="w-[600px] bg-gray-50 dark:bg-gray-900/50 overflow-y-auto border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Market Preview
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Markets matching your filter rules
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Match Count */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Matching Markets
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        !loadingPreview && filteredMarkets.length === 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {loadingPreview ? '...' : filteredMarkets.length}
                    </span>
                  </div>
                </div>

                {/* Warning for 0 markets */}
                {!loadingPreview && filteredMarkets.length === 0 && !previewError && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                          No markets match your filters
                        </h4>
                        <p className="text-xs text-yellow-800 dark:text-yellow-400">
                          Your filters are too strict and no markets currently match them. Try adjusting your criteria to include more markets, or this index will appear empty.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Market List */}
                <div className="space-y-3">
                  {loadingPreview && (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
                    </div>
                  )}

                  {previewError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-300">
                        {previewError}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Check the console for more details
                      </p>
                    </div>
                  )}

                  {!loadingPreview && !previewError && filteredMarkets.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No markets match your filters
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        Try adjusting your criteria and preview again
                      </p>
                    </div>
                  )}

                  {!loadingPreview && filteredMarkets.slice(0, 20).map((market) => (
                    <div
                      key={market.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-500 transition-colors"
                    >
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {market.question}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {market.category}
                        </span>
                        <span>Vol: ${(market.volume / 1000).toFixed(0)}K</span>
                        <span>Liq: ${(market.liquidity / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}

                  {!loadingPreview && filteredMarkets.length > 20 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        + {filteredMarkets.length - 20} more markets
                      </p>
                    </div>
                  )}
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                        Dynamic Index
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-400">
                        This index will automatically update as new markets are created or existing ones close, based on your filter rules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Button - Sticky at bottom */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 z-10">
              <button
                type="button"
                onClick={handlePublish}
                disabled={creating || !name.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating
                  ? (isEditMode ? 'Updating...' : 'Publishing...')
                  : (isEditMode ? 'Update Index' : 'Publish Index')
                }
              </button>
              {!name.trim() && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                  Please enter an index name before {isEditMode ? 'updating' : 'publishing'}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

