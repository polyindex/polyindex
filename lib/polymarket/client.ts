import { PolymarketMarket } from '@/types';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';

export async function fetchPolymarketMarkets(
  offset: number = 0, 
  limit: number = 20,
  params?: {
    endDateBefore?: string;
    endDateAfter?: string;
  }
): Promise<PolymarketMarket[]> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      active: 'true',
      closed: 'false',
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Add date filters if provided
    if (params?.endDateBefore) {
      queryParams.append('end_date_before', params.endDateBefore);
    }
    if (params?.endDateAfter) {
      queryParams.append('end_date_after', params.endDateAfter);
    }

    // Fetch active markets from Polymarket API (using events endpoint for better data)
    const response = await fetch(`${POLYMARKET_API_BASE}/events?${queryParams.toString()}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Polymarket markets');
    }

    const data = await response.json();

    // Transform API response to our format
    const markets: PolymarketMarket[] = data
      .filter((event: any) => event.active && !event.closed && event.markets && event.markets.length > 0)
      .map((event: any) => {
        // Get category from tags - use Polymarket's actual categories
        let category = 'Other';

        if (event.tags && Array.isArray(event.tags)) {
          const tagLabels = event.tags.map((tag: any) => tag.label.toLowerCase());

          // Map to Polymarket's actual categories in priority order
          if (tagLabels.some((t: string) =>
            t === 'crypto' || t.includes('bitcoin') || t.includes('ethereum') ||
            t.includes('crypto price') || t.includes('defi') || t === 'btc' || t === 'eth'
          )) {
            category = 'Crypto';
          } else if (tagLabels.some((t: string) =>
            t === 'finance' || t.includes('stock') || t.includes('earnings') ||
            t.includes('ipo') || t.includes('commodities') || t.includes('gold')
          )) {
            category = 'Finance';
          } else if (tagLabels.some((t: string) =>
            t === 'politics' || t.includes('election') || t.includes('white house') ||
            t.includes('senate') || t.includes('congress') || t.includes('president') ||
            t.includes('immigration')
          )) {
            category = 'Politics';
          } else if (tagLabels.some((t: string) =>
            t === 'geopolitics' || t.includes('foreign policy') || t.includes('gaza') ||
            t.includes('israel') || t.includes('iran') || t.includes('ukraine') ||
            t.includes('russia') || t.includes('china')
          )) {
            category = 'Geopolitics';
          } else if (tagLabels.some((t: string) =>
            t === 'sports' || t.includes('nfl') || t.includes('nba') ||
            t.includes('soccer') || t.includes('football') || t.includes('baseball') ||
            t.includes('basketball') || t.includes('tennis') || t.includes('golf')
          )) {
            category = 'Sports';
          } else if (tagLabels.some((t: string) =>
            t === 'tech' || t === 'ai' || t.includes('big tech') || t.includes('apple') ||
            t.includes('google') || t.includes('microsoft') || t.includes('meta') ||
            t.includes('tesla') || t.includes('openai') || t.includes('deepseek') ||
            t.includes('gpt')
          )) {
            category = 'Tech';
          } else if (tagLabels.some((t: string) =>
            t === 'economy' || t.includes('fed') || t.includes('recession') ||
            t.includes('inflation') || t.includes('gdp') || t.includes('business') ||
            t.includes('economic policy')
          )) {
            category = 'Economy';
          } else if (tagLabels.some((t: string) =>
            t === 'culture' || t.includes('pop culture') || t.includes('celebrities') ||
            t.includes('music') || t.includes('movie') || t.includes('entertainment') ||
            t.includes('awards') || t.includes('creators')
          )) {
            category = 'Culture';
          } else if (tagLabels.some((t: string) =>
            t.includes('science') || t.includes('space') || t.includes('health') ||
            t.includes('medicine') || t.includes('climate') || t.includes('bird flu')
          )) {
            category = 'Science';
          }
        }

        // Get outcomes and prices from the first market in the event
        let outcomes = ['Yes', 'No'];
        let outcomePrices = [0.5, 0.5];

        if (event.markets && event.markets.length > 0) {
          const market = event.markets[0];
          try {
            if (typeof market.outcomes === 'string') {
              outcomes = JSON.parse(market.outcomes);
            } else if (Array.isArray(market.outcomes)) {
              outcomes = market.outcomes;
            }

            if (typeof market.outcomePrices === 'string') {
              outcomePrices = JSON.parse(market.outcomePrices).map((p: string) => parseFloat(p));
            } else if (Array.isArray(market.outcomePrices)) {
              outcomePrices = market.outcomePrices.map((p: any) => parseFloat(p));
            }
          } catch (e) {
            console.error('Error parsing market outcomes:', e);
          }
        }

        return {
          id: event.id || event.slug,
          slug: event.slug, // Store slug for Polymarket URL
          question: event.title || event.slug,
          description: event.description,
          endDate: event.endDate,
          category,
          volume: parseFloat(event.volume || '0'),
          liquidity: parseFloat(event.liquidity || event.liquidityClob || '0'),
          image: event.image || event.icon,
          outcomes,
          outcomePrices,
        };
      });

    return markets;
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error);
    return [];
  }
}

export function filterMarkets(
  markets: PolymarketMarket[],
  filters: {
    categories?: string[];
    minVolume?: number;
    maxVolume?: number;
    minLiquidity?: number;
    maxEndDate?: string;
    minEndDate?: string;
    keywords?: string[];
  }
): PolymarketMarket[] {
  let filtered = markets;

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(m =>
      filters.categories!.includes(m.category)
    );
  }

  if (filters.minVolume) {
    filtered = filtered.filter(m => m.volume >= filters.minVolume!);
  }

  if (filters.maxVolume) {
    filtered = filtered.filter(m => m.volume <= filters.maxVolume!);
  }

  if (filters.minLiquidity) {
    filtered = filtered.filter(m => m.liquidity >= filters.minLiquidity!);
  }

  if (filters.maxEndDate) {
    const maxDate = new Date(filters.maxEndDate);
    filtered = filtered.filter(m => new Date(m.endDate) <= maxDate);
  }

  if (filters.minEndDate) {
    const minDate = new Date(filters.minEndDate);
    filtered = filtered.filter(m => new Date(m.endDate) >= minDate);
  }

  if (filters.keywords && filters.keywords.length > 0) {
    filtered = filtered.filter(m =>
      filters.keywords!.some(keyword =>
        m.question.toLowerCase().includes(keyword.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(keyword.toLowerCase()))
      )
    );
  }

  return filtered;
}

export function getMarketCategories(markets: PolymarketMarket[]): string[] {
  const categories = new Set<string>();
  markets.forEach(m => categories.add(m.category));
  return Array.from(categories).sort();
}
