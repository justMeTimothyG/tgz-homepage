import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-gray-100">
            Seite nicht gefunden
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Die Seite, die Sie suchen, konnte nicht gefunden werden.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Zur Startseite
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Zum Blog
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fehlercode: 404 - Seite nicht gefunden
          </p>
        </div>
      </div>
    </div>
  );
}