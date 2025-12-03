import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              href="/privacy"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              href="/about"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              About
            </Link>
          </div>
          <div>
            © {currentYear} Polyindex
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <div>PolyIndex is an independent analytics tool.</div>
          <div>It is not a broker, does not execute trades, and does not offer financial products.</div>
        </div>
      </div>
    </footer>
  );
}
