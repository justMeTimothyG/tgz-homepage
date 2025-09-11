#!/usr/bin/env node

/**
 * Simple tool availability checker
 * Verifies that required production tools are available
 */

import { execSync } from 'child_process';

console.log('🔧 Checking production tool availability...');
console.log('================================================');

const tools = [
  { name: 'node', command: 'node --version' },
  { name: 'npm', command: 'npm --version' },
  { name: 'tsx', command: 'npx tsx --version' },
  { name: 'drizzle-kit', command: 'npx drizzle-kit --version' }
];

let allAvailable = true;

for (const tool of tools) {
  try {
    const version = execSync(tool.command, { encoding: 'utf8' }).trim();
    console.log(`✅ ${tool.name}: ${version}`);
  } catch (error) {
    console.log(`❌ ${tool.name}: Not available`);
    allAvailable = false;
  }
}

console.log('================================================');

if (allAvailable) {
  console.log('🎉 All tools are available!');
  process.exit(0);
} else {
  console.log('⚠️  Some tools are missing');
  process.exit(1);
}