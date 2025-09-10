import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, and } from 'drizzle-orm';

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

// Remove tag from specific post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug, postId } = await params;
    const db = getDb();

    // Get tag ID from slug
    const tag = await db
      .select({ id: schema.tags.id })
      .from(schema.tags)
      .where(eq(schema.tags.slug, slug))
      .limit(1);

    if (tag.length === 0) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const tagId = tag[0].id;

    // Check if the association exists
    const association = await db
      .select()
      .from(schema.blogPostTags)
      .where(and(
        eq(schema.blogPostTags.tagId, tagId),
        eq(schema.blogPostTags.blogPostId, postId)
      ))
      .limit(1);

    if (association.length === 0) {
      return NextResponse.json({ 
        error: 'Tag is not associated with this post' 
      }, { status: 404 });
    }

    // Remove the association
    await db
      .delete(schema.blogPostTags)
      .where(and(
        eq(schema.blogPostTags.tagId, tagId),
        eq(schema.blogPostTags.blogPostId, postId)
      ));

    return NextResponse.json({
      ok: true,
      message: 'Tag removed from post successfully',
    });
  } catch (error: unknown) {
    console.error('Remove tag from post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}