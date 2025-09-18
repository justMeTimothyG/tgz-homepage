import LatestPosts from '@/components/LatestPosts';
import { getAllBlogPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">Blog</span>
      </h1>
      <LatestPosts posts={posts} />
    </div>
  );
}
