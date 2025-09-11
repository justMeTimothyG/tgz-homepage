#!/usr/bin/env tsx

/**
 * Deployment Component Sync Script
 * 
 * Automatically checks for component changes and syncs them during deployment.
 * This ensures components are always up-to-date in production without manual intervention.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { componentCatalog } from '../src/db/schema';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

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

// Scan local component files
function scanLocalComponents(): LocalComponent[] {
  const components: LocalComponent[] = [];
  const manifest = loadManifest();
  
  if (!existsSync(REGISTRY_PATH)) {
    console.log('⚠️  Component registry directory not found.');
    return components;
  }
  
  // Scan TypeScript files in registry
  const files = readdirSync(REGISTRY_PATH)
    .filter((file: string) => file.endsWith('.tsx') && file !== 'index.ts');
  
  for (const file of files) {
    const filePath = join(REGISTRY_PATH, file);
    const sourceCode = readFileSync(filePath, 'utf8');
    const hash = calculateHash(sourceCode);
    const componentName = file.replace('.tsx', '');
    
    // Get config from manifest or create default
    const config = manifest.components[componentName] || {
      name: componentName,
      displayName: componentName,
      description: `${componentName} component`,
      category: 'General',
      version: '1.0.0',
      isInteractive: false,
      requiresSandbox: false,
      dependencies: {},
      props: {},
      config: { examples: [] }
    };
    
    components.push({
      ...config,
      filePath,
      sourceCode,
      hash
    });
  }
  
  return components;
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
      console.log('🎉 Deployment component sync completed successfully!');
      process.exit(0);
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