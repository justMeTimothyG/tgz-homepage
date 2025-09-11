#!/usr/bin/env tsx

/**
 * Deployment Component Sync Script
 * 
 * Automatically checks for component changes and syncs them during deployment.
 * This ensures components are always up-to-date in production without manual intervention.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { componentCatalog, blogPosts, blogPostComponents } from '../src/db/schema';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
// Note: Can't import extractComponentsFromMarkdown from DynamicMarkdown due to CSS imports
// So we'll implement a simplified version here for deployment

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/tgz_lol';
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

// Component registry path
const REGISTRY_PATH = join(process.cwd(), 'src/components/registry');
const CONFIG_FILE = join(REGISTRY_PATH, 'components.config.json');

interface ComponentConfig {
  name: string;
  displayName: string;
  description: string;
  category: string;
  version: string;
  isInteractive: boolean;
  requiresSandbox: boolean;
  dependencies: Record<string, string>;
  props: Record<string, any>;
  config: {
    examples: Array<{
      title: string;
      description?: string;
      code: string;
    }>;
  };
}

interface LocalComponent extends ComponentConfig {
  filePath: string;
  sourceCode: string;
  hash: string;
  parentComponent?: string; // For sub-components, indicates the parent file
}

interface ComponentManifest {
  components: Record<string, ComponentConfig>;
  lastSync: string;
}

// Load component manifest
function loadManifest(): ComponentManifest {
  if (!existsSync(CONFIG_FILE)) {
    console.log('⚠️  No component manifest found. Components may not be configured.');
    return { components: {}, lastSync: new Date().toISOString() };
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
}

// Calculate file hash for change detection
function calculateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Scan local component files using export-based approach
function scanLocalComponents(): LocalComponent[] {
  const components: LocalComponent[] = [];
  const manifest = loadManifest();
  
  if (!existsSync(REGISTRY_PATH)) {
    console.log('⚠️  Component registry directory not found.');
    return components;
  }
  
  // Read registry index.ts to understand what components are exported
  const indexPath = join(REGISTRY_PATH, 'index.ts');
  if (!existsSync(indexPath)) {
    console.log('⚠️  Registry index.ts not found.');
    return components;
  }
  
  const indexContent = readFileSync(indexPath, 'utf8');
  
  // Parse exported component names from index.ts
  const exportedComponents = parseExportsFromIndex(indexContent);
  console.log(`📦 [DEPLOY] Found ${exportedComponents.length} exported components:`, exportedComponents.map(c => c.name));
  
  // Map of component names to their source files for hash calculation
  const fileHashes = new Map<string, string>();
  const files = readdirSync(REGISTRY_PATH)
    .filter((file: string) => file.endsWith('.tsx') && file !== 'index.ts');
    
  for (const file of files) {
    const filePath = join(REGISTRY_PATH, file);
    const sourceCode = readFileSync(filePath, 'utf8');
    const hash = calculateHash(sourceCode);
    const componentName = file.replace('.tsx', '');
    fileHashes.set(componentName, hash);
  }
  
  // Create component entries based on exports, not files
  for (const exportInfo of exportedComponents) {
    const { name: componentName, sourceFile } = exportInfo;
    
    // Get config from manifest
    const config = manifest.components[componentName];
    if (!config) {
      console.warn(`⚠️  [DEPLOY] No configuration found for exported component: ${componentName}`);
      continue;
    }
    
    // Get source code and hash from the source file
    const sourceFilePath = join(REGISTRY_PATH, `${sourceFile}.tsx`);
    const sourceCode = readFileSync(sourceFilePath, 'utf8');
    const hash = fileHashes.get(sourceFile) || calculateHash(sourceCode);
    
    components.push({
      ...config,
      filePath: sourceFilePath,
      sourceCode,
      hash,
      parentComponent: exportInfo.isSubComponent ? sourceFile : undefined
    });
    
    console.log(`✅ [DEPLOY] Registered component: ${componentName} (from ${sourceFile}.tsx)${exportInfo.isSubComponent ? ' [sub-component]' : ''}`);
  }
  
  return components;
}

// Parse component exports from registry index.ts
function parseExportsFromIndex(indexContent: string): Array<{
  name: string;
  sourceFile: string;
  isSubComponent: boolean;
}> {
  const exports: Array<{ name: string; sourceFile: string; isSubComponent: boolean }> = [];
  
  // Parse import statements to understand component relationships
  const importRegex = /import\s+(?:(\w+)(?:,\s*)?)?(?:\{\s*([^}]+)\s*\})?\s+from\s+['"]\.\/(\w+)['"];?/g;
  const imports = new Map<string, { defaultExport?: string; namedExports: string[] }>();
  
  let match;
  while ((match = importRegex.exec(indexContent)) !== null) {
    const [, defaultExport, namedExportsList, sourceFile] = match;
    const namedExports = namedExportsList ? 
      namedExportsList.split(',').map(exp => exp.trim()).filter(Boolean) : [];
    
    imports.set(sourceFile, {
      defaultExport: defaultExport?.trim(),
      namedExports
    });
  }
  
  // Parse registeredComponents object to understand what's exported
  const registeredComponentsRegex = /export\s+const\s+registeredComponents\s*=\s*\{([^}]+)\}/s;
  const registeredMatch = registeredComponentsRegex.exec(indexContent);
  
  if (registeredMatch) {
    const componentsList = registeredMatch[1];
    const componentEntries = componentsList.split(',').map(entry => entry.trim()).filter(Boolean);
    
    for (const entry of componentEntries) {
      const componentName = entry.replace(/[,\s]/g, '');
      if (!componentName) continue;
      
      // Find which file this component comes from
      let sourceFile = componentName; // Default assumption
      let isSubComponent = false;
      
      // Check if it's a default export
      for (const [file, importInfo] of imports) {
        if (importInfo.defaultExport === componentName) {
          sourceFile = file;
          break;
        }
        if (importInfo.namedExports.includes(componentName)) {
          sourceFile = file;
          isSubComponent = true; // Named exports are typically sub-components
          break;
        }
      }
      
      exports.push({
        name: componentName,
        sourceFile,
        isSubComponent
      });
    }
  }
  
  return exports;
}

// Check if components need syncing
async function checkComponentChanges(): Promise<{ needsSync: boolean; changes: string[] }> {
  try {
    const localComponents = scanLocalComponents();
    const changes: string[] = [];
    
    console.log(`🔍 Checking ${localComponents.length} local components...`);
    
    for (const component of localComponents) {
      try {
        // Check if component exists in database
        const [existing] = await db
          .select()
          .from(componentCatalog)
          .where(eq(componentCatalog.name, component.name))
          .limit(1);
        
        if (!existing) {
          changes.push(`📝 ${component.name} (new component)`);
        } else {
          // Check if source code has changed
          const currentHash = calculateHash(existing.sourceCode || '');
          if (currentHash !== component.hash) {
            changes.push(`📝 ${component.name} (modified)`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not check component ${component.name}:`, error);
        changes.push(`❓ ${component.name} (check failed - will sync)`);
      }
    }
    
    // Check for deleted components
    try {
      const dbComponents = await db.select().from(componentCatalog);
      const localNames = new Set(localComponents.map(c => c.name));
      
      for (const dbComponent of dbComponents) {
        if (dbComponent.sourceType === 'builtin' && !localNames.has(dbComponent.name)) {
          changes.push(`🗑️ ${dbComponent.name} (deleted)`);
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not check for deleted components:', error);
    }
    
    return { needsSync: changes.length > 0, changes };
  } catch (error) {
    console.error('❌ Error checking component changes:', error);
    // If we can't check, assume we need to sync to be safe
    return { needsSync: true, changes: ['❓ Check failed - will attempt sync'] };
  }
}

// Sync components to database
async function syncComponents(): Promise<boolean> {
  try {
    const localComponents = scanLocalComponents();
    
    if (localComponents.length === 0) {
      console.log('ℹ️  No components found to sync.');
      return true;
    }
    
    console.log(`🔄 Syncing ${localComponents.length} components to database...`);
    
    for (const component of localComponents) {
      try {
        // Check if component exists
        const [existing] = await db
          .select()
          .from(componentCatalog)
          .where(eq(componentCatalog.name, component.name))
          .limit(1);
        
        const componentData = {
          name: component.name,
          displayName: component.displayName,
          description: component.description,
          category: component.category,
          sourceType: 'builtin' as const,
          sourceCode: component.sourceCode,
          version: component.version,
          status: 'published' as const,
          isPublished: true,
          isInteractive: component.isInteractive,
          requiresSandbox: component.requiresSandbox,
          dependencies: component.dependencies,
          props: component.props,
          config: component.config,
          updatedAt: new Date()
        };
        
        if (existing) {
          // Update existing
          await db
            .update(componentCatalog)
            .set(componentData)
            .where(eq(componentCatalog.id, existing.id));
          console.log(`  ✅ Updated: ${component.name} v${component.version}`);
        } else {
          // Insert new
          await db
            .insert(componentCatalog)
            .values({
              ...componentData,
              createdAt: new Date()
            });
          console.log(`  ✅ Created: ${component.name} v${component.version}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to sync ${component.name}:`, error);
        return false;
      }
    }
    
    console.log('🎉 Component sync completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error during component sync:', error);
    return false;
  }
}

// Extract components from markdown content (simplified version for deployment)
function extractComponentsFromContent(content: string): string[] {
  const htmlTags = new Set(['A', 'B', 'I', 'U', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'SPAN', 'IMG', 'BR', 'HR']);
  const componentMatches = content.match(/<([A-Z][a-zA-Z0-9]*)/g) || [];
  
  return [...new Set(
    componentMatches
      .map(match => match.slice(1))
      .filter(name => !htmlTags.has(name.toUpperCase()))
  )];
}

// Reprocess all blog posts to automatically link components
async function reprocessAllBlogPosts(): Promise<boolean> {
  try {
    // Get all published blog posts
    const posts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      content: blogPosts.content
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, 'published'));

    console.log(`📚 Found ${posts.length} published posts to process`);

    if (posts.length === 0) {
      console.log('ℹ️  No published posts found to reprocess');
      return true;
    }

    let processedCount = 0;
    let linkedCount = 0;

    for (const post of posts) {
      try {
        console.log(`📝 Processing: ${post.title}`);
        
        // Extract components from markdown content
        const usedComponentNames = extractComponentsFromContent(post.content);
        console.log(`   Found components: ${usedComponentNames.join(', ') || 'none'}`);

        if (usedComponentNames.length === 0) {
          processedCount++;
          continue;
        }

        // Get matching components from catalog
        const matchingComponents = await db.select()
          .from(componentCatalog)
          .where(and(
            eq(componentCatalog.isPublished, true),
            eq(componentCatalog.status, 'published')
          ));

        const componentsToLink = matchingComponents.filter(comp => 
          usedComponentNames.includes(comp.name)
        );

        console.log(`   Matched components: ${componentsToLink.map(c => `${c.name} v${c.version}`).join(', ')}`);

        if (componentsToLink.length === 0) {
          processedCount++;
          continue;
        }

        // Remove existing links for this post
        await db.delete(blogPostComponents)
          .where(eq(blogPostComponents.blogPostId, post.id));

        // Add new component links
        for (const component of componentsToLink) {
          await db.insert(blogPostComponents).values({
            blogPostId: post.id,
            componentId: component.id,
            componentVersion: component.version,
            usageCount: 1 // Default usage count
          });
        }

        console.log(`   ✅ Linked ${componentsToLink.length} components to "${post.title}"`);
        linkedCount += componentsToLink.length;
        processedCount++;

      } catch (error) {
        console.error(`   ❌ Error processing post "${post.title}":`, error);
        // Continue processing other posts even if one fails
      }
    }

    console.log(`🎉 Post reprocessing completed:`);
    console.log(`   📊 Processed: ${processedCount}/${posts.length} posts`);
    console.log(`   🔗 Total component links created: ${linkedCount}`);

    return true;

  } catch (error) {
    console.error('❌ Error during post reprocessing:', error);
    return false;
  }
}

// Main deployment function
async function deployComponents(): Promise<void> {
  console.log('🚀 Starting deployment component check...');
  
  try {
    // Check if database is accessible
    try {
      await db.select().from(componentCatalog).limit(1);
    } catch (error) {
      console.log('⚠️  Database not accessible. Skipping component sync.');
      console.log('   This is normal for build-time environments.');
      process.exit(0);
    }
    
    // Check for changes
    const { needsSync, changes } = await checkComponentChanges();
    
    if (!needsSync) {
      console.log('✅ Components are up-to-date. No sync needed.');
      process.exit(0);
    }
    
    console.log('📋 Component changes detected:');
    changes.forEach(change => console.log(`   ${change}`));
    
    // Sync components
    const success = await syncComponents();
    
    if (success) {
      console.log('✅ Component sync completed successfully!');
      
      // Reprocess all blog posts to link components automatically
      console.log('🔄 Starting automatic post reprocessing...');
      const reprocessSuccess = await reprocessAllBlogPosts();
      
      if (reprocessSuccess) {
        console.log('🎉 Deployment component sync and post reprocessing completed successfully!');
        process.exit(0);
      } else {
        console.error('⚠️  Component sync succeeded but post reprocessing failed.');
        console.log('   Components are available but some posts may not be linked correctly.');
        process.exit(0); // Don't fail deployment for post processing issues
      }
    } else {
      console.error('❌ Component sync failed during deployment.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Deployment component check failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run deployment check
deployComponents();