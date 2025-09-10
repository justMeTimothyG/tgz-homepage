import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { desc, asc, sql, ilike } from 'drizzle-orm';

// Get all tags with optional search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit')) || 50));
    const orderBy = searchParams.get('orderBy') || 'usage'; // 'usage', 'name', 'recent'

    const db = getDb();
    
    // Base query - get tags with post counts
    let query: any = db
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
        postCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${schema.blogPostTags} 
          WHERE ${schema.blogPostTags.tagId} = ${schema.tags.id}
        )`.as('post_count'),
      })
      .from(schema.tags);

    // Add search filter if provided
    if (search) {
      query = query.where(ilike(schema.tags.name, `%${search}%`));
    }

    // Apply ordering
    switch (orderBy) {
      case 'name':
        query = query.orderBy(asc(schema.tags.name));
        break;
      case 'recent':
        query = query.orderBy(desc(schema.tags.createdAt));
        break;
      case 'usage':
      default:
        // Order by usage count, then name
        query = query.orderBy(
          desc(sql`(SELECT COUNT(*) FROM ${schema.blogPostTags} WHERE ${schema.blogPostTags.tagId} = ${schema.tags.id})`),
          asc(schema.tags.name)
        );
        break;
    }

    const tags = await query.limit(limit);

    return NextResponse.json({ 
      ok: true, 
      tags,
      total: tags.length
    });
  } catch (error: unknown) {
    console.error('Tags GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}