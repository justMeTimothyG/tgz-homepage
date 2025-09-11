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
  parentComponent?: string; // For sub-components, indicates the parent file
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
  
  // Read registry index.ts to understand what components are exported
  const indexPath = join(REGISTRY_PATH, 'index.ts');
  const indexContent = readFileSync(indexPath, 'utf8');
  
  // Parse exported component names from index.ts
  const exportedComponents = parseExportsFromIndex(indexContent);
  console.log(`📦 Found ${exportedComponents.length} exported components:`, exportedComponents.map(c => c.name));
  
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
      console.warn(`⚠️ No configuration found for exported component: ${componentName}`);
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
    
    console.log(`✅ Registered component: ${componentName} (from ${sourceFile}.tsx)${exportInfo.isSubComponent ? ' [sub-component]' : ''}`);
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