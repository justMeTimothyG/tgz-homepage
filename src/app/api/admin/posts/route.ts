import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { desc, eq, ilike, or, and } from 'drizzle-orm';

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

// Get all posts with filtering and search
export async function GET(req: NextRequest) {
  try {
    const authError = verifyAdminAuth(req);
    if (authError) return authError;

    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 50));
    const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

    const db = getDb();
    
    // Build where conditions
    const conditions = [];
    
    // Status filter
    if (status !== 'all') {
      conditions.push(eq(schema.blogPosts.status, status as 'draft' | 'published' | 'archived'));
    }
    
    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(schema.blogPosts.title, `%${search}%`),
          ilike(schema.blogPosts.content, `%${search}%`),
          ilike(schema.blogPosts.excerpt, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get posts with tags
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
      .where(whereClause)
      .orderBy(desc(schema.blogPosts.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get tags for each post
    const postsWithTags = await Promise.all(
      posts.map(async (post) => {
        const tags = await db
          .select({
            id: schema.tags.id,
            name: schema.tags.name,
            slug: schema.tags.slug,
          })
          .from(schema.tags)
          .innerJoin(schema.blogPostTags, eq(schema.tags.id, schema.blogPostTags.tagId))
          .where(eq(schema.blogPostTags.blogPostId, post.id));

        return {
          ...post,
          tags,
        };
      })
    );

    // Get total count for pagination
    const totalResult = await db
      .select({ count: schema.blogPosts.id })
      .from(schema.blogPosts)
      .where(whereClause);
    
    const total = totalResult.length;

    return NextResponse.json({ 
      ok: true, 
      posts: postsWithTags,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });
  } catch (error: unknown) {
    console.error('Admin posts GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create new post
export async function POST(req: NextRequest) {
  try {
    const authError = verifyAdminAuth(req);
    if (authError) return authError;

    const body = await req.json();
    const { slug, title, content, excerpt, status, publishedAt, tags } = body;

    if (!slug || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields: slug, title, content' }, { status: 400 });
    }

    const now = new Date();
    const publishedAtDate = publishedAt ? new Date(publishedAt) : null;
    const postStatus = status || 'draft';

    const insertValues = {
      slug,
      title,
      content,
      excerpt: excerpt || null,
      status: postStatus,
      publishedAt: publishedAtDate || (postStatus === 'published' ? now : null),
      updatedAt: now,
    } as const;

    const db = getDb();
    
    // Check if slug already exists
    const existingPost = await db
      .select({ id: schema.blogPosts.id })
      .from(schema.blogPosts)
      .where(eq(schema.blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length > 0) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }

    const inserted = await db
      .insert(schema.blogPosts)
      .values({
        ...insertValues,
        createdAt: now,
      })
      .returning({ id: schema.blogPosts.id, slug: schema.blogPosts.slug });

    const postId = inserted[0]?.id;

    // Handle tags
    if (postId && tags && Array.isArray(tags) && tags.length > 0) {
      const uniqueTags = Array.from(new Set(tags.map((t: string) => t.trim()).filter(Boolean)));
      if (uniqueTags.length > 0) {
        // Create slug from tag name
        const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Find existing tags
        const tagSlugs = uniqueTags.map((name) => toSlug(name));
        const existing = await db
          .select({ id: schema.tags.id, slug: schema.tags.slug })
          .from(schema.tags)
          .where(or(...tagSlugs.map(slug => eq(schema.tags.slug, slug))));

        const existingBySlug = new Map(existing.map((t) => [t.slug, t.id] as const));
        const toCreate = uniqueTags
          .map((name) => ({ name, slug: toSlug(name) }))
          .filter((t) => !existingBySlug.has(t.slug));

        // Create new tags
        let createdIds: string[] = [];
        if (toCreate.length > 0) {
          const created = await db
            .insert(schema.tags)
            .values(toCreate.map((t) => ({ name: t.name, slug: t.slug, path: t.slug, level: 0 })))
            .returning({ id: schema.tags.id });
          createdIds = created.map((c) => c.id);
        }

        const allTagIds = [...existing.map((e) => e.id), ...createdIds];

        // Link tags to post
        if (allTagIds.length > 0) {
          await db
            .insert(schema.blogPostTags)
            .values(allTagIds.map((tagId) => ({ blogPostId: postId, tagId })));
        }
      }
    }

    return NextResponse.json({ ok: true, slug, id: postId });
  } catch (error: unknown) {
    console.error('Admin posts POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}