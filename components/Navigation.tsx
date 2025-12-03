'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Navigation() {
  const pathname = usePathname();
  const { profile, isAuthenticated, signOut } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-1 min-w-0">
            <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-300">
              <img
                src="/polyindex_logo_full_removedbg.png"
                alt="Polyindex"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Centered Navigation */}
          <div className="flex-1 flex justify-center gap-4 sm:gap-8">
            <Link
              href="/"
              className={`text-sm sm:text-base font-medium transition-colors ${
                pathname === '/'
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Indexes
            </Link>
            <Link
              href="/markets"
              className={`text-sm sm:text-base font-medium transition-colors ${
                pathname === '/markets'
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              markets
            </Link>
            <Link
              href="/about"
              className={`text-sm sm:text-base font-medium transition-colors ${
                pathname === '/about'
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              about
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
            {isAuthenticated && profile ? (
              <>
                <Link
                  href="/profile"
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {profile.username}
                </Link>
                <button
                  onClick={signOut}
                  className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="text-xs sm:text-sm bg-blue-300 text-gray-900 px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors"
                >
                  sign up
                </Link>
                <Link
                  href="/signin"
                  className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
