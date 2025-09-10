import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import { z } from 'zod';

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

const { componentCatalog, componentVersions, blogPostComponents } = schema;

// Validation schemas
const createComponentSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'Invalid component name'),
  displayName: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().max(50).optional(),
  sourceType: z.enum(['custom', 'npm', 'remote', 'builtin']),
  sourceCode: z.string().optional(),
  npmPackage: z.string().max(100).optional(),
  npmVersion: z.string().max(20).optional(),
  remoteUrl: z.string().url().optional(),
  version: z.string().max(20).default('1.0.0'),
  status: z.enum(['draft', 'published', 'deprecated']).default('draft'),
  isPublished: z.boolean().default(false),
  props: z.record(z.string(), z.unknown()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  exampleCode: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  isInteractive: z.boolean().default(true),
  requiresSandbox: z.boolean().default(false),
  dependencies: z.array(z.string()).optional(),
  bundleSize: z.number().positive().optional(),
});

const updateComponentSchema = createComponentSchema.partial();

// GET /api/admin/components - List components with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    
    const category = searchParams.get('category');
    const sourceType = searchParams.get('sourceType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where conditions
    const conditions = [];
    if (category) {
      conditions.push(eq(componentCatalog.category, category));
    }
    if (sourceType && ['custom', 'npm', 'remote', 'builtin'].includes(sourceType)) {
      conditions.push(eq(componentCatalog.sourceType, sourceType as 'custom' | 'npm' | 'remote' | 'builtin'));
    }
    if (status && ['draft', 'published', 'deprecated'].includes(status)) {
      conditions.push(eq(componentCatalog.status, status as 'draft' | 'published' | 'deprecated'));
    }
    if (search) {
      conditions.push(
        sql`${componentCatalog.name} ILIKE ${`%${search}%`} OR 
            ${componentCatalog.displayName} ILIKE ${`%${search}%`} OR 
            ${componentCatalog.description} ILIKE ${`%${search}%`}`
      );
    }

    let query: any = db.select({
      id: componentCatalog.id,
      name: componentCatalog.name,
      displayName: componentCatalog.displayName,
      description: componentCatalog.description,
      category: componentCatalog.category,
      sourceType: componentCatalog.sourceType,
      version: componentCatalog.version,
      status: componentCatalog.status,
      isPublished: componentCatalog.isPublished,
      thumbnailUrl: componentCatalog.thumbnailUrl,
      isInteractive: componentCatalog.isInteractive,
      requiresSandbox: componentCatalog.requiresSandbox,
      dependencies: componentCatalog.dependencies,
      bundleSize: componentCatalog.bundleSize,
      usageCount: componentCatalog.usageCount,
      lastUsedAt: componentCatalog.lastUsedAt,
      createdAt: componentCatalog.createdAt,
      updatedAt: componentCatalog.updatedAt,
    }).from(componentCatalog);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count for pagination
    let totalQuery: any = db.select({ count: count() }).from(componentCatalog);
    if (conditions.length > 0) {
      totalQuery = totalQuery.where(and(...conditions));
    }

    // Execute queries
    const [components, totalResult] = await Promise.all([
      query.orderBy(desc(componentCatalog.updatedAt)).limit(limit).offset(offset),
      totalQuery
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      components,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

// POST /api/admin/components - Create new component
export async function POST(request: NextRequest) {
  try {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const validatedData = createComponentSchema.parse(body);

    // Validate source type specific requirements
    if (validatedData.sourceType === 'custom' && !validatedData.sourceCode) {
      return NextResponse.json(
        { success: false, error: 'Custom components require source code' },
        { status: 400 }
      );
    }
    
    if (validatedData.sourceType === 'npm' && !validatedData.npmPackage) {
      return NextResponse.json(
        { success: false, error: 'NPM components require package name' },
        { status: 400 }
      );
    }
    
    if (validatedData.sourceType === 'remote' && !validatedData.remoteUrl) {
      return NextResponse.json(
        { success: false, error: 'Remote components require URL' },
        { status: 400 }
      );
    }

    // Check if component name already exists
    const db = getDb();
    const existingComponent = await db.select()
      .from(componentCatalog)
      .where(eq(componentCatalog.name, validatedData.name))
      .limit(1);

    if (existingComponent.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Component name already exists' },
        { status: 409 }
      );
    }

    // Create component
    const [newComponent] = await db.insert(componentCatalog)
      .values(validatedData)
      .returning();

    // Create initial version entry
    await db.insert(componentVersions).values({
      componentId: newComponent.id,
      version: validatedData.version,
      sourceCode: validatedData.sourceCode,
      props: validatedData.props,
      config: validatedData.config,
      changeNotes: 'Initial version',
    });

    return NextResponse.json({
      success: true,
      component: newComponent,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create component' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/components - Bulk update components
export async function PUT(request: NextRequest) {
  try {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    if (action === 'bulk-status') {
      const { componentIds, status } = body;
      
      if (!Array.isArray(componentIds) || !['draft', 'published', 'deprecated'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid bulk status update parameters' },
          { status: 400 }
        );
      }

      const db = getDb();
      await db.update(componentCatalog)
        .set({ status, updatedAt: new Date() })
        .where(sql`${componentCatalog.id} = ANY(${componentIds})`);

      return NextResponse.json({
        success: true,
        message: `Updated ${componentIds.length} components`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error bulk updating components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update components' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/components - Bulk delete components
export async function DELETE(request: NextRequest) {
  try {
    const authError = verifyAdminAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'Component IDs required' },
        { status: 400 }
      );
    }

    const componentIds = idsParam.split(',');
    
    const db = getDb();
    
    // Check if components are being used in any posts
    const usageCheck = await db.select({ count: count() })
      .from(blogPostComponents)
      .where(sql`${blogPostComponents.componentId} = ANY(${componentIds})`);

    if (usageCheck[0]?.count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete components that are being used in blog posts' 
        },
        { status: 409 }
      );
    }

    // Delete components (cascading deletes will handle versions and cache)
    await db.delete(componentCatalog)
      .where(sql`${componentCatalog.id} = ANY(${componentIds})`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${componentIds.length} components`,
    });
  } catch (error) {
    console.error('Error deleting components:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete components' },
      { status: 500 }
    );
  }
}