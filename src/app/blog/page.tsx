import Link from 'next/link';
import { getDb, schema } from '@/db/client';
import { desc, eq } from 'drizzle-orm';

// Ensure this page is rendered dynamically, not at build time
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const db = getDb();
  const posts = await db
    .select({ id: schema.blogPosts.id, slug: schema.blogPosts.slug, title: schema.blogPosts.title, excerpt: schema.blogPosts.excerpt })
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.status, 'published'))
    .orderBy(desc(schema.blogPosts.publishedAt))
    .limit(20);
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">Keine Beiträge gefunden. Starte Directus lokal, um Inhalte zu laden.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <Link href={`/blog/${post.slug ?? post.id}`} className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                {post.title}
              </Link>
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.excerpt}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
