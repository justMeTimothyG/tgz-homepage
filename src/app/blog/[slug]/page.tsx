import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPostBySlug } from '@/lib/blog';
import { formatDateDE } from '@/lib/date';
import ServerTableOfContents from '@/components/ServerTableOfContents';
import { getTocProps } from '@/lib/toc';
import ServerMDX from '@/components/ServerMDX';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import MobileTableOfContents from '@/components/MobileTableOfContents';
import { collectionMetadataBySlug } from '@/data/collectionSections';

export async function generateStaticParams() {
  try {
    const slugs = getAllBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) return notFound();

  // Generate TOC from markdown content on server
  const tocData = getTocProps(post.content);
  const collections = normalizeCollections(post.sammlungen ?? []);
  const hasCollections = collections.length > 0;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-12 gap-8">
          {/* TOC - left side on desktop */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-2rem)] overflow-auto pr-4">
              {tocData.hasContent && (
                <ServerTableOfContents
                  headings={tocData.headings}
                  sections={tocData.sections}
                  containerSelector="#post-content"
                />
              )}
              {hasCollections && (
                <CollectionsList items={collections} className="mt-8" />
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-9">
            <article id="post-content" className="prose dark:prose-invert max-w-none">
              {/* Post header */}
              <header className="mb-8">
                <h1 className="text-white">
                  {post.title}
                </h1>
                {post.date && (
                  <p className="text-sm opacity-70">{formatDateDE(post.date)}</p>
                )}
                {post.excerpt && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 italic">{post.excerpt}</p>
                )}
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 not-prose">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {(tocData.hasContent || hasCollections) && (
                <div className="not-prose">
                  {tocData.hasContent && (
                    <MobileTableOfContents sections={tocData.sections} />
                  )}
                  {hasCollections && (
                    <CollectionsList items={collections} className="lg:hidden" />
                  )}
                </div>
              )}

              {/* Post content */}
              <ServerMDX
                source={post.content}
                className="max-w-none"
                basePath={process.cwd()}
              />
            </article>
          </div>
        </div>
      </div>
      <ScrollToTopButton />
    </>
  );
}

type CollectionLink = {
  title: string;
  href: string;
};

function normalizeCollections(values: string[]): CollectionLink[] {
  const links: CollectionLink[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;

    const normalized = trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
    const slug = normalized.startsWith('sammlungen/')
      ? normalized.replace(/^sammlungen\//, '')
      : normalized;

    const meta = collectionMetadataBySlug[slug];
    const href = meta
      ? meta.href
      : normalized.startsWith('sammlungen/')
        ? `/${normalized}`
        : normalized.startsWith('/')
          ? normalized
          : `/sammlungen/${slug}`;
    const title = meta ? meta.title : humanizeSlug(slug);

    if (seen.has(href)) continue;
    seen.add(href);
    links.push({ title, href });
  }

  return links;
}

function humanizeSlug(slug: string): string {
  const base = slug.split('/').pop() || slug;
  return base
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function CollectionsList({ items, className = '' }: { items: CollectionLink[]; className?: string }) {
  if (items.length === 0) return null;

  const containerClasses = `rounded-2xl border border-gray-200/80 bg-white/70 p-4 shadow-sm dark:border-gray-800/60 dark:bg-gray-900/50 ${className}`.trim();

  return (
    <div className={containerClasses}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
        Sammlungen
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition hover:bg-blue-50 hover:text-blue-700 dark:text-gray-100 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
