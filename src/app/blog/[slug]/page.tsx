import { notFound } from 'next/navigation';
import { getDb, schema } from '@/db/client';
import { eq } from 'drizzle-orm';
import Markdown from '@/components/Markdown';
import { formatDateDE } from '@/lib/date';
import TableOfContents from '@/components/TableOfContents';

// Dynamic route; avoid static generation hitting DB during build
export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const [post] = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.slug, slug));

  if (!post || post.status !== 'published') return notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-12 gap-8">
        {/* TOC - left side on desktop */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-auto pr-4">
            <TableOfContents containerSelector="#post-content" />
          </div>
        </aside>

        {/* Main content */}
        <div className="col-span-12 lg:col-span-9">
          <article id="post-content" className="prose dark:prose-invert max-w-none">
            {post.publishedAt && (
              <p className="text-sm opacity-70">{formatDateDE(post.publishedAt as unknown as string)}</p>
            )}
            <Markdown>{post.content}</Markdown>
          </article>
        </div>
      </div>
    </div>
  );
}
