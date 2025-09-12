import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { componentCatalog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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

interface ComponentManifest {
  components: Record<string, ComponentConfig>;
  lastSync: string;
}

interface LocalComponent extends ComponentConfig {
  filePath: string;
  sourceCode: string;
  hash: string;
  parentComponent?: string;
}

// Load component manifest
function loadManifest(): ComponentManifest {
  if (!existsSync(CONFIG_FILE)) {
    return { components: {}, lastSync: new Date().toISOString() };
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
}

// Calculate file hash for change detection
function calculateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
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

// Scan local component files
function scanLocalComponents(): LocalComponent[] {
  const components: LocalComponent[] = [];
  const manifest = loadManifest();
  
  // Read registry index.ts to understand what components are exported
  const indexPath = join(REGISTRY_PATH, 'index.ts');
  const indexContent = readFileSync(indexPath, 'utf8');
  
  // Parse exported component names from index.ts
  const exportedComponents = parseExportsFromIndex(indexContent);
  
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
      console.warn(`No configuration found for exported component: ${componentName}`);
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
  }
  
  return components;
}

// Sync components to database
async function syncComponents(): Promise<{ success: boolean; message: string; synced: number }> {
  try {
    const localComponents = scanLocalComponents();
    
    if (localComponents.length === 0) {
      return { success: false, message: 'No components found to sync', synced: 0 };
    }
    
    let syncedCount = 0;
    
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
        } else {
          // Insert new
          await db
            .insert(componentCatalog)
            .values({
              ...componentData,
              createdAt: new Date()
            });
        }
        
        syncedCount++;
        
      } catch (error) {
        console.error(`Failed to sync ${component.name}:`, error);
      }
    }
    
    return {
      success: true,
      message: `Successfully synced ${syncedCount} components`,
      synced: syncedCount
    };
    
  } catch (error) {
    console.error('Component sync failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown sync error',
      synced: 0
    };
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
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

    const result = await syncComponents();
    
    return NextResponse.json(result, { 
      status: result.success ? 200 : 500 
    });
    
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      synced: 0
    }, { status: 500 });
  }
}