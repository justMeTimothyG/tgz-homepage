import LatestPosts from '@/components/LatestPosts';
import { getAllBlogPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Blog</h1>
      <LatestPosts posts={posts} />
    </div>
  );
}
