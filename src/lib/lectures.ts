import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface LectureMeta {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  slug: string;
  sammlungen: string[];
}

export interface Lecture extends LectureMeta {
  content: string;
  compiledSource?: string | null;
  mdxError?: string | null;
}

const contentDirectory = path.join(process.cwd(), 'content');
const lecturesDirectory = path.join(contentDirectory, 'lectures');

function readLectureFile(slug: string) {
  const fullPath = path.join(lecturesDirectory, `${slug}.mdx`);
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
    tags: Array.isArray(data.tags) ? data.tags : [],
    published: data.published !== false,
    sammlungen: Array.isArray(data.sammlungen) ? data.sammlungen : [],
    content,
  } satisfies Lecture;
}

export function getAllLectureSlugs(): string[] {
  if (!fs.existsSync(lecturesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(lecturesDirectory)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export async function getLectureBySlug(slug: string): Promise<Lecture | null> {
  return readLectureFile(slug);
}

export function getLectureBySlugSync(slug: string): Lecture | null {
  return readLectureFile(slug);
}

export function getAllLectures(): Lecture[] {
  return getAllLectureSlugs()
    .map((slug) => getLectureBySlugSync(slug))
    .filter((lecture): lecture is Lecture => lecture !== null);
}

export function getLectureMeta(): LectureMeta[] {
  return getAllLectures().map((lecture) => ({
    title: lecture.title,
    date: lecture.date,
    excerpt: lecture.excerpt,
    tags: lecture.tags,
    published: lecture.published,
    slug: lecture.slug,
    sammlungen: lecture.sammlungen,
  }));
}
