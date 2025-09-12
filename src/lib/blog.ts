import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPostMeta {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  slug: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const contentDirectory = path.join(process.cwd(), 'content');
const blogDirectory = path.join(contentDirectory, 'blog');
const lecturesDirectory = path.join(contentDirectory, 'lectures');

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }
  
  return fs.readdirSync(blogDirectory)
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace(/\.mdx$/, ''));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
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
    content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const slugs = getAllBlogSlugs();
  
  return slugs
    .map(slug => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLatestBlogPosts(limit?: number): BlogPost[] {
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
  }));
}