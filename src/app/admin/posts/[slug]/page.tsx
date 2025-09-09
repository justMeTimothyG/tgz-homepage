"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import PostEditor from '@/components/admin/PostEditor';

export default function EditPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { selectPostBySlug, selectedPost, loading } = useAdmin();

  useEffect(() => {
    if (slug && (!selectedPost || selectedPost.slug !== slug)) {
      selectPostBySlug(slug);
    }
  }, [slug, selectPostBySlug, selectedPost]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!selectedPost) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Post not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The post with slug &quot;{slug}&quot; could not be found.
        </p>
      </div>
    );
  }

  return <PostEditor isNewPost={false} />;
}