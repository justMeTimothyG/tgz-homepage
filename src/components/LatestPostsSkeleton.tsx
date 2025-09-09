export default function LatestPostsSkeleton() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex-1">
              {/* Title skeleton */}
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              {/* Date below title on mobile */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-1 sm:hidden"></div>
              {/* Excerpt lines */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mt-1"></div>
            </div>
            {/* Date on right side on desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}