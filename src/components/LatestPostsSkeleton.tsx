export default function LatestPostsSkeleton() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 animate-pulse">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-1"></div>
        </li>
      ))}
    </ul>
  );
}