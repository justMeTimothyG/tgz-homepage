#!/usr/bin/env tsx

/**
 * Component Sync Tool
 * 
 * Manages the synchronization between local component files and database.
 * 
 * Usage:
 *   npm run sync:components          # Sync all components
 *   npm run sync:components push     # Push local components to DB
 *   npm run sync:components pull     # Pull DB components to local files
 *   npm run sync:components status   # Show sync status
 *   npm run sync:components version  # Bump versions and sync
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { componentCatalog } from '../src/db/schema';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
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
    return { components: {}, lastSync: new Date().toISOString() };
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
}

// Save component manifest
function saveManifest(manifest: ComponentManifest) {
  if (!existsSync(dirname(CONFIG_FILE))) {
    mkdirSync(dirname(CONFIG_FILE), { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(manifest, null, 2));
}

// Calculate file hash for change detection
function calculateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Scan local component files
function scanLocalComponents(): LocalComponent[] {
  const components: LocalComponent[] = [];
  const manifest = loadManifest();
  
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

// Get components from database
async function getDbComponents(): Promise<any[]> {
  return db.select()
    .from(componentCatalog)
    .where(eq(componentCatalog.sourceType, 'builtin'));
}

// Compare local vs database components
async function getComponentStatus() {
  const localComponents = scanLocalComponents();
  const dbComponents = await getDbComponents();
  
  const status = {
    local: localComponents.length,
    database: dbComponents.length,
    needsSync: [] as Array<{
      name: string;
      status: 'new' | 'modified' | 'deleted';
      local?: LocalComponent;
      database?: any;
    }>
  };
  
  // Check for new or modified components
  for (const local of localComponents) {
    const dbComponent = dbComponents.find(db => db.name === local.name);
    
    if (!dbComponent) {
      status.needsSync.push({ name: local.name, status: 'new', local });
    } else if (dbComponent.sourceCode !== local.sourceCode) {
      status.needsSync.push({ name: local.name, status: 'modified', local, database: dbComponent });
    }
  }
  
  // Check for deleted components
  for (const dbComponent of dbComponents) {
    if (!localComponents.find(local => local.name === dbComponent.name)) {
      status.needsSync.push({ name: dbComponent.name, status: 'deleted', database: dbComponent });
    }
  }
  
  return status;
}

// Push local components to database
async function pushComponents() {
  const localComponents = scanLocalComponents();
  const manifest = loadManifest();
  
  console.log(`🔄 Pushing ${localComponents.length} components to database...`);
  
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
        console.log(`✅ Updated: ${component.name} v${component.version}`);
      } else {
        // Insert new
        await db
          .insert(componentCatalog)
          .values({
            ...componentData,
            createdAt: new Date()
          });
        console.log(`✅ Created: ${component.name} v${component.version}`);
      }
      
      // Update manifest
      manifest.components[component.name] = {
        name: component.name,
        displayName: component.displayName,
        description: component.description,
        category: component.category,
        version: component.version,
        isInteractive: component.isInteractive,
        requiresSandbox: component.requiresSandbox,
        dependencies: component.dependencies,
        props: component.props,
        config: component.config
      };
      
    } catch (error) {
      console.error(`❌ Failed to sync ${component.name}:`, error);
    }
  }
  
  manifest.lastSync = new Date().toISOString();
  saveManifest(manifest);
  
  console.log(`🎉 Sync completed! Updated manifest at ${CONFIG_FILE}`);
}

// Bump component versions
function bumpVersions(type: 'patch' | 'minor' | 'major' = 'patch') {
  const localComponents = scanLocalComponents();
  const manifest = loadManifest();
  
  console.log(`📦 Bumping ${type} version for ${localComponents.length} components...`);
  
  for (const component of localComponents) {
    const [major, minor, patch] = component.version.split('.').map(Number);
    
    let newVersion: string;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    manifest.components[component.name] = {
      ...manifest.components[component.name],
      version: newVersion
    };
    
    console.log(`📦 ${component.name}: ${component.version} → ${newVersion}`);
  }
  
  saveManifest(manifest);
  console.log(`✅ Version bump completed!`);
}

// Main CLI
async function main() {
  const command = process.argv[2] || 'status';
  
  try {
    switch (command) {
      case 'status':
        const status = await getComponentStatus();
        console.log(`📊 Component Status:`);
        console.log(`   Local: ${status.local} components`);
        console.log(`   Database: ${status.database} components`);
        console.log(`   Changes: ${status.needsSync.length} components need sync`);
        
        if (status.needsSync.length > 0) {
          console.log('\n📋 Changes needed:');
          for (const change of status.needsSync) {
            const icon = change.status === 'new' ? '🆕' : 
                        change.status === 'modified' ? '📝' : '🗑️';
            console.log(`   ${icon} ${change.name} (${change.status})`);
          }
          console.log('\n💡 Run "npm run sync:components push" to apply changes');
        } else {
          console.log('\n✅ Everything is up to date!');
        }
        break;
        
      case 'push':
        await pushComponents();
        break;
        
      case 'version':
        const versionType = process.argv[3] as 'patch' | 'minor' | 'major' || 'patch';
        bumpVersions(versionType);
        await pushComponents();
        break;
        
      case 'init':
        // Create initial manifest from existing components
        const components = scanLocalComponents();
        const newManifest: ComponentManifest = {
          components: {},
          lastSync: new Date().toISOString()
        };
        
        for (const component of components) {
          newManifest.components[component.name] = {
            name: component.name,
            displayName: component.displayName,
            description: component.description,
            category: component.category,
            version: component.version,
            isInteractive: component.isInteractive,
            requiresSandbox: component.requiresSandbox,
            dependencies: component.dependencies,
            props: component.props,
            config: component.config
          };
        }
        
        saveManifest(newManifest);
        console.log(`✅ Initialized component manifest with ${components.length} components`);
        break;
        
      default:
        console.log(`
🧩 Component Sync Tool

Commands:
  status           Show component sync status
  push             Push local components to database
  version [type]   Bump versions (patch/minor/major) and sync
  init             Initialize component manifest

Examples:
  npm run sync:components status
  npm run sync:components push
  npm run sync:components version patch
        `);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();