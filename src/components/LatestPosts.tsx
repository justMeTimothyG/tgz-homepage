import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';

interface LatestPostsProps {
  posts: BlogPostMeta[];
}

export default function LatestPosts({ posts }: LatestPostsProps) {
  if (posts.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-300">
        Keine Beiträge gefunden.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {posts.map((post, index) => (
        <li key={post.slug} className={`pb-4 ${index < posts.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex-1">
              <Link href={`/blog/${post.slug}`} className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {post.title}
              </Link>
              {/* Date below title on mobile */}
              {post.date && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:hidden">
                  {new Date(post.date).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.excerpt}</p>
              )}
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Date on right side on desktop */}
            {post.date && (
              <div className="hidden sm:block flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(post.date).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}