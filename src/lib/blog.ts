import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import { compileMDX } from './mdx';

export interface BlogPostMeta {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  slug: string;
  sammlungen: string[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  compiledSource?: string | null;
  mdxError?: string | null;
}

const contentDirectory = path.join(process.cwd(), 'content');
const blogDirectory = path.join(contentDirectory, 'blog');
// const lecturesDirectory = path.join(contentDirectory, 'lectures');

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }
  
  return fs.readdirSync(blogDirectory)
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(blogDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    published: data.published !== false, // Default to true if not specified
    sammlungen: Array.isArray(data.sammlungen) ? data.sammlungen : [],
    content,
  };
}

// Synchronous version for backwards compatibility
export function getBlogPostBySlugSync(slug: string): Omit<BlogPost, 'compiledSource' | 'mdxError'> | null {
  const fullPath = path.join(blogDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    published: data.published !== false, // Default to true if not specified
    sammlungen: Array.isArray(data.sammlungen) ? data.sammlungen : [],
    content,
  };
}

export function getAllBlogPosts(): Omit<BlogPost, 'compiledSource' | 'mdxError'>[] {
  const slugs = getAllBlogSlugs();
  
  return slugs
    .map(slug => getBlogPostBySlugSync(slug))
    .filter((post): post is Omit<BlogPost, 'compiledSource' | 'mdxError'> => post !== null)
    .filter(post => post.published)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (dateB !== dateA) {
        return dateB - dateA; // Sort by date first (newest first)
      }
      
      // If dates are equal, sort by title alphabetically
      return a.title.localeCompare(b.title);
    });
}

export function getLatestBlogPosts(limit?: number): Omit<BlogPost, 'compiledSource' | 'mdxError'>[] {
  const posts = getAllBlogPosts();
  return limit ? posts.slice(0, limit) : posts;
}

export function getBlogPostMeta(): BlogPostMeta[] {
  return getAllBlogPosts().map(post => ({
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    published: post.published,
    slug: post.slug,
    sammlungen: post.sammlungen,
  }));
}
