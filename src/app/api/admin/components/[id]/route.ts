import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, desc, count } from 'drizzle-orm';
import { z } from 'zod';

const { componentCatalog, componentVersions, componentCache, blogPostComponents } = schema;

const updateComponentSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[A-Za-z][A-Za-z0-9_]*$/, 'Invalid component name').optional(),
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  category: z.string().max(50).optional(),
  sourceType: z.enum(['custom', 'npm', 'remote', 'builtin']).optional(),
  sourceCode: z.string().optional(),
  npmPackage: z.string().max(100).optional(),
  npmVersion: z.string().max(20).optional(),
  remoteUrl: z.string().url().optional(),
  version: z.string().max(20).optional(),
  status: z.enum(['draft', 'published', 'deprecated']).optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  exampleCode: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  isInteractive: z.boolean().optional(),
  requiresSandbox: z.boolean().optional(),
  dependencies: z.array(z.string()).optional(),
  bundleSize: z.number().positive().optional(),
});

// GET /api/admin/components/[id] - Get component details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Get component details
    const [component] = await db.select()
      .from(componentCatalog)
      .where(eq(componentCatalog.id, id))
      .limit(1);

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    // Get version history
    const versions = await db.select()
      .from(componentVersions)
      .where(eq(componentVersions.componentId, id))
      .orderBy(desc(componentVersions.createdAt));

    // Get usage statistics
    const [usageStats] = await db.select({ 
      postCount: count(),
    })
      .from(blogPostComponents)
      .where(eq(blogPostComponents.componentId, id));

    // Get posts using this component
    const usedInPosts = await db.select({
      blogPostId: blogPostComponents.blogPostId,
      componentVersion: blogPostComponents.componentVersion,
      usageCount: blogPostComponents.usageCount,
      props: blogPostComponents.props,
    })
      .from(blogPostComponents)
      .where(eq(blogPostComponents.componentId, id))
      .limit(10);

    return NextResponse.json({
      success: true,
      component: {
        ...component,
        versions,
        usage: {
          postCount: usageStats?.postCount || 0,
          usedInPosts,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/components/[id] - Update component
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateComponentSchema.parse(body);
    const db = getDb();

    // Check if component exists
    const [existingComponent] = await db.select()
      .from(componentCatalog)
      .where(eq(componentCatalog.id, id))
      .limit(1);

    if (!existingComponent) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    // Check if name change conflicts with existing component
    if (validatedData.name && validatedData.name !== existingComponent.name) {
      const [nameConflict] = await db.select()
        .from(componentCatalog)
        .where(eq(componentCatalog.name, validatedData.name))
        .limit(1);

      if (nameConflict) {
        return NextResponse.json(
          { success: false, error: 'Component name already exists' },
          { status: 409 }
        );
      }
    }

    // Validate source type specific requirements
    const mergedData = { ...existingComponent, ...validatedData };
    if (mergedData.sourceType === 'custom' && !mergedData.sourceCode) {
      return NextResponse.json(
        { success: false, error: 'Custom components require source code' },
        { status: 400 }
      );
    }
    if (mergedData.sourceType === 'npm' && !mergedData.npmPackage) {
      return NextResponse.json(
        { success: false, error: 'NPM components require package name' },
        { status: 400 }
      );
    }
    if (mergedData.sourceType === 'remote' && !mergedData.remoteUrl) {
      return NextResponse.json(
        { success: false, error: 'Remote components require URL' },
        { status: 400 }
      );
    }

    // Create new version if source code or major props changed
    const shouldCreateVersion = 
      validatedData.sourceCode !== undefined ||
      validatedData.version !== undefined ||
      validatedData.props !== undefined;

    let versionToUse = existingComponent.version;
    
    if (shouldCreateVersion && validatedData.version) {
      // Create new version entry
      await db.insert(componentVersions).values({
        componentId: id,
        version: validatedData.version,
        sourceCode: validatedData.sourceCode || existingComponent.sourceCode,
        props: validatedData.props || existingComponent.props,
        config: validatedData.config || existingComponent.config,
        changeNotes: `Updated to version ${validatedData.version}`,
      });
      versionToUse = validatedData.version;
    }

    // Update component
    const [updatedComponent] = await db.update(componentCatalog)
      .set({
        ...validatedData,
        version: versionToUse,
        updatedAt: new Date(),
      })
      .where(eq(componentCatalog.id, id))
      .returning();

    // Clear cache if source changed
    if (validatedData.sourceCode || validatedData.version) {
      await db.delete(componentCache)
        .where(eq(componentCache.componentId, id));
    }

    return NextResponse.json({
      success: true,
      component: updatedComponent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update component' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/components/[id] - Delete component
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Check if component exists
    const [existingComponent] = await db.select()
      .from(componentCatalog)
      .where(eq(componentCatalog.id, id))
      .limit(1);

    if (!existingComponent) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    // Check if component is being used in any posts
    const [usageCount] = await db.select({ count: count() })
      .from(blogPostComponents)
      .where(eq(blogPostComponents.componentId, id));

    if (usageCount.count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete component. It is being used in ${usageCount.count} blog post(s)` 
        },
        { status: 409 }
      );
    }

    // Delete component (cascading deletes will handle versions and cache)
    await db.delete(componentCatalog)
      .where(eq(componentCatalog.id, id));

    return NextResponse.json({
      success: true,
      message: 'Component deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/components/[id] - Partial updates and actions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'increment-usage':
        // Increment usage count when component is used
        const db = getDb();
        
        // Get current usage count
        const [component] = await db.select()
          .from(componentCatalog)
          .where(eq(componentCatalog.id, id))
          .limit(1);
          
        if (!component) {
          return NextResponse.json(
            { success: false, error: 'Component not found' },
            { status: 404 }
          );
        }
        
        await db.update(componentCatalog)
          .set({ 
            usageCount: (component.usageCount || 0) + 1,
            lastUsedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(componentCatalog.id, id));

        return NextResponse.json({ success: true });

      case 'test-compile':
        // Test compilation of custom component
        if (body.sourceCode) {
          try {
            // Here you would add actual compilation testing
            // For now, just validate it's valid code structure
            const hasValidStructure = body.sourceCode.includes('export') || 
                                    body.sourceCode.includes('function') ||
                                    body.sourceCode.includes('const');
            
            if (!hasValidStructure) {
              throw new Error('Component must export a valid React component');
            }

            return NextResponse.json({
              success: true,
              result: {
                valid: true,
                bundleSize: body.sourceCode.length, // Simple estimation
                dependencies: [], // Would extract from actual compilation
              },
            });
          } catch (compileError) {
            return NextResponse.json({
              success: false,
              result: {
                valid: false,
                error: compileError instanceof Error ? compileError.message : 'Compilation failed',
              },
            });
          }
        }
        return NextResponse.json(
          { success: false, error: 'Source code required for test compilation' },
          { status: 400 }
        );

      case 'cache-clear':
        // Clear compilation cache
        const dbForCache = getDb();
        await dbForCache.delete(componentCache)
          .where(eq(componentCache.componentId, id));

        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in component PATCH action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}