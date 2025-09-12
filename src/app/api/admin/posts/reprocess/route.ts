import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/db/client';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Extract component names from markdown content
function extractComponentsFromContent(content: string): string[] {
  const componentRegex = /<([A-Z][a-zA-Z0-9]*)[^>]*\/?>|<([A-Z][a-zA-Z0-9]*)[^>]*>[\s\S]*?<\/\2>/g;
  const components = new Set<string>();
  let match;
  
  while ((match = componentRegex.exec(content)) !== null) {
    const componentName = match[1] || match[2];
    if (componentName) {
      components.add(componentName);
    }
  }
  
  return Array.from(components);
}

async function reprocessPost(postSlug: string): Promise<{ success: boolean; message: string; details: any }> {
  console.log(`🔄 Processing post: ${postSlug}`);
  
  const db = getDb();
  
  // Get the post
  const [post] = await db
    .select()
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.slug, postSlug));
    
  if (!post) {
    return { success: false, message: `Post not found: ${postSlug}`, details: null };
  }
  
  console.log(`📝 Found post: ${post.title}`);
  
  // Extract components from content
  const componentNames = extractComponentsFromContent(post.content);
  console.log(`🔍 Found components in content: ${componentNames.join(', ') || 'none'}`);
  
  if (componentNames.length === 0) {
    return { 
      success: true, 
      message: `No components found in post "${post.title}"`, 
      details: { post: post.title, components: [] }
    };
  }
  
  // Find component IDs from names
  const components = await db
    .select({ 
      id: schema.componentCatalog.id, 
      name: schema.componentCatalog.name, 
      version: schema.componentCatalog.version,
      sourceType: schema.componentCatalog.sourceType,
      status: schema.componentCatalog.status,
      isPublished: schema.componentCatalog.isPublished
    })
    .from(schema.componentCatalog)
    .where(and(
      inArray(schema.componentCatalog.name, componentNames),
      eq(schema.componentCatalog.status, 'published'),
      eq(schema.componentCatalog.isPublished, true)
    ));

  console.log(`🔗 Found ${components.length} matching components in catalog`);

  if (components.length === 0) {
    return {
      success: true, 
      message: `No matching published components found in catalog for post "${post.title}"`,
      details: { 
        post: post.title, 
        foundInContent: componentNames, 
        matchedInCatalog: []
      }
    };
  }

  // Remove existing component links for this post
  const deleted = await db
    .delete(schema.blogPostComponents)
    .where(eq(schema.blogPostComponents.blogPostId, post.id))
    .returning({ count: schema.blogPostComponents.blogPostId });

  // Add new component links
  const now = new Date();
  const newLinks = await db
    .insert(schema.blogPostComponents)
    .values(components.map(comp => ({
      blogPostId: post.id,
      componentId: comp.id,
      componentVersion: comp.version,
      usageCount: 1, 
      props: null, 
      renderOrder: 0, 
      createdAt: now
    })))
    .returning({ componentId: schema.blogPostComponents.componentId });

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

  // Update the blog post's components field
  await db
    .update(schema.blogPosts)
    .set({ 
      components: components.map(comp => comp.name),
      updatedAt: now 
    })
    .where(eq(schema.blogPosts.id, post.id));

  return {
    success: true,
    message: `Successfully processed post "${post.title}" with ${newLinks.length} components`,
    details: {
      post: post.title,
      removedLinks: deleted.length,
      addedLinks: newLinks.length,
      components: components.map(c => ({ name: c.name, version: c.version, sourceType: c.sourceType }))
    }
  };
}

async function reprocessAllPosts(): Promise<{ success: boolean; message: string; details: any }> {
  const db = getDb();
  
  // Get all published posts
  const posts = await db
    .select({ slug: schema.blogPosts.slug, title: schema.blogPosts.title })
    .from(schema.blogPosts)
    .where(eq(schema.blogPosts.status, 'published'));
  
  console.log(`🔄 Processing ${posts.length} published posts...`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    try {
      const result = await reprocessPost(post.slug);
      results.push(result);
      if (result.success) successCount++;
      else errorCount++;
    } catch (error) {
      const errorResult = { 
        success: false, 
        message: `Error processing "${post.title}": ${error instanceof Error ? error.message : 'Unknown error'}`, 
        details: { post: post.title, error: error instanceof Error ? error.message : 'Unknown error' }
      };
      results.push(errorResult);
      errorCount++;
    }
  }

  return {
    success: errorCount === 0,
    message: `Processed ${posts.length} posts: ${successCount} successful, ${errorCount} failed`,
    details: {
      totalPosts: posts.length,
      successful: successCount,
      failed: errorCount,
      results
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check Better Auth session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required. Please log in to access admin features.' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { postSlug } = body;

    let result;
    if (postSlug === 'all' || !postSlug) {
      result = await reprocessAllPosts();
    } else {
      result = await reprocessPost(postSlug);
    }
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
    
  } catch (error) {
    console.error('Reprocess API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}