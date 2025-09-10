import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, and, ne } from 'drizzle-orm';

function getAdminTokenFromRequest(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  const xToken = req.headers.get('x-admin-token');
  const query = req.nextUrl.searchParams.get('adminToken');
  return bearer || xToken || query;
}

function isAuthenticated(req: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return true; // No token required if not set
  
  const provided = getAdminTokenFromRequest(req);
  return provided === adminToken;
}

// Get single tag with associated blog posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    // Get tag details
    const tag = await db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
        slug: schema.tags.slug,
        path: schema.tags.path,
        level: schema.tags.level,
        color: schema.tags.color,
        icon: schema.tags.icon,
        description: schema.tags.description,
        createdAt: schema.tags.createdAt,
      })
      .from(schema.tags)
      .where(eq(schema.tags.slug, slug))
      .limit(1);

    if (tag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const tagData = tag[0];

    // Get associated blog posts
    const posts = await db
      .select({
        id: schema.blogPosts.id,
        slug: schema.blogPosts.slug,
        title: schema.blogPosts.title,
        excerpt: schema.blogPosts.excerpt,
        status: schema.blogPosts.status,
        publishedAt: schema.blogPosts.publishedAt,
        createdAt: schema.blogPosts.createdAt,
        updatedAt: schema.blogPosts.updatedAt,
      })
      .from(schema.blogPosts)
      .innerJoin(
        schema.blogPostTags,
        eq(schema.blogPostTags.blogPostId, schema.blogPosts.id)
      )
      .where(eq(schema.blogPostTags.tagId, tagData.id))
      .orderBy(schema.blogPosts.publishedAt);

    return NextResponse.json({
      ok: true,
      tag: tagData,
      posts,
    });
  } catch (error: unknown) {
    console.error('Tag GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update tag
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await req.json();
    
    const { name, description, color, icon } = body;
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const db = getDb();
    
    // Create new slug if name changed
    const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if new slug conflicts with existing tags (except current one)
    if (newSlug !== slug) {
      // First get the current tag's ID
      const currentTag = await db
        .select({ id: schema.tags.id })
        .from(schema.tags)
        .where(eq(schema.tags.slug, slug))
        .limit(1);
      
      if (currentTag.length === 0) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }
      
      // Check for slug conflicts excluding the current tag
      const existing = await db
        .select({ id: schema.tags.id })
        .from(schema.tags)
        .where(and(
          eq(schema.tags.slug, newSlug),
          ne(schema.tags.id, currentTag[0].id)
        ))
        .limit(1);
        
      if (existing.length > 0) {
        return NextResponse.json({ 
          error: 'A tag with that name already exists' 
        }, { status: 409 });
      }
    }

    // Update the tag
    const updated = await db
      .update(schema.tags)
      .set({
        name: name.trim(),
        slug: newSlug,
        path: newSlug, // For now, keep path same as slug for root level tags
        description: description?.trim() || null,
        color: color?.trim() || null,
        icon: icon?.trim() || null,
      })
      .where(eq(schema.tags.slug, slug))
      .returning({
        id: schema.tags.id,
        name: schema.tags.name,
        slug: schema.tags.slug,
        description: schema.tags.description,
        color: schema.tags.color,
        icon: schema.tags.icon,
      });

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      tag: updated[0],
      slugChanged: newSlug !== slug,
      newSlug: newSlug,
    });
  } catch (error: unknown) {
    console.error('Tag PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete tag completely (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const db = getDb();

    // Get tag ID first
    const tag = await db
      .select({ id: schema.tags.id })
      .from(schema.tags)
      .where(eq(schema.tags.slug, slug))
      .limit(1);

    if (tag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const tagId = tag[0].id;

    // Delete all associations first (cascade should handle this, but being explicit)
    await db
      .delete(schema.blogPostTags)
      .where(eq(schema.blogPostTags.tagId, tagId));

    await db
      .delete(schema.podcastTags)
      .where(eq(schema.podcastTags.tagId, tagId));

    // Delete the tag
    await db
      .delete(schema.tags)
      .where(eq(schema.tags.id, tagId));

    return NextResponse.json({
      ok: true,
      message: 'Tag deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Tag DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}