import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { desc, eq, inArray, and, sql } from 'drizzle-orm';
import { extractComponentsFromMarkdown } from '@/lib/mdx-utils';

type UpsertPostRequest = {
  slug: string;
  title: string;
  content: string;
  excerpt?: string | null;
  status?: 'draft' | 'published' | 'archived';
  publishedAt?: string | null; // ISO string or YYYY-MM-DD
  tags?: string[]; // optional tag names
};

function getAdminTokenFromRequest(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const xToken = req.headers.get('x-admin-token');
  const query = req.nextUrl.searchParams.get('adminToken');
  return bearer || xToken || query;
}


export async function POST(req: NextRequest) {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      const provided = getAdminTokenFromRequest(req);
      if (provided !== adminToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = (await req.json()) as UpsertPostRequest;
    if (!body || !body.slug || !body.title || !body.content) {
      return NextResponse.json({ error: 'Missing required fields: slug, title, content' }, { status: 400 });
    }

    const now = new Date();
    const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    const status = body.status ?? 'draft';

    // Upsert blog_posts by slug
    const insertValues = {
      slug: body.slug,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt ?? null,
      status,
      publishedAt: publishedAt ?? (status === 'published' ? now : null),
      updatedAt: now,
    } as const;

    const db = getDb();
    const inserted = await db
      .insert(schema.blogPosts)
      .values({
        ...insertValues,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: schema.blogPosts.slug,
        set: insertValues,
      })
      .returning({ id: schema.blogPosts.id, slug: schema.blogPosts.slug });

    const postId = inserted[0]?.id;

    // Optional tags handling
    if (postId && body.tags && body.tags.length > 0) {
      const uniqueTags = Array.from(new Set(body.tags.map((t) => t.trim()).filter(Boolean)));
      if (uniqueTags.length > 0) {
        // Find existing tags by slugified name (basic slugify)
        const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const tagSlugs = uniqueTags.map((name) => toSlug(name));

        const existing = await db
          .select({ id: schema.tags.id, slug: schema.tags.slug })
          .from(schema.tags)
          .where(inArray(schema.tags.slug, tagSlugs));

        const existingBySlug = new Map(existing.map((t) => [t.slug, t.id] as const));
        const toCreate = uniqueTags
          .map((name) => ({ name, slug: toSlug(name) }))
          .filter((t) => !existingBySlug.has(t.slug));

        let createdIds: string[] = [];
        if (toCreate.length > 0) {
          const created = await db
            .insert(schema.tags)
            .values(toCreate.map((t) => ({ name: t.name, slug: t.slug, path: t.slug, level: 0 })))
            .returning({ id: schema.tags.id, slug: schema.tags.slug });
          createdIds = created.map((c) => c.id);
        }

        const tagIds = [
          ...existing.map((e) => e.id),
          ...createdIds,
        ];

        if (tagIds.length > 0) {
          // Insert into blog_post_tags (ignore conflicts)
          await db
            .insert(schema.blogPostTags)
            .values(tagIds.map((tagId) => ({ blogPostId: postId, tagId })))
            .onConflictDoNothing();
        }
      }
    }

    // Extract and link components used in the post
    let linkedComponentNames: string[] = [];
    if (postId) {
      const componentNames = await extractComponentsFromMarkdown(body.content);
      
      if (componentNames.length > 0) {
        // Find component IDs from names
        const components = await db
          .select({ id: schema.componentCatalog.id, name: schema.componentCatalog.name, version: schema.componentCatalog.version })
          .from(schema.componentCatalog)
          .where(and(
            inArray(schema.componentCatalog.name, componentNames),
            eq(schema.componentCatalog.status, 'published'),
            eq(schema.componentCatalog.isPublished, true)
          ));

        if (components.length > 0) {
          linkedComponentNames = components.map(comp => comp.name);
          
          // Remove existing component links for this post
          await db
            .delete(schema.blogPostComponents)
            .where(eq(schema.blogPostComponents.blogPostId, postId));

          // Add new component links
          await db
            .insert(schema.blogPostComponents)
            .values(components.map(comp => ({
              blogPostId: postId,
              componentId: comp.id,
              componentVersion: comp.version,
              usageCount: 1, // We could parse the content to count actual usage
              props: null, // Could extract props from component usage if needed
              renderOrder: 0, // Could be enhanced to track component order
              createdAt: now
            })))
            .onConflictDoNothing();

          // Update component usage counts
          for (const comp of components) {
            await db
              .update(schema.componentCatalog)
              .set({ 
                usageCount: sql`${schema.componentCatalog.usageCount} + 1`,
                lastUsedAt: now,
                updatedAt: now 
              })
              .where(eq(schema.componentCatalog.id, comp.id));
          }
        }
      }
    }

    // Extract component information for response
    const detectedComponents = await extractComponentsFromMarkdown(body.content);
    
    return NextResponse.json({ 
      ok: true, 
      slug: body.slug, 
      id: postId,
      components: {
        detected: detectedComponents,
        linked: linkedComponentNames,
        missing: detectedComponents.filter(name => !linkedComponentNames.includes(name))
      }
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Fetch latest published blog posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.max(1, Math.min(20, Number(searchParams.get('limit')) || 5));

    const db = getDb();
    const posts = await db
      .select({
        id: schema.blogPosts.id,
        slug: schema.blogPosts.slug,
        title: schema.blogPosts.title,
        excerpt: schema.blogPosts.excerpt,
        publishedAt: schema.blogPosts.publishedAt,
      })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.status, 'published'))
      .orderBy(desc(schema.blogPosts.publishedAt))
      .limit(limit);

    return NextResponse.json({ ok: true, posts });
  } catch (error: unknown) {
    console.error(error);
    // Return empty list on error so the client can still render gracefully
    return NextResponse.json({ ok: false, posts: [], error: 'Failed to load posts' }, { status: 200 });
  }
}
