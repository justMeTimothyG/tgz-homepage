#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, schema } from '@/db/client';

// Very basic class extraction from MDX/JSX/HTML-ish strings
// - Finds className="..." and class='...'
// - Splits on whitespace
// - Filters out obvious noise and duplicates
const CLASSNAME_RE = /className\s*=\s*(["'])(.*?)\1|class\s*=\s*(["'])(.*?)\3/gs;

function extractClasses(text: string): string[] {
  const classes = new Set<string>();
  for (const match of text.matchAll(CLASSNAME_RE)) {
    const raw = match[2] ?? match[4] ?? '';
    raw
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean)
      // Ignore obviously dynamic tokens or templating markers
      .filter(s => !/[{}$]/.test(s))
      .forEach(s => classes.add(s));
  }
  return [...classes];
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outDir = path.resolve(root, '..', '.tailwind');
  const outFile = path.join(outDir, 'safelist.txt');

  const db = getDb();

  const classes = new Set<string>();

  // 1) Blog post MDX content (published)
  try {
    const posts = await db
      .select({ content: schema.blogPosts.content })
      .from(schema.blogPosts);
    for (const p of posts) {
      if (p.content) extractClasses(p.content).forEach(c => classes.add(c));
    }
  } catch (e) {
    console.warn('[safelist] Failed reading blog posts:', e);
  }

  // 2) Component catalog source code (if stored)
  try {
    const components = await db
      .select({ sourceCode: schema.componentCatalog.sourceCode })
      .from(schema.componentCatalog);
    for (const c of components) {
      if (c.sourceCode) extractClasses(c.sourceCode).forEach(x => classes.add(x));
    }
  } catch (e) {
    console.warn('[safelist] Failed reading component catalog:', e);
  }

  // 3) Seed a minimal set of common typography + layout utilities used in MDX
  [
    'prose', 'prose-sm', 'prose-invert', 'dark:prose-invert', 'max-w-none',
    'not-prose',
    'mt-0','mt-1','mt-2','mt-3','mt-4','mt-5','mt-6','mt-8','mt-10',
    'mb-0','mb-1','mb-2','mb-3','mb-4','mb-5','mb-6','mb-8','mb-10',
    'p-0','p-1','p-2','p-3','p-4','p-5','p-6','px-2','px-3','px-4','py-2','py-3','py-4',
    'rounded','rounded-md','rounded-lg',
    'border','border-0','border-2','border-gray-200','border-gray-700',
    'bg-gray-50','bg-gray-100','bg-gray-900','dark:bg-gray-900/20','dark:bg-gray-800',
    'text-gray-600','text-gray-700','text-gray-800','text-gray-900',
    'dark:text-gray-100','dark:text-gray-200','dark:text-gray-400','dark:text-gray-500',
    'text-blue-600','dark:text-blue-400','bg-blue-50','dark:bg-blue-900/20','border-blue-200','dark:border-blue-800',
    'text-yellow-600','dark:text-yellow-400','bg-yellow-50','dark:bg-yellow-900/20','border-yellow-200','dark:border-yellow-800',
    'text-green-600','dark:text-green-400','bg-green-50','dark:bg-green-900/20','border-green-200','dark:border-green-800',
    'text-red-600','dark:text-red-400','bg-red-50','dark:bg-red-900/20','border-red-200','dark:border-red-800',
    'text-purple-600','dark:text-purple-400','bg-purple-50','dark:bg-purple-900/20','border-purple-200','dark:border-purple-800',
  ].forEach(c => classes.add(c));

  // Ensure output dir exists
  fs.mkdirSync(outDir, { recursive: true });

  // Write one class per line; Tailwind v4 @source will scan this file
  const contents = [...classes].sort().join('\n') + '\n';
  fs.writeFileSync(outFile, contents, 'utf8');
  console.log(`[safelist] Wrote ${classes.size} classes → ${path.relative(process.cwd(), outFile)}`);
}

main().catch((e) => {
  console.error('[safelist] Failed:', e);
  process.exit(1);
});

