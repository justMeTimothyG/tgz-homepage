#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

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

function scanDirectory(dirPath: string, classes: Set<string>): void {
  const entries = fs.readdirSync(dirPath);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!entry.startsWith('.') && entry !== 'node_modules') {
        scanDirectory(fullPath, classes);
      }
    } else if (stat.isFile() && /\.(tsx?|jsx?|mdx?)$/i.test(entry)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        extractClasses(content).forEach(cls => classes.add(cls));
      } catch (e) {
        console.warn(`[safelist] Failed to read ${fullPath}:`, e);
      }
    }
  }
}

async function main() {
  const currentDir = process.cwd();
  const outDir = path.resolve(currentDir, '.tailwind');
  const outFile = path.join(outDir, 'safelist.txt');

  const classes = new Set<string>();

  // During build, we can't access the database, so we'll just use static classes
  // In development, this would scan the database but for Docker builds we'll rely on static analysis
  console.log('[safelist] Generating static safelist (no database access during build)');
  
  // Scan src files for className usage
  const srcDir = path.join(currentDir, 'src');
  if (fs.existsSync(srcDir)) {
    scanDirectory(srcDir, classes);
  }

  // Seed a minimal set of common typography + layout utilities used in MDX
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

