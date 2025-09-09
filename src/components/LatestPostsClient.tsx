"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LatestPostsSkeleton from './LatestPostsSkeleton';

type Post = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
};

export default function LatestPostsClient({ limit = 5 }: { limit?: number }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(`/api/posts?limit=${limit}`, { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { ok: boolean; posts: Post[]; error?: string };
        if (!cancelled) {
          if (data.ok) setPosts(data.posts);
          else {
            setPosts([]);
            setError(data.error || 'Fehler beim Laden');
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setPosts([]);
          setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [limit]);

  if (posts === null) {
    return <LatestPostsSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-300">
        {error ? `Konnte Beiträge nicht laden (${error}).` : 'Keine Beiträge gefunden.'}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {posts.map((post, index) => (
        <li key={post.id} className={`pb-4 ${index < posts.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex-1">
              <Link href={`/blog/${post.slug ?? post.id}`} className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {post.title}
              </Link>
              {/* Date below title on mobile */}
              {post.publishedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:hidden">
                  {new Date(post.publishedAt).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.excerpt}</p>
              )}
            </div>
            {/* Date on right side on desktop */}
            {post.publishedAt && (
              <div className="hidden sm:block flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('de-DE', {
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
