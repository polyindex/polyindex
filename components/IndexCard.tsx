import { Index } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface IndexCardProps {
  index: Index;
  onStarChange?: (indexId: string, newStarCount: number, isStarred: boolean) => void;
  showControls?: boolean; // Show edit controls for user's own indexes
  onIndexUpdate?: (updatedIndex: Index) => void; // Callback when index is updated
}

// Category-based icon mapping
const getCategoryIcon = (category?: string) => {
  if (!category) return '📊';
  const cat = category.toLowerCase();
  if (cat.includes('politics')) return '🗳️';
  if (cat.includes('crypto')) return '₿';
  if (cat.includes('sport')) return '⚽';
  if (cat.includes('tech')) return '💻';
  if (cat.includes('finance')) return '💰';
  if (cat.includes('geopolitics')) return '🌍';
  if (cat.includes('economy')) return '📈';
  if (cat.includes('culture')) return '🎭';
  if (cat.includes('science')) return '🔬';
  return '📊';
};

export function IndexCard({ index, onStarChange, showControls, onIndexUpdate }: IndexCardProps) {
  const icon = getCategoryIcon(index.category);
  const { isAuthenticated, user } = useAuth();
  const [isStarred, setIsStarred] = useState(index.isStarred || false);
  const [starCount, setStarCount] = useState(index.starCount || 0);
  const [isStarring, setIsStarring] = useState(false);
  const [isPublic, setIsPublic] = useState(index.isPublic);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to star indexes');
      return;
    }

    // Can star public indexes or your own private indexes
    if (!index.isPublic && index.createdBy !== user?.id) {
      return; // Can't star other people's private indexes
    }

    setIsStarring(true);

    try {
      const method = isStarred ? 'DELETE' : 'POST';
      const res = await fetch(`/api/indexes/${index.id}/star`, {
        method,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setIsStarred(data.starred);
        setStarCount(data.starCount);
        onStarChange?.(index.id, data.starCount, data.starred);
      }
    } catch (error) {
      console.error('Error starring index:', error);
    } finally {
      setIsStarring(false);
    }
  };

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/indexes/${index.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsPublic(data.is_public);
        onIndexUpdate?.({ ...index, isPublic: data.is_public });
      } else {
        alert('Failed to update index');
      }
    } catch (error) {
      console.error('Error updating index:', error);
      alert('Failed to update index');
    } finally {
      setIsUpdating(false);
    }
  };

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/index/${index.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group block cursor-pointer"
    >
      <div className="grid grid-cols-12 gap-4 items-center py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border-l-2 border-transparent hover:border-blue-400">
        {/* Index Name - 4 columns */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          {/* Category Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-xl">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors mb-1">
              {index.name}
            </h3>
            {index.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {index.description}
              </p>
            )}
          </div>
        </div>

        {/* Creator - 3 columns */}
        <div className="col-span-3 flex items-center gap-2">
          {index.createdByUsername && index.createdByUsername !== 'anonymous' ? (
            <Link
              href={`/user/${index.createdByUsername}`}
              className="text-base text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {index.createdByUsername}
            </Link>
          ) : (
            <span className="text-base text-gray-900 dark:text-gray-100 truncate">anonymous</span>
          )}
        </div>

        {/* Markets Count - 2 columns */}
        <div className="col-span-2 text-center">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {index.marketCount || index.markets.length}
          </span>
        </div>

        {/* Stars / Controls - 1 column */}
        <div className="col-span-1 flex items-center justify-center gap-2">
          {/* Show star button for public indexes or user's own private indexes */}
          {(isPublic || index.createdBy === user?.id) && (
            <button
              onClick={handleStarClick}
              disabled={isStarring}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              title={isStarred ? 'Unstar' : 'Star'}
            >
              <svg
                className={`w-4 h-4 ${
                  isStarred
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-gray-400 dark:text-gray-500'
                }`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {starCount}
              </span>
            </button>
          )}

          {/* Show visibility toggle for user's own indexes */}
          {showControls && (
            <button
              onClick={handleTogglePublic}
              disabled={isUpdating}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
                isPublic
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={isPublic ? 'Make Private' : 'Make Public'}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                {isPublic ? (
                  <>
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </>
                ) : (
                  <>
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </>
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Volume - 2 columns */}
        <div className="col-span-2 text-right">
          {index.totalVolume ? (
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              ${(index.totalVolume / 1000000).toFixed(1)}M
            </span>
          ) : (
            <span className="text-base text-gray-400 dark:text-gray-500">-</span>
          )}
        </div>
      </div>
    </div>
  );
}
