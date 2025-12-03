import { PolymarketMarket } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface MarketCardProps {
  market: PolymarketMarket;
  selected?: boolean;
  onToggle?: (market: PolymarketMarket) => void;
  showCheckbox?: boolean;
}

const categoryColors: { [key: string]: string } = {
  'Crypto': 'bg-orange-300',
  'Finance': 'bg-emerald-300',
  'Politics': 'bg-blue-300',
  'Geopolitics': 'bg-purple-300',
  'Sports': 'bg-green-300',
  'Tech': 'bg-violet-300',
  'Economy': 'bg-cyan-300',
  'Culture': 'bg-pink-300',
  'Science': 'bg-teal-300',
  'Other': 'bg-gray-300',
};

export function MarketCard({ market, selected = false, onToggle, showCheckbox = false }: MarketCardProps) {
  const endDate = new Date(market.endDate);
  const isExpiringSoon = endDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
  const categoryColor = categoryColors[market.category] || categoryColors['Other'];
  
  // Polymarket URL - use the slug if available, otherwise fall back to ID
  const polymarketUrl = market.slug 
    ? `https://polymarket.com/event/${market.slug}`
    : `https://polymarket.com/event/${market.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (showCheckbox) {
      onToggle?.(market);
    } else {
      // Open in new tab if not in checkbox mode
      window.open(polymarketUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`bg-[#1e2936] rounded-xl border ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-400/50'
          : 'border-[#2d3a47]'
      } hover:border-[#3d4a57] transition-all duration-200 p-5 cursor-pointer h-full overflow-hidden relative group`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 mb-4">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle?.(market)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-4">
            {market.image && (
              <img 
                src={market.image} 
                alt="" 
                className="w-8 h-8 rounded object-cover flex-shrink-0"
              />
            )}
            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors flex-1">
              {market.question}
            </h3>
            {isExpiringSoon && (
              <span className="flex-shrink-0 text-xs bg-yellow-500/20 text-yellow-400 font-medium px-2 py-0.5 rounded">
                Soon
              </span>
            )}
          </div>

          {market.outcomes && market.outcomePrices && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {market.outcomes.map((outcome, idx) => {
                const price = market.outcomePrices[idx] * 100;
                const isYes = outcome.toLowerCase() === 'yes';
                const isNo = outcome.toLowerCase() === 'no';

                return (
                  <div
                    key={idx}
                    className={`rounded-lg px-3 py-2.5 ${
                      isYes
                        ? 'bg-emerald-500/10'
                        : isNo
                        ? 'bg-rose-500/10'
                        : price > 50
                        ? 'bg-emerald-500/10'
                        : 'bg-rose-500/10'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-0.5 ${
                      isYes || (!isYes && !isNo && price > 50)
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}>
                      {outcome}
                    </div>
                    <div className={`font-bold text-lg ${
                      isYes || (!isYes && !isNo && price > 50)
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}>
                      {price.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">
                ${market.volume >= 1000000 
                  ? `${(market.volume / 1000000).toFixed(1)}m`
                  : `${(market.volume / 1000).toFixed(0)}k`
                } Vol.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
