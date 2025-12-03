import { Index } from '@/types';
import { PolymarketMarket } from '@/types';

// Generate deterministic UUID from string (v5 UUID with a namespace)
function generateDeterministicUUID(name: string): string {
  // Use a fixed namespace UUID for curated indexes
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  // For simplicity, create a deterministic UUID by hashing the name
  // In production, you'd use a proper UUID v5 implementation
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${namespace.slice(0, 18)}${hex.slice(0, 4)}-${hex.slice(4, 8)}${namespace.slice(32)}`;
}

export function generateCuratedIndexes(markets: PolymarketMarket[]): Index[] {
  const indexes: Index[] = [];

  // 1. High Conviction - Markets with strong directional probability (>75% or <25%)
  const highConvictionMarkets = markets
    .filter(m => {
      if (!m.outcomePrices || m.outcomePrices.length === 0) return false;
      const maxPrice = Math.max(...m.outcomePrices);
      return maxPrice > 0.75 || maxPrice < 0.25;
    })
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  if (highConvictionMarkets.length > 0) {
    indexes.push({
      id: generateDeterministicUUID('curated-high-conviction'),
      name: 'High Conviction',
      description: 'Markets with strong directional probability and high trading volume',
      createdBy: 'system',
      createdByUsername: 'system',
      isPublic: true,
      category: 'Finance',
      markets: highConvictionMarkets.map(m => m.id),
      createdAt: new Date().toISOString(),
      marketCount: highConvictionMarkets.length,
      totalVolume: highConvictionMarkets.reduce((sum, m) => sum + m.volume, 0),
    });
  }

  // 2. Coin Flip - Markets close to 50/50 (40-60% range)
  const balancedMarkets = markets
    .filter(m => {
      if (!m.outcomePrices || m.outcomePrices.length === 0) return false;
      const maxPrice = Math.max(...m.outcomePrices);
      return maxPrice >= 0.40 && maxPrice <= 0.60;
    })
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  if (balancedMarkets.length > 0) {
    indexes.push({
      id: generateDeterministicUUID('curated-coin-flip'),
      name: 'Coin Flip',
      description: 'Highly contested markets with near 50/50 odds',
      createdBy: 'system',
      createdByUsername: 'system',
      isPublic: true,
      category: 'Finance',
      markets: balancedMarkets.map(m => m.id),
      createdAt: new Date().toISOString(),
      marketCount: balancedMarkets.length,
      totalVolume: balancedMarkets.reduce((sum, m) => sum + m.volume, 0),
    });
  }

  // 3. Crypto Watch - Top crypto markets by volume
  const cryptoMarkets = markets
    .filter(m => m.category === 'Crypto')
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  if (cryptoMarkets.length > 0) {
    indexes.push({
      id: generateDeterministicUUID('curated-crypto-watch'),
      name: 'Crypto Watch',
      description: 'Top cryptocurrency prediction markets by trading volume',
      createdBy: 'system',
      createdByUsername: 'system',
      isPublic: true,
      category: 'Crypto',
      markets: cryptoMarkets.map(m => m.id),
      createdAt: new Date().toISOString(),
      marketCount: cryptoMarkets.length,
      totalVolume: cryptoMarkets.reduce((sum, m) => sum + m.volume, 0),
    });
  }

  // 4. Politics & Power - Top political and geopolitical markets
  const politicsMarkets = markets
    .filter(m => m.category === 'Politics' || m.category === 'Geopolitics')
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  if (politicsMarkets.length > 0) {
    indexes.push({
      id: generateDeterministicUUID('curated-politics-power'),
      name: 'Politics & Power',
      description: 'Key political and geopolitical events shaping the world',
      createdBy: 'system',
      createdByUsername: 'system',
      isPublic: true,
      category: 'Politics',
      markets: politicsMarkets.map(m => m.id),
      createdAt: new Date().toISOString(),
      marketCount: politicsMarkets.length,
      totalVolume: politicsMarkets.reduce((sum, m) => sum + m.volume, 0),
    });
  }

  // 5. Tech Futures - Technology and AI markets
  const techMarkets = markets
    .filter(m => m.category === 'Tech')
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  if (techMarkets.length > 0) {
    indexes.push({
      id: generateDeterministicUUID('curated-tech-futures'),
      name: 'Tech Futures',
      description: 'AI, big tech, and emerging technology predictions',
      createdBy: 'system',
      createdByUsername: 'system',
      isPublic: true,
      category: 'Tech',
      markets: techMarkets.map(m => m.id),
      createdAt: new Date().toISOString(),
      marketCount: techMarkets.length,
      totalVolume: techMarkets.reduce((sum, m) => sum + m.volume, 0),
    });
  }

  return indexes;
}
