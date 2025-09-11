"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  FileText,
  Loader2,
  Calendar,
  Eye
} from 'lucide-react';
import { formatDateDE } from '@/lib/date';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  views: number;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface BlogPostLinkerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (slug: string, title: string) => void;
}

export default function BlogPostLinker({ 
  isOpen, 
  onClose, 
  onSelectPost 
}: BlogPostLinkerProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('published');

  // Fetch blog posts
  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen, searchTerm, statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const response = await fetch(`/api/admin/posts?${params}`, {
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
      });
      const data = await response.json();

      if (data.ok) {
        setPosts(data.posts);
      } else {
        setError(data.error || 'Failed to load blog posts');
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = (post: BlogPost) => {
    onSelectPost(post.slug, post.title);
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      archived: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Link to Blog Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
              <option value="all">All Posts</option>
            </select>
          </div>
        </div>

        {/* Post List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loading posts...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400 text-center py-8">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              No blog posts found
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h3>
                        {getStatusBadge(post.status)}
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.publishedAt 
                            ? formatDateDE(post.publishedAt) 
                            : 'Not published'
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views} views
                        </div>
                        <div className="text-gray-400">
                          /blog/{post.slug}
                        </div>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag.id}
                              className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}