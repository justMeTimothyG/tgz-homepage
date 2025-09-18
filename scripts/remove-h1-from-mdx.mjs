#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const blogDir = path.join(process.cwd(), 'content', 'blog');

function removeH1FromContent(content) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceChar = null; // backtick or tilde
  let fenceCount = 0;

  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start/end of fenced code blocks (``` or ~~~)
    const fenceMatch = line.match(/^([`~]{3,})(.*)$/);
    if (fenceMatch) {
      const currentFenceChar = fenceMatch[1][0];
      const currentFenceCount = fenceMatch[1].length;
      if (!inFence) {
        inFence = true;
        fenceChar = currentFenceChar;
        fenceCount = currentFenceCount;
      } else if (currentFenceChar === fenceChar && currentFenceCount >= fenceCount) {
        // Close the fence
        inFence = false;
        fenceChar = null;
        fenceCount = 0;
      }
      out.push(line);
      continue;
    }

    if (!inFence) {
      // Remove ATX H1 (lines beginning with exactly one # followed by space or end)
      if (/^#(\s|$)/.test(line)) {
        // Skip line (remove)
        continue;
      }
      // Remove simple inline <h1>...</h1> on a single line
      if (/^\s*<h1[>\s].*<\/h1>\s*$/.test(line)) {
        continue;
      }
      // If an opening <h1> without closing on same line, skip until closing
      if (/^\s*<h1[>\s]/.test(line)) {
        // Skip current line and subsequent until </h1>
        while (i < lines.length && !/<\/h1>\s*$/.test(lines[i])) {
          i++;
        }
        // Skip the line with </h1> too, if present
        continue;
      }
    }

    out.push(line);
  }

  return out.join('\n');
}

function main() {
  if (!fs.existsSync(blogDir)) {
    console.error('No blog directory found at', blogDir);
    process.exit(1);
  }
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));
  const changes = [];
  for (const f of files) {
    const full = path.join(blogDir, f);
    const before = fs.readFileSync(full, 'utf8');
    const after = removeH1FromContent(before);
    if (after !== before) {
      fs.writeFileSync(full, after, 'utf8');
      changes.push(f);
    }
  }
  if (changes.length === 0) {
    console.log('No H1 headings found that required removal.');
  } else {
    console.log('Removed H1 from files:', changes.join(', '));
  }
}

main();

