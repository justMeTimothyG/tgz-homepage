import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Heading as UnistHeading } from 'mdast';
import GithubSlugger from 'github-slugger';

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

export type TocSection = {
  id: string;
  text: string;
  children: TocHeading[];
};

function stripLeadingEmoji(text: string): string {
  try {
    return text.replace(
      /^(?:\p{Extended_Pictographic}(?:[\uFE0F\uFE0E])?(?:\u200D\p{Extended_Pictographic}(?:[\uFE0F\uFE0E])?)*)\s*/u,
      ""
    );
  } catch {
    // Fallback for environments without Unicode property escapes
    return text.replace(/^[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}][\uFE0F\uFE0E]?\s*/u, "");
  }
}

function textToId(text: string, slugger: GithubSlugger): string {
  // Use the same github-slugger that rehype-slug uses to ensure perfect ID matching
  try {
    return slugger.slug(text);
  } catch (error) {
    // Fallback to a basic slug implementation if there's an issue
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-äöüß]/g, '') // Keep German chars
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

export function extractTocFromMarkdown(
  markdown: string, 
  minLevel: number = 2, 
  maxLevel: number = 4
): { headings: TocHeading[]; sections: TocSection[] } {
  const headings: TocHeading[] = [];
  const slugger = new GithubSlugger();
  
  const processor = unified().use(remarkParse);
    
  const tree = processor.parse(markdown);
  
  visit(tree, 'heading', (node: UnistHeading) => {
    if (node.depth < minLevel || node.depth > maxLevel) return;
    
    // Extract plain text from heading content
    const text = node.children
      .map((child) => {
        if (child.type === 'text') return child.value;
        if (child.type === 'inlineCode') return child.value;
        if (child.type === 'emphasis' || child.type === 'strong') {
          return child.children
            .map((c) => (c.type === 'text' ? c.value : ''))
            .join('');
        }
        return '';
      })
      .join('');
    
    if (!text.trim()) return;
    
    const id = textToId(text, slugger);
    headings.push({
      id,
      text: stripLeadingEmoji(text.trim()),
      level: node.depth
    });
  });
  
  // Build sections grouped by nearest preceding h2
  const sections: TocSection[] = [];
  let currentSection: TocSection | null = null;
  
  for (const heading of headings) {
    if (heading.level === 2) {
      currentSection = {
        id: heading.id,
        text: heading.text,
        children: []
      };
      sections.push(currentSection);
    } else if (currentSection && heading.level > 2) {
      currentSection.children.push(heading);
    }
  }
  
  return { headings, sections };
}

export function getTocProps(markdown: string) {
  const { headings, sections } = extractTocFromMarkdown(markdown);
  return {
    headings,
    sections,
    hasContent: headings.length > 0
  };
}
