import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { existsSync } from 'fs';

// Load .env files only if they exist (development), otherwise use runtime environment variables (production)
if (existsSync('.env.local')) {
  config({ path: '.env.local', override: true });
}
if (existsSync('.env')) {
  config();
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});


