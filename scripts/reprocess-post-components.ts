#!/usr/bin/env tsx

/**
 * Re-process existing blog posts to extract and link components
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { blogPosts, blogPostComponents, componentCatalog } from '../src/db/schema';
import postgres from 'postgres';
import { eq, and, inArray, sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/tgz_lol';
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

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

async function reprocessPost(postSlug: string) {
  console.log(`🔄 Processing post: ${postSlug}`);
  
  // Get the post
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, postSlug));
    
  if (!post) {
    console.error(`❌ Post not found: ${postSlug}`);
    return;
  }
  
  console.log(`📝 Found post: ${post.title}`);
  console.log(`📄 Content length: ${post.content.length} characters`);
  
  // Extract components from content
  const componentNames = extractComponentsFromContent(post.content);
  console.log(`🔍 Found components in content: ${componentNames.join(', ') || 'none'}`);
  
  if (componentNames.length === 0) {
    console.log(`ℹ️  No components found in post content`);
    return;
  }
  
  // Find component IDs from names
  const components = await db
    .select({ 
      id: componentCatalog.id, 
      name: componentCatalog.name, 
      version: componentCatalog.version,
      sourceType: componentCatalog.sourceType,
      status: componentCatalog.status,
      isPublished: componentCatalog.isPublished
    })
    .from(componentCatalog)
    .where(and(
      inArray(componentCatalog.name, componentNames),
      eq(componentCatalog.status, 'published'),
      eq(componentCatalog.isPublished, true)
    ));

  console.log(`🔗 Found ${components.length} matching components in catalog:`);
  components.forEach(comp => {
    console.log(`   - ${comp.name} v${comp.version} (${comp.sourceType})`);
  });

  if (components.length === 0) {
    console.log(`⚠️  No matching published components found in catalog`);
    return;
  }

  // Remove existing component links for this post
  const deleted = await db
    .delete(blogPostComponents)
    .where(eq(blogPostComponents.blogPostId, post.id))
    .returning({ count: blogPostComponents.blogPostId });
    
  if (deleted.length > 0) {
    console.log(`🗑️  Removed ${deleted.length} existing component links`);
  }

  // Add new component links
  const now = new Date();
  const newLinks = await db
    .insert(blogPostComponents)
    .values(components.map(comp => ({
      blogPostId: post.id,
      componentId: comp.id,
      componentVersion: comp.version,
      usageCount: 1, 
      props: null, 
      renderOrder: 0, 
      createdAt: now
    })))
    .returning({ componentId: blogPostComponents.componentId });

  console.log(`✅ Added ${newLinks.length} new component links`);

  // Update component usage counts
  for (const comp of components) {
    await db
      .update(componentCatalog)
      .set({ 
        usageCount: sql`${componentCatalog.usageCount} + 1`,
        lastUsedAt: now,
        updatedAt: now 
      })
      .where(eq(componentCatalog.id, comp.id));
  }

  // Update the blog post's components field
  await db
    .update(blogPosts)
    .set({ 
      components: components.map(comp => comp.name),
      updatedAt: now 
    })
    .where(eq(blogPosts.id, post.id));

  console.log(`📊 Updated usage counts for components`);
  console.log(`🎉 Successfully processed post: ${postSlug}`);
}

async function main() {
  const postSlug = process.argv[2];
  
  if (!postSlug) {
    console.log(`
📚 Blog Post Component Re-processor

Usage:
  npm run reprocess-components <post-slug>
  
Examples:
  npm run reprocess-components bruchrechnung
  npm run reprocess-components all   # process all posts
    `);
    return;
  }
  
  try {
    if (postSlug === 'all') {
      // Process all posts
      const posts = await db
        .select({ slug: blogPosts.slug })
        .from(blogPosts)
        .where(eq(blogPosts.status, 'published'));
      
      console.log(`🔄 Processing ${posts.length} published posts...`);
      
      for (const post of posts) {
        await reprocessPost(post.slug);
        console.log('---');
      }
    } else {
      await reprocessPost(postSlug);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();