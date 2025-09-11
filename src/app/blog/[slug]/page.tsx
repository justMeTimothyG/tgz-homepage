import { notFound } from 'next/navigation';
import { getDb, schema } from '@/db/client';
import { eq, inArray, and } from 'drizzle-orm';
import DynamicMarkdown from '@/components/DynamicMarkdown';
import Markdown from '@/components/Markdown';
import { formatDateDE } from '@/lib/date';
import ServerTableOfContents from '@/components/ServerTableOfContents';
import { getTocProps } from '@/lib/toc';

// Allow static generation for published posts
export const revalidate = 3600; // Revalidate every hour

// Generate static paths for published posts
export async function generateStaticParams() {
  try {
    const db = getDb();
    const posts = await db
      .select({ slug: schema.blogPosts.slug })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.status, 'published'));
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const [post] = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.slug, slug));

  if (!post || post.status !== 'published') return notFound();

  // Generate TOC from markdown content on server
  const tocData = getTocProps(post.content);

  // Get components associated with this post from blogPostComponents relation
  let postComponents: any[] = [];
  try {
    postComponents = await db.select({
      id: schema.componentCatalog.id,
      name: schema.componentCatalog.name,
      displayName: schema.componentCatalog.displayName,
      version: schema.componentCatalog.version,
      sourceType: schema.componentCatalog.sourceType,
      sourceCode: schema.componentCatalog.sourceCode,
      npmPackage: schema.componentCatalog.npmPackage,
      npmVersion: schema.componentCatalog.npmVersion,
      remoteUrl: schema.componentCatalog.remoteUrl,
      dependencies: schema.componentCatalog.dependencies,
      requiresSandbox: schema.componentCatalog.requiresSandbox,
      props: schema.componentCatalog.props,
      config: schema.componentCatalog.config,
      componentVersion: schema.blogPostComponents.componentVersion,
      usageCount: schema.blogPostComponents.usageCount,
    })
      .from(schema.blogPostComponents)
      .innerJoin(
        schema.componentCatalog, 
        eq(schema.blogPostComponents.componentId, schema.componentCatalog.id)
      )
      .where(
        and(
          eq(schema.blogPostComponents.blogPostId, post.id),
          eq(schema.componentCatalog.isPublished, true),
          eq(schema.componentCatalog.status, 'published')
        )
      );
  } catch (error) {
    console.error('Error loading components for post:', error);
    // Continue without components rather than failing the entire page
  }

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
            {post.publishedAt && (
              <p className="text-sm opacity-70">{formatDateDE(post.publishedAt as unknown as string)}</p>
            )}
            {postComponents.length > 0 ? (
              <DynamicMarkdown 
                components={postComponents}
                postId={post.id}
              >
                {post.content}
              </DynamicMarkdown>
            ) : (
              <Markdown className="prose dark:prose-invert max-w-none">
                {post.content}
              </Markdown>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
