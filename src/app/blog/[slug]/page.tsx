import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPostBySlug } from '@/lib/blog';
import { formatDateDE } from '@/lib/date';
import ServerTableOfContents from '@/components/ServerTableOfContents';
import { getTocProps } from '@/lib/toc';
import Markdown from '@/components/Markdown';

export async function generateStaticParams() {
  try {
    const slugs = getAllBlogSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) return notFound();

  // Generate TOC from markdown content on server
  const tocData = getTocProps(post.content);

  return (
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
          </div>
        </aside>

        {/* Main content */}
        <div className="col-span-12 lg:col-span-9">
          <article id="post-content" className="prose dark:prose-invert max-w-none">
            {/* Post header */}
            <header className="mb-8">
              <h1>{post.title}</h1>
              {post.date && (
                <p className="text-sm opacity-70">{formatDateDE(post.date)}</p>
              )}
              {post.excerpt && (
                <p className="text-lg text-gray-600 dark:text-gray-400 italic">{post.excerpt}</p>
              )}
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 not-prose">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>
            
            {/* Post content */}
            <Markdown>{post.content}</Markdown>
          </article>
        </div>
      </div>
    </div>
  );
}