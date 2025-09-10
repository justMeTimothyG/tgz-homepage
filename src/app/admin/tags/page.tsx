"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Tag, Search, Hash, Calendar, TrendingUp, Users } from 'lucide-react';

interface TagData {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number;
  color?: string;
  icon?: string;
  description?: string;
  postCount: number;
  createdAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState<'usage' | 'name' | 'recent'>('usage');
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('orderBy', orderBy);
      params.set('limit', '200');

      const response = await fetch(`/api/tags?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tags');
      }
      
      setTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [search, orderBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags();
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, orderBy, fetchTags]);

  const totalPosts = tags.reduce((sum, tag) => sum + tag.postCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Tag className="w-6 h-6" />
              Tags Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and browse all content tags
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              <span>{tags.length} tags</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{totalPosts} total uses</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={orderBy}
            onChange={(e) => setOrderBy(e.target.value as 'usage' | 'name' | 'recent')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="usage">Sort by Usage</option>
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>
      </div>

      {/* Tags List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {error ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400">
            <p>Error loading tags: {error}</p>
            <button
              onClick={fetchTags}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 rounded text-sm"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tags found</p>
            <p className="text-sm">
              {search ? `No tags match "${search}"` : 'Create some posts with tags to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map((tag) => (
              <div key={tag.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      tag.color 
                        ? `bg-[${tag.color}] text-white` 
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {tag.icon ? (
                        <span className="text-sm">{tag.icon}</span>
                      ) : (
                        <Tag className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/tags/${tag.slug}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {tag.name}
                        </Link>
                        {tag.level > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Level {tag.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>/{tag.slug}</span>
                        {tag.path !== tag.slug && (
                          <span className="text-xs">Path: {tag.path}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(tag.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {tag.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {tag.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      <TrendingUp className="w-4 h-4" />
                      {tag.postCount}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      post{tag.postCount !== 1 ? 's' : ''}
                    </span>
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