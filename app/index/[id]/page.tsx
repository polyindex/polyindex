'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MarketCard } from '@/components/MarketCard';
import { Index } from '@/types';
import { PolymarketMarket } from '@/types';
import { filterMarkets } from '@/lib/polymarket/client';

export default function IndexDetailPage() {
  const params = useParams();
  const [index, setIndex] = useState<Index | null>(null);
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIndexData() {
      setLoading(true);
      try {
        // Fetch all indexes
        const res = await fetch('/api/indexes');
        if (res.ok) {
          const allIndexes = await res.json();
          const foundIndex = allIndexes.find((e: Index) => e.id === params.id);

          if (foundIndex) {
            setIndex(foundIndex);

            // Fetch all markets
            const marketsRes = await fetch('/api/polymarket/markets?offset=0&limit=100');
            if (marketsRes.ok) {
              const allMarkets = await marketsRes.json();

              // Check if this is a dynamic index (has filters)
              if (foundIndex.filters && Object.keys(foundIndex.filters).length > 0) {
                // Apply filters to get matching markets
                const filtered = filterMarkets(allMarkets, foundIndex.filters);
                setMarkets(filtered);
              } else {
                // Static index - use specific market IDs
                const indexMarkets = allMarkets.filter((m: PolymarketMarket) =>
                  foundIndex.markets.includes(m.id)
                );
                setMarkets(indexMarkets);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching index data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchIndexData();
    }
  }, [params.id]);

  const isCurated = index?.createdBy === 'system';
  const isDynamic = index?.filters && Object.keys(index.filters).length > 0;

  const indexColors: { [key: string]: string } = {
    'curated-high-conviction': 'bg-purple-300',
    'curated-coin-flip': 'bg-blue-300',
    'curated-crypto-watch': 'bg-orange-300',
    'curated-politics-power': 'bg-indigo-300',
    'curated-tech-futures': 'bg-violet-300',
    default: 'bg-gray-300',
  };

  const color = index ? indexColors[index.id] || indexColors.default : indexColors.default;

  return (
    <div className="min-h-screen bg-[#151d28] transition-colors flex flex-col">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 absolute top-0 left-0"></div>
            </div>
          </div>
        )}

        {!loading && !index && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Index not found.</p>
          </div>
        )}

        {!loading && index && (
          <>
            {/* Index Header */}
            <div className="mb-8 bg-[#1e2936] rounded-xl border border-[#2d3a47] p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${color}`}></div>

              <div className="mt-2">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-white">{index.name}</h1>
                  {isCurated && (
                    <span className={`${color} text-gray-900 text-sm font-semibold px-3 py-1 rounded-full shadow-sm`}>
                      curated
                    </span>
                  )}
                  {isDynamic && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full border border-blue-300 dark:border-blue-700">
                      🔄 dynamic
                    </span>
                  )}
                </div>

                {index.description && (
                  <p className="text-gray-300 text-lg mb-6">
                    {index.description}
                  </p>
                )}

                {isDynamic && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-blue-300 mb-1">
                          Dynamic Index
                        </h3>
                        <p className="text-sm text-blue-200/80">
                          This index automatically updates based on filter rules. Markets are added or removed as they match the criteria.
                        </p>

                        {/* Active Filters */}
                        {index.filters && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {index.filters.categories && index.filters.categories.length > 0 && (
                              <span className="text-xs bg-[#1e2936] text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                Categories: {index.filters.categories.join(', ')}
                              </span>
                            )}
                            {index.filters.minVolume && (
                              <span className="text-xs bg-[#1e2936] text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                Min Volume: ${index.filters.minVolume.toLocaleString()}
                              </span>
                            )}
                            {index.filters.maxVolume && (
                              <span className="text-xs bg-[#1e2936] text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                Max Volume: ${index.filters.maxVolume.toLocaleString()}
                              </span>
                            )}
                            {index.filters.minLiquidity && (
                              <span className="text-xs bg-[#1e2936] text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                Min Liquidity: ${index.filters.minLiquidity.toLocaleString()}
                              </span>
                            )}
                            {index.filters.keywords && index.filters.keywords.length > 0 && (
                              <span className="text-xs bg-[#1e2936] text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                Keywords: {index.filters.keywords.join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                      {isDynamic ? 'Current Markets' : 'Markets'}
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {markets.length}
                    </span>
                  </div>

                  {markets.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Total Volume</span>
                      <span className="text-2xl font-bold text-white">
                        ${(markets.reduce((sum, m) => sum + m.volume, 0) / 1000000).toFixed(2)}M
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Creator</span>
                    {isCurated ? (
                      <span className="text-lg font-semibold text-blue-400">Polyindex</span>
                    ) : (
                      <span className="text-lg font-semibold text-white">{index.createdByUsername || 'anonymous'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Markets Grid */}
            {markets.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 mb-4">
                  {isDynamic ? 'No markets currently match the filter criteria.' : 'No markets found in this index.'}
                </p>
              </div>
            )}

            {markets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {markets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

