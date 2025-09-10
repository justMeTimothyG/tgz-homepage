import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, desc, and, count } from 'drizzle-orm';

const { componentCatalog } = schema;

// GET /api/components - Get published components for public use
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    
    const category = searchParams.get('category');
    const sourceType = searchParams.get('sourceType');

    // Build where conditions - only published components
    const conditions = [
      eq(componentCatalog.isPublished, true),
      eq(componentCatalog.status, 'published')
    ];

    if (category) {
      conditions.push(eq(componentCatalog.category, category));
    }
    if (sourceType && ['custom', 'npm', 'remote', 'builtin'].includes(sourceType)) {
      conditions.push(eq(componentCatalog.sourceType, sourceType as 'custom' | 'npm' | 'remote' | 'builtin'));
    }

    // Get components
    const components = await db.select({
      id: componentCatalog.id,
      name: componentCatalog.name,
      displayName: componentCatalog.displayName,
      description: componentCatalog.description,
      category: componentCatalog.category,
      sourceType: componentCatalog.sourceType,
      version: componentCatalog.version,
      thumbnailUrl: componentCatalog.thumbnailUrl,
      isInteractive: componentCatalog.isInteractive,
      dependencies: componentCatalog.dependencies,
      usageCount: componentCatalog.usageCount,
      props: componentCatalog.props,
      config: componentCatalog.config,
      exampleCode: componentCatalog.exampleCode,
    })
      .from(componentCatalog)
      .where(and(...conditions))
      .orderBy(desc(componentCatalog.usageCount), desc(componentCatalog.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ totalCount }] = await db.select({ 
      totalCount: count()
    })
      .from(componentCatalog)
      .where(and(...conditions));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      components,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching published components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}