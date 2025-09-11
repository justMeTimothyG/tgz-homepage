import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, or, and, inArray, sql } from 'drizzle-orm';
import { extractComponentsFromMarkdown } from '@/lib/mdx-utils';

function getAdminTokenFromRequest(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const xToken = req.headers.get('x-admin-token');
  const query = req.nextUrl.searchParams.get('adminToken');
  return bearer || xToken || query;
}

function verifyAdminAuth(req: NextRequest): NextResponse | null {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const provided = getAdminTokenFromRequest(req);
    if (provided !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return null;
}


// Get single post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = verifyAdminAuth(req);
    if (authError) return authError;

    const { slug } = await params;
    
    const db = getDb();
    
    // Get post
    const posts = await db
      .select({
        id: schema.blogPosts.id,
        slug: schema.blogPosts.slug,
        title: schema.blogPosts.title,
        excerpt: schema.blogPosts.excerpt,
        content: schema.blogPosts.content,
        status: schema.blogPosts.status,
        publishedAt: schema.blogPosts.publishedAt,
        createdAt: schema.blogPosts.createdAt,
        updatedAt: schema.blogPosts.updatedAt,
        views: schema.blogPosts.views,
      })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[0];

    // Get tags for the post
    const tags = await db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
        slug: schema.tags.slug,
      })
      .from(schema.tags)
      .innerJoin(schema.blogPostTags, eq(schema.tags.id, schema.blogPostTags.tagId))
      .where(eq(schema.blogPostTags.blogPostId, post.id));

    return NextResponse.json({ 
      ok: true, 
      post: {
        ...post,
        tags,
      }
    });
  } catch (error: unknown) {
    console.error('Admin post GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = verifyAdminAuth(req);
    if (authError) return authError;

    const { slug } = await params;
    const body = await req.json();
    const { title, content, excerpt, status, publishedAt, tags, newSlug } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields: title, content' }, { status: 400 });
    }

    const db = getDb();
    
    // Get existing post
    const existingPosts = await db
      .select({ id: schema.blogPosts.id })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug))
      .limit(1);

    if (existingPosts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postId = existingPosts[0].id;
    const now = new Date();
    const publishedAtDate = publishedAt ? new Date(publishedAt) : null;
    const postStatus = status || 'draft';
    const finalSlug = newSlug || slug;

    // If slug is changing, check it doesn't conflict
    if (newSlug && newSlug !== slug) {
      const conflictingPosts = await db
        .select({ id: schema.blogPosts.id })
        .from(schema.blogPosts)
        .where(eq(schema.blogPosts.slug, newSlug))
        .limit(1);

      if (conflictingPosts.length > 0) {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
      }
    }

    // Update post
    const updateValues = {
      slug: finalSlug,
      title,
      content,
      excerpt: excerpt || null,
      status: postStatus,
      publishedAt: publishedAtDate || (postStatus === 'published' ? now : null),
      updatedAt: now,
    };

    await db
      .update(schema.blogPosts)
      .set(updateValues)
      .where(eq(schema.blogPosts.id, postId));

    // Handle tags
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await db
        .delete(schema.blogPostTags)
        .where(eq(schema.blogPostTags.blogPostId, postId));

      // Add new tags
      const uniqueTags = Array.from(new Set(tags.map((t: string) => t.trim()).filter(Boolean)));
      if (uniqueTags.length > 0) {
        const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const tagSlugs = uniqueTags.map((name) => toSlug(name));
        const existing = await db
          .select({ id: schema.tags.id, slug: schema.tags.slug })
          .from(schema.tags)
          .where(or(...tagSlugs.map(tagSlug => eq(schema.tags.slug, tagSlug))));

        const existingBySlug = new Map(existing.map((t) => [t.slug, t.id] as const));
        const toCreate = uniqueTags
          .map((name) => ({ name, slug: toSlug(name) }))
          .filter((t) => !existingBySlug.has(t.slug));

        let createdIds: string[] = [];
        if (toCreate.length > 0) {
          const created = await db
            .insert(schema.tags)
            .values(toCreate.map((t) => ({ name: t.name, slug: t.slug, path: t.slug, level: 0 })))
            .returning({ id: schema.tags.id });
          createdIds = created.map((c) => c.id);
        }

        const allTagIds = [...existing.map((e) => e.id), ...createdIds];

        if (allTagIds.length > 0) {
          await db
            .insert(schema.blogPostTags)
            .values(allTagIds.map((tagId) => ({ blogPostId: postId, tagId })));
        }
      }
    }

    // Extract and link components used in the post
    let components: any[] = [];
    const componentNames = await extractComponentsFromMarkdown(content);
    
    if (componentNames.length > 0) {
      // Find component IDs from names
      components = await db
        .select({ id: schema.componentCatalog.id, name: schema.componentCatalog.name, version: schema.componentCatalog.version })
        .from(schema.componentCatalog)
        .where(and(
          inArray(schema.componentCatalog.name, componentNames),
          eq(schema.componentCatalog.status, 'published'),
          eq(schema.componentCatalog.isPublished, true)
        ));

      // Remove existing component links for this post
      await db
        .delete(schema.blogPostComponents)
        .where(eq(schema.blogPostComponents.blogPostId, postId));

      if (components.length > 0) {
        // Add new component links
        await db
          .insert(schema.blogPostComponents)
          .values(components.map(comp => ({
            blogPostId: postId,
            componentId: comp.id,
            componentVersion: comp.version,
            usageCount: 1,
            props: null,
            renderOrder: 0,
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

    // Extract component information for response
    const detectedComponents = await extractComponentsFromMarkdown(content);
    const linkedComponents = components.map(comp => comp.name);
    
    return NextResponse.json({ 
      ok: true, 
      slug: finalSlug, 
      id: postId,
      components: {
        detected: detectedComponents,
        linked: linkedComponents,
        missing: detectedComponents.filter(name => !linkedComponents.includes(name))
      }
    });
  } catch (error: unknown) {
    console.error('Admin post PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = verifyAdminAuth(req);
    if (authError) return authError;

    const { slug } = await params;
    
    const db = getDb();
    
    // Check if post exists
    const existingPosts = await db
      .select({ id: schema.blogPosts.id })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug))
      .limit(1);

    if (existingPosts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postId = existingPosts[0].id;

    // Delete post (cascades will handle related records)
    await db
      .delete(schema.blogPosts)
      .where(eq(schema.blogPosts.id, postId));

    return NextResponse.json({ ok: true, message: 'Post deleted successfully' });
  } catch (error: unknown) {
    console.error('Admin post DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}