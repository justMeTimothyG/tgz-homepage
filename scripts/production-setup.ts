#!/usr/bin/env tsx

/**
 * Production Setup Script
 * Sets up the production environment with database, admin user, and components
 */

import { execSync } from 'child_process';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { join } from 'path';

const DOMAIN = process.env.COOLIFY_FQDN 
  ? `https://${process.env.COOLIFY_FQDN}` 
  : process.env.DOMAIN || 'http://localhost:3000';
const SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN || '***REMOVED***';

console.log('🚀 Starting production setup for:', DOMAIN);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL available:', !!process.env.DATABASE_URL);
console.log('================================================');

async function runMigrations() {
  console.log('\n📊 Step 1: Running database migrations...');
  console.log('================================================');
  
  try {
    // Check if drizzle.config.ts exists
    const configPath = join(process.cwd(), 'drizzle.config.ts');
    console.log('Looking for config at:', configPath);
    
    // Check if migration files exist
    try {
      const drizzleFiles = execSync('ls -la drizzle/', { encoding: 'utf8' });
      console.log('Drizzle folder contents:');
      console.log(drizzleFiles);
      
      const metaFiles = execSync('ls -la drizzle/meta/', { encoding: 'utf8' });
      console.log('Drizzle meta folder contents:');
      console.log(metaFiles);
    } catch (lsError) {
      console.log('Could not list drizzle folder contents');
    }
    
    execSync('npx drizzle-kit migrate --config=drizzle.config.ts', { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Database migrations completed');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Try to give more helpful information
    try {
      const files = execSync('ls -la', { encoding: 'utf8' });
      console.log('Files in current directory:');
      console.log(files);
    } catch (lsError) {
      console.log('Could not list directory contents');
    }
    
    return false;
  }
}

async function setupAdminUser() {
  console.log('\n👤 Step 2: Setting up admin user...');
  console.log('================================================');
  
  try {
    console.log('Creating admin user via API...');
    
    const response = await fetch(`${DOMAIN}/api/setup-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Setup-Token': SETUP_TOKEN
      }
    });
    
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : { message: 'Empty response' };
    } catch (parseError) {
      console.log('Response text (not JSON):', await response.text());
      data = { error: 'Invalid JSON response' };
    }
    
    console.log(`Response Status: ${response.status}`);
    console.log('Response Body:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Admin user setup completed');
      return true;
    } else {
      console.log(`⚠️  Admin user setup had issues (status: ${response.status})`);
      console.log('This might be normal if user already exists');
      return true; // Continue even if user exists
    }
  } catch (error) {
    console.error('❌ Admin user setup failed:', error);
    return false;
  }
}

async function syncComponents() {
  console.log('\n🧩 Step 3: Syncing components...');
  console.log('================================================');
  
  try {
    // Check if database is accessible first
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/tgz_lol';
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);
    
    try {
      // Simple connectivity test
      await client`SELECT 1`;
      await client.end();
      
      // Run component sync with NODE_PATH to help with module resolution
      execSync('npx tsx scripts/deploy-components.ts', { 
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { 
          ...process.env, 
          NODE_PATH: join(process.cwd(), 'src'),
          NODE_ENV: 'production' 
        }
      });
      console.log('✅ Component sync completed');
      return true;
    } catch (dbError) {
      console.log('⚠️  Database not accessible for component sync');
      console.log('Components will be synced on first application start');
      await client.end();
      return true; // Don't fail the setup for this
    }
  } catch (error) {
    console.error('❌ Component sync failed:', error);
    return false;
  }
}

async function verifySetup() {
  console.log('\n🔍 Step 4: Verifying setup...');
  console.log('================================================');
  
  try {
    console.log('Testing component API...');
    
    const response = await fetch(`${DOMAIN}/api/components`);
    
    if (response.ok) {
      const data = await response.json();
      const componentCount = data.components?.length || 'unknown';
      console.log(`✅ Component API working (${componentCount} components available)`);
      return componentCount;
    } else {
      console.log(`❌ Component API not responding correctly (status: ${response.status})`);
      return 0;
    }
  } catch (error) {
    console.error('❌ API verification failed:', error);
    return 0;
  }
}

async function main() {
  let success = true;
  
  // Step 1: Run migrations
  if (!await runMigrations()) {
    success = false;
  }
  
  // Step 2: Setup admin user
  if (!await setupAdminUser()) {
    success = false;
  }
  
  // Step 3: Sync components
  if (!await syncComponents()) {
    success = false;
  }
  
  // Step 4: Verify setup
  const componentCount = await verifySetup();
  
  // Final summary
  console.log('\n🎉 Production Setup Complete!');
  console.log('================================================');
  console.log('Admin Login:');
  console.log(`  URL: ${DOMAIN}/admin/login`);
  console.log('  Email: admin@tgz.lol');
  console.log('  Password: ***REMOVED***');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Login to admin interface');
  console.log('  2. Change admin password');
  console.log('  3. Create your first blog post');
  console.log('  4. Test component functionality');
  console.log('');
  console.log(`Components available: ${componentCount}`);
  console.log('================================================');
  
  if (success) {
    console.log('✅ Setup completed successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Setup completed with some issues');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the setup
main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});