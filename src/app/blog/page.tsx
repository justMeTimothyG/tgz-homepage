import LatestPosts from '@/components/LatestPosts';
import { getAllBlogPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-clip-text bg-gradient-to-r text-gray-900 dark:text-white">Blog</span>
      </h1>
      <LatestPosts posts={posts} />
    </div>
  );
}
