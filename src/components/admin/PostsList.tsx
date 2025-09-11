"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin, BlogPost } from '@/contexts/AdminContext';
import { formatDistanceToNow } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import SearchBar from './SearchBar';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Tag,
  RefreshCw
} from 'lucide-react';

export default function PostsList() {
  const router = useRouter();
  const {
    posts,
    loading,
    error,
    searchQuery,
    statusFilter,
    refreshPosts,
    showToast
  } = useAdmin();

  // Only fetch posts on component mount, not on every render
  useEffect(() => {
    if (posts.length === 0) {
      refreshPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
      const response = await fetch(`/api/admin/posts/${post.slug}`, {
        method: 'DELETE',
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      showToast('Post deleted successfully.', 'success');
      refreshPosts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      showToast(errorMessage, 'error');
    }
  };

  const handleViewPost = (post: BlogPost) => {
    window.open(`/blog/${post.slug}`, '_blank');
  };

  const handleEditPost = (post: BlogPost) => {
    router.push(`/admin/posts/${post.slug}`);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchBar />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Blog Posts ({filteredPosts.length})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshPosts}
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh posts"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              {loading && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        </div>

        {/* Posts List */}
        {error && (
          <div className="p-6 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800">
            Error: {error}
          </div>
        )}

        {filteredPosts.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <Edit className="w-12 h-12 mx-auto opacity-20" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              No posts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by creating your first blog post.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Title and Status */}
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                        {post.title}
                      </h3>
                      <StatusBadge status={post.status} />
                    </div>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {post.publishedAt 
                            ? `Published ${formatDistanceToNow(new Date(post.publishedAt))} ago`
                            : `Updated ${formatDistanceToNow(new Date(post.updatedAt))} ago`
                          }
                        </span>
                      </div>
                      
                      {post.views > 0 && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views} views</span>
                        </div>
                      )}

                      {post.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          <span>{post.tags.length} tags</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            +{post.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewPost(post)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="View Post"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                      title="Edit Post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post)}
                      className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}