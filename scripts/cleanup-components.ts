#!/usr/bin/env tsx

/**
 * Component Cleanup Script
 * 
 * Removes orphaned components from the database that are no longer in the registry.
 * This is useful after refactoring components or consolidating them.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { componentCatalog } from '../src/db/schema';
import postgres from 'postgres';
import { eq, inArray } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/tgz_lol';
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function cleanupOrphanedComponents() {
  console.log('🧹 Starting component cleanup...');
  
  // Components to remove (no longer standalone)
  const orphanedComponents = ['Task', 'Hint', 'Step', 'Solution'];
  
  try {
    // Find existing orphaned components
    const existing = await db
      .select()
      .from(componentCatalog)
      .where(inArray(componentCatalog.name, orphanedComponents));
    
    if (existing.length === 0) {
      console.log('✅ No orphaned components found.');
      await client.end();
      return;
    }
    
    console.log(`📋 Found ${existing.length} orphaned components:`);
    existing.forEach(comp => {
      console.log(`  - ${comp.name} (${comp.displayName})`);
    });
    
    // Remove orphaned components
    const result = await db
      .delete(componentCatalog)
      .where(inArray(componentCatalog.name, orphanedComponents));
    
    console.log(`🗑️ Removed ${existing.length} orphaned components`);
    console.log('✅ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run cleanup if called directly
cleanupOrphanedComponents();

export { cleanupOrphanedComponents };